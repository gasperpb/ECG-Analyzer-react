# 📋 Índice de Arquivos do Backend

## 🔴 Arquivos de Configuração

| Arquivo | Descrição | Importância |
|---------|-----------|------------|
| `package.json` | Dependências e scripts NPM | 🔴 Crítico |
| `.env.example` | Template de variáveis de ambiente | 🟡 Importante |
| `server.js` | Arquivo principal - inicia a aplicação | 🔴 Crítico |

## 🟠 Configuração (config/)

| Arquivo | Descrição | Exporta |
|---------|-----------|---------|
| `app.js` | Configuração centralizada da aplicação | `config` object |

## 🟡 Constantes (constants/)

| Arquivo | Descrição | Exporta |
|---------|-----------|---------|
| `api.js` | Constantes de API (endpoints, mensagens) | `API_STATUS`, `ENDPOINTS`, `ERROR_MESSAGES` |
| `severity.js` | Níveis de severidade e risco | `SEVERITY_LEVELS`, `SEVERITY_ORDER`, `RISK_LEVELS` |

## 🟢 Middleware (middleware/)

| Arquivo | Descrição | Função |
|---------|-----------|--------|
| `errorHandler.js` | Tratamento global de erros | Middleware de erro final |
| `requestLogger.js` | Logging de requisições com tempo | Middleware de logging |
| `validationErrorHandler.js` | Tratamento de erros de validação JSON | Middleware de validação |

## 🔵 Rotas (routes/)

| Arquivo | Descrição | Endpoints |
|---------|-----------|-----------|
| `ecg.js` | Definição de rotas de ECG | `POST /analyze`, `GET /simulated`, `GET /status` |

## 🟣 Controladores (controllers/)

| Arquivo | Funções | Responsabilidade |
|---------|---------|-----------------|
| `ecgController.js` | `analyzeECGData()`, `getSimulatedData()` | Orquestração, recebe requisições |

## 📦 Serviços (services/)

| Arquivo | Classe | Métodos | Responsabilidade |
|---------|--------|---------|-----------------|
| `ecgService.js` | `ECGService` | `analyzeECGData()`, `generateSimulatedData()` | Lógica de negócio |

## 🧮 Modelos (models/)

| Arquivo | Funções | Responsabilidade |
|---------|---------|-----------------|
| `diagnosticEngine.js` | `analyzeECG()`, `analyzeVitalSigns()`, etc | Engine de diagnósticos |

## ✅ Validadores (validators/)

| Arquivo | Funções | Valida |
|---------|---------|--------|
| `ecgValidator.js` | `validateECGData()`, `validateVitalSigns()` | Dados de entrada |

## 🛠️ Utilitários (utils/)

| Arquivo | Funções/Exports | Uso |
|---------|-----------------|-----|
| `logger.js` | `logger` object | Logging colorido |
| `response.js` | `successResponse()`, `errorResponse()` | Formatação de respostas |
| `diagnosticHelpers.js` | `generateInterpretation()`, `generateRecommendations()` | Geração de diagnósticos |

## 📚 Documentação

| Arquivo | Conteúdo |
|---------|----------|
| `README.md` | Visão geral básica |
| `BACKEND_STRUCTURE.md` | Documentação completa da estrutura |
| `MODULE_DEPENDENCIES.md` | Fluxo e dependências entre módulos |
| `FILE_INDEX.md` | Este arquivo |

---

## 🔀 Fluxo de Dados - Requisição de Análise ECG

```
1. Client envia: POST /api/ecg/analyze
              ↓
2. server.js recebe e passa através dos middlewares
              ↓
3. routes/ecg.js identifica e roteia para controller
              ↓
4. controllers/ecgController.js:analyzeECGData()
   ├─ validators/ecgValidator.js valida dados
   └─ services/ecgService.js:analyzeECGData()
      ├─ models/diagnosticEngine.js análise
      ├─ utils/diagnosticHelpers.js interpretação
      └─ utils/diagnosticHelpers.js recomendações
              ↓
5. Resposta formatada é retornada
              ↓
6. middleware/requestLogger.js registra requisição
              ↓
7. Response enviada ao client
```

## 📊 Estatísticas

- **Total de Arquivos**: 18
- **Linhas de Código**: ~1200+
- **Diretórios**: 9
- **Endpoints**: 3
- **Validadores**: 2
- **Middleware**: 3

## ✨ Benefícios da Organização

✅ **Escalabilidade** - Fácil adicionar novos endpoints
✅ **Manutenibilidade** - Código bem organizado e documentado
✅ **Testabilidade** - Camadas separadas facilitam testes
✅ **Reusabilidade** - Utilitários e serviços reutilizáveis
✅ **Profissionalismo** - Segue padrões de industria (MVC+S)
✅ **Debug** - Logging centralizado e detalhado
✅ **Configuração** - Tudo centralizado em um lugar
