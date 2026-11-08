from pathlib import Path
from typing import Protocol
from uuid import UUID

from src.search_jobs.domain.entities.master_cv import MasterCV


class TextExtractor(Protocol):
    def extract(self, path: Path, file_type: str) -> str: ...


class CVParser(Protocol):
    def parse(self, text: str) -> MasterCV: ...


class MasterCVRepository(Protocol):
    def get_current(self) -> tuple[UUID, MasterCV, int, str | None] | None: ...

    def get_by_id(self, cv_id: UUID) -> tuple[UUID, MasterCV, int, str | None] | None: ...

    def list_versions(self) -> list[dict]: ...

    def create(self, cv: MasterCV, source_file_name: str, source_file_type: str, name: str | None = None): ...

    def update(self, cv_id: UUID, cv: MasterCV, name: str | None = None) -> tuple[UUID, MasterCV, int, str | None]: ...
