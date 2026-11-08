from unittest.mock import MagicMock
from src.search_jobs.domain.entities.job_analysis import (
    JobAnalysis,
    MatchedRequirement,
    RequirementGap,
)
from src.search_jobs.domain.entities.master_cv import (
    BulletPoint,
    ContactInfo,
    ExperienceItem,
    MasterCV,
    SkillCategory,
)
from src.search_jobs.domain.services.evidence_validator import EvidenceValidator
from src.search_jobs.domain.services.match_scorer import MatchScorer
from src.search_jobs.infrastructure.ai.gemini.job_analyzer import GeminiJobAnalyzer


def sample_cv() -> MasterCV:
    return MasterCV(
        contact=ContactInfo(
            name="John Doe",
            email="john@example.com",
            phone="+123456789",
            location="Remote",
            linkedin="",
            portfolio="",
        ),
        summary="Senior Software Engineer with 7 years of experience in Python and FastAPI.",
        experience=[
            ExperienceItem(
                id="exp_1",
                company="TechCorp",
                title="Senior Backend Engineer",
                start="2020",
                end=None,
                bullets=[
                    BulletPoint(id="exp_1_b1", text="Built microservices using Python, Docker, and PostgreSQL."),
                    BulletPoint(id="exp_1_b2", text="Optimized SQL queries reducing latency by 45%."),
                ],
                technologies=["Python", "FastAPI", "Docker", "PostgreSQL"],
            )
        ],
        education=[],
        skills=[
            SkillCategory(category="Languages", items=["Python", "TypeScript", "SQL"]),
            SkillCategory(category="Frameworks", items=["FastAPI", "React"]),
        ],
        certifications=[],
        projects=[],
        languages=["English", "Spanish"],
    )


def test_evidence_validator_sanitizes_fake_ids():
    cv = sample_cv()

    analysis = JobAnalysis(
        job_title="Senior Python Engineer",
        company="Acme",
        seniority="Senior",
        required_skills=["Python", "Kubernetes"],
        matched=[
            MatchedRequirement(
                requirement="Python backend development",
                evidence_ids=["exp_1_b1", "fake_id_999"],  # fake_id should be removed, exp_1_b1 remains
            ),
            MatchedRequirement(
                requirement="Kubernetes cluster orchestration",
                evidence_ids=["hallucinated_exp_99"],  # Entirely fake -> should be moved to gaps
            ),
        ],
        gaps=[
            RequirementGap(
                requirement="AWS Cloud",
                severity="medium",
                transferable_evidence_ids=["exp_1_b1", "non_existent_id"],
            )
        ],
    )

    sanitized = EvidenceValidator.sanitize_analysis(analysis, cv)

    # 1. First matched should only have valid evidence
    assert len(sanitized.matched) == 1
    assert sanitized.matched[0].requirement == "Python backend development"
    assert sanitized.matched[0].evidence_ids == ["exp_1_b1"]

    # 2. Kubernetes requirement moved to gaps with high severity
    gap_requirements = [g.requirement for g in sanitized.gaps]
    assert "Kubernetes cluster orchestration" in gap_requirements

    # 3. Non-existent transferable ID cleaned up
    aws_gap = next(g for g in sanitized.gaps if g.requirement == "AWS Cloud")
    assert aws_gap.transferable_evidence_ids == ["exp_1_b1"]


def test_match_scorer_computes_weighted_score():
    cv = sample_cv()

    analysis = JobAnalysis(
        job_title="Senior Python Engineer",
        seniority="Senior",
        required_skills=["Python", "PostgreSQL"],
        keywords=["Python", "Docker", "PostgreSQL", "Kafka"],
        required_languages=["English"],
        matched=[
            MatchedRequirement(requirement="Python", evidence_ids=["exp_1_b1"]),
            MatchedRequirement(requirement="PostgreSQL", evidence_ids=["exp_1_b1"]),
        ],
        gaps=[],
    )

    score = MatchScorer.compute_score(analysis, cv)
    # Skills: 2/2 = 1.0 (40%)
    # Keywords: Python(hit), Docker(hit), PostgreSQL(hit), Kafka(miss) -> 3/4 = 0.75 (30% -> 22.5%)
    # Languages: English(hit) -> 1.0 (15%)
    # Seniority: Senior with exp -> ~0.5 to 1.0
    # Expected score around 80 - 90
    assert 70 <= score <= 100


def test_gemini_job_analyzer_pipeline():
    cv = sample_cv()

    mock_client = MagicMock()
    mock_response = MagicMock()
    mock_response.parsed = JobAnalysis(
        job_title="Senior Python Engineer",
        company="Startup Co",
        seniority="Senior",
        required_skills=["Python"],
        keywords=["Python", "Docker"],
        required_languages=["Spanish"],
        matched=[
            MatchedRequirement(requirement="Python experience", evidence_ids=["exp_1_b1"])
        ],
        gaps=[],
        match_score=0,
    )
    mock_client.models.generate_content.return_value = mock_response

    analyzer = GeminiJobAnalyzer(client=mock_client)
    result = analyzer.analyze(cv, "Looking for a Senior Python engineer who speaks Spanish.")

    assert result.job_title == "Senior Python Engineer"
    assert result.match_score > 0  # Deterministically computed
    assert len(result.matched) == 1

