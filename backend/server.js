import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

// Imports de configuração
import config from './config/app.js'
import logger from './utils/logger.js'

// Imports de rotas
import ecgRouter from './routes/ecg.js'

// Imports de middleware
import errorHandler from './middleware/errorHandler.js'
import validationErrorHandler from './middleware/validationErrorHandler.js'
import requestLoggerMiddleware from './middleware/requestLogger.js'
import { API_STATUS, ENDPOINTS } from './constants/api.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()

// ===== CONFIGURAÇÃO DE MIDDLEWARE =====

// Validação de JSON com tratamento de erros
app.use(express.json({ limit: config.limits.jsonPayload }))
app.use(express.urlencoded({ limit: config.limits.urlencodedPayload, extended: true }))

// CORS
app.use(cors({
  origin: config.corsOrigins,
  credentials: true
}))

// Logger de requisições
app.use(requestLoggerMiddleware)

// Tratamento de erros de validação
app.use(validationErrorHandler)

// ===== ROTAS =====

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: API_STATUS.OK,
    message: 'ECG Analyzer Backend is running',
    timestamp: new Date().toISOString(),
    version: config.api.version,
    environment: config.nodeEnv
  })
})

// Rotas de API
app.use('/api/ecg', ecgRouter)

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    name: 'ECG Analyzer Backend',
    version: config.api.version,
    description: 'API REST para análise de eletrocardiogramas',
    author: 'Achillesdev',
    environment: config.nodeEnv,
    endpoints: ENDPOINTS
  })
})

// 404 handler
app.use((req, res) => {
  logger.warn(`Endpoint não encontrado: ${req.method} ${req.path}`)
  res.status(404).json({
    success: false,
    error: 'Endpoint não encontrado',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  })
})

// Error handler (deve ser o último)
app.use(errorHandler)

// ===== INICIALIZAR SERVIDOR =====

app.listen(config.port, () => {
  logger.success(`\n🏥 ECG Analyzer Backend`)
  logger.info(`📡 Servidor rodando em http://localhost:${config.port}`)
  logger.info(`🔧 Ambiente: ${config.nodeEnv}`)
  logger.info(`📚 Documentação disponível em http://localhost:${config.port}`)
  logger.success(`✅ Sistema pronto para análise de ECG\n`)
})

export default app
