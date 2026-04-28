# 📊 ECG Analyzer - React Frontend

Uma interface web moderna e responsiva para análise de eletrocardiogramas (ECG) construída com **React.js 18**, **Vite**, **Tailwind CSS** e **Chart.js**.

👨‍💻 **Criador:** [Achillesdev](https://github.com/Achillesdev)

## ✨ Características

- ✅ **Interface Responsiva** - Design moderno com Tailwind CSS
- ✅ **Gráficos Interativos** - Visualização de ECG com Chart.js
- ✅ **Upload de Arquivos** - Suporte para CSV, JSON e ECG
- ✅ **Análise de Imagens** - Processa imagens de ECG (PNG, JPG, BMP)
- ✅ **Dados Simulados** - Geração de exemplos de ECG para testes
- ✅ **Análise em Tempo Real** - Integração com API Backend
- ✅ **Sinais Vitais Avançados** - Coleta opcional de SpO2, Glicose, PA, Temperatura, FR, Hemoglobina
- ✅ **38+ Diagnósticos** - Detecção integrada de doenças cardíacas e sistêmicas
- ✅ **Correlações Multissistêmicas** - Análise de relações entre múltiplas métricas
- ✅ **Relatórios Completos** - Exibição de diagnósticos, risco e recomendações

---

## 👨‍💻 Sobre o Criador

**Achillesdev** - Desenvolvedor Full Stack especializado em análise de saúde e sistemas médicos inteligentes.

- 🏆 Criador do ECG Analyzer
- 💡 Inovação em análise cardíaca com IA
- 🔗 [LinkedIn](#) | [GitHub](#) | [Portfolio](#)

---

## 🚀 Quick Start

### Pré-requisitos

- Node.js 16+ 
- npm ou yarn

### Instalação

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor de desenvolvimento
npm run dev

# 3. Acessar em http://localhost:3000
```

### Build para Produção

```bash
# Gerar build otimizado
npm run build

# Visualizar build
npm run preview
```

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── Header.jsx       # Cabeçalho da aplicação
│   ├── Navigation.jsx   # Menu de navegação
│   ├── ECGChart.jsx     # Gráfico de ECG
│   ├── DiagnosticsCard.jsx  # Card de diagnóstico
│   ├── StatsCard.jsx    # Card de estatísticas
│   ├── FileUpload.jsx   # Upload de arquivos
│   └── Loading.jsx      # Indicador de carregamento
├── pages/               # Páginas da aplicação
│   ├── Dashboard.jsx    # Página inicial
│   ├── Analyzer.jsx     # Página de análise
│   └── Results.jsx      # Página de resultados
├── services/
│   └── api.js          # Serviço de API e dados simulados
├── App.jsx             # Componente raiz
├── main.jsx            # Ponto de entrada
└── index.css           # Estilos globais
```

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_API_URL=http://localhost:8080/api
```

### Proxy para API Backend

O arquivo `vite.config.js` já está configurado para fazer proxy das requisições `/api` para `http://localhost:8080`.

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Versão | Propósito |
|-----------|--------|----------|
| React | 18.2.0 | Framework UI |
| Vite | 4.3.0 | Build tool e dev server |
| Tailwind CSS | 3.3.0 | Styling |
| Chart.js | 4.4.0 | Gráficos |
| react-chartjs-2 | 5.2.0 | Wrapper React para Chart.js |
| Axios | 1.6.0 | HTTP client |
| lucide-react | 0.263.0 | Ícones |

## 📊 Capacidades de Diagnóstico

### Diagnósticos por ECG Puro: 10
- Bradicardia, Taquicardia, Fibrilação Atrial, Flutter Atrial, Bloqueio AV, QRS Alargado, PR Prolongado, QT Prolongado, Extrassístoles, Ritmo Sinusal Normal

### Diagnósticos por Sinais Vitais: 28

**Oximetria (SpO2):**
- Hipoxemia, DPOC, Pneumonia, Asma Aguda, Tromboembolismo Pulmonar (TEP)

**Glicose:**
- Hipoglicemia, Hiperglicemia, Diabetes Tipo 1, Diabetes Tipo 2, Cetoacidose Diabética

**Pressão Arterial:**
- Crise Hipertensiva, Hipertensão Estágio 2, Pré-eclâmpsia, Hipotensão, Choque

**Temperatura:**
- Febre Alta, Infecção Viral, Infecção Bacteriana, Hipotermia, Possível Sepse

**Hemoglobina:**
- Anemia Ferropriva, Deficiência B12, Anemia por Sangramento, Policitemia

**Frequência Respiratória:**
- Bradipneia, Taquipneia, Insuficiência Respiratória, Embolia Pulmonar

### Síndromes Multissistêmicas: 5+
- Miocardiopatia Hipertensiva (PA↑ + ECG↑)
- Alteração Metabólica com Arritmia (Glicose± + Arritmia)
- Insuficiência Respiratória com Compensação (SpO2↓ + Taquicardia)
- Taquicardia Compensatória por Anemia (Hgb↓ + Taquicardia)
- Possível Sepse (Temp↑ + PA↓ + Taquicardia)

**Total: 38+ Doenças e Síndromes Detectáveis**

## 📊 Componentes Principais

### Dashboard
- Visão geral do sistema
- Links para funcionalidades principais
- Informações sobre categorias de diagnósticos
- Ações rápidas

### Analyzer
- Upload de arquivos ECG (CSV/JSON)
- Geração de dados simulados
- Visualização do gráfico antes da análise
- Botão para iniciar análise

### Results
- Exibição de métricas principais (BPM, Ritmo, QT, PR)
- Gráfico do ECG analisado
- Visualização dos sinais vitais capturados
- Nível de risco geral (Crítico, Atenção, Normal)
- Lista de diagnósticos identificados e priorizados
- Interpretação clínica integrada
- Recomendações contextualizadas
- Opções para download e compartilhamento

## 🔌 API Integration

A aplicação faz requisições para os seguintes endpoints:

```
POST /api/ecg/analyze      # Análise de ECG
POST /api/ecg/upload       # Upload de arquivo
GET  /api/ecg/status       # Status da análise
GET  /api/ecg/simulated    # Dados simulados (opcional)
```

## 📋 Formatos Suportados

### Dados - CSV
```
timestamp(ms),voltagem(mV)
0,0.02
4,0.05
8,0.08
```

### Dados - JSON
```json
{
  "samplingRate": 250,
  "duration": 10.5,
  "data": [0.02, 0.05, 0.08, ...]
}
```

### Imagens
- **PNG** - Recomendado, melhor qualidade
- **JPG/JPEG** - Comprimido, compatível
- **BMP** - Sem compressão

> 📸 **Análise de Imagens**: O sistema extrai dados do traçado de ECG em imagens usando processamento Canvas e normalização de pixels. Para melhores resultados, use imagens com alto contraste (fundo branco, traço preto).

## 🎨 Personalizações de Estilo

### Cores Médicas
As cores principais estão definidas em `tailwind.config.js`:

```javascript
colors: {
  medical: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    900: '#082f49',
  }
}
```

## 📝 Desenvolvimento

### Scripts Disponíveis

```bash
npm run dev      # Iniciar servidor de desenvolvimento
npm run build    # Build para produção
npm run preview  # Visualizar build de produção
npm run lint     # Executar ESLint
```

### Estrutura de um Componente

```jsx
import React, { useState } from 'react'
import { Icon } from 'lucide-react'

export default function MyComponent({ prop1, prop2 }) {
  const [state, setState] = useState()

  return (
    <div className="space-y-4">
      {/* Conteúdo do componente */}
    </div>
  )
}
```

## 🔄 Fluxo de Dados

```
Dashboard
  ↓ (clica em "Iniciar Análise")
Analyzer
  ├── Upload arquivo OU Gerar dados simulados
  ├── Visualizar gráfico ECG
  ├── Clica em "Analisar"
  ↓
API Backend (/api/ecg/analyze)
  ↓ (retorna diagnósticos)
Results
  └── Exibe gráficos, métricas e diagnósticos
```

## 🤝 Integração com Backend

Para conectar com o backend Java + Spring Boot:

1. Inicie o backend na porta 8080
2. O Vite automaticamente fará proxy das requisições `/api` para `http://localhost:8080`
3. Os dados serão processados e retornados com os diagnósticos

## �️ Análise de Imagens

O sistema agora suporta análise de imagens de ECG! 

**Formatos suportados:**
- PNG (recomendado)
- JPG/JPEG
- BMP

**Como funciona:**
1. Faça upload de uma imagem de ECG
2. O sistema extrai o traçado da imagem usando processamento Canvas
3. Converte pixels em dados numéricos
4. Aplica filtro suave para reduzir ruído
5. Visualiza e analisa como dados normais

Para mais detalhes, consulte [IMAGE_ANALYSIS.md](IMAGE_ANALYSIS.md)

## �📱 Responsividade

A aplicação é totalmente responsiva com breakpoints:

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## 🐛 Troubleshooting

### A API não está respondendo
- Verifique se o backend está rodando na porta 8080
- Confirme que `VITE_API_URL` está correto
- Verifique o console do navegador para CORS errors

### Arquivo não carrega
- Verifique o formato do arquivo (CSV, JSON, PNG, JPG ou BMP)
- Certifique-se que o arquivo não ultrapassa 10MB
- Valide o conteúdo do arquivo

### Imagem não processa
- Use imagens com bom contraste (branco e preto)
- Certifique-se que a imagem está em orientação correta
- Tente com uma resolução mais alta
- Verifique o console para mensagens de erro

### Gráfico não aparece
- Verifique se os dados têm pontos suficientes
- Confirme que os valores são numéricos válidos

## 📚 Recursos Adicionais

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Chart.js Documentation](https://www.chartjs.org)
- [Lucide Icons](https://lucide.dev)

## 📝 Licença

MIT - Veja LICENSE.md

## 👨‍� Desenvolvedor

**Achillesdev** - [GitHub](https://github.com/Achillesdev) | [Portfolio](#)

Desenvolvedor Full Stack especializado em sistemas de análise de saúde e diagnóstico inteligente com IA.

---

### 🌟 Contribuições e Créditos

- 🏥 Conceito e Arquitetura: Achillesdev
- 💻 Frontend React/Vite: Achillesdev  
- 🎨 Design UI/UX: Achillesdev
- 🧠 Motor de Diagnóstico: Achillesdev
- 📊 Integração de Sinais Vitais: Achillesdev
- 📥 Download e Compartilhamento: Achillesdev

## 🙏 Agradecimentos

- React community
- Vite team
- Chart.js contributors
- Tailwind CSS team
- Lucide Icons team

---

**Desenvolvido com ❤️ por Achillesdev - 2026**
