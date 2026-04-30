# 🚀 Quick Start Guide - Backend Developer

## ⚡ Começando em 5 Minutos

### 1. Instalar
```bash
cd backend
npm install
```

### 2. Executar
```bash
npm run dev
```
Servidor inicia em `http://localhost:8080`

### 3. Testar
```bash
curl http://localhost:8080/api/health
```

## 📚 Arquivos Principais Para Ler

**Primeiro:**
1. `README.md` - Overview
2. `BACKEND_STRUCTURE.md` - Estrutura completa

**Depois:**
3. `MODULE_DEPENDENCIES.md` - Fluxo de dados
4. `FILE_INDEX.md` - Índice detalhado

## 🔧 Tarefas Comuns

### Adicionar Novo Endpoint

**1. Criar a função no controlador** (`controllers/`)
```javascript
export function myEndpoint(req, res) {
  try {
    // Seu código aqui
    res.json({ success: true })
  } catch (error) {
    logger.error('Erro', error)
    res.status(500).json({ error: error.message })
  }
}
```

**2. Adicionar rota** (`routes/ecg.js`)
```javascript
router.post('/my-endpoint', myEndpoint)
```

**3. Adicionar validação** (opcional, `validators/`)
```javascript
export function validateMyData(body) {
  const errors = []
  if (!body.required) errors.push('Field required')
  return { valid: errors.length === 0, errors }
}
```

**4. Usar em controlador**
```javascript
const validation = validateMyData(req.body)
if (!validation.valid) {
  return res.status(400).json({ errors: validation.errors })
}
```

### Usar Logger
```javascript
import logger from './utils/logger.js'

logger.info('Mensagem')       // ℹ️  azul
logger.success('Ok')          // ✅ verde
logger.warn('Atenção')        // ⚠️  amarelo
logger.error('Erro', err)     // ❌ vermelho
logger.debug('Debug info')    // 🔍 cinza
```

### Usar Constantes
```javascript
import { SEVERITY_LEVELS } from './constants/severity.js'
import { ERROR_MESSAGES } from './constants/api.js'

if (diagnosis.severity === SEVERITY_LEVELS.CRITICAL) {
  // ...
}
```

### Usar Config
```javascript
import config from './config/app.js'

const port = config.port
const isDev = config.isDevelopment
```

### Acessar Variáveis de Ambiente
```bash
# .env
PORT=8080
NODE_ENV=development

# No código
import config from './config/app.js'
console.log(config.port) // 8080
console.log(config.nodeEnv) // development
```

## 🧪 Testando Endpoints

### Health Check
```bash
curl http://localhost:8080/api/health
```

### Dados Simulados
```bash
curl http://localhost:8080/api/ecg/simulated
```

### Análise de ECG (POST)
```bash
curl -X POST http://localhost:8080/api/ecg/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "samplingRate": 250,
    "duration": 10,
    "data": [0.1, 0.2, 0.3],
    "vitalSigns": {
      "spO2": 98,
      "glucose": 100
    }
  }'
```

## 📂 Estrutura Visual

```
Backend
├── 🔵 Entra: Requisição HTTP
│
├── 1️⃣  server.js
│   └─ Middleware global
│
├── 2️⃣  routes/ecg.js
│   └─ Roteia para controlador
│
├── 3️⃣  controllers/ecgController.js
│   ├─ Valida com validators/
│   └─ Chama service/
│
├── 4️⃣  services/ecgService.js
│   ├─ Usa models/
│   └─ Usa utils/
│
├── 5️⃣  utils/
│   └─ Logger, helpers, respostas
│
├── 6️⃣  constants/ + config/
│   └─ Valores centralizados
│
└── 🟢 Sai: Resposta JSON
```

## 🐛 Debug

**Ver logs detalhados:**
```javascript
logger.debug('Informação de debug')
```

**Ver stack trace de erros:**
```javascript
logger.error('Mensagem', error) // Mostra stack em development
```

**Usar debugger do Node:**
```bash
node --inspect server.js
# Abrir chrome://inspect no Chrome
```

## 📝 Padrões de Código

### ✅ Bom
```javascript
// Controllers chamam validators e services
// Services encapsulam lógica
// Utils são funções puras reutilizáveis
// Constants centralizadas
import logger from '../utils/logger.js'
import { ECGService } from '../services/ecgService.js'
import { validateData } from '../validators/validator.js'
```

### ❌ Ruim
```javascript
// Lógica complexa misturada no controller
// Constantes espalhadas pelo código
// Logs com console.log
// Sem validação
```

## 🚢 Deploy

### Preparar para Produção
```bash
# Instalar apenas dependências de produção
npm install --production

# Definir NODE_ENV
export NODE_ENV=production

# Iniciar
npm start
```

### Variáveis de Ambiente (Production)
```bash
PORT=8080
NODE_ENV=production
CORS_ORIGINS=https://seu-dominio.com
```

## 💡 Dicas

- Sempre use `logger` em vez de `console.log`
- Valide sempre os dados de entrada
- Use constantes em vez de valores hardcoded
- Divida lógica complexa em serviços
- Mantenha controllers magros
- Reuse utilitários existentes

## 📞 Suporte

- Perguntas sobre estrutura? Veja `BACKEND_STRUCTURE.md`
- Precisa saber qual arquivo editar? Veja `FILE_INDEX.md`
- Quer entender o fluxo? Veja `MODULE_DEPENDENCIES.md`

---

**Boa codificação! 🎉**
