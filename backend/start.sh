#!/bin/bash
# ──────────────────────────────────────────────────────
# Portolan Labs — Start Everything
# ──────────────────────────────────────────────────────
# This script starts the full backend stack:
#   PostgreSQL + Redis + FastAPI + Celery Worker + Flower
# Then seeds the database with demo data.
# ──────────────────────────────────────────────────────

set -e

echo "🚀 Starting Portolan Labs Backend..."
echo ""

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker Desktop first."
    echo "   → https://www.docker.com/products/docker-desktop/"
    exit 1
fi

if ! docker info &> /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

echo "✅ Docker is running"

# Build and start
echo "📦 Building containers (first time takes ~2 minutes)..."
docker compose up --build -d

# Wait for postgres
echo "⏳ Waiting for database to be ready..."
sleep 5

# Seed database
echo "🌱 Seeding demo data..."
docker compose exec -T api python -m scripts.seed 2>/dev/null || {
    echo "   Retrying in 5 seconds..."
    sleep 5
    docker compose exec -T api python -m scripts.seed
}

echo ""
echo "═══════════════════════════════════════════════════"
echo "  ✅ Portolan Labs Backend is RUNNING!"
echo "═══════════════════════════════════════════════════"
echo ""
echo "  📡 API:        http://localhost:8000"
echo "  📖 API Docs:   http://localhost:8000/docs"
echo "  🌸 Flower:     http://localhost:5555"
echo ""
echo "  🔑 Demo Login:"
echo "     admin@portolan.ai / admin123"
echo "     officer@portolan.ai / officer123"
echo ""
echo "  To stop:  cd backend && docker compose down"
echo "═══════════════════════════════════════════════════"
