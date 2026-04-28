/**
 * Advanced Diagnostic Engine
 * Analyzes ECG data along with vital signs for comprehensive diagnosis
 */

export const analyzeDiagnosis = (ecgData, vitalSigns = {}) => {
  const diagnoses = []
  const recommendations = []
  let riskLevel = 'low'
  let overallSeverity = 'normal'

  // ECG-based diagnosis
  const ecgDiagnosis = analyzeECGPatterns(ecgData)
  diagnoses.push(...ecgDiagnosis.diagnoses)
  recommendations.push(...ecgDiagnosis.recommendations)
  if (ecgDiagnosis.riskLevel === 'high') riskLevel = 'high'
  if (ecgDiagnosis.severity === 'critical') overallSeverity = 'critical'
  else if (ecgDiagnosis.severity === 'warning' && overallSeverity !== 'critical') overallSeverity = 'warning'

  // Vital signs-based analysis
  if (Object.keys(vitalSigns).length > 0) {
    const vitalsDiagnosis = analyzeVitalSigns(vitalSigns)
    diagnoses.push(...vitalsDiagnosis.diagnoses)
    recommendations.push(...vitalsDiagnosis.recommendations)
    if (vitalsDiagnosis.riskLevel === 'high') riskLevel = 'high'
    if (vitalsDiagnosis.severity === 'critical') overallSeverity = 'critical'
    else if (vitalsDiagnosis.severity === 'warning' && overallSeverity !== 'critical') overallSeverity = 'warning'
  }

  // Combined analysis
  const combinedDiagnosis = analyzeCombinedConditions(ecgData, vitalSigns)
  diagnoses.push(...combinedDiagnosis.diagnoses)
  recommendations.push(...combinedDiagnosis.recommendations)

  // Remove duplicates
  const uniqueDiagnoses = diagnoses.reduce((acc, curr) => {
    if (!acc.find(d => d.name === curr.name)) {
      acc.push(curr)
    }
    return acc
  }, [])

  const uniqueRecommendations = [...new Set(recommendations)]

  return {
    diagnoses: uniqueDiagnoses.sort((a, b) => {
      const severityOrder = { critical: 0, danger: 1, warning: 2, attention: 3, normal: 4 }
      return severityOrder[a.severity] - severityOrder[b.severity]
    }),
    recommendations: uniqueRecommendations,
    riskLevel,
    overallSeverity,
    summaryInterpretation: generateInterpretation(uniqueDiagnoses, ecgData, vitalSigns)
  }
}

