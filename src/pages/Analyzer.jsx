import React, { useState, useEffect } from 'react'
import { Zap, RefreshCw, Image } from 'lucide-react'
import FileUpload from '../components/FileUpload'
import ImagePreview from '../components/ImagePreview'
import OCRTips from '../components/OCRTips'
import ECGChart from '../components/ECGChart'
import ECG12LeadChart from '../components/ECG12LeadChart'
import Loading from '../components/Loading'
import VitalSignsInput from '../components/VitalSignsInput'
import ECGFeaturesInput from '../components/ECGFeaturesInput'
import { ecgService, generateSimulatedECG, extractECGFromImage, extract12LeadECGFromImage, mitDbService } from '../services/api'
import { analyzeDiagnosis } from '../services/diagnosticEngine'
import diagnosticEngine from '../services/diagnosticEngine'
const { analyzeIschemia } = diagnosticEngine

const normalizeECGValues = (values) => (
  Array.isArray(values)
    ? values.map((value) => Number(value)).filter((value) => Number.isFinite(value))
    : []
)

// Função para gerar análise simulada (fallback quando backend não responde)
const generateSimulatedAnalysis = (ecgData, vitalSigns = {}, ecgFeatures = {}) => {
  // Para 12 derivações, usar a derivação I como principal para análise
  const ecgInput = ecgData.is12Lead
    ? { ...ecgData, data: ecgData.leads?.I || ecgData.leads?.[Object.keys(ecgData.leads)[0]] || [] }
    : ecgData

  const advancedAnalysis = analyzeDiagnosis(ecgInput, vitalSigns, ecgFeatures)

  const result = {
    bpm: ecgData.bpm || 72,
    rhythm: ecgData.rhythm || 'Sinusal Normal',
    pr: ecgData.pr || 160,
    qrs: ecgData.qrs || 80,
    qt: ecgData.qt || 400,
    interpretation: advancedAnalysis.summaryInterpretation,
    recommendations: advancedAnalysis.recommendations,
    diagnoses: advancedAnalysis.diagnoses,
    riskLevel: advancedAnalysis.riskLevel,
    vitalSignsIncluded: Object.keys(vitalSigns).length > 0,
    stSegmentIndices: advancedAnalysis.stSegmentIndices || []
  }

  if (ecgData.is12Lead) {
    result.is12Lead = true
    result.leads = ecgData.leads
  }

  return result
}

