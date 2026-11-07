from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.search_jobs.infrastructure.config import settings
from src.search_jobs.presentation.api.v1.routers.health import router as health_router

app = FastAPI(
    title="Search-Jobs API",
    description="ATS Resume Tailoring Platform API",
    version="0.1.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(health_router, prefix="/api/v1")

@app.get("/")
def root():
    return {
        "name": "Search-Jobs API",
        "version": "0.1.0",
        "docs_url": "/docs"
    }
