# ECG Analyzer React.js - Guia Completo

## 📋 Documentação do Projeto

Este documento fornece uma visão geral completa do projeto ECG Analyzer em React.

### 📁 Arquivos de Documentação

1. **README.md** - Documentação principal do projeto
2. **INSTALLATION.md** - Guia passo a passo de instalação
3. **DEVELOPMENT.md** - Guia detalhado de desenvolvimento
4. **PROJECT_STRUCTURE.md** - Este arquivo (visão geral)

---

## 🚀 Quick Start (5 minutos)

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor
npm run dev

# 3. Abrir navegador
# http://localhost:3000
```

---

## 📦 Dependências Principais

| Pacote | Versão | Uso |
|--------|--------|-----|
| react | 18.2.0 | Framework UI |
| vite | 4.3.0 | Build tool |
| tailwindcss | 3.3.0 | Styling |
| chart.js | 4.4.0 | Gráficos |
| axios | 1.6.0 | HTTP client |
| lucide-react | 0.263.0 | Ícones |

---

## 🏗️ Estrutura de Pastas

```
ecg-analyzer-react/
├── 📄 Documentação
│   ├── README.md                    # Visão geral
│   ├── INSTALLATION.md              # Instalação
│   ├── DEVELOPMENT.md               # Desenvolvimento
│   └── PROJECT_STRUCTURE.md         # Este arquivo
│
├── ⚙️ Configuração
│   ├── package.json                 # Dependências e scripts
│   ├── vite.config.js              # Configuração Vite
│   ├── tailwind.config.js          # Configuração Tailwind
│   ├── postcss.config.js           # Configuração PostCSS
│   ├── .eslintrc.json              # Linting
│   ├── .gitignore                  # Arquivos ignorados
│   ├── .env.example                # Exemplo de variáveis
│   └── index.html                  # Entrada HTML
│
├── 📂 src/
│   ├── 🎨 components/              # Componentes reutilizáveis
│   │   ├── Header.jsx              # Cabeçalho
│   │   ├── Navigation.jsx          # Menu de navegação
│   │   ├── ECGChart.jsx            # Gráfico de ECG
│   │   ├── DiagnosticsCard.jsx     # Card de diagnóstico
│   │   ├── StatsCard.jsx           # Card de estatística
│   │   ├── FileUpload.jsx          # Upload de arquivo
│   │   └── Loading.jsx             # Indicador de carregamento
│   │
│   ├── 📄 pages/                   # Páginas da aplicação
│   │   ├── Dashboard.jsx           # Página inicial
│   │   ├── Analyzer.jsx            # Análise de ECG
│   │   └── Results.jsx             # Resultados
│   │
│   ├── 🔌 services/                # Serviços
│   │   └── api.js                  # Integração com API backend
│   │
│   ├── 🎣 hooks/                   # Custom React hooks
│   │   └── useApi.js               # Hook para chamadas API
│   │
│   ├── 🛠️ utils/                   # Funções utilitárias
│   │   └── helpers.js              # Helpers diversos
│   │
│   ├── ⚙️ constants/               # Constantes
│   │   └── index.js                # Categorias, referências, etc
│   │
│   ├── App.jsx                     # Componente raiz
│   ├── main.jsx                    # Ponto de entrada React
│   └── index.css                   # Estilos globais
│
├── 📦 node_modules/                # Dependências (após npm install)
├── 📦 dist/                        # Build otimizado (após npm run build)
└── 🔒 .git/                        # Versionamento Git
```

---

## 🔄 Fluxo de Navegação

```
┌─────────────────┐
│    Dashboard    │  ← Página inicial com visão geral
└────────┬────────┘
         │
    ┌────v─────┐
    │           │
┌───v───┐   ┌──v──────┐
│Upload │   │Simulated│  ← Analyzer com opções de entrada
└───┬───┘   └──┬──────┘
    │          │
    └────┬─────┘
         │ (análise)
    ┌────v─────┐
    │ Results  │  ← Exibe resultados e diagnósticos
    └──────────┘
