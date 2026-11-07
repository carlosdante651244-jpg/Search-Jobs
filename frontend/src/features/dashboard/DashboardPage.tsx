import React from 'react'
import { Sparkles, FileText, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

export const DashboardPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h2>
        <p className="text-slate-500 mt-1">
          Welcome to Search-Jobs. Tailor your resume to any job description to pass ATS filters.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 text-lg">1. Set Up Master CV</h3>
            <p className="text-sm text-slate-500 mt-2">
              Upload your base resume in .docx or .pdf. Our AI parser structures it into reusable modules.
            </p>
          </div>
          <Link
            to="/master-cv"
            className="mt-6 inline-flex items-center justify-center px-4 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition"
          >
            Manage Master CV
          </Link>
        </div>

        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 text-lg">2. Create Tailored CV</h3>
            <p className="text-sm text-slate-500 mt-2">
              Paste any job post, let our dual AI agents analyze gaps and craft ATS-approved suggestions.
            </p>
          </div>
          <Link
            to="/tools/create-cv"
            className="mt-6 inline-flex items-center justify-center px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
          >
            Start New Tailoring
          </Link>
        </div>
      </div>

      <div className="p-6 bg-slate-100/70 border border-slate-200 rounded-2xl">
        <h4 className="font-semibold text-slate-800 text-sm flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>F0 Setup Ready</span>
        </h4>
        <p className="text-xs text-slate-600 mt-1">
          FastAPI backend, Neon PostgreSQL connection pooler and Gemini AI are configured and operational.
        </p>
      </div>
    </div>
  )
}

