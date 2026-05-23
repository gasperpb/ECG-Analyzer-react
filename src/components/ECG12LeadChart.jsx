import { useRef, useEffect } from 'react'
import { LEAD_LAYOUT, LEAD_COLORS } from '../constants'

export default function ECG12LeadChart({ leads, title = 'ECG 12 Derivações' }) {
  const canvasRef = useRef(null)

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

        // Grid da célula
        ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(200,200,200,0.3)'
        ctx.lineWidth = 0.5
        ctx.strokeRect(cx, cy, cellW, cellH)

        // Baseline
        const midY = cy + cellH / 2
        ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(cx + 10, midY)
        ctx.lineTo(cx + cellW - 10, midY)
        ctx.stroke()

        // Traçado
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

        // Label
        ctx.fillStyle = color
        ctx.font = 'bold 13px sans-serif'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'top'
        ctx.fillText(leadName, cx + 6, cy + 4)
      }
    }
  }, [leads])

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
    </div>
  )
}
