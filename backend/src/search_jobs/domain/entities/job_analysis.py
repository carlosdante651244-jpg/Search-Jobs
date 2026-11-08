from pydantic import BaseModel, Field

class MatchedRequirement(BaseModel):
    requirement: str
    evidence_ids: list[str] = Field(default_factory=list)

class RequirementGap(BaseModel):
    requirement: str
    severity: str = "medium"  # high, medium, low
    transferable_evidence_ids: list[str] = Field(default_factory=list)

class JobAnalysis(BaseModel):
    job_title: str = ""
    company: str = ""
    seniority: str = ""
    required_languages: list[str] = Field(default_factory=list)
    required_skills: list[str] = Field(default_factory=list)
    preferred_skills: list[str] = Field(default_factory=list)
    keywords: list[str] = Field(default_factory=list)
    responsibilities: list[str] = Field(default_factory=list)
    matched: list[MatchedRequirement] = Field(default_factory=list)
    gaps: list[RequirementGap] = Field(default_factory=list)
    match_score: int = 0

