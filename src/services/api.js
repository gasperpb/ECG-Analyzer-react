import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const ecgService = {
  // Análise de dados ECG
  analyzeECG: async (ecgData) => {
    try {
      console.log('Iniciando análise de ECG com dados:', {
        samplingRate: ecgData.samplingRate,
        duration: ecgData.duration,
        dataPoints: ecgData.data?.length
      })

      const response = await api.post('/ecg/analyze', ecgData)
      
      console.log('Resposta recebida do backend:', response.data)
      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Erro desconhecido'
      console.error('Erro na requisição:', {
        status: error.response?.status,
        message: errorMessage,
        url: error.config?.url,
        baseURL: error.config?.baseURL
      })
      throw new Error(`Erro ao analisar ECG: ${errorMessage}`)
    }
  },

  // Upload de arquivo ECG
  uploadFile: async (file) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await api.post('/ecg/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao fazer upload do arquivo')
    }
  },

  // Status da análise
  getStatus: async () => {
    try {
      const response = await api.get('/ecg/status')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao obter status')
    }
  },

  // Dados de exemplo
  getSimulatedData: async () => {
    try {
      const response = await api.get('/ecg/simulated')
      return response.data
    } catch (error) {
      // Retorna dados simulados locais se o backend não tiver esse endpoint
      return generateSimulatedECG()
    }
  }
}

// Função para gerar dados ECG simulados
export const generateSimulatedECG = () => {
  const samplingRate = 250 // Hz
  const duration = 10 // segundos
  const bpm = 72 + Math.random() * 20 // 72-92 BPM

  const data = []
  const points = samplingRate * duration

  for (let i = 0; i < points; i++) {
    const t = i / samplingRate
    const heartRateComponent = Math.sin(2 * Math.PI * (bpm / 60) * t) * 0.8
    const noise = (Math.random() - 0.5) * 0.1
    const qrsComponent = Math.abs(Math.sin(2 * Math.PI * (bpm / 60) * t)) > 0.8 
      ? Math.sin(2 * Math.PI * 5 * (t % 0.2)) * 1.5 
      : 0

    data.push(heartRateComponent + qrsComponent + noise)
  }

  return {
    samplingRate,
    duration,
    data,
    bpm: Math.round(bpm)
  }
}

// Função para extrair dados ECG de uma imagem
export const extractECGFromImage = async (imageFile) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = async (e) => {
      try {
        const img = new Image()
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas')
            canvas.width = img.width
            canvas.height = img.height
            
            const ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0, 0)
            
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
            const data = imageData.data
            const width = canvas.width
            const height = canvas.height
            
            // Analisar cada coluna para encontrar o traçado do ECG
            // Procurar pixels escuros (preto/vermelho/verde) que não são do fundo
            const ecgTrace = []
            
            for (let x = 0; x < width; x++) {
              let bestY = -1
              let bestScore = -Infinity
              
              // Procurar em cada pixel da coluna
              for (let y = 0; y < height; y++) {
                const idx = (y * width + x) * 4
                const r = data[idx]
                const g = data[idx + 1]
                const b = data[idx + 2]
                
                // Calcular "escurecimento" - quanto mais escuro, mais provável ser o traçado
                // Fundo típico: branco ou rosa claro (grid milimetrado)
                // Traçado: preto, vermelho escuro, verde escuro
                const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255
                
                // Penalizar cores de grid (rosa claro: R~220, G~180, B~180)
                const isGrid = (r > 200 && g > 150 && b > 150) ? 0.3 : 0
                const score = (1 - brightness) - isGrid
                
                if (score > bestScore && score > 0.3) {
                  bestScore = score
                  bestY = y
                }
              }
              
              ecgTrace.push(bestY >= 0 ? bestY : height / 2)
            }
            
            // Normalizar para voltagem (-1 a 1)
            const minY = Math.min(...ecgTrace)
            const maxY = Math.max(...ecgTrace)
            const range = maxY - minY || 1
            const normalizedData = ecgTrace.map(y => -2 * ((y - minY) / range - 0.5))
            
            // Resample para taxa de 250Hz
            const targetLength = Math.floor(width / 2)
            const resampledData = []
            for (let i = 0; i < targetLength; i++) {
              const idx = (i / targetLength) * normalizedData.length
              const lower = Math.floor(idx)
              const upper = Math.min(lower + 1, normalizedData.length - 1)
              const frac = idx - lower
              // Interpolação linear
              resampledData.push(normalizedData[lower] * (1 - frac) + normalizedData[upper] * frac)
            }
            
            // Filtro passa-baixa suave para reduzir ruído
            const kernel = 2
            const smoothedData = []
            for (let i = 0; i < resampledData.length; i++) {
              let sum = 0
              let count = 0
              for (let j = -kernel; j <= kernel; j++) {
                const idx = i + j
                if (idx >= 0 && idx < resampledData.length) {
                  sum += resampledData[idx]
                  count++
                }
              }
              smoothedData.push(sum / count)
            }
            
            // Remover linha de base (DC offset)
            const mean = smoothedData.reduce((a, b) => a + b, 0) / smoothedData.length
            const centeredData = smoothedData.map(v => v - mean)
            
            console.log('Dados extraídos da imagem:', {
              totalPoints: centeredData.length,
              width: width,
              height: height,
              minVal: Math.min(...centeredData).toFixed(3),
              maxVal: Math.max(...centeredData).toFixed(3),
              duration: (centeredData.length / 250).toFixed(2) + 's'
            })
            
            resolve({
              data: centeredData,
              samplingRate: 250,
              duration: centeredData.length / 250,
              source: imageFile.name
            })
          } catch (error) {
            reject(new Error(`Erro ao processar pixels da imagem: ${error.message}`))
          }
        }
        
        img.onerror = () => {
          reject(new Error('Erro ao carregar a imagem'))
        }
        
        img.src = e.target.result
      } catch (error) {
        reject(new Error(`Erro ao processar imagem: ${error.message}`))
      }
    }
    
    reader.onerror = () => {
      reject(new Error('Erro ao ler arquivo de imagem'))
    }
    
    reader.readAsDataURL(imageFile)
  })
}

export default api
