from pydantic import BaseModel, Field

class ContactInfo(BaseModel):
    name: str = ""
    email: str = ""
    phone: str = ""
    location: str = ""
    linkedin: str = ""
    portfolio: str = ""

class BulletPoint(BaseModel):
    id: str
    text: str

class ExperienceItem(BaseModel):
    id: str
    company: str
    title: str
    location: str = ""
    start: str
    end: str | None = None
    bullets: list[BulletPoint] = Field(default_factory=list)
    technologies: list[str] = Field(default_factory=list)

class EducationItem(BaseModel):
    id: str
    institution: str
    degree: str
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

