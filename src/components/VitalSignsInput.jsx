import React, { useState } from 'react'
import { ChevronDown, ChevronUp, AlertCircle } from 'lucide-react'

export default function VitalSignsInput({ onUpdate }) {
  const [expanded, setExpanded] = useState(false)
  const [vitalSigns, setVitalSigns] = useState({
    spO2: '',              // Oximetria (SpO2) - 95-100%
    glucose: '',           // Glicose - 70-100 mg/dL em jejum
    systolic: '',          // Pressão Sistólica - < 120 mmHg
    diastolic: '',         // Pressão Diastólica - < 80 mmHg
    temperature: '',       // Temperatura - 36.5-37.5°C
    respiratoryRate: '',   // Frequência Respiratória - 12-20 bpm
    hemoglobin: '',        // Hemoglobina - 13.5-17.5 g/dL (homens)
    bloodType: '',         // Tipo sanguíneo - A, B, AB, O
    medicalHistory: '',    // Histórico médico
    medications: ''        // Medicamentos em uso
  })

  const [errors, setErrors] = useState({})

  // Validar valores
  const validateValue = (field, value) => {
    if (!value) return null
    const num = parseFloat(value)

    const ranges = {
      spO2: { min: 70, max: 100, unit: '%', name: 'SpO2' },
      glucose: { min: 20, max: 600, unit: 'mg/dL', name: 'Glicose' },
      systolic: { min: 50, max: 200, unit: 'mmHg', name: 'Sistólica' },
      diastolic: { min: 30, max: 150, unit: 'mmHg', name: 'Diastólica' },
      temperature: { min: 35, max: 42, unit: '°C', name: 'Temperatura' },
      respiratoryRate: { min: 5, max: 40, unit: 'bpm', name: 'Freq. Respiratória' },
      hemoglobin: { min: 5, max: 20, unit: 'g/dL', name: 'Hemoglobina' }
    }

    const range = ranges[field]
    if (range && (num < range.min || num > range.max)) {
      return `${range.name} deve estar entre ${range.min}-${range.max} ${range.unit}`
    }
    return null
  }

  const handleChange = (field, value) => {
    setVitalSigns(prev => ({ ...prev, [field]: value }))

    // Validar em tempo real
    const error = validateValue(field, value)
    setErrors(prev => ({
      ...prev,
      [field]: error
    }))

    // Notificar parent apenas com valores válidos
    const validSigns = {}
    Object.entries({ ...vitalSigns, [field]: value }).forEach(([key, val]) => {
      if (val && !validateValue(key, val)) {
        validSigns[key] = parseFloat(val) || val
      }
    })
    onUpdate(validSigns)
  }

  const getStatusIcon = (field) => {
    if (!vitalSigns[field]) return null

    const num = parseFloat(vitalSigns[field])
    const ranges = {
      spO2: { ideal: [95, 100], warning: [90, 94], danger: [0, 89] },
      glucose: { ideal: [70, 100], warning: [101, 125], danger: [126, 600] },
      systolic: { ideal: [100, 120], warning: [121, 130], danger: [131, 200] },
      diastolic: { ideal: [60, 80], warning: [81, 90], danger: [91, 150] },
      temperature: { ideal: [36.5, 37.5], warning: [36.0, 37.9], danger: [35, 42] },
      respiratoryRate: { ideal: [12, 20], warning: [10, 11], danger: [5, 9] },
      hemoglobin: { ideal: [13.5, 17.5], warning: [12, 13.4], danger: [5, 11] }
    }

    const range = ranges[field]
    if (!range) return null

    if (num >= range.ideal[0] && num <= range.ideal[1]) return '✓'
    if (num >= range.warning[0] && num <= range.warning[1]) return '⚠'
    return '✗'
  }

  const getStatusColor = (field) => {
    const icon = getStatusIcon(field)
    if (icon === '✓') return 'text-green-600'
    if (icon === '⚠') return 'text-yellow-600'
    if (icon === '✗') return 'text-red-600'
    return 'text-gray-400'
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-medical-100 rounded-lg flex items-center justify-center">
            <span className="text-lg">💊</span>
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">Sinais Vitais Adicionais</h3>
            <p className="text-xs text-gray-500">Opcional - Adiciona precisão ao diagnóstico</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {Object.entries(vitalSigns).some(([k, v]) => v && k !== 'bloodType' && k !== 'medicalHistory' && k !== 'medications') && (
            <span className="text-sm font-semibold text-medical-600 bg-medical-50 px-3 py-1 rounded">
              {Object.entries(vitalSigns).filter(([k, v]) => v && k !== 'bloodType' && k !== 'medicalHistory' && k !== 'medications').length} adicionados
            </span>
          )}
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Content */}
      {expanded && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          {/* Info Box */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold">💡 Dica</p>
              <p>Adicione sinais vitais para diagnósticos mais precisos. Todos os campos são opcionais.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Oximetria (SpO2) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Oximetria (SpO2) {getStatusIcon('spO2') && <span className={getStatusColor('spO2')}>{getStatusIcon('spO2')}</span>}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="70"
                  max="100"
                  step="0.1"
                  placeholder="95"
                  value={vitalSigns.spO2}
                  onChange={(e) => handleChange('spO2', e.target.value)}
                  className={`flex-1 px-3 py-2 border rounded-lg text-sm ${
                    errors.spO2 ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                />
                <span className="text-sm text-gray-500 py-2">%</span>
              </div>
              {errors.spO2 && <p className="text-xs text-red-600 mt-1">{errors.spO2}</p>}
              <p className="text-xs text-gray-500 mt-1">Normal: 95-100%</p>
            </div>

            {/* Glicose */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Glicose {getStatusIcon('glucose') && <span className={getStatusColor('glucose')}>{getStatusIcon('glucose')}</span>}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="20"
                  max="600"
                  step="1"
                  placeholder="85"
                  value={vitalSigns.glucose}
                  onChange={(e) => handleChange('glucose', e.target.value)}
                  className={`flex-1 px-3 py-2 border rounded-lg text-sm ${
                    errors.glucose ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                />
                <span className="text-sm text-gray-500 py-2">mg/dL</span>
              </div>
              {errors.glucose && <p className="text-xs text-red-600 mt-1">{errors.glucose}</p>}
              <p className="text-xs text-gray-500 mt-1">Jejum: 70-100 mg/dL</p>
            </div>

            {/* Pressão Sistólica */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Pressão Sistólica {getStatusIcon('systolic') && <span className={getStatusColor('systolic')}>{getStatusIcon('systolic')}</span>}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="50"
                  max="200"
                  step="1"
                  placeholder="120"
                  value={vitalSigns.systolic}
                  onChange={(e) => handleChange('systolic', e.target.value)}
                  className={`flex-1 px-3 py-2 border rounded-lg text-sm ${
                    errors.systolic ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                />
                <span className="text-sm text-gray-500 py-2">mmHg</span>
              </div>
              {errors.systolic && <p className="text-xs text-red-600 mt-1">{errors.systolic}</p>}
              <p className="text-xs text-gray-500 mt-1">Normal: &lt; 120 mmHg</p>
            </div>

            {/* Pressão Diastólica */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Pressão Diastólica {getStatusIcon('diastolic') && <span className={getStatusColor('diastolic')}>{getStatusIcon('diastolic')}</span>}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="30"
                  max="150"
                  step="1"
                  placeholder="80"
                  value={vitalSigns.diastolic}
                  onChange={(e) => handleChange('diastolic', e.target.value)}
                  className={`flex-1 px-3 py-2 border rounded-lg text-sm ${
                    errors.diastolic ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                />
                <span className="text-sm text-gray-500 py-2">mmHg</span>
              </div>
              {errors.diastolic && <p className="text-xs text-red-600 mt-1">{errors.diastolic}</p>}
              <p className="text-xs text-gray-500 mt-1">Normal: &lt; 80 mmHg</p>
            </div>

            {/* Temperatura */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Temperatura {getStatusIcon('temperature') && <span className={getStatusColor('temperature')}>{getStatusIcon('temperature')}</span>}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="35"
                  max="42"
                  step="0.1"
                  placeholder="37"
                  value={vitalSigns.temperature}
                  onChange={(e) => handleChange('temperature', e.target.value)}
                  className={`flex-1 px-3 py-2 border rounded-lg text-sm ${
                    errors.temperature ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                />
                <span className="text-sm text-gray-500 py-2">°C</span>
              </div>
              {errors.temperature && <p className="text-xs text-red-600 mt-1">{errors.temperature}</p>}
              <p className="text-xs text-gray-500 mt-1">Normal: 36.5-37.5°C</p>
            </div>

            {/* Frequência Respiratória */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Frequência Respiratória {getStatusIcon('respiratoryRate') && <span className={getStatusColor('respiratoryRate')}>{getStatusIcon('respiratoryRate')}</span>}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="5"
                  max="40"
                  step="1"
                  placeholder="16"
                  value={vitalSigns.respiratoryRate}
                  onChange={(e) => handleChange('respiratoryRate', e.target.value)}
                  className={`flex-1 px-3 py-2 border rounded-lg text-sm ${
                    errors.respiratoryRate ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                />
                <span className="text-sm text-gray-500 py-2">bpm</span>
              </div>
              {errors.respiratoryRate && <p className="text-xs text-red-600 mt-1">{errors.respiratoryRate}</p>}
              <p className="text-xs text-gray-500 mt-1">Normal: 12-20 bpm</p>
            </div>

            {/* Hemoglobina */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Hemoglobina {getStatusIcon('hemoglobin') && <span className={getStatusColor('hemoglobin')}>{getStatusIcon('hemoglobin')}</span>}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="5"
                  max="20"
                  step="0.1"
                  placeholder="15"
                  value={vitalSigns.hemoglobin}
                  onChange={(e) => handleChange('hemoglobin', e.target.value)}
                  className={`flex-1 px-3 py-2 border rounded-lg text-sm ${
                    errors.hemoglobin ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                />
                <span className="text-sm text-gray-500 py-2">g/dL</span>
              </div>
              {errors.hemoglobin && <p className="text-xs text-red-600 mt-1">{errors.hemoglobin}</p>}
              <p className="text-xs text-gray-500 mt-1">Homens: 13.5-17.5 g/dL</p>
            </div>

            {/* Tipo Sanguíneo */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Tipo Sanguíneo
              </label>
              <select
                value={vitalSigns.bloodType}
                onChange={(e) => handleChange('bloodType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">Selecione...</option>
                <option value="O-">O-</option>
                <option value="O+">O+</option>
                <option value="A-">A-</option>
                <option value="A+">A+</option>
                <option value="B-">B-</option>
                <option value="B+">B+</option>
                <option value="AB-">AB-</option>
                <option value="AB+">AB+</option>
              </select>
            </div>

            {/* Medicamentos */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Medicamentos em Uso
              </label>
              <textarea
                placeholder="Ex: Atenolol 50mg, Losartana 50mg, Aspirina 100mg"
                value={vitalSigns.medications}
                onChange={(e) => handleChange('medications', e.target.value)}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">Separados por vírgula</p>
            </div>

            {/* Histórico Médico */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Histórico Médico
              </label>
              <textarea
                placeholder="Ex: Hipertensão, Diabetes tipo 2, Obesidade"
                value={vitalSigns.medicalHistory}
                onChange={(e) => handleChange('medicalHistory', e.target.value)}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">Separados por vírgula</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
