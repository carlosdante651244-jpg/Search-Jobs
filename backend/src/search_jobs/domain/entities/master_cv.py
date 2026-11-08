from pydantic import BaseModel, Field

class ContactInfo(BaseModel):
    name: str = ""
    email: str = ""
    phone: str = ""
    location: str = ""
    linkedin: str = ""
    portfolio: str = ""

class BulletPoint(BaseModel):
    id: str = ""
    text: str = ""

class ExperienceItem(BaseModel):
    id: str = ""
    company: str = ""
    title: str = ""
    location: str = ""
    start: str = ""
    end: str | None = None
    bullets: list[BulletPoint] = Field(default_factory=list)
    technologies: list[str] = Field(default_factory=list)

class EducationItem(BaseModel):
    id: str = ""
    institution: str = ""
    degree: str = ""
    start: str = ""
    end: str = ""

class SkillCategory(BaseModel):
    category: str
    items: list[str] = Field(default_factory=list)

class MasterCV(BaseModel):
    contact: ContactInfo = Field(default_factory=ContactInfo)
    summary: str = ""
    experience: list[ExperienceItem] = Field(default_factory=list)
    education: list[EducationItem] = Field(default_factory=list)
    skills: list[SkillCategory] = Field(default_factory=list)
    certifications: list[str] = Field(default_factory=list)
    projects: list[str] = Field(default_factory=list)
    languages: list[str] = Field(default_factory=list)


def normalize_ids(cv: MasterCV) -> MasterCV:
    """Keep element identifiers deterministic so later suggestions can target them."""
    for index, experience in enumerate(cv.experience, start=1):
        experience.id = experience.id or f"exp_{index}"
        for bullet_index, bullet in enumerate(experience.bullets, start=1):
            bullet.id = bullet.id or f"{experience.id}_b{bullet_index}"
    for index, education in enumerate(cv.education, start=1):
        education.id = education.id or f"edu_{index}"
    return cv
