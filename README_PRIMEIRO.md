# 🚀 COMECE AQUI - ECG Analyzer React

## ⚡ Quick Start (2 minutos)

### 1️⃣ Terminal 1 - Inicie o React App
```bash
cd c:\Users\Achilles\OneDrive\Documents\Projetos\react\ecg
npm run dev
```
Aguarde: `✓ Local: http://localhost:3000`

### 2️⃣ Terminal 2 - Inicie o Backend (Java)
```bash
cd path/to/ECG-Analyzer  # seu projeto Java
mvn spring-boot:run
```
Aguarde: `Application started in ... seconds`

### 3️⃣ Abra no Navegador
- Frontend: http://localhost:3000 ✓
- Backend: http://localhost:8080 ✓

---

## 🧪 Teste Rápido (Sem Backend)

Se não tiver backend rodando ainda:

1. Acesse: http://localhost:3000
2. Clique em: **📊 Dados Simulados**
3. Clique em: **🔍 Analisar ECG**
4. ✅ Verá resultados com aviso "Modo Fallback"
5. 🔧 Ver console: Pressione `F12`

---

## ❌ Se Tiver Erro "Erro ao Analisar ECG"

### Passo 1: Verifique o Console
```
Pressione F12 → Aba "Console"
Procure por mensagens em vermelho ou azul
```

### Passo 2: Teste o Backend
**No terminal do backend:**
```bash
# Verifique se Backend está rodando em http://localhost:8080
# Acesse no navegador: http://localhost:8080

# Se não funcionar, recomece:
mvn spring-boot:run
```

### Passo 3: Consulte Guias
1. **Rápido (1min):** Ver este arquivo abaixo ↓
2. **Completo (5min):** Leia [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
3. **Detalhado (10min):** Leia [FIX_ANALYSIS_ERROR.md](FIX_ANALYSIS_ERROR.md)

---

## 🔧 Debug Helper (Canto Inferior Direito)

Clique no ícone amarelo no canto inferior direito da tela:
- 🔍 Botão para testar backend
- 📋 Instruções passo a passo
- 🔗 Links para recursos

---

## 📝 Checklist de Funcionamento

- [ ] Frontend no terminal: `npm run dev`
- [ ] Backend no terminal: `mvn spring-boot:run`
- [ ] Frontend carrega: http://localhost:3000
- [ ] Backend responde: http://localhost:8080
- [ ] Console sem erros: Pressione `F12`
- [ ] Pode fazer análise: clique "Analisar ECG"

---

## 🎯 Fluxo Completo

```
1. Escolha entrada:
   ├─ 📄 Upload CSV/JSON
   ├─ 🖼️ Upload Imagem (PNG/JPG)
   └─ 🎲 Dados Simulados

2. Clique "Analisar ECG"
   ├─ ✅ Sucesso → Ver resultados
   └─ ⚠️ Erro → Ver console + TROUBLESHOOTING.md

3. Resultados mostram:
   ├─ Gráfico ECG
   ├─ Frequência cardíaca (BPM)
   ├─ Ritmo
   ├─ Diagnóstico
   └─ Recomendações
```

---

## 💡 Dicas Importantes

1. **Sempre teste com "Dados Simulados" primeiro**
   - Funciona mesmo sem backend
   - Entende o fluxo
   - Depois testa com dados reais

2. **Backend DEVE estar rodando**
   - Para análises reais
   - Verifique: http://localhost:8080
   - Se falhar: ver TROUBLESHOOTING.md

3. **Use F12 Console para Debugar**
   - Vê logs detalhados
   - Identifica erro exato
   - Procure por vermelho

4. **Porta 8080 em Uso?**
   - Se backend não inicia
   - Verifique porta: `netstat -ano | findstr :8080`
   - Mate processo: `taskkill /PID <PID> /F`

---

## 🆘 Problemas Comuns

### ❌ "Erro ao Analisar ECG"
**Causa mais comum:** Backend não rodando
**Solução:**
```bash
mvn spring-boot:run
```

### ❌ "CORS Policy Blocked"
**Causa:** Backend sem CORS configurado
**Solução:** Ver [TROUBLESHOOTING.md](TROUBLESHOOTING.md) seção 3

### ❌ "Timeout na Requisição"
**Causa:** Backend demorando ou travado
**Solução:** Reinicie backend

### ❌ "Dados Vazios"
**Causa:** CSV/JSON inválido
**Solução:** Use "Dados Simulados" para testar

---

## 📁 Estrutura do Projeto

```
ecg/
├─ src/
│  ├─ pages/
│  │  ├─ Dashboard.jsx     (Página inicial)
│  │  ├─ Analyzer.jsx      (Upload + Análise)
│  │  └─ Results.jsx       (Resultados)
│  ├─ components/
│  │  ├─ Header.jsx
│  │  ├─ Navigation.jsx
│  │  ├─ ECGChart.jsx      (Visualiza gráfico)
│  │  ├─ DebugHelper.jsx   (Dicas debug)
│  │  └─ ...
│  ├─ services/
│  │  └─ api.js            (Comunicação com backend)
│  └─ App.jsx              (Root component)
├─ package.json
├─ vite.config.js          (Configuração dev server)
└─ README_PRIMEIRO.md      (Este arquivo)
```

---

## 🔗 Recursos Úteis

| Arquivo | Uso |
|---------|-----|
| [README.md](README.md) | Visão geral e features |
| [INSTALLATION.md](INSTALLATION.md) | Como instalar |
| [DEVELOPMENT.md](DEVELOPMENT.md) | Arquitetura |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | 5 soluções de erros |
| [FIX_ANALYSIS_ERROR.md](FIX_ANALYSIS_ERROR.md) | Detalhes da correção |
| [IMAGE_ANALYSIS.md](IMAGE_ANALYSIS.md) | Como extrair ECG de imagem |

---

## ✅ Tudo Pronto?

Se chegou aqui e tudo funciona:

1. Congrats! 🎉
2. Explore as features
3. Upload seus próprios dados
4. Leia a documentação completa

---

**Última atualização:** 28/04/2026  
**Versão:** 1.0.0  
**Status:** ✅ Pronto para Usar
