# ✨ Novos Recursos - Sinais Vitais Adicionais

## 📊 Visão Geral

A aplicação ECG Analyzer agora suporta **análise integrada de sinais vitais** além do ECG tradicional, permitindo diagnósticos muito mais precisos e detecção de uma gama maior de doenças e condições.

---

## 🆕 O Que É Novo

### 1. **Coleta de Sinais Vitais Opcionais**

Na página de análise, agora há um painel expansível **"Sinais Vitais Adicionais"** que permite adicionar:

#### Métricas Fisiológicas:
- 🫁 **SpO2 (Oximetria)** - 70-100% (Normal: 95-100%)
- 🩸 **Glicose** - 20-600 mg/dL (Normal em jejum: 70-100 mg/dL)
- 💉 **Pressão Sistólica** - 50-200 mmHg (Normal: <120 mmHg)
- 💉 **Pressão Diastólica** - 30-150 mmHg (Normal: <80 mmHg)
- 🌡️ **Temperatura** - 35-42°C (Normal: 36.5-37.5°C)
- 💨 **Frequência Respiratória** - 5-40 bpm (Normal: 12-20 bpm)
- 🔴 **Hemoglobina** - 5-20 g/dL (Normal homens: 13.5-17.5 g/dL)

#### Informações Clínicas:
- 🩸 **Tipo Sanguíneo** - A, B, AB, O, com Rh
- 💊 **Medicamentos em Uso** - Lista de medicamentos atuais
- 📋 **Histórico Médico** - Condições pré-existentes

### 2. **Motor de Diagnóstico Avançado**

Novo módulo `diagnosticEngine.js` que:
- ✅ Analisa padrões de ECG
- ✅ Avalia sinais vitais isoladamente
- ✅ Detecta correlações entre múltiplos sinais
- ✅ Gera diagnósticos mais precisos
- ✅ Calcula nível de risco geral

### 3. **Componente VitalSignsInput**

Novo componente com:
- ✅ Validação em tempo real de valores
- ✅ Indicadores de status (✓ normal, ⚠️ atenção, ✗ crítico)
- ✅ Ranges de normalidade documentados
- ✅ Interface intuitiva e organizada

### 4. **Resultados Melhorados**

Página de resultados agora mostra:
- ✅ Seção dedicada aos sinais vitais capturados
- ✅ Nível de risco geral (Crítico, Atenção, Normal)
- ✅ Status de cada sinal vital com cores
- ✅ Diagnósticos expandidos com mais doenças

---

## 🎯 Como Usar

### Passo 1: Carregar Dados de ECG

Escolha uma das 3 opções:
- 📄 Upload de arquivo CSV/JSON
- 🖼️ Upload de imagem ECG
- 🎲 Gerar dados simulados

### Passo 2: Adicionar Sinais Vitais (Opcional)

1. Localize o painel **"💊 Sinais Vitais Adicionais"**
2. Clique para expandir
3. Preencha os campos desejados:
   - ✓ = Todos os campos são opcionais
   - ⚠️ = Campos validados em tempo real
   - 🔴 = Erro automaticamente destacado

### Passo 3: Analisar

Clique em **"Analisar ECG"** - o sistema:
1. Envia ECG + sinais vitais para análise
2. Se backend indisponível, usa análise local avançada
3. Gera diagnósticos considerando todos os dados

### Passo 4: Revisar Resultados

Veja:
- 📊 Traçado de ECG
- 💊 Sinais vitais capturados
- ⚠️ Nível de risco geral
- 📋 Diagnósticos detalhados com recomendações

---

## 🔬 Doenças Detectáveis Agora

### Por Sinais Vitais:

#### Respitório (SpO2):
- Hipoxemia (crítica se SpO2 < 80%)
- DPOC, Pneumonia, Asma, TEP

#### Endócrino (Glicose):
- Hipoglicemia (< 70 mg/dL)
- Hiperglicemia (> 126 mg/dL)
- Diabetes Tipo 1 e 2
- Cetoacidose

