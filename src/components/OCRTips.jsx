import React from 'react'
import { Camera, AlertCircle, CheckCircle } from 'lucide-react'

export default function OCRTips() {
  return (
    <div className="bg-gradient-to-r from-medical-50 to-blue-50 dark:from-medical-900/20 dark:to-blue-900/20 border border-medical-300 dark:border-medical-700 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <Camera className="w-6 h-6 text-medical-600" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">📸 Dicas para Melhor Análise de Imagens</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Boas Práticas */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h4 className="font-bold text-green-900 dark:text-green-100">✓ Recomendado</h4>
          </div>
          <ul className="space-y-2 text-sm text-green-800 dark:text-green-200">
            <li>✅ Imagens com bom contraste (branco/preto)</li>
            <li>✅ Resolução alta (1024x768 ou superior)</li>
            <li>✅ Traçado bem definido e visível</li>
            <li>✅ Imagem sem sombras ou reflexos</li>
            <li>✅ Papel milimetrado visível</li>
            <li>✅ Imagem em posição horizontal (paisagem)</li>
            <li>✅ Sem distorção ou inclinação</li>
          </ul>
        </div>

        {/* Evitar */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h4 className="font-bold text-red-900 dark:text-red-100">✗ Evitar</h4>
          </div>
          <ul className="space-y-2 text-sm text-red-800 dark:text-red-200">
            <li>❌ Imagens muito escuras ou brilhantes</li>
            <li>❌ Resolução muito baixa (&lt;512px)</li>
            <li>❌ Traçado desbotado ou tênue</li>
            <li>❌ Sombras ou reflexos na imagem</li>
            <li>❌ Texto ou anotações no traçado</li>
            <li>❌ Imagem rotacionada ou inclinada</li>
            <li>❌ Múltiplos traçados na mesma imagem</li>
          </ul>
        </div>
      </div>

      {/* Formato Ideal */}
        <div className="mt-6 pt-6 border-t border-medical-200 dark:border-medical-700">
          <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-3">📋 Formato Ideal para Captura</h4>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg text-sm space-y-2 text-gray-700 dark:text-gray-300">
          <p><strong>Tamanho:</strong> 1920x1440 px ou superior</p>
          <p><strong>Formato:</strong> PNG (melhor qualidade) ou JPG (comprimido)</p>
          <p><strong>Contraste:</strong> Mínimo 80% de diferença entre traçado e fundo</p>
          <p><strong>Sem Transparência:</strong> Fundo sólido branco ou claro</p>
          <p><strong>Linearidade:</strong> Traçado horizontal sem distorção</p>
        </div>
      </div>

      {/* Processamento Explicado */}
        <div className="mt-6 pt-6 border-t border-medical-200 dark:border-medical-700">
          <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-3">🔄 Como o Processamento Funciona</h4>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg text-xs space-y-2 text-gray-700 dark:text-gray-300 font-mono">
          <p>1. Imagem é carregada em Canvas</p>
          <p>2. Cada pixel é convertido para escala de cinza</p>
          <p>3. Linha central da imagem é extraída</p>
          <p>4. Pixels são convertidos em valores numéricos</p>
          <p>5. Dados são reamostrados para 250 Hz</p>
          <p>6. Filtro suave reduz ruído</p>
          <p>7. Resultado é enviado para análise</p>
        </div>
      </div>
    </div>
  )
}
