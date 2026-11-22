"""
Acesso ao banco de dados MIT-BIH Arrhythmia Database (PhysioNet).

Funções:
- download_database(): baixa o banco via wfdb.dl_database()
- get_record_names(): lista os registros baixados localmente
- read_record(): lê um registro (sinal do canal 0 + anotação .atr)
"""

from pathlib import Path

import numpy as np
import wfdb

MITDB_SLUG = "mitdb"
DATA_DIR = Path(__file__).resolve().parents[1] / "data" / MITDB_SLUG


def download_database(data_dir=DATA_DIR):
    """
    Baixa o banco MIT-BIH Arrhythmia Database do PhysioNet usando wfdb.dl_database().

    Retorna o diretório local onde os arquivos foram baixados.
    """
    data_dir = Path(data_dir)
    print(f"Baixando MIT-BIH Arrhythmia Database ({MITDB_SLUG}) -> {data_dir} ...")
    wfdb.dl_database(db_dir=MITDB_SLUG, dl_dir=str(data_dir))
    print("Download concluído.")
    return data_dir


def get_record_names(data_dir=DATA_DIR):
    """Retorna os nomes (sem extensão) dos registros disponíveis localmente."""
    data_dir = Path(data_dir)
    if not data_dir.is_dir():
        return []
    return sorted(p.stem for p in data_dir.glob("*.dat"))


def read_record(record_name, data_dir=DATA_DIR):
    """
    Lê um registro MIT-BIH: sinal do canal 0 + taxa de amostragem + anotação (.atr).

    Retorna (signal, fs, annotation); annotation é None se não houver arquivo .atr.
    """
    base = Path(data_dir) / record_name
    rec = wfdb.rdrecord(str(base), physical=True)

    signal = rec.p_signal
    if signal is not None:
        signal = np.asarray(signal, dtype=float)
        if signal.ndim == 2:
            signal = signal[:, 0]
    else:
        signal = np.array([], dtype=float)

    fs = float(rec.fs) if rec.fs else 250.0

    annotation = None
    try:
        annotation = wfdb.rdann(str(base), "atr")
    except Exception:
        annotation = None

    return signal, fs, annotation
