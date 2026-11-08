import re
from src.search_jobs.domain.entities.master_cv import (
    BulletPoint,
    ContactInfo,
    EducationItem,
    ExperienceItem,
    MasterCV,
    SkillCategory,
    normalize_ids,
)

# Common section headers in English and Spanish
SECTION_PATTERNS = {
    "summary": [
        r"summary", r"professional\s+summary", r"about\s+me", r"profile",
        r"perfil", r"resumen", r"perfil\s+profesional", r"sobre\s+m[ií]"
    ],
    "experience": [
        r"experience", r"work\s+experience", r"employment\s+history", r"professional\s+experience",
        r"experiencia", r"experiencia\s+laboral", r"experiencia\s+profesional", r"trayectoria"
    ],
    "education": [
        r"education", r"academic\s+background", r"qualifications",
        r"educaci[oó]n", r"formaci[oó]n", r"estudios", r"formaci[oó]n\s+acad[eé]mica"
    ],
    "skills": [
        r"skills", r"technical\s+skills", r"competencies", r"technologies", r"tools",
        r"habilidades", r"conocimientos", r"competencias", r"tecnolog[ií]as"
    ],
    "certifications": [
        r"certifications", r"certificates", r"courses", r"licenses",
        r"certificaciones", r"certificados", r"cursos", r"licencias"
    ],
    "languages": [
        r"languages", r"idiomas"
    ],
    "projects": [
        r"projects", r"personal\s+projects", r"key\s+projects",
        r"proyectos", r"proyectos\s+destacados"
    ]
}

