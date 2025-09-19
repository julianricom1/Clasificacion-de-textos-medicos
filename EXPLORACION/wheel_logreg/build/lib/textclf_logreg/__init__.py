import joblib
from importlib.resources import files

_VEC = joblib.load(files(__package__) / "tfidf.joblib")
_MDL = joblib.load(files(__package__) / "model.joblib")

def predict(texts):
    X = _VEC.transform([str(t) for t in texts])
    if hasattr(_MDL, "predict_proba"):
        scores = _MDL.predict_proba(X)[:, 1]
    elif hasattr(_MDL, "decision_function"):
        from scipy.special import expit
        scores = expit(_MDL.decision_function(X))
    else:
        scores = [0.5] * X.shape[0]
    import numpy as np
    labels = (np.asarray(scores) >= 0.5).astype(int).tolist()
    return {"labels": labels, "scores": [float(s) for s in scores]}