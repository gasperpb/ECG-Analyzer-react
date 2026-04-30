/**
 * Funções auxiliares para diagnósticos
 */

export function generateInterpretation(diagnoses, vitalSigns) {
  if (!diagnoses || diagnoses.length === 0) {
    return 'Análise dentro dos parâmetros normais. Continue com acompanhamento regular.'
  }

  const criticalDiags = diagnoses.filter(d => d.severity === 'critical')
  const warningDiags = diagnoses.filter(d => d.severity === 'warning')

  let interpretation = ''

  if (criticalDiags.length > 0) {
    interpretation += `⚠️ CRÍTICO: ${criticalDiags.map(d => d.name).join(', ')} detectados. `
  }

  if (warningDiags.length > 0) {
    interpretation += `⚠️ ATENÇÃO: ${warningDiags.map(d => d.name).join(', ')} detectados. `
  }

  interpretation += 'Recomenda-se consulta médica especializada para avaliação completa.'

  return interpretation
}

export function generateRecommendations(diagnoses, vitalSigns) {
  const recommendations = []

  if (!diagnoses || diagnoses.length === 0) {
    recommendations.push({
      priority: 'normal',
      text: 'Manter rotina regular de exercícios e acompanhamento'
    })
    recommendations.push({
      priority: 'normal',
      text: 'Realizar check-up anual'
    })
    return recommendations
  }

  const hasCritical = diagnoses.some(d => d.severity === 'critical')
  const hasWarning = diagnoses.some(d => d.severity === 'warning')

  if (hasCritical) {
    recommendations.push({
      priority: 'critical',
      text: 'PROCURE ASSISTÊNCIA MÉDICA IMEDIATAMENTE'
    })
    recommendations.push({
      priority: 'critical',
      text: 'Não ignore sintomas como dor no peito, falta de ar ou desmaios'
    })
  }

  if (hasWarning) {
    recommendations.push({
      priority: 'warning',
      text: 'Agende consulta médica urgente'
    })
    recommendations.push({
      priority: 'warning',
      text: 'Evite atividades extenuantes até avaliação médica'
    })
  }

  if (vitalSigns) {
    if (vitalSigns.spO2 && vitalSigns.spO2 < 95) {
      recommendations.push({
        priority: 'warning',
        text: 'Saturação de oxigênio baixa - procure médico'
      })
    }
    if (vitalSigns.temperature && vitalSigns.temperature > 38) {
      recommendations.push({
        priority: 'warning',
        text: 'Febre alta - procure atendimento médico'
      })
    }
  }

  recommendations.push({
    priority: 'normal',
    text: 'Manter estilos de vida saudáveis: atividade física regular, dieta balanceada'
  })

  recommendations.push({
    priority: 'normal',
    text: 'Controle regular de pressão arterial'
  })

  return recommendations
}

export default {
  generateInterpretation,
  generateRecommendations
}
