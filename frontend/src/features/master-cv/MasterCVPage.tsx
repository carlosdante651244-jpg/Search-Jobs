import React, { useEffect, useRef, useState } from 'react'
import { AlertCircle, CheckCircle2, FileUp, Info, Plus, Save, Trash2 } from 'lucide-react'
import { MasterCV, MasterCVResponse } from '@/shared/api/types'

const emptyCV: MasterCV = {
  contact: { name: '', email: '', phone: '', location: '', linkedin: '', portfolio: '' },
  summary: '',
  experience: [],
  education: [],
  skills: [],
  certifications: [],
  projects: [],
  languages: [],
}

const inputClass = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
type Toast = { type: 'success' | 'error' | 'info'; message: string }

export const MasterCVPage: React.FC = () => {
  const fileInput = useRef<HTMLInputElement>(null)
  const [cv, setCV] = useState<MasterCV>(emptyCV)
  const [cvId, setCVId] = useState<string | null>(null)
  const [version, setVersion] = useState<number | null>(null)
  const [status, setStatus] = useState('Loading your master CV...')
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)

  const showToast = (type: Toast['type'], message: string) => {
    setToast({ type, message })
    window.setTimeout(() => setToast(null), 4500)
  }

  useEffect(() => {
    fetch('/api/v1/master-cv')
      .then(async (response) => {
        if (!response.ok) throw new Error('Could not load the master CV.')
        return response.json() as Promise<MasterCVResponse | null>
      })
      .then((result) => {
        if (result) {
          setCV(result.data)
          setCVId(result.id)
          setVersion(result.version)
          setStatus(`Version ${result.version}`)
        } else setStatus('No master CV uploaded yet.')
      })
      .catch((error: Error) => {
        setStatus(error.message)
        showToast('error', error.message)
      })
  }, [])

  const updateContact = (field: keyof MasterCV['contact'], value: string) =>
    setCV((current) => ({ ...current, contact: { ...current.contact, [field]: value } }))

  const upload = async (file: File) => {
    const extension = file.name.toLowerCase().split('.').pop()
    if (!extension || !['docx', 'pdf'].includes(extension)) {
      setStatus('Only .docx and .pdf files are supported.')
      showToast('error', 'Only .docx and .pdf files are supported.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setStatus('The file must be 5 MB or smaller.')
      showToast('error', 'The file must be 5 MB or smaller.')
      return
    }
    setBusy(true)
    setStatus('Extracting and structuring your CV...')
    showToast('info', 'Your CV is being processed. This may take a moment.')
    const formData = new FormData()
    formData.append('file', file)
    try {
      const response = await fetch('/api/v1/master-cv', { method: 'POST', body: formData })
      const body = await response.text()
      let result: MasterCVResponse | { detail?: string }
      try {
        result = JSON.parse(body) as MasterCVResponse | { detail?: string }
      } catch {
        throw new Error(`Could not process the file (server returned ${response.status}).`)
      }
      if (!response.ok || !('data' in result)) {
        throw new Error(('detail' in result && result.detail) || 'Could not process the file.')
      }
      setCV(result.data)
      setCVId(result.id)
      setVersion(result.version)
      setStatus(`Version ${result.version} saved`)
      showToast('success', `CV uploaded and saved as version ${result.version}.`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not process the file.'
      setStatus(message)
      showToast('error', message)
    } finally {
      setBusy(false)
    }
  }

  const save = async () => {
    if (!cvId) return
    setBusy(true)
    try {
      const response = await fetch(`/api/v1/master-cv/${cvId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cv),
      })
      const body = await response.text()
      let result: MasterCVResponse | { detail?: string }
      try {
        result = JSON.parse(body) as MasterCVResponse | { detail?: string }
      } catch {
        throw new Error(`Could not save your changes (server returned ${response.status}).`)
      }
      if (!response.ok || !('data' in result)) {
        throw new Error(('detail' in result && result.detail) || 'Could not save your changes.')
      }
      setCV(result.data)
      setVersion(result.version)
      setCV(emptyCV)
      setCVId(null)
      setStatus(`Version ${result.version} saved`)
      showToast('success', `Changes saved as version ${result.version}.`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not save your changes.'
      setStatus(message)
      showToast('error', message)
    } finally {
      setBusy(false)
    }
  }

  const updateExperience = (index: number, field: string, value: string) =>
    setCV((current) => ({
      ...current,
      experience: current.experience.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }))

  const updateBullet = (experienceIndex: number, bulletIndex: number, value: string) =>
    setCV((current) => ({
      ...current,
      experience: current.experience.map((item, index) =>
        index === experienceIndex
          ? {
              ...item,
              bullets: item.bullets.map((bullet, index) =>
                index === bulletIndex ? { ...bullet, text: value } : bullet,
              ),
            }
          : item,
      ),
    }))

  const addExperience = () =>
    setCV((current) => ({
      ...current,
      experience: [
        ...current.experience,
        { id: `exp_${current.experience.length + 1}`, company: '', title: '', location: '', start: '', end: '', bullets: [], technologies: [] },
      ],
    }))

  const removeExperience = (index: number) =>
    setCV((current) => ({ ...current, experience: current.experience.filter((_, itemIndex) => itemIndex !== index) }))

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed right-6 top-6 z-50 flex max-w-sm items-start gap-3 rounded-xl border p-4 text-sm shadow-lg ${
            toast.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : toast.type === 'error'
                ? 'border-red-200 bg-red-50 text-red-900'
                : 'border-blue-200 bg-blue-50 text-blue-900'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          ) : toast.type === 'error' ? (
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          ) : (
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Master CV</h2>
        <p className="mt-1 text-slate-500">Your source of truth for every tailored resume.</p>
      </div>

      <input ref={fileInput} type="file" accept=".docx,.pdf" className="hidden" onChange={(event) => event.target.files?.[0] && upload(event.target.files[0])} />
      <button type="button" disabled={busy} onClick={() => fileInput.current?.click()} className="w-full rounded-2xl border-2 border-dashed border-slate-300 bg-white p-10 text-center transition hover:border-indigo-400 disabled:opacity-60">
        <FileUp className="mx-auto mb-3 h-7 w-7 text-indigo-600" />
        <p className="text-sm font-semibold text-slate-900">{busy ? 'Processing...' : 'Upload your CV (.docx or .pdf)'}</p>
        <p className="mt-1 text-xs text-slate-500">Maximum 5 MB</p>
      </button>

      <div className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50 p-4 text-xs text-blue-900">
        <span className="flex items-center gap-2"><Info className="h-4 w-4 text-blue-600" />{status}</span>
        {version && <span>Version {version}</span>}
      </div>

      {cvId && (
        <div className="space-y-5 rounded-2xl bg-white p-6 shadow-sm">
          <section>
            <h3 className="mb-3 text-lg font-semibold text-slate-900">Contact</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {(Object.keys(cv.contact) as Array<keyof MasterCV['contact']>).map((field) => (
                <input key={field} className={inputClass} placeholder={field[0].toUpperCase() + field.slice(1)} value={cv.contact[field]} onChange={(event) => updateContact(field, event.target.value)} />
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-lg font-semibold text-slate-900">Summary</h3>
            <textarea className={`${inputClass} min-h-24`} value={cv.summary} onChange={(event) => setCV({ ...cv, summary: event.target.value })} />
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between"><h3 className="text-lg font-semibold text-slate-900">Experience</h3><button type="button" onClick={addExperience} className="flex items-center gap-1 text-sm font-medium text-indigo-600"><Plus className="h-4 w-4" />Add role</button></div>
            <div className="space-y-4">
              {cv.experience.map((item, index) => (
                <div key={item.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="grid flex-1 gap-3 sm:grid-cols-2">
                      <input className={inputClass} placeholder="Company" value={item.company} onChange={(event) => updateExperience(index, 'company', event.target.value)} />
                      <input className={inputClass} placeholder="Title" value={item.title} onChange={(event) => updateExperience(index, 'title', event.target.value)} />
                      <input className={inputClass} placeholder="Location" value={item.location || ''} onChange={(event) => updateExperience(index, 'location', event.target.value)} />
                      <div className="grid grid-cols-2 gap-3"><input className={inputClass} placeholder="Start" value={item.start} onChange={(event) => updateExperience(index, 'start', event.target.value)} /><input className={inputClass} placeholder="End" value={item.end || ''} onChange={(event) => updateExperience(index, 'end', event.target.value)} /></div>
                    </div>
                    <button type="button" onClick={() => removeExperience(index)} aria-label="Remove experience" className="text-slate-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                  </div>
                  <div className="space-y-2">
                    {item.bullets.map((bullet, bulletIndex) => <textarea key={bullet.id} className={`${inputClass} min-h-16`} value={bullet.text} onChange={(event) => updateBullet(index, bulletIndex, event.target.value)} />)}
                  </div>
                </div>
              ))}
              {cv.experience.length === 0 && <p className="text-sm text-slate-500">No experience entries found.</p>}
            </div>
          </section>

          <button type="button" disabled={busy} onClick={save} className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"><Save className="h-4 w-4" />Save changes</button>
        </div>
      )}
    </div>
  )
}
