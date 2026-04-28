import React from 'react'
import { AlertTriangle, CheckCircle, AlertCircle, Info } from 'lucide-react'

export default function DiagnosticsCard({ diagnosis, severity = 'info' }) {
  const getSeverityConfig = (sev) => {
    const configs = {
      critical: {
        bgColor: 'bg-red-50',
        borderColor: 'border-red-300',
        textColor: 'text-red-900',
        icon: AlertTriangle,
        badge: 'bg-red-200 text-red-800'
      },
      warning: {
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-300',
        textColor: 'text-yellow-900',
        icon: AlertCircle,
        badge: 'bg-yellow-200 text-yellow-800'
      },
      normal: {
        bgColor: 'bg-green-50',
        borderColor: 'border-green-300',
        textColor: 'text-green-900',
        icon: CheckCircle,
        badge: 'bg-green-200 text-green-800'
      },
      info: {
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-300',
        textColor: 'text-blue-900',
        icon: Info,
        badge: 'bg-blue-200 text-blue-800'
      }
    }
    return configs[sev] || configs.info
  }

  const config = getSeverityConfig(severity)
  const Icon = config.icon

  return (
    <div className={`${config.bgColor} border-l-4 ${config.borderColor} p-4 rounded-lg`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-6 h-6 ${config.textColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className={`font-bold ${config.textColor} text-lg`}>
              {diagnosis.name}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config.badge}`}>
              {severity.toUpperCase()}
            </span>
          </div>
          
          {diagnosis.description && (
            <p className={`${config.textColor} text-sm mb-3`}>
              {diagnosis.description}
            </p>
          )}
          
          {diagnosis.details && (
            <div className={`${config.textColor} text-xs space-y-1 mb-3`}>
              {Object.entries(diagnosis.details).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="font-semibold">{key}:</span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          )}

          {diagnosis.recommendation && (
            <div className="mt-3 pt-3 border-t border-current border-opacity-20">
              <p className={`${config.textColor} text-xs font-semibold`}>
                💡 Recomendação: {diagnosis.recommendation}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
