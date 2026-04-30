# 🔗 Dependências e Fluxo de Módulos

## Mapa de Dependências

```
server.js (Ponto de entrada)
├── config/app.js
├── utils/logger.js
├── constants/
│   ├── api.js
│   └── severity.js
├── middleware/
│   ├── errorHandler.js
│   ├── validationErrorHandler.js
│   └── requestLogger.js
└── routes/ecg.js
    └── controllers/ecgController.js
        ├── services/ecgService.js
        │   ├── models/diagnosticEngine.js
        │   ├── constants/severity.js
        │   ├── utils/diagnosticHelpers.js
        │   └── utils/logger.js
        ├── validators/ecgValidator.js
        └── utils/logger.js
```

## Fluxo de Análise de ECG

```
POST /api/ecg/analyze
        ↓
    Router (routes/ecg.js)
        ↓
    analyzeECGData (controllers/ecgController.js)
        ↓
    Validação (validators/ecgValidator.js)
        ├─ validateECGData()
        └─ validateVitalSigns()
        ↓
    ECGService.analyzeECGData (services/ecgService.js)
        ├── analyzeECG (models/diagnosticEngine.js)
        ├── analyzeVitalSigns (models/diagnosticEngine.js)
        ├── analyzeCombinedConditions (models/diagnosticEngine.js)
        ├── generateInterpretation (utils/diagnosticHelpers.js)
        └── generateRecommendations (utils/diagnosticHelpers.js)
        ↓
    Resposta JSON
```

## Exemplo de Novo Endpoint

Para adicionar um novo endpoint:

1. **Rota** (`routes/ecg.js`)
   ```javascript
   router.post('/new-endpoint', newEndpointController)
   ```

2. **Controlador** (`controllers/ecgController.js`)
   ```javascript
   export async function newEndpointController(req, res) {
     try {
       const result = SomeService.doSomething(req.body)
       res.json(result)
     } catch (error) {
       logger.error('Erro', error)
       res.status(500).json({...})
     }
   }
   ```

3. **Validador** (opcional, `validators/newValidator.js`)
   ```javascript
   export function validateNewData(body) {
     // Validação...
   }
   ```

4. **Serviço** (opcional, `services/newService.js`)
   ```javascript
   export class NewService {
     static doSomething(data) {
       // Lógica...
     }
   }
   ```

## Responsabilidades de Cada Camada

| Camada | Responsabilidade | Exemplo |
|--------|-----------------|---------|
| **server.js** | Configuração da app, middleware global | CORS, limites, logger |
| **routes/** | Definição de endpoints | `POST /api/ecg/analyze` |
| **controllers/** | Orquestração, validação | Chamar validador e serviço |
| **validators/** | Validação de dados | Verificar tipos e ranges |
| **services/** | Lógica de negócio | Análise de ECG |
| **models/** | Lógica de domínio complexa | Engine de diagnósticos |
| **utils/** | Funções reutilizáveis | Logger, formatadores |
| **constants/** | Valores constantes | Enums, mensagens |
| **config/** | Configuração centralizada | Porta, ambiente |

## Comunicação Entre Módulos

### ✅ Correto (Camadas descendentes)
```
controller → service → model
controller → validator
service → utils
service → constants
```

### ❌ Evitar (Referências ascendentes)
```
model → controller  ❌
utils → service     ❌
```

## Variáveis de Ambiente

```
PORT=8080
NODE_ENV=development
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

## Scripts NPM

```bash
npm run dev      # Desenvolvimento com reload
npm start        # Produção
npm test         # Testes (não configurado)
```
