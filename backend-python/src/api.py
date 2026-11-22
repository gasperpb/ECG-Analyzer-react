"""
API FastAPI de classificação de arritmias treinada com o banco MIT-BIH.

Endpoints:
- POST /predict -> {"prediction", "confidence", "bpm", "rr_interval", "qrs_duration"}
- GET  /health  -> {"status": "ok"}

Execução:
    uvicorn src.api:app --host 0.0.0.0 --port 8000
    (ou: python src/api.py)
"""

from typing import List, Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from src.dataset import get_record_names, read_record
from src.predictor import ECGPredictor

app = FastAPI(title="ECG Arrhythmia AI API", version="1.0.0")

_predictor: Optional[ECGPredictor] = None


def _get_predictor() -> ECGPredictor:
    global _predictor
    if _predictor is None:
        _predictor = ECGPredictor()
    return _predictor


class PredictRequest(BaseModel):
    data: List[float] = Field(..., min_length=1)
    sampling_rate: Optional[float] = None


class PredictResponse(BaseModel):
    prediction: str
    confidence: float
    bpm: Optional[float] = None
    rr_interval: Optional[float] = None
    qrs_duration: Optional[int] = None


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict")
def predict(request: PredictRequest):
    fs = request.sampling_rate if request.sampling_rate else 250.0
    result = _get_predictor().predict(request.data, fs)
    if result is None:
        raise HTTPException(
            status_code=422,
            detail="Não foi possível detectar picos R no ECG fornecido"
        )
    return PredictResponse(
        prediction=result["prediction"],
        confidence=result["confidence"],
        bpm=result["bpm"],
        rr_interval=result["rr_interval"],
        qrs_duration=int(round(result["qrs_duration"])) if result["qrs_duration"] is not None else None,
    )


@app.get("/records")
def get_records():
    """Lista os registros disponíveis do banco MIT-BIH (PhysioNet)."""
    return {"records": get_record_names()}


@app.get("/record/{record_name}")
def get_record(record_name: str):
    """Retorna o sinal bruto de um registro do banco MIT-BIH."""
    if (
        not record_name
        or record_name in (".", "..")
        or "/" in record_name
        or "\\" in record_name
    ):
        raise HTTPException(status_code=404, detail=f"Registro não encontrado: {record_name}")
    try:
        signal, fs, _ = read_record(record_name)
    except Exception:
        raise HTTPException(status_code=404, detail=f"Registro não encontrado: {record_name}")
    if signal.size == 0:
        raise HTTPException(status_code=404, detail=f"Registro vazio: {record_name}")
    return {
        "record": record_name,
        "data": signal.tolist(),
        "sampling_rate": fs,
        "duration": signal.size / fs if fs else None,
        "source": f"MIT-BIH Arrhythmia Database - registro {record_name}"
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("src.api:app", host="0.0.0.0", port=8000)