// Analyze ECG patterns
const analyzeECGPatterns = (ecgData) => {
  const diagnoses = []
  const recommendations = []
  let riskLevel = 'low'
  let severity = 'normal'

  const bpm = ecgData.bpm || 72
  const rhythm = ecgData.rhythm || 'Sinusal Normal'
  const pr = ecgData.pr || 160
  const qrs = ecgData.qrs || 80
  const qt = ecgData.qt || 400

  // Heart rate analysis
  if (bpm < 60) {
    diagnoses.push({
      name: 'Bradicardia',
      severity: bpm < 40 ? 'critical' : 'warning',
      description: `Frequência cardíaca baixa: ${bpm} BPM`,
      details: {
        'Frequência': `${bpm} BPM`,
        'Classificação': bpm < 40 ? 'Bradicardia Severa' : 'Bradicardia Moderada'
      },
      recommendation: 'Avaliação cardiológica imediata recomendada',
      commonCauses: ['Hipotireoidismo', 'Bloqueio AV', 'Hipervagotonia', 'Atletas treinados']
    })
    riskLevel = 'high'
    severity = bpm < 40 ? 'critical' : 'warning'
  } else if (bpm > 100) {
    diagnoses.push({
      name: 'Taquicardia',
      severity: bpm > 120 ? 'warning' : 'attention',
      description: `Frequência cardíaca elevada: ${bpm} BPM`,
      details: {
        'Frequência': `${bpm} BPM`,
        'Classificação': bpm > 120 ? 'Taquicardia Severa' : 'Taquicardia Moderada'
      },
      recommendation: 'Investigar causa: stress, cafeína, febre, etc.',
      commonCauses: ['Ansiedade', 'Febre', 'Hipertireoidismo', 'Anemia', 'Exercício']
    })
    if (bpm > 120) {
      riskLevel = 'high'
      severity = 'warning'
    }
  }

  // Rhythm analysis
  if (rhythm !== 'Sinusal Normal') {
    const rhythmSeverity = {
      'Fibrilação Atrial': 'warning',
      'Flutter Atrial': 'warning',
      'Taquicardia Supraventricular': 'attention',
      'Bloqueio AV': 'critical',
      'Extrassístoles': 'attention'
    }

    diagnoses.push({
      name: rhythm,
      severity: rhythmSeverity[rhythm] || 'attention',
      description: `Padrão de ritmo anômalo detectado: ${rhythm}`,
      details: {
        'Ritmo': rhythm,
        'Frequência': `${bpm} BPM`
      },
      recommendation: 'Avaliação cardiológica especializada recomendada',
      commonCauses: ['Doença cardíaca', 'Hipertensão', 'Hipertireoidismo', 'Idade avançada']
    })
    riskLevel = 'high'
    severity = rhythmSeverity[rhythm] === 'critical' ? 'critical' : 'warning'
  }

  // Interval analysis
  if (pr > 200) {
    diagnoses.push({
      name: 'Intervalo PR Prolongado',
      severity: 'warning',
      description: `Intervalo PR aumentado: ${pr}ms (normal: 120-200ms)`,
      details: { 'Intervalo PR': `${pr}ms` },
      recommendation: 'Pode indicar bloqueio AV. Avaliar com cardiologista.',
      commonCauses: ['Bloqueio AV de primeiro grau', 'Hipercalemia', 'Doença cardíaca']
    })
    riskLevel = 'high'
  }

  if (qrs > 120) {
    diagnoses.push({
      name: 'QRS Alargado',
      severity: 'warning',
      description: `Complexo QRS alargado: ${qrs}ms (normal: 80-120ms)`,
      details: { 'Complexo QRS': `${qrs}ms` },
      recommendation: 'Pode indicar bloqueio de ramo. Referência a cardiologista.',
      commonCauses: ['Bloqueio de ramo', 'Hipertrofia ventricular', 'Taquicardia supraventricular']
    })
    riskLevel = 'high'
  }

  if (qt > 480) {
    diagnoses.push({
      name: 'Intervalo QT Prolongado',
      severity: 'warning',
      description: `Intervalo QT aumentado: ${qt}ms. Risco de arritmias.`,
      details: { 'Intervalo QT': `${qt}ms` },
      recommendation: 'Risco de Torsades de Pointes. Avaliar medicamentos.',
      commonCauses: ['Congênito', 'Medicamentos', 'Hipocalemia', 'Hipomagnesia']
    })
    riskLevel = 'high'
    severity = 'warning'
  }

  if (diagnoses.length === 0 || (rhythm === 'Sinusal Normal' && bpm >= 60 && bpm <= 100)) {
    diagnoses.push({
      name: 'Ritmo Sinusal Normal',
      severity: 'normal',
      description: 'ECG dentro dos parâmetros normais',
      details: {
        'Frequência': `${bpm} BPM`,
        'Ritmo': 'Sinusal Normal',
        'Intervalos': 'Normais'
      },
      recommendation: 'Continuar com acompanhamento regular'
    })
  }

  recommendations.push('Acompanhamento regular com cardiologista')
  recommendations.push('Evitar stress e atividades extenuantes até avaliação completa')

  return { diagnoses, recommendations, riskLevel, severity }
}

