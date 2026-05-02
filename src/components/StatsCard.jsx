export default function StatsCard({ icon: Icon, title, value, unit = '', color = 'blue' }) {
  const colorConfigs = {
    blue: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    red: 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800',
    green: 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
    purple: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    yellow: 'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
    medical: 'bg-medical-50 dark:bg-medical-950/30 text-medical-600 dark:text-medical-400 border-medical-200 dark:border-medical-800'
  }

  const config = colorConfigs[color] || colorConfigs.blue
  const classes = config.split(' ')
  const bgColor = classes[0] + ' ' + classes[1]
  const textColor = classes[2] + ' ' + classes[3]
  const borderColor = classes[4] + ' ' + classes[5]

  return (
    <div className={`${bgColor} border-l-4 ${borderColor} p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</span>
            {unit && <span className={`${textColor} font-semibold text-sm`}>{unit}</span>}
          </div>
        </div>
        <div className={`${textColor} p-3 bg-white dark:bg-gray-800 rounded-full`}>
          <Icon className="w-8 h-8" />
        </div>
      </div>
    </div>
  )
}
