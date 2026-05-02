import html2canvas from 'html2canvas'

export const renderECGToImage = async (chartContainerId) => {
  try {
    const element = document.getElementById(chartContainerId)
    if (!element) {
      throw new Error('Elemento do gráfico não encontrado')
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false
    })

    return canvas.toDataURL('image/png')
  } catch (error) {
    console.error('Erro ao renderizar ECG como imagem:', error)
    throw error
  }
}

export const downloadECGImage = async (dataUrl, filename = 'ecg-para-ia.png') => {
  try {
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = filename
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    return true
  } catch (error) {
    console.error('Erro ao baixar imagem:', error)
    throw error
  }
}

export const openECGR1Platform = () => {
  window.open('http://ai.heartvoice.com.cn/ECG-R1/', '_blank')
}

export const sendToECGR1 = async (chartContainerId) => {
  try {
    const dataUrl = await renderECGToImage(chartContainerId)

    await downloadECGImage(dataUrl, 'ecg-para-analise-ia.png')

    setTimeout(() => {
      openECGR1Platform()
    }, 1000)

    return true
  } catch (error) {
    console.error('Erro ao enviar para ECG-R1:', error)
    throw error
  }
}

export const sendToECGR1WithPrompt = async (chartContainerId) => {
  try {
    const dataUrl = await renderECGToImage(chartContainerId)

    await downloadECGImage(dataUrl, 'ecg-para-analise-ia.png')

    setTimeout(() => {
      openECGR1Platform()
      alert(
        '📋 Instruções:\n\n' +
        '1. A imagem do ECG foi baixada automaticamente\n' +
        '2. Faça upload da imagem na plataforma ECG-R1\n' +
        '3. Clique em "Start Analysis"\n' +
        '4. O laudo será gerado automaticamente em português\n\n' +
        '💡 Dica: Arraste a imagem baixada diretamente na área de upload'
      )
    }, 1000)

    return true
  } catch (error) {
    console.error('Erro ao enviar para ECG-R1:', error)
    throw error
  }
}