#### Cardiovascular (PA):
- Crise Hipertensiva (≥180/≥120)
- Hipertensão (≥140/≥90)
- Hipotensão (<90/<60)
- Pré-eclâmpsia

#### Infeccioso (Temperatura):
- Febre Alta (> 38.5°C)
- Hipotermia (< 36°C)
- Infecção viral/bacteriana
- Sepse

#### Hematológico (Hemoglobina):
- Anemia (< 12 g/dL)
- Policitemia (> 18 g/dL)
- Deficiência de ferro
- Sangramento crônico

#### Respiratório (FR):
- Bradipneia (< 10 bpm)
- Taquipneia (> 25 bpm)
- Depressão do SNC
- Insuficiência respiratória

### Correlações Detectadas:

- 🔗 **PA ↑ + QRS ↑** → Possível Miocardiopatia Hipertensiva
- 🔗 **Glicose ↓/↑ + Arritmia** → Alteração Metabólica com Arritmia
- 🔗 **SpO2 ↓ + Taquicardia** → Insuficiência Respiratória
- 🔗 **Hemoglobina ↓ + Taquicardia** → Taquicardia Compensatória

---

## 📈 Exemplo Prático

### Cenário: Paciente Hipertenso com Diabetes

**Dados Capturados:**
- ECG: Taquicardia (BPM: 115), QRS alargado (120ms)
- SpO2: 96% ✓
- Glicose: 185 mg/dL ⚠️
- PA: 155/95 ⚠️
- Temperatura: 37.1°C ✓

**Análise Gerada:**
1. ✅ Taquicardia Sinusal (115 BPM)
2. ⚠️ QRS Alargado (120ms) → Possível bloqueio de ramo
3. ⚠️ Hiperglicemia (185 mg/dL)
4. ⚠️ Hipertensão (155/95)
5. 🔗 **Possível Miocardiopatia Hipertensiva**

**Recomendações:**
- ⚠️ Nível de Risco: ALTO 🔴
- 📋 Ecocardiograma urgente
- 💊 Ajuste de medicações
- 💧 Controle de PA e glicose

---

## 🔧 Técnico - Arquitetura

### Novos Arquivos:

```
src/
├── components/
│   └── VitalSignsInput.jsx        # Novo - Interface de coleta
├── services/
│   └── diagnosticEngine.js        # Novo - Motor de análise avançado
└── pages/
    ├── Analyzer.jsx               # Atualizado - Integração
    └── Results.jsx                # Atualizado - Exibição sinais vitais
```

### Fluxo de Dados:

```
VitalSignsInput (coleta)
        ↓
Analyzer.jsx (handleAnalyze)
        ↓
analysisPayload = {
  samplingRate, duration, data,
  vitalSigns: { spO2, glucose, ... }
}
        ↓
ecgService.analyzeECG() ou
generateSimulatedAnalysis()
        ↓
diagnosticEngine.analyzeDiagnosis()
        ↓
Results.jsx (exibição)
```

### Funções Principais:

1. **analyzeDiagnosis(ecgData, vitalSigns)**
   - Retorna diagnósticos avançados
   - Calcula nível de risco
   - Gera interpretação integrada

2. **analyzeECGPatterns(ecgData)**
   - Diagnósticos baseados em ECG puro

3. **analyzeVitalSigns(vitals)**
   - Diagnósticos baseados em vitais

4. **analyzeCombinedConditions(ecgData, vitals)**
   - Detecta correlações e síndromes

---

## ✅ Validações

### Em Tempo Real:

Cada campo é validado contra ranges aceitáveis:

```javascript
SpO2:     70-100%
Glucose:  20-600 mg/dL
Systolic: 50-200 mmHg
Diastolic: 30-150 mmHg
Temp:     35-42°C
RR:       5-40 bpm
Hgb:      5-20 g/dL
```

### Feedback Visual:

- ✓ (Verde) = Dentro da normalidade
- ⚠️ (Amarelo) = Atenção (anormal mas não crítico)
- ✗ (Vermelho) = Crítico (fora dos limites seguros)

---

## 🎓 Exemplos de Uso

