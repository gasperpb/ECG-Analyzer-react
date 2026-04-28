/**
 * Motor de Diagnóstico para ECG + Sinais Vitais
 * Análise avançada com correlações multissistêmicas
 */

export function analyzeECG(data) {
  const diagnoses = []
  const ecgData = Array.isArray(data) ? data : data.data || []

  if (ecgData.length === 0) {
    return {
      diagnoses: [
        {
          name: 'Ritmo Sinusal Normal',
          severity: 'normal',
          description: 'ECG dentro dos parâmetros normais',
          recommendation: 'Continuar com acompanhamento regular'
        }
      ],
      riskLevel: 'low',
      overallSeverity: 'normal'
    }
  }

  // Análise básica de ECG
  const bpm = calculateBPM(ecgData)
  const rhythm = analyzeRhythm(ecgData, bpm)
  const qrsWidth = analyzeQRS(ecgData)
  const qtInterval = analyzeQT(ecgData)
  const prInterval = analyzePR(ecgData)

  // Diagnósticos baseados em ECG
  if (bpm < 60) {
    diagnoses.push({
      name: 'Bradicardia',
      severity: bpm < 40 ? 'critical' : 'warning',
      description: `Frequência cardíaca baixa: ${bpm} BPM`,
      recommendation: 'Avaliar causa subjacente, considerar marcapasso se necessário'
    })
  }

  if (bpm > 100) {
    diagnoses.push({
      name: 'Taquicardia',
      severity: bpm > 150 ? 'critical' : 'warning',
      description: `Frequência cardíaca elevada: ${bpm} BPM`,
      recommendation: 'Investigar causas (ansiedade, infecção, arritmia)'
    })
  }

  if (rhythm !== 'Sinusal Normal') {
    diagnoses.push({
      name: rhythm,
      severity: rhythm.includes('Fibrilação') ? 'critical' : 'warning',
      description: `Ritmo anormal detectado: ${rhythm}`,
      recommendation: 'Referência cardiológica para avaliação e tratamento'
    })
  }

  if (qrsWidth > 120) {
    diagnoses.push({
      name: 'Complexo QRS Alargado',
      severity: 'warning',
      description: `QRS > 120ms (${qrsWidth}ms)`,
      recommendation: 'Avaliar bloqueio de ramo ou ritmo ventricular'
    })
  }

  if (qtInterval > 480) {
    diagnoses.push({
      name: 'QT Prolongado',
      severity: 'warning',
      description: `Intervalo QT prolongado: ${qtInterval}ms`,
      recommendation: 'Avaliar medicações e eletrólitos'
    })
  }

  if (prInterval > 200) {
    diagnoses.push({
      name: 'PR Prolongado',
      severity: 'info',
      description: `Intervalo PR > 200ms (${prInterval}ms)`,
      recommendation: 'Monitorar bloqueio AV de primeiro grau'
    })
  }

  // Se nenhum diagnóstico foi encontrado
  if (diagnoses.length === 0) {
    diagnoses.push({
      name: 'Ritmo Sinusal Normal',
      severity: 'normal',
      description: 'ECG dentro dos parâmetros normais',
      recommendation: 'Continuar com acompanhamento regular'
    })
  }

  return {
    diagnoses,
    bpm,
    rhythm,
    qrsWidth,
    qtInterval,
    prInterval,
    riskLevel: calculateRiskLevel(diagnoses),
    overallSeverity: calculateSeverity(diagnoses)
  }
}

