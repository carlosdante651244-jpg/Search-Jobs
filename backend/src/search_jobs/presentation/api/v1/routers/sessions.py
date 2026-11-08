from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from src.search_jobs.application.use_cases.sessions import (
    AnalyzeJobUseCase,
    GetSessionUseCase,
)
from src.search_jobs.infrastructure.ai.gemini.job_analyzer import GeminiJobAnalyzer
from src.search_jobs.infrastructure.persistence.database import get_session
from src.search_jobs.infrastructure.persistence.repositories.master_cv import (
    SqlMasterCVRepository,
)
from src.search_jobs.infrastructure.persistence.repositories.sessions import (
    SqlCVSessionRepository,
)
from src.search_jobs.presentation.api.v1.schemas.sessions import (
    AnalyzeJobRequest,
    CVSessionResponse,
)

router = APIRouter(prefix="/sessions", tags=["Sessions"])


@router.post("/analyze", response_model=CVSessionResponse)
def analyze_job(request: AnalyzeJobRequest, db: Session = Depends(get_session)):
    try:
        master_cv_repo = SqlMasterCVRepository(db)
        session_repo = SqlCVSessionRepository(db)
        job_analyzer = GeminiJobAnalyzer()

        use_case = AnalyzeJobUseCase(
            master_cv_repo=master_cv_repo,
            session_repo=session_repo,
            job_analyzer=job_analyzer,
        )

        session_model, _ = use_case.execute(
            master_cv_id=request.master_cv_id,
            job_description=request.job_description,
            job_url=request.job_url,
        )
        return session_model

    except LookupError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {str(exc)}",
        )


@router.get("/{session_id}", response_model=CVSessionResponse)
def get_session_by_id(session_id: UUID, db: Session = Depends(get_session)):
    try:
        session_repo = SqlCVSessionRepository(db)
        use_case = GetSessionUseCase(session_repo)
        return use_case.execute(session_id)
    except LookupError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.get("", response_model=list[CVSessionResponse])
def list_sessions(limit: int = 20, db: Session = Depends(get_session)):
    session_repo = SqlCVSessionRepository(db)
    return session_repo.list_all(limit=limit)

