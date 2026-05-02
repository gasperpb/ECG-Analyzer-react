import { useState, useCallback } from 'react'

export function useArrhythmiaClassifier() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState(null)

  const classify = useCallback(async (ecgData) => {
    if (!ecgData || !ecgData.data || ecgData.data.length === 0) {
      return null
    }

    setIsAnalyzing(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 500))

      const data = ecgData.data
      const samplingRate = ecgData.samplingRate || 250
      const bpm = ecgData.bpm || extractBPM(data, samplingRate)
      const rhythm = analyzeRhythm(data, samplingRate, bpm)
      const morphology = analyzeMorphology(data, samplingRate)

      const classifications = []

      if (bpm < 60) {
        classifications.push({
          type: 'bradycardia',
          label: 'Bradicardia',
          confidence: Math.min(95, 80 + (60 - bpm)),
          severity: bpm < 40 ? 'critical' : bpm < 50 ? 'warning' : 'info'
        })
      } else if (bpm > 100) {
        classifications.push({
          type: 'tachycardia',
          label: 'Taquicardia',
          confidence: Math.min(95, 80 + (bpm - 100)),
          severity: bpm > 150 ? 'critical' : bpm > 120 ? 'warning' : 'info'
        })
      }

      if (rhythm.irregularity > 0.3) {
        classifications.push({
          type: 'irregular_rhythm',
          label: 'Ritmo Irregular',
          confidence: Math.min(90, rhythm.irregularity * 100),
          severity: 'warning'
        })
      }

      if (morphology.stElevation) {
        classifications.push({
          type: 'st_elevation',
          label: 'Supradesnivelamento ST',
          confidence: morphology.stElevation.confidence,
          severity: 'critical'
        })
      }

      if (morphology.stDepression) {
        classifications.push({
          type: 'st_depression',
          label: 'Infradesnivelamento ST',
          confidence: morphology.stDepression.confidence,
          severity: 'warning'
        })
      }

      if (morphology.tWaveInversion) {
        classifications.push({
          type: 't_wave_inversion',
          label: 'Inversão de Onda T',
          confidence: morphology.tWaveInversion.confidence,
          severity: 'warning'
        })
      }

      if (morphology.qrsWidth > 120) {
        classifications.push({
          type: 'wide_qrs',
          label: 'QRS Alargado',
          confidence: Math.min(90, 70 + (morphology.qrsWidth - 120) / 2),
          severity: 'warning'
        })
      }

      if (classifications.length === 0) {
        classifications.push({
          type: 'normal',
          label: 'Ritmo Sinusal Normal',
          confidence: 85,
          severity: 'normal'
        })
      }

      classifications.sort((a, b) => {
        const severityOrder = { critical: 0, warning: 1, info: 2, normal: 3 }
        return (severityOrder[a.severity] || 3) - (severityOrder[b.severity] || 3)
      })

      const analysisResult = {
        timestamp: new Date().toISOString(),
        bpm,
        rhythm: rhythm.type,
        classifications,
        morphology,
        mlModel: 'ECG-Analyzer-ML v1.0',
        overallAssessment: classifications[0]?.severity || 'normal'
      }

      setResult(analysisResult)
      return analysisResult
    } catch (error) {
      console.error('Erro na classificação ML:', error)
      return null
    } finally {
      setIsAnalyzing(false)
    }
  }, [])

  const reset = useCallback(() => {
    setResult(null)
  }, [])

  return { classify, isAnalyzing, result, reset }
}

function extractBPM(data, samplingRate) {
  const threshold = 0.5
  let peaks = []
  let lastPeakIndex = -samplingRate * 0.3

  for (let i = 1; i < data.length - 1; i++) {
    if (data[i] > threshold && data[i] > data[i - 1] && data[i] > data[i + 1]) {
      if (i - lastPeakIndex > samplingRate * 0.3) {
        peaks.push(i)
        lastPeakIndex = i
      }
    }
  }

  if (peaks.length < 2) return 72

  const avgInterval = (peaks[peaks.length - 1] - peaks[0]) / (peaks.length - 1)
  const secondsPerBeat = avgInterval / samplingRate
  const bpm = Math.round(60 / secondsPerBeat)

  return Math.max(30, Math.min(220, bpm))
}