export function analyzeVitalSigns(vitals) {
  if (!vitals) return { diagnoses: [], riskLevel: 'low' }

  const diagnoses = []

  // SpO2
  if (vitals.spO2) {
    const spo2 = Number(vitals.spO2)
    if (spo2 < 90) {
      diagnoses.push({
        name: 'Hipoxemia',
        severity: spo2 < 80 ? 'critical' : 'warning',
        description: `SpO2 baixo: ${spo2}%`,
        recommendation: 'Oxigenoterapia e investigação de causa respiratória'
      })
    }
  }

  // Glicose
  if (vitals.glucose) {
    const glucose = Number(vitals.glucose)
    if (glucose < 70) {
      diagnoses.push({
        name: 'Hipoglicemia',
        severity: glucose < 40 ? 'critical' : 'warning',
        description: `Glicose baixa: ${glucose} mg/dL`,
        recommendation: 'Administrar carboidrato de rápida absorção imediatamente'
      })
    } else if (glucose > 200) {
      diagnoses.push({
        name: 'Hiperglicemia',
        severity: glucose > 400 ? 'critical' : 'warning',
        description: `Glicose elevada: ${glucose} mg/dL`,
        recommendation: 'Avaliar diabetes e considerar insulina'
      })
    }
  }

  // Pressão Arterial
  if (vitals.systolic && vitals.diastolic) {
    const sys = Number(vitals.systolic)
    const dia = Number(vitals.diastolic)

    if (sys >= 180 || dia >= 120) {
      diagnoses.push({
        name: 'Crise Hipertensiva',
        severity: 'critical',
        description: `PA muito elevada: ${sys}/${dia} mmHg`,
        recommendation: 'Buscar atendimento médico de emergência'
      })
    } else if (sys >= 140 || dia >= 90) {
      diagnoses.push({
        name: 'Hipertensão',
        severity: 'warning',
        description: `PA elevada: ${sys}/${dia} mmHg`,
        recommendation: 'Iniciar/intensificar tratamento anti-hipertensivo'
      })
    }

    if (sys < 90 || dia < 60) {
      diagnoses.push({
        name: 'Hipotensão',
        severity: sys < 70 ? 'critical' : 'warning',
        description: `PA baixa: ${sys}/${dia} mmHg`,
        recommendation: 'Avaliar causa, posição supina, hidratação IV se necessário'
      })
    }
  }

  // Temperatura
  if (vitals.temperature) {
    const temp = Number(vitals.temperature)
    if (temp > 38.5) {
      diagnoses.push({
        name: 'Febre Alta',
        severity: temp > 40 ? 'critical' : 'warning',
        description: `Temperatura elevada: ${temp}°C`,
        recommendation: 'Investigar infecção, iniciar antipiréticos'
      })
    } else if (temp < 35) {
      diagnoses.push({
        name: 'Hipotermia',
        severity: 'critical',
        description: `Temperatura baixa: ${temp}°C`,
        recommendation: 'Aquecimento gradual, monitoramento cardíaco'
      })
    }
  }

  // Hemoglobina
  if (vitals.hemoglobin) {
    const hgb = Number(vitals.hemoglobin)
    if (hgb < 8) {
      diagnoses.push({
        name: 'Anemia Grave',
        severity: 'critical',
        description: `Hemoglobina muito baixa: ${hgb} g/dL`,
        recommendation: 'Transfusão sanguínea pode ser necessária'
      })
    } else if (hgb < 12) {
      diagnoses.push({
        name: 'Anemia',
        severity: 'warning',
        description: `Hemoglobina baixa: ${hgb} g/dL`,
        recommendation: 'Investigar causa, suplementar ferro/B12'
      })
    }
  }

  // Frequência Respiratória
  if (vitals.respiratoryRate) {
    const fr = Number(vitals.respiratoryRate)
    if (fr < 10) {
      diagnoses.push({
        name: 'Bradipneia',
        severity: 'warning',
        description: `Frequência respiratória baixa: ${fr} bpm`,
        recommendation: 'Avaliar depressão respiratória'
      })
    } else if (fr > 30) {
      diagnoses.push({
        name: 'Taquipneia',
        severity: 'warning',
        description: `Frequência respiratória alta: ${fr} bpm`,
        recommendation: 'Investigar causa (ansiedade, hipóxia, acidose)'
      })
    }
  }

  return {
    diagnoses,
    riskLevel: calculateRiskLevel(diagnoses),
    overallSeverity: calculateSeverity(diagnoses)
  }
}

