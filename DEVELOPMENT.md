# 💻 Guia de Desenvolvimento - ECG Analyzer React

## Arquitetura da Aplicação

```
┌─────────────────────────────────────────┐
│           React Application              │
│  (http://localhost:3000)                │
├─────────────────────────────────────────┤
│ Pages                                   │
│  ├── Dashboard    (Visão geral)         │
│  ├── Analyzer     (Upload/Análise)      │
│  └── Results      (Resultados)          │
├─────────────────────────────────────────┤
│ Components                              │
│  ├── Header, Navigation, ECGChart       │
│  ├── DiagnosticsCard, StatsCard         │
│  ├── FileUpload, Loading                │
│  └── Custom Components                  │
├─────────────────────────────────────────┤
│ Services                                │
│  └── API Service (Axios)                │
├─────────────────────────────────────────┤
│ Utils & Hooks                           │
│  ├── Helper functions                   │
│  └── Custom React hooks                 │
├─────────────────────────────────────────┤
│ Vite (Build Tool)                       │
├─────────────────────────────────────────┤
      ↓↑
   Backend API
(http://localhost:8080)
```

## Estrutura de Diretórios

```
src/
├── components/
│   ├── Header.jsx              # Cabeçalho com logo e título
│   ├── Navigation.jsx          # Menu de navegação
│   ├── ECGChart.jsx            # Gráfico de ECG com Chart.js
│   ├── DiagnosticsCard.jsx     # Card para exibir diagnósticos
│   ├── StatsCard.jsx           # Card para estatísticas
│   ├── FileUpload.jsx          # Upload com drag & drop
│   └── Loading.jsx             # Indicador de carregamento
│
├── pages/
│   ├── Dashboard.jsx           # Página inicial
│   ├── Analyzer.jsx            # Página de análise
│   └── Results.jsx             # Página de resultados
│
├── services/
│   └── api.js                  # Configuração Axios + métodos API
│
├── hooks/
│   └── useApi.js               # Hooks customizados
│
├── utils/
│   └── helpers.js              # Funções auxiliares
│
├── constants/
│   └── index.js                # Constantes e configurações
│
├── App.jsx                     # Componente raiz
├── main.jsx                    # Ponto de entrada
└── index.css                   # Estilos globais
```

## Fluxo de Dados

### 1. Usuário faz upload de arquivo

```
FileUpload.jsx
    ↓ (onFileSelect)
Analyzer.jsx
    ↓ (handleFileSelect)
Parse CSV/JSON
    ↓ (setState ecgData)
Visualiza no ECGChart
```

### 2. Usuário inicia análise

```
Analyzer.jsx (handleAnalyze)
    ↓ (chamada API)
api.js (ecgService.analyzeECG)
    ↓ (POST /api/ecg/analyze)
Backend
    ↓ (resposta)
Results.jsx
    ↓ (exibe diagnósticos)
App.jsx (onAnalysisComplete)
```

## Padrões de Desenvolvimento

### Padrão de Componente

```jsx
import React, { useState } from 'react'
import { Icon } from 'lucide-react'

export default function MyComponent({ prop1, prop2 = 'default' }) {
  const [state, setState] = useState(null)

  const handleAction = () => {
    // Lógica aqui
    setState(newValue)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">{prop1}</h2>
      <button 
        onClick={handleAction}
        className="bg-medical-600 hover:bg-medical-700 text-white py-2 px-4 rounded"
      >
        Ação
      </button>
    </div>
  )
}
```

### Padrão de Integração com API

```jsx
const handleAnalysis = async () => {
  try {
    setLoading(true)
    const results = await ecgService.analyzeECG(ecgData)
    setResults(results)
  } catch (error) {
    setError(error.message)
  } finally {
    setLoading(false)
  }
}
```

### Padrão de Estilo Tailwind

```jsx
<div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all">
  {/* Conteúdo */}
</div>
```

## Guia de Componentes

### DiagnosticsCard
Exibe um diagnóstico com severidade visual

```jsx
<DiagnosticsCard
  diagnosis={{
    name: 'Fibrilação Atrial',
    description: 'Irregularidade no ritmo cardíaco',
    details: { 'BPM': '120', 'Tipo': 'Paroxística' },
    recommendation: 'Consultar cardiologista'
  }}
  severity="warning"
/>
```

**Props:**
- `diagnosis`: Objeto com dados do diagnóstico
- `severity`: 'normal' | 'info' | 'warning' | 'critical'

### ECGChart
Gráfico interativo do ECG