### Exemplo 1: Fibrilação Atrial + Hipertensão

```
ECG: Fibrilação Atrial, BPM 115
PA: 145/92
Glicose: 95

Resultado:
→ Fibrilação Atrial (warning)
→ Hipertensão (warning)
→ Risco Alto: Possível cardiopatia
→ Recomendação: Anticoagulação
```

### Exemplo 2: Choque Séptico

```
Temp: 39.8°C
SpO2: 88%
PA: 85/55
RR: 32
Glucose: 180

Resultado:
→ Febre Alta (critical)
→ Hipoxemia (warning)
→ Hipotensão (critical)
→ Taquipneia (warning)
→ Hiperglicemia (warning)
→ Risco Crítico: SEPSE SUSPEITA
→ Recomendação: EMERGÊNCIA IMEDIATA
```

### Exemplo 3: Anemia Compensada

```
Hemoglobin: 9.5 g/dL
BPM: 105
SpO2: 98%
PA: 110/70

Resultado:
→ Anemia (attention)
→ Taquicardia Compensatória (attention)
→ Risco Moderado
→ Recomendação: Investigar e suplementar ferro
```

---

## 🚀 Benefícios

1. ✅ **Diagnósticos Mais Precisos**
   - Não apenas ECG, mas análise multissistêmica

2. ✅ **Detecção de Mais Doenças**
   - 20+ condições agora detectáveis
   - Correlações entre sistemas

3. ✅ **Avaliação de Risco Integrada**
   - Nível de risco geral calculado
   - Recomendações contextualizadas

4. ✅ **Interface Intuitiva**
   - Campos opcionais - flexibilidade
   - Validação em tempo real - segurança
   - Indicadores visuais - clareza

5. ✅ **Compatível com Backend**
   - Fallback para análise local
   - Estrutura pronta para backend integrar

---

## 📱 Interface User-Friendly

### Painel de Sinais Vitais:

```
╔════════════════════════════════════╗
║ 💊 Sinais Vitais Adicionais        ║
║ Opcional - Adiciona precisão       ║
╠════════════════════════════════════╣
║                                    ║
║ SpO₂      [95] %    ✓ Normal       ║
║ Glicose   [85] mg/dL ✓ Normal      ║
║ PA Sist   [120] mmHg ✓ Normal      ║
║ PA Diast  [80] mmHg ✓ Normal       ║
║ Temp      [37.0] °C ✓ Normal       ║
║ FR        [16] bpm ✓ Normal        ║
║ Hgb       [15] g/dL ✓ Normal       ║
║ Tipo Sang [A+]                     ║
║                                    ║
╚════════════════════════════════════╝
```

---

## 📞 Perguntas Frequentes

**P: Os sinais vitais são obrigatórios?**
R: Não! Todos os campos são opcionais. O ECG é analisado normalmente mesmo sem sinais vitais.

**P: Posso adicionar sinais vitais depois de carregar o ECG?**
R: Sim! O painel aparece após selecionar dados de ECG, permite adicionar ou modificar.

**P: Quais doenças são detectadas?**
R: Veja a seção "Doenças Detectáveis" acima - 20+ condições e suas correlações.

**P: O backend recebe os sinais vitais?**
R: Sim! Estão no payload: `{ ..., vitalSigns: {...} }`

**P: E se preenchera valores incorretos?**
R: A validação em tempo real mostra erro. Use o intervalo indicado.

**P: Como funciona a análise local?**
R: A `diagnosticEngine.js` processa localmente e gera diagnósticos automáticos.

---

## 🔄 Próximos Passos

1. **Backend**: Integrar sinais vitais no `/api/ecg/analyze`
2. **ML**: Treinar modelos com dados multissistêmicos
3. **Histórico**: Armazenar e comparar análises ao longo do tempo
4. **Alertas**: Notificações para valores críticos
5. **Integração**: APIs de dispositivos IoT (wearables, monitores)

---

**Versão:** 2.0.0  
**Data:** 28/04/2026  
**Status:** ✅ Pronto para Uso  
**Compatibilidade:** React 18.2+, Vite 4.3+
