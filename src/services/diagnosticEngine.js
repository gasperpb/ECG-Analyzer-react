/**
 * Advanced Diagnostic Engine
 * Analyzes ECG data along with vital signs for comprehensive diagnosis
 */

export const analyzeDiagnosis = (ecgData, vitalSigns = {}, ecgFeatures = {}) => {
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

  // Ischemia / infarction analysis from raw waveform or features
  const ischemiaDiagnosis = analyzeIschemia(ecgData, ecgFeatures)
  diagnoses.push(...ischemiaDiagnosis.diagnoses)
  recommendations.push(...ischemiaDiagnosis.recommendations)
  if (ischemiaDiagnosis.riskLevel === 'high') riskLevel = 'high'
  if (ischemiaDiagnosis.severity === 'critical') overallSeverity = 'critical'
  else if (ischemiaDiagnosis.severity === 'warning' && overallSeverity !== 'critical') overallSeverity = 'warning'

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
    summaryInterpretation: generateInterpretation(uniqueDiagnoses, ecgData, vitalSigns),
    stSegmentIndices: ischemiaDiagnosis.stSegmentIndices || []
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

// Analyze raw ECG waveform for ischemia / infarction patterns
const analyzeIschemia = (ecgData, ecgFeatures = {}) => {
  const diagnoses = []
  const recommendations = []
  let riskLevel = 'low'
  let severity = 'normal'
  let stSegmentIndices = []

  const hasStElevation =
    ecgFeatures.stElevation === true ||
    ecgFeatures.stElevation === 'true'
  const hasStDepression =
    ecgFeatures.stDepression === true ||
    ecgFeatures.stDepression === 'true'
  const hasTWaveInversion =
    ecgFeatures.tWaveInversion === true ||
    ecgFeatures.tWaveInversion === 'true'
  const hasPathologicalQ =
    ecgFeatures.pathologicalQ === true ||
    ecgFeatures.pathologicalQ === 'true'
  const hasHyperacuteT =
    ecgFeatures.tallTWaves === true ||
    ecgFeatures.tallTWaves === 'true'

  // Detect ST changes from raw waveform if available
  const rawData = Array.isArray(ecgData) ? ecgData : (ecgData.data || null)
  let detectedStElevation = null
  let detectedStDepression = null
  let detectedTInversion = null

  if (rawData && rawData.length > 200) {
    const samplingRate = ecgData.samplingRate || 250
    const windowSize = Math.floor(samplingRate * 0.4)
    const stepSize = Math.floor(windowSize * 0.3)

    // Compute global baseline (isoelectric level) from the whole signal
    const sorted = [...rawData].sort((a, b) => a - b)
    const middleSegment = sorted.slice(Math.floor(sorted.length * 0.2), Math.floor(sorted.length * 0.8))
    const baseline = middleSegment.length > 0
      ? middleSegment.reduce((a, b) => a + b, 0) / middleSegment.length
      : 0

    for (let i = 0; i < rawData.length - windowSize; i += stepSize) {
      const window = rawData.slice(i, i + windowSize)

      // Find R peak (max absolute deviation from baseline)
      let maxDev = 0
      let rIdx = 0
      for (let j = 0; j < window.length; j++) {
        const dev = Math.abs(window[j] - baseline)
        if (dev > maxDev) {
          maxDev = dev
          rIdx = j
        }
      }

      // R peak must be significant (> 0.15mV) to be a real QRS
      if (maxDev < 0.15) continue

      // QRS end: ~60-80ms after R peak
      const qrsEnd = rIdx + Math.floor(0.065 * samplingRate)
      const stStart = qrsEnd
      const stEnd = stStart + Math.floor(0.08 * samplingRate)

      if (stEnd >= window.length) continue

      // Measure ST segment deviation from baseline (in mV)
      const stValues = []
      for (let j = stStart; j < stEnd; j++) {
        stValues.push(window[j] - baseline)
      }
      const stDev = stValues.reduce((a, b) => a + b, 0) / stValues.length

      // ST elevation threshold: > 0.1mV (1mm) = significant
      if (stDev > 0.10) {
        if (!detectedStElevation || Math.abs(stDev) > Math.abs(detectedStElevation.magnitude)) {
          detectedStElevation = {
            confidence: Math.min(95, 70 + stDev * 150),
            magnitude: stDev,
            position: i + stStart
          }
        }
        stSegmentIndices.push({ start: i + stStart, end: i + stEnd, type: 'elevation' })
      }

      // ST depression threshold: < -0.05mV
      if (stDev < -0.05) {
        if (!detectedStDepression || Math.abs(stDev) > Math.abs(detectedStDepression.magnitude)) {
          detectedStDepression = {
            confidence: Math.min(85, 65 + Math.abs(stDev) * 150),
            magnitude: Math.abs(stDev),
            position: i + stStart
          }
        }
        stSegmentIndices.push({ start: i + stStart, end: i + stEnd, type: 'depression' })
      }

      // T wave inversion: look at T wave region (200-400ms after R peak)
      const tStart = rIdx + Math.floor(0.2 * samplingRate)
      const tEnd = Math.min(rIdx + Math.floor(0.42 * samplingRate), window.length)
      if (tStart < tEnd) {
        const tRegion = window.slice(tStart, tEnd)
        const tMin = Math.min(...tRegion)
        const tMax = Math.max(...tRegion)
        const tPeakIdx = tRegion.indexOf(tMax)
        const tDeviation = tRegion[tPeakIdx] - baseline

        if (tDeviation < -0.1 && maxDev > 0.2) {
          detectedTInversion = { confidence: 75 }
        }
      }
    }
  }

  // Merge overlapping zones
  if (stSegmentIndices.length > 1) {
    stSegmentIndices.sort((a, b) => a.start - b.start)
    const merged = [stSegmentIndices[0]]
    for (let k = 1; k < stSegmentIndices.length; k++) {
      const last = merged[merged.length - 1]
      if (stSegmentIndices[k].start <= last.end && stSegmentIndices[k].type === last.type) {
        last.end = Math.max(last.end, stSegmentIndices[k].end)
      } else {
        merged.push(stSegmentIndices[k])
      }
    }
    stSegmentIndices = merged
  }

  const hasSTE = hasStElevation || detectedStElevation !== null
  const hasSTD = hasStDepression || detectedStDepression !== null
  const hasTWI = hasTWaveInversion || detectedTInversion !== null

  // === STEMI (IAM com Supra ST) ===
  if (hasSTE) {
    const stMag = detectedStElevation?.magnitude
      ? `${(detectedStElevation.magnitude * 10).toFixed(1)}mm (${(detectedStElevation.magnitude * 1000).toFixed(0)}µV)`
      : 'Elevado'
    const stPos = detectedStElevation?.position
      ? `aproximadamente ${(detectedStElevation.position / 250).toFixed(1)}s`
      : ''

    diagnoses.push({
      name: 'Enfarte Agudo do Miocárdio com Supra ST (STEMI)',
      severity: 'critical',
      description: `⚠️ INFARTO AGUDO DO MIOCÁRDIO detectado! Supradesnivelamento do segmento ST (${stMag}) ${stPos}. Este padrão é indicativo de lesão miocárdica transmural em evolução. Emergência médica absoluta.`,
      details: {
        'Tipo': 'STEMI (IAM com supra ST)',
        'Elevação ST': stMag,
        'Localização no gráfico': stPos || 'Detetado em múltiplos segmentos',
        'Recomendação Imediata': 'ATIVAR VIA VERDE CORONÁRIA'
      },
      recommendation: 'EMERGÊNCIA ABSOLUTA: Ativar via verde coronária imediatamente. AAS 300mg + clopidogrel 300mg + heparina não fracionada. Avaliar angioplastia primária (meta < 90min) ou trombólise (meta < 30min). Monitorização contínua em UTI.',
      commonCauses: ['Aterosclerose coronária com trombose aguda', 'Ruptura de placa aterosclerótica', 'Tromboembolismo coronário', 'Espasmo coronário grave'],
      segmentIndices: stSegmentIndices
    })
    riskLevel = 'high'
    severity = 'critical'
    recommendations.push('🚨 EMERGÊNCIA CARDÍACA: ATIVAR VIA VERDE CORONÁRIA')
    recommendations.push('AAS 300mg (mastigável) + clopidogrel 300mg (dose de carga)')
    recommendations.push('Heparina não fracionada 60UI/kg IV bolus + 12UI/kg/h infusão')
    recommendations.push('Avaliar angioplastia primária (ideal < 90min do primeiro contato médico)')
    recommendations.push('Se angioplastia não disponível: trombólise (ideal < 30min)')
    recommendations.push('Morfina 2-4mg IV para dor se necessário')
    recommendations.push('Oxigênio suplementar se SpO2 < 90%')
    recommendations.push('Nitratos sublinguais (se PA sistólica > 100mmHg e sem suspeita de IAM de VD)')
  }

  // === NSTEMI / Isquemia (Infra ST / Inversão T) ===
  if ((hasSTD || hasTWI) && !hasSTE) {
    const diagName = hasSTD
      ? 'Enfarte Agudo do Miocárdio sem Supra ST (NSTEMI) / Isquemia'
      : 'Isquemia Miocárdica (Inversão de Onda T)'
    const severityLevel = hasSTD ? 'critical' : 'warning'
    const description = hasSTD
      ? 'Infradesnivelamento do segmento ST detectado — síndrome coronária aguda sem supra de ST (SCASSST). Indica isquemia miocárdica subendocárdica. Alto risco de evolução para IAM.'
      : 'Inversão de onda T detectada — pode indicar isquemia miocárdica, sobrecarga ventricular ou alteração eletrolítica. Correlação clínica necessária.'

    diagnoses.push({
      name: diagName,
      severity: severityLevel,
      description,
      details: {
        'Tipo': hasSTD ? 'NSTEMI (SCA sem supra ST)' : 'Isquemia Miocárdica',
        'Alteração': hasSTD ? 'Infradesnivelamento ST' : 'Inversão Onda T',
        'Recomendação Imediata': 'Troponina seriada + ECG seriado + avaliação hemodinâmica'
      },
      recommendation: hasSTD
        ? 'URGÊNCIA: Troponina seriada (0h, 3h, 6h). ECG seriado. AAS 300mg + anticoagulação (enoxaparina 1mg/kg 12/12h ou heparina). Avaliar angiografia coronária nas próximas 24-48h (estratificação GRACE/TIMI). Ecocardiograma para função ventricular.'
        : 'Troponina seriada (0h, 3h). ECG de 12 derivações seriado. Ecocardiograma. Avaliar síndrome coronária aguda. Se dor típica + fatores de risco: tratar como SCA até prova contrária.',
      commonCauses: ['Aterosclerose coronária com placa instável', 'Trombose suboclusiva', 'Espasmo coronário', 'Doença multiarterial', 'IAM tipo 2 (demanda/isquemia)'],
      segmentIndices: stSegmentIndices
    })
    riskLevel = 'high'
    severity = severityLevel
    recommendations.push(hasSTD
      ? '🚨 URGENTE: Troponina seriada (0h, 3h, 6h) — alta suspeita de NSTEMI'
      : 'Troponina seriada para excluir lesão miocárdica')
    recommendations.push('AAS 300mg (dose de carga)')
    if (hasSTD) {
      recommendations.push('Anticoagulação: enoxaparina 1mg/kg SC 12/12h ou heparina não fracionada')
      recommendations.push('Avaliar angiografia coronária nas próximas 24-48h')
      recommendations.push('Escore GRACE / TIMI para estratificação de risco')
      recommendations.push('Ecocardiograma para avaliar fração de ejeção e mobilidade segmentar')
    }
  }

  // === Onda Q patológica (enfarte antigo) ===
  if (hasPathologicalQ) {
    diagnoses.push({
      name: 'Onda Q Patológica (Enfarte Antigo / Cicatriz Miocárdica)',
      severity: 'warning',
      description: 'Presença de onda Q patológica (largura > 40ms ou profundidade > 25% do QRS) — sugere enfarte do miocárdio prévio com área de necrose/cicatriz. Indica lesão miocárdica estabelecida, não aguda.',
      details: {
        'Tipo': 'Enfarte Antigo (Cicatriz)',
        'Significado Clínico': 'Cicatriz de IAM prévio',
        'Conduta': 'Ecocardiograma + estratificação de risco'
      },
      recommendation: 'Ecocardiograma com avaliação de fração de ejeção (FEVE). Se FEVE < 35-40%: considerar CDI profilático para prevenção primária de morte súbita. Otimizar terapia cardioprotetora (IECA, betabloqueador, estatina, antiagregante).',
      commonCauses: ['IAM prévio (cicatriz estabelecida)', 'Miocardiopatia dilatada', 'Miocardite prévia', 'Cardiomiopatia hipertrófica']
    })
    if (riskLevel !== 'high') riskLevel = 'high'
    if (severity !== 'critical') severity = 'warning'
    recommendations.push('Ecocardiograma completo com avaliação de fração de ejeção')
    recommendations.push('Terapia cardioprotetora: IECA + betabloqueador + estatina + AAS')
    recommendations.push('Se FEVE < 35%: considerar CDI para prevenção primária')
  }

  // === Ondas T hiperagudas (fase hiperaguda do IAM) ===
  if (hasHyperacuteT && !hasSTE) {
    diagnoses.push({
      name: 'Ondas T Hiperagudas (Fase Muito Precoce de IAM)',
      severity: 'critical',
      description: 'Ondas T altas, picudas e simétricas — fase hiperaguda do IAM (primeiros minutos a horas). Este padrão PRECEDE o supradesnivelamento ST. Indica isquemia miocárdica transmural muito precoce. Emergência médica.',
      recommendation: '🚨 EMERGÊNCIA: Repetir ECG em 15-30 minutos para documentar evolução (provável surgimento de supra ST). Preparar ativação de via verde coronária. AAS 300mg. Monitorização contínua. Provável IAM em evolução.',
      commonCauses: ['IAM em fase hiperaguda (primeiros 30-60min)', 'Hipercalémia (diagnóstico diferencial — ondas T simétricas em tenda)', 'Isquemia de Prinzmetal (espasmo coronário)']
    })
    riskLevel = 'high'
    severity = 'critical'
    recommendations.push('🚨 Repetir ECG em 15-30 minutos — documentar evolução para supra ST')
    recommendations.push('Preparar ativação de via verde coronária')
    recommendations.push('AAS 300mg (dose de carga)')
    recommendations.push('Verificar potássio sérico para excluir hipercalémia (DD principal)')
  }

  // === Síndrome Coronária Aguda (recomendações gerais) ===
  if (hasSTE || hasSTD || hasTWI) {
    recommendations.push('ECG de 12 derivações completo para localizar parede/parede afetada')
    recommendations.push('Monitorização cardíaca contínua com deteção de arritmias')
    recommendations.push('Avaliar dor torácica: escala de dor, características, irradiação, fatores de alívio/agravamento')
    recommendations.push('Ecocardiograma urgente para avaliar mobilidade segmentar e fração de ejeção')
    recommendations.push('Internamento em Unidade de Cuidados Intensivos (UCI/UTI) para monitorização')
    recommendations.push('Rastreio de fatores de risco cardiovascular: perfil lipídico, glicemia, HbA1c, função renal')
  }

  return { diagnoses, recommendations, riskLevel, severity, stSegmentIndices }
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
  analyzeIschemia,
  generateInterpretation
}