```jsx
<ECGChart 
  data={ecgData.data} 
  title="ECG Analisado" 
/>
```

**Props:**
- `data`: Array de números com voltagens
- `title`: Título do gráfico

### StatsCard
Card com estatística

```jsx
<StatsCard
  icon={Heart}
  title="Frequência Cardíaca"
  value={72}
  unit="BPM"
  color="red"
/>
```

**Props:**
- `icon`: Ícone do lucide-react
- `title`: Título
- `value`: Valor a exibir
- `unit`: Unidade (opcional)
- `color`: 'blue' | 'red' | 'green' | 'purple' | 'yellow' | 'medical'

## Integração com Backend

### Endpoints Esperados

```
POST /api/ecg/analyze
Body: {
  samplingRate: 250,
  duration: 10,
  data: [0.02, 0.05, ...]
}

Response: {
  bpm: 72,
  rhythm: "Sinusal",
  diagnoses: [...],
  interpretation: "...",
  recommendations: [...]
}
```

### Adicionar Novo Endpoint

Em `src/services/api.js`:

```javascript
export const ecgService = {
  // ... métodos existentes ...
  
  getNewData: async (id) => {
    try {
      const response = await api.get(`/ecg/new-data/${id}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro')
    }
  }
}
```

## Validação de Dados

### Validação de ECG no Upload

```javascript
const validateECGData = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Dados inválidos')
  }
  
  if (!data.every(v => typeof v === 'number')) {
    throw new Error('Todos os valores devem ser números')
  }
  
  return true
}
```

## Tratamento de Erros

### Padrão Global de Erro

```jsx
try {
  // operação
} catch (error) {
  setError(error.message)
  
  // Exibir mensagem
  {error && (
    <div className="bg-red-50 border border-red-300 rounded p-4">
      <p className="text-red-700">⚠️ {error}</p>
    </div>
  )}
}
```

## Performance

### Otimizações Implementadas

1. **Sampling Rate**: Limita pontos do gráfico para melhor performance
2. **Lazy Loading**: Componentes carregam sob demanda
3. **Memoization**: Usar `React.memo` para componentes puros

### Monitorar Performance

```bash
# Chrome DevTools > Performance > Record
# Usar para medir renderizações e bottlenecks
```

## Debugging

### Chrome DevTools

1. **React DevTools**: Instalar extensão
2. **Network Tab**: Monitorar requisições API
3. **Console**: Logs e erros
4. **Performance**: Profiling

### Logs Estruturados

```javascript
console.log('ECG Data:', {
  samplingRate,
  duration,
  dataPoints: data.length,
  timestamp: new Date()
})
```

## Testes (Futuro)

Estrutura recomendada:

```
src/
├── components/
│   └── Header.test.jsx
├── services/
│   └── api.test.js
└── utils/
    └── helpers.test.js
```

## Build & Deployment

### Build Local

```bash
npm run build
# Arquivos em dist/
```

### Preview Build

```bash
npm run preview
# http://localhost:4173
```

### Deploy em Vercel

```bash
npm install -g vercel
vercel
```

### Deploy em Netlify

1. Fazer push para GitHub
2. Conectar repositório em Netlify
3. Build command: `npm run build`
4. Publish directory: `dist`

## Variáveis de Ambiente

### Arquivo .env

```env
VITE_API_URL=http://localhost:8080/api
VITE_APP_NAME=ECG Analyzer
```

### Acessar em Componentes

```javascript
const apiUrl = import.meta.env.VITE_API_URL
```

## Atualizações de Dependências

```bash
# Verificar atualizações disponíveis
npm outdated

# Atualizar pacotes
npm update

# Atualizar pacote específico
npm install chart.js@latest

# Verificar vulnerabilidades
npm audit
npm audit fix
```

## Commits e Versionamento

### Mensagens de Commit

```
feat: adiciona novo componente
fix: corrige bug em gráfico
docs: atualiza README
style: formata código
refactor: reorganiza estrutura
test: adiciona testes
chore: atualiza dependências
```

## Contribuições

1. Criar branch: `git checkout -b feature/nova-feature`
2. Fazer commits: `git commit -m 'feat: descrição'`
3. Push: `git push origin feature/nova-feature`
4. Abrir Pull Request

## Recursos Adicionais

- [React Patterns](https://react-patterns.com/)
- [Tailwind CSS Tips](https://tailwindcss.com/docs/installation)
- [Chart.js Plugins](https://www.chartjs.org/docs/latest/developers/plugins.html)
- [JavaScript Best Practices](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide)

---

**Última atualização**: 2024 | Versão: 1.0.0
