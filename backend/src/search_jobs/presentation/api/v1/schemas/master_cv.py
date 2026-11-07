from uuid import UUID

from pydantic import BaseModel

from src.search_jobs.domain.entities.master_cv import MasterCV


class MasterCVResponse(BaseModel):
    id: UUID
    version: int
    data: MasterCV