// Analyze vital signs
const analyzeVitalSigns = (vitals) => {
  const diagnoses = []
  const recommendations = []
  let riskLevel = 'low'
  let severity = 'normal'

  // SpO2 analysis
  if (vitals.spO2) {
    if (vitals.spO2 < 90) {
      diagnoses.push({
        name: 'Hipoxemia',
        severity: vitals.spO2 < 80 ? 'critical' : 'warning',
        description: `Nível de oxigênio baixo: ${vitals.spO2}%`,
        details: { 'SpO2': `${vitals.spO2}%` },
        recommendation: 'Buscar ajuda médica imediatamente',
        commonCauses: ['DPOC', 'Pneumonia', 'Asma', 'Tromboembolismo Pulmonar']
      })
      riskLevel = 'high'
      severity = vitals.spO2 < 80 ? 'critical' : 'warning'
    }
  }

  // Glucose analysis
  if (vitals.glucose) {
    if (vitals.glucose < 70) {
      diagnoses.push({
        name: 'Hipoglicemia',
        severity: vitals.glucose < 50 ? 'critical' : 'attention',
        description: `Nível de glicose baixo: ${vitals.glucose} mg/dL`,
        details: { 'Glicose': `${vitals.glucose} mg/dL` },
        recommendation: 'Consumir alimento açucarado imediatamente se consciente',
        commonCauses: ['Insulina em excesso', 'Jejum prolongado', 'Exercício intenso']
      })
      if (vitals.glucose < 50) severity = 'critical'
    } else if (vitals.glucose > 126) {
      diagnoses.push({
        name: 'Hiperglicemia',
        severity: vitals.glucose > 200 ? 'warning' : 'attention',
        description: `Nível de glicose elevado: ${vitals.glucose} mg/dL`,
        details: { 'Glicose': `${vitals.glucose} mg/dL` },
        recommendation: 'Investigar diabetes. Consultar endocrinologista.',
        commonCauses: ['Diabetes Tipo 2', 'Diabetes Tipo 1', 'Stress', 'Infecção']
      })
      if (vitals.glucose > 200) {
        riskLevel = 'high'
        severity = 'warning'
      }
    }
  }

  // Blood pressure analysis
  const systolic = vitals.systolic
  const diastolic = vitals.diastolic

  if (systolic && diastolic) {
    if (systolic >= 180 || diastolic >= 120) {
      diagnoses.push({
        name: 'Crise Hipertensiva',
        severity: 'critical',
        description: `Pressão arterial crítica: ${systolic}/${diastolic} mmHg`,
        details: { 'Pressão': `${systolic}/${diastolic} mmHg` },
        recommendation: 'Buscar emergência imediatamente',
        commonCauses: ['Hipertensão descontrolada', 'Pré-eclâmpsia', 'Emergência hipertensiva']
      })
      riskLevel = 'high'
      severity = 'critical'
    } else if (systolic >= 140 || diastolic >= 90) {
      diagnoses.push({
        name: 'Hipertensão',
        severity: 'warning',
        description: `Pressão arterial elevada: ${systolic}/${diastolic} mmHg`,
        details: { 'Pressão': `${systolic}/${diastolic} mmHg` },
        recommendation: 'Mudanças de estilo de vida e possível medicação',
        commonCauses: ['Hábitos de vida', 'Genética', 'Obesidade', 'Stress']
      })
      riskLevel = 'high'
    } else if (systolic < 90 || diastolic < 60) {
      diagnoses.push({
        name: 'Hipotensão',
        severity: systolic < 70 ? 'critical' : 'attention',
        description: `Pressão arterial baixa: ${systolic}/${diastolic} mmHg`,
        details: { 'Pressão': `${systolic}/${diastolic} mmHg` },
        recommendation: 'Aumentar ingestão de fluidos e sal',
        commonCauses: ['Desidratação', 'Medicamentos', 'Choque', 'Anemia']
      })
      if (systolic < 70) {
        riskLevel = 'high'
        severity = 'critical'
      }
    }
  }

  // Temperature analysis
  if (vitals.temperature) {
    if (vitals.temperature > 38.5) {
      diagnoses.push({
        name: 'Febre Alta',
        severity: vitals.temperature > 40 ? 'critical' : 'warning',
        description: `Temperatura corporal elevada: ${vitals.temperature}°C`,
        details: { 'Temperatura': `${vitals.temperature}°C` },
        recommendation: 'Investigar causa: infecção, inflamação, etc.',
        commonCauses: ['Infecção viral', 'Infecção bacteriana', 'Inflamação']
      })
      riskLevel = 'high'
      if (vitals.temperature > 40) severity = 'critical'
    } else if (vitals.temperature < 36) {
      diagnoses.push({
        name: 'Hipotermia',
        severity: vitals.temperature < 32 ? 'critical' : 'warning',
        description: `Temperatura corporal baixa: ${vitals.temperature}°C`,
        details: { 'Temperatura': `${vitals.temperature}°C` },
        recommendation: 'Reaquecer lentamente. Buscar ajuda médica.',
        commonCauses: ['Exposição ao frio', 'Sepse', 'Medicamentos']
      })
      riskLevel = 'high'
    }
  }

  // Hemoglobin analysis
  if (vitals.hemoglobin) {
    if (vitals.hemoglobin < 12) {
      diagnoses.push({
        name: 'Anemia',
        severity: vitals.hemoglobin < 8 ? 'warning' : 'attention',
        description: `Hemoglobina baixa: ${vitals.hemoglobin} g/dL`,
        details: { 'Hemoglobina': `${vitals.hemoglobin} g/dL` },
        recommendation: 'Investigar causa. Posível suplementação de ferro.',
        commonCauses: ['Deficiência de ferro', 'Deficiência B12', 'Doença crônica', 'Sangramento']
      })
      if (vitals.hemoglobin < 8) {
        riskLevel = 'high'
        severity = 'warning'
      }
    } else if (vitals.hemoglobin > 18) {
      diagnoses.push({
        name: 'Policitemia',
        severity: 'attention',
        description: `Hemoglobina elevada: ${vitals.hemoglobin} g/dL`,
        details: { 'Hemoglobina': `${vitals.hemoglobin} g/dL` },
        recommendation: 'Avaliar causa. Pode indicar desidratação ou doença.',
        commonCauses: ['Desidratação', 'Altitude', 'Policitemia Vera', 'DPOC']
      })
    }
  }

  // Respiratory rate analysis
  if (vitals.respiratoryRate) {
    if (vitals.respiratoryRate < 10) {
      diagnoses.push({
        name: 'Bradipneia',
        severity: 'warning',
        description: `Frequência respiratória baixa: ${vitals.respiratoryRate} bpm`,
        details: { 'FR': `${vitals.respiratoryRate} bpm` },
        recommendation: 'Avaliar depressão do SNC. Possível overdose.',
        commonCauses: ['Medicamentos', 'Anestesia', 'Trauma craniano']
      })
      riskLevel = 'high'
    } else if (vitals.respiratoryRate > 25) {
      diagnoses.push({
        name: 'Taquipneia',
        severity: vitals.respiratoryRate > 35 ? 'warning' : 'attention',
        description: `Frequência respiratória elevada: ${vitals.respiratoryRate} bpm`,
        details: { 'FR': `${vitals.respiratoryRate} bpm` },
        recommendation: 'Investigar causa: stress, infecção, ou doença pulmonar.',
        commonCauses: ['Ansiedade', 'Infecção', 'Asma', 'Embolia Pulmonar']
      })
      if (vitals.respiratoryRate > 35) {
        riskLevel = 'high'
        severity = 'warning'
      }
    }
  }

  if (diagnoses.length === 0) {
    recommendations.push('Sinais vitais dentro dos limites normais')
  }

  recommendations.push('Manter monitoramento regular dos sinais vitais')
  recommendations.push('Relatar qualquer mudança anormal ao médico')

  return { diagnoses, recommendations, riskLevel, severity }
}

