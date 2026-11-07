from uuid import UUID, uuid4
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field
from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSONB

class MasterCVModel(SQLModel, table=True):
    __tablename__ = "master_cvs"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    data: dict = Field(default_factory=dict, sa_column=Column(JSONB, nullable=False))
    source_file_name: str | None = Field(default=None, max_length=255)
    source_file_type: str | None = Field(default=None, max_length=10)
    version: int = Field(default=1, index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CVSessionModel(SQLModel, table=True):
    __tablename__ = "cv_sessions"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    master_cv_id: UUID | None = Field(default=None, foreign_key="master_cvs.id", ondelete="SET NULL")
    master_cv_version: int = Field(default=1)
    company: str | None = Field(default=None, max_length=150)
    role_title: str | None = Field(default=None, max_length=150)
    job_description: str
    job_url: str | None = Field(default=None, max_length=500)
    status: str = Field(default="DRAFT", index=True)
    failed_step: str | None = Field(default=None, max_length=50)
    error_message: str | None = Field(default=None)
    retry_attempts: int = Field(default=0)
    analysis: dict | None = Field(default=None, sa_column=Column(JSONB, nullable=True))
    score_before: int | None = Field(default=None)
    score_after: int | None = Field(default=None)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), index=True)
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SuggestionModel(SQLModel, table=True):
    __tablename__ = "suggestions"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    session_id: UUID = Field(foreign_key="cv_sessions.id", ondelete="CASCADE", index=True)
    action: str = Field(max_length=20)
    section: str = Field(max_length=50)
    target_id: str = Field(max_length=100)
    before_text: str | None = Field(default=None)
    after_text: str | None = Field(default=None)
    reason: str
    source_evidence_ids: list = Field(default_factory=list, sa_column=Column(JSONB, nullable=False))
    keywords_covered: list = Field(default_factory=list, sa_column=Column(JSONB, nullable=False))
    status: str = Field(default="PENDING", index=True)
    user_edit: str | None = Field(default=None)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class GeneratedFileModel(SQLModel, table=True):
    __tablename__ = "generated_files"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    session_id: UUID = Field(foreign_key="cv_sessions.id", ondelete="CASCADE", index=True)
    file_format: str = Field(max_length=10)
    file_name: str = Field(max_length=255)
    storage_path: str = Field(max_length=500)
    file_size_bytes: int | None = Field(default=None)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

