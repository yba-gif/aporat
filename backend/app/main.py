"""Portolan Intelligence Platform — FastAPI entry point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.database import engine, Base

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup (dev only — use Alembic in prod)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Mount routers ───
from app.api.auth import router as auth_router
from app.api.cases import router as cases_router
from app.api.scans import router as scans_router
from app.api.dashboard import router as dashboard_router
from app.api.defence import router as defence_router

app.include_router(auth_router)
app.include_router(cases_router)
app.include_router(scans_router)
app.include_router(dashboard_router)
app.include_router(defence_router)


@app.get("/api/health")
async def health():
    return {"status": "ok", "version": settings.APP_VERSION}
