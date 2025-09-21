import json
import joblib
from importlib.resources import files
import numpy as np

_VEC = joblib.load(files(__package__) / "tfidf.joblib")
_MDL = joblib.load(files(__package__) / "model.joblib")
_METRICS = json.loads((files(__package__) / "metrics.json").read_text(encoding="utf-8"))

def _scores_for(X):
    if hasattr(_MDL, "predict_proba"):
        return _MDL.predict_proba(X)[:, 1]
    elif hasattr(_MDL, "decision_function"):
        from scipy.special import expit
        return expit(_MDL.decision_function(X))
    else:
        return np.full(X.shape[0], 0.5, dtype=float)

def predict(texts, threshold=0.5):
    X = _VEC.transform([str(t) for t in texts])
    s = _scores_for(X)
    y = (s >= float(threshold)).astype(int).tolist()
    return {"labels": y, "scores": [float(v) for v in s]}

def metrics():
    """Devuelve las métricas calculadas en validación durante el entrenamiento."""
    return dict(_METRICS)