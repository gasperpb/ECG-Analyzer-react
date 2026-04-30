# 🏗️ Backend Architecture Diagram

## Estrutura de Camadas

```
┌─────────────────────────────────────────────────┐
│            CLIENT (Browser/App)                 │
└──────────────┬──────────────────────────────────┘
               │ HTTP Request
               ↓
┌─────────────────────────────────────────────────┐
│         server.js (Express App)                 │
│  ├─ CORS Middleware                             │
│  ├─ JSON Parser                                 │
│  ├─ Request Logger (utils/logger.js)            │
│  └─ Validation Error Handler                    │
└──────────────┬──────────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────────┐
│       routes/ecg.js (Router)                    │
│  └─ Identifica endpoint                         │
└──────────────┬──────────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────────┐
│   controllers/ecgController.js (Orquestrador)   │
│  ├─ Recebe requisição                           │
│  ├─ Chama validador                             │
│  ├─ Chama serviço                               │
│  └─ Formata resposta                            │
└──────────────┬──────────────────────────────────┘
       ↓       │       ↓
       │       │       │
   ✓ Val │   ✗ Erro   │ 400
       │       │       │
       ↓       ↓       ↓
   ┌───────┐  ┌──────────┐
   │Validar│  │Erro Resp │
   └───┬───┘  └──────────┘
       │ ✓ OK
       ↓
┌─────────────────────────────────────────────────┐
│   validators/ecgValidator.js (Validação)        │
│  └─ Verifica dados de entrada                   │
└──────────────┬──────────────────────────────────┘
               │ ✓ Valid
               ↓
┌─────────────────────────────────────────────────┐
│  services/ecgService.js (Lógica de Negócio)     │
│  ├─ Orquestra análise                           │
│  ├─ Processa dados                              │
│  ├─ Combina diagnósticos                        │
│  ├─ Ordena por severidade                       │
│  └─ Prepara resposta                            │
└──────────────┬──────────────────────────────────┘
       │       │              │
       ↓       ↓              ↓
  ┌────────┐  ┌───────────┐  ┌──────────────┐
  │models/ │  │utils/     │  │constants/    │
  │diagnostic│ │diagnostic │  │severity.js   │
  │Engine.js│ │Helpers.js │  └──────────────┘
  └────────┘  └───────────┘
       │           │
       └─────┬─────┘
             ↓
    ┌─────────────────────┐
    │ Resultado Final     │
    │ - análise           │
    │ - diagnósticos      │
    │ - recomendações     │
    └──────────┬──────────┘
               │
               ↓
┌─────────────────────────────────────────────────┐
│  controllers/ecgController.js (Formato Response)│
│  └─ Usa utils/response.js                       │
└──────────────┬──────────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────────┐
│      middleware/errorHandler.js (Se erro)       │
│  └─ Formata resposta de erro                    │
└──────────────┬──────────────────────────────────┘
               │ HTTP Response (JSON)
               ↓
┌─────────────────────────────────────────────────┐
│            CLIENT (Recebe resposta)             │
└─────────────────────────────────────────────────┘
```

## Fluxo de Dados - POST /api/ecg/analyze

```
┌────────────────────────────────────────────┐
│ 1. Requisição HTTP (POST body)             │
│ {                                          │
│   "samplingRate": 250,                     │
│   "duration": 10,                          │
│   "data": [0.1, 0.2, ...],                │
│   "vitalSigns": {...}                      │
│ }                                          │
└────────┬─────────────────────────────────┘
         │
         ↓ router.post('/analyze', controller)
┌────────────────────────────────────────────┐
│ 2. Controller: analyzeECGData()            │
│   - Recebe req.body                        │
└────────┬─────────────────────────────────┘
         │
         ↓ validateECGData()
┌────────────────────────────────────────────┐
│ 3. Validator                               │
│   ✓ Verifica tipos                         │
│   ✓ Verifica ranges                        │
│   ✓ Verifica campos obrigatórios           │
└────────┬─────────────────────────────────┘
         │ valid: true
         ↓ ECGService.analyzeECGData()
┌────────────────────────────────────────────┐
│ 4. Service: Orquestra análise              │
│   ├─ analyzeECG() [models]                 │
│   ├─ analyzeVitalSigns() [models]          │
│   ├─ analyzeCombinedConditions() [models]  │
│   ├─ Remove duplicatas                     │
│   ├─ Ordena por severidade                 │
│   └─ Calcula risco geral                   │
└────────┬─────────────────────────────────┘
         │
         ↓ generateInterpretation() [utils]
┌────────────────────────────────────────────┐
│ 5. Helpers: Gera interpretação             │
│   + generateRecommendations() [utils]      │
└────────┬─────────────────────────────────┘
         │
         ↓ Resultado completo
┌────────────────────────────────────────────┐
│ 6. Response JSON                           │
│ {                                          │
│   "success": true,                         │
│   "analysis": {...},                       │
│   "diagnoses": [...],                      │
│   "interpretation": "...",                 │
│   "recommendations": [...],                │
│   "overallSeverity": "normal",             │
│   "riskLevel": "low",                      │
│   "timestamp": "2024-01-01T12:00:00"      │
│ }                                          │
└────────┬─────────────────────────────────┘
         │ res.json(result)
         ↓
┌────────────────────────────────────────────┐
│ 7. Client recebe resposta                  │
└────────────────────────────────────────────┘
```

