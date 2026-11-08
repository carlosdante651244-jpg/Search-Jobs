import os
from pathlib import Path
from tempfile import mkstemp
from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from google.genai.errors import APIError
from sqlmodel import Session

from src.search_jobs.application.use_cases.master_cv import (
    GetMasterCV,
    UpdateMasterCV,
    UploadMasterCV,
)
from src.search_jobs.domain.entities.master_cv import MasterCV
from src.search_jobs.infrastructure.documents.hybrid_parser import HybridCVParser
from src.search_jobs.infrastructure.documents.text_extractor import DocumentTextExtractor
from src.search_jobs.infrastructure.persistence.database import get_session
from src.search_jobs.infrastructure.persistence.repositories.master_cv import SqlMasterCVRepository
from src.search_jobs.presentation.api.v1.schemas.master_cv import MasterCVResponse

router = APIRouter(prefix="/master-cv", tags=["Master CV"])
MAX_FILE_SIZE = 5 * 1024 * 1024
ALLOWED_TYPES = {
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".pdf": "application/pdf",
}


def response_for(result: tuple[UUID, MasterCV, int, str | None]) -> MasterCVResponse:
    cv_id, data, version, name = result
    return MasterCVResponse(id=cv_id, name=name, version=version, data=data)


@router.get("", response_model=MasterCVResponse | None)
def get_master_cv(session: Session = Depends(get_session)):  # noqa: B008
    result = GetMasterCV(SqlMasterCVRepository(session)).execute()
    return response_for(result) if result else None


@router.get("/history")
def get_master_cv_history(session: Session = Depends(get_session)):  # noqa: B008
    return SqlMasterCVRepository(session).list_versions()


@router.get("/{cv_id}", response_model=MasterCVResponse | None)
def get_master_cv_by_id(cv_id: UUID, session: Session = Depends(get_session)):  # noqa: B008
    result = SqlMasterCVRepository(session).get_by_id(cv_id)
    return response_for(result) if result else None


@router.post("", response_model=MasterCVResponse, status_code=status.HTTP_201_CREATED)
async def upload_master_cv(
    file: UploadFile = File(...),  # noqa: B008
    name: str | None = Form(None),  # noqa: B008
    session: Session = Depends(get_session),  # noqa: B008
):
    extension = Path(file.filename or "").suffix.lower()
    expected_type = ALLOWED_TYPES.get(extension)
    if expected_type is None or file.content_type != expected_type:
        raise HTTPException(422, "Only valid .docx or .pdf files are accepted.")

    content = await file.read(MAX_FILE_SIZE + 1)
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(413, "The file must be 5 MB or smaller.")

    file_descriptor, temporary_name = mkstemp(suffix=extension)
    try:
        with os.fdopen(file_descriptor, "wb") as temporary:
            temporary.write(content)
        try:
            result = UploadMasterCV(
                DocumentTextExtractor(),
                HybridCVParser(),
                SqlMasterCVRepository(session),
            ).execute(
                Path(temporary_name),
                expected_type,
                file.filename or f"resume{extension}",
                name.strip() if name else None,
            )
        except (ValueError, LookupError) as error:
            raise HTTPException(422, str(error)) from error
    finally:
        os.unlink(temporary_name)
    return response_for(result)


@router.put("/{cv_id}", response_model=MasterCVResponse)
def update_master_cv(
    cv_id: UUID,
    cv: MasterCV,
    name: str | None = None,
    session: Session = Depends(get_session),  # noqa: B008
):
    try:
        result = UpdateMasterCV(SqlMasterCVRepository(session)).execute(cv_id, cv, name)
    except LookupError as error:
        raise HTTPException(404, str(error)) from error
    return response_for(result)
