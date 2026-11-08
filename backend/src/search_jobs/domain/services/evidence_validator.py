from src.search_jobs.domain.entities.master_cv import MasterCV
from src.search_jobs.domain.entities.job_analysis import JobAnalysis


class EvidenceValidator:
    """Validates that all evidence IDs cited in the analysis truly exist in the candidate's Master CV."""

    @staticmethod
    def collect_valid_ids(cv: MasterCV) -> set[str]:
        valid_ids: set[str] = set()

        # Experience IDs and bullet IDs
        for exp in cv.experience:
            if exp.id:
                valid_ids.add(exp.id)
            for bullet in exp.bullets:
                if bullet.id:
                    valid_ids.add(bullet.id)

        # Education IDs
        for edu in cv.education:
            if edu.id:
                valid_ids.add(edu.id)

        return valid_ids

    @classmethod
    def sanitize_analysis(cls, analysis: JobAnalysis, cv: MasterCV) -> JobAnalysis:
        valid_ids = cls.collect_valid_ids(cv)

        # Filter matched items: only keep evidence_ids that really exist
        sanitized_matched = []
        for match in analysis.matched:
            filtered_ids = [eid for eid in match.evidence_ids if eid in valid_ids]
            if filtered_ids:
                match.evidence_ids = filtered_ids
                sanitized_matched.append(match)
            else:
                # If evidence doesn't exist, it wasn't a valid match; move to gaps
                analysis.gaps.append(
                    type(analysis.gaps[0] if analysis.gaps else match)(
                        requirement=match.requirement,
                        severity="high",
                        transferable_evidence_ids=[]
                    )
                )

        analysis.matched = sanitized_matched

        # Sanitize gaps transferable IDs
        for gap in analysis.gaps:
            gap.transferable_evidence_ids = [
                eid for eid in gap.transferable_evidence_ids if eid in valid_ids
            ]

        return analysis