EMAIL_REGEX = re.compile(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+")
PHONE_REGEX = re.compile(r"(\+?\d{1,3}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,5}")
URL_LINKEDIN = re.compile(r"(https?://)?(www\.)?linkedin\.com/in/[a-zA-Z0-9_-]+", re.IGNORECASE)
URL_GENERIC = re.compile(r"https?://[a-zA-Z0-9./_-]+", re.IGNORECASE)
DATE_REGEX = re.compile(r"((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)[a-z]*\.?\s*\d{2,4}|\d{4})\s*(?:-|–|to|al|a)\s*((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)[a-z]*\.?\s*\d{2,4}|\d{4}|present|actualidad|presente)", re.IGNORECASE)


class HeuristicCVParser:
    """Deterministic, rule-based CV parser that extracts structured CV data without calling any external AI API."""

    def parse(self, text: str) -> MasterCV:
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        if not lines:
            return MasterCV()

        contact = self._extract_contact(lines)
        sections = self._split_sections(lines)

        summary = self._extract_summary(sections.get("summary", []))
        experience = self._extract_experience(sections.get("experience", []))
        education = self._extract_education(sections.get("education", []))
        skills = self._extract_skills(sections.get("skills", []))
        certifications = self._extract_simple_list(sections.get("certifications", []))
        languages = self._extract_simple_list(sections.get("languages", []))
        projects = self._extract_simple_list(sections.get("projects", []))

        cv = MasterCV(
            contact=contact,
            summary=summary,
            experience=experience,
            education=education,
            skills=skills,
            certifications=certifications,
            languages=languages,
            projects=projects,
        )
        return normalize_ids(cv)

    def _extract_contact(self, lines: list[str]) -> ContactInfo:
        contact = ContactInfo()
        full_text = " ".join(lines[:15])

        # Email
        email_match = EMAIL_REGEX.search(full_text)
        if email_match:
            contact.email = email_match.group(0)

        # Phone
        phone_match = PHONE_REGEX.search(full_text)
        if phone_match and len(phone_match.group(0).strip()) >= 7:
            contact.phone = phone_match.group(0).strip()

        # LinkedIn
        li_match = URL_LINKEDIN.search(full_text)
        if li_match:
            contact.linkedin = li_match.group(0)

        # Name: typically the first non-empty line that doesn't contain email/phone/url
        for line in lines[:5]:
            if not EMAIL_REGEX.search(line) and not URL_GENERIC.search(line) and len(line.split()) <= 5:
                # Basic check: looks like a person's name
                cleaned = re.sub(r"[^\w\s]", "", line).strip()
                if cleaned and not any(ch.isdigit() for ch in cleaned):
                    contact.name = line.strip()
                    break

        return contact

    def _split_sections(self, lines: list[str]) -> dict[str, list[str]]:
        sections: dict[str, list[str]] = {}
        current_section = "summary"  # default preamble
        sections[current_section] = []

        for line in lines:
            normalized_line = re.sub(r"[^\w\s]", "", line.lower()).strip()
            detected_sec = None

            # Check if this line is a section heading
            for sec_name, patterns in SECTION_PATTERNS.items():
                for pat in patterns:
                    if re.fullmatch(pat, normalized_line):
                        detected_sec = sec_name
                        break
                if detected_sec:
                    break

            if detected_sec:
                current_section = detected_sec
                if current_section not in sections:
                    sections[current_section] = []
            else:
                sections[current_section].append(line)

        return sections

    def _extract_summary(self, lines: list[str]) -> str:
        # Ignore lines that look like contact info
        valid = [l for l in lines if not EMAIL_REGEX.search(l) and not URL_GENERIC.search(l)]
        return " ".join(valid).strip()

    def _extract_experience(self, lines: list[str]) -> list[ExperienceItem]:
        items: list[ExperienceItem] = []
        current_exp: ExperienceItem | None = None

        for line in lines:
            date_match = DATE_REGEX.search(line)
            is_bullet = bool(re.match(r"^[\s•\-*–\d\.]+\s+", line))

            # If line has a date or looks like a title/company header
            if date_match and not is_bullet:
                if current_exp and (current_exp.company or current_exp.title):
                    items.append(current_exp)

                dates = date_match.group(0)
                cleaned_line = line.replace(dates, "").strip(" -|,")
                parts = [p.strip() for p in re.split(r"[-|•,]", cleaned_line) if p.strip()]

                title = parts[0] if parts else "Position"
                company = parts[1] if len(parts) > 1 else ""

                start_date = date_match.group(1).strip()
                end_date = date_match.group(2).strip()

                current_exp = ExperienceItem(
                    id=f"exp_{len(items) + 1}",
                    company=company,
                    title=title,
                    start=start_date,
                    end=end_date,
                    bullets=[],
                    technologies=[],
                )
            elif is_bullet:
                bullet_text = re.sub(r"^[\s•\-*–\d\.]+\s*", "", line).strip()
                if not current_exp:
                    current_exp = ExperienceItem(
                        id=f"exp_{len(items) + 1}",
                        company="",
                        title="Experience",
                        start="",
                        bullets=[],
                        technologies=[],
                    )
                if bullet_text:
                    b_id = f"{current_exp.id}_b{len(current_exp.bullets) + 1}"
                    current_exp.bullets.append(BulletPoint(id=b_id, text=bullet_text))
            elif current_exp:
                # Continuation text or details
                if len(current_exp.bullets) > 0:
                    current_exp.bullets[-1].text += f" {line}"
                else:
                    if not current_exp.company and line != current_exp.title:
                        current_exp.company = line

        if current_exp and (current_exp.company or current_exp.title or current_exp.bullets):
            items.append(current_exp)

        return items

    def _extract_education(self, lines: list[str]) -> list[EducationItem]:
        items: list[EducationItem] = []
        current_edu: EducationItem | None = None

        for line in lines:
            date_match = DATE_REGEX.search(line)
            is_bullet = bool(re.match(r"^[\s•\-*–\d\.]+\s+", line))

            if date_match:
                if current_edu:
                    items.append(current_edu)
                dates = date_match.group(0)
                cleaned = line.replace(dates, "").strip(" -|,")
                parts = [p.strip() for p in re.split(r"[-|•,]", cleaned) if p.strip()]
                degree = parts[0] if parts else line
                institution = parts[1] if len(parts) > 1 else ""
                current_edu = EducationItem(
                    id=f"edu_{len(items) + 1}",
                    institution=institution,
                    degree=degree,
                    start=date_match.group(1).strip(),
                    end=date_match.group(2).strip(),
                )
            elif not is_bullet:
                if not current_edu:
                    current_edu = EducationItem(
                        id=f"edu_{len(items) + 1}",
                        institution="",
                        degree=line,
                    )
                elif not current_edu.institution:
                    current_edu.institution = line

        if current_edu:
            items.append(current_edu)

        return items

    def _extract_skills(self, lines: list[str]) -> list[SkillCategory]:
        items = []
        for line in lines:
            cleaned = re.sub(r"^[\s•\-*–\d\.]+\s*", "", line)
            # Split comma separated skills
            parts = [p.strip() for p in re.split(r"[,|•;]", cleaned) if p.strip()]
            items.extend(parts)

        if items:
            return [SkillCategory(category="General Skills", items=items)]
        return []

    def _extract_simple_list(self, lines: list[str]) -> list[str]:
        items = []
        for line in lines:
            cleaned = re.sub(r"^[\s•\-*–\d\.]+\s*", "", line).strip()
            if cleaned:
                items.append(cleaned)
        return items

