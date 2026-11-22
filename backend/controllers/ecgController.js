import ECGService, { PYTHON_API_BASE_URL } from '../services/ecgService.js'
import { validateECGData, validateVitalSigns } from '../validators/ecgValidator.js'
import logger from '../utils/logger.js'
import axios from 'axios'

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

    // Executar análise (motor de regras + IA de MIT-BIH, com fallback)
    const result = await ECGService.analyzeECGData(req.body)

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
 * Listar registros do banco MIT-BIH (delegado à API Python)
 * GET /api/ecg/mitdb/records
 */
export async function getMitDbRecords(req, res) {
  try {
    const response = await axios.get(`${PYTHON_API_BASE_URL}/records`, { timeout: 10000 })
    res.json(response.data)
  } catch (error) {
    logger.error('Erro ao listar registros do MIT-BIH', error)
    res.status(502).json({
      success: false,
      error: 'API Python de MIT-BIH não disponível',
      message: error.message,
      timestamp: new Date().toISOString()
    })
  }
}

/**
 * Obter sinal bruto de um registro do banco MIT-BIH (delegado à API Python)
 * GET /api/ecg/mitdb/record/:record_name
 */
export async function getMitDbRecord(req, res) {
  try {
    const { record_name: recordName } = req.params
    const response = await axios.get(
      `${PYTHON_API_BASE_URL}/record/${encodeURIComponent(recordName)}`,
      { timeout: 30000 }
    )
    res.json(response.data)
  } catch (error) {
    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        error: 'Registro não encontrado no banco MIT-BIH'
      })
    }
    logger.error('Erro ao ler registro do MIT-BIH', error)
    res.status(502).json({
      success: false,
      error: 'API Python de MIT-BIH não disponível',
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