## Dependências entre Módulos

```
                    server.js
                  /    |    \
                 /     |     \
            config/  constants/  middleware/
               |        |           |
             app.js   api.js    errorHandler
                      severity.js  requestLogger
                                validationError
                                   |
                                   ↓
                              routes/ecg.js
                                   |
                                   ↓
                         controllers/ecgController.js
                          /        |         \
                         /         |          \
                        /          |           \
                   validators/  services/   utils/
                       |         ecgService  logger
                   ecgValidator   |          response
                                  |
                           ├─ models/diagnosticEngine
                           ├─ utils/diagnosticHelpers
                           └─ constants/severity
```

## Padrão MVC + Services

```
┌─────────────────────────────────────────┐
│ MODEL - Lógica de Domínio               │
│ └─ models/diagnosticEngine.js           │
│    └─ Análise médica pura                │
└─────────────────────────────────────────┘
         ↑
         │ Usa
         │
┌─────────────────────────────────────────┐
│ SERVICE - Orquestração                  │
│ └─ services/ecgService.js               │
│    └─ Combina múltiplos models          │
│    └─ Aplica regras de negócio          │
│    └─ Formata resultado                 │
└─────────────────────────────────────────┘
         ↑
         │ Usa
         │
┌─────────────────────────────────────────┐
│ CONTROLLER - Handler HTTP               │
│ └─ controllers/ecgController.js          │
│    └─ Valida entrada                    │
│    └─ Chama service                     │
│    └─ Formata resposta HTTP             │
└─────────────────────────────────────────┘
         ↑
         │ Usa
         │
┌─────────────────────────────────────────┐
│ VIEW - Resposta HTTP                    │
│ └─ JSON Response                        │
│    └─ Formatado por utils/response.js   │
└─────────────────────────────────────────┘
```

## Ciclo de Vida de um Request

```
1️⃣  CLIENT ENVIANDO
    └─ fetch() ou axios → POST /api/ecg/analyze

2️⃣  SERVIDOR RECEBENDO
    └─ server.js → Middleware (CORS, JSON, Logger)

3️⃣  ROTEAMENTO
    └─ routes/ecg.js → Encontra handler

4️⃣  CONTROLADOR
    └─ ecgController.analyzeECGData()
       ├─ Extrai req.body
       └─ Validação

5️⃣  VALIDAÇÃO
    └─ validators/ecgValidator.js
       ├─ validateECGData() ✓ OK
       └─ validateVitalSigns() ✓ OK

6️⃣  SERVIÇO
    └─ ECGService.analyzeECGData()
       ├─ Chama models/
       ├─ Processa dados
       ├─ Combina resultados
       └─ Aplica regras

7️⃣  HELPERS
    └─ utils/diagnosticHelpers.js
       ├─ generateInterpretation()
       └─ generateRecommendations()

8️⃣  RESPOSTA
    └─ res.json(result)

9️⃣  LOG
    └─ middleware/requestLogger.js registra

🔟 CLIENT RECEBENDO
    └─ Resposta JSON formatada
```

## Separação de Responsabilidades

| Camada | Faz | Não Faz |
|--------|-----|---------|
| **Controller** | Validar, Rotear, Formatar | Lógica complexa, Acesso ao BD |
| **Service** | Orquestrar, Combinar dados | Validar HTTP, Retornar JSON |
| **Model** | Análise pura, Cálculos | HTTP, Validação, Negócio |
| **Validator** | Verificar tipos e ranges | Validação de negócio |
| **Middleware** | Logging, CORS, Erros | Lógica de negócio |
| **Utils** | Funções reutilizáveis | Lógica de domínio |

---

## Benefícios dessa Arquitetura

✅ **Testabilidade** - Cada camada pode ser testada isoladamente
✅ **Manutenibilidade** - Código bem separado
✅ **Escalabilidade** - Fácil adicionar features
✅ **Reusabilidade** - Services e Utils reutilizáveis
✅ **Profissionalismo** - Padrão de indústria
✅ **Documentação** - Estrutura clara

