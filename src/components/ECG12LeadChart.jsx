import { useRef, useEffect, useMemo } from 'react'
import { LEAD_LAYOUT, LEAD_COLORS, INFARCT_LOCATIONS } from '../constants'

const analyzeLeadST = (data, samplingRate = 250) => {
  if (!data || data.length < 200) return null

  const sorted = [...data].sort((a, b) => a - b)
  const middle = sorted.slice(Math.floor(sorted.length * 0.2), Math.floor(sorted.length * 0.8))
  const baseline = middle.reduce((a, b) => a + b, 0) / middle.length

  const windowSize = Math.floor(samplingRate * 0.4)
  const stepSize = Math.floor(windowSize * 0.3)

  let hasElevation = false, hasDepression = false
  let maxElevation = 0, maxDepression = 0
  let beatCount = 0, elevationBeats = 0, depressionBeats = 0

  for (let i = 0; i < data.length - windowSize; i += stepSize) {
    const window = data.slice(i, i + windowSize)
    let maxDev = 0, rIdx = 0
    for (let j = 0; j < window.length; j++) {
      const dev = Math.abs(window[j] - baseline)
      if (dev > maxDev) { maxDev = dev; rIdx = j }
    }
    if (maxDev < 0.15) continue
    beatCount++

    const stStart = rIdx + Math.floor(0.065 * samplingRate)
    const stEnd = stStart + Math.floor(0.08 * samplingRate)
    if (stEnd >= window.length) continue

    let sum = 0
    for (let j = stStart; j < stEnd; j++) sum += window[j] - baseline
    const stDev = sum / (stEnd - stStart)

    if (stDev > 0.10) { hasElevation = true; elevationBeats++; maxElevation = Math.max(maxElevation, stDev) }
    if (stDev < -0.05) { hasDepression = true; depressionBeats++; maxDepression = Math.min(maxDepression, stDev) }
  }

  return {
    hasElevation,
    hasDepression,
    maxElevation: +maxElevation.toFixed(3),
    maxDepression: +maxDepression.toFixed(3),
    elevationMM: +(maxElevation * 10).toFixed(1),
    depressionMM: +(Math.abs(maxDepression) * 10).toFixed(1),
    confidence: beatCount > 0 ? Math.round(Math.max(elevationBeats, depressionBeats) / beatCount * 100) : 0
  }
}

const determineInfarctLocation = (elevationLeads, depressionLeads) => {
  const allElevation = [...elevationLeads]
  if (allElevation.length === 0 && depressionLeads.length === 0) return []

  const isPosterior = ['V1', 'V2', 'V3'].some(l => depressionLeads.includes(l)) && allElevation.length === 0

  const matches = []
  for (const [name, info] of Object.entries(INFARCT_LOCATIONS)) {
    const count = allElevation.filter(l => info.leads.includes(l)).length
    const ratio = count / info.leads.length
    if (ratio >= 0.4 && count >= 1) {
      matches.push({ ...info, name, score: ratio, matchCount: count, totalLeads: info.leads.length })
    }
  }

  matches.sort((a, b) => b.score - a.score)

  if (isPosterior) {
    const existing = matches.find(m => m.name.includes('Posterior'))
    if (!existing) {
      const pInfo = INFARCT_LOCATIONS['Posterior (recíproco)']
      matches.push({ ...pInfo, name: 'Posterior (recíproco)', score: 0.5, matchCount: 1, totalLeads: pInfo.leads.length })
    }
  }

  return matches
}

