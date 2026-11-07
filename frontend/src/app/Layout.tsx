import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, FileText, Sparkles, History, CheckCircle2, AlertCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { ApiHealthResponse } from '@/shared/api/types'

export const Layout: React.FC = () => {
  const { data: health, isError } = useQuery<ApiHealthResponse>({
    queryKey: ['health'],
    queryFn: async () => {
      const res = await fetch('/api/v1/health')
      if (!res.ok) throw new Error('API down')
      return res.json()
    },
    refetchInterval: 30000,
  })

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/master-cv', label: 'Master CV', icon: FileText },
    { to: '/tools/create-cv', label: 'Create CV', icon: Sparkles },
    { to: '/history', label: 'History', icon: History },
  ]

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col justify-between">
        <div>
          <div className="p-6 border-b border-slate-100 flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
              S
            </div>
            <div>
              <h1 className="font-semibold text-slate-900 tracking-tight">Search-Jobs</h1>
              <p className="text-xs text-slate-400">ATS Resume Copilot</p>
            </div>
          </div>

          <div className="p-4">
            <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Navigation
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }: { isActive: boolean }) =>
                      `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </NavLink>
                )
              })}
            </nav>
          </div>
        </div>

        {/* System Health Status Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Backend & DB</span>
            <div className="flex items-center space-x-1.5">
              {!isError && health?.status === 'ok' ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-700 font-medium">Connected</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-amber-700 font-medium">Offline</span>
                </>
              )}
            </div>
          </div>
          {health?.model && (
            <div className="mt-1 text-[10px] text-slate-400 truncate">
              LLM: {health.model}
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  )
}
