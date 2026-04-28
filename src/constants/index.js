// Categorias de Diagnósticos
export const DIAGNOSTIC_CATEGORIES = {
  BASIC_ANOMALIES: {
    name: 'Anomalias Básicas',
    color: 'blue',
    count: 2
  },
  MI_ISCHEMIA: {
    name: 'Infartos e Isquemias',
    color: 'red',
    count: 5
  },
  CONDUCTION_DISORDERS: {
    name: 'Desordens de Condução',
    color: 'purple',
    count: 6
  },
  ARRHYTHMIAS: {
    name: 'Arritmias',
    color: 'yellow',
    count: 8
  },
  CONGENITAL_SYNDROMES: {
    name: 'Síndromes Congênitas',
    color: 'pink',
    count: 4
  },
  ELECTROLYTE_DISORDERS: {
    name: 'Desordens de Eletrólitos',
    color: 'green',
    count: 4
  },
  SPECIAL_PATTERNS: {
    name: 'Padrões Especiais',
    color: 'indigo',
    count: 3
  },
  HYPERTROPHIES: {
    name: 'Hipertrofias',
    color: 'cyan',
    count: 3
  },
  INFLAMMATION: {
    name: 'Inflamação e Pericardite',
    color: 'orange',
    count: 2
  },
  DRUG_EFFECTS: {
    name: 'Efeitos de Drogas',
    color: 'fuchsia',
    count: 2
  }
}

// Níveis de Severidade
export const SEVERITY_LEVELS = {
  NORMAL: 'normal',
  INFO: 'info',
  WARNING: 'warning',
  CRITICAL: 'critical'
}

// Valores de Referência
export const REFERENCE_VALUES = {
  BPM: {
    min: 60,
    max: 100,
    resting: { min: 50, max: 100 }
  },
  PR_INTERVAL: {
    min: 120,
    max: 200,
    unit: 'ms'
  },
  QRS_DURATION: {
    min: 80,
    max: 120,
    unit: 'ms'
  },
  QT_INTERVAL: {
    min: 300,
    max: 450,
    unit: 'ms'
  }
}

// Tipos de Ritmos Cardíacos
export const HEART_RHYTHMS = {
  SINUS: 'Sinusal',
  ATRIAL_FIBRILLATION: 'Fibrilação Atrial',
  ATRIAL_FLUTTER: 'Flutter Atrial',
  SVT: 'Taquicardia Supraventricular',
  VT: 'Taquicardia Ventricular',
  BRADYCARDIA: 'Bradicardia'
}

// Formatos de Arquivo Suportados
export const SUPPORTED_FORMATS = {
  CSV: { ext: '.csv', type: 'text/csv', label: 'CSV' },
  JSON: { ext: '.json', type: 'application/json', label: 'JSON' },
  ECG: { ext: '.ecg', type: 'text/plain', label: 'ECG' }
}

// Mensagens de Erro
export const ERROR_MESSAGES = {
  FILE_TOO_LARGE: 'Arquivo muito grande. Máximo: 10MB',
  INVALID_FORMAT: 'Formato de arquivo inválido',
  INVALID_DATA: 'Dados de ECG inválidos',
  API_ERROR: 'Erro ao conectar com o servidor',
  PARSE_ERROR: 'Erro ao processar o arquivo'
}

// Mensagens de Sucesso
export const SUCCESS_MESSAGES = {
  FILE_UPLOADED: 'Arquivo carregado com sucesso',
  ANALYSIS_COMPLETE: 'Análise concluída',
  DATA_GENERATED: 'Dados simulados gerados com sucesso'
}

// Configurações da API
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
}

// Intervalos de Polling (em ms)
export const POLLING_INTERVALS = {
  STATUS_CHECK: 2000,
  HEARTBEAT: 5000
}

// Limites de Dados
export const DATA_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MIN_POINTS: 250,
  MAX_POINTS: 500000
}
