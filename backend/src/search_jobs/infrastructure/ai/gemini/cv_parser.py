from google import genai
from google.genai import types

from src.search_jobs.domain.entities.master_cv import MasterCV, normalize_ids
from src.search_jobs.infrastructure.ai.gemini.client import get_gemini_client
from src.search_jobs.infrastructure.config import settings


class GeminiCVParser:
    def __init__(self, client: genai.Client | None = None) -> None:
        self.client = client or get_gemini_client()

    def parse(self, text: str) -> MasterCV:
        response = self.client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=(
                "Convert this resume into the provided MasterCV schema. Preserve only facts "
                "present in the resume. Use empty strings or arrays when information is absent. "
                "Do not invent any data.\n\nRESUME:\n" + text
            ),
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=MasterCV,
                temperature=0,
            ),
        )
        if not response.parsed:
            raise ValueError("Gemini returned an empty or invalid Master CV.")
        return normalize_ids(MasterCV.model_validate(response.parsed))
