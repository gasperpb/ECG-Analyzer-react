/**
 * Middleware para tratamento de erros de validação
 */

import logger from '../utils/logger.js'

export default function validationErrorHandler(err, req, res, next) {
  if (err.status === 400 && err.type === 'entity.parse.failed') {
    logger.error('Erro ao fazer parse do JSON:', err.message)
    return res.status(400).json({
      success: false,
      error: 'JSON inválido',
      message: 'Verifique a formatação do corpo da requisição',
      timestamp: new Date().toISOString()
    })
  }

  next(err)
}
