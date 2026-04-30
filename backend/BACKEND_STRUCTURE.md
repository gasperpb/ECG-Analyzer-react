# 🏥 ECG Analyzer Backend - Estrutura Organizada

Backend REST API para análise de eletrocardiogramas com suporte a sinais vitais.

## 📁 Estrutura de Diretórios

```
backend/
├── config/                    # Configurações da aplicação
│   └── app.js                # Configuração centralizada
├── constants/                 # Constantes da aplicação
│   ├── api.js                # Constantes de API
│   └── severity.js           # Níveis de severidade e risco
├── controllers/               # Controladores (lógica de requisição)
│   └── ecgController.js      # Controlador de ECG
├── middleware/                # Middlewares Express
│   ├── errorHandler.js       # Tratamento global de erros
│   ├── requestLogger.js      # Logging de requisições
│   └── validationErrorHandler.js  # Validação de erros
├── models/                    # Modelos e lógica de negócio
│   └── diagnosticEngine.js   # Motor de diagnósticos
├── routes/                    # Definição de rotas
│   └── ecg.js                # Rotas de ECG
├── services/                  # Serviços (lógica complexa)
│   └── ecgService.js         # Serviço de análise ECG
├── utils/                     # Funções utilitárias
│   ├── logger.js             # Sistema de logging
│   ├── response.js           # Formatadores de resposta
│   └── diagnosticHelpers.js  # Funções auxiliares de diagnóstico
├── validators/                # Validadores de dados
│   └── ecgValidator.js       # Validador de dados ECG
├── package.json              # Dependências
├── server.js                 # Arquivo principal
└── README.md                 # Este arquivo
```

## 🚀 Tecnologias

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **CORS** - Compartilhamento de recursos entre domínios
- **Multer** - Upload de arquivos
- **UUID** - Geração de IDs únicos
- **Nodemon** - Reload automático em desenvolvimento

## 📦 Dependências

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "multer": "^1.4.5-lts.1",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

## 🔧 Instalação e Execução

### Instalação
```bash
cd backend
npm install
```

### Desenvolvimento
```bash
npm run dev
```
Servidor será executado em `http://localhost:8080` com reload automático.

### Produção
```bash
npm start
```

## 📚 Endpoints da API

### Health Check
```
GET /api/health
```
Verifica se o servidor está funcionando.

### Análise de ECG
```
POST /api/ecg/analyze
Content-Type: application/json

{
  "samplingRate": 250,
  "duration": 10,
  "data": [0.1, 0.15, 0.2, ...],
  "vitalSigns": {
    "spO2": 98,
    "glucose": 100,
    "systolic": 120,
    "diastolic": 80,
    "temperature": 36.5,
    "respiratoryRate": 16,
    "hemoglobin": 14,
    "bloodType": "O+"
  }
}
```

**Resposta:**
```json
{
  "success": true,
  "timestamp": "2024-01-01T12:00:00.000Z",
  "analysis": {
    "bpm": 72,
    "rhythm": "normal",
    "qt": 400,
    "pr": 160,
    "qrs": 80
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
GET /api/ecg/simulated?samplingRate=250&duration=10
```
Retorna dados ECG simulados para testes.

### Status da API
```
GET /api/ecg/status
```
Retorna status operacional da API.

## 🏗️ Arquitetura

### Fluxo de Requisição

```
Requisição HTTP
    ↓
Middleware (CORS, JSON Parser)
    ↓
Request Logger
    ↓
Router (Identifica endpoint)
    ↓
Validator (Valida dados)
    ↓
Controller (Orquestra lógica)
    ↓
Service (Executa lógica de negócio)
    ↓
Model (Acessa dados/engine)
    ↓
Resposta Formatada
    ↓
Error Handler (se houver erro)
    ↓
Resposta HTTP
```

### Padrão de Organização

- **Controllers** - Tratam requisições HTTP, validação e orquestração
- **Services** - Encapsulam lógica de negócio complexa
- **Models** - Lidam com dados e engine de diagnósticos
- **Validators** - Validam dados de entrada
- **Utils** - Funções reutilizáveis
- **Constants** - Valores constantes da aplicação
- **Config** - Configuração centralizada

## 🔒 Validação

O sistema valida automaticamente:

- Formato de dados ECG
- Tipos de dados (array de números)
- Valores de sinais vitais
- Requisições malformadas

## 📝 Logging

Sistema de logging colorido e com timestamp:

```javascript
import logger from './utils/logger.js'

logger.info('Mensagem informativa')
logger.success('Operação bem-sucedida')
logger.warn('Aviso importante')
logger.error('Erro encontrado', error)
logger.debug('Informação de debug')
```

## 🎯 Próximas Melhorias

- [ ] Autenticação JWT
- [ ] Rate limiting
- [ ] Cache de resultados
- [ ] Testes unitários
- [ ] Testes de integração
- [ ] Documentação OpenAPI/Swagger
- [ ] Persistência de dados (Database)
- [ ] Tratamento de uploads de arquivo

## 📄 Licença

MIT

## 👤 Autor

**Achillesdev**

---

Para mais informações sobre o projeto, veja [../README.md](../README.md)
