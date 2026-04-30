import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Activity } from 'lucide-react'

export default function ECGFeaturesInput({ onUpdate }) {
  const [expanded, setExpanded] = useState(false)
  const [features, setFeatures] = useState({
    tallTWaves: false,
    absentPWaves: false,
    wideQRS: false,
    prolongedPR: false,
    sineWave: false,
    stElevation: false,
    stDepression: false,
    tWaveInversion: false,
    arrhythmia: false,
    bradycardia: false,
    tachycardia: false,
    deltaWave: false,
    prolongedQT: false,
    shortQT: false,
    osbornWave: false,
    uWave: false,
    afib: false,
    flutter: false,
    avBlock1: false,
    avBlock2: false,
    avBlock3: false,
    bundleBranchBlock: false,
    lowVoltage: false,
    pericarditisST: false,
    digoxinEffect: false,
    lvh: false,
    rvh: false
  })

  const handleChange = (feature, value) => {
    const updated = { ...features, [feature]: value }
    setFeatures(updated)
    onUpdate(updated)
  }

  const selectedCount = Object.values(features).filter(Boolean).length

  const categories = [
    {
      title: '⚡ Eletrólitos e Metabólicas',
      features: [
        { key: 'tallTWaves', label: 'Ondas T altas e picudas (K+ alto)', severity: 'critical' },
        { key: 'uWave', label: 'Ondas U proeminentes (K+ baixo)', severity: 'warning' },
        { key: 'osbornWave', label: 'Ondas de Osborn (hipotermia)', severity: 'warning' },
        { key: 'lowVoltage', label: 'Baixa voltagem (hipotireoidismo)', severity: 'info' }
      ]
    },
    {
      title: '🔴 Isquemia e IAM',
      features: [
        { key: 'stElevation', label: 'Supradesnivelamento ST (IAM)', severity: 'critical' },
        { key: 'stDepression', label: 'Infradesnivelamento ST (isquemia)', severity: 'warning' },
        { key: 'tWaveInversion', label: 'Inversão onda T (isquemia)', severity: 'warning' },
        { key: 'pericarditisST', label: 'ST difuso + PR deprimido (pericardite)', severity: 'warning' }
      ]
    },
    {
      title: '💓 Ritmo e Condução',
      features: [
        { key: 'afib', label: 'Fibrilação auricular', severity: 'warning' },
        { key: 'flutter', label: 'Flutter auricular', severity: 'warning' },
        { key: 'bradycardia', label: 'Bradicardia (<60 BPM)', severity: 'warning' },
        { key: 'tachycardia', label: 'Taquicardia (>100 BPM)', severity: 'warning' },
        { key: 'arrhythmia', label: 'Arritmia não especificada', severity: 'warning' }
      ]
    },
    {
      title: '🔗 Bloqueios Cardíacos',
      features: [
        { key: 'prolongedPR', label: 'BAV 1º grau (PR >200ms)', severity: 'info' },
        { key: 'avBlock2', label: 'BAV 2º grau', severity: 'warning' },
        { key: 'avBlock3', label: 'BAV 3º grau (completo)', severity: 'critical' },
        { key: 'bundleBranchBlock', label: 'Bloqueio de ramo', severity: 'warning' },
        { key: 'absentPWaves', label: 'Ondas P ausentes', severity: 'warning' }
      ]
    },
    {
      title: '⚠️ Síndromes e Padrões',
      features: [
        { key: 'deltaWave', label: 'Onda delta (WPW)', severity: 'warning' },
        { key: 'prolongedQT', label: 'QT longo (risco Torsades)', severity: 'critical' },
        { key: 'shortQT', label: 'QT curto', severity: 'warning' },
        { key: 'sineWave', label: 'Sine Wave (K+ extremo)', severity: 'critical' },
        { key: 'digoxinEffect', label: 'Efeito digitálico (ST "cuba")', severity: 'info' }
      ]
    },
    {
      title: '🫀 Sobrecargas Cardíacas',
      features: [
        { key: 'lvh', label: 'Sobrecarga VE (Critério Sokolow)', severity: 'warning' },
        { key: 'rvh', label: 'Sobrecarga VD', severity: 'warning' },
        { key: 'wideQRS', label: 'QRS alargado (>120ms)', severity: 'warning' }
      ]
    }
  ]

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">Características do ECG</h3>
            <p className="text-xs text-gray-500">Opcional - Selecione o que observa na imagem</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {selectedCount > 0 && (
            <span className="text-sm font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded">
              {selectedCount} selecionado{selectedCount > 1 ? 's' : ''}
            </span>
          )}
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-4">
          {categories.map((category, idx) => (
            <div key={idx}>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">{category.title}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {category.features.map(({ key, label, severity }) => (
                  <label
                    key={key}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      features[key]
                        ? severity === 'critical'
                          ? 'bg-red-50 border-red-300 text-red-900'
                          : severity === 'warning'
                          ? 'bg-yellow-50 border-yellow-300 text-yellow-900'
                          : 'bg-blue-50 border-blue-300 text-blue-900'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={features[key]}
                      onChange={(e) => handleChange(key, e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
