FROM python:3.12-slim

WORKDIR /app

# System deps for OSINT tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    git curl build-essential libffi-dev \
    && rm -rf /var/lib/apt/lists/*

# Python deps
COPY pyproject.toml ./
RUN pip install --no-cache-dir -e .
RUN pip install --no-cache-dir bcrypt sherlock-project maigret holehe || true

COPY . .

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
