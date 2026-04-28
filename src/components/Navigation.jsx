import React from 'react'
import { Home, Zap, BarChart3 } from 'lucide-react'

export default function Navigation({ currentPage, onNavigate }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'analyzer', label: 'Analisador', icon: Zap },
    { id: 'results', label: 'Resultados', icon: BarChart3 }
  ]

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
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
                    ? 'text-medical-600 border-b-4 border-medical-600 bg-medical-50' 
                    : 'text-gray-600 hover:text-medical-600 hover:bg-gray-50'
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
