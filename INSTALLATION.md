# 🚀 Guia de Instalação - ECG Analyzer React

## Pré-requisitos

- **Node.js**: v16 ou superior
- **npm**: v7 ou superior (incluído com Node.js)
- **Git**: para versionamento
- **Backend**: ECG Analyzer Java + Spring Boot rodando na porta 8080

## Instalação Passo a Passo

### 1️⃣ Clonar o Repositório

```bash
# Via HTTPS
git clone https://github.com/seu-usuario/ecg-analyzer-react.git
cd ecg-analyzer-react

# Via SSH
git clone git@github.com:seu-usuario/ecg-analyzer-react.git
cd ecg-analyzer-react
```

### 2️⃣ Instalar Dependências

```bash
# Usando npm
npm install

# Ou usando yarn (se preferir)
yarn install

# Ou usando pnpm
pnpm install
```

### 3️⃣ Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar o arquivo .env (opcional, se não estiver em localhost:8080)
# VITE_API_URL=http://localhost:8080/api
```

### 4️⃣ Iniciar o Servidor de Desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em: **http://localhost:3000**

## Verificação da Instalação

### ✅ Checklist

- [ ] Node.js instalado: `node --version` ≥ v16
- [ ] npm instalado: `npm --version` ≥ v7
- [ ] Dependências instaladas: `npm install` sem erros
- [ ] Variáveis de ambiente configuradas
- [ ] Backend rodando em `http://localhost:8080`
- [ ] Dev server iniciado: `npm run dev`
- [ ] Frontend acessível em `http://localhost:3000`

### 🧪 Teste Rápido

1. Abra http://localhost:3000 no navegador
2. Verifique se a página carrega sem erros
3. Clique em "Dashboard" para verificar navegação
4. Use "Dados Simulados" para testar funcionalidade

## 🏗️ Build para Produção

### Gerar Build Otimizado

```bash
npm run build
```

Os arquivos compilados estarão em `dist/`

### Analisar Tamanho do Build

```bash
# Instalação opcional
npm install --save-dev rollup-plugin-visualizer

# Após build, arquivo de análise será gerado
```

## 🐛 Troubleshooting

### Erro: "Cannot find module"

```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Erro: "Port 3000 already in use"

```bash
# Usar porta diferente
npm run dev -- --port 3001
```

### Erro: "API connection refused"

```bash
# Verificar se backend está rodando
curl http://localhost:8080/api/ecg/status

# Se não responder, inicie o backend:
cd ../ECG-Analyzer-Backend
mvn spring-boot:run
```

### Erro: CORS

```bash
# Verificar configuração no backend
# O arquivo vite.config.js já está configurado para fazer proxy
# Se ainda tiver problema, verifique a configuração CORS do backend
```

### Gráficos não aparecem

```bash
# Verificar se Chart.js está instalado
npm ls chart.js react-chartjs-2

# Se não, reinstalar
npm install chart.js react-chartjs-2
```

## 📦 Estrutura de Pastas

```
ecg-analyzer-react/
├── src/
│   ├── components/        # Componentes React reutilizáveis
│   ├── pages/            # Páginas da aplicação
│   ├── services/         # Serviços (API, dados)
│   ├── hooks/            # Custom hooks React
│   ├── utils/            # Funções utilitárias
│   ├── constants/        # Constantes da aplicação
│   ├── App.jsx           # Componente raiz
│   ├── main.jsx          # Ponto de entrada
│   └── index.css         # Estilos globais
├── public/               # Arquivos públicos estáticos
├── dist/                 # Build de produção (após npm run build)
├── node_modules/         # Dependências instaladas
├── vite.config.js        # Configuração Vite
├── tailwind.config.js    # Configuração Tailwind
├── postcss.config.js     # Configuração PostCSS
├── .eslintrc.json        # Configuração ESLint
├── .env.example          # Exemplo de variáveis de ambiente
├── .gitignore            # Arquivos ignorados pelo Git
├── package.json          # Dependências e scripts
├── package-lock.json     # Lock file (auto-gerado)
└── README.md             # Documentação principal
```

## 🔄 Workflow de Desenvolvimento

### Para Adicionar um Novo Componente

1. Criar arquivo em `src/components/NomeComponente.jsx`
2. Exportar o componente
3. Importar e usar em `App.jsx` ou em outro componente

### Para Adicionar uma Nova Página

1. Criar arquivo em `src/pages/NomePagina.jsx`
2. Adicionar rota em `App.jsx`
3. Adicionar link em `Navigation.jsx`

### Para Adicionar um Novo Hook

1. Criar arquivo em `src/hooks/useNomeHook.js`
2. Exportar o hook
3. Usar em componentes com `import { useNomeHook } from '../hooks/useNomeHook'`

## 📚 Recursos Úteis

### Documentação Oficial

- [React Docs](https://react.dev)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Chart.js Docs](https://www.chartjs.org/docs/latest/)

### Ferramentas Recomendadas

- **VSCode**: Editor de código
- **React Developer Tools**: Extensão para Chrome
- **Vite Plugin**: Suporte para Vite no VSCode
- **Tailwind CSS IntelliSense**: Autocompletar Tailwind

### Comandos Úteis

```bash
# Formatar código
npm run lint

# Verificar tipagem (se usar TypeScript no futuro)
npm run type-check

# Executar testes (quando implementados)
npm run test

# Gerar build e visualizar
npm run build && npm run preview
```

## 🔐 Segurança

### Boas Práticas

- Nunca commitar arquivo `.env` com valores reais
- Usar `.env.example` como template
- Validar dados do usuário no frontend
- Usar HTTPS em produção
- Manter dependências atualizadas: `npm audit fix`

## 📞 Suporte

Se encontrar problemas:

1. Verificar este guia
2. Consultar [Issues no GitHub](https://github.com/seu-usuario/ecg-analyzer-react/issues)
3. Abrir um novo Issue com detalhes do erro

## ✅ Próximos Passos

Após instalação bem-sucedida:

1. [ ] Explorar o Dashboard
2. [ ] Testar upload de arquivo
3. [ ] Usar dados simulados
4. [ ] Analisar resultados
5. [ ] Customizar componentes conforme necessário

---

**Última atualização**: 2024 | **Versão**: 1.0.0
