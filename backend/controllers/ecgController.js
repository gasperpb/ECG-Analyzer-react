import ECGService, { PYTHON_API_BASE_URL } from '../services/ecgService.js'
import { validateECGData, validateVitalSigns } from '../validators/ecgValidator.js'
import logger from '../utils/logger.js'
import axios from 'axios'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const controllerDir = path.dirname(fileURLToPath(import.meta.url))
const mitDbDataDir = path.resolve(controllerDir, '../../backend-python/data/mitdb')

function findMitDbDataDir() {
  const candidates = [
    mitDbDataDir,
    path.resolve(process.cwd(), 'backend-python/data/mitdb'),
    path.resolve(process.cwd(), 'data/mitdb')
  ]
  return candidates.find((candidate) => fs.existsSync(candidate)) || null
}

function parseMitDbRecord(recordName, dataDir) {
  const basePath = path.join(dataDir, recordName)
  if (!fs.existsSync(`${basePath}.hea`) || !fs.existsSync(`${basePath}.dat`)) {
    return null
  }

  const headerLines = fs.readFileSync(`${basePath}.hea`, 'utf8').trim().split(/\r?\n/)
  const recordHeader = headerLines[0].trim().split(/\s+/)
  const fsValue = recordHeader[2] ? Number(recordHeader[2]) : 360

  const channelHeader = headerLines.slice(1).find((line) => line.trim() && !line.startsWith('#'))
  const channelFields = channelHeader?.trim().split(/\s+/) || []
  const gain = Number(channelFields[2]) || 200
  const baseline = Number(channelFields[4]) || 0

  const raw = fs.readFileSync(`${basePath}.dat`)
  const sampleCount = Math.floor(raw.length / 3)
  const values = new Array(sampleCount)

  for (let i = 0, byteOffset = 0; i < sampleCount; byteOffset += 3, i += 1) {
    const b0 = raw[byteOffset]
    const b1 = raw[byteOffset + 1]
    const b2 = raw[byteOffset + 2]
    if (b2 === undefined) break

    const rawFirst = (b1 & 0x0f) << 8 | b0
    values[i] = (rawFirst & 0x3ff) / gain
  }

  values.length = sampleCount
  const first10Seconds = Math.min(values.length, Math.round(fsValue * 10))
  const data = values.slice(0, first10Seconds).map((value) => Number((value - baseline / gain).toFixed(5)))

  return {
    record: recordName,
    data,
    sampling_rate: fsValue,
    duration: data.length / fsValue,
    source: `MIT-BIH Arrhythmia Database - registro ${recordName}`
  }
}

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
  const dataDir = findMitDbDataDir()
  if (dataDir) {
    const records = fs.readdirSync(dataDir)
      .filter((name) => name.endsWith('.dat'))
      .map((name) => path.basename(name, '.dat'))
      .sort()
    if (records.length > 0) {
      return res.json({ records })
    }
  }

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
  const dataDir = findMitDbDataDir()
  if (dataDir) {
    const record = parseMitDbRecord(req.params.record_name, dataDir)
    if (record) {
      return res.json(record)
    }
  }

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
