from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field


class AnalyzeJobRequest(BaseModel):
    master_cv_id: UUID
    job_description: str = Field(..., min_length=20)
    job_url: str | None = None


class CVSessionResponse(BaseModel):
    id: UUID
    master_cv_id: UUID | None = None
    master_cv_version: int = 1
    company: str | None = None
    role_title: str | None = None
    job_description: str
    job_url: str | None = None
    status: str
    failed_step: str | None = None
    error_message: str | None = None
    analysis: dict | None = None
    score_before: int | None = None
    score_after: int | None = None
    created_at: datetime
    updated_at: datetime