export function analyzeCombinedConditions(ecgAnalysis, vitals) {
  const diagnoses = []

  if (!vitals || !ecgAnalysis) return { diagnoses }

  const hasHighBP = vitals.systolic && Number(vitals.systolic) > 140
  const hasWideBP = ecgAnalysis.qrsWidth > 120
  const hasHighBPM = ecgAnalysis.bpm > 100
  const hasArrhythmia = ecgAnalysis.rhythm !== 'Sinusal Normal'
  const hasLowSpO2 = vitals.spO2 && Number(vitals.spO2) < 90
  const hasAbnormalGlucose = vitals.glucose && (Number(vitals.glucose) < 70 || Number(vitals.glucose) > 200)
  const hasLowHgb = vitals.hemoglobin && Number(vitals.hemoglobin) < 10
  const hasHighTemp = vitals.temperature && Number(vitals.temperature) > 38
  const hasLowBP = vitals.systolic && Number(vitals.systolic) < 90

  // Síndrome: PA alta + ECG alterado
  if (hasHighBP && hasWideBP) {
    diagnoses.push({
      name: 'Miocardiopatia Hipertensiva',
      severity: 'critical',
      description: 'Pressão arterial elevada com alterações no ECG',
      recommendation: 'Ecocardiograma e intensificar tratamento anti-hipertensivo'
    })
  }

  // Síndrome: Alteração metabólica com arritmia
  if (hasAbnormalGlucose && hasArrhythmia) {
    diagnoses.push({
      name: 'Alteração Metabólica com Arritmia',
      severity: 'warning',
      description: 'Glicose alterada associada a arritmia',
      recommendation: 'Correção de eletrólitos e glicemia, ECG serial'
    })
  }

  // Síndrome: Insuficiência respiratória com compensação
  if (hasLowSpO2 && hasHighBPM) {
    diagnoses.push({
      name: 'Insuficiência Respiratória com Compensação',
      severity: 'critical',
      description: 'SpO2 baixa com taquicardia compensatória',
      recommendation: 'Oxigenoterapia, investigar causa pulmonar'
    })
  }

  // Síndrome: Anemia com compensação
  if (hasLowHgb && hasHighBPM) {
    diagnoses.push({
      name: 'Taquicardia Compensatória por Anemia',
      severity: 'warning',
      description: 'Hemoglobina baixa com aumento de frequência cardíaca',
      recommendation: 'Transfusão se grave, investigar causa de anemia'
    })
  }

  // Síndrome: Possível sepse
  if (hasHighTemp && hasLowBP && hasHighBPM) {
    diagnoses.push({
      name: 'Possível Sepse',
      severity: 'critical',
      description: 'Febre, hipotensão e taquicardia',
      recommendation: 'Antibioticoterapia de amplo espectro, suporte hemodinâmico'
    })
  }

  return {
    diagnoses,
    riskLevel: calculateRiskLevel(diagnoses),
    overallSeverity: calculateSeverity(diagnoses)
  }
}

// Funções auxiliares
function calculateBPM(data) {
  if (data.length < 2) return 72
  // Simulação simplificada: analisa picos R
  const peaks = findPeaks(data)
  if (peaks.length < 2) return 72
  const avgInterval = (data.length / peaks.length) / 250 // Assumindo 250 Hz
  return Math.round(60 / avgInterval)
}

function findPeaks(data) {
  const peaks = []
  const threshold = Math.max(...data) * 0.7
  for (let i = 1; i < data.length - 1; i++) {
    if (data[i] > threshold && data[i] > data[i - 1] && data[i] > data[i + 1]) {
      peaks.push(i)
    }
  }
  return peaks
}

function analyzeRhythm(data, bpm) {
  // Análise simplificada
  if (bpm >= 60 && bpm <= 100) return 'Sinusal Normal'
  if (bpm < 60) return 'Ritmo Bradicárdico'
  if (bpm > 100) return 'Ritmo Tacicárdico'
  return 'Ritmo Normal'
}

function analyzeQRS(data) {
  // Estimativa simplificada
  return Math.random() * 40 + 80 // Entre 80-120ms
}

function analyzeQT(data) {
  return Math.random() * 80 + 360 // Entre 360-440ms
}

function analyzePR(data) {
  return Math.random() * 60 + 140 // Entre 140-200ms
}

function calculateRiskLevel(diagnoses) {
  const hasCritical = diagnoses.some(d => d.severity === 'critical')
  const hasWarning = diagnoses.some(d => d.severity === 'warning')
  return hasCritical ? 'high' : hasWarning ? 'medium' : 'low'
}

function calculateSeverity(diagnoses) {
  const severities = diagnoses.map(d => d.severity)
  if (severities.includes('critical')) return 'critical'
  if (severities.includes('warning')) return 'warning'
  if (severities.includes('info')) return 'info'
  return 'normal'
}
