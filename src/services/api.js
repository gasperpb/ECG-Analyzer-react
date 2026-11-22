import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

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

// Serviço do banco MIT-BIH Arrhythmia Database (delegado ao backend Node)
export const mitDbService = {
  // Lista os registros disponíveis no banco MIT-BIH
  getRecords: async () => {
    const response = await api.get('/ecg/mitdb/records')
    return response.data
  },

  // Retorna o sinal bruto de um registro do banco MIT-BIH
  getRecord: async (recordName) => {
    const response = await api.get(`/ecg/mitdb/record/${recordName}`)
    return response.data
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

// Função para extrair ECG de 12 derivações de uma imagem de printout
export const extract12LeadECGFromImage = async (imageFile) => {
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
            const pixels = imageData.data
            const w = canvas.width
            const h = canvas.height

            // 1. Detectar linhas de grade (horizontais e verticais)
            // Percorrer cada linha horizontal e contar pixels escuros
            const horizontalLineScores = []
            for (let y = 0; y < h; y++) {
              let darkCount = 0
              const step = Math.max(1, Math.floor(w / 100))
              for (let x = 0; x < w; x += step) {
                const idx = (y * w + x) * 4
                const r = pixels[idx], g = pixels[idx + 1], b = pixels[idx + 2]
                const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255
                if (brightness < 0.7) darkCount++
              }
              horizontalLineScores.push(darkCount)
            }

            const verticalLineScores = []
            for (let x = 0; x < w; x++) {
              let darkCount = 0
              const step = Math.max(1, Math.floor(h / 100))
              for (let y = 0; y < h; y += step) {
                const idx = (y * w + x) * 4
                const r = pixels[idx], g = pixels[idx + 1], b = pixels[idx + 2]
                const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255
                if (brightness < 0.7) darkCount++
              }
              verticalLineScores.push(darkCount)
            }

            // Encontrar picos nas pontuações (linhas de grade)
            const findLines = (scores, minSpacing) => {
              const lines = []
              const threshold = Math.max(...scores) * 0.5
              const halfWindow = Math.max(1, Math.floor(minSpacing * 0.15))
              for (let i = halfWindow; i < scores.length - halfWindow; i++) {
                let isPeak = true
                for (let j = -halfWindow; j <= halfWindow; j++) {
                  if (j !== 0 && scores[i + j] >= scores[i]) {
                    isPeak = false
                    break
                  }
                }
                if (isPeak && scores[i] > threshold) {
                  lines.push(i)
                }
              }
              return lines
            }

            const spacing = Math.min(w, h) / 10
            let hLines = findLines(horizontalLineScores, spacing)
            let vLines = findLines(verticalLineScores, spacing)

            // Agrupar linhas próximas (pegar a mediana de cada grupo)
            const clusterLines = (lines, maxGap) => {
              if (lines.length === 0) return []
              const sorted = [...lines].sort((a, b) => a - b)
              const clusters = [[sorted[0]]]
              for (let i = 1; i < sorted.length; i++) {
                if (sorted[i] - sorted[i - 1] < maxGap) {
                  clusters[clusters.length - 1].push(sorted[i])
                } else {
                  clusters.push([sorted[i]])
                }
              }
              return clusters.map(c => c[Math.floor(c.length / 2)])
            }

            const gap = Math.min(w, h) / 30
            hLines = clusterLines(hLines, gap)
            vLines = clusterLines(vLines, gap)

            // 2. Determinar layout do grid
            // Encontrar as 5 linhas horizontais (bordas superior/inferior + 3 divisórias)
            // e 5 linhas verticais (bordas esquerda/direita + 3 divisórias) para 4x3
            if (hLines.length < 3 || vLines.length < 3) {
              // Fallback: dividir imagem em grid uniforme
              const cellH = h / 3
              const cellW = w / 4
              const hBoundaries = [0, cellH, cellH * 2, h]
              const vBoundaries = [0, cellW, cellW * 2, cellW * 3, w]
              extractCells(hBoundaries, vBoundaries)
            } else {
              // Selecionar as linhas mais relevantes
              const selectOuterLines = (lines, count) => {
                if (lines.length <= count) return lines
                const first = lines[0]
                const last = lines[lines.length - 1]
                const step = (last - first) / (count - 1)
                const result = [first]
                for (let i = 1; i < count - 1; i++) {
                  const target = first + step * i
                  let closest = lines[0]
                  let minDist = Infinity
                  for (const l of lines) {
                    const d = Math.abs(l - target)
                    if (d < minDist) { minDist = d; closest = l }
                  }
                  result.push(closest)
                }
                result.push(last)
                return result
              }

              const hBounds = selectOuterLines(hLines, 4)
              const vBounds = selectOuterLines(vLines, 5)
              extractCells(hBounds, vBounds)
            }

            function extractCells(hBoundaries, vBoundaries) {
              const leads = {}
              const names = ['I', 'II', 'III', 'aVR', 'aVL', 'aVF', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6']
              let idx = 0

              for (let row = 0; row < hBoundaries.length - 1; row++) {
                for (let col = 0; col < vBoundaries.length - 1; col++) {
                  if (idx >= names.length) break
                  const x1 = Math.round(vBoundaries[col])
                  const x2 = Math.round(vBoundaries[col + 1])
                  const y1 = Math.round(hBoundaries[row])
                  const y2 = Math.round(hBoundaries[row + 1])
                  const cellW = x2 - x1
                  const cellH = y2 - y1

                  if (cellW < 10 || cellH < 10) { idx++; continue }

                  // Extrair traçado desta célula
                  const trace = []
                  for (let x = x1; x < x2; x++) {
                    let bestY = -1
                    let bestScore = -Infinity
                    for (let y = y1; y < y2; y++) {
                      const pIdx = (y * w + x) * 4
                      const r = pixels[pIdx], g = pixels[pIdx + 1], b = pixels[pIdx + 2]
                      const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255
                      const isGrid = (r > 200 && g > 150 && b > 150) ? 0.3 : 0
                      const score = (1 - brightness) - isGrid
                      if (score > bestScore && score > 0.3) {
                        bestScore = score
                        bestY = y
                      }
                    }
                    trace.push(bestY >= 0 ? bestY : (y1 + y2) / 2)
                  }

                  // Normalizar
                  const minY = Math.min(...trace)
                  const maxY = Math.max(...trace)
                  const range = maxY - minY || 1
                  const normalized = trace.map(y => -2 * ((y - minY) / range - 0.5))

                  // Resample
                  const targetLen = Math.floor(cellW / 2)
                  const resampled = []
                  for (let i = 0; i < targetLen; i++) {
                    const srcIdx = (i / targetLen) * normalized.length
                    const lower = Math.floor(srcIdx)
                    const upper = Math.min(lower + 1, normalized.length - 1)
                    const frac = srcIdx - lower
                    resampled.push(normalized[lower] * (1 - frac) + normalized[upper] * frac)
                  }

                  // Suavizar
                  const kernel = 2
                  const smoothed = []
                  for (let i = 0; i < resampled.length; i++) {
                    let sum = 0, count = 0
                    for (let j = -kernel; j <= kernel; j++) {
                      const p = i + j
                      if (p >= 0 && p < resampled.length) { sum += resampled[p]; count++ }
                    }
                    smoothed.push(sum / count)
                  }

                  // Remover DC offset
                  const mean = smoothed.reduce((a, b) => a + b, 0) / smoothed.length
                  leads[names[idx]] = smoothed.map(v => v - mean)
                  idx++
                }
              }

              console.log('12 derivações extraídas:', Object.keys(leads).length,
                'de', names.length, '| leads:', Object.keys(leads).join(','))

              resolve({
                leads,
                samplingRate: 250,
                duration: leads[Object.keys(leads)[0]]?.length / 250 || 10,
                source: imageFile.name
              })
            }
          } catch (error) {
            reject(new Error(`Erro ao processar pixels: ${error.message}`))
          }
        }
        img.onerror = () => reject(new Error('Erro ao carregar a imagem'))
        img.src = e.target.result
      } catch (error) {
        reject(new Error(`Erro ao processar imagem: ${error.message}`))
      }
    }
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'))
    reader.readAsDataURL(imageFile)
  })
}

export default api
