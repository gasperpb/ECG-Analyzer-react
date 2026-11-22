/**
 * Processamento de sinal de ECG compartilhado entre frontend e backend.
 *
 * Objetivos:
 * - Remover ruído de alta frequência e linha de base (baseline wander)
 * - Detectar picos R de forma robusta (energia do derivativo + limiar adaptativo)
 * - Calcular BPM, RR, QRS, PR, QT/QTc e desvio do segmento ST de forma
 *   determinística (sem valores aleatórios)
 *
 * O sinal é interpretado em mV quando disponível. Para sinais em unidades
 * arbitrárias (ex.: contagem ADC), a amplitude do QRS é normalizada.
 */

const DEFAULT_SAMPLING_RATE = 250
const MIN_SIGNAL_SECONDS = 0.5

export function sanitizeSignal(data) {
  if (!Array.isArray(data)) return []
  const out = new Array(data.length)
  let lastValid = 0
  for (let i = 0; i < data.length; i++) {
    const value = Number(data[i])
    if (Number.isFinite(value)) {
      out[i] = value
      lastValid = value
    } else {
      out[i] = lastValid
    }
  }
  return out
}

export function median(values) {
  if (!values || values.length === 0) return 0
  const sorted = Float64Array.from(values).sort()
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

export function percentile(values, p) {
  if (!values || values.length === 0) return 0
  const sorted = Float64Array.from(values).sort()
  const index = Math.min(
    sorted.length - 1,
    Math.max(0, Math.round((sorted.length - 1) * p))
  )
  return sorted[index]
}

export function movingAverage(signal, windowSize) {
  const n = signal.length
  const out = new Float64Array(n)
  if (n === 0) return out

  const window = Math.max(1, Math.round(windowSize))
  const prefix = new Float64Array(n + 1)
  for (let i = 0; i < n; i++) prefix[i + 1] = prefix[i] + signal[i]

  const half = Math.floor(window / 2)
  for (let i = 0; i < n; i++) {
    const start = Math.max(0, i - half)
    const end = Math.min(n, i + half + 1)
    out[i] = (prefix[end] - prefix[start]) / (end - start)
  }
  return out
}

function medianFilter(signal, windowSize) {
  const n = signal.length
  const out = new Float64Array(n)
  if (n === 0) return out

  const half = Math.floor(Math.max(1, Math.round(windowSize)) / 2)
  const buffer = []
  for (let i = 0; i < n; i++) {
    const start = Math.max(0, i - half)
    const end = Math.min(n, i + half + 1)
    buffer.length = 0
    for (let j = start; j < end; j++) buffer.push(signal[j])
    out[i] = median(buffer)
  }
  return out
}

/**
 * Estima a linha de base (baseline wander) em cascata:
 * 1) mediana de ~200ms remove os complexos QRS;
 * 2) mediana de ~600ms remove ondas T/P.
 * O resultado é subtraído do sinal, preservando a morfologia do ST.
 */
export function estimateBaseline(signal, samplingRate) {
  const n = signal.length
  const out = new Float64Array(n)
  if (n === 0) return out

  const step = Math.max(1, Math.round(samplingRate / 50))
  const coarse = []
  for (let i = 0; i < n; i += step) coarse.push(signal[i])

  const first = medianFilter(coarse, (0.2 * samplingRate) / step)
  const second = medianFilter(first, (0.6 * samplingRate) / step)

  for (let i = 0; i < n; i++) {
    const position = i / step
    const lower = Math.floor(position)
    const upper = Math.min(second.length - 1, lower + 1)
    const fraction = position - lower
    out[i] = second[lower] * (1 - fraction) + second[upper] * fraction
  }
  return out
}

export function medianRange(signal, start, end) {
  const from = Math.max(0, start)
  const to = Math.min(signal.length, end)
  if (to <= from) return 0
  const slice = []
  for (let i = from; i < to; i++) slice.push(signal[i])
  return median(slice)
}

/**
 * Detecta os picos R usando a energia do derivativo integrada.
 * Retorna também o sinal centrado (baseline removido) para análise morfológica.
 */
export function detectRPeaks(rawData, samplingRate = DEFAULT_SAMPLING_RATE) {
  const fs = samplingRate > 0 ? samplingRate : DEFAULT_SAMPLING_RATE
  const signal = sanitizeSignal(rawData)
  const n = signal.length

  const empty = {
    peaks: [],
    signal,
    centered: new Float64Array(0),
    samplingRate: fs
  }

  if (n < Math.max(4, Math.round(fs * MIN_SIGNAL_SECONDS))) return empty

  const smooth = movingAverage(signal, Math.max(1, Math.round(0.025 * fs)))

  // Remove o offset DC. A linha de base lenta é compensada por batimento
  // (interpolação entre segmentos PR vizinhos), preservando o segmento ST.
  const dcOffset = median(Array.from(smooth))
  const centered = new Float64Array(n)
  for (let i = 0; i < n; i++) centered[i] = smooth[i] - dcOffset

  const energy = new Float64Array(n)
  for (let i = 0; i < n; i++) {
    const a = centered[i > 0 ? i - 1 : i]
    const b = centered[i < n - 1 ? i + 1 : i]
    const d = b - a
    energy[i] = d * d
  }

  const integrated = movingAverage(energy, Math.max(1, Math.round(0.12 * fs)))

  const p50 = percentile(integrated, 0.5)
  const p95 = percentile(integrated, 0.95)
  const p99 = percentile(integrated, 0.99)
  const maxValue = percentile(integrated, 1)
  if (!(maxValue > 0)) return { ...empty, centered }

  const thresholds = [
    Math.max(p95 * 0.6, p50 + 0.2 * (p99 - p50)),
    Math.max(p95 * 0.4, p50 + 0.1 * (p99 - p50)),
    maxValue * 0.15
  ].filter((t) => t > 0)

  const minDistance = Math.max(1, Math.round(0.2 * fs))
  let peaks = []

  for (const threshold of thresholds) {
    const candidates = []
    for (let i = 1; i < n - 1; i++) {
      if (
        integrated[i] >= threshold &&
        integrated[i] >= integrated[i - 1] &&
        integrated[i] > integrated[i + 1]
      ) {
        candidates.push(i)
      }
    }
    peaks = enforceRefractory(candidates, integrated, minDistance)
    if (peaks.length >= 2) break
  }

  const half = Math.max(1, Math.round(0.1 * fs))
  const windows = peaks.map((peak) => {
    const from = Math.max(0, peak - half)
    const to = Math.min(n - 1, peak + half)
    let posMax = -Infinity
    let negMin = Infinity
    for (let j = from; j <= to; j++) {
      if (centered[j] > posMax) posMax = centered[j]
      if (centered[j] < negMin) negMin = centered[j]
    }
    return { peak, from, to, posMax, negMin }
  })

  // Escolhe a polaridade dominante do complexo QRS (positiva ou invertida)
  // para não confundir a onda S/T com o pico R sob baseline wander.
  const positiveMedian = median(windows.map((w) => w.posMax))
  const negativeMedian = median(windows.map((w) => Math.abs(w.negMin)))
  const polarity = positiveMedian >= negativeMedian ? 1 : -1

  const refined = windows.map(({ peak, from, to }) => {
    let best = peak
    let bestValue = -Infinity
    for (let j = from; j <= to; j++) {
      const value = polarity * centered[j]
      if (value > bestValue) {
        bestValue = value
        best = j
      }
    }
    return best
  })

  const deduped = []
  for (const peak of refined) {
    const last = deduped[deduped.length - 1]
    if (last === undefined || peak - last >= minDistance) {
      deduped.push(peak)
    } else if (polarity * centered[peak] > polarity * centered[last]) {
      deduped[deduped.length - 1] = peak
    }
  }

  return { peaks: deduped, signal, centered, samplingRate: fs, polarity }
}

function enforceRefractory(candidates, strength, minDistance) {
  if (candidates.length === 0) return []
  const accepted = []
  for (const candidate of candidates) {
    const last = accepted[accepted.length - 1]
    if (last === undefined || candidate - last >= minDistance) {
      accepted.push(candidate)
    } else if (strength[candidate] > strength[last]) {
      accepted[accepted.length - 1] = candidate
    }
  }
  return accepted
}

/**
 * Analisa o sinal de ECG e retorna métricas clínicas determinísticas.
 */
export function analyzeSignal(rawData, samplingRate = DEFAULT_SAMPLING_RATE) {
  const fs = samplingRate > 0 ? samplingRate : DEFAULT_SAMPLING_RATE
  const { peaks, centered, samplingRate: effectiveFs, polarity } = detectRPeaks(rawData, fs)
  const n = centered.length

  const result = {
    samplingRate: effectiveFs,
    duration: n / effectiveFs,
    sampleCount: n,
    rPeaks: peaks,
    bpm: null,
    rrIntervals: [],
    rhythm: { type: 'Indeterminado', irregularity: null },
    qrs: { width: null },
    pr: { interval: null, detected: false },
    qt: { interval: null, qtc: null },
    st: {
      elevation: false,
      depression: false,
      tWaveInversion: false,
      maxElevation: 0,
      maxDepression: 0,
      elevationPosition: null,
      depressionPosition: null,
      segmentIndices: []
    },
    quality: { beats: peaks.length, reliable: false }
  }

  if (n === 0 || peaks.length < 2) return result

  const typicalR = median(peaks.map((p) => Math.abs(centered[p])))
  const scale = typicalR > 10 ? 1 / typicalR : 1
  const morph = scale === 1 ? centered : centered.map((value) => value * scale)
  result.signalScale = scale

  const rr = []
  for (let i = 1; i < peaks.length; i++) {
    const ms = ((peaks[i] - peaks[i - 1]) / effectiveFs) * 1000
    if (ms >= 200 && ms <= 3000) rr.push(ms)
  }
  result.rrIntervals = rr

  if (rr.length > 0) {
    const medianRR = median(rr)
    result.bpm = clamp(Math.round(60000 / medianRR), 20, 300)

    const mean = rr.reduce((sum, value) => sum + value, 0) / rr.length
    const variance = rr.reduce((sum, value) => sum + (value - mean) ** 2, 0) / rr.length
    const cv = mean > 0 ? Math.sqrt(variance) / mean : 0
    result.rhythm.irregularity = cv
    result.rhythm.type = classifyRhythm(result.bpm, cv, rr.length)
  }

  const qrsWidths = []
  const prIntervals = []
  const qtIntervals = []
  const stDeviations = []
  const stZones = []
  let invertedTWaves = 0
  let morphBeatCount = 0

  const edgeGuard = Math.round(0.2 * effectiveFs)
  const qrsData = new Array(peaks.length).fill(null)

  // Passagem 1: localiza o QRS de todos os batimentos, pois a linha de base
  // interpolada dos vizinhos é necessária para as restantes medidas.
  for (let i = 0; i < peaks.length; i++) {
    const r = peaks[i]
    if (r < edgeGuard || r > n - edgeGuard) continue
    morphBeatCount++

    const qrs = locateQRS(morph, r, effectiveFs)
    qrsData[i] = qrs
    if (qrs) qrsWidths.push(qrs.width)
  }

  // Passagem 2: PR, QT, ST e onda T usando a linha de base local interpolada.
  for (let i = 0; i < peaks.length; i++) {
    const qrs = qrsData[i]
    if (!qrs) continue

    const r = peaks[i]
    const prevR = i > 0 ? peaks[i - 1] : null
    const nextR = i < peaks.length - 1 ? peaks[i + 1] : null
    const prevQRS = i > 0 ? qrsData[i - 1] : null
    const nextQRS = i < peaks.length - 1 ? qrsData[i + 1] : null
    const baselineAt = makeBaseline([prevQRS, qrs, nextQRS])

    const pr = locatePR(morph, qrs.onset, r, prevR, effectiveFs, baselineAt)
    if (pr) prIntervals.push(pr.interval)

    const qt = locateQT(morph, r, qrs.onset, nextR, effectiveFs, baselineAt)
    if (qt) qtIntervals.push(qt.interval)

    if (detectTWaveInversion(morph, r, nextR, effectiveFs, baselineAt, polarity)) {
      invertedTWaves++
    }

    const st = measureST(morph, qrs, effectiveFs, { r, prevR, nextR, prevQRS, nextQRS })
    if (!st) continue

    stDeviations.push(st.deviation)
    if (st.deviation > 0.1) {
      stZones.push({ start: st.start, end: st.end, type: 'elevation' })
    } else if (st.deviation < -0.05) {
      stZones.push({ start: st.start, end: st.end, type: 'depression' })
    }
  }

  const validQRS = qrsWidths.filter((width) => width >= 40 && width <= 220)
  if (validQRS.length > 0) result.qrs.width = median(validQRS)

  const validPR = prIntervals.filter((value) => value >= 70 && value <= 320)
  if (validPR.length > 0) {
    result.pr.interval = median(validPR)
    result.pr.detected = validPR.length >= Math.max(2, Math.floor(peaks.length * 0.4))
  }

  const validQT = qtIntervals.filter((value) => value >= 180 && value <= 750)
  if (validQT.length > 0) {
    result.qt.interval = median(validQT)
    if (result.bpm) {
      const rrSeconds = 60 / result.bpm
      result.qt.qtc = result.qt.interval / Math.sqrt(rrSeconds)
    }
  }

  if (stDeviations.length > 0) {
    const minConsistent = Math.max(1, Math.ceil(stDeviations.length * 0.35))
    const elevations = stDeviations.filter((value) => value > 0.1)
    const depressions = stDeviations.filter((value) => value < -0.05)

    if (elevations.length >= minConsistent) {
      result.st.elevation = true
      result.st.maxElevation = Math.max(...elevations)
    }
    if (depressions.length >= minConsistent) {
      result.st.depression = true
      result.st.maxDepression = Math.abs(Math.min(...depressions))
    }
  }

  const consistentZones = stZones.filter(
    (zone) =>
      (zone.type === 'elevation' && result.st.elevation) ||
      (zone.type === 'depression' && result.st.depression)
  )
  result.st.segmentIndices = mergeZones(consistentZones)
  const firstElevation = result.st.segmentIndices.find((zone) => zone.type === 'elevation')
  const firstDepression = result.st.segmentIndices.find((zone) => zone.type === 'depression')
  result.st.elevationPosition = firstElevation ? firstElevation.start : null
  result.st.depressionPosition = firstDepression ? firstDepression.start : null
  result.st.tWaveInversion =
    invertedTWaves >= Math.max(1, Math.ceil(morphBeatCount * 0.3))

  result.quality.reliable = morphBeatCount >= 3 && validQRS.length >= 2
  return result
}

function locateQRS(centered, r, fs) {
  const n = centered.length
  const baselineStart = r - Math.round(0.08 * fs)
  const baselineEnd = r - Math.round(0.04 * fs)
  const baseline = medianRange(centered, baselineStart, baselineEnd)
  const baselineIndex = Math.round((baselineStart + baselineEnd) / 2)
  const amplitude = Math.abs(centered[r] - baseline)
  if (amplitude < 0.05) return null

  const threshold = Math.max(amplitude * 0.15, 0.02)

  let onset = r
  const minOnset = Math.max(0, r - Math.round(0.12 * fs))
  while (onset > minOnset && Math.abs(centered[onset - 1] - baseline) > threshold) {
    onset--
  }

  let offset = r
  const maxOffset = Math.min(n - 1, r + Math.round(0.16 * fs))
  while (offset < maxOffset && Math.abs(centered[offset + 1] - baseline) > threshold) {
    offset++
  }

  const width = ((offset - onset) / fs) * 1000
  if (width < 30 || width > 250) return null

  return { onset, offset, width, baseline, baselineIndex, amplitude }
}

function locatePR(centered, qrsOnset, r, prevR, fs, baselineAt) {
  if (qrsOnset == null) return null

  const searchEnd = qrsOnset - Math.round(0.05 * fs)
  let searchStart = qrsOnset - Math.round(0.28 * fs)
  if (prevR != null) searchStart = Math.max(searchStart, prevR + Math.round(0.22 * fs))
  searchStart = Math.max(0, searchStart)
  if (searchEnd - searchStart < Math.round(0.04 * fs)) return null

  let pPeak = -1
  let pValue = 0
  for (let i = searchStart; i < searchEnd; i++) {
    const deviation = Math.abs(centered[i] - baselineAt(i))
    if (deviation > pValue) {
      pValue = deviation
      pPeak = i
    }
  }

  const rAmplitude = Math.abs(centered[r] - baselineAt(r))
  if (pPeak < 0 || pValue < Math.max(0.03, rAmplitude * 0.08)) return null

  const pThreshold = Math.max(0.02, pValue * 0.2)
  let pOnset = pPeak
  const minOnset = Math.max(0, pPeak - Math.round(0.12 * fs))
  while (pOnset > minOnset && Math.abs(centered[pOnset - 1] - baselineAt(pOnset - 1)) > pThreshold) {
    pOnset--
  }

  const interval = ((qrsOnset - pOnset) / fs) * 1000
  if (interval < 70 || interval > 320) return null

  return { interval, pOnset, pPeak }
}

function locateQT(centered, r, qrsOnset, nextR, fs, baselineAt) {
  if (qrsOnset == null) return null

  const n = centered.length
  const detrended = (index) => centered[index] - baselineAt(index)

  const searchStart = r + Math.round(0.12 * fs)
  let searchEnd = nextR != null
    ? nextR - Math.round(0.04 * fs)
    : r + Math.round(0.5 * fs)
  searchEnd = Math.min(n - 1, Math.max(searchStart + 1, searchEnd))
  if (searchEnd <= searchStart) return null

  let tPeak = -1
  let tValue = 0
  for (let i = searchStart; i <= searchEnd; i++) {
    const deviation = Math.abs(detrended(i))
    if (deviation > tValue) {
      tValue = deviation
      tPeak = i
    }
  }

  const rAmplitude = Math.abs(detrended(r))
  if (tPeak < 0 || tValue < Math.max(0.05, rAmplitude * 0.1)) return null

  let slopeIndex = tPeak
  let maxSlope = 0
  for (let i = tPeak + 1; i < searchEnd; i++) {
    const slope = Math.abs(detrended(i + 1) - detrended(i - 1))
    if (slope > maxSlope) {
      maxSlope = slope
      slopeIndex = i
    }
  }

  const left = Math.max(0, slopeIndex - 1)
  const right = Math.min(n - 1, slopeIndex + 1)
  const slope = (detrended(right) - detrended(left)) / Math.max(1, right - left)

  let tEnd = slopeIndex
  if (Math.abs(slope) > 1e-6) {
    tEnd = slopeIndex + Math.round(-detrended(slopeIndex) / slope)
  }

  if (!Number.isFinite(tEnd) || tEnd < tPeak || tEnd > searchEnd) {
    tEnd = tPeak
    const endThreshold = Math.max(0.02, tValue * 0.15)
    while (tEnd < searchEnd && Math.abs(detrended(tEnd)) > endThreshold) {
      tEnd++
    }
  }
  tEnd = clamp(tEnd, tPeak, searchEnd)

  const interval = ((tEnd - qrsOnset) / fs) * 1000
  if (interval < 180 || interval > 750) return null

  return { interval, tEnd, tPeak }
}

function interpolateBaseline(points, x) {
  if (points.length === 0) return 0
  if (points.length === 1) return points[0].y

  if (points.length === 2) {
    const [a, b] = points
    if (a.x === b.x) return (a.y + b.y) / 2
    const t = (x - a.x) / (b.x - a.x)
    return a.y + t * (b.y - a.y)
  }

  const [p0, p1, p2] = points
  const denom0 = (p0.x - p1.x) * (p0.x - p2.x)
  const denom1 = (p1.x - p0.x) * (p1.x - p2.x)
  const denom2 = (p2.x - p0.x) * (p2.x - p1.x)
  if (denom0 === 0 || denom1 === 0 || denom2 === 0) {
    const [a, b] = points
    const t = (x - a.x) / (b.x - a.x)
    return a.y + t * (b.y - a.y)
  }

  const l0 = ((x - p1.x) * (x - p2.x)) / denom0
  const l1 = ((x - p0.x) * (x - p2.x)) / denom1
  const l2 = ((x - p0.x) * (x - p1.x)) / denom2
  return l0 * p0.y + l1 * p1.y + l2 * p2.y
}

function makeBaseline(qrsList) {
  const points = []
  for (const qrs of qrsList) {
    if (qrs && qrs.baselineIndex != null) {
      points.push({ x: qrs.baselineIndex, y: qrs.baseline })
    }
  }
  return (x) => interpolateBaseline(points, x)
}

function measureST(centered, qrs, fs, context = {}) {
  const n = centered.length
  const start = qrs.offset + Math.round(0.04 * fs)
  const end = qrs.offset + Math.round(0.08 * fs)
  if (start >= n) return null

  const safeEnd = Math.min(n - 1, Math.max(start + 1, end))
  const stMid = (start + safeEnd) / 2

  // Interpola a linha de base usando os segmentos PR do batimento atual e
  // dos vizinhos (quadrática quando há 3 pontos), compensando a curvatura
  // do baseline wander.
  const { r, nextR, prevR, nextQRS, prevQRS } = context
  const points = []

  if (prevQRS && prevR != null) points.push({ x: prevQRS.baselineIndex, y: prevQRS.baseline })
  if (r != null) points.push({ x: qrs.baselineIndex, y: qrs.baseline })
  if (nextQRS && nextR != null) points.push({ x: nextQRS.baselineIndex, y: nextQRS.baseline })

  const baseline = interpolateBaseline(points, stMid)

  let sum = 0
  let count = 0
  for (let i = start; i <= safeEnd; i++) {
    sum += centered[i] - baseline
    count++
  }
  if (count === 0) return null

  return { deviation: sum / count, start, end: safeEnd }
}

function detectTWaveInversion(centered, r, nextR, fs) {
  const n = centered.length
  const start = r + Math.round(0.15 * fs)
  let end = nextR != null ? nextR - Math.round(0.04 * fs) : r + Math.round(0.45 * fs)
  end = Math.min(n - 1, end)
  if (end <= start) return false

  const baseline = medianRange(
    centered,
    r - Math.round(0.08 * fs),
    r - Math.round(0.04 * fs)
  )

  let tPeak = start
  let tValue = 0
  for (let i = start; i <= end; i++) {
    const deviation = Math.abs(centered[i] - baseline)
    if (deviation > tValue) {
      tValue = deviation
      tPeak = i
    }
  }

  if (tValue < 0.05) return false
  return centered[tPeak] - baseline < 0
}

function mergeZones(zones) {
  if (zones.length === 0) return []
  const sorted = [...zones].sort((a, b) => a.start - b.start)
  const merged = [{ ...sorted[0] }]
  for (let i = 1; i < sorted.length; i++) {
    const last = merged[merged.length - 1]
    if (sorted[i].start <= last.end + 1 && sorted[i].type === last.type) {
      last.end = Math.max(last.end, sorted[i].end)
    } else {
      merged.push({ ...sorted[i] })
    }
  }
  return merged
}

function classifyRhythm(bpm, cv, beatCount) {
  if (beatCount >= 3 && cv > 0.2) return 'Ritmo Irregular'
  if (bpm < 60) return 'Ritmo Bradicárdico'
  if (bpm > 100) return 'Ritmo Taquicárdico'
  return 'Sinusal Normal'
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

export default {
  sanitizeSignal,
  median,
  percentile,
  movingAverage,
  estimateBaseline,
  medianRange,
  detectRPeaks,
  analyzeSignal
}
