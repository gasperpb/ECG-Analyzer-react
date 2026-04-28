# Exemplos de Uso - Sinais Vitais

## 📊 Como Testar os Novos Recursos

### Teste 1: Paciente com Fibrilação Atrial

**Passo 1:** Clique em "Dados Simulados"

**Passo 2:** Expanda "Sinais Vitais Adicionais" e preencha:
```
SpO2:              96%
Glicose:           95 mg/dL
Pressão Sistólica: 138 mmHg
Pressão Diastólica: 88 mmHg
Temperatura:       37.2°C
Freq Respiratória: 18 bpm
Hemoglobina:       14.5 g/dL
Tipo Sanguíneo:    O+
```

**Resultado Esperado:**
- Fibrilação Atrial detectada
- Hipertensão leve
- ⚠️ Risco Moderado
- Recomendação: Avaliação cardiológica

---

### Teste 2: Paciente com Hipoglicemia Aguda

**Passo 1:** Clique em "Dados Simulados"

**Passo 2:** Expanda "Sinais Vitais Adicionais" e preencha:
```
SpO2:              98%
Glicose:           55 mg/dL        ⚠️ CRÍTICO
Pressão Sistólica: 110 mmHg
Pressão Diastólica: 72 mmHg
Temperatura:       36.8°C
Freq Respiratória: 22 bpm          ⚠️ ELEVADA
Hemoglobina:       15 g/dL
Medicamentos:      Insulina NPH 20UI
```

**Resultado Esperado:**
- 🔴 Hipoglicemia CRÍTICA
- Taquipneia compensatória
- 🔴 Risco CRÍTICO
- Recomendação: EMERGÊNCIA IMEDIATA

---

### Teste 3: Paciente Hipertenso com Miocardiopatia

**Passo 1:** Clique em "Dados Simulados"

**Passo 2:** Expanda "Sinais Vitais Adicionais" e preencha:
```
SpO2:              95%
Glicose:           125 mg/dL       ⚠️ ELEVADA
Pressão Sistólica: 155 mmHg        ⚠️ ELEVADA
Pressão Diastólica: 98 mmHg        ⚠️ ELEVADA
Temperatura:       37.0°C
Freq Respiratória: 20 bpm          ⚠️ LIMITE
Hemoglobina:       14 g/dL
Histórico:         Hipertensão, Obesidade, Diabetes
Medicamentos:      Enalapril 10mg, Atenolol 50mg
```

**Resultado Esperado:**
- Taquicardia
- QRS alargado
- Possível Miocardiopatia Hipertensiva
- Hiperglicemia leve
- ⚠️ Risco ALTO

---

### Teste 4: Paciente com Possível DPOC Exacerbado

**Passo 1:** Clique em "Dados Simulados"

**Passo 2:** Expanda "Sinais Vitais Adicionais" e preencha:
```
SpO2:              87%             🔴 CRÍTICO
Glicose:           105 mg/dL
Pressão Sistólica: 125 mmHg
Pressão Diastólica: 82 mmHg
Temperatura:       38.5°C          ⚠️ FEBRE
Freq Respiratória: 32 bpm          🔴 CRÍTICO
Hemoglobina:       13 g/dL
Histórico:         DPOC, Tabagismo
Medicamentos:      Salbutamol inalado
```

**Resultado Esperado:**
- 🔴 Hipoxemia CRÍTICA
- 🔴 Taquipneia CRÍTICA
- Febre alta
- Taquicardia compensatória
- 🔴 Risco CRÍTICO
- Recomendação: Oxigênio urgente + imaging pulmonar

---

### Teste 5: Paciente Normal (Baseline)

**Passo 1:** Clique em "Dados Simulados"

**Passo 2:** Expanda "Sinais Vitais Adicionais" e preencha:
```
SpO2:              98%             ✓
Glicose:           85 mg/dL        ✓
Pressão Sistólica: 118 mmHg        ✓
Pressão Diastólica: 76 mmHg        ✓
Temperatura:       36.8°C          ✓
Freq Respiratória: 16 bpm          ✓
Hemoglobina:       15 g/dL         ✓
Tipo Sanguíneo:    A+
```

