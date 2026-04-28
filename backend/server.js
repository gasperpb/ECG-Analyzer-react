import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import ecgRouter from './routes/ecg.js'
import errorHandler from './middleware/errorHandler.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 8080

// Middleware
app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// Rotas
app.use('/api/ecg', ecgRouter)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'ECG Analyzer Backend is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    name: 'ECG Analyzer Backend',
    version: '1.0.0',
    description: 'API REST para análise de eletrocardiogramas',
    author: 'Achillesdev',
    endpoints: {
      health: 'GET /api/health',
      analyze: 'POST /api/ecg/analyze',
      simulated: 'GET /api/ecg/simulated'
    }
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint não encontrado',
    path: req.path,
    method: req.method
  })
})

// Error handler
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  console.log(`\n🏥 ECG Analyzer Backend`)
  console.log(`📡 Servidor rodando em http://localhost:${PORT}`)
  console.log(`📚 Documentação em http://localhost:${PORT}/api`)
  console.log(`✅ Sistema pronto para análise de ECG\n`)
})

export default app
