export interface ContactInfo {
  name: string
  email: string
  phone: string
  location: string
  linkedin: string
  portfolio: string
}

export interface BulletPoint {
  id: string
  text: string
}

export interface ExperienceItem {
  id: string
  company: string
  title: string
  location?: string
  start: string
  end?: string | null
  bullets: BulletPoint[]
  technologies: string[]
}

export interface EducationItem {
  id: string
  institution: string
  degree: string
  start: string
  end: string
}

export interface SkillCategory {
  category: string
  items: string[]
}

export interface MasterCV {
  contact: ContactInfo
  summary: string
  experience: ExperienceItem[]
  education: EducationItem[]
  skills: SkillCategory[]
  certifications: string[]
  projects: string[]
  languages: string[]
}

export interface MasterCVResponse {
  id: string
  version: number
  data: MasterCV
}

export interface MasterCVHistoryItem {
  id: string
  version: number
  source_file_name?: string | null
  source_file_type?: string | null
  created_at: string
  updated_at: string
}

export interface MatchedRequirement {
  requirement: string
  evidence_ids: string[]
}

export interface RequirementGap {
  requirement: string
  severity: 'high' | 'medium' | 'low'
  transferable_evidence_ids: string[]
}

export interface JobAnalysis {
  job_title: string
  company: string
  seniority: string
  required_skills: string[]
  preferred_skills: string[]
  keywords: string[]
  responsibilities: string[]
  matched: MatchedRequirement[]
  gaps: RequirementGap[]
  match_score: number
}

export type SuggestionAction = 'ADD' | 'REMOVE' | 'REWRITE' | 'REORDER'
export type SuggestionStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EDITED'

export interface Suggestion {
  id: string
  session_id: string
  action: SuggestionAction
  section: string
  target_id: string
  before_text?: string | null
  after_text?: string | null
  reason: string
  source_evidence_ids: string[]
  keywords_covered: string[]
  status: SuggestionStatus
  user_edit?: string | null
}

export interface ApiHealthResponse {
  status: string
  database: string
  environment: string
  model: string
}
