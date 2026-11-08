import React, { useState } from 'react'
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react'

export const CreateCVPage: React.FC = () => {
  const [jobDescription, setJobDescription] = useState('')

  return (
    <div className="w-full space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Create Tailored CV</h2>
        <p className="text-slate-500 mt-1">
          Step 1: Paste the job description you want to apply for.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-1">
            Job Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={10}
            placeholder="Paste LinkedIn or job board post description here..."
            className="w-full rounded-xl border border-slate-200 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
            <span>Anti-hallucination guardrails active</span>
          </div>

          <button
            disabled={!jobDescription.trim()}
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>Start Dual-Agent Analysis</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  )
}