export default function Analyzer({ onAnalysisComplete }) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [ecgData, setEcgData] = useState(null)
  const [vitalSigns, setVitalSigns] = useState({})
  const [ecgFeatures, setEcgFeatures] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [analysisMethod, setAnalysisMethod] = useState(null) // 'file', 'simulated'
  const [mitDbRecords, setMitDbRecords] = useState([])
  const [mitDbRecordName, setMitDbRecordName] = useState('100')

  // Carrega os registros disponíveis do banco MIT-BIH (PhysioNet) ao montar a página
  useEffect(() => {
    let cancelled = false
    mitDbService.getRecords()
      .then((data) => {
        if (!cancelled && Array.isArray(data?.records) && data.records.length > 0) {
          setMitDbRecords(data.records)
        } else {
          setMitDbRecords([])
          setError('Nenhum registro do MIT-BIH encontrado. Certifique-se de que o backend Python está rodando em http://localhost:8000')
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMitDbRecords([])
          setError('Erro ao carregar registros do MIT-BIH. Verifique se o backend está rodando.')
        }
      })
    return () => { cancelled = true }
  }, [])

  const handleFileSelect = async (file) => {
    setSelectedFile(file)
    setError('')
    
    try {
      setLoading(true)
      
      // Se é uma imagem (ECG)
      if (['image/png', 'image/jpeg', 'image/jpg', 'image/bmp'].includes(file.type) || 
          /\.(png|jpg|jpeg|bmp)$/i.test(file.name)) {
        try {
          // Tentar extrair 12 derivações primeiro
          const [multiLeadData, singleLeadData] = await Promise.allSettled([
            extract12LeadECGFromImage(file),
            extractECGFromImage(file)
          ])

          const multiOk = multiLeadData.status === 'fulfilled' &&
            multiLeadData.value?.leads &&
            Object.keys(multiLeadData.value.leads).length >= 6

          const singleOk = singleLeadData.status === 'fulfilled' &&
            singleLeadData.value?.data?.length > 200

          if (multiOk) {
            setEcgData({
              leads: multiLeadData.value.leads,
              data: singleOk ? singleLeadData.value.data : 
                multiLeadData.value.leads[Object.keys(multiLeadData.value.leads)[0]],
              samplingRate: multiLeadData.value.samplingRate || 250,
              duration: singleOk
                ? singleLeadData.value.data.length / 250
                : multiLeadData.value.leads[Object.keys(multiLeadData.value.leads)[0]].length / 250,
              source: file.name,
              imageFile: file,
              isImage: true,
              is12Lead: true
            })
            setAnalysisMethod('image')
          } else if (singleOk) {
            setEcgData({
              data: singleLeadData.value.data,
              samplingRate: singleLeadData.value.samplingRate || 250,
              duration: singleLeadData.value.duration || singleLeadData.value.data.length / 250,
              source: file.name,
              imageFile: file,
              isImage: true
            })
            setAnalysisMethod('image')
          } else {
            throw new Error('Não foi possível extrair dados da imagem')
          }
        } catch (err) {
          try {
            // Fallback final: dados simulados
            const fallbackData = generateSimulatedECG()
            setEcgData({
              ...fallbackData,
              source: `Imagem: ${file.name}`,
              imageFile: file,
              isImage: true
            })
            setAnalysisMethod('image')
          } catch (fallbackErr) {
            setError(`Erro ao processar imagem: ${err.message}`)
          }
        }
      }
      // Se é um arquivo CSV ou texto
      else if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        const text = await file.text()
        const lines = text.trim().split(/\r?\n/).filter((line) => line.trim())
        const data = lines.flatMap((line, index) => {
          const columns = line.split(',').map((column) => column.trim())
          if (index === 0 && columns.length === 2 && !Number.isFinite(Number(columns[1]))) {
            return []
          }
          const voltage = columns.length === 1 ? Number(columns[0]) : Number(columns[1])
          return Number.isFinite(voltage) ? [voltage] : []
        })

        if (data.length === 0) {
          throw new Error('O arquivo CSV não contém valores ECG numéricos')
        }
        
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

        if (parsed.leads && typeof parsed.leads === 'object') {
          const leads = {}
          Object.entries(parsed.leads).forEach(([name, values]) => {
            const normalized = normalizeECGValues(values)
            if (normalized.length > 0) leads[name] = normalized
          })
          const leadNames = Object.keys(leads)
          if (leadNames.length === 0) {
            throw new Error('O arquivo JSON não contém derivações ECG válidas')
          }
          setEcgData({
            ...parsed,
            leads,
            data: leads.I || leads[leadNames[0]],
            samplingRate: parsed.samplingRate || 250,
            duration: parsed.duration || leads.I?.length / 250 || leads[leadNames[0]].length / 250,
            is12Lead: true,
            source: file.name
          })
        } else {
          const data = normalizeECGValues(parsed.data)
          if (data.length === 0) {
            throw new Error('O arquivo JSON não contém dados ECG numéricos')
          }
          setEcgData({
            ...parsed,
            data,
            samplingRate: parsed.samplingRate || 250,
            duration: parsed.duration || data.length / 250,
            source: file.name
          })
        }
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

  const handleAnalyze = async (ecgDataOverride = null) => {
    const ecg = ecgDataOverride || ecgData
    if (!ecg) {
      setError('Nenhum dado de ECG disponível')
      return
    }

    setError('')
    setLoading(true)

    try {
      // Validar dados
      if (ecg.is12Lead) {
        const normalizedLeads = {}
        if (ecg.leads) {
          Object.entries(ecg.leads).forEach(([name, values]) => {
            const normalized = normalizeECGValues(values)
            if (normalized.length > 0) normalizedLeads[name] = normalized
          })
        }
        if (Object.keys(normalizedLeads).length === 0) {
          throw new Error('Dados de ECG (12 derivações) vazios ou inválidos')
        }
        ecg.leads = normalizedLeads
        if (!ecg.data || ecg.data.length === 0) {
          ecg.data = normalizedLeads.I || normalizedLeads[Object.keys(normalizedLeads)[0]]
        }
      } else {
        ecg.data = normalizeECGValues(ecg.data)
        if (ecg.data.length === 0) {
          throw new Error('Dados de ECG vazios ou inválidos')
        }
      }

      const primaryData = ecg.data && ecg.data.length > 200
        ? ecg.data
        : (ecg.is12Lead
          ? (ecg.leads.I || ecg.leads[Object.keys(ecg.leads)[0]] || [])
          : ecg.data || [])

      const analysisPayload = {
        samplingRate: ecg.samplingRate || 250,
        duration: ecg.duration || primaryData.length / 250,
        data: primaryData,
        vitalSigns: vitalSigns,
        ecgFeatures: ecgFeatures
      }

      console.log('Enviando para análise:', analysisPayload)

      try {
        // Tentar conectar com o backend
        const results = await ecgService.analyzeECG(analysisPayload)
        
        console.log('Resposta do backend:', results)
        
        // Adiciona informações do gráfico aos resultados
        results.ecgChart = ecg
        results.source = ecg.source || 'Dados do Usuário'
        results.vitalSignsIncluded = Object.keys(vitalSigns).length > 0
        if (ecg.is12Lead) {
          results.is12Lead = true
          results.leads = ecg.leads
        }

        // Rodar análise de isquemia local (frontend) independente do backend
        const ecgInput = { data: primaryData, samplingRate: ecg.samplingRate || 250 }
        const localIschemia = analyzeIschemia(ecgInput, ecgFeatures)

        // Se o frontend detectou isquemia/infarto e o backend não, mesclar
        const hasSTEMI = results.diagnoses?.some(d =>
          d.name?.toLowerCase().includes('stemi') || d.name?.toLowerCase().includes('supra st'))
        const hasNSTEMI = results.diagnoses?.some(d =>
          d.name?.toLowerCase().includes('nstemi') || d.name?.toLowerCase().includes('infra'))
        const hasIschemia = results.diagnoses?.some(d =>
          d.name?.toLowerCase().includes('isquemi'))

        if (localIschemia.diagnoses?.length > 0 && !hasSTEMI && !hasNSTEMI && !hasIschemia) {
          results.diagnoses = [...(results.diagnoses || []), ...localIschemia.diagnoses]
          results.diagnoses.sort((a, b) => {
            const order = { critical: 0, danger: 1, warning: 2, attention: 3, normal: 4 }
            return (order[a.severity] || 4) - (order[b.severity] || 4)
          })
          if (localIschemia.severity === 'critical') results.overallSeverity = 'critical'
          if (localIschemia.riskLevel === 'high') results.riskLevel = 'high'
        }

        // Garantir stSegmentIndices para o overlay do gráfico
        if (!results.stSegmentIndices || results.stSegmentIndices.length === 0) {
          results.stSegmentIndices = localIschemia.stSegmentIndices || []
        }
        
        onAnalysisComplete(results)
      } catch (apiError) {
        console.warn('Backend não disponível, usando análise simulada:', apiError.message)
        
        // Fallback: gerar análise simulada com sinais vitais e características
        const simulatedResults = generateSimulatedAnalysis(ecg, vitalSigns, ecgFeatures)
        simulatedResults.ecgChart = ecg
        simulatedResults.source = ecg.source || 'Dados do Usuário'
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

  // Analisar registro do banco MIT-BIH (PhysioNet)
  const handleAnalyzeMitDb = async () => {
    setError('')
    setLoading(true)
    try {
      const record = await mitDbService.getRecord(mitDbRecordName)
      if (!record || !record.data || record.data.length === 0) {
        throw new Error(`Registro "${mitDbRecordName}" não encontrado no banco MIT-BIH`)
      }
      const mitDbData = {
        data: record.data,
        samplingRate: record.sampling_rate || 250,
        duration: record.duration || record.data.length / 250,
        source: record.source || `MIT-BIH Arrhythmia Database - registro ${record.record || mitDbRecordName}`
      }
      setEcgData(mitDbData)
      // Executar a análise completa (motor + IA) sobre o registro do MIT-BIH
      await handleAnalyze(mitDbData)
    } catch (err) {
      console.error('Erro ao analisar registro do MIT-BIH:', err)
      setError(`Erro ao analisar registro do MIT-BIH: ${err.message}`)
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
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Analisador de ECG</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Faça upload de um arquivo de ECG ou use dados simulados para análise
        </p>
      </div>

      {/* Input Methods */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* File Upload */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">📄 Arquivo de Dados</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">CSV, JSON ou ECG</p>
          <FileUpload
            onFileSelect={handleFileSelect}
            loading={loading}
            supportedFormats={['.csv', '.json', '.ecg']}
          />
          {selectedFile && analysisMethod === 'file' && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-800 rounded-lg">
              <p className="text-green-700 dark:text-green-100 text-sm font-medium">
                ✓ Arquivo carregado com sucesso!
              </p>
            </div>
          )}
        </div>

        {/* Image Upload */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">🖼️ Imagem de ECG</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">PNG, JPG ou BMP</p>
          <FileUpload
            onFileSelect={handleFileSelect}
            loading={loading}
            supportedFormats={['.png', '.jpg', '.jpeg', '.bmp']}
          />
          {selectedFile && analysisMethod === 'image' && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-800 rounded-lg">
              <p className="text-green-700 dark:text-green-100 text-sm font-medium">
                ✓ Imagem carregada com sucesso!
              </p>
            </div>
          )}
        </div>

        {/* Simulated Data */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">🎲 Dados Simulados</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
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
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-gray-800 rounded-lg">
              <p className="text-green-700 dark:text-green-100 text-sm font-medium">
                ✓ Dados simulados gerados com sucesso!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Banco MIT-BIH Arrhythmia Database */}
      {mitDbRecords.length === 0 && !error?.includes('MIT-BIH') && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg p-4 mb-4">
          <p className="text-yellow-800 dark:text-yellow-200 text-sm">
            💡 <strong>MIT-BIH não disponível</strong> - Para usar o banco MIT-BIH, inicie o backend Python:
          </p>
          <p className="text-yellow-700 dark:text-yellow-100 text-xs mt-1">
            `cd backend-python && uvicorn src.api:app --port 8000`
          </p>
        </div>
      )}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">🧬 MIT-BIH Arrhythmia Database</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
          Registros do banco MIT-BIH (PhysioNet) - ECG real da base de arritmias
        </p>
        {mitDbRecords.length === 0 && error && (
          <p className="text-red-600 dark:text-red-400 text-sm mb-4">
            ❌ {error}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={mitDbRecordName}
            onChange={(e) => setMitDbRecordName(e.target.value)}
            disabled={mitDbRecords.length === 0}
            className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100"
          >
            {mitDbRecords.length === 0 ? (
              <option disabled>Registros do MIT-BIH não disponíveis...</option>
            ) : (
              mitDbRecords.map((record) => (
                <option key={record} value={record}>Registro {record}</option>
              ))
            )}
          </select>
          <button
            onClick={handleAnalyzeMitDb}
            disabled={mitDbRecords.length === 0}
            className="flex-1 bg-medical-600 hover:bg-medical-700 text-white font-bold py-2 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Analisar no MIT-BIH
          </button>
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
      {ecgData && !ecgData.imageFile && !ecgData.is12Lead && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Visualização do ECG</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Fonte: {ecgData.source} | BPM: {ecgData.bpm || 'N/A'} | Duração: {ecgData.duration.toFixed(2)}s
              </p>
            </div>
          </div>
          <ECGChart data={ecgData.data} title="ECG - Pré-análise" />
        </div>
      )}

      {/* 12-Lead ECG Preview */}
      {ecgData && ecgData.is12Lead && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">ECG 12 Derivações</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Fonte: {ecgData.source} | {Object.keys(ecgData.leads).length} derivações detectadas
              </p>
            </div>
          </div>
          <ECG12LeadChart leads={ecgData.leads} title="ECG 12 Derivações - Pré-análise" />
        </div>
      )}

      {/* Error Display */}
      {error && error.includes('Backend') && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-700 dark:text-red-100 font-medium">⚠️ {error}</p>
          <p className="text-red-600 dark:text-red-400 text-xs mt-2">💡 Dica: Inicie o backend Node com `cd backend && npm run dev`</p>
        </div>
      )}
      {error && !error.includes('Backend') && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-700 dark:text-red-100 font-medium">⚠️ {error}</p>
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
            className="flex-1 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-900 dark:text-gray-100 font-bold py-4 px-6 rounded-lg transition-all"
          >
            Limpar
          </button>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-800 rounded-lg p-6">
        <h4 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-3">📋 Formatos Suportados</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-blue-800 dark:text-blue-200 text-sm">
          <div>
            <p className="font-semibold mb-2">📄 CSV</p>
            <pre className="bg-white dark:bg-gray-700 p-2 rounded text-xs overflow-x-auto dark:text-gray-100">
{`timestamp(ms),voltagem(mV)
0,0.02
4,0.05
8,0.08`}
            </pre>
          </div>
          <div>
            <p className="font-semibold mb-2">📋 JSON</p>
            <pre className="bg-white dark:bg-gray-700 p-2 rounded text-xs overflow-x-auto dark:text-gray-100">
{`{
  "samplingRate": 250,
  "duration": 10.5,
  "data": [0.02, ...]
}`}
            </pre>
          </div>
          <div>
            <p className="font-semibold mb-2">🖼️ Imagem</p>
             <p className="text-blue-700 dark:text-blue-300 mb-2">Formatos:</p>
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
