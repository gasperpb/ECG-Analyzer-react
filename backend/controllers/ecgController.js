import ECGService from '../services/ecgService.js'
import { validateECGData, validateVitalSigns } from '../validators/ecgValidator.js'
import logger from '../utils/logger.js'

/**
 * Analisar dados de ECG
 * POST /api/ecg/analyze
 */
export async function analyzeECGData(req, res) {
  try {
    // Validar requisição
    const validation = validateECGData(req.body)
    if (!validation.valid) {
      logger.warn(`Validação falhou: ${validation.errors.join(', ')}`)
      return res.status(400).json({
        success: false,
        error: 'Dados de ECG inválidos',
        errors: validation.errors,
        timestamp: new Date().toISOString()
      })
    }

    // Validar sinais vitais se fornecidos
    if (req.body.vitalSigns) {
      const vitalSignsValidation = validateVitalSigns(req.body.vitalSigns)
      if (!vitalSignsValidation.valid) {
        logger.warn(`Validação de sinais vitais falhou: ${vitalSignsValidation.errors.join(', ')}`)
        return res.status(400).json({
          success: false,
          error: 'Sinais vitais inválidos',
          errors: vitalSignsValidation.errors,
          timestamp: new Date().toISOString()
        })
      }
    }

    // Executar análise
    const result = ECGService.analyzeECGData(req.body)

    logger.success(`ECG analisado com sucesso - ${result.diagnoses.length} diagnósticos`)
    res.json(result)
  } catch (error) {
    logger.error('Erro na análise de ECG', error)
    res.status(500).json({
      success: false,
      error: 'Erro ao processar ECG',
      message: error.message,
      timestamp: new Date().toISOString()
    })
  }
}

/**
 * Obter dados simulados de ECG
 * GET /api/ecg/simulated
 */
export function getSimulatedData(req, res) {
  try {
    const samplingRate = parseInt(req.query.samplingRate) || 250
    const duration = parseInt(req.query.duration) || 10

    const result = ECGService.generateSimulatedData(samplingRate, duration)
    logger.success(`Dados simulados gerados - ${result.dataPoints} pontos`)
    res.json(result)
  } catch (error) {
    logger.error('Erro ao gerar dados simulados', error)
    res.status(500).json({
      success: false,
      error: 'Erro ao gerar dados simulados',
      message: error.message,
      timestamp: new Date().toISOString()
    })
  }
}
