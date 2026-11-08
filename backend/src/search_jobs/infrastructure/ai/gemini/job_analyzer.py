from pathlib import Path
from google import genai
from google.genai import types

from src.search_jobs.domain.entities.master_cv import MasterCV
from src.search_jobs.domain.entities.job_analysis import JobAnalysis
from src.search_jobs.domain.services.evidence_validator import EvidenceValidator
from src.search_jobs.domain.services.match_scorer import MatchScorer
from src.search_jobs.infrastructure.ai.gemini.client import get_gemini_client
from src.search_jobs.infrastructure.config import settings


class GeminiJobAnalyzer:
    def __init__(self, client: genai.Client | None = None) -> None:
        self.client = client or get_gemini_client()
        prompt_path = Path(__file__).parent / "prompts" / "analyzer.md"
        if prompt_path.exists():
            self.system_prompt = prompt_path.read_text(encoding="utf-8")
        else:
            self.system_prompt = (
                "You are an ATS Audit Specialist. Analyze the job description against "
                "the candidate CV and output JobAnalysis JSON."
            )

    def analyze(self, cv: MasterCV, job_description: str) -> JobAnalysis:
        user_content = (
            "Analyze the target Job Description against the candidate's Master CV JSON.\n\n"
            "=== CANDIDATE MASTER CV ===\n"
            f"{cv.model_dump_json(indent=2)}\n\n"
            "=== TARGET JOB DESCRIPTION ===\n"
            f"{job_description}\n"
        )

        response = self.client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=user_content,
            config=types.GenerateContentConfig(
                system_instruction=self.system_prompt,
                response_mime_type="application/json",
                response_schema=JobAnalysis,
                temperature=0,
            ),
        )

        if not response.parsed:
            raise ValueError("Gemini returned an empty or invalid Job Analysis.")

        raw_analysis = JobAnalysis.model_validate(response.parsed)

        # 1. Deterministic evidence validation (eliminate hallucinated IDs)
        sanitized_analysis = EvidenceValidator.sanitize_analysis(raw_analysis, cv)

        # 2. Deterministic weighted ATS scoring (Skills, Keywords, Languages, Seniority)
        sanitized_analysis.match_score = MatchScorer.compute_score(sanitized_analysis, cv)

        return sanitized_analysis

