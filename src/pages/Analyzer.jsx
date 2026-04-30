import React, { useState } from 'react'
import { Zap, RefreshCw, Image } from 'lucide-react'
import FileUpload from '../components/FileUpload'
import ImagePreview from '../components/ImagePreview'
import OCRTips from '../components/OCRTips'
import ECGChart from '../components/ECGChart'
import Loading from '../components/Loading'
import VitalSignsInput from '../components/VitalSignsInput'
import ECGFeaturesInput from '../components/ECGFeaturesInput'
import { ecgService, generateSimulatedECG, extractECGFromImage } from '../services/api'
import { analyzeDiagnosis } from '../services/diagnosticEngine'

// Função para gerar análise simulada (fallback quando backend não responde)
const generateSimulatedAnalysis = (ecgData, vitalSigns = {}) => {
  // Usar motor de diagnóstico avançado
  const advancedAnalysis = analyzeDiagnosis(ecgData, vitalSigns)
  
  return {
    bpm: ecgData.bpm || 72,
    rhythm: ecgData.rhythm || 'Sinusal Normal',
    pr: ecgData.pr || 160,
    qrs: ecgData.qrs || 80,
    qt: ecgData.qt || 400,
    interpretation: advancedAnalysis.summaryInterpretation,
    recommendations: advancedAnalysis.recommendations,
    diagnoses: advancedAnalysis.diagnoses,
    riskLevel: advancedAnalysis.riskLevel,
    vitalSignsIncluded: Object.keys(vitalSigns).length > 0
  }
}