function analyzeRhythm(data, samplingRate, bpm) {
  const threshold = 0.5
  let peaks = []
  let lastPeakIndex = -samplingRate * 0.3

  for (let i = 1; i < data.length - 1; i++) {
    if (data[i] > threshold && data[i] > data[i - 1] && data[i] > data[i + 1]) {
      if (i - lastPeakIndex > samplingRate * 0.3) {
        peaks.push(i)
        lastPeakIndex = i
      }
    }
  }

  if (peaks.length < 3) {
    return { type: 'Sinusal', irregularity: 0 }
  }

  const intervals = []
  for (let i = 1; i < peaks.length; i++) {
    intervals.push(peaks[i] - peaks[i - 1])
  }

  const meanInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
  const variance = intervals.reduce((sum, val) => sum + Math.pow(val - meanInterval, 2), 0) / intervals.length
  const stdDev = Math.sqrt(variance)
  const irregularity = stdDev / meanInterval

  let type = 'Sinusal'
  if (irregularity > 0.4) type = 'Irregular'
  else if (irregularity > 0.2) type = 'Levemente Irregular'

  return { type, irregularity: Math.min(1, irregularity) }
}

function analyzeMorphology(data, samplingRate) {
  const windowSize = samplingRate
  const stElevation = detectSTElevation(data, windowSize)
  const stDepression = detectSTDepression(data, windowSize)
  const tWaveInversion = detectTWaveInversion(data, windowSize)
  const qrsWidth = estimateQRSWidth(data, samplingRate)

  return { stElevation, stDepression, tWaveInversion, qrsWidth }
}

function detectSTElevation(data, windowSize) {
  let maxST = 0
  let threshold = 0.15

  for (let i = 0; i < data.length - windowSize; i += windowSize) {
    const window = data.slice(i, i + windowSize)
    const maxVal = Math.max(...window)
    const maxIndex = window.indexOf(maxVal)

    const rPeak = maxVal
    const stPoint = maxIndex + Math.floor(windowSize * 0.08)

    if (stPoint < window.length) {
      const stDeviation = window[stPoint] / rPeak
      if (stDeviation > threshold) {
        maxST = Math.max(maxST, stDeviation)
      }
    }
  }

  if (maxST > 0) {
    return {
      detected: true,
      confidence: Math.min(90, maxST * 200),
      magnitude: maxST.toFixed(3)
    }
  }
  return null
}

function detectSTDepression(data, windowSize) {
  let maxDepression = 0
  const threshold = 0.15

  for (let i = 0; i < data.length - windowSize; i += windowSize) {
    const window = data.slice(i, i + windowSize)
    const maxVal = Math.max(...window)
    const maxIndex = window.indexOf(maxVal)

    const stPoint = maxIndex + Math.floor(windowSize * 0.08)

    if (stPoint < window.length) {
      const stDeviation = window[stPoint] / maxVal
      if (stDeviation < -threshold) {
        maxDepression = Math.max(maxDepression, Math.abs(stDeviation))
      }
    }
  }

  if (maxDepression > 0) {
    return {
      detected: true,
      confidence: Math.min(85, maxDepression * 180),
      magnitude: maxDepression.toFixed(3)
    }
  }
  return null
}

function detectTWaveInversion(data, windowSize) {
  let invertedCount = 0
  let totalCount = 0

  for (let i = 0; i < data.length - windowSize; i += windowSize) {
    const window = data.slice(i, i + windowSize)
    const maxVal = Math.max(...window)
    const maxIndex = window.indexOf(maxVal)

    const tWaveRegion = window.slice(maxIndex + Math.floor(windowSize * 0.1), maxIndex + Math.floor(windowSize * 0.4))

    if (tWaveRegion.length > 0) {
      totalCount++
      const minVal = Math.min(...tWaveRegion)
      if (minVal < -0.1 && maxVal > 0.5) {
        invertedCount++
      }
    }
  }

  if (totalCount > 0 && invertedCount / totalCount > 0.3) {
    return {
      detected: true,
      confidence: Math.min(85, (invertedCount / totalCount) * 100),
      percentage: Math.round((invertedCount / totalCount) * 100)
    }
  }
  return null
}

function estimateQRSWidth(data, samplingRate) {
  const threshold = 0.3
  let widths = []

  let i = 0
  while (i < data.length) {
    if (Math.abs(data[i]) > threshold) {
      let start = i
      while (i < data.length && Math.abs(data[i]) > threshold * 0.3) {
        i++
      }
      let end = i
      const width = (end - start) / samplingRate * 1000
      if (width > 40 && width < 200) {
        widths.push(width)
      }
    }
    i++
  }

  if (widths.length === 0) return 80

  const avgWidth = widths.reduce((a, b) => a + b, 0) / widths.length
  return Math.round(avgWidth)
}

export default useArrhythmiaClassifier
