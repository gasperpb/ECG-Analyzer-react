import { Clock, Trash2, Download, Eye, AlertCircle, FileText } from 'lucide-react'
import { useHistory } from '../hooks/useHistory'
import { exportToFHIR, exportToHL7v2 } from '../services/fhirService'
import { useState } from 'react'

export default function History({ onViewAnalysis }) {
  const { history, deleteEntry, clearHistory, exportToCSV } = useHistory()
  const [showExportOptions, setShowExportOptions] = useState(false)

  const handleExport = () => {
    const csv = exportToCSV()
    if (!csv) return

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `ecg-historico-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExportFHIR = () => {
    const latestEntry = history[0]
    if (!latestEntry) return

    exportToFHIR(latestEntry.fullData, {
      id: latestEntry.id,
      firstName: 'Paciente',
      lastName: 'Anonimo',
      gender: 'unknown',
      birthDate: '1900-01-01'
    })
    setShowExportOptions(false)
  }

  const handleExportHL7 = () => {
    const latestEntry = history[0]
    if (!latestEntry) return

    exportToHL7v2(latestEntry.fullData, {
      id: latestEntry.id,
      firstName: 'Paciente',
      lastName: 'Anonimo',
      gender: 'unknown',
      birthDate: '19000101'
    })
    setShowExportOptions(false)
  }

  const handleDelete = (id, e) => {
    e.stopPropagation()
    if (window.confirm('Tem certeza que deseja excluir esta análise?')) {
      deleteEntry(id)
    }
  }

  const handleClear = () => {
    if (window.confirm('Tem certeza que deseja limpar todo o histórico? Esta ação não pode ser desfeita.')) {
      clearHistory()
    }
  }

  const getRiskBadge = (riskLevel) => {
    if (!riskLevel) return null

    const styles = {
      low: 'bg-green-100 text-green-800 border-green-200',
      moderate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      high: 'bg-red-100 text-red-800 border-red-200'
    }

    const labels = {
      low: 'Baixo',
      moderate: 'Moderado',
      high: 'Alto'
    }

    return (
      <span className={`text-xs px-2 py-1 rounded-full border ${styles[riskLevel] || styles.low}`}>
        {labels[riskLevel] || riskLevel}
      </span>
    )
  }

  if (history.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Histórico de Análises</h2>
          <p className="text-gray-600 dark:text-gray-400">Visualize e gerencie suas análises de ECG anteriores</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-12 text-center border border-gray-200 dark:border-gray-700">
          <Clock className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Nenhuma análise no histórico</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Realize uma análise de ECG para vê-la aqui
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Histórico de Análises</h2>
          <p className="text-gray-600 dark:text-gray-400">
            {history.length} análise{history.length !== 1 ? 's' : ''} armazenada{history.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex gap-3">
          <div className="relative">
            <button
              onClick={() => setShowExportOptions(true)}
              className="flex items-center gap-2 bg-medical-600 hover:bg-medical-700 text-white font-semibold py-2 px-4 rounded-lg transition-all"
            >
              <Download className="w-5 h-5" />
              <span className="hidden sm:inline">Exportar</span>
            </button>
          </div>
          <button
            onClick={handleClear}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-all"
          >
            <Trash2 className="w-5 h-5" />
            <span className="hidden sm:inline">Limpar</span>
          </button>
        </div>

      {/* Export Options Modal */}
      {showExportOptions && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-sm w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Exportar Dados</h3>
            </div>
            <div className="p-6 space-y-3">
              <button
                onClick={handleExport}
                className="w-full flex items-center gap-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                <Download className="w-5 h-5 text-medical-600 dark:text-medical-500" />
                <div className="text-left">
                  <div className="font-semibold text-gray-900 dark:text-gray-100">CSV</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Planilha do histórico</div>
                </div>
              </button>
              <button
                onClick={handleExportFHIR}
                className="w-full flex items-center gap-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                <FileText className="w-5 h-5 text-green-600 dark:text-green-500" />
                <div className="text-left">
                  <div className="font-semibold text-gray-900 dark:text-gray-100">FHIR R4 (JSON)</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Padrão hospitalar internacional</div>
                </div>
              </button>
              <button
                onClick={handleExportHL7}
                className="w-full flex items-center gap-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                <div className="text-left">
                  <div className="font-semibold text-gray-900 dark:text-gray-100">HL7 v2</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Padrão de interoperabilidade</div>
                </div>
              </button>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-b-lg">
              <button
                onClick={() => setShowExportOptions(false)}
                className="w-full py-2 px-4 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* History List */}
      <div className="space-y-4">
        {history.map((entry) => (
          <div
            key={entry.id}
            onClick={() => onViewAnalysis && onViewAnalysis(entry)}
             className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all cursor-pointer"
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {entry.source || 'Análise de ECG'}
                  </h3>
                    {entry.isSimulated && (
                       <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full border border-blue-200 dark:border-blue-800">
                         Simulado
                       </span>
                    )}
                    {getRiskBadge(entry.riskLevel)}
                  </div>

                   <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-1 mb-3">
                    <Clock className="w-4 h-4" />
                    {new Date(entry.date).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {entry.bpm && (
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 text-xs">Frequência</p>
                        <p className="text-lg font-bold text-red-600">{entry.bpm} BPM</p>
                      </div>
                    )}
                    {entry.rhythm && (
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 text-xs">Ritmo</p>
                        <p className="text-sm font-bold text-green-700">{entry.rhythm}</p>
                      </div>
                    )}
                    {entry.qt && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 text-xs">QT</p>
                        <p className="text-lg font-bold text-blue-600">{entry.qt} ms</p>
                      </div>
                    )}
                    {entry.qrs && (
                      <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 text-xs">QRS</p>
                        <p className="text-lg font-bold text-purple-600">{entry.qrs} ms</p>
                      </div>
                    )}
                  </div>

                  {/* Interpretation */}
                  {entry.interpretation && (
                    <p className="text-gray-700 dark:text-gray-300 text-sm mt-4 line-clamp-2">
                      {entry.interpretation}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onViewAnalysis && onViewAnalysis(entry)
                    }}
                     className="p-2 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg transition-all"
                    title="Ver detalhes"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(entry.id, e)}
                     className="p-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg transition-all"
                    title="Excluir análise"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-800 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-2">ℹ️ Sobre o Histórico</h4>
            <ul className="text-blue-800 dark:text-blue-200 text-sm space-y-1">
              <li>• As análises são armazenadas localmente no seu navegador</li>
              <li>• O histórico mantém as 50 análises mais recentes</li>
              <li>• Exporte seus dados para CSV para uso externo</li>
              <li>• Os dados são privados e não são enviados para servidores externos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
