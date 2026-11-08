import React from 'react'
import { FileText, History } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { MasterCVHistoryItem } from '@/shared/api/types'

export const HistoryPage: React.FC = () => {
  const { data, isLoading, isError } = useQuery<MasterCVHistoryItem[]>({
    queryKey: ['master-cv-history'],
    queryFn: async () => {
      const response = await fetch('/api/v1/master-cv/history')
      if (!response.ok) throw new Error('Could not load Master CV history.')
      return response.json()
    },
  })

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Master CV History</h2>
        <p className="mt-1 text-slate-500">Review every uploaded and saved version of your Master CV.</p>
      </div>

      {isLoading && <p className="text-sm text-slate-500">Loading history...</p>}
      {isError && <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">Could not load Master CV history.</p>}
      {!isLoading && !isError && data?.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-400">
          No Master CV versions recorded yet.
        </div>
      )}
      {!isLoading && !isError && data && data.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="divide-y divide-slate-100">
            {data.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600"><FileText className="h-5 w-5" /></div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Version {item.version}</p>
                    <p className="text-xs text-slate-500">{item.source_file_name || 'Edited version'}</p>
                  </div>
                </div>
                <time className="text-xs text-slate-400" dateTime={item.updated_at}>
                  {new Date(item.updated_at).toLocaleString()}
                </time>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 p-4 text-xs text-blue-900">
        <History className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
        Older versions remain stored in Neon and are never overwritten.
      </div>
    </div>
  )
}
