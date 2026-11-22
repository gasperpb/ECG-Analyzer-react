/**
 * Serviço de análise de ECG
 * Encapsula toda lógica de negócio
 */

import axios from 'axios'

import {
  analyzeECG,
  analyzeVitalSigns,
  analyzeCombinedConditions,
  analyzeECGFeatures
} from '../models/diagnosticEngine.js'
import { SEVERITY_LEVELS, SEVERITY_ORDER } from '../constants/severity.js'
import { generateInterpretation, generateRecommendations } from '../utils/diagnosticHelpers.js'
import logger from '../utils/logger.js'

export const PYTHON_API_BASE_URL = process.env.PYTHON_API_URL || 'http://localhost:8000'

export class ECGService {
  /**
   * Analisa dados de ECG com sinais vitais opcionais
   * (motor de regras + IA treinada com o banco MIT-BIH)
   */
  static async analyzeECGData(payload) {
    // 1) Motor de diagnóstico atual (regras)
    const currentEngine = this._analyzeWithEngineRules(payload)

    // 2) API Python de IA (Random Forest treinado no MIT-BIH)
    const aiEngine = await this._callAIPython(payload)

    // 3) Combinar resultado da IA com o resultado do motor
    const finalDiagnosis = aiEngine
      ? this._combineWithAI(currentEngine, aiEngine)
      : currentEngine

    return {
      ...currentEngine,
      currentEngine,
      aiEngine,
      finalDiagnosis
    }
  }

  /**
   * Motor de diagnóstico baseado em regras (já existente, sem alterações)
   */
  static _analyzeWithEngineRules(payload) {
    const { samplingRate, duration, data, vitalSigns, ecgFeatures } = payload

    // Análise de ECG a partir dos dados
    const ecgAnalysis = analyzeECG(data, { samplingRate, duration })

    // Análise de características observadas pelo utilizador
    let featuresAnalysis = { diagnoses: [] }
    if (ecgFeatures && Object.values(ecgFeatures).some(v => v === true)) {
      featuresAnalysis = analyzeECGFeatures(ecgFeatures, ecgAnalysis, vitalSigns)
    }

    // Análise de sinais vitais se fornecidos
    let vitalSignsAnalysis = { diagnoses: [] }
    let combinedAnalysis = { diagnoses: [] }

    if (vitalSigns && Object.keys(vitalSigns).length > 0) {
      vitalSignsAnalysis = analyzeVitalSigns(vitalSigns)
      combinedAnalysis = analyzeCombinedConditions(ecgAnalysis, vitalSigns, ecgFeatures || {})
    }

    // Combinar todos os diagnósticos
    const allDiagnoses = [
      ...ecgAnalysis.diagnoses,
      ...featuresAnalysis.diagnoses,
      ...vitalSignsAnalysis.diagnoses,
      ...combinedAnalysis.diagnoses
    ]

    // Remover duplicatas
    const uniqueDiagnoses = this._removeDuplicateDiagnoses(allDiagnoses)

    // Ordenar por severidade
    uniqueDiagnoses.sort((a, b) =>
      (SEVERITY_ORDER[a.severity] || 4) - (SEVERITY_ORDER[b.severity] || 4)
    )

    // Determinar risco geral
    const severityInfo = this._calculateOverallSeverity(uniqueDiagnoses)

    // Gerar interpretação e recomendações
    const interpretation = generateInterpretation(uniqueDiagnoses, vitalSigns)
    const recommendations = generateRecommendations(uniqueDiagnoses, vitalSigns)

    // Resposta completa
    return {
      success: true,
      timestamp: new Date().toISOString(),
      analysis: {
        bpm: ecgAnalysis.bpm,
        rhythm: ecgAnalysis.rhythm,
        qt: ecgAnalysis.qtInterval,
        qtc: ecgAnalysis.qtcInterval,
        pr: ecgAnalysis.prInterval,
        qrs: ecgAnalysis.qrsWidth,
        beatCount: ecgAnalysis.beatCount
      },
      vitalSigns: vitalSigns || {},
      diagnoses: uniqueDiagnoses,
      interpretation,
      recommendations,
      overallSeverity: severityInfo.severity,
      riskLevel: severityInfo.riskLevel,
      vitalSignsIncluded: vitalSigns && Object.keys(vitalSigns).length > 0,
      potassium: vitalSigns?.potassium || null,
      stSegmentIndices: ecgAnalysis.stSegmentIndices || [],
      ecgChart: {
        data,
        samplingRate: samplingRate || 250,
        duration: duration || (data.length / 250)
      },
      source: 'Backend Node.js'
    }
  }

  /**
   * Chamada à API Python de IA (FastAPI + Random Forest treinado com MIT-BIH)
   * Retorna null quando a API não está disponível (fallback para o motor de regras)
   */
  static async _callAIPython(payload) {
    const data = payload?.data
    if (!Array.isArray(data) || data.length === 0) {
      return null
    }
    try {
      const response = await axios.post(
        `${PYTHON_API_BASE_URL}/predict`,
        { data, sampling_rate: payload?.samplingRate },
        { timeout: 10000 }
      )
      return response.data
    } catch (error) {
      logger.warn(`API Python de IA não disponível, continuando com o motor de regras: ${error.message}`)
      return null
    }
  }

  /**
   * Combina resultado da IA (MIT-BIH) com resultado do motor de regras
   * Formato: { currentEngine, aiEngine, finalDiagnosis }
   */
  static _combineWithAI(currentEngine, aiEngine) {
    return {
      ...currentEngine,
      aiEngine,
      aiDiagnosis: {
        name: aiEngine.prediction,
        severity: aiEngine.prediction === 'Normal' ? 'normal' : 'warning',
        description: `Classificação da IA (MIT-BIH): ${aiEngine.prediction}`,
        confidence: aiEngine.confidence,
        bpm: aiEngine.bpm,
        rrInterval: aiEngine.rr_interval,
        qrsDuration: aiEngine.qrs_duration
      }
    }
  }

  /**
   * Remove diagnósticos duplicados
   */
  static _removeDuplicateDiagnoses(diagnoses) {
    const uniqueDiagnoses = []
    const seenNames = new Set()
    for (const diagnosis of diagnoses) {
      if (!seenNames.has(diagnosis.name)) {
        uniqueDiagnoses.push(diagnosis)
        seenNames.add(diagnosis.name)
      }
    }
    return uniqueDiagnoses
  }

  /**
   * Calcula severidade geral
   */
  static _calculateOverallSeverity(diagnoses) {
    const hasCritical = diagnoses.some(d => d.severity === SEVERITY_LEVELS.CRITICAL)
    const hasWarning = diagnoses.some(d => d.severity === SEVERITY_LEVELS.WARNING)

    const severity = hasCritical
      ? SEVERITY_LEVELS.CRITICAL
      : hasWarning
        ? SEVERITY_LEVELS.WARNING
        : SEVERITY_LEVELS.NORMAL

    const riskLevel = hasCritical ? 'high' : hasWarning ? 'medium' : 'low'

    return { severity, riskLevel }
  }

  /**
   * Gera dados simulados de ECG
   */
  static generateSimulatedData(samplingRate = 250, duration = 10) {
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

    return {
      success: true,
      samplingRate,
      duration,
      data: ecgData,
      dataPoints,
      message: 'Dados simulados gerados com sucesso',
      timestamp: new Date().toISOString()
    }
  }
}

export default ECGService
