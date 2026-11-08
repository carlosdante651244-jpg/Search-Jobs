import React from 'react'
import {
  TrendingUp,
  Languages,
  Briefcase,
  AlertTriangle,
  Target,
  Layers,
  CheckCircle2,
  Check,
  X,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react'
import { JobAnalysis } from '@/shared/api/types'

interface AnalysisDashboardViewProps {
  analysis: JobAnalysis
  matchScore: number
  onBack?: () => void
  onProceed?: () => void
  backLabel?: string
  proceedLabel?: string
  showActions?: boolean
}

export const AnalysisDashboardView: React.FC<AnalysisDashboardViewProps> = ({
  analysis,
  matchScore,
  onBack,
  onProceed,
  backLabel = 'Edit Description',
  proceedLabel = 'Proceed to Tailoring (Agent 2)',
  showActions = true,
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-emerald-600 bg-emerald-50 border-emerald-200'
    if (score >= 50) return 'text-amber-600 bg-amber-50 border-amber-200'
    return 'text-rose-600 bg-rose-50 border-rose-200'
  }

  const getScoreProgressColor = (score: number) => {
    if (score >= 75) return 'bg-emerald-500'
    if (score >= 50) return 'bg-amber-500'
    return 'bg-rose-500'
  }

  return (
    <div className="space-y-6">
      {/* Top Bar with Role Info & Optional Action Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              Target Role Audited
            </span>
            {analysis.seniority && (
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                {analysis.seniority} Seniority
              </span>
            )}
          </div>
          <h3 className="text-2xl font-black text-slate-900 mt-2">
            {analysis.job_title || 'Position'} {analysis.company ? `at ${analysis.company}` : ''}
          </h3>
        </div>

        {showActions && (
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{backLabel}</span>
              </button>
            )}

            {onProceed && (
              <button
                type="button"
                onClick={onProceed}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold shadow-sm hover:bg-indigo-700 active:scale-[0.98] transition cursor-pointer"
              >
                <span>{proceedLabel}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* ATS Score & Breakdown Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Score Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-slate-900">ATS Match Score</h4>
              <TrendingUp className="w-5 h-5 text-indigo-600" />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Deterministic weighted calculation based on verified evidence in your resume.
            </p>
          </div>

          <div className="my-6 flex items-center justify-center">
            <div
              className={`w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center ${getScoreColor(
                matchScore
              )}`}
            >
              <span className="text-4xl font-black tracking-tight">{matchScore}%</span>
              <span className="text-xs font-bold uppercase tracking-wide">Match</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full space-y-1.5">
            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-700 ${getScoreProgressColor(
                  matchScore
                )}`}
                style={{ width: `${matchScore}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-semibold text-slate-400">
              <span>0%</span>
              <span>Target: 80%+</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Score Formula Weights & Languages */}
        <div className="md:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h4 className="text-base font-bold text-slate-900">Audit Weights & Formula</h4>
            <p className="text-xs text-slate-500 mt-1">
              Agent 1 balances core skills, ATS search keywords, language fluency, and seniority alignment.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Skills</p>
                <p className="text-lg font-black text-slate-800">40%</p>
                <p className="text-[11px] text-slate-500">{analysis.required_skills?.length || 0} required</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Keywords</p>
                <p className="text-lg font-black text-slate-800">30%</p>
                <p className="text-[11px] text-slate-500">{analysis.keywords?.length || 0} extracted</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Language</p>
                <p className="text-lg font-black text-slate-800">15%</p>
                <p className="text-[11px] text-slate-500">
                  {analysis.required_languages?.join(', ') || 'Any language'}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Seniority</p>
                <p className="text-lg font-black text-slate-800">15%</p>
                <p className="text-[11px] text-slate-500">{analysis.seniority || 'General'}</p>
              </div>
            </div>
          </div>

          {/* Languages & Core details */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600">
            <div className="flex items-center gap-1.5">
              <Languages className="w-4 h-4 text-indigo-600" />
              <span>Required Languages:</span>
              <span className="font-bold text-slate-800">
                {analysis.required_languages?.length > 0
                  ? analysis.required_languages.join(', ')
                  : 'Not specified'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-indigo-600" />
              <span>Verified Matches:</span>
              <span className="font-bold text-emerald-600">{analysis.matched?.length || 0}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span>Identified Gaps:</span>
              <span className="font-bold text-rose-600">{analysis.gaps?.length || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Keywords & Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Required Skills & Preferred */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-600" />
            <h4 className="text-base font-bold text-slate-900">Extracted Requirements & Skills</h4>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Required Skills
              </p>
              <div className="flex flex-wrap gap-2">
                {analysis.required_skills?.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-800 rounded-xl text-xs font-semibold"
                  >
                    {skill}
                  </span>
                ))}
                {(!analysis.required_skills || analysis.required_skills.length === 0) && (
                  <span className="text-xs text-slate-400">None explicitly listed</span>
                )}
              </div>
            </div>

            {analysis.preferred_skills && analysis.preferred_skills.length > 0 && (
              <div className="pt-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Preferred / Bonus Skills
                </p>
                <div className="flex flex-wrap gap-2">
                  {analysis.preferred_skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50/60 text-indigo-700 rounded-xl text-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ATS Keywords */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <h4 className="text-base font-bold text-slate-900">Target ATS Keywords</h4>
          </div>
          <p className="text-xs text-slate-500">
            Critical tokens that ATS filters look for in Candidate Resumes.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {analysis.keywords?.map((kw, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                <Check className="w-3.5 h-3.5 text-indigo-600" />
                {kw}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Matched Requirements & Gaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Matched Requirements (with Verified Evidence IDs) */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h4 className="text-base font-bold text-slate-900">
                Matched Requirements ({analysis.matched?.length || 0})
              </h4>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
              Strict Evidence Verified
            </span>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {analysis.matched && analysis.matched.length > 0 ? (
              analysis.matched.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/30 space-y-2"
                >
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-sm font-semibold text-slate-900 leading-snug">
                      {item.requirement}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 pl-6">
                    <span className="text-[11px] text-slate-400 font-medium">Evidence IDs:</span>
                    {item.evidence_ids.map((id, idIdx) => (
                      <span
                        key={idIdx}
                        className="inline-block px-2 py-0.5 bg-white border border-emerald-200 text-emerald-800 rounded-md text-[10px] font-mono font-bold"
                      >
                        {id}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400 py-4 text-center">
                No verified matches detected yet.
              </p>
            )}
          </div>
        </div>

        {/* Identified Gaps */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <X className="w-5 h-5 text-rose-500" />
              <h4 className="text-base font-bold text-slate-900">
                Identified Gaps ({analysis.gaps?.length || 0})
              </h4>
            </div>
            <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg">
              Requires Addressing
            </span>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {analysis.gaps && analysis.gaps.length > 0 ? (
              analysis.gaps.map((gap, idx) => {
                const isHigh = gap.severity === 'high'
                const isMedium = gap.severity === 'medium'
                const badgeClass = isHigh
                  ? 'bg-rose-100 text-rose-800 border-rose-200'
                  : isMedium
                  ? 'bg-amber-100 text-amber-800 border-amber-200'
                  : 'bg-blue-100 text-blue-800 border-blue-200'

                return (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-sm font-semibold text-slate-900 leading-snug">
                        {gap.requirement}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider shrink-0 border ${badgeClass}`}
                      >
                        {gap.severity}
                      </span>
                    </div>

                    {gap.transferable_evidence_ids && gap.transferable_evidence_ids.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-200/60">
                        <span className="text-[11px] text-indigo-600 font-semibold">
                          Transferable candidate evidence:
                        </span>
                        {gap.transferable_evidence_ids.map((id, idIdx) => (
                          <span
                            key={idIdx}
                            className="inline-block px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-md text-[10px] font-mono font-bold"
                          >
                            {id}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })
            ) : (
              <p className="text-sm text-emerald-600 py-4 text-center font-medium">
                No significant gaps identified! Strong alignment.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

