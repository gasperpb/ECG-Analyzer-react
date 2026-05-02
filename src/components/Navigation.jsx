import { Home, Zap, BarChart3, Clock } from 'lucide-react'

export default function Navigation({ currentPage, onNavigate }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'analyzer', label: 'Analisador', icon: Zap },
    { id: 'results', label: 'Resultados', icon: BarChart3 },
    { id: 'history', label: 'Histórico', icon: Clock }
  ]

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md border-b border-gray-200 dark:border-gray-800 transition-colors">
      <div className="container mx-auto px-4">
        <div className="flex gap-1 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.id
            
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`
                  flex items-center gap-2 px-6 py-4 font-medium transition-all whitespace-nowrap
                  ${isActive 
                    ? 'text-medical-600 dark:text-medical-500 border-b-4 border-medical-600 dark:border-medical-500 bg-medical-50 dark:bg-gray-800' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-medical-600 dark:hover:text-medical-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
