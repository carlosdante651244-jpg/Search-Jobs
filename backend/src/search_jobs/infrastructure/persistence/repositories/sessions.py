from datetime import datetime, timezone
from uuid import UUID

from sqlmodel import Session, select

from src.search_jobs.domain.entities.job_analysis import JobAnalysis
from src.search_jobs.infrastructure.persistence.models.tables import CVSessionModel


class SqlCVSessionRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def create(
        self,
        master_cv_id: UUID,
        master_cv_version: int,
        job_description: str,
        company: str | None = None,
        role_title: str | None = None,
        job_url: str | None = None,
    ) -> CVSessionModel:
        model = CVSessionModel(
            master_cv_id=master_cv_id,
            master_cv_version=master_cv_version,
            company=company,
            role_title=role_title,
            job_description=job_description,
            job_url=job_url,
            status="DRAFT",
        )
        self.session.add(model)
        self.session.commit()
        self.session.refresh(model)
        return model

    def get(self, session_id: UUID) -> CVSessionModel | None:
        return self.session.get(CVSessionModel, session_id)

    def update_analysis(
        self,
        session_id: UUID,
        analysis: JobAnalysis,
        score_before: int,
        company: str | None = None,
        role_title: str | None = None,
        status: str = "ANALYZED",
    ) -> CVSessionModel:
        model = self.session.get(CVSessionModel, session_id)
        if model is None:
            raise LookupError(f"CVSession with ID {session_id} not found.")

        model.analysis = analysis.model_dump(mode="json")
        model.score_before = score_before
        if company:
            model.company = company
        if role_title:
            model.role_title = role_title
        model.status = status
        model.updated_at = datetime.now(timezone.utc)

        self.session.add(model)
        self.session.commit()
        self.session.refresh(model)
        return model

    def update_status(
        self,
        session_id: UUID,
        status: str,
        failed_step: str | None = None,
        error_message: str | None = None,
    ) -> CVSessionModel:
        model = self.session.get(CVSessionModel, session_id)
        if model is None:
            raise LookupError(f"CVSession with ID {session_id} not found.")

        model.status = status
        if failed_step is not None:
            model.failed_step = failed_step
        if error_message is not None:
            model.error_message = error_message
        model.updated_at = datetime.now(timezone.utc)

        self.session.add(model)
        self.session.commit()
        self.session.refresh(model)
        return model

    def list_all(self, limit: int = 50) -> list[CVSessionModel]:
        statement = (
            select(CVSessionModel)
            .order_by(CVSessionModel.created_at.desc())
            .limit(limit)
        )
        return list(self.session.exec(statement).all())

