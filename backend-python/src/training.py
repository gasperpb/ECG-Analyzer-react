"""
Treinamento do classificador de arritmias (Random Forest) sobre o banco MIT-BIH.
"""

import pickle
from pathlib import Path

import numpy as np
from sklearn.ensemble import RandomForestClassifier

MODELS_DIR = Path(__file__).resolve().parents[1] / "models"
MODEL_PATH = MODELS_DIR / "ecg_model.pkl"

CLASS_NAMES = [
    "Normal",
    "PVC",
    "Atrial Premature Beat",
    "Left Bundle Branch Block",
    "Right Bundle Branch Block",
]
CLASS_TO_INDEX = {name: i for i, name in enumerate(CLASS_NAMES)}
INDEX_TO_CLASS = {i: name for name, i in CLASS_TO_INDEX.items()}

FEATURE_COLUMNS = [
    "rr_pre",
    "rr_post",
    "qrs_duration",
    "qrs_area",
    "r_amp",
    "bpm_pre",
    "bpm_post",
    "rhythm_cv",
]


def beat_to_features(beat):
    """Converte as características de um batimento em vetor numérico."""
    rr_pre = beat.get("rr_pre")
    rr_post = beat.get("rr_post")
    bpm_pre = 60.0 / rr_pre if rr_pre else np.nan
    bpm_post = 60.0 / rr_post if rr_post else np.nan
    values = {
        "rr_pre": rr_pre,
        "rr_post": rr_post,
        "qrs_duration": beat.get("qrs_duration"),
        "qrs_area": beat.get("qrs_area"),
        "r_amp": beat.get("r_amp"),
        "bpm_pre": bpm_pre,
        "bpm_post": bpm_post,
        "rhythm_cv": None,
    }
    rrs = [v for v in (rr_pre, rr_post) if v is not None]
    if len(rrs) >= 2:
        mean_rr = float(np.mean(rrs))
        if mean_rr > 0:
            values["rhythm_cv"] = float(np.std(rrs) / mean_rr)
    return {c: (float(values[c]) if values.get(c) is not None else np.nan) for c in FEATURE_COLUMNS}


def beats_to_matrix(beats):
    """Monta a matriz de características (NaNs preenchidos pela mediana da coluna)."""
    if not beats:
        return np.zeros((0, len(FEATURE_COLUMNS)))
    matrix = np.array(
        [[beat_to_features(b)[c] for c in FEATURE_COLUMNS] for b in beats], dtype=float
    )
    for j in range(matrix.shape[1]):
        column = matrix[:, j]
        mask = np.isnan(column)
        if mask.any():
            median = np.nanmedian(column[~mask]) if (~mask).any() else 0.0
            column[mask] = median
    return matrix


def train_model(X, y, random_state=42):
    """Treina o Random Forest."""
    model = RandomForestClassifier(
        n_estimators=100,
        random_state=random_state,
        class_weight="balanced",
        n_jobs=-1,
    )
    model.fit(X, y)
    return model


def save_model(model, path=MODEL_PATH):
    """Salva o modelo treinado em models/ecg_model.pkl (pickle)."""
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "wb") as f:
        pickle.dump(model, f)
    return path
