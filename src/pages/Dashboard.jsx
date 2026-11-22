import React, { useState } from 'react'
import { Activity, Zap, BarChart3, Heart, TrendingUp, Image, FlaskConical, Microscope, ShieldAlert, Loader2 } from 'lucide-react'
import StatsCard from '../components/StatsCard'
import ECGChart from '../components/ECGChart'

export default function Dashboard({ onNavigate }) {
  const [showComparison, setShowComparison] = useState(false)
const [normalEcgData, setNormalEcgData] = useState(null)
const [infarctionEcgData, setInfarctionEcgData] = useState(null)
const [ecgData, setEcgData] = useState(null)
const [selectedCase, setSelectedCase] = useState('normal')

const features = [
    {
      icon: Activity,
      title: 'Análise em Tempo Real',
      description: 'Processa ECG com análise instantânea de ritmo, intervalos e morfologia'
    },
    {
      icon: Zap,
      title: '100+ Diagnósticos',
      description: 'Detecção de anomalias cardíacas, eletrólitos, endócrinas e 30+ síndromes combinadas'
    },
    {
      icon: Image,
      title: 'Análise de Imagens',
      description: 'Extrai dados do traçado de ECG em imagens PNG, JPG e BMP via Canvas API'
    },
    {
      icon: FlaskConical,
      title: '14 Sinais Vitais + Lab',
      description: 'SpO2, Glicose, PA, Temp, FR, Hb, K+, Na+, Mg++, Ca++, TSH, Creatinina, Troponina'
    },
    {
      icon: Microscope,
      title: '20+ Padrões ECG Manuais',
      description: 'Marque visualmente ondas T, ST, delta, bloqueios, sobrecargas e arritmias'
    },
    {
      icon: ShieldAlert,
      title: 'Correlações Inteligentes',
      description: 'Combina ECG + vitais + características para detetar síndromes multissistêmicas'
    }
  ]

  const diagnosticCategories = [
    { name: 'Cardíacas / ECG', count: 12, color: 'red' },
    { name: 'Eletrólitos', count: 12, color: 'green' },
    { name: 'Sinais Vitais / Lab', count: 30, color: 'blue' },
    { name: 'Características ECG', count: 20, color: 'purple' },
    { name: 'Síndromes Combinadas', count: 30, color: 'yellow' }
  ]

  const syndromeGroups = [
    {
      title: '🫁 Respiratórias',
      color: 'blue',
      items: ['Pneumonia Grave', 'SDRA', 'Embolia Pulmonar', 'Depressão Respiratória', 'Sepse Pulmonar']
    },
    {
      title: '⚡ Eletrólitos Combinados',
      color: 'green',
      items: ['Hipocalemia + Hipomagnesemia', 'QT Longo por Hipomagnesemia', 'Arritmia por Hipocalemia', 'QT Longo por Hipocalcemia']
    },
    {
      title: '🔥 Tireoide',
      color: 'purple',
      items: ['Tempestade Tireotóxica', 'Coma Mixedematoso', 'Fibrilação por Tireotoxicose', 'Miocardiopatia por Hipotireoidismo']
    },
    {
      title: '🫀 Cardíacas',
      color: 'red',
      items: ['IAM Confirmado (Troponina+ECG)', 'Miocardite', 'Choque Cardiogênico', 'IAM Tipo 2 por Anemia']
    },
    {
      title: '🔴 Multiorgânicas',
      color: 'yellow',
      items: ['Choque Séptico com IRA', 'Sepse', 'Choque com Hipotermia', 'Nefropatia Diabética']
    },
    {
      title: '🧪 Metabólicas',
      color: 'orange',
      items: ['Cetoacidose Diabética', 'Diabetes + Infecção', 'Hipoglicemia Sintomática', 'Diabetes com Anemia']
    }
  ]

  const vitalSignsNew = [
    { icon: '🫁', name: 'SpO2', range: '95-100%', conditions: 'Hipoxemia' },
    { icon: '🍬', name: 'Glicose', range: '70-100 mg/dL', conditions: 'Hipo/Hiperglicemia' },
    { icon: '💉', name: 'PA Sist/Diast', range: '< 120/80 mmHg', conditions: 'Hipo/Hipertensão' },
    { icon: '🌡️', name: 'Temperatura', range: '36.5-37.5°C', conditions: 'Febre, Hipotermia' },
    { icon: '💨', name: 'Freq. Respiratória', range: '12-20 bpm', conditions: 'Bradi/Taquipneia' },
    { icon: '🔴', name: 'Hemoglobina', range: '13.5-17.5 g/dL', conditions: 'Anemia' },
    { icon: '⚡', name: 'Potássio (K+)', range: '3.5-5.0 mEq/L', conditions: 'Hipo/Hipercalémia' },
    { icon: '💧', name: 'Sódio (Na+)', range: '135-145 mEq/L', conditions: 'Hipo/Hipernatremia' },
    { icon: '🔋', name: 'Magnésio (Mg++)', range: '1.7-2.2 mg/dL', conditions: 'Hipo/Hipermagnesemia' },
    { icon: '🦴', name: 'Cálcio (Ca++)', range: '8.5-10.5 mg/dL', conditions: 'Hipo/Hipercalcemia' },
    { icon: '🦋', name: 'TSH', range: '0.4-4.0 mUI/L', conditions: 'Hipo/Hipertireoidismo' },
    { icon: '🫘', name: 'Creatinina', range: '0.7-1.3 mg/dL', conditions: 'Insuficiência Renal' },
    { icon: '❤️', name: 'Troponina', range: '< 0.04 ng/mL', conditions: 'IAM, Lesão Miocárdica' }
  ]

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-medical-600 to-red-600 text-white rounded-xl p-12 shadow-lg dark:shadow-gray-900">
        <h2 className="text-4xl font-bold mb-4">Bem-vindo ao ECG Analyzer</h2>
        <p className="text-lg mb-2 opacity-90">
          Sistema avançado de análise de eletrocardiogramas com motor de diagnóstico integrado
        </p>
        <p className="text-md mb-8 opacity-75">
          100+ diagnósticos • 14 sinais vitais • 30+ síndromes combinadas • Análise de imagens
        </p>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => onNavigate('analyzer')}
            data-onboard="analyzer"
            className="bg-white dark:bg-gray-800 text-medical-600 dark:text-medical-400 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition-all shadow-md dark:shadow-gray-900/50 hover:shadow-lg"          >
            🚀 Iniciar Análise
          </button>
          <button
            onClick={() => onNavigate('analyzer')}
            className="bg-white/20 text-white px-8 py-3 rounded-lg font-bold hover:bg-white/30 transition-all border border-white/30"
          >
            🎲 Dados Simulados
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div>
        <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Visão Geral</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard
            icon={Heart}
            title="Diagnósticos"
            value="100+"
            color="red"
          />
          <StatsCard
            icon={FlaskConical}
            title="Sinais Vitais"
            value="14"
            color="blue"
          />
          <StatsCard
            icon={ShieldAlert}
            title="Síndromes"
            value="30+"
            color="yellow"
          />
          <StatsCard
            icon={BarChart3}
            title="Padrões ECG"
            value="20+"
            color="purple"
          />
        </div>
      </div>

      {/* Features */}
      <div>
        <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Funcionalidades Principais</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md dark:shadow-gray-900/50 hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start gap-4">
                     <div className="p-3 bg-medical-50 dark:bg-medical-900/20 rounded-lg flex-shrink-0">
                    <Icon className="w-6 h-6 text-medical-600" />
                  </div>
                  <div>
                     <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">{feature.title}</h4>
                     <p className="text-gray-600 dark:text-gray-400 text-sm">{feature.description}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Diagnostic Categories */}
      <div>
        <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Categorias de Diagnóstico</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {diagnosticCategories.map((category, index) => {
             const colors = {
               red: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100',
               blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100',
               green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-900 dark:text-green-100',
               purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-100',
               yellow: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-900 dark:text-yellow-100',
               orange: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-900 dark:text-orange-100'
             }
            const colorClass = colors[category.color]

            return (
              <div key={index} className={`${colorClass} border p-4 rounded-lg text-center`}>
                <p className="font-bold text-2xl">{category.count}</p>
                <p className="text-sm font-medium">{category.name}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Vital Signs Grid */}
      <div data-onboard="vitals" className="bg-gradient-to-r from-medical-50 to-blue-50 dark:from-gray-800 dark:to-gray-800 border-2 border-medical-300 dark:border-gray-700 rounded-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-8 h-8 text-medical-600" />
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">🧪 14 Sinais Vitais e Laboratoriais</h3>
        </div>

         <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg font-semibold">
          Adicione parâmetros clínicos para detetar 30+ condições e síndromes combinadas:
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
          {vitalSignsNew.map((vital, index) => (
             <div key={index} className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{vital.icon}</span>
                <span className="font-bold text-sm text-gray-900 dark:text-gray-100">{vital.name}</span>
              </div>
               <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{vital.range}</p>
              <p className="text-xs text-medical-600 font-medium">{vital.conditions}</p>
            </div>
          ))}
        </div>

        {/* Syndrome Groups */}
         <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">🔗 30+ Síndromes Combinadas Detectáveis</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {syndromeGroups.map((group, idx) => {
            const borderColors = {
              blue: 'border-blue-500',
              green: 'border-green-500',
              purple: 'border-purple-500',
              red: 'border-red-500',
              yellow: 'border-yellow-500',
              orange: 'border-orange-500'
            }
            return (
               <div key={idx} className={`bg-white dark:bg-gray-800 p-4 rounded-lg border-l-4 ${borderColors[group.color]}`}>
                 <p className="font-bold text-gray-900 dark:text-gray-100 mb-2">{group.title}</p>
                 <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  {group.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-1">
                       <span className="text-medical-500 dark:text-medical-400 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>

      {/* ECG Features Section */}
      <div data-onboard="features" className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-800 border-2 border-purple-300 dark:border-gray-700 rounded-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <Microscope className="w-8 h-8 text-purple-600" />
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">🔬 20+ Padrões ECG Visuais</h3>
        </div>

         <p className="text-gray-700 dark:text-gray-300 mb-4 text-lg font-semibold">
          Selecione o que observa na imagem do ECG para detetar condições específicas:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="font-bold text-red-700 mb-2">⚡ Eletrólitos</p>
             <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Ondas T altas e picudas (K+ ↑)</li>
              <li>• Ondas U proeminentes (K+ ↓)</li>
              <li>• Ondas de Osborn (hipotermia)</li>
              <li>• Padrão Sine Wave (K+ extremo)</li>
            </ul>
          </div>

           <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="font-bold text-red-700 mb-2">🔴 Isquemia / IAM</p>
             <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Supradesnivelamento ST (IAM)</li>
              <li>• Infradesnivelamento ST (isquemia)</li>
              <li>• Inversão onda T (isquemia)</li>
              <li>• ST difuso (pericardite)</li>
            </ul>
          </div>

           <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="font-bold text-purple-700 mb-2">💓 Ritmo / Condução</p>
             <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Fibrilação auricular</li>
              <li>• Flutter auricular</li>
              <li>• BAV 1º/2º/3º grau</li>
              <li>• Bloqueio de ramo</li>
            </ul>
          </div>

           <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="font-bold text-yellow-700 mb-2">⚠️ Síndromes</p>
             <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Onda delta (WPW)</li>
              <li>• QT longo (Torsades)</li>
              <li>• QT curto</li>
              <li>• Efeito digitálico (ST "cuba")</li>
            </ul>
          </div>

           <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="font-bold text-green-700 mb-2">🫀 Sobrecargas</p>
             <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Sobrecarga VE (HVE)</li>
              <li>• Sobrecarga VD (HVD)</li>
              <li>• Baixa voltagem</li>
              <li>• QRS alargado</li>
            </ul>
          </div>

           <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="font-bold text-blue-700 mb-2">📋 Outros</p>
             <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Ondas P ausentes</li>
              <li>• PR prolongado</li>
              <li>• Bradicardia</li>
              <li>• Taquicardia</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => onNavigate('analyzer')}
            className="bg-medical-600 hover:bg-medical-700 text-white font-bold py-4 px-6 rounded-lg transition-all shadow-md hover:shadow-lg"
          >
            📊 Upload de ECG
          </button>
          <button
            onClick={() => onNavigate('analyzer')}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition-all shadow-md hover:shadow-lg"
          >
            🖼️ Upload de Imagem
          </button>
          <button
            onClick={() => onNavigate('analyzer')}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-lg transition-all shadow-md hover:shadow-lg"
          >
            🎲 Dados Simulados
          </button>
          <button
            onClick={() => {
              const sr = 250
              const dp = 250 * 10
              // ECG Normal (senoide basal)
              const normalData = []
              for (let i = 0; i < dp; i++) {
                const t = i / sr
                normalData.push(0.1 + Math.sin(2 * Math.PI * (72 / 60) * t) * 0.3 * Math.exp(-Math.abs(Math.sin(2 * Math.PI * 5 * (t % 0.2))) * 0.1))
              }
              // ECG Infarto (senoide com ST elevation simulado)
              const infarctionData = []
              for (let i = 0; i < dp; i++) {
                const t = i / sr
                const base = 0.1 + Math.sin(2 * Math.PI * (72 / 60) * t) * 0.3 * Math.exp(-Math.abs(Math.sin(2 * Math.PI * 5 * (t % 0.2))) * 0.1)
                // Add ST elevation in certain samples (simulated)
                const stElevation = i > dp / 2 && i < dp * 3 / 4 ? 0.2 * Math.sin(2 * Math.PI * (i - dp / 2) / (dp / 4)) : 0
                infarctionData.push(base + stElevation)
              }
              setNormalEcgData({ data: normalData, samplingRate: sr })
              setInfarctionEcgData({ data: infarctionData, samplingRate: sr })
              setShowComparison(true)
            }}
            className="bg-medical-600 hover:bg-medical-700 text-white font-bold py-4 px-6 rounded-lg transition-all shadow-md hover:shadow-lg mr-4"
          >
            📈 Comparar ECG Normal vs Infarto
          </button>
        </div>
      </div>

      {/* Seletor de Casos de Estudo */}
      <div className="mt-4 text-sm">
        <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">📚 Casos de Estudo</h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setEcgData({ data: normalEcgData?.data, samplingRate: 250, source: 'ECG Normal', isImage: false })}
            className={`
              bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-600 ${
                selectedCase === 'normal'
                  ? 'border-medical-600 text-medical-600'
                  : ''
              } transition-all`
            }
            title="ECG Normal">
            ✅ Normal
          </button>
          <button
            onClick={() => setEcgData({
              data: new Array(2500).fill(0).map((_, i) => 0.1 + Math.sin(2 * Math.PI * (50 / 60) * (i / 250)) * 0.3),
              samplingRate: 250,
              source: 'Caso: Bradicardia',
              isImage: false
            })}
            className={`
              bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-600 ${
                selectedCase === 'bradicardia'
                  ? 'border-medical-600 text-medical-600'
                  : ''
              } transition-all`
            }
            title="Bradicardia">
            ✅ Bradicardia
          </button>
          <button
            onClick={() => setEcgData({
              data: new Array(2500).fill(0).map((_, i) => 0.1 + Math.sin(2 * Math.PI * (120 / 60) * (i / 250)) * 0.3),
              samplingRate: 250,
              source: 'Caso: Taquicardia',
              isImage: false
            })}
            className={`
              bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-600 ${
                selectedCase === 'taquicardia'
                  ? 'border-medical-600 text-medical-600'
                  : ''
              } transition-all`
            }
            title="Taquicardia">
            ✅ Taquicardia
          </button>
          <button
            onClick={() => setEcgData({
              data: new Array(2500).fill(0).map((_, i) => {
                const t = i / 250
                const peak = Math.random() > 0.5 ? 0.5 : -0.4
                return peak * Math.sin(2 * Math.PI * (60 / 60) * t)
              }),
              samplingRate: 250,
              source: 'Caso: Fibrilação Atrial',
              isImage: false
            })}
            className={`
              bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-600 ${
                selectedCase === 'fibrilação_atrial'
                  ? 'border-medical-600 text-medical-600'
                  : ''
              } transition-all`
            }
            title="Fibrilação Atrial">
            ✅ Fibrilação Atrial
          </button>
          <button
            onClick={() => setEcgData({
              data: new Array(2500).fill(0).map((_, i) => {
                const t = i / 250
                return 0.1 + Math.sin(2 * Math.PI * (150 / 60) * t) * 0.2 * Math.sin(2 * Math.PI * 3 * t)
              }),
              samplingRate: 250,
              source: 'Caso: Flutter',
              isImage: false
            })}
            className={`
              bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-600 ${
                selectedCase === 'flutter'
                  ? 'border-medical-600 text-medical-600'
                  : ''
              } transition-all`
            }
            title="Flutter">
            ✅ Flutter
          </button>
          <button
            onClick={() => setEcgData({
              data: new Array(2500).fill(0).map((_, i) => {
                const t = i / 250
                const prFactor = 1 + 0.2 * Math.sin(2 * Math.PI * (5 / 60) * t)
                return 0.1 + Math.sin(2 * Math.PI * (70 / 60) * t) * 0.3 * prFactor
              }),
              samplingRate: 250,
              source: 'Caso: BAV 1º Grau',
              isImage: false
            })}
            className={`
              bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-600 ${
                selectedCase === 'bav_1_grau'
                  ? 'border-medical-600 text-medical-600'
                  : ''
              } transition-all`
            }
            title="BAV 1º Grau">
            ✅ BAV 1º Grau
          </button>
          <button
            onClick={() => setEcgData({
              data: new Array(2500).fill(0).map((_, i) => {
                const t = i / 250
                if (i % 4 === 0) {
                  return 0.1 + Math.sin(2 * Math.PI * (60 / 60) * t) * 0.1
                } else {
                  return 0.1 + Math.sin(2 * Math.PI * (75 / 60) * t) * 0.3
                }
              }),
              samplingRate: 250,
              source: 'Caso: BAV 2º Grau',
              isImage: false
            })}
            className={`
              bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-600 ${
                selectedCase === 'bav_2_grau'
                  ? 'border-medical-600 text-medical-600'
                  : ''
              } transition-all`
            }
            title="BAV 2º Grau">
            ✅ BAV 2º Grau
          </button>
          <button
            onClick={() => setEcgData({
              data: new Array(2500).fill(0).map((_, i) => {
                const t = i / 250
                return 0.1 + Math.sin(2 * Math.PI * (100 / 60) * t) * 0.2 * (i % 3 === 0 ? 1 : -0.5)
              }),
              samplingRate: 250,
              source: 'Caso: BAV Total',
              isImage: false
            })}
            className={`
              bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-600 ${
                selectedCase === 'bav_total'
                  ? 'border-medical-600 text-medical-600'
                  : ''
              } transition-all`
            }
            title="BAV Total">
            ✅ BAV Total
          </button>
          <button
            onClick={() => setEcgData({
              data: new Array(2500).fill(0).map((_, i) => {
                const t = i / 250
                const base = 0.1 + Math.sin(2 * Math.PI * (72 / 60) * t) * 0.3
                const stElev = i > 2500 / 3 && i < 2500 * 2 / 3 ? 0.3 * Math.sin(2 * Math.PI * (i - 2500 / 3) / (2500 / 3)) : 0
                return base + stElev
              }),
              samplingRate: 250,
              source: 'Caso: IAM com Supra',
              isImage: false
            })}
            className={`
              bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-600 ${
                selectedCase === 'iam_supra'
                  ? 'border-medical-600 text-medical-600'
                  : ''
              } transition-all`
            }
            title="IAM com Supra">
            ✅ IAM com Supra
          </button>
          <button
            onClick={() => setEcgData({
              data: new Array(2500).fill(0).map((_, i) => {
                const t = i / 250
                const base = 0.1 + Math.sin(2 * Math.PI * (72 / 60) * t) * 0.3
                const stDepr = i > 2500 / 4 && i < 2500 * 3 / 4 ? -0.15 * Math.sin(2 * Math.PI * (i - 2500 / 4) / (2500 / 2)) : 0
                return base + stDepr
              }),
              samplingRate: 250,
              source: 'Caso: IAM sem Supra',
              isImage: false
            })}
            className={`
              bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-600 ${
                selectedCase === 'iam_sem_supra'
                  ? 'border-medical-600 text-medical-600'
                  : ''
              } transition-all`
            }
            title="IAM sem Supra">
            ✅ IAM sem Supra
          </button>
          <button
            onClick={() => setEcgData({
              data: new Array(2500).fill(0).map((_, i) => {
                const t = i / 250
                const tWave = i % 10 === 0 ? 0.5 * Math.sin(2 * Math.PI * (0.25 / 60) * t) : 0
                return 0.1 + Math.sin(2 * Math.PI * (65 / 60) * t) * 0.3 + tWave
              }),
              samplingRate: 250,
              source: 'Caso: Hipercalemia',
              isImage: false
            })}
            className={`
              bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-600 ${
                selectedCase === 'hipercalemia'
                  ? 'border-medical-600 text-medical-600'
                  : ''
              } transition-all`
            }
            title="Hipercalemia">
            ✅ Hipercalemia
          </button>
          <button
            onClick={() => setEcgData({
              data: new Array(2500).fill(0).map((_, i) => {
                const t = i / 250
                const qrsPos = i % 10
                const uWave = qrsPos > 6 ? 0.3 * Math.sin(2 * Math.PI * (0.1 / 60) * (t - qrsPos * 0.1)) : 0
                return 0.1 + Math.sin(2 * Math.PI * (55 / 60) * t) * 0.3 + uWave
              }),
              samplingRate: 250,
              source: 'Caso: Hipocalemia',
              isImage: false
            })}
            className={`
              bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-600 ${
                selectedCase === 'hipocalemia'
                  ? 'border-medical-600 text-medical-600'
                  : ''
              } transition-all`
            }
            title="Hipocalemia">
            ✅ Hipocalemia
          </button>
          <button
            onClick={() => setEcgData({
              data: new Array(2500).fill(0).map((_, i) => {
                const t = i / 250
                const deltaWave = i % 5 === 0 ? 0.5 * Math.sin(2 * Math.PI * 8 * t) : 0
                return 0.1 + Math.sin(2 * Math.PI * (80 / 60) * t) * 0.3 + deltaWave
              }),
              samplingRate: 250,
              source: 'Caso: WPW',
              isImage: false
            })}
            className={`
              bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-600 ${
                selectedCase === 'wpw'
                  ? 'border-medical-600 text-medical-600'
                  : ''
              } transition-all`
            }
            title="WPW">
            ✅ WPW
          </button>
          <button
            onClick={() => setEcgData({
              data: new Array(2500).fill(0).map((_, i) => {
                const t = i / 250
                return 0.1 + Math.sin(2 * Math.PI * (60 / 60) * t) * 0.3
              }),
              samplingRate: 250,
              source: 'Caso: QT Longo',
              isImage: false
            })}
            className={`
              bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-600 ${
                selectedCase === 'qt_longo'
                  ? 'border-medical-600 text-medical-600'
                  : ''
              } transition-all`
            }
            title="QT Longo">
            ✅ QT Longo
          </button>
          <button
            onClick={() => setEcgData({
              data: new Array(2500).fill(0).map((_, i) => {
                const t = i / 250
                const jWave = i % 20 > 15 ? -0.2 * Math.sin(2 * Math.PI * (2 / 60) * (t - (i % 20) * 0.05)) : 0
                return 0.1 + Math.sin(2 * Math.PI * (65 / 60) * t) * 0.3 + jWave
              }),
              samplingRate: 250,
              source: 'Caso: Brugada',
              isImage: false
            })}
            className={`
              bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-600 ${
                selectedCase === 'brugada'
                  ? 'border-medical-600 text-medical-600'
                  : ''
              } transition-all`
            }
            title="Brugada">
            ✅ Brugada
          </button>
          <button
            onClick={() => setEcgData({
              data: new Array(2500).fill(0).map((_, i) => {
                const t = i / 250
                const base = 0.1 + Math.sin(2 * Math.PI * (60 / 60) * t) * 0.3
                const rotation = 0.1 * Math.sin(2 * Math.PI * (0.1 / 60) * t)
                return base + rotation
              }),
              samplingRate: 250,
              source: 'Caso: Torsades',
              isImage: false
            })}
            className={`
              bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-600 ${
                selectedCase === 'torsades'
                  ? 'border-medical-600 text-medical-600'
                  : ''
              } transition-all`
            }
            title="Torsades de Pointes">
            ✅ Torsades
          </button>
          <button
            onClick={() => setEcgData({
              data: new Array(2500).fill(0).map((_, i) => {
                const t = i / 250
                const qrsDepth = i % 15 > 10 ? -0.3 : 0
                return 0.1 + Math.sin(2 * Math.PI * (70 / 60) * t) * 0.3 + qrsDepth
              }),
              samplingRate: 250,
              source: 'Caso: Embolia Pulmonar',
              isImage: false
            })}
            className={`
              bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-600 ${
                selectedCase === 'embolia_pulmonar'
                  ? 'border-medical-600 text-medical-600'
                  : ''
              } transition-all`
            }
            title="Embolia Pulmonar">
            ✅ Embolia Pulmonar
          </button>
          <button
            onClick={() => setEcgData({
              data: new Array(2500).fill(0).map((_, i) => {
                const t = i / 250
                const stElev = 0.1 * Math.sin(2 * Math.PI * (0.5 / 60) * t)
                return 0.1 + Math.sin(2 * Math.PI * (68 / 60) * t) * 0.3 + stElev
              }),
              samplingRate: 250,
              source: 'Caso: Pericardite',
              isImage: false
            })}
            className={`
              bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-600 ${
                selectedCase === 'pericardite'
                  ? 'border-medical-600 text-medical-600'
                  : ''
              } transition-all`
            }
            title="Pericardite">
            ✅ Pericardite
          </button>
          <button
            onClick={() => setEcgData({
              data: new Array(2500).fill(0).map((_, i) => {
                const t = i / 250
                const stDepr = -0.1 * Math.sin(2 * Math.PI * (0.3 / 60) * t)
                return 0.1 + Math.sin(2 * Math.PI * (72 / 60) * t) * 0.3 + stDepr
              }),
              samplingRate: 250,
              source: 'Caso: Miocardite',
              isImage: false
            })}
            className={`
              bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-600 ${
                selectedCase === 'miocardite'
                  ? 'border-medical-600 text-medical-600'
                  : ''
              } transition-all`
            }
            title="Miocardite">
            ✅ Miocardite
          </button>
          <button
            onClick={() => setEcgData({
              data: new Array(2500).fill(0).map((_, i) => {
                const t = i / 250
                return 0.1 + Math.sin(2 * Math.PI * (110 / 60) * t) * 0.3 * Math.sin(2 * Math.PI * 0.5 * t)
              }),
              samplingRate: 250,
              source: 'Caso: Choque Séptico',
              isImage: false
            })}
            className={`
              bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-600 ${
                selectedCase === 'choque_setico'
                  ? 'border-medical-600 text-medical-600'
                  : ''
              } transition-all`
            }
            title="Choque Séptico">
            ✅ Choque Séptico
          </button>
        </div>
      </div>

      {/* Exibição do ECG do caso selecionado */}
      {ecgData && (
        <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">📊 ECG - {ecgData.source || 'Caso Selecionado'}</h3>
          <ECGChart
            data={ecgData.data}
            title={ecgData.source || 'ECG Normal'}
            samplingRate={ecgData.samplingRate || 250}
            highlightRegions={null}
          />
        </div>
      )}

      {/* Outros projetos da área de saúde */}
      <div className="mt-4 text-sm text-center">
        <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">📦 Outros projetos</h4>
        <div className="flex justify-center gap-4">
          <a
            href="https://corpo-humano-jr7o-git-master-gasperpbs-projects.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline"
          >
            🩺 Corpo Humano
          </a>
          <a
            href="https://site-diabetes.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline"
          >
            📊 Controle Diabetes
          </a>
        </div>
      </div>

      {/* Comparação de ECG */}
      {showComparison && (
        <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">📊 Comparação de ECGs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ECGChart
              data={normalEcgData?.data}
              title="ECG Normal (Sinusal)"
              samplingRate={normalEcgData?.samplingRate || 250}
            />
            <ECGChart
              data={infarctionEcgData?.data}
              title="ECG com Infarto (ST Elevation)"
              samplingRate={infarctionEcgData?.samplingRate || 250}
            />
          </div>
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-blue-900 dark:text-blue-100 font-medium">ECG Normal:</p>
            <p className="text-blue-800 dark:text-blue-200 text-sm">Ritmo sinusal, BPM ~72, QRS normal, ST segment isóseo</p>
            <p className="text-blue-900 dark:text-blue-100 font-medium mt-2">ECG Infarto:</p>
            <p className="text-blue-800 dark:text-blue-200 text-sm mt-1">Ritmo sinusal com supradesnivelamento ST, BPM ~78, QRS ligeramente amplio, elevación del segmento ST</p>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-800 rounded-lg p-6">
        <h4 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-3">ℹ️ Informações do Sistema</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <ul className="text-blue-800 dark:text-blue-200 text-sm space-y-2">
            <li>• <span className="font-semibold">Formatos de dados:</span> CSV, JSON</li>
            <li>• <span className="font-semibold">Formatos de imagem:</span> PNG, JPG, JPEG, BMP</li>
            <li>• <span className="font-semibold">Tamanho máximo:</span> 10MB</li>
            <li>• <span className="font-semibold">Taxa de amostragem:</span> 250-500 Hz</li>
          </ul>
           <ul className="text-blue-800 dark:text-blue-200 text-sm space-y-2">
            <li>• <span className="font-semibold">Diagnósticos:</span> 100+ (ECG + Vitais + Síndromes)</li>
            <li>• <span className="font-semibold">Sinais Vitais:</span> 14 parâmetros opcionais</li>
            <li>• <span className="font-semibold">Padrões ECG:</span> 20+ selecionáveis</li>
            <li>• <span className="font-semibold">Backend:</span> Node.js/Express em localhost:8080</li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-8 mt-8">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-800 rounded-lg p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
            🏥 <span className="font-semibold">ECG Analyzer</span> - Sistema Inteligente de Análise Cardíaca
          </p>
            <p className="text-gray-500 dark:text-gray-400 text-xs">
            Desenvolvido por 
            <span className="font-bold text-medical-600 ml-1">Achillesdev</span>
            {' '}|{' '}
            <span className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer">GitHub</span>
            {' '}|{' '}
            <span className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer">Portfolio</span>
            {' '}|{' '}
            <span className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer">gasperpb</span>
          </p>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-3 italic">
            ⚠️ Para fins educacionais e de referência. Não substitui avaliação médica profissional.
          </p>
        </div>
      </div>
    </div>
  )
}