```

---

## 📊 Componentes e Suas Responsabilidades

### **Header.jsx**
- Logo e título da aplicação
- Ícone de status do sistema
- Link para voltar ao dashboard

### **Navigation.jsx**
- Menu principal com 3 seções
- Indicador de página ativa
- Navegação entre páginas

### **ECGChart.jsx**
- Gráfico interativo usando Chart.js
- Filtro de pontos para performance
- Hover info com valores

### **DiagnosticsCard.jsx**
- Exibe diagnóstico com severidade
- Cores diferenciadas por severidade
- Recomendações clínicas

### **StatsCard.jsx**
- Card com métrica principal
- Ícone customizável
- Cores temáticas

### **FileUpload.jsx**
- Drag & drop para upload
- Validação de arquivo
- Suporte para CSV e JSON

### **Loading.jsx**
- Spinner animado
- Mensagem customizável
- Versão fullscreen ou inline

---

## 📄 Páginas

### **Dashboard**
**Função:** Apresentação do sistema
**Componentes:**
- Stats overview (diagnósticos, precisão, etc)
- Features principais (4 cards)
- Categorias de diagnósticos
- Ações rápidas (upload, dados simulados)
- Info box com limitações

### **Analyzer**
**Função:** Entrada de dados e pré-visualização
**Componentes:**
- Upload file (com validação)
- Dados simulados (com geração)
- Preview do gráfico ECG
- Botões de ação (Analisar, Limpar)

### **Results**
**Função:** Exibição de resultados completos
**Componentes:**
- Métricas principais (BPM, Ritmo, QT, PR)
- Gráfico do ECG analisado
- Lista de diagnósticos
- Interpretação clínica
- Recomendações
- Detalhes técnicos

---

## 🔌 Integração com API

### **Endpoints Utilizados**

```
POST /api/ecg/analyze
├── Entrada: { samplingRate, duration, data[] }
└── Saída: { bpm, rhythm, diagnoses[], interpretation, recommendations[] }

POST /api/ecg/upload
├── Entrada: File (multipart)
└── Saída: { ecgData }

GET /api/ecg/status
├── Entrada: (nenhuma)
└── Saída: { status, message }
```

### **Arquivo: src/services/api.js**
- Configuração Axios com base URL
- Métodos para cada endpoint
- Tratamento de erros
- Geração de dados simulados (fallback)

---

## 🎨 Estrutura de Estilo

### **Tailwind CSS**
- Sistema de cores customizado (medical-*)
- Breakpoints: mobile, tablet, desktop
- Componentes reutilizáveis

### **Cores Principais**
```css
medical-50:  #f0f9ff    (muito claro)
medical-100: #e0f2fe
medical-600: #0284c7    (principal)
medical-700: #0369a1
medical-900: #082f49    (muito escuro)
```

---

## 🛠️ Scripts Disponíveis

```bash
npm run dev           # Iniciar dev server (porta 3000)
npm run build         # Build otimizado para produção
npm run preview       # Visualizar build produção (porta 4173)
npm run lint          # Executar ESLint
```

---

## 📱 Responsividade

### **Breakpoints**
- **Mobile:** < 640px (coluna única)
- **Tablet:** 640px - 1024px (2 colunas)
- **Desktop:** > 1024px (até 4 colunas)

### **Exemplo de Grid Responsivo**
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* Itens */}
</div>
```

---

## 🔐 Segurança

### **Boas Práticas Implementadas**
- ✅ Validação de entrada (arquivo)
- ✅ Verificação de tipo MIME
- ✅ Limite de tamanho de arquivo
- ✅ Tratamento de erros seguro
- ✅ Sem armazenamento local sensível

### **Recomendações**
- Usar HTTPS em produção
- Configurar CORS corretamente no backend
- Validar dados também no servidor
- Manter dependências atualizadas

---

## 🚀 Deployment

### **Vercel**
```bash
npm install -g vercel
vercel
```

### **Netlify**
1. Conectar repositório GitHub
2. Build: `npm run build`
3. Publish: `dist/`

### **Docker**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

---

## 🐛 Troubleshooting Comum

| Problema | Solução |
|----------|---------|
| Port 3000 em uso | `npm run dev -- --port 3001` |
| API não conecta | Verificar backend em 8080 |
| Gráfico vazio | Validar dados do ECG |
| CSS não aplica | Reiniciar dev server |
| Erro CORS | Configurar CORS no backend |

---

## 📚 Recursos Externos

- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Chart.js](https://www.chartjs.org)
- [Lucide Icons](https://lucide.dev)

---

## 📝 Notas de Desenvolvimento

### **Extensões Recomendadas para VS Code**
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Vite
- ESLint
- Prettier

### **Próximos Passos Sugeridos**
1. ✅ Instalação inicial
2. ✅ Teste com dados simulados
3. ✅ Teste com arquivo CSV/JSON
4. ✅ Integração com backend
5. ✅ Customização de cores
6. ⬜ Adicionar testes unitários
7. ⬜ Implementar autenticação
8. ⬜ Adicionar persistência de dados

---

## 📞 Suporte

Para problemas ou dúvidas:
1. Consulte a documentação relevante (README.md, INSTALLATION.md, DEVELOPMENT.md)
2. Verifique o console do navegador para erros
3. Abra uma issue no GitHub com detalhes

---

**Versão:** 1.0.0  
**Última atualização:** 2024  
**Autor:** Gasper PB  
**Licença:** MIT
