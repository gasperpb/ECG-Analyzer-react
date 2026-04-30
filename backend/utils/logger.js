/**
 * Utilitário de logging
 */

const LogLevel = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
}

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  green: '\x1b[32m',
  gray: '\x1b[90m'
}

function formatTimestamp() {
  return new Date().toISOString()
}

function getColorForLevel(level) {
  switch (level) {
    case LogLevel.ERROR:
      return colors.red
    case LogLevel.WARN:
      return colors.yellow
    case LogLevel.INFO:
      return colors.blue
    case LogLevel.DEBUG:
      return colors.gray
    default:
      return colors.reset
  }
}

const logger = {
  error: (message, error = null) => {
    const color = getColorForLevel(LogLevel.ERROR)
    console.error(`${color}[${formatTimestamp()}] ❌ ${LogLevel.ERROR}: ${message}${colors.reset}`)
    if (error) console.error(error)
  },

  warn: (message) => {
    const color = getColorForLevel(LogLevel.WARN)
    console.warn(`${color}[${formatTimestamp()}] ⚠️  ${LogLevel.WARN}: ${message}${colors.reset}`)
  },

  info: (message) => {
    const color = getColorForLevel(LogLevel.INFO)
    console.log(`${color}[${formatTimestamp()}] ℹ️  ${LogLevel.INFO}: ${message}${colors.reset}`)
  },

  debug: (message) => {
    const color = getColorForLevel(LogLevel.DEBUG)
    console.log(`${color}[${formatTimestamp()}] 🔍 ${LogLevel.DEBUG}: ${message}${colors.reset}`)
  },

  success: (message) => {
    const color = colors.green
    console.log(`${color}[${formatTimestamp()}] ✅ SUCCESS: ${message}${colors.reset}`)
  }
}

export default logger
