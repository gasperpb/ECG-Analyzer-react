# 🏥 ECG Analyzer Backend

Backend Node.js/Express para análise de eletrocardiogramas com suporte a sinais vitais.

## 🚀 Quick Start

### 1. Instalação

```bash
cd backend
npm install
```

### 2. Desenvolvimento

```bash
# Modo desenvolvimento (com auto-reload)
npm run dev

# Ou modo produção
npm start
```

O servidor estará disponível em: `http://localhost:8080`

## 📡 API Endpoints

### Análise de ECG
```
POST /api/ecg/analyze
```

**Request:**
```json
{
  "samplingRate": 250,
  "duration": 10,
  "data": [0.1, 0.15, 0.2, ...],
  "vitalSigns": {
    "spO2": 98,
    "glucose": 95,
    "systolic": 120,
    "diastolic": 80,
    "temperature": 37,
    "respiratoryRate": 16,
    "hemoglobin": 14,
    "bloodType": "O+"
  }
}
```

**Response:**
```json
{
  "success": true,
  "timestamp": "2026-04-28T13:00:00.000Z",
  "analysis": {
    "bpm": 72,
    "rhythm": "Sinusal Normal",
    "qt": 400,
    "pr": 160,
    "qrs": 90
  },
  "vitalSigns": {...},
  "diagnoses": [...],
  "interpretation": "...",
  "recommendations": [...],
  "overallSeverity": "normal",
  "riskLevel": "low"
}
```

### Dados Simulados
```
GET /api/ecg/simulated
```

Retorna dados de ECG simulados para testes.

### Status da API
```
GET /api/ecg/status
```

Verifica status operacional da API.

### Health Check
```
GET /api/health
```

Verificação geral de saúde do servidor.

## 📊 Funcionalidades

### Análise de ECG
- ✅ Cálculo de BPM
- ✅ Identificação de ritmo
- ✅ Análise de intervalos (PR, QT, QRS)
- ✅ Detecção de anomalias

### Análise de Sinais Vitais
- ✅ SpO2 (Oximetria)
- ✅ Glicose
- ✅ Pressão Arterial (Sistólica/Diastólica)
- ✅ Temperatura
- ✅ Frequência Respiratória
- ✅ Hemoglobina
- ✅ Tipo Sanguíneo

### Diagnósticos
- ✅ 10+ diagnósticos de ECG
- ✅ 28+ diagnósticos de sinais vitais
- ✅ 5+ síndromes multissistêmicas
- ✅ Total: 38+ doenças detectáveis

## 🛠️ Tecnologias

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **CORS** - Cross-origin resource sharing
- **Multer** - Upload de arquivos (futuro)

## 📁 Estrutura do Projeto

```
backend/
├── server.js                    # Servidor Express
├── package.json                 # Dependências
├── routes/
│   └── ecg.js                  # Rotas de ECG
├── controllers/
│   └── ecgController.js        # Lógica das rotas
├── models/
│   └── diagnosticEngine.js     # Motor de diagnóstico
├── middleware/
│   └── errorHandler.js         # Tratamento de erros
└── README.md                   # Este arquivo
```

## 🔌 Integração com Frontend React

A URL do backend já está configurada no `vite.config.js` do frontend:

```javascript
// vite.config.js
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true
    }
  }
}
```

## 📊 Diagnósticos Disponíveis

### ECG (10 diagnósticos)
- Bradicardia
- Taquicardia
- Ritmo Sinusal Normal
- PR Prolongado
- QRS Alargado
- QT Prolongado
- Bloqueio AV
- Fibrilação Atrial
- Flutter Atrial
- Extrassístoles

### Sinais Vitais (28 diagnósticos)

**SpO2 (5):**
- Hipoxemia, DPOC, Pneumonia, Asma, TEP

**Glicose (6):**
- Hipoglicemia, Hiperglicemia, Diabetes T1, Diabetes T2, Cetoacidose, Coma Hipoglicêmico

**Pressão (7):**
- Crise Hipertensiva, Hipertensão, Pré-eclâmpsia, Hipotensão, Choque, etc.

**Temperatura (5):**
- Febre Alta, Infecção Viral, Infecção Bacteriana, Hipotermia, Sepse

**Hemoglobina (5):**
- Anemia Grave, Anemia, Policitemia, Deficiência B12, etc.

**FR (4):**
- Bradipneia, Taquipneia, Insuficiência Respiratória, Embolia Pulmonar

### Síndromes (5+)
- Miocardiopatia Hipertensiva
- Alteração Metabólica com Arritmia
- Insuficiência Respiratória com Compensação
- Taquicardia Compensatória por Anemia
- Possível Sepse

## 🔒 CORS

CORS está habilitado para aceitar requisições de qualquer origem:

```javascript
app.use(cors())
```

Para restringir em produção, modificar:

```javascript
app.use(cors({
  origin: 'http://localhost:3000', // URL do frontend
  methods: ['GET', 'POST'],
  credentials: true
}))
```

## 📝 Variáveis de Ambiente

Por enquanto não há variáveis obrigatórias. Opcionais:

```env
PORT=8080          # Porta padrão
NODE_ENV=development
```

## 🧪 Testando a API

### Com cURL

```bash
# Análise de ECG
curl -X POST http://localhost:8080/api/ecg/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "samplingRate": 250,
    "duration": 10,
    "data": [0.1, 0.15, 0.2, ...],
    "vitalSigns": {"spO2": 98}
  }'

# Dados simulados
curl http://localhost:8080/api/ecg/simulated

# Status
curl http://localhost:8080/api/ecg/status
```

### Com Postman

1. Criar requisição POST para `http://localhost:8080/api/ecg/analyze`
2. Body → Raw → JSON
3. Preencher com dados de teste
4. Send

## 🚀 Deploy

### Vercel
```bash
vercel deploy
```

### Heroku
```bash
heroku create seu-app
git push heroku main
```

### Docker
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8080
CMD ["npm", "start"]
```

## 📚 Documentação

- [x] API RESTful
- [x] Motor de Diagnóstico
- [x] Análise de Sinais Vitais
- [ ] Autenticação (planejado)
- [ ] Histórico de análises (planejado)
- [ ] Banco de dados (planejado)

## 👨‍💻 Autor

**Achillesdev** - Desenvolvedor Full Stack

## 📄 Licença

MIT

---

**Status:** ✅ Funcional e Pronto para Uso
**Última Atualização:** 28/04/2026
