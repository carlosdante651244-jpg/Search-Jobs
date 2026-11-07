import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Layout } from '@/app/Layout'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { MasterCVPage } from '@/features/master-cv/MasterCVPage'
import { CreateCVPage } from '@/features/create-cv/CreateCVPage'
import { HistoryPage } from '@/features/history/HistoryPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="master-cv" element={<MasterCVPage />} />
            <Route path="tools/create-cv" element={<CreateCVPage />} />
            <Route path="history" element={<HistoryPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
