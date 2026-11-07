from fastapi import APIRouter
from src.search_jobs.infrastructure.persistence.database import check_db_connection
from src.search_jobs.infrastructure.config import settings
from src.search_jobs.infrastructure.ai.gemini.client import get_gemini_client

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("")
def health_check():
    db_ok = check_db_connection()
    return {
        "status": "ok" if db_ok else "degraded",
        "database": "connected" if db_ok else "disconnected",
        "environment": settings.ENVIRONMENT,
        "model": settings.GEMINI_MODEL
    }

@router.get("/ai")
def ai_health_check():
    try:
        client = get_gemini_client()
        res = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents="Respond with only the word OK"
        )
        return {
            "status": "ok",
            "model": settings.GEMINI_MODEL,
            "response": res.text.strip()
        }
    except Exception as e:
        return {
            "status": "error",
            "model": settings.GEMINI_MODEL,
            "error": str(e)
        }

