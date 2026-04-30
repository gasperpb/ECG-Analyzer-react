# 📋 Backend - Referência Rápida

## 🎯 Objetivo
Backend REST API organizado e profissional para análise de ECGs com suporte a sinais vitais.

## 📁 Estrutura de Pastas Criadas

```
config/        → Configuração centralizada
constants/     → Constantes (API, severidade)
services/      → Lógica de negócio (ECGService)
utils/         → Funções reutilizáveis (logger, helpers)
validators/    → Validação de dados
middleware/    → Middlewares (logger, validação, erro)
```

## 📚 Documentação Criada

| Arquivo | Leia Primeiro | Propósito |
|---------|---------------|-----------|
| `QUICK_START.md` | ⭐⭐⭐ | Iniciar em 5 minutos |
| `BACKEND_STRUCTURE.md` | ⭐⭐ | Documentação completa |
| `MODULE_DEPENDENCIES.md` | ⭐⭐ | Fluxo e dependências |
| `ARCHITECTURE_DIAGRAM.md` | ⭐ | Diagramas visuais |
| `FILE_INDEX.md` | ⭐ | Índice de arquivos |
| `ORGANIZATION_SUMMARY.md` | ⭐ | Antes vs Depois |

## 🚀 Começar

```bash
cd backend
npm install
npm run dev
# http://localhost:8080
```

## ✨ Novidades

### Configuração Centralizada
```javascript
// config/app.js
const config = {
  port: 8080,
  isDevelopment: true,
  limits: { jsonPayload: '50mb' }
}
```

### Logger Colorido
```javascript
import logger from './utils/logger.js'

logger.success('Pronto!')      // ✅
logger.info('Info')            // ℹ️
logger.warn('Aviso')           // ⚠️
logger.error('Erro', err)      // ❌
logger.debug('Debug')          // 🔍
```

### Validadores Separados
```javascript
// validators/ecgValidator.js
import { validateECGData } from '../validators/ecgValidator.js'

const validation = validateECGData(data)
if (!validation.valid) {
  // Use validation.errors
}
```

### Serviços de Negócio
```javascript
// services/ecgService.js
import ECGService from '../services/ecgService.js'

const result = ECGService.analyzeECGData(payload)
```

### Constantes Centralizadas
```javascript
// constants/api.js
import { ENDPOINTS, ERROR_MESSAGES } from './constants/api.js'

// constants/severity.js
import { SEVERITY_LEVELS, RISK_LEVELS } from './constants/severity.js'
```

## 🎯 Padrão de Desenvolvimento

### 1. Criar Validador (se necessário)
```javascript
// validators/myValidator.js
export function validateMyData(body) {
  const errors = []
  if (!body.field) errors.push('Field required')
  return { valid: errors.length === 0, errors }
}
```

### 2. Criar Serviço (se lógica complexa)
```javascript
// services/myService.js
export class MyService {
  static doSomething(data) {
    // Lógica
    return result
  }
}
```

### 3. Criar Controlador
```javascript
// controllers/myController.js
export async function myHandler(req, res) {
  try {
    const validation = validateMyData(req.body)
    if (!validation.valid) {
      return res.status(400).json({ errors: validation.errors })
    }
    
    const result = MyService.doSomething(req.body)
    logger.success('Sucesso')
    res.json({ success: true, data: result })
  } catch (error) {
    logger.error('Erro', error)
    res.status(500).json({ error: error.message })
  }
}
```

### 4. Adicionar Rota
```javascript
// routes/myRouter.js
router.post('/my-endpoint', myHandler)
```

## 📍 Onde Editar

| O quê | Edite |
|------|-------|
| Novo endpoint | `routes/ecg.js` + `controllers/` |
| Lógica complexa | `services/ecgService.js` |
| Cálculos | `models/diagnosticEngine.js` |
| Validação | `validators/ecgValidator.js` |
| Configuração | `config/app.js` |
| Constantes | `constants/*.js` |
| Logging | Use `logger` em qualquer lugar |

## 🔗 Endpoint Principal

```bash
POST /api/ecg/analyze
Content-Type: application/json

{
  "samplingRate": 250,
  "duration": 10,
  "data": [0.1, 0.2, 0.3, ...],
  "vitalSigns": {
    "spO2": 98,
    "glucose": 100,
    "systolic": 120,
    "diastolic": 80
  }
}

# Resposta
{
  "success": true,
  "analysis": { "bpm": 72, "rhythm": "normal" },
  "diagnoses": [...],
  "interpretation": "...",
  "recommendations": [...],
  "overallSeverity": "normal",
  "riskLevel": "low"
}
```

## 🧪 Testar

```bash
# Health check
curl http://localhost:8080/api/health

# Dados simulados
curl http://localhost:8080/api/ecg/simulated

# Análise
curl -X POST http://localhost:8080/api/ecg/analyze \
  -H "Content-Type: application/json" \
  -d '{"samplingRate": 250, "duration": 10, "data": [0.1, 0.2]}'
```

## 💾 Estrutura de Dados

### ECG Data
```javascript
{
  samplingRate: 250,    // Hz
  duration: 10,         // segundos
  data: [0.1, 0.2, ...] // valores numéricos
}
```

### Vital Signs
```javascript
{
  spO2: 98,             // %
  glucose: 100,         // mg/dL
  systolic: 120,        // mmHg
  diastolic: 80,        // mmHg
  temperature: 36.5,    // °C
  respiratoryRate: 16,  // rpm
  hemoglobin: 14,       // g/dL
  bloodType: "O+"       // string
}
```

## 🎓 Aprendendo

1. **Novo dev?** Leia `QUICK_START.md`
2. **Entender estrutura?** Leia `BACKEND_STRUCTURE.md`
3. **Ver fluxo?** Leia `MODULE_DEPENDENCIES.md`
4. **Adicionar feature?** Veja padrão acima

## ✅ Checklist para Novo Endpoint

- [ ] Criar rota em `routes/ecg.js`
- [ ] Criar função em `controllers/ecgController.js`
- [ ] Criar validador se necessário em `validators/`
- [ ] Usar `logger` para debug
- [ ] Testar com curl/Postman
- [ ] Documentar se necessário

## 🚀 Deploy

```bash
# Produção
export NODE_ENV=production
npm install --production
npm start
```

## 📞 Problemas?

1. Servidor não inicia? `npm install` e verifique a porta
2. Erro de validação? Veja `validators/ecgValidator.js`
3. Erro na análise? Veja `services/ecgService.js`
4. Precisa de logging? Use `import logger from '../utils/logger.js'`

## 🎨 Melhores Práticas

✅ **DO**
- Use `logger` em vez de `console.log`
- Valide sempre os dados de entrada
- Use constantes em vez de valores hardcoded
- Divida lógica complexa em serviços
- Mantenha controllers magros

❌ **DON'T**
- Misture lógica de negócio com HTTP
- Use console.log
- Coloque valores hardcoded
- Coloque tudo no controller
- Ignore erros

---

**Pronto para codificar? 🚀**

Próximo passo: Ler `QUICK_START.md`
