import re
from src.search_jobs.domain.entities.master_cv import MasterCV
from src.search_jobs.domain.entities.job_analysis import JobAnalysis


class MatchScorer:
    """Computes a deterministic, weighted ATS match score (0 to 100) based on:

    - 40% Required Skills Match
    - 30% ATS Keywords Match
    - 15% Language Match
    - 15% Seniority Alignment
    """

    @classmethod
    def compute_score(cls, analysis: JobAnalysis, cv: MasterCV) -> int:
        skills_ratio = cls._calc_skills_ratio(analysis, cv)
        keywords_ratio = cls._calc_keywords_ratio(analysis, cv)
        language_ratio = cls._calc_language_ratio(analysis, cv)
        seniority_ratio = cls._calc_seniority_ratio(analysis, cv)

        # Weighted formula
        raw_score = (
            (skills_ratio * 0.40)
            + (keywords_ratio * 0.30)
            + (language_ratio * 0.15)
            + (seniority_ratio * 0.15)
        )

        return max(0, min(100, round(raw_score * 100)))

    @staticmethod
    def _calc_skills_ratio(analysis: JobAnalysis, cv: MasterCV) -> float:
        if not analysis.required_skills:
            return 1.0 if analysis.matched else 0.5

        # Check matched requirements vs required_skills
        matched_texts = " ".join([m.requirement.lower() for m in analysis.matched])
        matched_count = 0

        for skill in analysis.required_skills:
            if re.search(re.escape(skill.lower()), matched_texts):
                matched_count += 1

        return min(1.0, matched_count / len(analysis.required_skills))

    @staticmethod
    def _calc_keywords_ratio(analysis: JobAnalysis, cv: MasterCV) -> float:
        if not analysis.keywords:
            return 0.8  # neutral

        # Build full searchable text from Master CV
        cv_text_tokens = []
        cv_text_tokens.append(cv.summary.lower())
        for exp in cv.experience:
            cv_text_tokens.append(exp.title.lower())
            cv_text_tokens.append(exp.company.lower())
            for bullet in exp.bullets:
                cv_text_tokens.append(bullet.text.lower())
        for skill_cat in cv.skills:
            cv_text_tokens.extend([s.lower() for s in skill_cat.items])

        full_cv_text = " ".join(cv_text_tokens)

        hits = 0
        for kw in analysis.keywords:
            kw_clean = kw.lower().strip()
            if kw_clean and re.search(r"\b" + re.escape(kw_clean) + r"\b", full_cv_text):
                hits += 1

        return min(1.0, hits / len(analysis.keywords))

    @staticmethod
    def _calc_language_ratio(analysis: JobAnalysis, cv: MasterCV) -> float:
        if not analysis.required_languages:
            return 1.0  # No specific language requirement implies full match

        cv_languages = [l.lower() for l in cv.languages]
        # Also check if summary or contact text has clear indicators
        cv_text = cv.summary.lower()

        matched_langs = 0
        for lang in analysis.required_languages:
            lang_clean = lang.lower().strip()
            # Match language name e.g. "english", "spanish", "inglés"
            name_only = lang_clean.split()[0]
            if any(name_only in cv_l for cv_l in cv_languages) or (name_only in cv_text):
                matched_langs += 1

        return min(1.0, matched_langs / len(analysis.required_languages))

    @staticmethod
    def _calc_seniority_ratio(analysis: JobAnalysis, cv: MasterCV) -> float:
        target_seniority = analysis.seniority.lower()
        if not target_seniority or target_seniority == "not specified":
            return 1.0

        # Calculate approximate total years of experience
        years_exp = len(cv.experience) * 2.0  # conservative estimate per role

        if "senior" in target_seniority:
            return 1.0 if years_exp >= 4 else (years_exp / 4.0)
        elif "lead" in target_seniority or "staff" in target_seniority:
            return 1.0 if years_exp >= 6 else (years_exp / 6.0)
        elif "mid" in target_seniority:
            return 1.0 if years_exp >= 2 else 0.8
        elif "junior" in target_seniority or "entry" in target_seniority:
            return 1.0

        return 0.9

