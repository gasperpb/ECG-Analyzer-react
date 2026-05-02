import { useState } from 'react'
import { ArrowLeft, Download, Share2, Heart, FileText, Settings, Brain } from 'lucide-react'
import ECGChart from '../components/ECGChart'
import DiagnosticsCard from '../components/DiagnosticsCard'
import StatsCard from '../components/StatsCard'
import ShareModal from '../components/ShareModal'
import { generatePDF, generateProfessionalPDF } from '../services/shareService'
import { sendToECGR1WithPrompt } from '../services/ecgR1Service'

export default function Results({ data, onBack }) {
  const [showShareModal, setShowShareModal] = useState(false)
  const [showPdfOptions, setShowPdfOptions] = useState(false)
  const [downloadLoading, setDownloadLoading] = useState(false)
  const [sendingToAI, setSendingToAI] = useState(false)
  const [pdfOptions, setPdfOptions] = useState({
    doctorName: '',
    doctorCRM: '',
    institution: '',
    type: 'professional'
  })

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 text-lg">Nenhum resultado disponível</p>
        <button
          onClick={onBack}
          className="mt-6 text-medical-600 hover:text-medical-700 dark:text-medical-500 font-semibold"
        >
          Voltar para o Dashboard
        </button>
      </div>
    )
  }

  const handleDownloadPDF = async () => {
    try {
      setDownloadLoading(true)
      await generatePDF(data)
    } catch (error) {
      alert('Erro ao gerar PDF. Tente novamente.')
      console.error('Erro ao gerar PDF:', error)
    } finally {
      setDownloadLoading(false)
    }
  }

  const handleProfessionalPDF = async () => {
    try {
      setDownloadLoading(true)
      await generateProfessionalPDF(data, pdfOptions)
      setShowPdfOptions(false)
    } catch (error) {
      alert('Erro ao gerar laudo profissional. Tente novamente.')
      console.error('Erro ao gerar PDF profissional:', error)
    } finally {
      setDownloadLoading(false)
    }
  }

  const handleShare = () => {
    setShowShareModal(true)
  }

  const handleSendToAI = async () => {
    try {
      setSendingToAI(true)
      await sendToECGR1WithPrompt('ecg-chart-container')
    } catch (error) {
      alert('Erro ao enviar para IA. Verifique se o gráfico está visível.')
      console.error('Erro ao enviar para ECG-R1:', error)
    } finally {
      setSendingToAI(false)
    }
  }

  // Dados para exemplo (quando a API não retornar dados completos)
  const sampleDiagnosis = data.diagnoses || [
    {
      name: 'Ritmo Sinusal Normal',
      severity: 'normal',
      description: 'O ECG mostra um padrão de ritmo cardíaco normal com frequência adequada.',
      details: {
        'Frequência Cardíaca': '72 BPM',
        'Intervalo PR': '160ms',
        'Complexo QRS': '80ms',
        'Intervalo QT': '400ms'
      },
      recommendation: 'Continue com acompanhamento regular'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Aviso de Fallback */}
      {data.isSimulated && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600 dark:border-blue-500 p-4 rounded-lg">
          <p className="text-blue-900 dark:text-blue-100 font-semibold">ℹ️ Análise em Modo Fallback</p>
          <p className="text-blue-800 dark:text-blue-200 text-sm mt-2">
            O backend não estava disponível. Os resultados abaixo foram gerados localmente como exemplo. 
            Para resultados precisos, certifique-se que o servidor Java está rodando em http://localhost:8080
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Resultado da Análise</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Fonte: {data.source || 'Análise de ECG'}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSendToAI}
            disabled={sendingToAI}
            className={`flex items-center gap-2 font-semibold py-2 px-4 rounded-lg transition-all ${
              sendingToAI
                ? 'bg-purple-400 dark:bg-purple-600 text-white cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white'
            }`}
          >
            <Brain className="w-5 h-5" />
            <span className="hidden sm:inline">{sendingToAI ? 'Enviando...' : 'Enviar para IA'}</span>
          </button>
          <div className="relative">
            <button
              onClick={() => setShowPdfOptions(true)}
              disabled={downloadLoading}
              className={`flex items-center gap-2 font-semibold py-2 px-4 rounded-lg transition-all ${
                downloadLoading
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 border border-gray-300 dark:border-gray-700 cursor-not-allowed'
                  : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Download className="w-5 h-5" />
              <span className="hidden sm:inline">{downloadLoading ? 'Gerando...' : 'Laudo PDF'}</span>
            </button>
          </div>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-2 px-4 rounded-lg transition-all"
          >
            <Share2 className="w-5 h-5" />
            <span className="hidden sm:inline">Compartilhar</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div>
        <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Métricas Principais</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard
            icon={Heart}
            title="Frequência Cardíaca"
            value={data.bpm || 72}
            unit="BPM"
            color="red"
          />
          <StatsCard
            icon={Heart}
            title="Ritmo"
            value={data.rhythm || 'Sinusal'}
            color="green"
          />
          <StatsCard
            icon={Heart}
            title="QT"
            value={data.qt || '400'}
            unit="ms"
            color="blue"
          />
          <StatsCard
            icon={Heart}
            title="PR"
            value={data.pr || '160'}
            unit="ms"
            color="purple"
          />
        </div>
      </div>

      {/* ECG Chart */}
      {data.ecgChart && (
        <div id="ecg-chart-container" className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Traçado de ECG</h3>
          <ECGChart data={data.ecgChart.data} title="ECG Analisado" />
        </div>
      )}

      {/* Vital Signs Section */}
      {data.vitalSignsIncluded && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">💊 Sinais Vitais Adicionais</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.spO2 && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-gray-600 dark:text-gray-400 text-sm">SpO₂ (Oximetria)</p>
                <p className="text-2xl font-bold text-blue-600">{data.spO2}%</p>
              </div>
            )}
            {data.glucose && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-gray-600 dark:text-gray-400 text-sm">Glicose</p>
                <p className="text-2xl font-bold text-yellow-600">{data.glucose} mg/dL</p>
              </div>
            )}
            {data.systolic && (
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <p className="text-gray-600 dark:text-gray-400 text-sm">Pressão Arterial</p>
                <p className="text-2xl font-bold text-purple-600">{data.systolic}/{data.diastolic}</p>
              </div>
            )}
            {data.temperature && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-gray-600 dark:text-gray-400 text-sm">Temperatura</p>
                <p className="text-2xl font-bold text-red-600">{data.temperature}°C</p>
              </div>
            )}
            {data.respiratoryRate && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-gray-600 dark:text-gray-400 text-sm">Freq. Respiratória</p>
                <p className="text-2xl font-bold text-green-600">{data.respiratoryRate} bpm</p>
              </div>
            )}
            {data.hemoglobin && (
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <p className="text-gray-600 dark:text-gray-400 text-sm">Hemoglobina</p>
                <p className="text-2xl font-bold text-orange-600">{data.hemoglobin} g/dL</p>
              </div>
            )}
            {data.bloodType && (
              <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg border border-pink-200 dark:border-pink-800">
                <p className="text-gray-600 dark:text-gray-400 text-sm">Tipo Sanguíneo</p>
                <p className="text-2xl font-bold text-pink-600">{data.bloodType}</p>
              </div>
            )}
            {data.potassium && (
              <div className={`p-4 rounded-lg border ${
                 data.potassium > 6.0 ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
                 data.potassium > 5.0 ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' :
                 data.potassium < 3.0 ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
                 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
               }`}>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Potássio (K+)</p>
                <p className={`text-2xl font-bold ${
                  data.potassium > 6.0 ? 'text-red-600' :
                  data.potassium > 5.0 ? 'text-yellow-600' :
                  data.potassium < 3.0 ? 'text-red-600' :
                  'text-green-600'
                }`}>{data.potassium} mEq/L</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Risk Level and Overall Status */}
      {(data.riskLevel || data.overallSeverity) && (
          <div className={`rounded-lg shadow-md p-6 border-l-4 ${
            data.overallSeverity === 'critical' ? 'bg-red-50 dark:bg-red-900/20 border-red-600 dark:border-red-500' :
            data.overallSeverity === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-600 dark:border-yellow-500' :
            'bg-green-50 dark:bg-green-900/20 border-green-600 dark:border-green-500'
          }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">Nível de Risco Geral</p>
                 <p className={`text-sm ${
                 data.overallSeverity === 'critical' ? 'text-red-700 dark:text-red-100' :
                 data.overallSeverity === 'warning' ? 'text-yellow-700 dark:text-yellow-100' :
                 'text-green-700 dark:text-green-100'
               }`}>
                {data.overallSeverity === 'critical' ? '⚠️ Crítico - Busque atenção médica imediatamente' :
                 data.overallSeverity === 'warning' ? '⚠️ Atenção - Recomenda-se avaliação' :
                 '✓ Baixo Risco - Resultado normal'}
              </p>
            </div>
            <div className={`text-4xl ${
              data.overallSeverity === 'critical' ? 'text-red-600' :
              data.overallSeverity === 'warning' ? 'text-yellow-600' :
              'text-green-600'
            }`}>
              {data.riskLevel === 'high' ? '🔴' : '🟢'}
            </div>
          </div>
        </div>
      )}

      {/* Diagnoses */}
      <div>
        <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Diagnósticos Identificados</h3>
        
        {sampleDiagnosis.length > 0 ? (
          <div className="space-y-4">
            {sampleDiagnosis.map((diagnosis, index) => (
              <div key={index}>
                <DiagnosticsCard
                  diagnosis={diagnosis}
                  severity={diagnosis.severity || 'info'}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg text-center text-gray-500 dark:text-gray-400">
            <p>Nenhum diagnóstico encontrado</p>
          </div>
        )}
      </div>

      {/* Interpretation */}
      {data.interpretation && (
        <div className="bg-medical-50 dark:bg-medical-900/20 border-l-4 border-medical-600 dark:border-medical-500 p-6 rounded-lg">
          <h3 className="text-lg font-bold text-medical-900 dark:text-medical-100 mb-3">📋 Interpretação Clínica</h3>
          <p className="text-medical-800 dark:text-medical-200">
            {data.interpretation}
          </p>
        </div>
      )}

      {/* Recommendations */}
      {data.recommendations && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600 dark:border-blue-500 p-6 rounded-lg">
          <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-3">💡 Recomendações</h3>
          <ul className="text-blue-800 dark:text-blue-200 space-y-2">
            {(Array.isArray(data.recommendations) ? data.recommendations : [data.recommendations]).map(
              (rec, idx) => {
                const text = typeof rec === 'string' ? rec : rec.text || ''
                const priority = typeof rec === 'object' ? (rec.priority || 'normal') : 'normal'
                   const colorClass = priority === 'critical' ? 'text-red-700 dark:text-red-100 font-bold' :
                                    priority === 'warning' ? 'text-yellow-700 dark:text-yellow-100 font-semibold' :
                                    'text-blue-800 dark:text-blue-200'
                return (
                  <li key={idx} className={`flex gap-2 ${colorClass}`}>
                    <span className="font-bold">•</span>
                    <span>{text}</span>
                  </li>
                )
              }
            )}
          </ul>
        </div>
      )}

      {/* Technical Details */}
      {data.ecgChart && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Detalhes Técnicos</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Taxa de Amostragem</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{data.ecgChart.samplingRate || 250} Hz</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Duração</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{data.ecgChart.duration?.toFixed(2) || '10'} s</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total de Pontos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{data.ecgChart.data?.length || 2500}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Data da Análise</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {new Date().toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-bold py-4 px-6 rounded-lg transition-all"
        >
          Voltar ao Dashboard
        </button>
      </div>

      {/* PDF Options Modal */}
      {showPdfOptions && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-medical-600 dark:text-medical-500" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Gerar Laudo PDF</h2>
              </div>
              <button
                onClick={() => setShowPdfOptions(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Nome do Médico
                </label>
                <input
                  type="text"
                  placeholder="Dr. João Silva"
                  value={pdfOptions.doctorName}
                  onChange={(e) => setPdfOptions(prev => ({ ...prev, doctorName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  CRM
                </label>
                <input
                  type="text"
                  placeholder="CRM/UF 12345"
                  value={pdfOptions.doctorCRM}
                  onChange={(e) => setPdfOptions(prev => ({ ...prev, doctorCRM: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Instituição
                </label>
                <input
                  type="text"
                  placeholder="Hospital Santa Maria"
                  value={pdfOptions.institution}
                  onChange={(e) => setPdfOptions(prev => ({ ...prev, institution: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => {
                    setPdfOptions(prev => ({ ...prev, type: 'professional' }))
                    handleProfessionalPDF()
                  }}
                  disabled={downloadLoading}
                  className="bg-medical-600 hover:bg-medical-700 text-white font-semibold py-3 px-4 rounded-lg transition-all disabled:opacity-50"
                >
                  <span className="block text-sm">Laudo Profissional</span>
                  <span className="block text-xs opacity-80">Com assinatura</span>
                </button>
                <button
                  onClick={handleDownloadPDF}
                  disabled={downloadLoading}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-all disabled:opacity-50"
                >
                  <span className="block text-sm">PDF Simples</span>
                  <span className="block text-xs opacity-80">Relatório básico</span>
                </button>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-b-lg">
              <button
                onClick={() => setShowPdfOptions(false)}
                className="w-full py-2 px-4 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal data={data} onClose={() => setShowShareModal(false)} />
      )}
    </div>
  )
}
