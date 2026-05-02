import { Heart, Activity, Moon, Sun } from 'lucide-react'
import { useDarkMode } from '../hooks/useDarkMode'

export default function Header({ onNavigation }) {
  const { isDark, toggle } = useDarkMode()

  return (
    <header className="bg-white dark:bg-gray-900 shadow-lg border-b-4 border-medical-600 dark:border-medical-500 transition-colors">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition"
            onClick={() => onNavigation('dashboard')}
          >
            <div className="p-3 bg-gradient-to-br from-medical-600 to-red-600 rounded-full">
              <Heart className="w-8 h-8 text-white fill-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-medical-600 to-red-600 bg-clip-text text-transparent">
                ECG Analyzer
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                Sistema de Análise Cardíaca Inteligente
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-medical-600 dark:text-medical-500">
              <Activity className="w-5 h-5 animate-pulse" />
              <span className="text-sm font-semibold">Sistema Online</span>
            </div>
            <div className="hidden lg:block h-4 w-px bg-gray-300 dark:bg-gray-700"></div>
            <div className="hidden lg:flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs">
              <span>by</span>
              <span className="font-bold text-medical-600 dark:text-medical-500">Achillesdev</span>
            </div>
            <button
              onClick={toggle}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title={isDark ? 'Modo claro' : 'Modo escuro'}
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
