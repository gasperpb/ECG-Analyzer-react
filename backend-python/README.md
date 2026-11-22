# ECG Analyzer - Backend Python (IA treinada com MIT-BIH)

API de classificação de arritmias treinada com o banco **MIT-BIH Arrhythmia Database**
(PhysioNet), em complemento ao motor de diagnóstico do Backend Node.

## Arquitetura

```
Frontend (React) → Backend Node (backend/) → API Python (backend-python/) → Modelo Random Forest
                                                                             treinado com MIT-BIH
```

## Dependências

```bash
pip install -r requirements.txt
```

## Como treinar

```bash
python train.py
```

O script:
1. Baixa o banco MIT-BIH (PhysioNet) automaticamente via `wfdb.dl_database()`
   (arquivos em `data/mitdb/`);
2. Lê os registros ECG e extrai as características: BPM, RR interval,
   picos R, duração do complexo QRS, frequência cardíaca e ritmo;
3. Treina um classificador **Random Forest** nos rótulos do banco:
   `Normal`, `PVC`, `Atrial Premature Beat`, `Left Bundle Branch Block`
   e `Right Bundle Branch Block`;
4. Salva o modelo em `models/ecg_model.pkl`.

Para não baixar novamente: `python train.py --skip-download`.

## Como executar

```bash
uvicorn src.api:app --host 0.0.0.0 --port 8000
```

ou `python src/api.py`.

Endpoints:

- `GET /health` → `{"status": "ok"}`
- `POST /predict` →
  ```json
  {
    "prediction": "PVC",
    "confidence": 0.92,
    "bpm": 78,
    "rr_interval": 0.82,
    "qrs_duration": 102
  }
  ```
  Entrada: `{"data": [0.1, 0.2, 0.3]}` (campo opcional: `sampling_rate`)

## Como integrar

O Backend Node consome `POST http://localhost:8000/predict` em
`backend/services/ecgService.js`.

1. Suba a API Python (`uvicorn src.api:app --port 8000`).
2. Inicie o Backend Node (`npm start` em `backend/`).
3. A resposta será `{ currentEngine, aiEngine, finalDiagnosis }`:
   - `currentEngine`: resultado do motor de regras (sem alteração);
   - `aiEngine`: resultado da IA (ou `null` se a API Python estiver fora);
   - `finalDiagnosis`: resultado combinado da IA.

Se a API Python não estiver disponível, a análise segue com o motor de regras.

## Classes e rótulos MIT-BIH

| Classe | Rótulo MIT-BIH |
|---|---|
| Normal | N |
| PVC | V |
| Atrial Premature Beat | A |
| Left Bundle Branch Block | L |
| Right Bundle Branch Block | R |
