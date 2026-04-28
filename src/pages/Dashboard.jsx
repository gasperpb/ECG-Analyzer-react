import React from 'react'
import { Activity, Zap, BarChart3, Heart } from 'lucide-react'
import StatsCard from '../components/StatsCard'

export default function Dashboard({ onNavigate }) {
  const features = [
    {
      icon: Activity,
      title: 'Análise em Tempo Real',
      description: 'Processa dados de ECG com análise instantânea e diagnósticos precisos'
    },
    {
      icon: Zap,
      title: '45+ Diagnósticos',
      description: 'Detecção de anomalias, arritmias, infartos e síndromes cardíacas'
    },
    {
      icon: BarChart3,
      title: 'Gráficos Interativos',
      description: 'Visualize ECG com gráficos de alta definição e análise detalhada'
    },
    {
      icon: Heart,
      title: 'Interpretação Clínica',
      description: 'Relatórios completos com recomendações baseadas em dados cardíacos'
    }
  ]

  const diagnosticCategories = [
    { name: 'Anomalias Básicas', count: 2, color: 'blue' },
    { name: 'Infartos e Isquemias', count: 5, color: 'red' },
    { name: 'Desordens de Condução', count: 6, color: 'purple' },
    { name: 'Arritmias', count: 8, color: 'yellow' },
    { name: 'Síndromes Congênitas', count: 4, color: 'pink' },
    { name: 'Desordens de Eletrólitos', count: 4, color: 'green' }
  ]

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-medical-600 to-red-600 text-white rounded-xl p-12 shadow-lg">
        <h2 className="text-4xl font-bold mb-4">Bem-vindo ao ECG Analyzer</h2>
        <p className="text-lg mb-8 opacity-90">
          Um sistema avançado de análise de eletrocardiogramas com detecção inteligente de anomalias cardíacas
        </p>
        <button
          onClick={() => onNavigate('analyzer')}
          className="bg-white text-medical-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-all shadow-md hover:shadow-lg"
        >
          Iniciar Análise
        </button>
      </div>

      {/* Stats Overview */}
      <div>
        <h3 className="text-2xl font-bold mb-6 text-gray-900">Visão Geral</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            icon={Heart}
            title="Diagnósticos"
            value="45+"
            color="red"
          />
          <StatsCard
            icon={Activity}
            title="Taxa de Precisão"
            value="98.5%"
            unit="%"
            color="green"
          />
          <StatsCard
            icon={Zap}
            title="Análises Processadas"
            value="1,250+"
            color="medical"
          />
          <StatsCard
            icon={BarChart3}
            title="Tempo de Resposta"
            value="<1"
            unit="s"
            color="purple"
          />
        </div>
      </div>

      {/* Features */}
      <div>
        <h3 className="text-2xl font-bold mb-6 text-gray-900">Funcionalidades Principais</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all border border-gray-200"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-medical-50 rounded-lg flex-shrink-0">
                    <Icon className="w-6 h-6 text-medical-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h4>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Diagnostic Categories */}
      <div>
        <h3 className="text-2xl font-bold mb-6 text-gray-900">Categorias de Diagnósticos</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {diagnosticCategories.map((category, index) => {
            const colors = {
              blue: 'bg-blue-50 border-blue-200 text-blue-900',
              red: 'bg-red-50 border-red-200 text-red-900',
              purple: 'bg-purple-50 border-purple-200 text-purple-900',
              yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900',
              pink: 'bg-pink-50 border-pink-200 text-pink-900',
              green: 'bg-green-50 border-green-200 text-green-900'
            }
            const colorClass = colors[category.color]
            
            return (
              <div key={index} className={`${colorClass} border p-4 rounded-lg text-center`}>
                <p className="font-bold text-lg">{category.count}</p>
                <p className="text-sm font-medium">{category.name}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-2xl font-bold mb-6 text-gray-900">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => onNavigate('analyzer')}
            className="bg-medical-600 hover:bg-medical-700 text-white font-bold py-4 px-6 rounded-lg transition-all shadow-md hover:shadow-lg"
          >
            📊 Fazer Upload de ECG
          </button>
          <button
            onClick={() => onNavigate('analyzer')}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition-all shadow-md hover:shadow-lg"
          >
            🎲 Usar Dados Simulados
          </button>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-300 rounded-lg p-6">
        <h4 className="text-lg font-bold text-blue-900 mb-3">ℹ️ Informações</h4>
        <ul className="text-blue-800 text-sm space-y-2">
          <li>• Formatos de dados: CSV, JSON, ECG</li>
          <li>• Formatos de imagem: PNG, JPG, JPEG, BMP</li>
          <li>• Tamanho máximo de arquivo: 10MB</li>
          <li>• Taxa de amostragem: 250-500 Hz</li>
          <li>• Análise de 10-30 segundos de ECG</li>
          <li>• Processamento de imagens com OCR simples</li>
          <li>• Todos os dados são processados localmente</li>
        </ul>
      </div>
    </div>
  )
}
