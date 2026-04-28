import { 
  analyzeECG, 
  analyzeVitalSigns, 
  analyzeCombinedConditions 
} from '../models/diagnosticEngine.js'

export async function analyzeECGData(req, res) {
  try {
    const { samplingRate, duration, data, vitalSigns } = req.body

    if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(400).json({
        error: 'Dados de ECG inválidos',
        message: 'Array de dados vazio ou não fornecido'
      })
    }

    // Análise de ECG
    const ecgAnalysis = analyzeECG(data)

    // Análise de sinais vitais se fornecidos
    let vitalSignsAnalysis = { diagnoses: [] }
    let combinedAnalysis = { diagnoses: [] }

    if (vitalSigns && Object.keys(vitalSigns).length > 0) {
      vitalSignsAnalysis = analyzeVitalSigns(vitalSigns)
      combinedAnalysis = analyzeCombinedConditions(ecgAnalysis, vitalSigns)
    }

    // Combinar todos os diagnósticos
    const allDiagnoses = [
      ...ecgAnalysis.diagnoses,
      ...vitalSignsAnalysis.diagnoses,
      ...combinedAnalysis.diagnoses
    ]

    // Remover duplicatas
    const uniqueDiagnoses = []
    const seenNames = new Set()
    for (const diagnosis of allDiagnoses) {
      if (!seenNames.has(diagnosis.name)) {
        uniqueDiagnoses.push(diagnosis)
        seenNames.add(diagnosis.name)
      }
    }

    // Ordenar por severidade
    const severityOrder = { critical: 0, warning: 1, info: 2, normal: 3 }
    uniqueDiagnoses.sort((a, b) => 
      (severityOrder[a.severity] || 4) - (severityOrder[b.severity] || 4)
    )

    // Determinar risco geral
    const hasCritical = uniqueDiagnoses.some(d => d.severity === 'critical')
    const hasWarning = uniqueDiagnoses.some(d => d.severity === 'warning')
    const overallSeverity = hasCritical ? 'critical' : hasWarning ? 'warning' : 'normal'
    const riskLevel = hasCritical ? 'high' : hasWarning ? 'medium' : 'low'

    // Gerar interpretação
    const interpretation = generateInterpretation(uniqueDiagnoses, vitalSigns)

    // Gerar recomendações
    const recommendations = generateRecommendations(uniqueDiagnoses, vitalSigns)

    // Resposta completa
    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      analysis: {
        bpm: ecgAnalysis.bpm,
        rhythm: ecgAnalysis.rhythm,
        qt: ecgAnalysis.qtInterval,
        pr: ecgAnalysis.prInterval,
        qrs: ecgAnalysis.qrsWidth
      },
      vitalSigns: vitalSigns || {},
      diagnoses: uniqueDiagnoses,
      interpretation: interpretation,
      recommendations: recommendations,
      overallSeverity: overallSeverity,
      riskLevel: riskLevel,
      vitalSignsIncluded: vitalSigns && Object.keys(vitalSigns).length > 0,
      ecgChart: {
        data: data,
        samplingRate: samplingRate || 250,
        duration: duration || (data.length / 250)
      },
      source: 'Backend Node.js'
    }

    res.json(result)
  } catch (error) {
    console.error('Erro na análise de ECG:', error)
    res.status(500).json({
      error: 'Erro ao processar ECG',
      message: error.message
    })
  }
}

export async function getSimulatedData(req, res) {
  try {
    // Gerar dados simulados de ECG
    const samplingRate = 250 // Hz
    const duration = 10 // segundos
    const dataPoints = samplingRate * duration

    const ecgData = []
    for (let i = 0; i < dataPoints; i++) {
      const t = i / samplingRate
      // Padrão realista de ECG com complexo QRS
      const baseline = 0.1
      const heartbeat = (t % 1) < 0.3 ? Math.sin((t % 1) * Math.PI / 0.3) * 0.3 : 0
      const noise = (Math.random() - 0.5) * 0.05
      const value = baseline + heartbeat + noise
      ecgData.push(value)
    }

    res.json({
      success: true,
      samplingRate: samplingRate,
      duration: duration,
      data: ecgData,
      message: 'Dados simulados gerados com sucesso'
    })
  } catch (error) {
    console.error('Erro ao gerar dados simulados:', error)
    res.status(500).json({
      error: 'Erro ao gerar dados simulados',
      message: error.message
    })
  }
}

function generateInterpretation(diagnoses, vitalSigns) {
  if (!diagnoses || diagnoses.length === 0) {
    return 'Análise dentro dos parâmetros normais. Continue com acompanhamento regular.'
  }

  const criticalDiags = diagnoses.filter(d => d.severity === 'critical')
  const warningDiags = diagnoses.filter(d => d.severity === 'warning')

  let interpretation = ''

  if (criticalDiags.length > 0) {
    interpretation += `⚠️ CRÍTICO: ${criticalDiags.map(d => d.name).join(', ')} detectados. `
  }

  if (warningDiags.length > 0) {
    interpretation += `⚠️ ATENÇÃO: ${warningDiags.map(d => d.name).join(', ')} detectados. `
  }

  if (vitalSigns && Object.keys(vitalSigns).length > 0) {
    interpretation += `Sinais vitais adicionais foram considerados na análise. `
  }

  interpretation += 'Esta análise é informativa. Consulte um cardiologista para diagnóstico definitivo.'

  return interpretation
}

function generateRecommendations(diagnoses, vitalSigns) {
  const recommendations = []

  // Recomendações básicas
  recommendations.push('Acompanhamento regular com cardiologista')

  // Recomendações por diagnóstico
  const criticalDiags = diagnoses.filter(d => d.severity === 'critical')
  if (criticalDiags.length > 0) {
    recommendations.push('Buscar atendimento médico de emergência')
  }

  // Recomendações por sinais vitais
  if (vitalSigns) {
    if (vitalSigns.spO2 && Number(vitalSigns.spO2) < 92) {
      recommendations.push('Avaliar função respiratória')
    }
    if (vitalSigns.temperature && Number(vitalSigns.temperature) > 38) {
      recommendations.push('Investigar possível infecção')
    }
    if (vitalSigns.systolic && Number(vitalSigns.systolic) > 140) {
      recommendations.push('Intensificar tratamento anti-hipertensivo')
    }
  }

  // Adicionar recomendações específicas dos diagnósticos
  const specificRecs = [...new Set(diagnoses
    .filter(d => d.recommendation)
    .map(d => d.recommendation))]
  
  recommendations.push(...specificRecs)

  // Recomendação final
  recommendations.push('Manter monitoramento regular dos sinais vitais')
  recommendations.push('Relatar qualquer mudança anormal ao médico')

  return recommendations
}