**Resultado Esperado:**
- ✓ Ritmo Sinusal Normal
- ✓ Todos os sinais vitais normais
- 🟢 Risco BAIXO
- Recomendação: Acompanhamento regular

---

## 📝 Criando Arquivo JSON Customizado

Se quiser fazer upload de um arquivo JSON com sinais vitais:

```json
{
  "samplingRate": 250,
  "duration": 10,
  "data": [0.1, 0.2, 0.15, -0.1, 0.05, 0.3, ...],
  "vitalSigns": {
    "spO2": 96,
    "glucose": 95,
    "systolic": 138,
    "diastolic": 88,
    "temperature": 37.2,
    "respiratoryRate": 18,
    "hemoglobin": 14.5,
    "bloodType": "O+",
    "medicalHistory": "Hipertensão, Fibrilação Atrial",
    "medications": "Atenolol 50mg, Warfarina 5mg"
  }
}
```

**Como usar:**
1. Salve como `patient_data.json`
2. Na app, clique "Arquivo de Dados"
3. Selecione o JSON
4. Os sinais vitais já virão carregados!
5. Clique "Analisar ECG"

---

## 🔍 Testando Validações

### Teste de Limite Inferior:

```
SpO2: 65%          ← Abaixo de 70
```
Resultado: ❌ Erro - "SpO2 deve estar entre 70-100%"

### Teste de Limite Superior:

```
Glucose: 700 mg/dL  ← Acima de 600
```
Resultado: ❌ Erro - "Glicose deve estar entre 20-600 mg/dL"

### Teste de Valor Válido Limite:

```
Hemoglobin: 5.0 g/dL  ← No mínimo
```
Resultado: ✓ Aceito - Hemoglobina critica detectada

---

## 📊 Monitorando Mudanças

Você pode fazer vários testes e comparar resultados:

### Test Run 1 - Paciente Normaliza:
- Entrada 1: Glicose 180 mg/dL, PA 155/95
- Resultado: Risco ALTO
- Entrada 2: Glicose 95 mg/dL, PA 118/76  
- Resultado: Risco BAIXO
- 📈 Melhora evidente!

---

## 🎯 Casos de Uso Reais

### Caso 1: Pronto-Socorro
```
Paciente chega com dispneia
Captura: SpO2 85%, RR 35, PA 165/95, Temp 39.2°C
Análise: 🔴 CRÍTICO - Possível pneumonia/sepse
Ação: Internação e antibióticos
```

### Caso 2: Consultório
```
Paciente assintomático em check-up
Captura: ECG normal, todos vitais normais
Análise: ✓ NORMAL
Ação: Continuar acompanhamento anual
```

### Caso 3: Telemedicina
```
Paciente em casa com palpitações
Captura: ECG com arritmias, Glicose 145, PA 140/85
Análise: ⚠️ ATENÇÃO - Possível FA + DM
Ação: Referência para cardiologista

Análise: ⚠️ ATENÇÃO
```

---

## 💡 Dicas

1. **Sempre teste com valores normais primeiro**
   - Entenda o fluxo
   - Veja diagnóstico normal

2. **Depois teste valores críticos**
   - Veja como o sistema responde
   - Entenda prioridade de diagnósticos

3. **Use dados reais de pacientes (anonimizados)**
   - Validar contra seus conhecimentos
   - Treinar interpretação

4. **Compare análise local vs backend**
   - Ambos devem chegar a conclusões similares
   - Note diferenças e reporte bugs

---

## 🚀 Próximos Passos

1. ✅ Testar todos os 5 cenários acima
2. ✅ Validar que erros aparecem corretamente
3. ✅ Integrar com backend Java (enviar vitalSigns)
4. ✅ Treinar equipe médica
5. ✅ Coletar feedback e melhorar

---

**Versão:** 1.0.0  
**Data:** 28/04/2026