export default function ECG12LeadChart({ leads, title = 'ECG 12 Derivações' }) {
  const canvasRef = useRef(null)

  const leadAnalysis = useMemo(() => {
    if (!leads) return {}
    const result = {}
    for (const [name, data] of Object.entries(leads)) {
      result[name] = analyzeLeadST(data)
    }
    return result
  }, [leads])

  const elevationLeads = useMemo(() =>
    Object.entries(leadAnalysis).filter(([_, a]) => a?.hasElevation).map(([n]) => n),
    [leadAnalysis]
  )
  const depressionLeads = useMemo(() =>
    Object.entries(leadAnalysis).filter(([_, a]) => a?.hasDepression).map(([n]) => n),
    [leadAnalysis]
  )
  const infarctLocations = useMemo(() =>
    determineInfarctLocation(elevationLeads, depressionLeads),
    [elevationLeads, depressionLeads]
  )

  const hasFindings = elevationLeads.length > 0 || depressionLeads.length > 0

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !leads) return

    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)
    const W = rect.width
    const H = rect.height

    const isDark = document.documentElement.classList.contains('dark')
    ctx.fillStyle = isDark ? '#1f2937' : '#ffffff'
    ctx.fillRect(0, 0, W, H)

    const { rows, cols, grid } = LEAD_LAYOUT
    const margin = { top: 30, left: 40, right: 20, bottom: 10 }
    const cellW = (W - margin.left - margin.right) / cols
    const cellH = (H - margin.top - margin.bottom) / rows

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const leadName = grid[row][col]
        const data = leads[leadName]
        if (!data || data.length < 2) continue

        const cx = margin.left + col * cellW
        const cy = margin.top + row * cellH
        const analysis = leadAnalysis[leadName]
        const hasElevation = analysis?.hasElevation
        const hasDepression = analysis?.hasDepression

        if (hasElevation || hasDepression) {
          ctx.fillStyle = hasElevation
            ? (isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.08)')
            : (isDark ? 'rgba(234, 179, 8, 0.15)' : 'rgba(234, 179, 8, 0.08)')
          ctx.fillRect(cx, cy, cellW, cellH)
        }

        let borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(200,200,200,0.3)'
        let borderWidth = 0.5
        if (hasElevation) { borderColor = '#ef4444'; borderWidth = 2.5 }
        else if (hasDepression) { borderColor = '#eab308'; borderWidth = 2.5 }
        ctx.strokeStyle = borderColor
        ctx.lineWidth = borderWidth
        ctx.strokeRect(cx, cy, cellW, cellH)

        const midY = cy + cellH / 2
        ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(cx + 10, midY)
        ctx.lineTo(cx + cellW - 10, midY)
        ctx.stroke()

        const plotW = cellW - 20
        const plotH = cellH * 0.8
        const amp = plotH / 2
        const offsetX = cx + 10
        const offsetY = midY
        const color = LEAD_COLORS[leadName] || '#0ea5e9'
        ctx.strokeStyle = color
        ctx.lineWidth = 1.5
        ctx.beginPath()
        const step = Math.max(1, Math.floor(data.length / plotW))
        const filtered = []
        for (let i = 0; i < data.length; i += step) filtered.push(data[i])
        for (let i = 0; i < filtered.length; i++) {
          const x = offsetX + (i / filtered.length) * plotW
          const y = offsetY - filtered[i] * amp
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()

        ctx.fillStyle = color
        ctx.font = 'bold 13px sans-serif'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'top'
        ctx.fillText(leadName, cx + 6, cy + 4)

        if (hasElevation || hasDepression) {
          const label = hasElevation
            ? `\u2191 SUPRA ST (${analysis.elevationMM}mm)`
            : `\u2193 INFRA ST (${analysis.depressionMM}mm)`
          ctx.fillStyle = hasElevation ? '#dc2626' : '#ca8a04'
          ctx.font = 'bold 10px sans-serif'
          ctx.textAlign = 'right'
          ctx.textBaseline = 'bottom'
          ctx.fillText(label, cx + cellW - 6, cy + cellH - 4)
        }
      }
    }
  }, [leads, leadAnalysis])

  if (!leads || Object.keys(leads).length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400 text-center">
          Nenhum dado de 12 derivações disponível
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 text-center">{title}</h3>
      <canvas
        ref={canvasRef}
        className="w-full"
        style={{ height: '600px', maxHeight: '70vh' }}
      />

      {hasFindings && (
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap gap-4 text-sm">
            {elevationLeads.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-red-500" />
                <span className="text-gray-700 dark:text-gray-300">
                  Supra ST ({elevationLeads.length} derivações: {elevationLeads.join(', ')})
                </span>
              </div>
            )}
            {depressionLeads.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-yellow-500" />
                <span className="text-gray-700 dark:text-gray-300">
                  Infra ST ({depressionLeads.length} derivações: {depressionLeads.join(', ')})
                </span>
              </div>
            )}
          </div>

          {infarctLocations.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-600 dark:border-red-500 p-4 rounded-r-lg">
              <p className="font-bold text-red-800 dark:text-red-200 text-sm">
                {infarctLocations.length === 1 ? 'Local provável do infarto:' : 'Locais prováveis do infarto:'}
              </p>
              {infarctLocations.map((loc, i) => (
                <div key={i} className="mt-1">
                  <p className="font-semibold text-red-700 dark:text-red-300 text-sm">
                    {i + 1}. {loc.name}
                  </p>
                  <p className="text-red-600 dark:text-red-400 text-xs">
                    {loc.description} ({loc.artery})
                    {loc.matchCount && loc.totalLeads && (
                      <span> — {loc.matchCount}/{loc.totalLeads} derivações compatíveis</span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!hasFindings && Object.keys(leads).length > 0 && (
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="w-3 h-3 rounded-sm bg-green-500" />
          <span>Nenhuma alteração ST significativa detectada nas derivações analisadas</span>
        </div>
      )}
    </div>
  )
}
