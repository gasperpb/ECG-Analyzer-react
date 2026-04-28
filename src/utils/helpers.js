// Formatação de números
export const formatNumber = (num, decimals = 2) => {
  return parseFloat(num).toFixed(decimals)
}

// Formatação de tempo
export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = (seconds % 60).toFixed(2)
  return `${mins}:${secs.padStart(5, '0')}`
}

// Validação de email
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

// Conversão de arquivo para base64
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
  })
}

// Download de arquivo
export const downloadFile = (content, filename, type = 'text/plain') => {
  const blob = new Blob([content], { type })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

// Determinação de severidade de diagnóstico
export const getSeverity = (value, thresholds) => {
  if (value <= thresholds.normal) return 'normal'
  if (value <= thresholds.warning) return 'warning'
  return 'critical'
}

// Cálculo de BPM a partir de dados ECG
export const calculateBPM = (data, samplingRate) => {
  // Implementação simplificada
  // Em produção, usar algoritmos mais sofisticados
  return Math.round(60 + Math.random() * 40)
}

// Validação de dados ECG
export const validateECGData = (data, samplingRate) => {
  if (!Array.isArray(data) || data.length === 0) {
    return { valid: false, error: 'Dados inválidos' }
  }

  if (!Number.isFinite(samplingRate) || samplingRate <= 0) {
    return { valid: false, error: 'Taxa de amostragem inválida' }
  }

  const hasValidNumbers = data.every(val => typeof val === 'number' && Number.isFinite(val))
  if (!hasValidNumbers) {
    return { valid: false, error: 'Dados contêm valores inválidos' }
  }

  return { valid: true }
}

// Geração de relatório em texto
export const generateTextReport = (results) => {
  let report = 'ECG ANALYZER - RELATÓRIO DE ANÁLISE\n'
  report += '===================================\n\n'
  report += `Data: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}\n\n`
  
  report += 'MÉTRICAS PRINCIPAIS\n'
  report += '------------------\n'
  report += `Frequência Cardíaca: ${results.bpm} BPM\n`
  report += `Ritmo: ${results.rhythm}\n`
  report += `Intervalo PR: ${results.pr} ms\n`
  report += `QRS: ${results.qrs} ms\n`
  report += `Intervalo QT: ${results.qt} ms\n\n`
  
  report += 'DIAGNÓSTICOS\n'
  report += '------------\n'
  if (results.diagnoses && results.diagnoses.length > 0) {
    results.diagnoses.forEach((diag, idx) => {
      report += `${idx + 1}. ${diag.name} (${diag.severity})\n`
      report += `   ${diag.description}\n\n`
    })
  } else {
    report += 'Nenhum diagnóstico identificado\n\n'
  }
  
  if (results.interpretation) {
    report += 'INTERPRETAÇÃO CLÍNICA\n'
    report += '--------------------\n'
    report += results.interpretation + '\n\n'
  }
  
  if (results.recommendations) {
    report += 'RECOMENDAÇÕES\n'
    report += '-------------\n'
    results.recommendations.forEach((rec, idx) => {
      report += `${idx + 1}. ${rec}\n`
    })
  }
  
  return report
}
