import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'ecg-analysis-history'

export function useHistory() {
  const [history, setHistory] = useState([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setHistory(JSON.parse(stored))
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error)
    }
  }, [])

  const saveToHistory = useCallback((analysisData) => {
    const entry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      source: analysisData.source || 'Desconhecido',
      bpm: analysisData.bpm || null,
      rhythm: analysisData.rhythm || null,
      pr: analysisData.pr || null,
      qrs: analysisData.qrs || null,
      qt: analysisData.qt || null,
      riskLevel: analysisData.riskLevel || null,
      overallSeverity: analysisData.overallSeverity || null,
      interpretation: analysisData.interpretation || null,
      diagnoses: analysisData.diagnoses || [],
      isSimulated: analysisData.isSimulated || false,
      fullData: analysisData
    }

    const updated = [entry, ...history].slice(0, 50)
    setHistory(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    return entry.id
  }, [history])

  const deleteEntry = useCallback((id) => {
    const updated = history.filter(entry => entry.id !== id)
    setHistory(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }, [history])

  const clearHistory = useCallback(() => {
    setHistory([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const getEntry = useCallback((id) => {
    return history.find(entry => entry.id === id) || null
  }, [history])

  const exportToCSV = useCallback(() => {
    if (history.length === 0) return null

    const headers = ['Data', 'Fonte', 'BPM', 'Ritmo', 'PR (ms)', 'QRS (ms)', 'QT (ms)', 'Nível de Risco', 'Interpretação']
    const rows = history.map(entry => [
      new Date(entry.date).toLocaleDateString('pt-BR'),
      entry.source,
      entry.bpm || 'N/A',
      entry.rhythm || 'N/A',
      entry.pr || 'N/A',
      entry.qrs || 'N/A',
      entry.qt || 'N/A',
      entry.riskLevel || 'N/A',
      `"${(entry.interpretation || '').replace(/"/g, '""')}"`
    ])

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    return csv
  }, [history])

  return {
    history,
    saveToHistory,
    deleteEntry,
    clearHistory,
    getEntry,
    exportToCSV
  }
}
