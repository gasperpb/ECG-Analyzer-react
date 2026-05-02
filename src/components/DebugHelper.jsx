import React from 'react'
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'

export default function DebugHelper({ isOpen = true }) {
  const [expanded, setExpanded] = React.useState(isOpen)

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 dark:border-yellow-600 rounded-lg shadow-lg overflow-hidden z-40">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 transition-colors"
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-700 dark:text-yellow-400" />
          <span className="font-bold text-yellow-900 dark:text-yellow-100">Debug Helper</span>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-yellow-700 dark:text-yellow-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-yellow-700 dark:text-yellow-400" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-yellow-400 dark:border-yellow-600 p-4 bg-white dark:bg-gray-800 max-h-96 overflow-y-auto">
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">🔍 Verificações:</p>
              <ul className="space-y-1 text-gray-700 dark:text-gray-300 text-xs">
                <li>✓ Frontend: http://localhost:3000</li>
                <li>
                  {window.location.origin === 'http://localhost:3000' ? '✓' : '✗'} Backend: 
                  <span 
                    className="ml-2 font-mono px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                    onClick={() => {
                      fetch('http://localhost:8080/api/ecg/status')
                        .then(r => alert('Backend está respondendo! ✓'))
                        .catch(() => alert('Backend NÃO está respondendo! ✗'))
                    }}
                  >
                    Testar
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">📋 Instruções:</p>
              <ol className="space-y-1 text-gray-700 dark:text-gray-300 text-xs list-decimal list-inside">
                <li>Abra console (F12)</li>
                <li>Inicie backend: <code                    className="bg-gray-100 dark:bg-gray-700 px-1">mvn spring-boot:run</code></li>
                <li>Testar dados simulados primeiro</li>
                <li>Veja mensagens de erro no console</li>
              </ol>
            </div>

            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">🔗 Recursos:</p>
              <div className="space-y-1">
            <a
              href="http://localhost:8080/api/ecg/status"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-blue-600 dark:text-blue-400 hover:underline text-xs"
            >
                  Test API Endpoint
                </a>
            <a
              href="TROUBLESHOOTING.md"
              className="block text-blue-600 dark:text-blue-400 hover:underline text-xs"
            >
                  Troubleshooting Guide
                </a>
              </div>
            </div>

            <div className="pt-2 border-t border-yellow-200 dark:border-yellow-600">
              <button
                onClick={() => setExpanded(false)}
                className="w-full px-3 py-1 text-xs bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded text-gray-700 dark:text-gray-100 font-semibold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
