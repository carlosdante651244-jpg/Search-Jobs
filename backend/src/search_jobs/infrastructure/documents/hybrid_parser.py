import logging
from src.search_jobs.domain.entities.master_cv import MasterCV
from src.search_jobs.infrastructure.ai.gemini.cv_parser import GeminiCVParser
from src.search_jobs.infrastructure.documents.heuristic_parser import HeuristicCVParser

logger = logging.getLogger(__name__)


class HybridCVParser:
    """Hybrid parser that prioritizes AI structured extraction when available,

    and smoothly falls back to the deterministic HeuristicCVParser if Gemini fails
    or is disabled/unreachable.
    """

    def __init__(
        self,
        ai_parser: GeminiCVParser | None = None,
        fallback_parser: HeuristicCVParser | None = None,
        force_heuristic: bool = False,
    ) -> None:
        self.ai_parser = ai_parser or GeminiCVParser()
        self.fallback_parser = fallback_parser or HeuristicCVParser()
        self.force_heuristic = force_heuristic

    def parse(self, text: str) -> MasterCV:
        if self.force_heuristic:
            logger.info("Parsing CV using deterministic Heuristic Parser (forced).")
            return self.fallback_parser.parse(text)

        try:
            logger.info("Attempting CV parse with Gemini AI...")
            return self.ai_parser.parse(text)
        except Exception as error:
            logger.warning(
                f"Gemini CV parser failed or service is disabled ({error}). "
                "Falling back to HeuristicCVParser..."
            )
            return self.fallback_parser.parse(text)

