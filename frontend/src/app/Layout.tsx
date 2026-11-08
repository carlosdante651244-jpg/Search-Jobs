import React, { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  Sparkles,
  History,
  CheckCircle2,
  AlertCircle,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { ApiHealthResponse } from '@/shared/api/types'

export const Layout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)

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
    { to: '/tools/create-cv', label: 'Create Tailored CV', icon: Sparkles },
    { to: '/history', label: 'History', icon: History },
  ]

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      {/* Collapsible Sidebar */}
      <aside
        className={`border-r border-slate-200 bg-white flex flex-col justify-between shrink-0 transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-72'
        }`}
      >
        <div>
          {/* Logo & Toggle Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-sm shrink-0">
                S
              </div>
              {!collapsed && (
                <div className="truncate">
                  <h1 className="font-extrabold text-slate-900 text-lg tracking-tight truncate">
                    Search-Jobs
                  </h1>
                  <p className="text-xs font-medium text-slate-400 truncate">ATS Resume Copilot</p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition shrink-0"
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {collapsed ? (
                <PanelLeftOpen className="w-5 h-5" />
              ) : (
                <PanelLeftClose className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Navigation Links */}
          <div className="p-3">
            {!collapsed && (
              <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Tools & Navigation
              </p>
            )}
            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }: { isActive: boolean }) =>
                      `flex items-center rounded-xl text-base font-semibold transition-all ${
                        collapsed
                          ? 'justify-center p-3'
                          : 'space-x-3.5 px-3.5 py-3'
                      } ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`
                    }
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </NavLink>
                )
              })}
            </nav>
          </div>
        </div>

        {/* System Health Status Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70">
          <div
            className={`flex items-center text-sm ${
              collapsed ? 'justify-center' : 'justify-between'
            }`}
          >
            {!collapsed && <span className="text-slate-600 font-medium">Database</span>}
            <div className="flex items-center space-x-1.5">
              {!isError && health?.status === 'ok' ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  {!collapsed && (
                    <span className="text-emerald-700 font-semibold text-xs">Ready</span>
                  )}
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                  {!collapsed && (
                    <span className="text-amber-700 font-semibold text-xs">Offline</span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area - Full width responsive container */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 w-full">
        <Outlet />
      </main>
    </div>
  )
}
