from datetime import datetime, timezone
from uuid import UUID

from sqlmodel import Session, select

from src.search_jobs.domain.entities.master_cv import MasterCV
from src.search_jobs.infrastructure.persistence.models.tables import MasterCVModel


class SqlMasterCVRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def get_current(self) -> tuple[UUID, MasterCV, int] | None:
        model = self.session.exec(
            select(MasterCVModel).order_by(MasterCVModel.updated_at.desc())
        ).first()
        if model is None:
            return None
        return model.id, MasterCV.model_validate(model.data), model.version

    def create(self, cv: MasterCV, source_file_name: str, source_file_type: str):
        latest = self.session.exec(
            select(MasterCVModel).order_by(MasterCVModel.version.desc())
        ).first()
        model = MasterCVModel(
            data=cv.model_dump(mode="json"),
            source_file_name=source_file_name,
            source_file_type=source_file_type,
            version=(latest.version + 1) if latest else 1,
        )
        self.session.add(model)
        self.session.commit()
        self.session.refresh(model)
        return model.id, cv, model.version

    def update(self, cv_id: UUID, cv: MasterCV) -> tuple[UUID, MasterCV, int]:
        model = self.session.get(MasterCVModel, cv_id)
        if model is None:
            raise LookupError("Master CV not found.")
        model.data = cv.model_dump(mode="json")
        model.version += 1
        model.updated_at = datetime.now(timezone.utc)
        self.session.add(model)
        self.session.commit()
        self.session.refresh(model)
        return model.id, cv, model.version
