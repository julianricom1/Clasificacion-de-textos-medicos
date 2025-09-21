# -------- Stage 1: builder  --------
FROM python:3.11-slim AS builder

ENV PIP_NO_CACHE_DIR=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt ./
COPY model-pkg/textclf_svm-0.1.0-py3-none-any.whl ./model-pkg/
#COPY model-pkg/textclf_logreg-0.1.0-py3-none-any.whl ./model-pkg/

# crear un environment
RUN python -m venv /opt/venv \
 && /opt/venv/bin/pip install --upgrade pip \
 && /opt/venv/bin/pip install --no-cache-dir -r requirements.txt

# -------- Stage 2: runtime  --------
FROM python:3.11-slim AS runtime

ENV PATH="/opt/venv/bin:$PATH" \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Usuario no-root
RUN useradd -m appuser
WORKDIR /app

# Copiamos el venv ya resuelto desde el builder
COPY --from=builder /opt/venv /opt/venv

# Copiamos SOLO el código de la app
COPY app/ ./app/

# Puerto por defecto de uvicorn
EXPOSE 8000

# Cambiamos a usuario seguro
USER appuser

# Arranque (simple; cambia args si quieres workers/gunicorn más adelante)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
