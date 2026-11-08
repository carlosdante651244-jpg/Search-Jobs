from typing import Protocol
from uuid import UUID

from src.search_jobs.domain.entities.job_analysis import JobAnalysis
from src.search_jobs.domain.entities.master_cv import MasterCV
from src.search_jobs.infrastructure.persistence.models.tables import CVSessionModel


class JobAnalyzer(Protocol):
    def analyze(self, cv: MasterCV, job_description: str) -> JobAnalysis: ...


class CVSessionRepository(Protocol):
    def create(
        self,
        master_cv_id: UUID,
        master_cv_version: int,
        job_description: str,
        company: str | None = None,
        role_title: str | None = None,
        job_url: str | None = None,
    ) -> CVSessionModel: ...

    def get(self, session_id: UUID) -> CVSessionModel | None: ...

    def update_analysis(
        self,
        session_id: UUID,
        analysis: JobAnalysis,
        score_before: int,
        company: str | None = None,
        role_title: str | None = None,
        status: str = "ANALYZED",
    ) -> CVSessionModel: ...

    def update_status(
        self,
        session_id: UUID,
        status: str,
        failed_step: str | None = None,
        error_message: str | None = None,
    ) -> CVSessionModel: ...

    def list_all(self, limit: int = 50) -> list[CVSessionModel]: ...

