# ECG Analyzer

Sistema multiplataforma de apoio à decisão clínica para análise e interpretação automatizada de eletrocardiogramas (ECG). Roda no navegador, combina um motor de diagnóstico baseado em regras com um classificador de arritmias treinado no **MIT-BIH Arrhythmia Database (PhysioNet)** e gera laudos em PDF.

> ⚠️ Finalidade educacional e de pesquisa. Não substitui avaliação médica profissional.

---

## Sumário

1. [Visão geral](#visão-geral)
2. [Novidades e alterações incluídas](#novidades-e-alterações-incluídas)
3. [Arquitetura](#arquitetura)
4. [Tecnologias](#tecnologias)
5. [Estrutura do projeto](#estrutura-do-projeto)
6. [Como executar](#como-executar)
7. [MIT-BIH Arrhythmia Database](#mit-bih-arrhythmia-database)
8. [API e endpoints](#api-e-endpoints)
9. [Fluxo de análise](#fluxo-de-análise)
10. [Capacidades de diagnóstico](#capacidades-de-diagnóstico)
11. [Validação e testes](#validação-e-testes)
12. [Configuração](#configuração)
13. [Estado atual e pendências](#estado-atual-e-pendências)
14. [Documentação adicional](#documentação-adicional)
15. [Créditos](#créditos)

---

## Visão geral

A solução é composta por três camadas independentes:

| Camada | Tecnologia | Porta | Função |
|--------|-----------|-------|--------|
| Frontend | React 18 + Vite + Tailwind CSS | 3000 | Upload de arquivos/imagens, gráficos, formulários, laudos e histórico |
| Backend Node | Node.js + Express | 8080 | Motor de diagnóstico (regras), sinais vitais, síndromes e orquestração da IA |
| Backend Python | FastAPI + scikit-learn | 8000 | Classificador Random Forest treinado com o MIT-BIH |

Se a API Python estiver fora do ar, o backend Node continua funcionando com o motor de regras (fallback transparente).

---

## Novidades e alterações incluídas

### 1. Integração com o MIT-BIH Arrhythmia Database

- Novo diretório `backend-python/` com API FastAPI, pipeline de treino, pré-processamento, predição e acesso ao banco.
- Download automatizado do banco via `wfdb.dl_database()` e registros locais em `backend-python/data/mitdb/`.
- Classificador **Random Forest** (100 árvores, `class_weight="balanced"`, `random_state=42`) com 8 características por batimento e 5 classes.
- Modelo serializado em `backend-python/models/ecg_model.pkl`.
- Novos endpoints Python: `/health`, `/predict`, `/records`, `/record/{record_name}`.
- Novos endpoints Node (proxy): `GET /api/ecg/mitdb/records` e `GET /api/ecg/mitdb/record/:record_name`.
- Nova interface no Analyzer: seletor de registros do MIT-BIH e botão **“Analisar no MIT-BIH”**, que carrega o sinal real e dispara a análise completa (motor de regras + IA).
- Novos cards na tela de resultados: classe detectada pela IA, probabilidade/confiança do modelo.

### 2. Motor de diagnóstico determinístico

- O processamento de sinal foi centralizado em `shared/ecgSignal.js`, usado por frontend e backend.
- Removidas as implementações antigas e aproximadas de BPM, ritmo, QRS, QT, PR, ST e hipercalemia (que usavam limiares fixos e valores aleatórios como `Math.random()`).
- Novo pipeline: remoção de baseline, detecção de picos R por energia do derivativo com limiar adaptativo, localização de QRS, PR, QT/QTc, segmento ST e inversão da onda T.
- Resultado: medições determinísticas, `qtc` e `beatCount` expostos na resposta, além de `Análise Inconclusiva` quando a qualidade do sinal é insuficiente.
- Detecção de isquemia/infarto agora usa desvio do segmento ST consistente em múltiplos batimentos, com destaque visual das zonas no gráfico.

### 3. Orquestração no backend Node

- `ECGService.analyzeECGData()` passou a ser `async`: executa o motor de regras, chama a API Python e combina os resultados.
- Resposta ampliada com `currentEngine`, `aiEngine`, `finalDiagnosis` e `aiDiagnosis`.
- Variável de ambiente `PYTHON_API_URL` (padrão: `http://localhost:8000`).
- Nova dependência: `axios` no backend para comunicação com a API Python.

### 4. Frontend

- Novo `mitDbService` em `src/services/api.js`.
- `Analyzer.jsx`: carregamento dos registros MIT-BIH ao montar a página, análise de um registro específico e suporte a override de dados no `handleAnalyze`.
- `Results.jsx`: métricas mostram `N/A` quando ausentes, QTc em vez de QT e cards da IA.
- Novas dependências: `docx`, `file-saver`, `jszip`, `xml2js` (exportação/compartilhamento de laudos).

---

## Arquitetura

```text
Usuário (navegador / celular)
        │  upload CSV/JSON/imagem, sinais vitais, features, MIT-BIH
        ▼
Frontend React (localhost:3000)
        │  /api/*  (proxy Vite → localhost:8080)
        ▼
Backend Node/Express (localhost:8080)
        ├── Motor de Regras  ── shared/ecgSignal.js
        ├── Sinais vitais + correlações multissistêmicas
        └── axios → POST /predict (localhost:8000)
                        ▼
             API Python FastAPI (localhost:8000)
                        ▼
             Random Forest (models/ecg_model.pkl)
                        ▼
             MIT-BIH Arrhythmia Database (data/mitdb)
```

Resposta combinada:

```json
{
  "success": true,
  "analysis": { "bpm": 78, "rhythm": "Sinusal Normal", "qtc": 405, "pr": 158, "qrs": 88, "beatCount": 12 },
  "diagnoses": [],
  "currentEngine": { "...": "resultado das regras" },
  "aiEngine": { "prediction": "Normal", "confidence": 0.92, "bpm": 78, "rr_interval": 0.77, "qrs_duration": 88 },
  "finalDiagnosis": { "...": "regras + IA" }
}
```

---

## Tecnologias

| Camada | Tecnologias |
|--------|------------|
| Frontend | React 18, Vite 4, Tailwind CSS 3, Chart.js 4, react-chartjs-2, Axios, lucide-react, html2canvas, html2pdf.js, docx, jszip, file-saver, qrcode.react, xml2js |
| Backend Node | Node.js 20, Express 4, CORS, Axios, Multer, UUID |
| Backend Python | Python 3.14, FastAPI, Uvicorn, Pydantic, NumPy, pandas, SciPy, NeuroKit2, WFDB, scikit-learn |
| Banco de dados | MIT-BIH Arrhythmia Database (PhysioNet) |
| Deploy | Vercel (frontend + função serverless `api/index.js`) |

---

## Estrutura do projeto

```text
ecg-analyzer-react/
├── api/
│   └── index.js                      # Entrada serverless (Vercel) → backend/server.js
├── shared/
│   └── ecgSignal.js                  # Processamento de sinal compartilhado (front + back)
├── backend/                          # API Node/Express (porta 8080)
│   ├── server.js
│   ├── config/app.js
│   ├── routes/ecg.js
│   ├── controllers/ecgController.js
│   ├── services/ecgService.js        # Orquestra regras + IA Python
│   ├── models/diagnosticEngine.js    # Motor de diagnóstico (regras + correlações)
│   ├── validators/ecgValidator.js
│   ├── middleware/
│   ├── utils/
│   ├── constants/
│   └── package.json
├── backend-python/                   # API FastAPI + IA (porta 8000)
│   ├── train.py                      # Baixa o MIT-BIH, treina e salva o modelo
│   ├── requirements.txt
│   ├── src/
│   │   ├── api.py                    # /health, /predict, /records, /record/{name}
│   │   ├── dataset.py                # Download e leitura dos registros (WFDB)
│   │   ├── preprocessing.py          # Filtros, picos R, batimentos e rótulos
│   │   ├── training.py               # Features, Random Forest e serialização
│   │   └── predictor.py              # Agregação das predições por batimento
│   ├── data/mitdb/                   # Registros baixados (.dat/.hea/.atr)
│   ├── models/ecg_model.pkl          # Modelo treinado
│   └── README.md
├── src/
│   ├── components/                   # ECGChart, ECG12LeadChart, PDF, onboarding, etc.
│   ├── pages/                        # Dashboard, Analyzer, Results, History
│   ├── services/                     # api.js (inclui mitDbService), diagnosticEngine.js, etc.
│   ├── hooks/                        # useApi, useHistory, useArrhythmiaClassifier, etc.
│   ├── utils/
│   ├── constants/
│   ├── App.jsx
│   └── main.jsx
├── tcc.tex / TCC_ECG_Analyzer.docx   # Monografia do TCC
├── vite.config.js                    # Proxy /api → localhost:8080
├── vercel.json
└── README.md
```

---

## Como executar

### Pré-requisitos

- Node.js 16+ (testado com 20)
- Python 3.10+ (testado com 3.14)
- npm e pip

### 1. Backend Python (IA + MIT-BIH)

```bash
cd backend-python
python -m pip install -r requirements.txt
python train.py                 # baixa o MIT-BIH, treina e salva models/ecg_model.pkl
python train.py --skip-download # reutiliza os registros já baixados
uvicorn src.api:app --host 0.0.0.0 --port 8000
```

### 2. Backend Node (motor de regras)

```bash
cd backend
npm install
npm run dev        # http://localhost:8080
```

### 3. Frontend

```bash
npm install
npm run dev        # http://localhost:3000
```

Para gerar o build de produção: `npm run build` e `npm run preview`.

---

## MIT-BIH Arrhythmia Database

O [MIT-BIH Arrhythmia Database](https://physionet.org/content/mitdb/1.0.0/) é a base de referência para arritmias, com registros ambulatoriais de 30 minutos, amostrados a 360 Hz, com anotações manuais de batimento a batimento.

**Como é usado no projeto:**

1. `download_database()` baixa os registros para `backend-python/data/mitdb/` via WFDB.
2. `read_record()` lê o sinal do canal 0 e as anotações `.atr`.
3. `extract_beats()` detecta os picos R com NeuroKit2 e extrai RR anterior/posterior, duração, área e amplitude do QRS, além do BPM.
4. `label_beats_with_annotations()` associa cada batimento detectado ao símbolo MIT-BIH correspondente (tolerância de 0,3 s).
5. `beats_to_matrix()` monta a matriz de 8 características: `rr_pre`, `rr_post`, `qrs_duration`, `qrs_area`, `r_amp`, `bpm_pre`, `bpm_post`, `rhythm_cv` (NaNs preenchidos pela mediana da coluna).
6. `train_model()` treina o Random Forest com split estratificado 80/20 (`random_state=42`) e imprime acurácia e `classification_report`.
7. `ECGPredictor.predict()` classifica cada batimento do sinal enviado pelo Node e agrega o resultado: se houver batimento anômalo com confiança ≥ 0,6, essa classe prevalece; caso contrário, usa a classe majoritária.

| Classe do modelo | Símbolo MIT-BIH |
|------------------|-----------------|
| Normal | N |
| PVC | V |
| Atrial Premature Beat | A |
| Left Bundle Branch Block | L |
| Right Bundle Branch Block | R |

O script de treino reporta a acurácia no conjunto de teste (20%) antes de treinar a versão final com todos os batimentos.

---

## API e endpoints

### Backend Node (`:8080`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/health` | Health check do backend |
| GET | `/api/ecg/status` | Status operacional |
| POST | `/api/ecg/analyze` | Análise completa (ECG + vitais + features + IA) |
| GET | `/api/ecg/simulated` | Geração de sinal simulado |
| GET | `/api/ecg/mitdb/records` | Lista registros do MIT-BIH (via Python) |
| GET | `/api/ecg/mitdb/record/:record_name` | Sinal bruto de um registro (via Python) |

Payload de análise:

```json
{
  "samplingRate": 250,
  "duration": 10,
  "data": [0.02, 0.05, 0.08],
  "vitalSigns": { "potassium": 6.5, "troponin": 0.8, "glucose": 95 },
  "ecgFeatures": { "tallTWaves": true, "wideQRS": true }
}
```

### Backend Python (`:8000`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/health` | Health check da IA |
| POST | `/predict` | Classifica um segmento de ECG |
| GET | `/records` | Lista registros locais do MIT-BIH |
| GET | `/record/{record_name}` | Retorna sinal, taxa e duração de um registro |

Exemplo:

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"data": [0.1, 0.2, 0.3], "sampling_rate": 250}'
```

---

## Fluxo de análise

```text
1. Entrada: upload (CSV/JSON/PNG/JPG/BMP), dados simulados ou registro do MIT-BIH
2. Extração: Canvas API para imagens (1 ou 12 derivações) / leitura de arquivo / WFDB
3. Visualização: gráfico Chart.js com destaque de zonas de supra/infra ST
4. (Opcional) Sinais vitais e laboratoriais: 14 parâmetros
5. (Opcional) Características visuais do ECG: 20+ padrões
6. Backend Node: motor de regras + correlações multissistêmicas
7. Backend Python: classificação por batimento com Random Forest (MIT-BIH)
8. Resultado: diagnósticos priorizados, IA, interpretação, recomendações
9. Saída: laudo em PDF, compartilhamento, histórico local (localStorage)
```

---

## Capacidades de diagnóstico

- **100+ diagnósticos** combinados.
- **14 sinais vitais/laboratoriais**: SpO2, glicose, PA, temperatura, FR, hemoglobina, K+, Na+, Mg++, Ca++, TSH, creatinina e troponina.
- **20+ padrões visuais de ECG**: ondas T, segmento ST, onda delta, bloqueios, sobrecargas e arritmias.
- **30+ síndromes multissistêmicas**: cardíacas, respiratórias, metabólicas, eletrolíticas, tireoidianas, renais e multiorgânicas.
- **5 classes de arritmia** reconhecidas pelo modelo treinado no MIT-BIH.
- **Laudos profissionais**: cabeçalho, métricas, severidade, interpretação, recomendações, assinatura com CRM e instituição.
- **Histórico local** com até 50 análises, exportação CSV e comparação de resultados.
- **Dark mode**, onboarding e layout responsivo para uso à beira-leito.

---

## Validação e testes

Não existe ainda uma suíte automatizada de testes configurada. A validação atual é feita em quatro níveis:

**1. Dependências e modelo**

```bash
python -c "import sklearn, wfdb, neurokit2, scipy, numpy, fastapi; print('deps OK')"
cd backend-python && python train.py --skip-download
# imprime amostras por classe, acurácia no teste (20%) e classification_report
```

**2. API Python**

```bash
uvicorn src.api:app --host 0.0.0.0 --port 8000
curl http://localhost:8000/health
curl http://localhost:8000/records
curl http://localhost:8000/record/100
```

**3. API Node**

```bash
cd backend && npm run dev
curl http://localhost:8080/api/health
curl http://localhost:8080/api/ecg/mitdb/records
curl -X POST http://localhost:8080/api/ecg/analyze \
  -H "Content-Type: application/json" \
  -d '{"samplingRate":250,"duration":10,"data":[0.1,0.2,0.3]}'
```

**4. Frontend e código**

```bash
npm run lint     # ESLint
npm run build    # verifica se o bundle de produção compila
npm run dev      # validação manual: upload, MIT-BIH, vitais, PDF e histórico
```

Para o TCC, a métrica de acurácia do classificador é obtida diretamente na saída de `python train.py` (split estratificado 80/20). O motor de regras é validado com os sinais do próprio MIT-BIH pela tela “Analisar no MIT-BIH”.

---

## Configuração

```env
# .env.local (raiz) — frontend
VITE_API_URL=/api

# backend/.env — API Node
PORT=8080
PYTHON_API_URL=http://localhost:8000
```

O Vite faz proxy de `/api` para `http://localhost:8080` (`vite.config.js`). Em produção na Vercel, `api/index.js` expõe o app Express como função serverless.

---

## Estado atual e pendências

- ✅ Integração MIT-BIH, IA Python, motor determinístico, laudos e histórico funcionais.
- ⚠️ `npm run lint` ainda reporta 4 erros e 14 avisos (principalmente imports não usados e aspas não escapadas em `Dashboard.jsx` / `useApi.js`).
- ⚠️ Não há testes unitários automatizados (Jest/Vitest/pytest); a validação é manual e via `train.py`.
- ⚠️ `backend/package.json` mantém um script `test` placeholder; `npm test` não executa testes reais.

---

## Documentação adicional

- [README do backend Node](backend/README.md)
- [Estrutura do backend](backend/BACKEND_STRUCTURE.md)
- [README do backend Python / IA](backend-python/README.md)
- [Guia de sinais vitais](VITAL_SIGNS_GUIDE.md)
- [Análise de imagens](IMAGE_ANALYSIS.md)
- [Solução de problemas](TROUBLESHOOTING.md)
- [Desenvolvimento](DEVELOPMENT.md)
- Monografia: `tcc.tex` e `TCC_ECG_Analyzer.docx`

---

## Créditos

| Área | Responsável |
|------|------------|
| Autoria e monografia | Achilles Robson Vasconcelos (Achillesdev) |
| Frontend React | Achillesdev |
| Backend Node e motor de diagnóstico | Achillesdev |
| Backend Python / IA (MIT-BIH) | Achillesdev |
| Banco de dados | MIT-BIH Arrhythmia Database — PhysioNet |

Repositório: https://github.com/Achillesdev/ECG-Analyzer-react

---

## 📦 Outros projetos da área de saúde

Alguns outros projetos desenvolvidos na área de saúde e bem-estar:

| Projeto | Descrição | Link |
|---------|-----------|------|
| 🌐 **Corpo Humano** | Interface interativa com anatomía humana e informações de órgãos | https://corpo-humano-jr7o-git-master-gasperpbs-projects.vercel.app/ |
| 🩺 **Site Diabetes** | Portal com informações, dicas e recursos para controle de diabetes | https://site-diabetes.vercel.app/ |

---

**Licença:** MIT