// Analyze combined conditions (correlations between ECG and vital signs)
const analyzeCombinedConditions = (ecgData, vitals) => {
  const diagnoses = []
  const recommendations = []

  // Hypertension + ECG changes
  if ((vitals.systolic > 140 || vitals.diastolic > 90) && (ecgData.bpm > 100 || ecgData.qrs > 120)) {
    diagnoses.push({
      name: 'Possível Miocardiopatia Hipertensiva',
      severity: 'warning',
      description: 'Alterações no ECG associadas com hipertensão arterial',
      details: { 'Pressão': `${vitals.systolic}/${vitals.diastolic}`, 'QRS': `${ecgData.qrs}ms` },
      recommendation: 'Ecocardiograma recomendado para avaliar função cardíaca',
      commonCauses: ['Hipertensão crônica', 'Genética', 'Obesidade']
    })
    recommendations.push('Controlar pressão arterial com medicação e lifestyle')
  }

  // Diabetes + Arrhythmia
  if ((vitals.glucose > 126 || vitals.glucose < 70) && ecgData.rhythm !== 'Sinusal Normal') {
    diagnoses.push({
      name: 'Alteração Metabólica com Arritmia',
      severity: 'attention',
      description: 'Alteração nos níveis de glicose associada com arritmia cardíaca',
      details: { 'Glicose': `${vitals.glucose}`, 'Ritmo': ecgData.rhythm },
      recommendation: 'Normalizar níveis de glicose. Avaliar medicamentos cardíacos.',
      commonCauses: ['Diabetes descontrolada', 'Cetoacidose', 'Hipoglicemia']
    })
    recommendations.push('Terapia intensiva para normalizar glicose')
  }

  // Hypoxia + Tachycardia
  if (vitals.spO2 < 90 && ecgData.bpm > 100) {
    diagnoses.push({
      name: 'Insuficiência Respiratória com Compensação Cardíaca',
      severity: 'warning',
      description: 'Baixa oxigenação com resposta taquicárdica compensatória',
      details: { 'SpO2': `${vitals.spO2}%`, 'BPM': `${ecgData.bpm}` },
      recommendation: 'Avaliar função pulmonar. Possível oxigênio suplementar.',
      commonCauses: ['DPOC', 'Pneumonia', 'TEP', 'Asma aguda']
    })
    recommendations.push('Iniciar oxigênio se SpO2 < 88%')
    recommendations.push('Radiografia de tórax recomendada')
  }

  // Anemia with compensatory tachycardia
  if (vitals.hemoglobin < 10 && ecgData.bpm > 100) {
    diagnoses.push({
      name: 'Taquicardia Compensatória por Anemia',
      severity: 'attention',
      description: 'Aumento de frequência cardíaca para compensar baixa oxigenação',
      details: { 'Hemoglobina': `${vitals.hemoglobin} g/dL`, 'BPM': `${ecgData.bpm}` },
      recommendation: 'Investigar e tratar anemia. Avaliar perdas de sangue.',
      commonCauses: ['Deficiência de ferro', 'Sangramento crônico', 'Hemólise']
    })
    recommendations.push('Suplementação de ferro')
    recommendations.push('Hemograma completo para investigação')
  }

  return { diagnoses, recommendations }
}

