from pathlib import Path
from uuid import UUID

from src.search_jobs.application.ports.master_cv import CVParser, MasterCVRepository, TextExtractor
from src.search_jobs.domain.entities.master_cv import MasterCV


class UploadMasterCV:
    def __init__(
        self,
        extractor: TextExtractor,
        parser: CVParser,
        repository: MasterCVRepository,
    ) -> None:
        self.extractor = extractor
        self.parser = parser
        self.repository = repository

    def execute(self, path: Path, file_type: str, file_name: str, name: str | None = None) -> tuple[UUID, MasterCV, int, str | None]:
        text = self.extractor.extract(path, file_type)
        if not text.strip():
            raise ValueError("The uploaded file does not contain readable text.")
        cv = self.parser.parse(text)
        return self.repository.create(cv, file_name, file_type, name)


class GetMasterCV:
    def __init__(self, repository: MasterCVRepository) -> None:
        self.repository = repository

    def execute(self) -> tuple[UUID, MasterCV, int, str | None] | None:
        return self.repository.get_current()


class UpdateMasterCV:
    def __init__(self, repository: MasterCVRepository) -> None:
        self.repository = repository

    def execute(self, cv_id: UUID, cv: MasterCV, name: str | None = None) -> tuple[UUID, MasterCV, int, str | None]:
        return self.repository.update(cv_id, cv, name)
