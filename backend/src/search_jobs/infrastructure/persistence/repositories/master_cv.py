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

    def list_versions(self) -> list[dict]:
        models = self.session.exec(
            select(MasterCVModel).order_by(MasterCVModel.version.desc())
        ).all()
        return [
            {
                "id": model.id,
                "version": model.version,
                "source_file_name": model.source_file_name,
                "source_file_type": model.source_file_type,
                "data": model.data,
                "created_at": model.created_at,
                "updated_at": model.updated_at,
            }
            for model in models
        ]

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
        current = self.session.get(MasterCVModel, cv_id)
        if current is None:
            raise LookupError("Master CV not found.")
        model = MasterCVModel(
            data=cv.model_dump(mode="json"),
            source_file_name=current.source_file_name,
            source_file_type=current.source_file_type,
            version=current.version + 1,
        )
        self.session.add(model)
        self.session.commit()
        self.session.refresh(model)
        return model.id, cv, model.version
