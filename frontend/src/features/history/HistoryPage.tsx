import React, { useState } from 'react'
import {
  Briefcase,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  FileText,
  User,
  X,
  TrendingUp,
  Sparkles,
  Eye,
  Clock,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { MasterCVHistoryItem, CVSession } from '@/shared/api/types'
import { AnalysisDashboardView } from '@/features/create-cv/AnalysisDashboardView'

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'master-resumes' | 'job-audits'>('job-audits')
  const [selectedVersion, setSelectedVersion] = useState<MasterCVHistoryItem | null>(null)
  const [selectedSession, setSelectedSession] = useState<CVSession | null>(null)
  const [showAllVersions, setShowAllVersions] = useState(false)
  const [showAllAudits, setShowAllAudits] = useState(false)

  // 1. Fetch Master CV History
  const {
    data: masterCvData,
    isLoading: isCvLoading,
    isError: isCvError,
  } = useQuery<MasterCVHistoryItem[]>({
    queryKey: ['master-cv-history'],
    queryFn: async () => {
      const response = await fetch('/api/v1/master-cv/history')
      if (!response.ok) throw new Error('Could not load Master CV history.')
      return response.json()
    },
  })

  // 2. Fetch Job Audit Sessions
  const {
    data: sessionsData,
    isLoading: isSessionsLoading,
    isError: isSessionsError,
  } = useQuery<CVSession[]>({
    queryKey: ['cv-sessions'],
    queryFn: async () => {
      const response = await fetch('/api/v1/sessions')
      if (!response.ok) throw new Error('Could not load Job Audit sessions.')
      return response.json()
    },
  })

  // Master CV pagination
  const displayedVersions = masterCvData
    ? showAllVersions
      ? masterCvData
      : masterCvData.slice(0, 10)
    : []
  const hasMoreThan10Versions = masterCvData && masterCvData.length > 10

  // Job Audits pagination
  const displayedSessions = sessionsData
    ? showAllAudits
      ? sessionsData
      : sessionsData.slice(0, 10)
    : []
  const hasMoreThan10Audits = sessionsData && sessionsData.length > 10

  const getScoreBadge = (score: number | null | undefined) => {
    if (score == null) return null
    if (score >= 75) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
          <TrendingUp className="w-3.5 h-3.5" />
          {score}% MATCH
        </span>
      )
    }
    if (score >= 50) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-black bg-amber-100 text-amber-800 border border-amber-200">
          <TrendingUp className="w-3.5 h-3.5" />
          {score}% MATCH
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-black bg-rose-100 text-rose-800 border border-rose-200">
        <TrendingUp className="w-3.5 h-3.5" />
        {score}% MATCH
      </span>
    )
  }

  return (
    <div className="w-full space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Activity & History
          </h2>
          <p className="mt-1 text-base text-slate-500">
            Track past job audit dashboards, ATS scores, and base resume versions.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex items-center p-1.5 bg-slate-100 rounded-2xl border border-slate-200 self-start">
          <button
            type="button"
            onClick={() => setActiveTab('job-audits')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer ${
              activeTab === 'job-audits'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Job Audits & Dashboards</span>
            {sessionsData && sessionsData.length > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full text-[11px] bg-indigo-50 text-indigo-600 font-extrabold">
                {sessionsData.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('master-resumes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer ${
              activeTab === 'master-resumes'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Master Resumes</span>
            {masterCvData && masterCvData.length > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full text-[11px] bg-slate-200 text-slate-700 font-extrabold">
                {masterCvData.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* TAB 1: JOB AUDITS & DASHBOARDS */}
      {activeTab === 'job-audits' && (
        <div className="space-y-6">
          {isSessionsLoading && (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-base text-slate-500">
              Loading audited job sessions...
            </div>
          )}

          {isSessionsError && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-base text-rose-800">
              Could not load Job Audit sessions from database.
            </div>
          )}

          {!isSessionsLoading && !isSessionsError && (!sessionsData || sessionsData.length === 0) && (
            <div className="rounded-3xl border border-slate-200 bg-white p-16 text-center space-y-4">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <TrendingUp className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">No Job Audits recorded yet</h3>
              <p className="text-base text-slate-500 max-w-md mx-auto">
                Audit your resume against a target job posting to see match scores, skills analysis, and verified evidence.
              </p>
              <button
                type="button"
                onClick={() => navigate('/tools/create-cv')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-sm hover:bg-indigo-700 transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Create First Job Audit</span>
              </button>
            </div>
          )}

          {!isSessionsLoading && !isSessionsError && sessionsData && sessionsData.length > 0 && (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs">
                <div className="divide-y divide-slate-100">
                  {displayedSessions.map((session) => {
                    const title = session.role_title || session.analysis?.job_title || 'Position Analysis'
                    const company = session.company || session.analysis?.company
                    const score = session.score_before ?? session.analysis?.match_score

                    return (
                      <div
                        key={session.id}
                        onClick={() => setSelectedSession(session)}
                        className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 transition hover:bg-indigo-50/40 cursor-pointer"
                      >
                        <div className="flex items-start sm:items-center gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
                            <TrendingUp className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2.5">
                              <span className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition">
                                {title}
                              </span>
                              {company && (
                                <span className="text-sm font-semibold text-slate-500">
                                  at {company}
                                </span>
                              )}
                              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                                {session.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 font-medium">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {new Date(session.created_at).toLocaleString([], {
                                  dateStyle: 'medium',
                                  timeStyle: 'short',
                                })}
                              </span>
                              <span>•</span>
                              <span>Base CV v{session.master_cv_version}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 self-end sm:self-center">
                          {getScoreBadge(score)}

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedSession(session)
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition group-hover:bg-indigo-600 group-hover:text-white cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View Dashboard</span>
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Show All / Hide All Button */}
              {hasMoreThan10Audits && (
                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAllAudits(!showAllAudits)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-indigo-600 active:scale-[0.98] cursor-pointer"
                  >
                    {showAllAudits ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        <span>Hide Older Audits (Show Top 10)</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        <span>Show All Audits ({sessionsData.length} total)</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MASTER RESUMES */}
      {activeTab === 'master-resumes' && (
        <div className="space-y-6">
          {isCvLoading && (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-base text-slate-500">
              Loading resume history...
            </div>
          )}

          {isCvError && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-base text-rose-800">
              Could not load Master CV history from database.
            </div>
          )}

          {!isCvLoading && !isCvError && (!masterCvData || masterCvData.length === 0) && (
            <div className="rounded-3xl border border-slate-200 bg-white p-16 text-center text-base text-slate-400">
              No Master CV versions recorded yet. Upload your first resume in the Master CV tab!
            </div>
          )}

          {!isCvLoading && !isCvError && masterCvData && masterCvData.length > 0 && (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs">
                <div className="divide-y divide-slate-100">
                  {displayedVersions.map((item, index) => {
                    const isLatest = index === 0
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedVersion(item)}
                        className="group flex cursor-pointer items-center justify-between gap-6 p-6 transition hover:bg-indigo-50/40"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
                            <FileText className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2.5">
                              <span className="text-lg font-bold text-slate-900">
                                {item.name || `Version ${item.version}`}
                              </span>
                              {isLatest && (
                                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                                  Current Active
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-500">
                              {item.source_file_name || `Resume v${item.version}`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <time className="text-sm font-medium text-slate-400" dateTime={item.updated_at}>
                            {new Date(item.updated_at).toLocaleString([], {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </time>
                          <span className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-3.5 py-2 text-sm font-semibold text-slate-700 transition group-hover:bg-indigo-600 group-hover:text-white">
                            View Details
                            <ChevronRight className="h-4 w-4" />
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Show All / Hide All Button */}
              {hasMoreThan10Versions && (
                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAllVersions(!showAllVersions)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-indigo-600 active:scale-[0.98] cursor-pointer"
                  >
                    {showAllVersions ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        <span>Hide Older Versions (Show Top 10)</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        <span>Show All Versions ({masterCvData.length} total)</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: JOB AUDIT DASHBOARD VIEW */}
      {selectedSession && selectedSession.analysis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 sm:p-6 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative flex max-h-[92vh] w-full max-w-5xl flex-col rounded-3xl bg-slate-50 shadow-2xl overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 p-6 bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white font-bold">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-extrabold text-slate-900">
                      Job Audit Dashboard
                    </h3>
                    {selectedSession.score_before != null && getScoreBadge(selectedSession.score_before)}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Analyzed on {new Date(selectedSession.created_at).toLocaleString()} • Master CV v{selectedSession.master_cv_version}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedSession(null)}
                  className="rounded-xl p-2.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Content: Analysis Dashboard View */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8">
              <AnalysisDashboardView
                analysis={selectedSession.analysis}
                matchScore={selectedSession.score_before ?? selectedSession.analysis.match_score ?? 0}
                showActions={false}
              />
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-slate-200 p-5 bg-white shrink-0">
              <span className="text-xs font-semibold text-slate-500">
                Session ID: <code className="text-slate-700 font-mono text-[11px]">{selectedSession.id}</code>
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedSession(null)}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Close Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: MASTER CV PREVIEW */}
      {selectedVersion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-3xl bg-white shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-6 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold">
                  v{selectedVersion.version}
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">
                    {selectedVersion.name || `Version ${selectedVersion.version} Details`}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Saved on {new Date(selectedVersion.updated_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVersion(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {/* Contact Information */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-3">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                  <User className="h-4 w-4 text-indigo-600" />
                  <span>Personal Contact</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-700">
                  <p><span className="font-semibold text-slate-900">Name:</span> {selectedVersion.data?.contact.name || 'Not provided'}</p>
                  <p><span className="font-semibold text-slate-900">Email:</span> {selectedVersion.data?.contact.email || 'Not provided'}</p>
                  <p><span className="font-semibold text-slate-900">Phone:</span> {selectedVersion.data?.contact.phone || 'Not provided'}</p>
                  <p><span className="font-semibold text-slate-900">Location:</span> {selectedVersion.data?.contact.location || 'Not provided'}</p>
                  {selectedVersion.data?.contact.linkedin && (
                    <p className="sm:col-span-2 truncate">
                      <span className="font-semibold text-slate-900">LinkedIn:</span> {selectedVersion.data.contact.linkedin}
                    </p>
                  )}
                </div>
              </div>

              {/* Summary */}
              {selectedVersion.data?.summary && (
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-base">Professional Summary</h4>
                  <p className="text-sm leading-relaxed text-slate-600 bg-white p-4 rounded-2xl border border-slate-200">
                    {selectedVersion.data.summary}
                  </p>
                </div>
              )}

              {/* Work Experience */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                  <Briefcase className="h-4 w-4 text-indigo-600" />
                  <span>Work Experience ({selectedVersion.data?.experience.length || 0})</span>
                </div>

                <div className="space-y-4">
                  {selectedVersion.data?.experience.map((exp) => (
                    <div key={exp.id} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-2xs">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-base font-bold text-slate-900">{exp.title}</p>
                          <p className="text-sm font-medium text-indigo-600">{exp.company} {exp.location && `· ${exp.location}`}</p>
                        </div>
                        <span className="text-xs font-semibold text-slate-400 mt-1 sm:mt-0">
                          {exp.start} — {exp.end || 'Present'}
                        </span>
                      </div>

                      {exp.bullets.length > 0 && (
                        <ul className="space-y-1.5 pt-1">
                          {exp.bullets.map((b) => (
                            <li key={b.id} className="flex items-start gap-2 text-sm text-slate-600 leading-relaxed">
                              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                              <span>{b.text}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}

                  {(!selectedVersion.data?.experience || selectedVersion.data.experience.length === 0) && (
                    <p className="text-sm text-slate-400 italic">No experience items registered in this version.</p>
                  )}
                </div>
              </div>

              {/* Skills */}
              {selectedVersion.data?.skills && selectedVersion.data.skills.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-base">Skills & Technologies</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedVersion.data.skills.flatMap((s) => s.items).map((skill, idx) => (
                      <span key={idx} className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end border-t border-slate-100 p-5 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setSelectedVersion(null)}
                className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
