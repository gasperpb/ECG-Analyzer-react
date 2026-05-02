import { useState, useEffect } from 'react'
import { X, ArrowRight, ArrowLeft, Check } from 'lucide-react'

const steps = [
  {
    target: null,
    title: 'Bem-vindo ao ECG Analyzer! 👋',
    description: 'Sistema inteligente de análise de eletrocardiogramas com 100+ diagnósticos, 14 sinais vitais e análise de imagens.',
    placement: 'center'
  },
  {
    target: '[data-onboard="analyzer"]',
    title: 'Analisador de ECG 📊',
    description: 'Faça upload de arquivos CSV/JSON, imagens de ECG ou use dados simulados para iniciar uma análise.',
    placement: 'bottom'
  },
  {
    target: '[data-onboard="history"]',
    title: 'Histórico de Análises 📅',
    description: 'Todas as suas análises são salvas automaticamente. Visualize, compare e exporte para CSV.',
    placement: 'bottom'
  },
  {
    target: '[data-onboard="vitals"]',
    title: 'Sinais Vitais + Laboratoriais 🧪',
    description: 'Adicione 14 parâmetros como SpO₂, Glicose, PA, Potássio, Troponina para diagnósticos mais precisos.',
    placement: 'top'
  },
  {
    target: '[data-onboard="features"]',
    title: 'Padrões ECG Visuais 🔬',
    description: 'Selecione padrões visuais como ondas T, ST, delta, bloqueios para detectar 20+ condições.',
    placement: 'top'
  },
  {
    target: '[data-onboard="darkmode"]',
    title: 'Modo Escuro 🌙',
    description: 'Alterne entre modo claro e escuro clicando no ícone de sol/lua no cabeçalho.',
    placement: 'bottom'
  },
  {
    target: null,
    title: 'Pronto para começar! 🚀',
    description: 'Clique em "Iniciar Análise" no Dashboard ou vá direto ao Analisador. Boa análise!',
    placement: 'center'
  }
]

export default function Onboarding({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const seen = localStorage.getItem('ecg-onboarding-seen')
    if (!seen) {
      setTimeout(() => setShow(true), 1000)
    }
  }, [])

  const handleClose = () => {
    setShow(false)
    localStorage.setItem('ecg-onboarding-seen', 'true')
    onComplete?.()
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      handleClose()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSkip = () => {
    handleClose()
  }

  if (!show) return null

  const step = steps[currentStep]
  const isLast = currentStep === steps.length - 1
  const isFirst = currentStep === 0

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 dark:bg-black/80 z-40"
        onClick={handleSkip}
      />

      <div className="fixed z-50 bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-sm w-full mx-4 p-6 border border-gray-200 dark:border-gray-700"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentStep
                    ? 'bg-medical-600 w-6'
                    : i < currentStep
                    ? 'bg-medical-600'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {step.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
          {step.description}
        </p>

        <div className="flex items-center justify-between gap-3">
          <button
            onClick={handleSkip}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium"
          >
            Pular tutorial
          </button>

          <div className="flex gap-2">
            {!isFirst && (
              <button
                onClick={handlePrev}
                className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Anterior
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-medical-600 hover:bg-medical-700 rounded-lg transition"
            >
              {isLast ? (
                <>
                  <Check className="w-4 h-4" />
                  Começar
                </>
              ) : (
                <>
                  Próximo
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
