import express from 'express'
import { analyzeECGData, getSimulatedData } from '../controllers/ecgController.js'

const router = express.Router()

/**
 * POST /api/ecg/analyze
 * Analisa dados de ECG com sinais vitais opcionais
 * 
 * Body:
 * {
 *   samplingRate: number,
 *   duration: number,
 *   data: number[],
 *   vitalSigns?: {
 *     spO2?: number,
 *     glucose?: number,
 *     systolic?: number,
 *     diastolic?: number,
 *     temperature?: number,
 *     respiratoryRate?: number,
 *     hemoglobin?: number,
 *     bloodType?: string
 *   }
 * }
 */
router.post('/analyze', analyzeECGData)

/**
 * GET /api/ecg/simulated
 * Retorna dados de ECG simulados para testes
 */
router.get('/simulated', getSimulatedData)

/**
 * GET /api/ecg/status
 * Retorna status da API
 */
router.get('/status', (req, res) => {
  res.json({
    status: 'operational',
    message: 'ECG Analysis API is running',
    timestamp: new Date().toISOString()
  })
})

export default router
