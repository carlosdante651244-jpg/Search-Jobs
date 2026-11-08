import React, { useState } from 'react'
import {
  Briefcase,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  FileText,
  User,
  X,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { MasterCVHistoryItem } from '@/shared/api/types'

export const HistoryPage: React.FC = () => {
  const [selectedVersion, setSelectedVersion] = useState<MasterCVHistoryItem | null>(null)
  const [showAll, setShowAll] = useState(false)

  const { data, isLoading, isError } = useQuery<MasterCVHistoryItem[]>({
    queryKey: ['master-cv-history'],
    queryFn: async () => {
      const response = await fetch('/api/v1/master-cv/history')
      if (!response.ok) throw new Error('Could not load Master CV history.')
      return response.json()
    },
  })

  const displayedItems = data ? (showAll ? data : data.slice(0, 10)) : []
  const hasMoreThan10 = data && data.length > 10

  return (
    <div className="w-full space-y-8 pb-16">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Base Resume History
        </h2>
        <p className="mt-1 text-base text-slate-500">
          Every version of your Master CV saved in Neon PostgreSQL. Click any version to inspect its structured contents.
        </p>
      </div>

      {isLoading && (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-base text-slate-500">
          Loading resume history...
        </div>
      )}

      {isError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-base text-rose-800">
          Could not load Master CV history from the database.
        </div>
      )}

      {!isLoading && !isError && data?.length === 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-16 text-center text-base text-slate-400">
          No Master CV versions recorded yet. Upload your first resume in the Master CV tab!
        </div>
      )}

      {!isLoading && !isError && data && data.length > 0 && (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs">
            <div className="divide-y divide-slate-100">
              {displayedItems.map((item, index) => {
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
                            Version {item.version}
                          </span>
                          {isLatest && (
                            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                              Current Active
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500">
                          {item.source_file_name || 'Manual Editor Update'}
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
          {hasMoreThan10 && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => setShowAll(!showAll)}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-indigo-600 active:scale-[0.98]"
              >
                {showAll ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    <span>Hide Older Versions (Show Top 10)</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    <span>Show All Versions ({data.length} total)</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Version Details Modal / Drawer */}
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
                    Version {selectedVersion.version} Details
                  </h3>
                  <p className="text-xs text-slate-500">
                    Saved on {new Date(selectedVersion.updated_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVersion(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
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
                className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition"
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
