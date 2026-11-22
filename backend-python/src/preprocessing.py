"""
Pré-processamento de sinais ECG do banco MIT-BIH.

Características extraídas (por batimento e globais):
- BPM (batimentos por minuto)
- RR interval
- Picos R (índices e lista por batimento)
- Duração do complexo QRS
- Frequência cardíaca
- Ritmo (regular/irregular)

Bibliotecas usadas: wfdb (leitura do banco), neurokit2 (detecção de picos R)
e scipy (filtragem do sinal).
"""

import numpy as np
import neurokit2 as nk
from scipy.signal import butter, sosfiltfilt

SYMBOL_TO_CLASS = {
    "N": "Normal",
    "V": "PVC",
    "A": "Atrial Premature Beat",
    "L": "Left Bundle Branch Block",
    "R": "Right Bundle Branch Block",
}


def filter_signal(signal, fs, low_cut=0.5, high_cut=40.0):
    """
    Filtragem do sinal: passa-alta (linha de base, 0.5 Hz) + passa-baixa (40 Hz).

    Usa scipy.signal.butter + sosfiltfilt (não causa atraso de fase).
    """
    signal = np.asarray(signal, dtype=float)
    if signal.size == 0 or fs <= 0:
        return signal

    high_hz = min(high_cut, 0.98 * fs) if high_cut else None
    low_hz = low_cut if low_cut else None

    if low_hz and high_hz and high_hz > low_hz:
        sos = butter(4, [low_hz, high_hz], btype="bandpass", output="sos", fs=fs)
    elif high_hz:
        sos = butter(4, high_hz, btype="lowpass", output="sos", fs=fs)
    elif low_hz:
        sos = butter(4, low_hz, btype="highpass", output="sos", fs=fs)
    else:
        return signal
    return sosfiltfilt(sos, signal)


def extract_r_peaks(signal, fs):
    """Detecta os picos R usando neurokit2 (ECG_R_Peaks)."""
    signal = np.asarray(signal, dtype=float)
    if signal.size < int(4 * fs * 0.5):
        return np.array([], dtype=int)
    try:
        peaks = nk.ecg_findpeaks(signal, sampling_rate=fs, method="neurokit")["ECG_R_Peaks"]
    except Exception:
        return np.array([], dtype=int)
    return np.asarray(peaks, dtype=int)


def estimate_qrs_duration(signal_clean, r_peak, fs):
    """
    Estimativa da duração do complexo QRS em ms ao redor de um pico R.

    Largura da região onde o sinal filtrado supera 35% da amplitude do pico.
    """
    signal_clean = np.asarray(signal_clean, dtype=float)
    r_peak = int(r_peak)
    win = int(0.15 * fs)
    start = max(0, r_peak - win)
    end = min(len(signal_clean), r_peak + win)
    segment = signal_clean[start:end]
    if segment.size == 0:
        return None
    amp = float(np.max(np.abs(segment)))
    if not np.isfinite(amp) or amp <= 0:
        return None
    above = np.where(np.abs(segment) > 0.35 * amp)[0]
    if above.size == 0:
        return 0.0
    return float((above[-1] - above[0] + 1) * (1000.0 / fs))


def extract_beats(signal, fs, peaks=None):
    """
    Extrai características por batimento a partir dos picos R detectados:
    RR anterior/posterior, taxa cardíaca do batimento, duração/área/amplitude do QRS.

    Retorna lista de dicts:
    [{'r_peak', 'rr_pre', 'rr_post', 'qrs_duration', 'qrs_area', 'r_amp', 'bpm'}, ...]
    """
    signal = np.asarray(signal, dtype=float)
    fs = float(fs)
    if peaks is None:
        peaks = extract_r_peaks(signal, fs)
    peaks = np.asarray(peaks, dtype=int)
    if peaks.size == 0:
        return []

    clean = filter_signal(signal, fs)
    beats = []
    for i, peak in enumerate(peaks):
        p = int(peak)
        rr_pre = (p - int(peaks[i - 1])) / fs if i > 0 else None
        rr_post = (int(peaks[i + 1]) - p) / fs if i + 1 < len(peaks) else None
        rrs = [v for v in (rr_pre, rr_post) if v is not None]
        mean_rr = float(np.mean(rrs)) if rrs else None
        bpm = 60.0 / mean_rr if mean_rr and mean_rr > 0 else None

        window = int(0.1 * fs)
        lo = max(0, p - window)
        hi = min(len(clean), p + window)
        segment = clean[lo:hi]
        r_amp = float(np.max(np.abs(segment))) if segment.size else 0.0
        qrs_area = float(np.sum(np.abs(segment))) if segment.size else 0.0

        beats.append({
            "r_peak": p,
            "rr_pre": rr_pre,
            "rr_post": rr_post,
            "qrs_duration": estimate_qrs_duration(clean, p, fs),
            "qrs_area": qrs_area,
            "r_amp": r_amp,
            "bpm": bpm,
        })
    return beats


def summarize_beats(beats):
    """
    Resumo global dos batimentos: bpm, rr_interval (média do RR),
    qrs_duration (média), rhythm (regular/irregular) e picos R.
    """
    rr_series = []
    for beat in beats:
        for value in (beat.get("rr_pre"), beat.get("rr_post")):
            if value is not None:
                rr_series.append(value)

    mean_rr = float(np.mean(rr_series)) if rr_series else None
    bpm = 60.0 / mean_rr if mean_rr and mean_rr > 0 else None

    qrs_values = [b["qrs_duration"] for b in beats if b.get("qrs_duration") is not None]
    qrs_duration = float(np.mean(qrs_values)) if qrs_values else None

    if len(rr_series) > 1 and mean_rr:
        rhythm_cv = float(np.std(rr_series) / mean_rr)
    else:
        rhythm_cv = 0.0

    return {
        "bpm": bpm,
        "heart_rate": bpm,
        "rr_interval": mean_rr,
        "qrs_duration": qrs_duration,
        "rhythm": "regular" if rhythm_cv < 0.1 else "irregular",
        "rhythm_cv": rhythm_cv,
        "n_beats": len(beats),
        "r_peaks": [int(b["r_peak"]) for b in beats],
    }


def extract_features(signal, fs, peaks=None):
    """
    Extrai as características globais do sinal: BPM, RR interval,
    duração do QRS, frequência cardíaca e ritmo.
    """
    beats = extract_beats(signal, fs, peaks)
    return summarize_beats(beats)


def label_beats_with_annotations(beats, annotation, fs):
    """
    Atribui rótulos (símbolos MIT-BIH: N/V/A/L/R) aos batimentos detectados,
    comparando cada pico R com as anotações do registro (tolerância de 0.3 s).

    Define 'annotation' em cada batimento quando há correspondência.
    """
    if annotation is None or len(beats) == 0:
        return beats
    samples = np.asarray(annotation.sample)
    symbols = list(annotation.symbol)
    if samples.size == 0:
        return beats
    for beat in beats:
        peak = int(beat["r_peak"])
        distances = np.abs(samples - peak)
        idx = int(np.argmin(distances))
        if distances[idx] <= 0.3 * fs:
            symbol = symbols[idx]
            if symbol in SYMBOL_TO_CLASS:
                beat["annotation"] = symbol
    return beats
