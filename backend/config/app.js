/**
 * Configurações da aplicação
 */

const config = {
  port: process.env.PORT || 8080,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
  
  // Limites
  limits: {
    jsonPayload: '50mb',
    urlencodedPayload: '50mb',
    fileUpload: '100mb'
  },

  // API
  api: {
    version: '1.0.0',
    baseUrl: '/api'
  },

  // ECG
  ecg: {
    defaultSamplingRate: 250, // Hz
    defaultDuration: 10 // segundos
  },

  // Development
  isDevelopment: process.env.NODE_ENV !== 'production',
  isProduction: process.env.NODE_ENV === 'production'
}

export default config