// Generate interpretation text
const generateInterpretation = (diagnoses, ecgData, vitals) => {
  let interpretation = ''

  const criticalDiags = diagnoses.filter(d => d.severity === 'critical')
  const warningDiags = diagnoses.filter(d => d.severity === 'warning')
  const normalDiags = diagnoses.filter(d => d.severity === 'normal')

  if (criticalDiags.length > 0) {
    interpretation += `⚠️ ATENÇÃO: ${criticalDiags.map(d => d.name).join(', ')} detectado(s). `
    interpretation += 'Busque atendimento médico imediato. '
  }

  if (warningDiags.length > 0) {
    interpretation += `⚠️ ${warningDiags.map(d => d.name).join(', ')} detectado(s). `
    interpretation += 'Recomenda-se avaliação cardiológica em breve. '
  }

  if (normalDiags.length > 0 && criticalDiags.length === 0 && warningDiags.length === 0) {
    interpretation += `✓ Análise dentro dos parâmetros normais. `
    interpretation += 'Continuar com acompanhamento regular. '
  }

  if (Object.keys(vitals).length > 0) {
    interpretation += 'Sinais vitais adicionais considerados na análise. '
  }

  interpretation += 'Esta análise é informativa. Consulte um cardiologista para diagnóstico definitivo.'

  return interpretation
}

export default {
  analyzeDiagnosis,
  analyzeECGPatterns,
  analyzeVitalSigns,
  analyzeCombinedConditions,
  generateInterpretation
}
