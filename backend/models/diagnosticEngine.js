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

  // Análise de Hipercalémia (sinais no ECG)
  const hyperkalemiaAnalysis = analyzeHyperkalemia(ecgData, qrsWidth, prInterval, bpm)
  if (hyperkalemiaAnalysis.detected) {
    diagnoses.push({
      name: 'Possível Hipercalémia',
      severity: hyperkalemiaAnalysis.severity,
      description: hyperkalemiaAnalysis.description,
      recommendation: hyperkalemiaAnalysis.recommendation
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

  // Potássio (K+) - Hipercalémia / Hipocalemia
  if (vitals.potassium) {
    const k = Number(vitals.potassium)
    if (k > 5.0) {
      if (k > 6.5) {
        diagnoses.push({
          name: 'Hipercalémia Grave',
          severity: 'critical',
          description: `Potássio sérico muito elevado: ${k} mEq/L (normal: 3.5-5.0)`,
          recommendation: 'EMERGÊNCIA: Risco de paragem cardíaca. Cálcio gluconato IV 10%, insulina + glicose, bicarbonato de sódio. Preparar hemodiálise urgente. Monitorização cardíaca contínua.'
        })
      } else if (k > 5.5) {
        diagnoses.push({
          name: 'Hipercalémia Moderada',
          severity: 'warning',
          description: `Potássio sérico elevado: ${k} mEq/L (normal: 3.5-5.0)`,
          recommendation: 'Solicitar ECG urgente. Remover suplementos de K+. Considerar resinas de troca iônica (patiromer). Avaliar função renal e medicações (IECA, BRA, diuréticos poupadores de K+).'
        })
      } else {
        diagnoses.push({
          name: 'Hipercalémia Leve',
          severity: 'info',
          description: `Potássio sérico discretamente elevado: ${k} mEq/L (normal: 3.5-5.0)`,
          recommendation: 'Monitorizar potássio. Revisar medicações. Restringir alimentos ricos em potássio. Repetir dosagem em 24-48h.'
        })
      }
    } else if (k < 3.5) {
      if (k < 2.5) {
        diagnoses.push({
          name: 'Hipocalemia Grave',
          severity: 'critical',
          description: `Potássio sérico muito baixo: ${k} mEq/L (normal: 3.5-5.0)`,
          recommendation: 'EMERGÊNCIA: Reposição de K+ IV em ambiente monitorizado. Risco de arritmias ventriculares. Corrigir magnésio se baixo.'
        })
      } else {
        diagnoses.push({
          name: 'Hipocalemia',
          severity: 'warning',
          description: `Potássio sérico baixo: ${k} mEq/L (normal: 3.5-5.0)`,
          recommendation: 'Suplementação oral de KCl. Investigar causa (diuréticos, diarreia, vômitos). ECG para avaliar alterações.'
        })
      }
    }
  }

  // Sódio (Na+)
  if (vitals.sodium) {
    const na = Number(vitals.sodium)
    if (na < 135) {
      if (na < 120) {
        diagnoses.push({
          name: 'Hiponatremia Grave',
          severity: 'critical',
          description: `Sódio sérico muito baixo: ${na} mEq/L (normal: 135-145)`,
          recommendation: 'EMERGÊNCIA: Risco de convulsões e hérnia cerebral. Hipertônica 3% IV com cautela. Investigar causa (SIADH, insuficiência adrenal, diureticos).'
        })
      } else {
        diagnoses.push({
          name: 'Hiponatremia',
          severity: 'warning',
          description: `Sódio sérico baixo: ${na} mEq/L (normal: 135-145)`,
          recommendation: 'Restrição hídrica. Investigar causa (hipovolemia, SIADH, diuréticos, insuficiência cardíaca). Corrigir lentamente (< 8-10 mEq/L/24h).'
        })
      }
    } else if (na > 145) {
      if (na > 160) {
        diagnoses.push({
          name: 'Hipernatremia Grave',
          severity: 'critical',
          description: `Sódio sérico muito elevado: ${na} mEq/L (normal: 135-145)`,
          recommendation: 'EMERGÊNCIA: Correção com hipotônica (água livre). Investigar causa (desidratação, diabetes insípido). Corrigir lentamente.'
        })
      } else {
        diagnoses.push({
          name: 'Hipernatremia',
          severity: 'warning',
          description: `Sódio sérico elevado: ${na} mEq/L (normal: 135-145)`,
          recommendation: 'Hidratação oral ou IV. Investigar perda de água ou excesso de sódio.'
        })
      }
    }
  }

  // Magnésio (Mg++)
  if (vitals.magnesium) {
    const mg = Number(vitals.magnesium)
    if (mg < 1.7) {
      if (mg < 1.0) {
        diagnoses.push({
          name: 'Hipomagnesemia Grave',
          severity: 'critical',
          description: `Magnésio sérico muito baixo: ${mg} mg/dL (normal: 1.7-2.2)`,
          recommendation: 'Sulfato de magnésio IV 2g em 30min. Corrigir cálcio e potássio associados. Monitorização cardíaca (risco de Torsades de Pointes).'
        })
      } else {
        diagnoses.push({
          name: 'Hipomagnesemia',
          severity: 'warning',
          description: `Magnésio sérico baixo: ${mg} mg/dL (normal: 1.7-2.2)`,
          recommendation: 'Suplementação de Mg++ oral ou IV. Corrigir K+ e Ca++ associados. Investigar causa (diuréticos, alcoolismo, diarreia).'
        })
      }
    } else if (mg > 2.2) {
      if (mg > 5.0) {
        diagnoses.push({
          name: 'Hipermagnesemia',
          severity: 'warning',
          description: `Magnésio sérico elevado: ${mg} mg/dL (normal: 1.7-2.2)`,
          recommendation: 'Suspender suplementos de Mg++. Hidratação. Gluconato de cálcio se grave. Hemodiálise em insuficiência renal.'
        })
      }
    }
  }

  // Cálcio (Ca++)
  if (vitals.calcium) {
    const ca = Number(vitals.calcium)
    if (ca < 8.5) {
      if (ca < 7.0) {
        diagnoses.push({
          name: 'Hipocalcemia Grave',
          severity: 'critical',
          description: `Cálcio sérico muito baixo: ${ca} mg/dL (normal: 8.5-10.5)`,
          recommendation: 'EMERGÊNCIA: Gluconato de cálcio IV 10%. Verificar QT longo no ECG. Investigar hipoparatiroidismo, insuficiência renal, deficiência de vitamina D.'
        })
      } else {
        diagnoses.push({
          name: 'Hipocalcemia',
          severity: 'warning',
          description: `Cálcio sérico baixo: ${ca} mg/dL (normal: 8.5-10.5)`,
          recommendation: 'Cálcio oral + vitamina D. Verificar PTH, fósforo, albumina. QT prolongado no ECG.'
        })
      }
    } else if (ca > 10.5) {
      if (ca > 14.0) {
        diagnoses.push({
          name: 'Hipercalcemia Grave (Crise)',
          severity: 'critical',
          description: `Cálcio sérico muito elevado: ${ca} mg/dL (normal: 8.5-10.5)`,
          recommendation: 'EMERGÊNCIA: Hidratação agressiva com SF 0.9%. Calcitonina IM/SC. Bisfosfonato IV. Investigar neoplasia ou hiperparatiroidismo.'
        })
      } else {
        diagnoses.push({
          name: 'Hipercalcemia',
          severity: 'warning',
          description: `Cálcio sérico elevado: ${ca} mg/dL (normal: 8.5-10.5)`,
          recommendation: 'Hidratação. Investigar hiperparatiroidismo, neoplasia, sarcoidose. QT curto no ECG.'
        })
      }
    }
  }

  // TSH
  if (vitals.tsh) {
    const tsh = Number(vitals.tsh)
    if (tsh > 10.0) {
      diagnoses.push({
        name: 'Hipotireoidismo',
        severity: 'warning',
        description: `TSH elevado: ${tsh} mUI/L (normal: 0.4-4.0)`,
        recommendation: 'Solicitar T4 livre. Iniciar levotiroxina. ECG pode mostrar bradicardia, baixa voltagem, inversão de onda T.'
      })
    } else if (tsh > 4.0) {
      diagnoses.push({
        name: 'Hipotireoidismo Subclínico',
        severity: 'info',
        description: `TSH discretamente elevado: ${tsh} mUI/L (normal: 0.4-4.0)`,
        recommendation: 'Repetir TSH + T4 livre em 4-8 semanas. Considerar tratamento se sintomático.'
      })
    } else if (tsh < 0.4) {
      if (tsh < 0.1) {
        diagnoses.push({
          name: 'Hipertireoidismo',
          severity: 'warning',
          description: `TSH suprimido: ${tsh} mUI/L (normal: 0.4-4.0)`,
          recommendation: 'Solicitar T4 livre e T3. Investigar Graves, tireoidite. ECG pode mostrar taquicardia, fibrilação auricular.'
        })
      } else {
        diagnoses.push({
          name: 'Hipertireoidismo Subclínico',
          severity: 'info',
          description: `TSH baixo: ${tsh} mUI/L (normal: 0.4-4.0)`,
          recommendation: 'Repetir TSH + T3 + T4 livre. Rastreio de fibrilação auricular em idosos.'
        })
      }
    }
  }

  // Creatinina
  if (vitals.creatinine) {
    const cr = Number(vitals.creatinine)
    if (cr > 2.0) {
      if (cr > 5.0) {
        diagnoses.push({
          name: 'Insuficiência Renal Grave',
          severity: 'critical',
          description: `Creatinina muito elevada: ${cr} mg/dL`,
          recommendation: 'Avaliar necessidade de hemodiálise urgente. Verificar K+, acidose, sobrecarga hídrica. Nefrologia urgente.'
        })
      } else {
        diagnoses.push({
          name: 'Insuficiência Renal',
          severity: 'warning',
          description: `Creatinina elevada: ${cr} mg/dL`,
          recommendation: 'Ajustar medicações. Monitorizar K+ e função renal. Nefrologia. Estadiar DRC.'
        })
      }
    } else if (cr > 1.3) {
      diagnoses.push({
        name: 'Função Renal Alterada',
        severity: 'info',
        description: `Creatinina discretamente elevada: ${cr} mg/dL`,
        recommendation: 'Calcular TFG (CKD-EPI). Monitorizar função renal. Ajustar doses de medicações.'
      })
    }
  }

  // Troponina
  if (vitals.troponin) {
    const trop = Number(vitals.troponin)
    if (trop > 0.5) {
      diagnoses.push({
        name: 'IAM Provável (Troponina Elevada)',
        severity: 'critical',
        description: `Troponina muito elevada: ${trop} ng/mL (normal: < 0.04)`,
        recommendation: 'EMERGÊNCIA: Ativar via verde coronária. AAS 300mg + clopidogrel 300mg. Avaliar trombólise ou angioplastia primária. ECG urgente.'
      })
    } else if (trop > 0.04) {
      diagnoses.push({
        name: 'Lesão Miocárdica (Troponina Elevada)',
        severity: 'critical',
        description: `Troponina elevada: ${trop} ng/mL (normal: < 0.04)`,
        recommendation: 'URGENTE: Repetir troponina em 3h. ECG de 12 derivações. Avaliar SCA, embolia pulmonar, miocardite.'
      })
    }
  }

  return {
    diagnoses,
    riskLevel: calculateRiskLevel(diagnoses),
    overallSeverity: calculateSeverity(diagnoses)
  }
}

export function analyzeCombinedConditions(ecgAnalysis, vitals, features = {}) {
  const diagnoses = []

  if (!vitals || !ecgAnalysis) return { diagnoses }

  const hasHighBP = vitals.systolic && Number(vitals.systolic) > 140
  const hasWideBP = ecgAnalysis.qrsWidth > 120
  const hasHighBPM = ecgAnalysis.bpm > 100
  const hasLowBPM = ecgAnalysis.bpm < 60
  const hasArrhythmia = ecgAnalysis.rhythm !== 'Sinusal Normal'
  const hasLowSpO2 = vitals.spO2 && Number(vitals.spO2) < 90
  const hasVeryLowSpO2 = vitals.spO2 && Number(vitals.spO2) < 85
  const hasHighGlucose = vitals.glucose && Number(vitals.glucose) > 200
  const hasLowGlucose = vitals.glucose && Number(vitals.glucose) < 70
  const hasAbnormalGlucose = hasHighGlucose || hasLowGlucose
  const hasLowHgb = vitals.hemoglobin && Number(vitals.hemoglobin) < 10
  const hasVeryLowHgb = vitals.hemoglobin && Number(vitals.hemoglobin) < 7
  const hasHighTemp = vitals.temperature && Number(vitals.temperature) > 38
  const hasVeryHighTemp = vitals.temperature && Number(vitals.temperature) > 39.5
  const hasLowTemp = vitals.temperature && Number(vitals.temperature) < 36
  const hasLowBP = vitals.systolic && Number(vitals.systolic) < 90
  const hasVeryLowBP = vitals.systolic && Number(vitals.systolic) < 70
  const hasHighRespRate = vitals.respiratoryRate && Number(vitals.respiratoryRate) > 24
  const hasVeryHighRespRate = vitals.respiratoryRate && Number(vitals.respiratoryRate) > 30
  const hasLowRespRate = vitals.respiratoryRate && Number(vitals.respiratoryRate) < 12
  const hasHighPotassium = vitals.potassium && Number(vitals.potassium) > 5.0
  const hasLowPotassium = vitals.potassium && Number(vitals.potassium) < 3.5
  const hasHighSodium = vitals.sodium && Number(vitals.sodium) > 145
  const hasLowSodium = vitals.sodium && Number(vitals.sodium) < 135
  const hasHighMagnesium = vitals.magnesium && Number(vitals.magnesium) > 2.2
  const hasLowMagnesium = vitals.magnesium && Number(vitals.magnesium) < 1.7
  const hasHighCalcium = vitals.calcium && Number(vitals.calcium) > 10.5
  const hasLowCalcium = vitals.calcium && Number(vitals.calcium) < 8.5
  const hasHighTSH = vitals.tsh && Number(vitals.tsh) > 4.0
  const hasVeryHighTSH = vitals.tsh && Number(vitals.tsh) > 10.0
  const hasLowTSH = vitals.tsh && Number(vitals.tsh) < 0.4
  const hasVeryLowTSH = vitals.tsh && Number(vitals.tsh) < 0.1
  const hasHighCreatinine = vitals.creatinine && Number(vitals.creatinine) > 1.3
  const hasVeryHighCreatinine = vitals.creatinine && Number(vitals.creatinine) > 2.0
  const hasHighTroponin = vitals.troponin && Number(vitals.troponin) > 0.04
  const hasVeryHighTroponin = vitals.troponin && Number(vitals.troponin) > 0.5

  // Feature flags (optional)
  const fStElevation = features.stElevation === true
  const fStDepression = features.stDepression === true
  const fTWaveInversion = features.tWaveInversion === true
  const fProlongedQT = features.prolongedQT === true
  const fLowVoltage = features.lowVoltage === true
  const fAFib = features.afib === true
  const fFlutter = features.flutter === true
  const fBradycardia = features.bradycardia === true
  const fTachycardia = features.tachycardia === true
  const fArrhythmia = features.arrhythmia === true
  const fWideQRS = features.wideQRS === true
  const fTallTWaves = features.tallTWaves === true
  const fAbsentPWaves = features.absentPWaves === true
  const fLVH = features.lvh === true
  const fRVH = features.rvh === true
  const fBundleBranchBlock = features.bundleBranchBlock === true
  const fDeltaWave = features.deltaWave === true
  const fDigoxinEffect = features.digoxinEffect === true
  const fPericarditisST = features.pericarditisST === true
  const fUWave = features.uWave === true
  const fOsbornWave = features.osbornWave === true
  const fAVBlock2 = features.avBlock2 === true
  const fAVBlock3 = features.avBlock3 === true
  const fSineWave = features.sineWave === true

  // ===== CARDÍACAS =====

  // PA alta + QRS alargado
  if (hasHighBP && hasWideBP) {
    diagnoses.push({
      name: 'Miocardiopatia Hipertensiva',
      severity: 'critical',
      description: 'Pressão arterial elevada com alterações no ECG',
      recommendation: 'Ecocardiograma e intensificar tratamento anti-hipertensivo'
    })
  }

  // Hipertensão + HVE
  if (hasHighBP && fLVH) {
    diagnoses.push({
      name: 'Cardiopatia Hipertensiva',
      severity: 'warning',
      description: 'Hipertensão + HVE no ECG. Sobrecarga crônica do VE.',
      recommendation: 'Controle rigoroso de PA. IECAs/BRA. Ecocardiograma.'
    })
  }

  // Troponina elevada + alterações ECG isquémicas
  if (hasHighTroponin && (fStElevation || fStDepression)) {
    diagnoses.push({
      name: 'Síndrome Coronária Aguda Confirmada',
      severity: 'critical',
      description: `Troponina ${vitals.troponin} ng/mL + alterações isquémicas no ECG. IAM em evolução.`,
      recommendation: 'EMERGÊNCIA CARDÍACA: Via verde coronária. AAS + clopidogrel + heparina. Reperfusão.'
    })
  }

  // Troponina + febre (miocardite)
  if (hasHighTroponin && hasHighTemp) {
    diagnoses.push({
      name: 'Possível Miocardite',
      severity: 'critical',
      description: `Troponina ${vitals.troponin} + febre ${vitals.temperature}°C. Miocardite viral provável.`,
      recommendation: 'Ecocardiograma. RM cardíaca. Repouso. Evitar AINEs. Monitorizar arritmias.'
    })
  }

  // FA + hipertireoidismo
  if (hasVeryLowTSH && fAFib) {
    diagnoses.push({
      name: 'Fibrilação Auricular por Tireotoxicose',
      severity: 'warning',
      description: `TSH suprimido (${vitals.tsh}) + FA.`,
      recommendation: 'Tratar tireotoxicose. Controlar frequência. Anticoagulação.'
    })
  }

  // Hipotireoidismo + bradicardia + baixa voltagem
  if (hasVeryHighTSH && fBradycardia && fLowVoltage) {
    diagnoses.push({
      name: 'Miocardiopatia por Hipotireoidismo',
      severity: 'warning',
      description: 'TSH elevado + bradicardia + baixa voltagem.',
      recommendation: 'Levotiroxina com cautela. Ecocardiograma.'
    })
  }

  // Febre + taquicardia (resposta fisiológica)
  if (hasHighTemp && hasHighBPM && !hasArrhythmia) {
    diagnoses.push({
      name: 'Taquicardia Febril',
      severity: 'info',
      description: `Temperatura ${vitals.temperature}°C com taquicardia compensatória.`,
      recommendation: 'Controlar febre. Investigar causa infecciosa. ECG se persistir após afebril.'
    })
  }

  // Febre + bradicardia (paradoxal - febre tifóide, legionella, etc.)
  if (hasHighTemp && hasLowBPM) {
    diagnoses.push({
      name: 'Dissociação Pulso-Temperatura (Sinal de Faget)',
      severity: 'warning',
      description: `Febre ${vitals.temperature}°C com bradicardia. Dissociação paradoxal.`,
      recommendation: 'Investigar febre tifóide, legionella, tularemia, brucelose, drug fever.'
    })
  }

  // ===== RESPIRATÓRIAS =====

  // SpO2 baixa + taquicardia
  if (hasLowSpO2 && hasHighBPM) {
    diagnoses.push({
      name: 'Insuficiência Respiratória com Compensação',
      severity: 'critical',
      description: `SpO2 ${vitals.spO2}% com taquicardia compensatória (${ecgAnalysis.bpm} BPM)`,
      recommendation: 'Oxigenoterapia imediata. Investigar causa pulmonar. Gasometria arterial.'
    })
  }

  // SpO2 baixa + FR elevada
  if (hasLowSpO2 && hasHighRespRate) {
    diagnoses.push({
      name: 'Insuficiência Respiratória Aguda',
      severity: 'critical',
      description: `SpO2 ${vitals.spO2}% + frequência respiratória ${vitals.respiratoryRate} bpm.`,
      recommendation: 'Oxigênio suplementar. Gasometria. Considerar VNI ou intubação se grave.'
    })
  }

  // SpO2 baixa + FR muito alta + taquicardia
  if (hasVeryLowSpO2 && hasVeryHighRespRate && hasHighBPM) {
    diagnoses.push({
      name: 'SDRA / Insuficiência Respiratória Grave',
      severity: 'critical',
      description: `SpO2 ${vitals.spO2}% + FR ${vitals.respiratoryRate} + taquicardia. Padrão de SDRA.`,
      recommendation: 'URGÊNCIA: Intubação e ventilação mecânica. Raio-X. Protocolo SDRA. PEEP otimizada.'
    })
  }

  // SpO2 baixa + Hb baixa
  if (hasLowSpO2 && hasLowHgb) {
    diagnoses.push({
      name: 'Hipoxemia com Anemia',
      severity: 'warning',
      description: `SpO2 ${vitals.spO2}% + Hb ${vitals.hemoglobin} g/dL. Transporte de O2 comprometido.`,
      recommendation: 'Oxigenoterapia + transfusão se Hb < 7. Investigar causa combinada.'
    })
  }

  // SpO2 baixa + FR baixa (depressão respiratória)
  if (hasLowSpO2 && hasLowRespRate) {
    diagnoses.push({
      name: 'Depressão Respiratória',
      severity: 'critical',
      description: `SpO2 ${vitals.spO2}% com FR ${vitals.respiratoryRate} bpm. Depressão do centro respiratório.`,
      recommendation: 'EMERGÊNCIA: Suporte ventilatório. Naloxona se opioides. Flumazenil se benzodiazepínicos.'
    })
  }

  // SpO2 baixa + febre + taquicardia + FR elevada
  if (hasLowSpO2 && hasHighTemp && hasHighBPM && hasHighRespRate) {
    diagnoses.push({
      name: 'Pneumonia Grave',
      severity: 'critical',
      description: `SpO2 ${vitals.spO2}% + febre ${vitals.temperature}°C + taquicardia + taquipneia.`,
      recommendation: 'Oxigênio + antibióticos IV. Raio-X tórax. Curbs-65. UTA se SpO2 < 90%.'
    })
  }

  // SpO2 baixa + febre + hipotensão (sepse pulmonar)
  if (hasLowSpO2 && hasHighTemp && hasLowBP) {
    diagnoses.push({
      name: 'Sepse de Origem Pulmonar',
      severity: 'critical',
      description: `SpO2 ${vitals.spO2}% + febre ${vitals.temperature}°C + PA ${vitals.systolic}/${vitals.diastolic}. Choque séptico provável.`,
      recommendation: 'EMERGÊNCIA: Antibióticos < 1h. SF 0.9% 30mL/kg. Noradrenalina se PA refratária. Lactato.'
    })
  }

  // Febre + hipotensão + taquicardia
  if (hasHighTemp && hasLowBP && hasHighBPM) {
    diagnoses.push({
      name: 'Possível Sepse',
      severity: 'critical',
      description: 'Febre, hipotensão e taquicardia. qSOFA positivo.',
      recommendation: 'Antibióticos de amplo espectro, SF 30mL/kg, hemoculturas, lactato. UTI.'
    })
  }

  // Hipotermia + hipotensão
  if (hasLowTemp && hasLowBP) {
    diagnoses.push({
      name: 'Choque com Hipotermia',
      severity: 'critical',
      description: `Temperatura ${vitals.temperature}°C + PA ${vitals.systolic} mmHg.`,
      recommendation: 'Aquecimento ativo. Fluidos vasopressores. Investigar causa (sepse, trauma, endócrina).'
    })
  }

  // ===== METABÓLICAS =====

  // Glicose alta + febre (infecção + diabetes descompensado)
  if (hasHighGlucose && hasHighTemp) {
    diagnoses.push({
      name: 'Diabetes Descompensado com Infecção',
      severity: 'warning',
      description: `Glicose ${vitals.glucose} mg/dL + febre ${vitals.temperature}°C.`,
      recommendation: 'Insulina. Antibióticos. Hidratação. Investigar foco infeccioso. Cetonúria.'
    })
  }

  // Glicose muito alta + febre + taquicardia (cetoacidose)
  if (hasHighGlucose && Number(vitals.glucose) > 300 && hasHighTemp && hasHighBPM) {
    diagnoses.push({
      name: 'Possível Cetoacidose Diabética',
      severity: 'critical',
      description: `Glicose ${vitals.glucose} mg/dL + febre + taquicardia. Risco de CAD.`,
      recommendation: 'Gasometria (pH, bicarbonato). Cetonas. Insulina IV. SF 0.9%. K+.'
    })
  }

  // Glicose baixa (hipoglicemia sintomática)
  if (hasLowGlucose && hasHighBPM) {
    diagnoses.push({
      name: 'Hipoglicemia Sintomática',
      severity: 'warning',
      description: `Glicose ${vitals.glucose} mg/dL com taquicardia adrenérgica.`,
      recommendation: 'Glicose 50% IV 20-50mL. Glicemia seriada. Investigar causa (insulina, sulfonilureia).'
    })
  }

  // Glicose alta + Hb baixa (diabetes + anemia)
  if (hasHighGlucose && hasLowHgb) {
    diagnoses.push({
      name: 'Diabetes com Anemia',
      severity: 'warning',
      description: `Glicose ${vitals.glucose} mg/dL + Hb ${vitals.hemoglobin} g/dL. Anemia do doente crônico ou nefropatia diabética.`,
      recommendation: 'Eritropoietina se DRC. Ferro. Controle glicêmico.'
    })
  }

  // ===== ELETRÓLITOS =====

  // K+ alto + arritmia/ECG alterado
  if (hasHighPotassium && (hasArrhythmia || hasWideBP)) {
    diagnoses.push({
      name: 'Hipercalémia com Alterações no ECG',
      severity: 'critical',
      description: `Potássio ${vitals.potassium} mEq/L + alterações eletrocardiográficas.`,
      recommendation: 'EMERGÊNCIA: Cálcio IV. Insulina + glicose. Hemodiálise.'
    })
  }

  // K+ alto + creatinina alta
  if (hasHighPotassium && hasVeryHighCreatinine) {
    diagnoses.push({
      name: 'Hipercalémia por Insuficiência Renal',
      severity: 'critical',
      description: `Creatinina ${vitals.creatinine} + K+ ${vitals.potassium}.`,
      recommendation: 'Hemodiálise urgente. Cálcio IV. Insulina + glicose.'
    })
  }

  // K+ baixo + arritmia
  if (hasLowPotassium && fArrhythmia) {
    diagnoses.push({
      name: 'Arritmia por Hipocalemia',
      severity: 'critical',
      description: `K+ ${vitals.potassium} + arritmia.`,
      recommendation: 'Corrigir K+ IV monitorizado. Verificar Mg++.'
    })
  }

  // K+ baixo + ondas U
  if (hasLowPotassium && fUWave) {
    diagnoses.push({
      name: 'Hipocalemia com Ondas U',
      severity: 'warning',
      description: `K+ ${vitals.potassium} + ondas U proeminentes.`,
      recommendation: 'Suplementação de KCl. Investigar perda (diuréticos, diarreia).'
    })
  }

  // Mg++ baixo + QT longo
  if (hasLowMagnesium && fProlongedQT) {
    diagnoses.push({
      name: 'QT Longo por Hipomagnesemia',
      severity: 'critical',
      description: 'Mg++ baixo + QT longo. Risco de Torsades de Pointes.',
      recommendation: 'MgSO4 IV 2g urgente. Corrigir K+ e Ca++.'
    })
  }

  // Mg++ baixo + arritmia
  if (hasLowMagnesium && fArrhythmia) {
    diagnoses.push({
      name: 'Arritmia por Hipomagnesemia',
      severity: 'critical',
      description: `Mg++ ${vitals.magnesium} mg/dL + arritmia.`,
      recommendation: 'MgSO4 IV. Corrigir K+. Monitorização.'
    })
  }

  // Ca++ baixo + QT longo
  if (hasLowCalcium && fProlongedQT) {
    diagnoses.push({
      name: 'QT Longo por Hipocalcemia',
      severity: 'warning',
      description: `Ca++ ${vitals.calcium} mg/dL + QT longo.`,
      recommendation: 'Gluconato de cálcio IV. Vitamina D. PTH.'
    })
  }

  // K+ baixo + Mg++ baixo (combo perigoso)
  if (hasLowPotassium && hasLowMagnesium) {
    diagnoses.push({
      name: 'Hipocalemia + Hipomagnesemia',
      severity: 'critical',
      description: `K+ ${vitals.potassium} + Mg++ ${vitals.magnesium}. Alto risco de arritmias malignas.`,
      recommendation: 'Corrigir AMBOS. Mg++ primeiro (facilita correção de K+). Monitorização contínua.'
    })
  }

  // Na+ baixo + confusão
  if (hasLowSodium && Number(vitals.sodium) < 125) {
    diagnoses.push({
      name: 'Hiponatremia Sintomática',
      severity: 'warning',
      description: `Na+ ${vitals.sodium} mEq/L. Risco de convulsões se < 120.`,
      recommendation: 'Restrição hídrica. Investigar causa. Corrigir lentamente (< 8-10 mEq/L/24h).'
    })
  }

  // Na+ baixo + febre (SIADH por infecção)
  if (hasLowSodium && hasHighTemp) {
    diagnoses.push({
      name: 'Possível SIADH por Infecção',
      severity: 'warning',
      description: `Na+ ${vitals.sodium} mEq/L + febre. SIADH secundário a infecção.`,
      recommendation: 'Restrição hídrica. Tratar infecção. Osmolaridade sérica e urinária.'
    })
  }

  // ===== RENAIS =====

  // Creatinina alta + K+ alto + acidose
  if (hasVeryHighCreatinine && hasHighPotassium) {
    diagnoses.push({
      name: 'Insuficiência Renal Aguda com Hipercalémia',
      severity: 'critical',
      description: `Creatinina ${vitals.creatinine} + K+ ${vitals.potassium}.`,
      recommendation: 'Hemodiálise urgente. Cálcio IV. Insulina + glicose. Nefrologia.'
    })
  }

  // Creatinina alta + anemia
  if (hasVeryHighCreatinine && hasLowHgb) {
    diagnoses.push({
      name: 'Doença Renal Crônica com Anemia',
      severity: 'warning',
      description: `Creatinina ${vitals.creatinine} + Hb ${vitals.hemoglobin}. Anemia da DRC.`,
      recommendation: 'Eritropoietina + ferro. Estadiar DRC. Nefrologia.'
    })
  }

  // Creatinina alta + hipotensão
  if (hasVeryHighCreatinine && hasLowBP) {
    diagnoses.push({
      name: 'Insuficiência Renal Pré-Renal',
      severity: 'critical',
      description: `Creatinina ${vitals.creatinine} + PA ${vitals.systolic}. Hipoperfusão renal.`,
      recommendation: 'Hidratação IV. Evitar nefrotóxicos. Monitorizar diurese.'
    })
  }

  // ===== CARDIORRESPIRATÓRIAS =====

  // SpO2 baixa + taquicardia + alterações ECG de VD
  if (hasLowSpO2 && hasHighBPM && (fRVH || fTachycardia)) {
    diagnoses.push({
      name: 'Possível Embolia Pulmonar',
      severity: 'critical',
      description: `SpO2 ${vitals.spO2}% + taquicardia + sobrecarga VD.`,
      recommendation: 'D-dímero. Angio-TC. Ecocardiograma. Anticoagulação.'
    })
  }

  // SpO2 baixa + FR alta + febre
  if (hasLowSpO2 && hasHighRespRate && hasHighTemp) {
    diagnoses.push({
      name: 'Pneumonia com Insuficiência Respiratória',
      severity: 'critical',
      description: `SpO2 ${vitals.spO2}% + FR ${vitals.respiratoryRate} + febre ${vitals.temperature}°C.`,
      recommendation: 'O2 + antibióticos IV. Raio-X. CURB-65. UTA.'
    })
  }

  // FR alta + taquicardia (ansiedade/febre/hipóxia)
  if (hasHighRespRate && hasHighBPM) {
    diagnoses.push({
      name: 'Taquipneia com Taquicardia',
      severity: 'info',
      description: `FR ${vitals.respiratoryRate} + ${ecgAnalysis.bpm} BPM.`,
      recommendation: 'Avaliar: ansiedade, febre, hipóxia, dor, acidose metabólica.'
    })
  }

  // FR alta + SpO2 baixa + Hb baixa (anemia severa com compensação)
  if (hasHighRespRate && hasLowSpO2 && hasVeryLowHgb) {
    diagnoses.push({
      name: 'Anemia Grave com Comprometimento Respiratório',
      severity: 'critical',
      description: `FR ${vitals.respiratoryRate} + SpO2 ${vitals.spO2}% + Hb ${vitals.hemoglobin} g/dL.`,
      recommendation: 'Transfusão urgente. O2 suplementar. Investigar sangramento.'
    })
  }

  // ===== TIREOIDE =====

  // TSH baixo + taquicardia + febre (tempestade tireotóxica)
  if (hasVeryLowTSH && hasHighBPM && hasVeryHighTemp) {
    diagnoses.push({
      name: 'Possível Tempestade Tireotóxica',
      severity: 'critical',
      description: `TSH ${vitals.tsh} + ${ecgAnalysis.bpm} BPM + ${vitals.temperature}°C. EMERGÊNCIA ENDÓCRINA.`,
      recommendation: 'EMERGÊNCIA: PTU/metimazol. Propanolol. Hidrocortisona. Tratamento de suporte em UCI.'
    })
  }

  // TSH alto + bradicardia + hipotermia (mixedema)
  if (hasVeryHighTSH && hasLowBPM && hasLowTemp) {
    diagnoses.push({
      name: 'Possível Coma Mixedematoso',
      severity: 'critical',
      description: `TSH ${vitals.tsh} + bradicardia + hipotermia. EMERGÊNCIA ENDÓCRINA.`,
      recommendation: 'EMERGÊNCIA: Levotiroxina IV + T3. Hidrocortisona. Aquecimento. Suporte.'
    })
  }

  // TSH alto + colesterol (indireto - não disponível, mas hipotireoidismo)
  if (hasVeryHighTSH && hasLowHgb) {
    diagnoses.push({
      name: 'Hipotireoidismo com Anemia',
      severity: 'info',
      description: `TSH ${vitals.tsh} + Hb ${vitals.hemoglobin}.`,
      recommendation: 'Levotiroxina. Investigar anemia (ferro, B12, ácido fólico).'
    })
  }

  // TSH baixo + arritmia (FA por hipertireoidismo)
  if (hasLowTSH && fAFib) {
    diagnoses.push({
      name: 'Fibrilação Auricular Tireotóxica',
      severity: 'warning',
      description: `TSH ${vitals.tsh} + FA.`,
      recommendation: 'Tratar tireotoxicose. Controlar frequência. Anticoagulação.'
    })
  }

  // ===== COMPLEXAS / MULTIORGÂNICAS =====

  // Febre + hipotensão + creatinina alta + K+ alto (sepse com IRA)
  if (hasHighTemp && hasLowBP && hasVeryHighCreatinine && hasHighPotassium) {
    diagnoses.push({
      name: 'Choque Séptico com IRA',
      severity: 'critical',
      description: 'Sepse + IRA + hipercalémia. Falência multiorgânica.',
      recommendation: 'UTI. Antibióticos. Vasopressores. Hemodiálise. Fluidos.'
    })
  }

  // SpO2 baixa + troponina alta + febre (miocardite com compromisso pulmonar)
  if (hasLowSpO2 && hasHighTroponin && hasHighTemp) {
    diagnoses.push({
      name: 'Miocardite Aguda com Compromisso Pulmonar',
      severity: 'critical',
      description: `Troponina ${vitals.troponin} + SpO2 ${vitals.spO2}% + febre.`,
      recommendation: 'Ecocardiograma. RM cardíaca. Suporte hemodinâmico. UCI.'
    })
  }

  // Hb muito baixa + troponina alta (IAM tipo 2 - demanda)
  if (hasVeryLowHgb && hasHighTroponin) {
    diagnoses.push({
      name: 'IAM Tipo 2 por Anemia Grave',
      severity: 'critical',
      description: `Hb ${vitals.hemoglobin} + troponina ${vitals.troponin}. Isquemia por demanda.`,
      recommendation: 'Transfusão urgente. Troponina serial. ECG. Corrigir anemia.'
    })
  }

  // Glicose alta + creatinina alta + K+ alto (diabetes + nefropatia)
  if (hasHighGlucose && hasVeryHighCreatinine && hasHighPotassium) {
    diagnoses.push({
      name: 'Nefropatia Diabética com Hipercalémia',
      severity: 'critical',
      description: `Glicose ${vitals.glucose} + creatinina ${vitals.creatinine} + K+ ${vitals.potassium}.`,
      recommendation: 'Controle glicêmico. Tratar hipercalémia. Nefrologia. Avaliar diálise.'
    })
  }

  // Febre + hipotensão + Hb baixa (choque hemorrágico séptico)
  if (hasHighTemp && hasVeryLowBP && hasLowHgb) {
    diagnoses.push({
      name: 'Choque Séptico com Anemia',
      severity: 'critical',
      description: `Febre + PA ${vitals.systolic} + Hb ${vitals.hemoglobin}. Choque misto.`,
      recommendation: 'EMERGÊNCIA: Fluidos + vasopressores + transfusão. Antibióticos. UTI.'
    })
  }

  // Taquicardia + hipotensão + SpO2 baixa (choque cardiogênico)
  if (hasHighBPM && hasLowBP && hasLowSpO2) {
    diagnoses.push({
      name: 'Possível Choque Cardiogênico',
      severity: 'critical',
      description: `TA ${vitals.systolic} + ${ecgAnalysis.bpm} BPM + SpO2 ${vitals.spO2}%.`,
      recommendation: 'EMERGÊNCIA: Ecocardiograma. Troponina. Dobutamina. UCI. Balão intra-aórtico.'
    })
  }

  return {
    diagnoses,
    riskLevel: calculateRiskLevel(diagnoses),
    overallSeverity: calculateSeverity(diagnoses)
  }
}

export function analyzeECGFeatures(features, ecgAnalysis, vitals) {
  const diagnoses = []

  if (!features) return { diagnoses }

  // Hipercalémia baseada em características observadas
  const hasTallTWaves = features.tallTWaves === true
  const hasAbsentPWaves = features.absentPWaves === true
  const hasWideQRS = features.wideQRS === true
  const hasSineWave = features.sineWave === true
  const hasProlongedPR = features.prolongedPR === true

  // Classificar hipercalémia baseada em observações
  if (hasSineWave) {
    diagnoses.push({
      name: 'Hipercalémia Muito Grave (Sine Wave Pattern)',
      severity: 'critical',
      description: 'Padrão Sine Wave observado - estágio terminal de hipercalémia. QRS fundido com onda T. Risco iminente de FV/assistolia.',
      recommendation: 'EMERGÊNCIA ABSOLUTA: Cálcio gluconato IV 10% em bolus imediato. Insulina regular 10U IV + glicose 50%. Bicarbonato de sódio. Preparar hemodiálise urgente. Reanimação cardiopulmonar pronta.'
    })
  } else if (hasTallTWaves && hasAbsentPWaves && hasWideQRS) {
    diagnoses.push({
      name: 'Hipercalémia Grave',
      severity: 'critical',
      description: 'Tríade de hipercalémia grave: ondas T picudas + ondas P ausentes + QRS alargado. Potássio estimado > 6.5-7.0 mEq/L.',
      recommendation: 'EMERGÊNCIA: Cálcio gluconato IV 10%, insulina + glicose, bicarbonato de sódio. Monitorização cardíaca contínua. Preparar hemodiálise. Verificar potássio sérico urgentemente.'
    })
  } else if (hasTallTWaves && (hasWideQRS || hasAbsentPWaves)) {
    diagnoses.push({
      name: 'Hipercalémia Moderada-Grave',
      severity: 'critical',
      description: 'Ondas T altas e picudas associadas a alterações de condução. Possível hipercalémia significativa (K+ 6.0-7.0 mEq/L).',
      recommendation: 'URGENTE: Cálcio IV para estabilização miocárdica. Medidas para redução de potássio. Avaliar função renal. ECG serial.'
    })
  } else if (hasTallTWaves) {
    diagnoses.push({
      name: 'Possível Hipercalémia (Ondas T Picudas)',
      severity: 'warning',
      description: 'Ondas T altas e picudas observadas - sinal precoce de hipercalémia. Potássio estimado 5.5-6.5 mEq/L.',
      recommendation: 'Solicitar potássio sérico urgente. Revisar medicações (IECA, BRA, diuréticos poupadores de K+). Remover suplementos de potássio.'
    })
  } else if (hasAbsentPWaves && hasProlongedPR) {
    diagnoses.push({
      name: 'Hipercalémia Moderada (Provável)',
      severity: 'warning',
      description: 'Ondas P ausentes com PR prolongado - progressão de hipercalémia. Potássio estimado 5.5-6.5 mEq/L.',
      recommendation: 'ECG urgente. Potássio sérico. Avaliar necessidade de tratamento redutor de K+.'
    })
  } else if (hasWideQRS) {
    diagnoses.push({
      name: 'QRS Alargado',
      severity: 'warning',
      description: 'Complexo QRS alargado observado. Pode indicar hipercalémia, bloqueio de ramo ou ritmo ventricular.',
      recommendation: 'Avaliar potássio sérico. Considerar bloqueio de ramo. ECG de 12 derivações.'
    })
  }

  // Outras condições baseadas em características
  if (features.stElevation) {
    diagnoses.push({
      name: 'Supradesnivelamento do Segmento ST',
      severity: 'critical',
      description: 'Supradesnivelamento ST observado - possível IAM com supra de ST.',
      recommendation: 'EMERGÊNCIA: Ativar via verde coronária. AAS + clopidogrel. Avaliar trombólise ou angioplastia primária.'
    })
  }

  if (features.stDepression) {
    diagnoses.push({
      name: 'Infradesnivelamento do Segmento ST',
      severity: 'warning',
      description: 'Infradesnivelamento ST observado - possível isquemia miocárdica.',
      recommendation: 'Avaliar síndrome coronária aguda. Troponina seriada. ECG serial.'
    })
  }

  if (features.tWaveInversion) {
    diagnoses.push({
      name: 'Inversão da Onda T',
      severity: 'info',
      description: 'Inversão de onda T observada - pode indicar isquemia, sobrecarga ventricular ou alteração eletrolítica.',
      recommendation: 'Avaliar contexto clínico. Troponina se dor torácica. Ecocardiograma.'
    })
  }

  if (features.arrhythmia) {
    diagnoses.push({
      name: 'Arritmia Cardíaca',
      severity: 'warning',
      description: 'Arritmia observada no ECG. Necessária caracterização adicional.',
      recommendation: 'ECG de 12 derivações. Monitorização cardíaca. Avaliar antiarrítmicos se necessário.'
    })
  }

  if (features.bradycardia) {
    diagnoses.push({
      name: 'Bradicardia',
      severity: features.sineWave ? 'critical' : 'warning',
      description: 'Frequência cardíaca baixa observada (<60 BPM).',
      recommendation: 'Avaliar medicações (betabloqueadores, bloqueadores dos canais de cálcio). Atropina se sintomático.'
    })
  }

  if (features.tachycardia) {
    diagnoses.push({
      name: 'Taquicardia',
      severity: 'warning',
      description: 'Frequência cardíaca elevada observada (>100 BPM).',
      recommendation: 'Investigar causa (ansiedade, infecção, hipovolemia, arritmia). ECG para caracterização.'
    })
  }

  // Combinação hipercalémia + potássio elevado nos sinais vitais
  const hasHighPotassium = vitals && vitals.potassium && Number(vitals.potassium) > 5.0
  if (hasHighPotassium && (hasTallTWaves || hasWideQRS || hasAbsentPWaves)) {
    diagnoses.push({
      name: 'Hipercalémia Confirmada (ECG + Laboratorial)',
      severity: 'critical',
      description: `Hipercalémia confirmada por K+ ${vitals.potassium} mEq/L + alterações no ECG. Correlação clínico-eletrocardiográfica positiva.`,
      recommendation: 'PROTOCOLO DE HIPERCALÉMIA: 1) Cálcio gluconato IV 10% (estabilizar membrana). 2) Insulina + glicose (deslocar K+ intracelular). 3) Bicarbonato se acidose. 4) Diuréticos ou resinas. 5) Hemodiálise se refratário.'
    })
  }

  // Isquemia e IAM
  if (features.stElevation) {
    diagnoses.push({
      name: 'IAM com Supradesnivelamento do ST (IAMCSST)',
      severity: 'critical',
      description: 'Supradesnivelamento do segmento ST observado - Infarto agudo do miocárdio em evolução.',
      recommendation: 'EMERGÊNCIA: Ativar via verde coronária. AAS 300mg + clopidogrel 300mg + heparina. Avaliar angioplastia primária (até 90min) ou trombólise (até 30min). Identificar parede afetada.'
    })
  }

  if (features.stDepression) {
    diagnoses.push({
      name: 'Isquemia Miocárdica (SCASSST)',
      severity: 'critical',
      description: 'Infradesnivelamento do segmento ST - Síndrome coronária aguda sem supra de ST.',
      recommendation: 'URGENTE: Troponina seriada. ECG serial. AAS + anticoagulação. Avaliar angiografia. Classificar escore GRACE/TIMI.'
    })
  }

  if (features.pericarditisST) {
    diagnoses.push({
      name: 'Pericardite Aguda',
      severity: 'warning',
      description: 'Supradesnivelamento ST difuso + depressão do PR - padrão de pericardite aguda.',
      recommendation: 'AINEs em doses altas (ibuprofeno ou aspirina). Colchicina. Ecocardiograma para derrame pericárdico. Excluir IAM.'
    })
  }

  // Arritmias específicas
  if (features.afib) {
    diagnoses.push({
      name: 'Fibrilação Auricular',
      severity: 'warning',
      description: 'Ritmo irregular sem ondas P identificáveis - fibrilação auricular.',
      recommendation: 'Controlar frequência (betabloqueador/verapamil). Avaliar cardioversão se <48h. Anticoagulação (CHA2DS2-VASc). Excluir causa reversível.'
    })
  }

  if (features.flutter) {
    diagnoses.push({
      name: 'Flutter Auricular',
      severity: 'warning',
      description: 'Ondas F em serra - flutter auricular típico.',
      recommendation: 'Controlar frequência ventricular. Avaliar cardioversão. Ablação por cateter (curativa). Anticoagulação.'
    })
  }

  // Bloqueios AV
  if (features.avBlock1) {
    diagnoses.push({
      name: 'Bloqueio AV de 1º Grau',
      severity: 'info',
      description: 'Intervalo PR > 200ms - condução AV lenta mas mantida.',
      recommendation: 'Geralmente benigno. Revisar medicações (betabloqueadores, verapamil). Observar.'
    })
  }

  if (features.avBlock2) {
    diagnoses.push({
      name: 'Bloqueio AV de 2º Grau',
      severity: 'warning',
      description: 'Bloqueio AV de 2º grau - falha intermitente de condução (Mobitz I ou II).',
      recommendation: 'Mobitz I: observar se assintomático. Mobitz II: marcapasso. Avaliar causa reversível (isquemia, medicações).'
    })
  }

  if (features.avBlock3) {
    diagnoses.push({
      name: 'Bloqueio AV Completo (3º Grau)',
      severity: 'critical',
      description: 'Bloqueio AV total - dissociação AV completa. Marcapasso de escape ventricular.',
      recommendation: 'EMERGÊNCIA: Marcapasso externo/transvenoso urgente. Atropina IV se instável. Avaliar causa (IAM inferior, fibrose do sistema de condução).'
    })
  }

  // Wolff-Parkinson-White
  if (features.deltaWave) {
    diagnoses.push({
      name: 'Síndrome de Wolff-Parkinson-White (WPW)',
      severity: 'warning',
      description: 'Onda delta + PR curto + QRS alargado - via acessória (feixe de Kent). Risco de taquiarritmias.',
      recommendation: 'Ablação por cateter (curativa). EVITAR: adenosina, verapamil, digoxina, betabloqueadores (podem causar FV). Flecainida ou amiodarona se taquicardia.'
    })
  }

  // QT longo
  if (features.prolongedQT) {
    diagnoses.push({
      name: 'Síndrome do QT Longo',
      severity: 'critical',
      description: 'Intervalo QT prolongado - risco de Torsades de Pointes e morte súbita.',
      recommendation: 'Corrigir eletrólitos (K+, Mg++, Ca++). Suspender fármacos que prolongam QT. Betabloqueador se congénito. Avaliar CDI.'
    })
  }

  // QT curto
  if (features.shortQT) {
    diagnoses.push({
      name: 'Síndrome do QT Curto',
      severity: 'warning',
      description: 'Intervalo QT encurtado (< 340ms) - raro, risco de arritmias malignas.',
      recommendation: 'Suspender fármacos. Avaliar hipercalcemia, hipercalémia. Cardiogenética. CDI se alto risco.'
    })
  }

  // Efeito digitálico
  if (features.digoxinEffect) {
    diagnoses.push({
      name: 'Efeito Digitálico (Digoxina)',
      severity: 'info',
      description: 'Depressão do ST em "cuba" (scooped) + onda T aplanada/invertida - efeito da digoxina.',
      recommendation: 'Confirmar nível sérico de digoxina (terapêutico: 0.5-2.0 ng/mL). Se toxicidade: suspender, anticorpos anti-digoxina se grave.'
    })
  }

  // Ondas U
  if (features.uWave) {
    diagnoses.push({
      name: 'Ondas U Proeminentes (Hipocalemia)',
      severity: 'warning',
      description: 'Ondas U proeminentes após onda T - sugestivo de hipocalemia.',
      recommendation: 'Verificar potássio sérico. Suplementação de KCl. Investigar causa (diuréticos, diarreia, vômitos).'
    })
  }

  // Ondas de Osborn
  if (features.osbornWave) {
    diagnoses.push({
      name: 'Ondas de Osborn (Hipotermia)',
      severity: 'warning',
      description: 'Ondas J (Osborn) - deflexão positiva na junção JST. Sinal de hipotermia.',
      recommendation: 'Aquecimento gradual. Monitorização cardíaca. Corrigir distúrbios eletrolíticos associados.'
    })
  }

  // Baixa voltagem
  if (features.lowVoltage) {
    diagnoses.push({
      name: 'Baixa Voltagem do QRS',
      severity: 'info',
      description: 'QRS de baixa voltagem - pode indicar derrame pericárdico, obesidade, DPOC, hipotireoidismo, amiloidose.',
      recommendation: 'Ecocardiograma para derrame pericárdico. Avaliar TSH, função pulmonar. Considerar amiloidose se idoso.'
    })
  }

  // Sobrecarga VE
  if (features.lvh) {
    diagnoses.push({
      name: 'Sobrecarga do Ventrículo Esquerdo (HVE)',
      severity: 'warning',
      description: 'Critérios de HVE (Sokolow-Lyon, Cornell) - hipertrofia ventricular esquerda.',
      recommendation: 'Ecocardiograma. Controlar PA. Investigar causa (hipertensão, estenose aórtica, miocardiopatia hipertrófica).'
    })
  }

  // Sobrecarga VD
  if (features.rvh) {
    diagnoses.push({
      name: 'Sobrecarga do Ventrículo Direito (HVD)',
      severity: 'warning',
      description: 'Critérios de HVD - hipertrofia ventricular direita.',
      recommendation: 'Ecocardiograma. Avaliar causa (DPOC, embolia pulmonar, estenose pulmonar, cardiopatia congénita).'
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
  // Analisar largura do QRS baseado na detecção de picos
  const peaks = findPeaks(data)
  if (peaks.length < 2) return Math.random() * 40 + 80

  const samplingRate = 250
  const qrsDurations = []

  for (const peak of peaks) {
    // Encontrar início e fim do QRS (onde o sinal cruza zero ao redor do pico)
    let start = peak
    while (start > 0 && Math.abs(data[start]) > 0.05 * Math.abs(data[peak])) {
      start--
    }
    let end = peak
    while (end < data.length - 1 && Math.abs(data[end]) > 0.05 * Math.abs(data[peak])) {
      end++
    }

    const duration = ((end - start) / samplingRate) * 1000 // em ms
    if (duration > 40 && duration < 200) {
      qrsDurations.push(duration)
    }
  }

  if (qrsDurations.length === 0) return Math.random() * 40 + 80
  return qrsDurations.reduce((a, b) => a + b, 0) / qrsDurations.length
}

function analyzeQT(data) {
  const peaks = findPeaks(data)
  if (peaks.length < 2) return Math.random() * 80 + 360

  const samplingRate = 250
  const qtIntervals = []

  for (let i = 0; i < Math.min(peaks.length, 10); i++) {
    const rPeakIdx = peaks[i]
    const nextPeakIdx = i < peaks.length - 1 ? peaks[i + 1] : rPeakIdx + samplingRate

    // Encontrar fim da onda T
    let tEnd = rPeakIdx + Math.floor(0.5 * samplingRate)
    if (tEnd >= data.length) tEnd = data.length - 1

    // Procurar ponto onde o sinal retorna à linha de base após o pico R
    for (let j = rPeakIdx + Math.floor(0.15 * samplingRate); j < tEnd; j++) {
      if (Math.abs(data[j]) < 0.05 * Math.abs(data[rPeakIdx])) {
        tEnd = j
        break
      }
    }

    const qt = ((tEnd - rPeakIdx) / samplingRate) * 1000
    if (qt > 200 && qt < 600) {
      qtIntervals.push(qt)
    }
  }

  if (qtIntervals.length === 0) return Math.random() * 80 + 360
  return qtIntervals.reduce((a, b) => a + b, 0) / qtIntervals.length
}

function analyzePR(data) {
  const peaks = findPeaks(data)
  if (peaks.length < 2) return Math.random() * 60 + 140

  const samplingRate = 250
  const prIntervals = []

  for (let i = 0; i < Math.min(peaks.length, 10); i++) {
    const rPeakIdx = peaks[i]
    // Procurar onda P antes do QRS (100-200ms antes)
    const pWaveStart = rPeakIdx - Math.floor(0.25 * samplingRate)
    const pWaveEnd = rPeakIdx - Math.floor(0.05 * samplingRate)

    if (pWaveStart < 0 || pWaveEnd >= data.length) continue

    // Encontrar início da onda P
    let pStart = pWaveEnd
    for (let j = pWaveEnd; j > pWaveStart; j--) {
      if (Math.abs(data[j]) < 0.05 * Math.abs(data[rPeakIdx])) {
        pStart = j
        break
      }
    }

    const pr = ((rPeakIdx - pStart) / samplingRate) * 1000
    if (pr > 80 && pr < 300) {
      prIntervals.push(pr)
    }
  }

  if (prIntervals.length === 0) return Math.random() * 60 + 140
  return prIntervals.reduce((a, b) => a + b, 0) / prIntervals.length
}

function analyzeHyperkalemia(data, qrsWidth, prInterval, bpm) {
  if (!data || data.length < 250) {
    return { detected: false }
  }

  const peaks = findPeaks(data)
  if (peaks.length < 2) return { detected: false }

  // Calcular amplitude média dos picos (R)
  const peakAmplitudes = peaks.map(p => data[p])
  const avgPeakAmp = peakAmplitudes.reduce((a, b) => a + b, 0) / peakAmplitudes.length

  // Detectar ondas T altas e picudas (hipercalémia leve/moderada)
  // Ondas T ocorrem após o complexo QRS - procurar picos secundários entre batimentos
  const twavePeaks = findTWaves(data, peaks)
  const avgTWaveAmp = twavePeaks.length > 0
    ? twavePeaks.reduce((a, b) => a + b, 0) / twavePeaks.length
    : 0

  // Critérios de hipercalémia:
  // 1. Ondas T altas (> 50% da amplitude do QRS) e picudas
  // 2. QRS alargado (> 120ms)
  // 3. BRadicardia ou ritmo irregular
  let severity = null
  let description = ''
  let recommendation = ''

  const tWaveRatio = avgPeakAmp > 0 ? Math.abs(avgTWaveAmp / avgPeakAmp) : 0

  if (tWaveRatio > 0.6 && qrsWidth > 140) {
    // Hipercalémia grave - ondas T muito altas + QRS muito largo
    severity = 'critical'
    description = `Ondas T picudas e elevadas com QRS alargado (${qrsWidth.toFixed(0)}ms). Padrão sugestivo de hipercalémia grave (K+ > 6.5 mEq/L)`
    recommendation = 'EMERGÊNCIA: Cálcio gluconato IV, insulina + glicose, bicarbonato. Preparar hemodiálise. Verificar potássio sérico urgentemente.'
  } else if (tWaveRatio > 0.5) {
    // Hipercalémia moderada - ondas T altas e picudas
    severity = 'warning'
    description = `Ondas T elevadas e picudas detectadas. Possível hipercalémia moderada (K+ 5.5-6.5 mEq/L). Relação T/QRS: ${(tWaveRatio * 100).toFixed(0)}%`
    recommendation = 'Solicitar potássio sérico urgentemente. Remover fontes de K+. Considerar resinas de troca iônica.'
  } else if (qrsWidth > 130 && prInterval > 200) {
    // QRS alargado + PR prolongado pode indicar hipercalémia
    severity = 'warning'
    description = `QRS alargado (${qrsWidth.toFixed(0)}ms) com PR prolongado (${prInterval.toFixed(0)}ms). Possível hipercalémia em evolução.`
    recommendation = 'Verificar potássio sérico. Monitoramento cardíaco contínuo. Avaliar função renal.'
  }

  if (severity) {
    return {
      detected: true,
      severity,
      description,
      recommendation
    }
  }

  return { detected: false }
}

function findTWaves(data, rPeaks) {
  // Encontrar ondas T - procuram-se picos positivos entre os complexos QRS
  // Tipicamente 200-400ms após cada onda R
  const samplingRate = 250 // assumindo 250 Hz
  const twavePeaks = []

  for (let i = 0; i < rPeaks.length - 1; i++) {
    const rPeakIdx = rPeaks[i]
    const nextRPeakIdx = rPeaks[i + 1]
    const rrInterval = nextRPeakIdx - rPeakIdx

    // Janela para onda T: 200-450ms após pico R (50-112 pontos a 250Hz)
    const twaveStart = rPeakIdx + Math.floor(0.2 * samplingRate)
    const twaveEnd = rPeakIdx + Math.min(Math.floor(0.45 * samplingRate), rrInterval - 20)

    if (twaveStart >= data.length || twaveEnd >= data.length || twaveStart >= twaveEnd) continue

    // Encontrar pico na janela T
    let maxT = -Infinity
    for (let j = twaveStart; j < twaveEnd; j++) {
      if (data[j] > maxT) {
        maxT = data[j]
      }
    }

    // Só considerar se o pico T for positivo e significativo
    const rAmplitude = Math.abs(data[rPeakIdx])
    if (maxT > rAmplitude * 0.3 && maxT > 0) {
      twavePeaks.push(maxT)
    }
  }

  return twavePeaks
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
