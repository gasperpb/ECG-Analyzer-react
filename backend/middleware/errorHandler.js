export default function errorHandler(err, req, res, next) {
  console.error('❌ Erro:', err.message)
  
  const statusCode = err.statusCode || 500
  const message = err.message || 'Erro interno do servidor'
  
  res.status(statusCode).json({
    error: message,
    status: statusCode,
    timestamp: new Date().toISOString()
  })
}
