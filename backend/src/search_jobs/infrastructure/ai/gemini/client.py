from google import genai
from src.search_jobs.infrastructure.config import settings

def get_gemini_client() -> genai.Client:
    return genai.Client(api_key=settings.GEMINI_API_KEY)

