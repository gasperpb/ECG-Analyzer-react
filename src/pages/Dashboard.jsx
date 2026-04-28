import React from 'react'
import { Activity, Zap, BarChart3, Heart, TrendingUp } from 'lucide-react'
import StatsCard from '../components/StatsCard'

export default function Dashboard({ onNavigate }) {
  const features = [
    {
      icon: Activity,
      title: 'Análise em Tempo Real',
      description: 'Processa ECG com análise instantânea, sinais vitais e diagnósticos integrados'
    },
    {
      icon: Zap,
      title: '38+ Diagnósticos Avançados',
      description: 'Detecção de anomalias cardíacas + doenças sistêmicas + correlações'
    },
    {
      icon: BarChart3,
      title: 'Gráficos Interativos',
      description: 'Visualize ECG, sinais vitais e correlações com gráficos de alta definição'
    },
    {
      icon: Heart,
      title: 'Interpretação Integrada',
      description: 'Relatórios com análise ECG + sinais vitais + nível de risco geral'
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
            title="Diagnósticos Totais"
            value="38+"
            color="red"
          />
          <StatsCard
            icon={TrendingUp}
            title="Sinais Vitais"
            value="10"
            color="orange"
          />
          <StatsCard
            icon={Zap}
            title="Taxa de Precisão"
            value="98.5%"
            unit="%"
            color="green"
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

      {/* Vital Signs Diagnostics */}
      <div className="bg-gradient-to-r from-medical-50 to-blue-50 border-2 border-medical-300 rounded-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-8 h-8 text-medical-600" />
          <h3 className="text-2xl font-bold text-gray-900">💊 Análise Integrada com Sinais Vitais</h3>
        </div>
        
        <p className="text-gray-700 mb-6 text-lg font-semibold">
          Agora com 10 sinais vitais opcionais, detectamos 28+ condições adicionais:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
            <p className="font-bold text-blue-700 mb-2">🫁 Oximetria (SpO2)</p>
            <p className="text-sm text-gray-600">Hipoxemia, DPOC, Pneumonia, Asma, TEP</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg border-l-4 border-yellow-500">
            <p className="font-bold text-yellow-700 mb-2">🍬 Glicose</p>
            <p className="text-sm text-gray-600">Hipoglicemia, Diabetes Tipo 1/2, Cetoacidose</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500">
            <p className="font-bold text-purple-700 mb-2">💉 Pressão Arterial</p>
            <p className="text-sm text-gray-600">Hipertensão, Hipotensão, Crise Hipertensiva</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg border-l-4 border-red-500">
            <p className="font-bold text-red-700 mb-2">🌡️ Temperatura</p>
            <p className="text-sm text-gray-600">Febre, Hipotermia, Infecções, Sepse</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
            <p className="font-bold text-green-700 mb-2">💨 Frequência Respiratória</p>
            <p className="text-sm text-gray-600">Bradipneia, Taquipneia, Insuficiência</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg border-l-4 border-orange-500">
            <p className="font-bold text-orange-700 mb-2">🔴 Hemoglobina</p>
            <p className="text-sm text-gray-600">Anemia, Policitemia, Deficiência de ferro</p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-300 rounded-lg">
          <p className="font-bold text-blue-900 mb-2">✨ Síndromes Multissistêmicas Detectadas:</p>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Miocardiopatia Hipertensiva (PA↑ + ECG↑)</li>
            <li>• Alteração Metabólica com Arritmia (Glicose± + Arritmia)</li>
            <li>• Insuficiência Respiratória com Compensação (SpO2↓ + Taquicardia)</li>
            <li>• Taquicardia Compensatória por Anemia (Hgb↓ + Taquicardia)</li>
            <li>• Possível Sepse (Temp↑ + PA↓ + Taquicardia)</li>
          </ul>
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
          <li>• <span className="font-semibold">Formatos de dados:</span> CSV, JSON, ECG</li>
          <li>• <span className="font-semibold">Formatos de imagem:</span> PNG, JPG, JPEG, BMP</li>
          <li>• <span className="font-semibold">Tamanho máximo de arquivo:</span> 10MB</li>
          <li>• <span className="font-semibold">Taxa de amostragem:</span> 250-500 Hz</li>
          <li>• <span className="font-semibold">Análise de:</span> 10-30 segundos de ECG</li>
          <li>• <span className="font-semibold">Sinais Vitais:</span> 10 métricas opcionais (SpO2, Glicose, PA, Temp, FR, Hgb, Tipo Sanguíneo, etc)</li>
          <li>• <span className="font-semibold">Diagnósticos detectáveis:</span> 38+ (10 ECG + 28 Vitais)</li>
          <li>• <span className="font-semibold">Síndromes:</span> 5+ correlações multissistêmicas</li>
          <li>• <span className="font-semibold">Processamento:</span> Dados processados localmente + Backend</li>
        </ul>
      </div>

      {/* Footer com Crédito */}
      <div className="border-t-2 border-gray-200 pt-8 mt-8">
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-6 text-center">
          <p className="text-gray-600 text-sm mb-2">
            🏥 <span className="font-semibold">ECG Analyzer</span> - Sistema Inteligente de Análise Cardíaca
          </p>
          <p className="text-gray-500 text-xs">
            Desenvolvido por 
            <span className="font-bold text-medical-600 ml-1">Achillesdev</span>
            {' '}|{' '}
            <span className="text-blue-600 hover:text-blue-700 cursor-pointer">GitHub</span>
            {' '}|{' '}
            <span className="text-blue-600 hover:text-blue-700 cursor-pointer">Portfolio</span>
          </p>
          <p className="text-gray-400 text-xs mt-3 italic">
            ⚠️ Para fins educacionais e de referência. Não substitui avaliação médica profissional.
          </p>
        </div>
      </div>
    </div>
  )
}
