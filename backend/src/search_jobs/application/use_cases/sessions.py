from uuid import UUID

from src.search_jobs.application.ports.master_cv import MasterCVRepository
from src.search_jobs.application.ports.sessions import CVSessionRepository, JobAnalyzer
from src.search_jobs.domain.entities.job_analysis import JobAnalysis
from src.search_jobs.infrastructure.persistence.models.tables import CVSessionModel


class AnalyzeJobUseCase:
    def __init__(
        self,
        master_cv_repo: MasterCVRepository,
        session_repo: CVSessionRepository,
        job_analyzer: JobAnalyzer,
    ) -> None:
        self.master_cv_repo = master_cv_repo
        self.session_repo = session_repo
        self.job_analyzer = job_analyzer

    def execute(
        self,
        master_cv_id: UUID,
        job_description: str,
        job_url: str | None = None,
    ) -> tuple[CVSessionModel, JobAnalysis]:
        # 1. Fetch target Master CV
        cv_record = self.master_cv_repo.get_by_id(master_cv_id)
        if cv_record is None:
            raise LookupError(f"Master CV with ID {master_cv_id} not found.")

        _, cv, cv_version, _ = cv_record

        # 2. Create draft session in database
        session = self.session_repo.create(
            master_cv_id=master_cv_id,
            master_cv_version=cv_version,
            job_description=job_description,
            job_url=job_url,
        )

        try:
            # 3. Execute Agent 1 Analysis with deterministic validation & scoring
            analysis = self.job_analyzer.analyze(cv=cv, job_description=job_description)

            # 4. Save analysis results to session
            updated_session = self.session_repo.update_analysis(
                session_id=session.id,
                analysis=analysis,
                score_before=analysis.match_score,
                company=analysis.company or None,
                role_title=analysis.job_title or None,
                status="ANALYZED",
            )
            return updated_session, analysis

        except Exception as exc:
            self.session_repo.update_status(
                session_id=session.id,
                status="FAILED",
                failed_step="AGENT_1_ANALYSIS",
                error_message=str(exc),
            )
            raise exc


class GetSessionUseCase:
    def __init__(self, session_repo: CVSessionRepository) -> None:
        self.session_repo = session_repo

    def execute(self, session_id: UUID) -> CVSessionModel:
        session = self.session_repo.get(session_id)
        if session is None:
            raise LookupError(f"Session with ID {session_id} not found.")
        return session

