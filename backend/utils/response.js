/**
 * Utilitários para formatação de respostas
 */

export function successResponse(data, message = null) {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  }
}

export function errorResponse(error, statusCode = 500) {
  return {
    success: false,
    error: error.message || error,
    statusCode,
    timestamp: new Date().toISOString()
  }
}

export function paginatedResponse(items, total, page, limit) {
  return {
    success: true,
    data: items,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    },
    timestamp: new Date().toISOString()
  }
}

export default {
  successResponse,
  errorResponse,
  paginatedResponse
}
