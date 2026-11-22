"""
Treina o classificador de arritmias com o banco MIT-BIH Arrhythmia Database.

Exemplos:
    python train.py                  # baixa o banco e treina
    python train.py --skip-download  # usa os dados já baixados em data/mitdb
"""

import argparse
import sys
from collections import Counter
from pathlib import Path

import numpy as np
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split

from src.dataset import DATA_DIR, download_database, get_record_names, read_record
from src.preprocessing import SYMBOL_TO_CLASS, extract_beats, label_beats_with_annotations
from src.training import CLASS_NAMES, CLASS_TO_INDEX, MODEL_PATH, beats_to_matrix, save_model, train_model

RANDOM_STATE = 42


def collect_training_data(data_dir, max_samples_per_class=None):
    """
    Coleta características rotuladas por batimento a partir do banco local.

    Rótulos vindos das anotações (.atr) do MIT-BIH (símbolos N/V/A/L/R),
    mapeados para as classes do classificador.

    Retorna (X, y, counts): matriz de características, rótulos por índice de
    classe e Contagem de amostras por classe.
    """
    beats_list = []
    labels = []
    counts = Counter()

    for record_name in get_record_names(data_dir):
        signal, fs, annotation = read_record(record_name, data_dir)
        beats = extract_beats(signal, fs)
        label_beats_with_annotations(beats, annotation, fs)
        for beat in beats:
            label = beat.get("annotation")
            if label is None:
                continue
            class_name = SYMBOL_TO_CLASS[label]
            if max_samples_per_class and counts[class_name] >= max_samples_per_class:
                continue
            beats_list.append(beat)
            labels.append(class_name)
            counts[class_name] += 1

    X = beats_to_matrix(beats_list)
    y = np.array([CLASS_TO_INDEX[l] for l in labels], dtype=int)
    return X, y, dict(counts)


def main():
    parser = argparse.ArgumentParser(
        description="Treina o classificador de arritmias com o banco MIT-BIH."
    )
    parser.add_argument(
        "--skip-download",
        action="store_true",
        help="Não baixar o banco; usar os dados já presentes em data/mitdb",
    )
    parser.add_argument("--data-dir", default=str(DATA_DIR))
    parser.add_argument("--model-path", default=str(MODEL_PATH))
    parser.add_argument(
        "--max-samples-per-class",
        type=int,
        default=None,
        help="Limita amostras por classe (padrão: todas)",
    )
    args = parser.parse_args()

    data_dir = Path(args.data_dir)
    if not args.skip_download:
        download_database(data_dir)

    records = get_record_names(data_dir)
    if not records:
        print("Nenhum registro disponível. Rode sem --skip-download para baixar o banco.")
        return 1

    print(f"Registros disponíveis ({len(records)}): {records[:10]}{'...' if len(records) > 10 else ''}")

    X, y, counts = collect_training_data(data_dir, args.max_samples_per_class)
    print("Amostras por classe:", counts)
    print("Total de batimentos:", len(y))
    print("Batimentos por classe:", {CLASS_NAMES[i]: int(c) for i, c in enumerate(np.bincount(y, minlength=len(CLASS_NAMES)))})

    if len(y) == 0:
        print("Nenhum batimento rotulado foi coletado.")
        return 1

    try:
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, stratify=y, random_state=RANDOM_STATE
        )
    except ValueError:
        X_train, X_test, y_train, y_test = X, X, y, y

    model = train_model(X_train, y_train)
    if len(y_test) and len(np.unique(y_test)) > 1:
        y_pred = model.predict(X_test)
        print("Acurácia no conjunto de teste:", round(accuracy_score(y_test, y_pred), 4))
        print(
            classification_report(
                y_test, y_pred, target_names=CLASS_NAMES,
                labels=list(range(len(CLASS_NAMES))), zero_division=0
            )
        )

    # Treinar no dataset completo para o modelo final
    model = train_model(X, y)
    saved = save_model(model, args.model_path)
    print(f"Modelo salvo em {saved}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
