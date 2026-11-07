from collections.abc import Generator
from sqlmodel import Session, create_engine
from sqlalchemy import text
from src.search_jobs.infrastructure.config import settings

# Pooler configuration for Neon Serverless
engine = create_engine(
    settings.DATABASE_URL,
    echo=(settings.ENVIRONMENT == "development"),
    pool_pre_ping=True,
    pool_recycle=300
)

def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session

def check_db_connection() -> bool:
    try:
        with Session(engine) as session:
            session.exec(text("SELECT 1"))
        return True
    except Exception as e:
        print(f"Database connection error: {e}")
        return False

