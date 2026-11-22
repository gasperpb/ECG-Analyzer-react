"""
Predictor de arritmias: carrega o modelo treinado e classifica ECG cru.
"""

import pickle
from collections import Counter
from pathlib import Path

import numpy as np

from src.preprocessing import extract_beats, summarize_beats
from src.training import CLASS_NAMES, MODEL_PATH, beats_to_matrix

ANOMALY_THRESHOLD = 0.6


class ECGPredictor:
    """Carrega models/ecg_model.pkl e classifica segmentos de ECG."""

    def __init__(self, model_path=MODEL_PATH):
        with open(Path(model_path), "rb") as f:
            self.model = pickle.load(f)
        self.model_path = Path(model_path)

    def predict(self, data, fs=250.0):
        """
        Classifica um segmento de ECG (lista de amostras).

        Agrega as predições por batimento:
        - Se há batimentos anômalos (predição ≠ Normal com confiança alta),
          devolve a classe do anômalo mais confiante;
        - Senão, devolve a classe majoritária.

        Retorna dict:
        {
            "prediction": str,      # classe detectada (Normal, PVC, ...)
            "confidence": float,    # média da confiança do modelo por batimento
            "bpm": float|None,
            "rr_interval": float|None,
            "qrs_duration": float|None,
        }
        ou None se não houver picos R detectados.
        """
        signal = np.asarray(data, dtype=float)
        if signal.size == 0:
            return None

        beats = extract_beats(signal, fs)
        if not beats:
            return None

        X = beats_to_matrix(beats)
        predictions = self.model.predict(X)
        probas = self.model.predict_proba(X)

        classes = [CLASS_NAMES[p] for p in predictions]
        confs = [float(proba.max()) for proba in probas]

        anomalous = [
            (name, conf)
            for name, conf in zip(classes, confs)
            if name != "Normal" and conf >= ANOMALY_THRESHOLD
        ]
        if anomalous:
            prediction = max(anomalous, key=lambda nc: nc[1])[0]
        else:
            prediction = Counter(classes).most_common(1)[0][0]

        confidence = float(
            np.mean([c for name, c in zip(classes, confs) if name == prediction])
        )

        summary = summarize_beats(beats)
        return {
            "prediction": prediction,
            "confidence": round(confidence, 4),
            "bpm": summary["bpm"],
            "rr_interval": summary["rr_interval"],
            "qrs_duration": summary["qrs_duration"],
        }
