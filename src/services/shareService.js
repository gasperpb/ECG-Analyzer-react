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

export const generateProfessionalPDF = async (data, options = {}) => {
  try {
    const {
      doctorName = '',
      doctorCRM = '',
      institution = '',
      includeLogo = true,
      includeSignature = true
    } = options

    const today = new Date()
    const dateStr = today.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    const timeStr = today.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    const fileName = `ECG-Laudo-${today.toISOString().split('T')[0]}-${timeStr.replace(':', 'h')}.pdf`

    const severityLabels = {
      critical: 'CRÍTICO',
      warning: 'ATENÇÃO',
      moderate: 'MODERADO',
      normal: 'NORMAL',
      low: 'BAIXO RISCO'
    }

    const severityColors = {
      critical: '#dc2626',
      warning: '#f59e0b',
      moderate: '#f97316',
      normal: '#10b981',
      low: '#10b981'
    }

    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #1f2937; line-height: 1.6; }
          .page { padding: 20px; max-width: 800px; margin: 0 auto; }
          .header { 
            background: linear-gradient(135deg, #0284c7 0%, #dc2626 100%);
            color: white;
            padding: 25px;
            border-radius: 12px;
            margin-bottom: 25px;
            position: relative;
          }
          .header h1 { font-size: 26px; margin-bottom: 5px; font-weight: 700; }
          .header .subtitle { font-size: 14px; opacity: 0.9; }
          .header .meta { 
            position: absolute;
            top: 25px;
            right: 25px;
            text-align: right;
            font-size: 12px;
            opacity: 0.8;
          }
          .institution { 
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            padding: 12px 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .institution .icon { font-size: 20px; }
          .institution .name { font-weight: 600; font-size: 16px; color: #111827; }
          .section { 
            margin-bottom: 25px;
            page-break-inside: avoid;
          }
          .section-title { 
            font-size: 18px;
            font-weight: 700;
            color: #0284c7;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 8px;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .metrics-grid { 
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin-bottom: 15px;
          }
          .metric-card { 
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-left: 4px solid #0284c7;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
          }
          .metric-card.red { border-left-color: #dc2626; }
          .metric-card.green { border-left-color: #10b981; }
          .metric-card.purple { border-left-color: #8b5cf6; }
          .metric-card .label { font-size: 11px; color: #6b7280; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px; }
          .metric-card .value { font-size: 24px; font-weight: 700; color: #111827; }
          .metric-card .unit { font-size: 12px; color: #6b7280; font-weight: 400; }
          .risk-box { 
            padding: 20px;
            border-left: 5px solid;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          .risk-box h3 { margin-bottom: 8px; font-size: 16px; }
          .risk-box p { margin: 0; font-size: 14px; }
          .diagnosis-card {
            padding: 15px;
            border-left: 4px solid;
            background: #f9fafb;
            border-radius: 6px;
            margin-bottom: 12px;
          }
          .diagnosis-card h4 { font-size: 15px; margin-bottom: 5px; }
          .diagnosis-card p { font-size: 13px; color: #4b5563; margin-bottom: 5px; }
          .diagnosis-card .recommendation { font-size: 12px; color: #0284c7; font-weight: 600; }
          .severity-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            margin-left: 8px;
          }
          .interpretation-box {
            background: #f8f5ff;
            border-left: 4px solid #8b5cf6;
            padding: 15px;
            border-radius: 6px;
          }
          .interpretation-box p { margin: 0; color: #4b5563; }
          .recommendations-box {
            background: #eff6ff;
            border-left: 4px solid #3b82f6;
            padding: 15px;
            border-radius: 6px;
          }
          .recommendations-box ul { margin: 10px 0 0 20px; }
          .recommendations-box li { margin: 5px 0; color: #4b5563; font-size: 14px; }
          .signature-area {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            page-break-inside: avoid;
          }
          .signature-line {
            width: 300px;
            border-top: 2px solid #374151;
            margin: 0 auto 10px auto;
            padding-top: 10px;
            text-align: center;
          }
          .signature-name { font-weight: 600; font-size: 15px; color: #111827; }
          .signature-crm { font-size: 13px; color: #6b7280; }
          .footer {
            margin-top: 40px;
            padding-top: 15px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            font-size: 11px;
            color: #9ca3af;
          }
          .footer .warning { 
            margin-top: 8px;
            color: #dc2626;
            font-weight: 600;
            font-size: 10px;
          }
          .tech-details {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
          }
          .tech-item {
            background: #f9fafb;
            padding: 10px;
            border-radius: 6px;
            text-align: center;
          }
          .tech-item .label { font-size: 11px; color: #6b7280; }
          .tech-item .value { font-size: 14px; font-weight: 600; color: #111827; }
          @media print {
            .page { padding: 15px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="header">
            <h1>🏥 ECG Analyzer</h1>
            <div class="subtitle">Laudo de Análise Eletrocardiográfica</div>
            <div class="meta">
              <div>Data: ${dateStr}</div>
              <div>Hora: ${timeStr}</div>
              <div>ID: ${data.id || 'N/A'}</div>
            </div>
          </div>

          ${institution ? `
          <div class="institution">
            <span class="icon">🏥</span>
            <span class="name">${institution}</span>
          </div>
          ` : ''}

          <div class="section">
            <div class="section-title">📊 Métricas Principais</div>
            <div class="metrics-grid">
              <div class="metric-card red">
                <div class="label">Frequência Cardíaca</div>
                <div class="value">${data.bpm || '--'}</div>
                <div class="unit">BPM</div>
              </div>
              <div class="metric-card green">
                <div class="label">Ritmo</div>
                <div class="value" style="font-size: 16px;">${data.rhythm || '--'}</div>
              </div>
              <div class="metric-card purple">
                <div class="label">Intervalo QT</div>
                <div class="value">${data.qt || '--'}</div>
                <div class="unit">ms</div>
              </div>
              <div class="metric-card">
                <div class="label">Intervalo PR</div>
                <div class="value">${data.pr || '--'}</div>
                <div class="unit">ms</div>
              </div>
            </div>
          </div>

          ${(data.overallSeverity || data.riskLevel) ? `
          <div class="section">
            <div class="section-title">⚠️ Nível de Risco</div>
            <div class="risk-box" style="border-color: ${severityColors[data.overallSeverity] || severityColors.normal}; background: ${severityColors[data.overallSeverity]}10;">
              <h3 style="color: ${severityColors[data.overallSeverity] || severityColors.normal};">
                ${severityLabels[data.overallSeverity] || severityLabels.normal}
              </h3>
              <p style="color: ${severityColors[data.overallSeverity] || severityColors.normal};">
                ${data.overallSeverity === 'critical' ? 'Busque atenção médica imediatamente' :
                  data.overallSeverity === 'warning' ? 'Recomenda-se avaliação médica' :
                  data.overallSeverity === 'moderate' ? 'Acompanhamento recomendado' :
                  'Resultado dentro dos parâmetros normais'}
              </p>
            </div>
          </div>
          ` : ''}

          ${data.diagnoses && data.diagnoses.length > 0 ? `
          <div class="section">
            <div class="section-title">📋 Diagnósticos</div>
            ${data.diagnoses.map(d => `
              <div class="diagnosis-card" style="border-color: ${severityColors[d.severity] || '#6b7280'};">
                <h4>
                  ${d.name}
                  <span class="severity-badge" style="background: ${severityColors[d.severity] || '#6b7280'}20; color: ${severityColors[d.severity] || '#6b7280'};">
                    ${severityLabels[d.severity] || d.severity?.toUpperCase() || 'INFO'}
                  </span>
                </h4>
                ${d.description ? `<p>${d.description}</p>` : ''}
                ${d.recommendation ? `<div class="recommendation">💡 ${d.recommendation}</div>` : ''}
              </div>
            `).join('')}
          </div>
          ` : ''}

          ${data.interpretation ? `
          <div class="section">
            <div class="section-title">📝 Interpretação Clínica</div>
            <div class="interpretation-box">
              <p>${data.interpretation}</p>
            </div>
          </div>
          ` : ''}

          ${data.recommendations ? `
          <div class="section">
            <div class="section-title">💡 Recomendações</div>
            <div class="recommendations-box">
              <ul>
                ${(Array.isArray(data.recommendations) ? data.recommendations : [data.recommendations]).map(r => 
                  `<li>${typeof r === 'string' ? r : r.text || ''}</li>`
                ).join('')}
              </ul>
            </div>
          </div>
          ` : ''}

          ${data.ecgChart ? `
          <div class="section">
            <div class="section-title">🔧 Detalhes Técnicos</div>
            <div class="tech-details">
              <div class="tech-item">
                <div class="label">Taxa de Amostragem</div>
                <div class="value">${data.ecgChart.samplingRate || 250} Hz</div>
              </div>
              <div class="tech-item">
                <div class="label">Duração</div>
                <div class="value">${data.ecgChart.duration?.toFixed(2) || '10'} s</div>
              </div>
              <div class="tech-item">
                <div class="label">Pontos</div>
                <div class="value">${data.ecgChart.data?.length || 2500}</div>
              </div>
              <div class="tech-item">
                <div class="label">Fonte</div>
                <div class="value" style="font-size: 12px;">${data.source || 'N/A'}</div>
              </div>
              <div class="tech-item">
                <div class="label">QRS</div>
                <div class="value">${data.qrs || '--'} ms</div>
              </div>
              <div class="tech-item">
                <div class="label">Tipo</div>
                <div class="value" style="font-size: 12px;">${data.isSimulated ? 'Simulado' : 'Real'}</div>
              </div>
            </div>
          </div>
          ` : ''}

          ${includeSignature ? `
          <div class="signature-area">
            <div class="signature-line">
              <div class="signature-name">${doctorName || '___________________________________'}</div>
              <div class="signature-crm">${doctorCRM ? `CRM: ${doctorCRM}` : 'Assinatura e Carimbo do Médico'}</div>
            </div>
          </div>
          ` : ''}

          <div class="footer">
            <div>Laudo gerado automaticamente pelo ECG Analyzer | ${dateStr} às ${timeStr}</div>
            <div class="warning">
              ⚠️ Este laudo é para fins educacionais e de referência. Não substitui avaliação médica profissional.
            </div>
          </div>
        </div>
      </body>
      </html>
    `

    const element = document.createElement('div')
    element.innerHTML = html

    const options = {
      margin: [10, 10, 10, 10],
      filename: fileName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    }

    html2pdf().set(options).from(element).save()
    return true
  } catch (error) {
    console.error('Erro ao gerar PDF profissional:', error)
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
