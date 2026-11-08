import React, { useState } from 'react'
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { MasterCVHistoryItem, CVSession, JobAnalysis } from '@/shared/api/types'
import { AnalysisDashboardView } from './AnalysisDashboardView'

export const CreateCVPage: React.FC = () => {
  const [step, setStep] = useState<1 | 2>(1)
  const [jobDescription, setJobDescription] = useState('')
  const [selectedCvId, setSelectedCvId] = useState<string>('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [sessionData, setSessionData] = useState<CVSession | null>(null)

  // Fetch available Master CVs from history/database
  const { data: masterCvs, isLoading } = useQuery<MasterCVHistoryItem[]>({
    queryKey: ['master-cv-history'],
    queryFn: async () => {
      const response = await fetch('/api/v1/master-cv/history')
      if (!response.ok) throw new Error('Could not load Master CVs.')
      return response.json()
    },
  })

  // Set default selected CV to the most recent one if available
  React.useEffect(() => {
    if (masterCvs && masterCvs.length > 0 && !selectedCvId) {
      setSelectedCvId(masterCvs[0].id)
    }
  }, [masterCvs, selectedCvId])

  const handleStartAnalysis = async () => {
    if (!selectedCvId || !jobDescription.trim()) return

    setIsAnalyzing(true)
    setAnalysisError(null)

    try {
      const response = await fetch('/api/v1/sessions/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          master_cv_id: selectedCvId,
          job_description: jobDescription,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || 'Analysis failed. Please check backend connection.')
      }

      const session: CVSession = await response.json()
      setSessionData(session)
      setStep(2)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred during analysis.'
      setAnalysisError(msg)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const analysis: JobAnalysis | undefined = sessionData?.analysis || undefined
  const matchScore = sessionData?.score_before ?? analysis?.match_score ?? 0

  return (
    <div className="w-full space-y-8 pb-16">
      {/* Header & Steps Indicator */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Create Tailored CV
          </h2>
          <p className="mt-1 text-base text-slate-500">
            Audit your resume against any target role with strict zero-hallucination validation.
          </p>
        </div>

        {/* Wizard Steps Nav */}
        <div className="inline-flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-600 self-start">
          <div
            className={`px-3.5 py-1.5 rounded-xl transition ${
              step === 1 ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500'
            }`}
          >
            1. Role & CV Input
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          <div
            className={`px-3.5 py-1.5 rounded-xl transition ${
              step === 2 ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-400'
            }`}
          >
            2. ATS Audit & Match
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
          <div className="px-3.5 py-1.5 text-slate-300 cursor-not-allowed">
            3. Suggestions (Agent 2)
          </div>
        </div>
      </div>

      {analysisError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{analysisError}</span>
        </div>
      )}

      {/* STEP 1: CV SELECTION & JOB POST INPUT */}
      {step === 1 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xs space-y-7">
          {/* Step 1: Select Master CV */}
          <div className="space-y-3">
            <label className="block text-base font-bold text-slate-900">
              1. Select Master CV to Compare & Tailor <span className="text-rose-500">*</span>
            </label>

            {isLoading ? (
              <p className="text-sm text-slate-400">Loading saved resumes...</p>
            ) : masterCvs && masterCvs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {masterCvs.map((cv) => {
                  const isSelected = selectedCvId === cv.id
                  return (
                    <div
                      key={cv.id}
                      onClick={() => setSelectedCvId(cv.id)}
                      className={`cursor-pointer rounded-2xl border-2 p-5 transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                          : 'border-slate-200 bg-slate-50/40 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2.5 rounded-xl ${
                              isSelected
                                ? 'bg-indigo-600 text-white'
                                : 'bg-indigo-50 text-indigo-600'
                            }`}
                          >
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="truncate">
                            <p className="font-bold text-slate-900 text-base truncate">
                              {cv.name || cv.source_file_name || `Version ${cv.version}`}
                            </p>
                            <p className="text-xs text-slate-500 font-medium">Version {cv.version}</p>
                          </div>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                        )}
                      </div>

                      <p className="mt-4 text-[11px] font-medium text-slate-400">
                        Saved {new Date(cv.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                No Master CVs found. Please upload one in the <strong>Master CV</strong> tab first.
              </div>
            )}
          </div>

          {/* Step 2: Job Description */}
          <div className="space-y-2 pt-2">
            <label className="block text-base font-bold text-slate-900">
              2. Target Job Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={9}
              placeholder="Paste the full job post details from LinkedIn or job board here..."
              className="w-full rounded-2xl border border-slate-200 p-5 text-base text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100/60 leading-relaxed font-normal"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-100">
            <div className="flex items-center space-x-2 text-sm text-slate-500">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <span className="font-medium">Strict Anti-Hallucination & Scoring Guardrails active</span>
            </div>

            <button
              onClick={handleStartAnalysis}
              disabled={!jobDescription.trim() || !selectedCvId || isAnalyzing}
              className="inline-flex items-center space-x-2.5 px-7 py-4 bg-indigo-600 text-white rounded-xl text-base font-bold shadow-md hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Agent 1 Auditing Requirements...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Analyze & Calculate Match Score</span>
                  <ArrowRight className="w-5 h-5 ml-1" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: AGENT 1 AUDIT & MATCH ANALYSIS */}
      {step === 2 && analysis && (
        <AnalysisDashboardView
          analysis={analysis}
          matchScore={matchScore}
          onBack={() => setStep(1)}
          onProceed={() => alert('Agent 2 (Advisor) will be wired next in Phase 3!')}
        />
      )}
    </div>
  )
}
