# 📊 ECG Analyzer

Uma interface web moderna e responsiva para análise de eletrocardiogramas (ECG) construída com **React.js 18**, **Vite**, **Tailwind CSS** e **Chart.js**. Backend em **Node.js/Express** com motor de diagnóstico integrado.

👨‍💻 **Criador:** [Achillesdev](https://github.com/Achillesdev)

## ✨ Características

- ✅ **Interface Responsiva** - Design moderno com Tailwind CSS
- ✅ **Gráficos Interativos** - Visualização de ECG com Chart.js
- ✅ **Upload de Arquivos** - CSV, JSON, ECG
- ✅ **Análise de Imagens** - Processa imagens de ECG (PNG, JPG, BMP)
- ✅ **Dados Simulados** - Geração de exemplos de ECG para testes
- ✅ **Análise em Tempo Real** - Backend Node.js integrado
- ✅ **Sinais Vitais Avançados** - SpO2, Glicose, PA, Temperatura, FR, Hb, K+, Na+, Mg++, Ca++, TSH, Creatinina, Troponina
- ✅ **Características do ECG** - Seleção manual de padrões visuais (ondas T, ST, delta, bloqueios, etc.)
- ✅ **100+ Diagnósticos** - Detecção de doenças cardíacas, eletrólitos, endócrinas, respiratórias, renais e 30+ síndromes combinadas
- ✅ **Correlações Multissistêmicas** - Análise cruzada ECG + sinais vitais + características visuais (30+ síndromes)
- ✅ **Relatórios Completos** - Diagnósticos, risco, interpretação e recomendações

---

## 🚀 Quick Start

### Pré-requisitos

- Node.js 16+
- npm ou yarn

### Instalação

```bash
# 1. Frontend
npm install
npm run dev

# 2. Backend (em outra janela)
cd backend
npm install
npm run dev

# 3. Acessar em http://localhost:3000
```

### Build para Produção

```bash
npm run build
npm run preview
```

---

## 📁 Estrutura do Projeto

```
ecg/
├── src/                         # Frontend React
│   ├── components/
│   │   ├── ECGChart.jsx         # Gráfico de ECG interativo
│   │   ├── DiagnosticsCard.jsx  # Card de diagnóstico
│   │   ├── FileUpload.jsx       # Upload drag & drop
│   │   ├── ImagePreview.jsx     # Pré-visualização de imagem
│   │   ├── VitalSignsInput.jsx  # Formulário de sinais vitais
│   │   ├── ECGFeaturesInput.jsx # Seleção de características ECG
│   │   └── ...
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Analyzer.jsx
│   │   └── Results.jsx
│   └── services/
│       ├── api.js               # API + extração de imagem
│       └── diagnosticEngine.js  # Motor de diagnóstico frontend
│
├── backend/                     # Backend Node.js/Express
│   ├── controllers/
│   │   └── ecgController.js
│   ├── models/
│   │   └── diagnosticEngine.js  # Motor de diagnóstico principal
│   ├── services/
│   │   └── ecgService.js
│   ├── routes/
│   │   └── ecg.js
│   └── server.js
│
└── vite.config.js               # Proxy para backend
```

---

## 🛠️ Tecnologias

| Tecnologia | Propósito |
|-----------|----------|
| React 18 | Framework UI |
| Vite 4 | Build tool + dev server |
| Tailwind CSS 3 | Styling |
| Chart.js 4 | Gráficos |
| Axios 1.6 | HTTP client |
| lucide-react | Ícones |
| **Node.js/Express** | **Backend API** |
| CORS | Comunicação frontend-backend |

---

## 🔌 API Endpoints

```
POST /api/ecg/analyze      # Análise de ECG + sinais vitais + características
GET  /api/ecg/status       # Status da API
GET  /api/ecg/simulated    # Dados simulados
GET  /api/health           # Health check
GET  /                     # Info da API
```

### Payload de Análise

```json
{
  "samplingRate": 250,
  "duration": 10,
  "data": [0.02, 0.05, 0.08, ...],
  "vitalSigns": {
    "potassium": 6.5,
    "troponin": 0.8,
    "glucose": 95,
    ...
  },
  "ecgFeatures": {
    "tallTWaves": true,
    "wideQRS": true,
    ...
  }
}
```

---

## 📊 Capacidades de Diagnóstico

### Diagnósticos por ECG Puro: 12
- Bradicardia
- Taquicardia
- Fibrilação Atrial
- Flutter Atrial
- Bloqueio AV (1º, 2º, 3º grau)
- Complexo QRS Alargado
- PR Prolongado
- QT Prolongado
- Ritmo Sinusal Normal
- Arritmia Não Especificada
- Sobrecarga do Ventrículo Esquerdo (HVE)
- Sobrecarga do Ventrículo Direito (HVD)

### Diagnósticos por Eletrólitos: 12
| Eletrólito | Condições |
|-----------|----------|
| **Potássio (K+)** | Hipocalemia, Hipocalemia Grave, Hipercalémia Leve, Hipercalémia Moderada, Hipercalémia Grave |
| **Sódio (Na+)** | Hiponatremia, Hiponatremia Grave, Hipernatremia, Hipernatremia Grave |
| **Magnésio (Mg++)** | Hipomagnesemia, Hipomagnesemia Grave, Hipermagnesemia |
| **Cálcio (Ca++)** | Hipocalcemia, Hipocalcemia Grave, Hipercalcemia, Hipercalcemia Grave (Crise) |

### Diagnósticos por Sinais Vitais: 30+
| Sinal | Condições |
|------|----------|
| **SpO2** | Hipoxemia |
| **Glicose** | Hipoglicemia, Hiperglicemia |
| **Pressão Arterial** | Hipertensão, Crise Hipertensiva, Hipotensão |
| **Temperatura** | Febre Alta, Hipotermia |
| **Hemoglobina** | Anemia, Anemia Grave |
| **Frequência Respiratória** | Bradipneia, Taquipneia |
| **Potássio (K+)** | Hipocalemia, Hipocalemia Grave, Hipercalémia Leve/Moderada/Grave |
| **Sódio (Na+)** | Hiponatremia, Hiponatremia Grave, Hipernatremia, Hipernatremia Grave |
| **Magnésio (Mg++)** | Hipomagnesemia, Hipomagnesemia Grave, Hipermagnesemia |
| **Cálcio (Ca++)** | Hipocalcemia, Hipocalcemia Grave, Hipercalcemia, Hipercalcemia Grave |
| **TSH** | Hipo/Hipertireoidismo (clínico e subclínico) |
| **Creatinina** | Função Renal Alterada, Insuficiência Renal, IRA Grave |
| **Troponina** | Lesão Miocárdica, IAM Provável |

### Diagnósticos por Características do ECG: 20+
| Categoria | Condições |
|----------|----------|
| **Eletrólitos/Metabólicas** | Hipercalémia (leve → grave com Sine Wave), Hipocalemia (ondas U), Hipotermia (Ondas de Osborn) |
| **Isquemia/IAM** | IAM com Supra de ST, Isquemia sem Supra (SCASSST), Pericardite Aguda |
| **Ritmo** | Fibrilação Auricular, Flutter Auricular, Bradicardia, Taquicardia |
| **Condução** | BAV 1º/2º/3º Grau, Bloqueio de Ramo, WPW (onda delta), QT Longo, QT Curto |
| **Sobrecargas** | Sobrecarga VE, Sobrecarga VD |
| **Outros** | Efeito Digitálico (ST "cuba"), Baixa Voltagem |

### Síndromes Multissistêmicas (Correlações): 30+

#### Cardíacas
| Síndrome | Combinação |
|---------|-----------|
| **Miocardiopatia Hipertensiva** | PA ↑ + QRS alargado |
| **Cardiopatia Hipertensiva** | PA ↑ + HVE |
| **Síndrome Coronária Aguda** | Troponina ↑ + alterações ECG isquémicas |
| **Miocardite** | Troponina ↑ + febre |
| **IAM Tipo 2 por Anemia** | Troponina ↑ + Hb ↓↓ |
| **Possível Choque Cardiogênico** | Taquicardia + PA ↓ + SpO2 ↓ |

#### Respiratórias
| Síndrome | Combinação |
|---------|-----------|
| **Insuficiência Respiratória Aguda** | SpO2 ↓ + FR ↑ |
| **SDRA** | SpO2 ↓↓ + FR ↑↑ + taquicardia |
| **Pneumonia Grave** | SpO2 ↓ + febre + taquicardia + FR ↑ |
| **Sepse Pulmonar** | SpO2 ↓ + febre + PA ↓ |
| **Depressão Respiratória** | SpO2 ↓ + FR ↓ |
| **Embolia Pulmonar** | SpO2 ↓ + taquicardia + sobrecarga VD |

#### Metabólicas
| Síndrome | Combinação |
|---------|-----------|
| **Cetoacidose Diabética** | Glicose ↑↑↑ + febre + taquicardia |
| **Diabetes Descompensado com Infecção** | Glicose ↑ + febre |
| **Hipoglicemia Sintomática** | Glicose ↓ + taquicardia |
| **Diabetes com Anemia** | Glicose ↑ + Hb ↓ |

#### Eletrólitos Combinados
| Síndrome | Combinação |
|---------|-----------|
| **Hipocalemia + Hipomagnesemia** | K+ ↓ + Mg++ ↓ |
| **QT Longo por Hipomagnesemia** | Mg++ ↓ + QT longo |
| **Arritmia por Hipocalemia** | K+ ↓ + arritmia |
| **QT Longo por Hipocalcemia** | Ca++ ↓ + QT longo |
| **Hiponatremia por Infecção (SIADH)** | Na+ ↓ + febre |
| **Arritmia por Hipomagnesemia** | Mg++ ↓ + arritmia |

#### Tireoide
| Síndrome | Combinação |
|---------|-----------|
| **Tempestade Tireotóxica** | TSH ↓↓ + taquicardia + febre ↑↑ |
| **Coma Mixedematoso** | TSH ↑↑ + bradicardia + hipotermia |
| **Fibrilação por Tireotoxicose** | TSH ↓ + FA |
| **Miocardiopatia por Hipotireoidismo** | TSH ↑ + bradicardia + baixa voltagem |
| **Hipotireoidismo com Anemia** | TSH ↑ + Hb ↓ |

#### Renais
| Síndrome | Combinação |
|---------|-----------|
| **Hipercalémia Renal** | Creatinina ↑ + K+ ↑ |
| **IRA com Hipercalémia** | Creatinina ↑↑ + K+ ↑ |
| **DRC com Anemia** | Creatinina ↑↑ + Hb ↓ |
| **IRA Pré-Renal** | Creatinina ↑↑ + PA ↓ |
| **Nefropatia Diabética** | Glicose ↑ + creatinina ↑↑ + K+ ↑ |

#### Multiorgânicas
| Síndrome | Combinação |
|---------|-----------|
| **Choque Séptico com IRA** | Febre + PA ↓ + creatinina ↑ + K+ ↑ |
| **Choque Séptico com Anemia** | Febre + PA ↓↓ + Hb ↓ |
| **Miocardite com Compromisso Pulmonar** | Troponina ↑ + SpO2 ↓ + febre |
| **Sepse** | Febre + PA ↓ + taquicardia |
| **Choque com Hipotermia** | Temp ↓ + PA ↓ |
| **Dissociação Pulso-Temperatura** | Febre + bradicardia (Sinal de Faget) |
| **Taquicardia Febril** | Febre + taquicardia (resposta fisiológica) |
| **Hipoxemia com Anemia** | SpO2 ↓ + Hb ↓ |
| **Anemia Grave com Compromisso Respiratório** | FR ↑ + SpO2 ↓ + Hb ↓↓ |

---

## 📋 Fluxo Completo de Análise

```
1. Upload de imagem/arquivo OU dados simulados
       ↓
2. Extração de dados (Canvas API para imagens)
       ↓
3. Visualização do gráfico ECG
       ↓
4. (Opcional) Inserir sinais vitais
       ↓
5. (Opcional) Marcar características visuais do ECG
       ↓
6. Análise no backend:
   ├── Análise automática do sinal ECG (BPM, ritmo, intervalos)
   ├── Análise de sinais vitais (14+ parâmetros)
   ├── Análise de características marcadas (20+ padrões)
   └── Correlações multissistêmicas (30+ síndromes)
       ↓
7. Resultados com diagnósticos priorizados por severidade
```

---

## 📦 Formatos Suportados

### Dados
| Formato | Estrutura |
|---------|----------|
| **CSV** | `timestamp(ms),voltagem(mV)` |
| **JSON** | `{ "samplingRate": 250, "duration": 10, "data": [...] }` |

### Imagens
| Formato | Descrição |
|---------|----------|
| **PNG** | Recomendado, melhor qualidade |
| **JPG/JPEG** | Comprimido, compatível |
| **BMP** | Sem compressão |

---

## 🎨 Configuração

### Variáveis de Ambiente

```env
# .env na raiz
VITE_API_URL=http://localhost:8080/api
```

### Proxy (vite.config.js)

```javascript
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true
    }
  }
}
```

---

## 📝 Scripts

```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build para produção
npm run preview  # Preview do build
npm run lint     # ESLint
```

### Backend

```bash
cd backend
npm run dev      # node --watch server.js
npm start        # node server.js
```

---

## 🐛 Troubleshooting

### Backend não responde
- Verifique se o backend está rodando: `cd backend && npm run dev`
- Confirme porta 8080 disponível: `netstat -ano | findstr :8080`
- Teste: `curl http://localhost:8080/api/health`

### Erro ao analisar imagem
- Use imagens com bom contraste (fundo claro, traço escuro)
- Verifique o console do navegador (F12) para logs
- O sistema tem fallback automático se o backend falhar

### Diagnóstico não detecta condição esperada
- Preencha os **sinais vitais** (K+, troponina, etc.)
- Marque as **características do ECG** (ondas T, ST, bloqueios, etc.)
- Quanto mais dados fornecer, mais precisa é a análise

---

## 📚 Documentação Adicional

- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Guia de resolução de problemas
- [IMAGE_ANALYSIS.md](IMAGE_ANALYSIS.md) - Detalhes sobre análise de imagens
- [DEVELOPMENT.md](DEVELOPMENT.md) - Arquitetura técnica
- [backend/README.md](backend/README.md) - Documentação do backend

---

## 📝 Licença

MIT

---

## 👨‍💻 Desenvolvedor

**Achillesdev** - [GitHub](https://github.com/Achillesdev)

Desenvolvedor Full Stack especializado em sistemas de análise de saúde e diagnóstico inteligente.

### Créditos

| Área | Responsável |
|-----|------------|
| Arquitetura | Achillesdev |
| Frontend React | Achillesdev |
| Backend Node.js | Achillesdev |
| Motor de Diagnóstico | Achillesdev |
| UI/UX Design | Achillesdev |
| Processamento de Imagem | Achillesdev |

---

**Desenvolvido com ❤️ por Achillesdev - 2026**
