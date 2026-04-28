import React, { useState } from 'react'
import { ArrowLeft, Download, Share2, Heart } from 'lucide-react'
import ECGChart from '../components/ECGChart'
import DiagnosticsCard from '../components/DiagnosticsCard'
import StatsCard from '../components/StatsCard'
import ShareModal from '../components/ShareModal'
import { generatePDF } from '../services/shareService'

export default function Results({ data, onBack }) {
  const [expandedDiagnosis, setExpandedDiagnosis] = useState(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [downloadLoading, setDownloadLoading] = useState(false)

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Nenhum resultado disponível</p>
        <button
          onClick={onBack}
          className="mt-6 text-medical-600 hover:text-medical-700 font-semibold"
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

  const handleShare = () => {
    setShowShareModal(true)
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
        <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-lg">
          <p className="text-blue-900 font-semibold">ℹ️ Análise em Modo Fallback</p>
          <p className="text-blue-800 text-sm mt-2">
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
              className="p-2 hover:bg-gray-100 rounded-lg transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h2 className="text-3xl font-bold text-gray-900">Resultado da Análise</h2>
          </div>
          <p className="text-gray-600">
            Fonte: {data.source || 'Análise de ECG'}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleDownloadPDF}
            disabled={downloadLoading}
            className={`flex items-center gap-2 font-semibold py-2 px-4 rounded-lg transition-all ${
              downloadLoading
                ? 'bg-gray-100 text-gray-500 border border-gray-300 cursor-not-allowed'
                : 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700'
            }`}
          >
            <Download className="w-5 h-5" />
            <span className="hidden sm:inline">{downloadLoading ? 'Gerando...' : 'PDF'}</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-all"
          >
            <Share2 className="w-5 h-5" />
            <span className="hidden sm:inline">Compartilhar</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div>
        <h3 className="text-2xl font-bold mb-6 text-gray-900">Métricas Principais</h3>
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
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Traçado de ECG</h3>
          <ECGChart data={data.ecgChart.data} title="ECG Analisado" />
        </div>
      )}

      {/* Vital Signs Section */}
      {data.vitalSignsIncluded && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">💊 Sinais Vitais Adicionais</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.spO2 && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-gray-600 text-sm">SpO₂ (Oximetria)</p>
                <p className="text-2xl font-bold text-blue-600">{data.spO2}%</p>
              </div>
            )}
            {data.glucose && (
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-gray-600 text-sm">Glicose</p>
                <p className="text-2xl font-bold text-yellow-600">{data.glucose} mg/dL</p>
              </div>
            )}
            {data.systolic && (
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-gray-600 text-sm">Pressão Arterial</p>
                <p className="text-2xl font-bold text-purple-600">{data.systolic}/{data.diastolic}</p>
              </div>
            )}
            {data.temperature && (
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-gray-600 text-sm">Temperatura</p>
                <p className="text-2xl font-bold text-red-600">{data.temperature}°C</p>
              </div>
            )}
            {data.respiratoryRate && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-gray-600 text-sm">Freq. Respiratória</p>
                <p className="text-2xl font-bold text-green-600">{data.respiratoryRate} bpm</p>
              </div>
            )}
            {data.hemoglobin && (
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-gray-600 text-sm">Hemoglobina</p>
                <p className="text-2xl font-bold text-orange-600">{data.hemoglobin} g/dL</p>
              </div>
            )}
            {data.bloodType && (
              <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
                <p className="text-gray-600 text-sm">Tipo Sanguíneo</p>
                <p className="text-2xl font-bold text-pink-600">{data.bloodType}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Risk Level and Overall Status */}
      {(data.riskLevel || data.overallSeverity) && (
        <div className={`rounded-lg shadow-md p-6 border-l-4 ${
          data.overallSeverity === 'critical' ? 'bg-red-50 border-red-600' :
          data.overallSeverity === 'warning' ? 'bg-yellow-50 border-yellow-600' :
          'bg-green-50 border-green-600'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">Nível de Risco Geral</p>
              <p className={`text-sm ${
                data.overallSeverity === 'critical' ? 'text-red-700' :
                data.overallSeverity === 'warning' ? 'text-yellow-700' :
                'text-green-700'
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
        <h3 className="text-2xl font-bold mb-6 text-gray-900">Diagnósticos Identificados</h3>
        
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
          <div className="bg-gray-50 p-8 rounded-lg text-center text-gray-500">
            <p>Nenhum diagnóstico encontrado</p>
          </div>
        )}
      </div>

      {/* Interpretation */}
      {data.interpretation && (
        <div className="bg-medical-50 border-l-4 border-medical-600 p-6 rounded-lg">
          <h3 className="text-lg font-bold text-medical-900 mb-3">📋 Interpretação Clínica</h3>
          <p className="text-medical-800">
            {data.interpretation}
          </p>
        </div>
      )}

      {/* Recommendations */}
      {data.recommendations && (
        <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg">
          <h3 className="text-lg font-bold text-blue-900 mb-3">💡 Recomendações</h3>
          <ul className="text-blue-800 space-y-2">
            {(Array.isArray(data.recommendations) ? data.recommendations : [data.recommendations]).map(
              (rec, idx) => (
                <li key={idx} className="flex gap-2">
                  <span className="font-bold">•</span>
                  <span>{rec}</span>
                </li>
              )
            )}
          </ul>
        </div>
      )}

      {/* Technical Details */}
      {data.ecgChart && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Detalhes Técnicos</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-gray-600 text-sm font-medium">Taxa de Amostragem</p>
              <p className="text-2xl font-bold text-gray-900">{data.ecgChart.samplingRate || 250} Hz</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Duração</p>
              <p className="text-2xl font-bold text-gray-900">{data.ecgChart.duration?.toFixed(2) || '10'} s</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Total de Pontos</p>
              <p className="text-2xl font-bold text-gray-900">{data.ecgChart.data?.length || 2500}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Data da Análise</p>
              <p className="text-xl font-bold text-gray-900">
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
          className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-bold py-4 px-6 rounded-lg transition-all"
        >
          Voltar ao Dashboard
        </button>
        <button
          className="flex-1 bg-medical-600 hover:bg-medical-700 text-white font-bold py-4 px-6 rounded-lg transition-all shadow-md hover:shadow-lg"
        >
          Nova Análise
        </button>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal data={data} onClose={() => setShowShareModal(false)} />
      )}
    </div>
  )
}
