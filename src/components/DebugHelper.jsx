import React from 'react'
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'

export default function DebugHelper({ isOpen = true }) {
  const [expanded, setExpanded] = React.useState(isOpen)

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-yellow-50 border-2 border-yellow-400 rounded-lg shadow-lg overflow-hidden z-40">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-yellow-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-700" />
          <span className="font-bold text-yellow-900">Debug Helper</span>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-yellow-700" />
        ) : (
          <ChevronDown className="w-5 h-5 text-yellow-700" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-yellow-400 p-4 bg-white max-h-96 overflow-y-auto">
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-semibold text-gray-900 mb-1">🔍 Verificações:</p>
              <ul className="space-y-1 text-gray-700 text-xs">
                <li>✓ Frontend: http://localhost:3000</li>
                <li>
                  {window.location.origin === 'http://localhost:3000' ? '✓' : '✗'} Backend: 
                  <span 
                    className="ml-2 font-mono px-2 py-1 bg-gray-100 rounded cursor-pointer hover:bg-gray-200"
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
              <p className="font-semibold text-gray-900 mb-1">📋 Instruções:</p>
              <ol className="space-y-1 text-gray-700 text-xs list-decimal list-inside">
                <li>Abra console (F12)</li>
                <li>Inicie backend: <code className="bg-gray-100 px-1">mvn spring-boot:run</code></li>
                <li>Testar dados simulados primeiro</li>
                <li>Veja mensagens de erro no console</li>
              </ol>
            </div>

            <div>
              <p className="font-semibold text-gray-900 mb-1">🔗 Recursos:</p>
              <div className="space-y-1">
                <a 
                  href="http://localhost:8080/api/ecg/status"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-blue-600 hover:underline text-xs"
                >
                  Test API Endpoint
                </a>
                <a 
                  href="TROUBLESHOOTING.md"
                  className="block text-blue-600 hover:underline text-xs"
                >
                  Troubleshooting Guide
                </a>
              </div>
            </div>

            <div className="pt-2 border-t border-yellow-200">
              <button
                onClick={() => setExpanded(false)}
                className="w-full px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded text-gray-700 font-semibold"
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
