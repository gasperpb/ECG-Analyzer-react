/**
 * Constantes da API
 */

export const API_STATUS = {
  OK: 'ok',
  OPERATIONAL: 'operational',
  ERROR: 'error'
}

export const ENDPOINTS = {
  HEALTH: 'GET /api/health',
  ECG_ANALYZE: 'POST /api/ecg/analyze',
  ECG_SIMULATED: 'GET /api/ecg/simulated',
  ECG_STATUS: 'GET /api/ecg/status'
}

export const ERROR_MESSAGES = {
  INVALID_ECG_DATA: 'Dados de ECG inválidos',
  EMPTY_DATA_ARRAY: 'Array de dados vazio ou não fornecido',
  INTERNAL_ERROR: 'Erro ao processar requisição',
  ENDPOINT_NOT_FOUND: 'Endpoint não encontrado',
  INVALID_REQUEST: 'Requisição inválida'
}
