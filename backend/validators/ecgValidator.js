/**
 * Validadores para dados de ECG
 */

export function validateECGData(body) {
  const errors = []

  if (!body) {
    errors.push('Body da requisição não fornecido')
    return { valid: false, errors }
  }

  // Validar dados
  if (!body.data || !Array.isArray(body.data)) {
    errors.push('Campo "data" deve ser um array')
  }

  if (body.data && body.data.length === 0) {
    errors.push('Array de dados não pode estar vazio')
  }

  if (body.data && !body.data.every(item => typeof item === 'number')) {
    errors.push('Todos os valores em "data" devem ser números')
  }

  // Validar sampling rate (opcional)
  if (body.samplingRate && typeof body.samplingRate !== 'number') {
    errors.push('Campo "samplingRate" deve ser um número')
  }

  if (body.samplingRate && body.samplingRate <= 0) {
    errors.push('Campo "samplingRate" deve ser maior que 0')
  }

  // Validar duration (opcional)
  if (body.duration && typeof body.duration !== 'number') {
    errors.push('Campo "duration" deve ser um número')
  }

  if (body.duration && body.duration <= 0) {
    errors.push('Campo "duration" deve ser maior que 0')
  }

  // Validar vital signs (opcional)
  if (body.vitalSigns && typeof body.vitalSigns !== 'object') {
    errors.push('Campo "vitalSigns" deve ser um objeto')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

export function validateVitalSigns(vitalSigns) {
  if (!vitalSigns || typeof vitalSigns !== 'object') {
    return { valid: true } // opcional
  }

  const errors = []

  // Validar valores numéricos
  const numericFields = ['spO2', 'glucose', 'systolic', 'diastolic', 'temperature', 'respiratoryRate', 'hemoglobin']
  for (const field of numericFields) {
    if (vitalSigns[field] !== undefined && typeof vitalSigns[field] !== 'number') {
      errors.push(`Campo "vitalSigns.${field}" deve ser um número`)
    }
  }

  // Validar blood type
  if (vitalSigns.bloodType && typeof vitalSigns.bloodType !== 'string') {
    errors.push('Campo "vitalSigns.bloodType" deve ser uma string')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
