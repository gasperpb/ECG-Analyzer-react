import React from 'react'

export default function StatsCard({ icon: Icon, title, value, unit = '', color = 'blue' }) {
  const colorConfigs = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    medical: 'bg-medical-50 text-medical-600 border-medical-200'
  }

  const config = colorConfigs[color] || colorConfigs.blue
  const [bgColor, textColor, borderColor] = config.split(' ')

  return (
    <div className={`${bgColor} border-l-4 ${borderColor} p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">{value}</span>
            {unit && <span className={`${textColor} font-semibold text-sm`}>{unit}</span>}
          </div>
        </div>
        <div className={`${textColor} p-3 bg-white rounded-full`}>
          <Icon className="w-8 h-8" />
        </div>
      </div>
    </div>
  )
}
