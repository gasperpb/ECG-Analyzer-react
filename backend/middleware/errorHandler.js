import logger from '../utils/logger.js'

/**
 * Middleware global para tratamento de erros
 */
export default function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500
  const message = err.message || 'Erro interno do servidor'

  logger.error(`${message}`, err)

  res.status(statusCode).json({
    success: false,
    error: message,
    status: statusCode,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}