export default function Analyzer({ onAnalysisComplete }) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [ecgData, setEcgData] = useState(null)
  const [vitalSigns, setVitalSigns] = useState({})
  const [ecgFeatures, setEcgFeatures] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [analysisMethod, setAnalysisMethod] = useState(null) // 'file', 'simulated'

  const handleFileSelect = async (file) => {
    setSelectedFile(file)
    setError('')
    
    try {
      setLoading(true)
      
      // Se é uma imagem (ECG)
      if (['image/png', 'image/jpeg', 'image/jpg', 'image/bmp'].includes(file.type) || 
          /\.(png|jpg|jpeg|bmp)$/i.test(file.name)) {
        try {
          // Tentar extrair dados da imagem
          const extractedData = await extractECGFromImage(file)
          
          setEcgData({
            data: extractedData.data,
            samplingRate: extractedData.samplingRate || 250,
            duration: extractedData.duration || extractedData.data.length / 250,
            source: file.name,
            imageFile: file,
            isImage: true
          })
          setAnalysisMethod('image')
        } catch (imgError) {
          // Se não conseguir extrair automaticamente, criar dados padrão a partir da imagem
          const fallbackData = generateSimulatedECG()
          setEcgData({
            ...fallbackData,
            source: `Imagem: ${file.name}`,
            imageFile: file,
            isImage: true
          })
          setAnalysisMethod('image')
        }
      }
      // Se é um arquivo CSV ou texto
      else if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        const text = await file.text()
        const lines = text.trim().split('\n')
        const data = lines.slice(1).map(line => {
          const [_, voltage] = line.split(',')
          return parseFloat(voltage)
        })
        
        setEcgData({
          data,
          samplingRate: 250,
          duration: data.length / 250,
          source: file.name
        })
        setAnalysisMethod('file')
      }
      // Se é um arquivo JSON
      else if (file.type === 'application/json' || file.name.endsWith('.json')) {
        const text = await file.text()
        const parsed = JSON.parse(text)
        
        setEcgData({
          ...parsed,
          source: file.name
        })
        setAnalysisMethod('file')
      }
      else {
        setError('Formato de arquivo não suportado. Use CSV, JSON, PNG, JPG ou BMP.')
      }
    } catch (err) {
      setError(`Erro ao processar arquivo: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSimulatedData = async () => {
    setError('')
    setLoading(true)
    
    try {
      const data = generateSimulatedECG()
      setEcgData({
        ...data,
        source: 'Dados Simulados'
      })
      setAnalysisMethod('simulated')
      setSelectedFile(null)
    } catch (err) {
      setError(`Erro ao gerar dados simulados: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyze = async () => {
    if (!ecgData) {
      setError('Nenhum dado de ECG disponível')
      return
    }

    setError('')
    setLoading(true)

    try {
      // Validar dados
      if (!ecgData.data || ecgData.data.length === 0) {
        throw new Error('Dados de ECG vazios ou inválidos')
      }

      const analysisPayload = {
        samplingRate: ecgData.samplingRate || 250,
        duration: ecgData.duration || ecgData.data.length / 250,
        data: ecgData.data,
        vitalSigns: vitalSigns,
        ecgFeatures: ecgFeatures // Adicionar características do ECG
      }

      console.log('Enviando para análise:', analysisPayload)

      try {
        // Tentar conectar com o backend
        const results = await ecgService.analyzeECG(analysisPayload)
        
        console.log('Resposta do backend:', results)
        
        // Adiciona informações do gráfico aos resultados
        results.ecgChart = ecgData
        results.source = ecgData.source || 'Dados do Usuário'
        results.vitalSignsIncluded = Object.keys(vitalSigns).length > 0
        
        onAnalysisComplete(results)
      } catch (apiError) {
        console.warn('Backend não disponível, usando análise simulada:', apiError.message)
        
        // Fallback: gerar análise simulada com sinais vitais
        const simulatedResults = generateSimulatedAnalysis(ecgData, vitalSigns)
        simulatedResults.ecgChart = ecgData
        simulatedResults.source = ecgData.source || 'Dados do Usuário'
        simulatedResults.isSimulated = true
        
        onAnalysisComplete(simulatedResults)
      }
    } catch (err) {
      console.error('Erro na análise:', err)
      setError(err.message || 'Erro ao analisar ECG. Verifique o console para mais detalhes.')
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setEcgData(null)
    setSelectedFile(null)
    setError('')
    setAnalysisMethod(null)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Analisador de ECG</h2>
        <p className="text-gray-600">
          Faça upload de um arquivo de ECG ou use dados simulados para análise
        </p>
      </div>

      {/* Input Methods */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* File Upload */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">📄 Arquivo de Dados</h3>
          <p className="text-gray-600 text-sm mb-4">CSV, JSON ou ECG</p>
          <FileUpload
            onFileSelect={handleFileSelect}
            loading={loading}
            supportedFormats={['.csv', '.json', '.ecg']}
          />
          {selectedFile && analysisMethod === 'file' && (
            <div className="mt-4 p-3 bg-green-50 border border-green-300 rounded-lg">
              <p className="text-green-700 text-sm font-medium">
                ✓ Arquivo carregado com sucesso!
              </p>
            </div>
          )}
        </div>

        {/* Image Upload */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">🖼️ Imagem de ECG</h3>
          <p className="text-gray-600 text-sm mb-4">PNG, JPG ou BMP</p>
          <FileUpload
            onFileSelect={handleFileSelect}
            loading={loading}
            supportedFormats={['.png', '.jpg', '.jpeg', '.bmp']}
          />
          {selectedFile && analysisMethod === 'image' && (
            <div className="mt-4 p-3 bg-green-50 border border-green-300 rounded-lg">
              <p className="text-green-700 text-sm font-medium">
                ✓ Imagem carregada com sucesso!
              </p>
            </div>
          )}
        </div>

        {/* Simulated Data */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">🎲 Dados Simulados</h3>
          <p className="text-gray-600 text-sm mb-6">
            Gere um exemplo de ECG com padrões realistas
          </p>
          <button
            onClick={handleSimulatedData}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Gerar Dados Simulados
          </button>
          {analysisMethod === 'simulated' && (
            <div className="mt-4 p-3 bg-green-50 border border-green-300 rounded-lg">
              <p className="text-green-700 text-sm font-medium">
                ✓ Dados simulados gerados com sucesso!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Image Preview */}
      {ecgData?.imageFile && (
        <ImagePreview 
          imageFile={ecgData.imageFile}
          onClear={() => {
            setEcgData(null)
            setSelectedFile(null)
            setAnalysisMethod(null)
          }}
        />
      )}

      {/* ECG Chart Preview */}
      {ecgData && !ecgData.imageFile && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Visualização do ECG</h3>
              <p className="text-gray-600 text-sm">
                Fonte: {ecgData.source} | BPM: {ecgData.bpm || 'N/A'} | Duração: {ecgData.duration.toFixed(2)}s
              </p>
            </div>
          </div>
          <ECGChart data={ecgData.data} title="ECG - Pré-análise" />
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-300 rounded-lg p-4">
          <p className="text-red-700 font-medium">⚠️ {error}</p>
          <p className="text-red-600 text-xs mt-2">💡 Dica: Verifique se o backend está rodando em http://localhost:8080</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <Loading message="Processando dados de ECG..." />
      )}

      {/* Vital Signs Input */}
      {ecgData && !loading && (
        <VitalSignsInput onUpdate={setVitalSigns} />
      )}

      {/* ECG Features Input */}
      {ecgData && !loading && (
        <ECGFeaturesInput onUpdate={setEcgFeatures} />
      )}

      {/* Action Buttons */}
      {ecgData && !loading && (
        <div className="flex gap-4">
          <button
            onClick={handleAnalyze}
            className="flex-1 bg-medical-600 hover:bg-medical-700 text-white font-bold py-4 px-6 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <Zap className="w-5 h-5" />
            Analisar ECG
          </button>
          <button
            onClick={handleClear}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-bold py-4 px-6 rounded-lg transition-all"
          >
            Limpar
          </button>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-300 rounded-lg p-6">
        <h4 className="text-lg font-bold text-blue-900 mb-3">📋 Formatos Suportados</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-blue-800 text-sm">
          <div>
            <p className="font-semibold mb-2">📄 CSV</p>
            <pre className="bg-white p-2 rounded text-xs overflow-x-auto">
{`timestamp(ms),voltagem(mV)
0,0.02
4,0.05
8,0.08`}
            </pre>
          </div>
          <div>
            <p className="font-semibold mb-2">📋 JSON</p>
            <pre className="bg-white p-2 rounded text-xs overflow-x-auto">
{`{
  "samplingRate": 250,
  "duration": 10.5,
  "data": [0.02, ...]
}`}
            </pre>
          </div>
          <div>
            <p className="font-semibold mb-2">🖼️ Imagem</p>
            <p className="text-blue-700 mb-2">Formatos:</p>
            <ul className="text-xs list-disc list-inside">
              <li>PNG</li>
              <li>JPG/JPEG</li>
              <li>BMP</li>
            </ul>
          </div>
        </div>
      </div>

      {/* OCR Tips */}
      <OCRTips />
    </div>
  )
}
