/**
 * Middleware para logging de requisições
 */

import logger from '../utils/logger.js'

export default function requestLoggerMiddleware(req, res, next) {
  const start = Date.now()

  // Interceptar res.json para capturar status
  const originalJson = res.json
  res.json = function(data) {
    const duration = Date.now() - start
    const status = res.statusCode

    // Log com cores baseado no status
    const statusSymbol = status >= 400 ? '❌' : status >= 300 ? '⚠️' : '✅'
    logger.info(`${statusSymbol} ${req.method} ${req.path} - ${status} (${duration}ms)`)

    return originalJson.call(this, data)
  }

  next()
}
