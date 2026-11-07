import React from 'react'

export const HistoryPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Tailoring History</h2>
        <p className="text-slate-500 mt-1">
          Review past tailoring sessions, match score improvements, and re-download generated CVs.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-sm">
        No tailoring sessions recorded yet. Create your first tailored CV to see your history here!
      </div>
    </div>
  )
}

