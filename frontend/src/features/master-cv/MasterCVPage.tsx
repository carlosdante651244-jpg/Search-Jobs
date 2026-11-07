import React from 'react'
import { FileUp, Info } from 'lucide-react'

export const MasterCVPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Master CV</h2>
        <p className="text-slate-500 mt-1">
          Your source of truth. All tailored resumes will only use verified experience from this base document.
        </p>
      </div>

      <div className="p-12 border-2 border-dashed border-slate-300 rounded-2xl bg-white text-center hover:border-indigo-400 transition cursor-pointer">
        <div className="w-12 h-12 mx-auto rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
          <FileUp className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-slate-900">Upload your CV (.docx or .pdf)</p>
        <p className="text-xs text-slate-500 mt-1">Drag and drop or click to browse (Max 5MB)</p>
        <span className="inline-block mt-4 text-[11px] font-medium bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
          Feature F1 — Target Day 2
        </span>
      </div>

      <div className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-100 rounded-xl text-blue-900 text-xs">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
        <p>
          Once uploaded, you will be able to review, edit and version all experience bullets, technologies and certifications directly in our interactive editor.
        </p>
      </div>
    </div>
  )
}

