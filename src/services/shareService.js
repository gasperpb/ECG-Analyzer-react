import html2pdf from 'html2pdf.js'

/**
 * Gera um PDF dos resultados da análise ECG
 * @param {Object} data - Dados da análise
 * @returns {Promise} Promise que resolve com sucesso
 */
export const generatePDF = async (data) => {
  try {
    // Criar elemento HTML com os resultados
    const element = document.createElement('div')
    element.style.padding = '20px'
    element.style.fontFamily = 'Arial, sans-serif'
    element.style.color = '#333'

    // Cabeçalho
    let html = `
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px;">
        <h1 style="margin: 0; color: #1f2937; font-size: 28px;">🏥 ECG Analyzer - Relatório de Análise</h1>
        <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 14px;">Relatório gerado em ${new Date().toLocaleDateString('pt-BR', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</p>
      </div>

      <div style="margin-bottom: 30px;">
        <h2 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 15px;">📊 Métricas Principais</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px; border: 1px solid #e5e7eb; background-color: #f9fafb; font-weight: bold;">Frequência Cardíaca</td>
            <td style="padding: 10px; border: 1px solid #e5e7eb;">${data.bpm || 72} BPM</td>
            <td style="padding: 10px; border: 1px solid #e5e7eb; background-color: #f9fafb; font-weight: bold;">Ritmo</td>
            <td style="padding: 10px; border: 1px solid #e5e7eb;">${data.rhythm || 'Sinusal'}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #e5e7eb; background-color: #f9fafb; font-weight: bold;">Intervalo QT</td>
            <td style="padding: 10px; border: 1px solid #e5e7eb;">${data.qt || '400'} ms</td>
            <td style="padding: 10px; border: 1px solid #e5e7eb; background-color: #f9fafb; font-weight: bold;">Intervalo PR</td>
            <td style="padding: 10px; border: 1px solid #e5e7eb;">${data.pr || '160'} ms</td>
          </tr>
        </table>
      </div>
    `

    // Sinais Vitais
    if (data.vitalSignsIncluded) {
      html += `
        <div style="margin-bottom: 30px;">
          <h2 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 15px;">💊 Sinais Vitais</h2>
          <table style="width: 100%; border-collapse: collapse;">
      `

      const vitalSigns = [
        { label: 'SpO₂ (Oximetria)', value: data.spO2, unit: '%' },
        { label: 'Glicose', value: data.glucose, unit: 'mg/dL' },
        { label: 'Pressão Arterial', value: data.systolic && data.diastolic ? `${data.systolic}/${data.diastolic}` : null, unit: 'mmHg' },
        { label: 'Temperatura', value: data.temperature, unit: '°C' },
        { label: 'Frequência Respiratória', value: data.respiratoryRate, unit: 'bpm' },
        { label: 'Hemoglobina', value: data.hemoglobin, unit: 'g/dL' },
        { label: 'Tipo Sanguíneo', value: data.bloodType, unit: '' }
      ]

      vitalSigns.forEach((vital, idx) => {
        if (vital.value) {
          html += `
            <tr>
              <td style="padding: 10px; border: 1px solid #e5e7eb; background-color: #f9fafb; font-weight: bold; width: 50%;">${vital.label}</td>
              <td style="padding: 10px; border: 1px solid #e5e7eb;">${vital.value} ${vital.unit}</td>
            </tr>
          `
        }
      })

      html += `
          </table>
        </div>
      `
    }

    // Nível de Risco
    if (data.overallSeverity) {
      const riskColors = {
        critical: '#dc2626',
        warning: '#f59e0b',
        normal: '#10b981'
      }
      const riskLabels = {
        critical: 'Crítico - Busque atenção médica imediatamente',
        warning: 'Atenção - Recomenda-se avaliação',
        normal: 'Baixo Risco - Resultado normal'
      }

      html += `
        <div style="margin-bottom: 30px; padding: 20px; border-left: 4px solid ${riskColors[data.overallSeverity]}; background-color: #f9fafb;">
          <h2 style="margin: 0 0 10px 0; color: #1f2937;">Nível de Risco Geral</h2>
          <p style="margin: 0; color: ${riskColors[data.overallSeverity]}; font-weight: bold; font-size: 16px;">
            ${riskLabels[data.overallSeverity]}
          </p>
        </div>
      `
    }

    // Diagnósticos
    if (data.diagnoses && data.diagnoses.length > 0) {
      html += `
        <div style="margin-bottom: 30px;">
          <h2 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 15px;">📋 Diagnósticos Identificados</h2>
          <div style="page-break-inside: avoid;">
      `

      data.diagnoses.forEach(diagnosis => {
        const severityColor = {
          critical: '#dc2626',
          warning: '#f59e0b',
          info: '#3b82f6',
          normal: '#10b981'
        }[diagnosis.severity] || '#6b7280'

        html += `
          <div style="margin-bottom: 15px; padding: 15px; border-left: 4px solid ${severityColor}; background-color: #f9fafb;">
            <h3 style="margin: 0 0 8px 0; color: ${severityColor}; font-size: 16px;">${diagnosis.name}</h3>
            <p style="margin: 0 0 10px 0; color: #4b5563; font-size: 14px;">${diagnosis.description}</p>
            ${diagnosis.recommendation ? `<p style="margin: 0; color: #3b82f6; font-weight: bold; font-size: 13px;">✓ ${diagnosis.recommendation}</p>` : ''}
          </div>
        `
      })

      html += `
          </div>
        </div>
      `
    }

    // Interpretação Clínica
    if (data.interpretation) {
      html += `
        <div style="margin-bottom: 30px; padding: 15px; border-left: 4px solid #8b5cf6; background-color: #f9fafb;">
          <h2 style="margin: 0 0 10px 0; color: #1f2937;">📋 Interpretação Clínica</h2>
          <p style="margin: 0; color: #4b5563; line-height: 1.6;">${data.interpretation}</p>
        </div>
      `
    }

    // Recomendações
    if (data.recommendations) {
      const recs = Array.isArray(data.recommendations) ? data.recommendations : [data.recommendations]
      html += `
        <div style="margin-bottom: 30px; padding: 15px; border-left: 4px solid #3b82f6; background-color: #f9fafb;">
          <h2 style="margin: 0 0 10px 0; color: #1f2937;">💡 Recomendações</h2>
          <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
      `

      recs.forEach(rec => {
        html += `<li style="margin: 5px 0;">${rec}</li>`
      })

      html += `
          </ul>
        </div>
      `
    }

    // Detalhes Técnicos
    if (data.ecgChart) {
      html += `
        <div style="margin-bottom: 30px;">
          <h2 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 15px;">🔧 Detalhes Técnicos</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px; border: 1px solid #e5e7eb; background-color: #f9fafb; font-weight: bold;">Taxa de Amostragem</td>
              <td style="padding: 10px; border: 1px solid #e5e7eb;">${data.ecgChart.samplingRate || 250} Hz</td>
              <td style="padding: 10px; border: 1px solid #e5e7eb; background-color: #f9fafb; font-weight: bold;">Duração</td>
              <td style="padding: 10px; border: 1px solid #e5e7eb;">${data.ecgChart.duration?.toFixed(2) || '10'} s</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e5e7eb; background-color: #f9fafb; font-weight: bold;">Total de Pontos</td>
              <td style="padding: 10px; border: 1px solid #e5e7eb;">${data.ecgChart.data?.length || 2500}</td>
              <td style="padding: 10px; border: 1px solid #e5e7eb; background-color: #f9fafb; font-weight: bold;">Data</td>
              <td style="padding: 10px; border: 1px solid #e5e7eb;">${new Date().toLocaleDateString('pt-BR')}</td>
            </tr>
          </table>
        </div>
      `
    }

    // Rodapé
    html += `
      <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px;">
        <p style="margin: 0;">Este relatório foi gerado automaticamente pelo ECG Analyzer</p>
        <p style="margin: 5px 0 0 0;">⚠️ Para fins educacionais e de referência apenas. Não substitui avaliação médica profissional.</p>
      </div>
    `

    element.innerHTML = html

    // Configurações do PDF
    const options = {
      margin: 10,
      filename: `ECG_Relatorio_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    }

    // Gerar PDF
    html2pdf().set(options).from(element).save()

    return true
  } catch (error) {
    console.error('Erro ao gerar PDF:', error)
    throw error
  }
}

/**
 * Gera um link compartilhável com os dados da análise
 * @param {Object} data - Dados da análise
 * @returns {string} URL com dados codificados
 */
export const generateShareLink = (data) => {
  try {
    // Comprimir dados em JSON
    const dataString = JSON.stringify(data)
    
    // Codificar em Base64
    const encoded = btoa(unescape(encodeURIComponent(dataString)))
    
    // Criar URL
    const baseUrl = window.location.origin + window.location.pathname
    const shareUrl = `${baseUrl}?shared=${encoded}`
    
    return shareUrl
  } catch (error) {
    console.error('Erro ao gerar link de compartilhamento:', error)
    throw error
  }
}

/**
 * Copia o link de compartilhamento para a clipboard
 * @param {Object} data - Dados da análise
 * @returns {Promise<string>} URL copiada
 */
export const copyShareLink = async (data) => {
  try {
    const shareLink = generateShareLink(data)
    
    // Usar Clipboard API se disponível
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareLink)
    } else {
      // Fallback para navegadores antigos
      const textArea = document.createElement('textarea')
      textArea.value = shareLink
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    }
    
    return shareLink
  } catch (error) {
    console.error('Erro ao copiar para clipboard:', error)
    throw error
  }
}

/**
 * Compartilhar usando Web Share API (em dispositivos suportados)
 * @param {Object} data - Dados da análise
 * @param {string} title - Título para compartilhamento
 * @returns {Promise} Promise que resolve quando compartilhado
 */
export const shareViaWebShare = async (data, title = 'Relatório ECG Analyzer') => {
  try {
    if (!navigator.share) {
      throw new Error('Web Share API não suportada')
    }

    const shareLink = generateShareLink(data)

    await navigator.share({
      title: title,
      text: 'Veja o meu relatório de análise ECG',
      url: shareLink
    })

    return true
  } catch (error) {
    console.error('Erro ao compartilhar:', error)
    // Se for cancelado pelo usuário, não é um erro crítico
    if (error.name !== 'AbortError') {
      throw error
    }
  }
}

/**
 * Gera um resumo de texto para compartilhamento via email/mensagem
 * @param {Object} data - Dados da análise
 * @returns {string} Texto do resumo
 */
export const generateSummaryText = (data) => {
  let summary = `🏥 ECG Analyzer - Resumo da Análise\n\n`

  summary += `📊 Métricas Principais:\n`
  summary += `  • Frequência Cardíaca: ${data.bpm || 72} BPM\n`
  summary += `  • Ritmo: ${data.rhythm || 'Sinusal'}\n`
  summary += `  • QT: ${data.qt || '400'} ms\n`
  summary += `  • PR: ${data.pr || '160'} ms\n\n`

  if (data.vitalSignsIncluded) {
    summary += `💊 Sinais Vitais:\n`
    if (data.spO2) summary += `  • SpO₂: ${data.spO2}%\n`
    if (data.glucose) summary += `  • Glicose: ${data.glucose} mg/dL\n`
    if (data.systolic) summary += `  • Pressão: ${data.systolic}/${data.diastolic} mmHg\n`
    if (data.temperature) summary += `  • Temperatura: ${data.temperature}°C\n`
    if (data.respiratoryRate) summary += `  • FR: ${data.respiratoryRate} bpm\n`
    if (data.hemoglobin) summary += `  • Hemoglobina: ${data.hemoglobin} g/dL\n\n`
  }

  if (data.overallSeverity) {
    const riskLabels = {
      critical: '🔴 Crítico - Busque atenção médica imediatamente',
      warning: '🟡 Atenção - Recomenda-se avaliação',
      normal: '🟢 Baixo Risco - Resultado normal'
    }
    summary += `⚠️ Nível de Risco: ${riskLabels[data.overallSeverity]}\n\n`
  }

  if (data.diagnoses && data.diagnoses.length > 0) {
    summary += `📋 Diagnósticos (${data.diagnoses.length}):\n`
    data.diagnoses.slice(0, 5).forEach(d => {
      summary += `  • ${d.name}\n`
    })
    if (data.diagnoses.length > 5) {
      summary += `  ... e mais ${data.diagnoses.length - 5}\n`
    }
    summary += `\n`
  }

  summary += `Data: ${new Date().toLocaleDateString('pt-BR')}\n`
  summary += `⚠️ Este é um resumo automático. Consulte um médico para avaliação completa.`

  return summary
}

/**
 * Copia o resumo de texto para compartilhamento
 * @param {Object} data - Dados da análise
 * @returns {Promise<string>} Texto copiado
 */
export const copySummaryText = async (data) => {
  try {
    const summaryText = generateSummaryText(data)
    
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(summaryText)
    } else {
      const textArea = document.createElement('textarea')
      textArea.value = summaryText
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    }
    
    return summaryText
  } catch (error) {
    console.error('Erro ao copiar resumo:', error)
    throw error
  }
}
