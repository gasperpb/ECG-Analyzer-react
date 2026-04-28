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
            
            // Extrair pixels e converter para escala de cinza
            const grayValues = []
            for (let i = 0; i < data.length; i += 4) {
              const r = data[i]
              const g = data[i + 1]
              const b = data[i + 2]
              // Luminância
              const gray = (0.299 * r + 0.587 * g + 0.114 * b) / 255
              grayValues.push(gray)
            }
            
            // Normalizar e processar
            const height = canvas.height
            const width = canvas.width
            const ecgData = []
            
            // Extrair linha vertical do meio da imagem (onde geralmente está o traço do ECG)
            const centerY = Math.floor(height / 2)
            for (let x = 0; x < width; x++) {
              const idx = (centerY * width + x) * 4
              const pixel = grayValues[idx / 4]
              // Inverter: onde é escuro (preto do gráfico), valor é alto
              ecgData.push((1 - pixel) * 2 - 1)
            }
            
            // Resample para 250 pontos por segundo
            const targetLength = Math.floor(width / 4)
            const resampledData = []
            for (let i = 0; i < targetLength; i++) {
              const idx = Math.floor((i / targetLength) * ecgData.length)
              resampledData.push(ecgData[idx])
            }
            
            // Aplicar filtro suave para reduzir ruído
            const smoothedData = []
            for (let i = 0; i < resampledData.length; i++) {
              const window = 3
              let sum = 0
              for (let j = -window; j <= window; j++) {
                const idx = i + j
                if (idx >= 0 && idx < resampledData.length) {
                  sum += resampledData[idx]
                }
              }
              smoothedData.push(sum / (2 * window + 1))
            }
            
            resolve({
              data: smoothedData,
              samplingRate: 250,
              duration: smoothedData.length / 250,
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
