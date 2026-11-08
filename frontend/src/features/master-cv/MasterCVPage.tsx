import React, { useEffect, useRef, useState } from 'react'
import {
  AlertCircle,
  Briefcase,
  CheckCircle2,
  FileUp,
  Info,
  Plus,
  Save,
  Sparkles,
  Trash2,
  User,
} from 'lucide-react'
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

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100/60'

type Toast = { type: 'success' | 'error' | 'info'; message: string }

export const MasterCVPage: React.FC = () => {
  const fileInput = useRef<HTMLInputElement>(null)
  const [cv, setCV] = useState<MasterCV>(emptyCV)
  const [cvId, setCVId] = useState<string | null>(null)
  const [cvName, setCvName] = useState('')
  const [version, setVersion] = useState<number | null>(null)
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)

  const showToast = (type: Toast['type'], message: string) => {
    setToast({ type, message })
    window.setTimeout(() => setToast(null), 4500)
  }

  useEffect(() => {
    fetch('/api/v1/master-cv')
      .then(async (response) => {
        if (!response.ok) throw new Error('Could not load master CV status.')
        return response.json() as Promise<MasterCVResponse | null>
      })
      .then((result) => {
        if (result) {
          setCV(result.data)
          setCVId(result.id)
          setCvName(result.name || '')
          setVersion(result.version)
          setStatus(`Active Base Resume saved: ${result.name || `Version ${result.version}`}`)
        } else {
          setStatus('No base CV uploaded yet.')
        }
      })
      .catch((error: Error) => {
        setStatus(error.message)
      })
  }, [])

  const updateContact = (field: keyof MasterCV['contact'], value: string) =>
    setCV((current) => ({ ...current, contact: { ...current.contact, [field]: value } }))

  const upload = async (file: File) => {
    const extension = file.name.toLowerCase().split('.').pop()
    if (!extension || !['docx', 'pdf'].includes(extension)) {
      showToast('error', 'Please upload a .docx or .pdf file.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('error', 'File size exceeds 5 MB.')
      return
    }

    setBusy(true)
    setStatus('Extracting experience and skills...')
    showToast('info', 'Processing your CV. This takes a few seconds.')

    const formData = new FormData()
    formData.append('file', file)
    if (cvName.trim()) {
      formData.append('name', cvName.trim())
    }

    try {
      const response = await fetch('/api/v1/master-cv', { method: 'POST', body: formData })
      const body = await response.text()
      let result: MasterCVResponse | { detail?: string }
      try {
        result = JSON.parse(body) as MasterCVResponse | { detail?: string }
      } catch {
        throw new Error(`Upload failed (Server status: ${response.status}).`)
      }
      if (!response.ok || !('data' in result)) {
        throw new Error(('detail' in result && result.detail) || 'Could not parse document.')
      }

      setCV(result.data)
      setCVId(result.id)
      setCvName(result.name || cvName.trim() || file.name.replace(/\.[^/.]+$/, ''))
      setVersion(result.version)
      setIsEditing(true)
      setStatus(`Imported "${result.name || `Version ${result.version}`}". Review the fields below and click Save.`)
      showToast('success', `CV imported successfully (Version ${result.version}). Review details below.`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed.'
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
      const url = cvName.trim()
        ? `/api/v1/master-cv/${cvId}?name=${encodeURIComponent(cvName.trim())}`
        : `/api/v1/master-cv/${cvId}`
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cv),
      })
      const body = await response.text()
      let result: MasterCVResponse | { detail?: string }
      try {
        result = JSON.parse(body) as MasterCVResponse | { detail?: string }
      } catch {
        throw new Error(`Save failed (Server status: ${response.status}).`)
      }
      if (!response.ok || !('data' in result)) {
        throw new Error(('detail' in result && result.detail) || 'Failed to save changes.')
      }

      setCV(result.data)
      setVersion(result.version)
      setCvName(result.name || '')
      setIsEditing(false)
      setStatus(`Base resume "${result.name || `Version ${result.version}`}" successfully saved! Ready to tailor jobs.`)
      showToast('success', `Master CV "${result.name || `Version ${result.version}`}" saved.`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Save failed.'
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
              bullets: item.bullets.map((bullet, idx) =>
                idx === bulletIndex ? { ...bullet, text: value } : bullet,
              ),
            }
          : item,
      ),
    }))

  const addBullet = (experienceIndex: number) =>
    setCV((current) => ({
      ...current,
      experience: current.experience.map((item, index) =>
        index === experienceIndex
          ? {
              ...item,
              bullets: [
                ...item.bullets,
                { id: `${item.id}_b${item.bullets.length + 1}`, text: '' },
              ],
            }
          : item,
      ),
    }))

  const removeBullet = (experienceIndex: number, bulletIndex: number) =>
    setCV((current) => ({
      ...current,
      experience: current.experience.map((item, index) =>
        index === experienceIndex
          ? {
              ...item,
              bullets: item.bullets.filter((_, idx) => idx !== bulletIndex),
            }
          : item,
      ),
    }))

  const addExperience = () =>
    setCV((current) => ({
      ...current,
      experience: [
        ...current.experience,
        {
          id: `exp_${current.experience.length + 1}`,
          company: '',
          title: '',
          location: '',
          start: '',
          end: 'Present',
          bullets: [{ id: `exp_${current.experience.length + 1}_b1`, text: '' }],
          technologies: [],
        },
      ],
    }))

  const removeExperience = (index: number) =>
    setCV((current) => ({
      ...current,
      experience: current.experience.filter((_, itemIndex) => itemIndex !== index),
    }))

  return (
    <div className="w-full space-y-8 pb-16">
      {/* Toast Notification */}
      {toast && (
        <div
          role="status"
          className={`fixed right-8 top-8 z-50 flex max-w-md items-center gap-3.5 rounded-2xl border p-4 text-base font-medium shadow-xl backdrop-blur-md ${
            toast.type === 'success'
              ? 'border-emerald-200 bg-emerald-50/95 text-emerald-950'
              : toast.type === 'error'
                ? 'border-rose-200 bg-rose-50/95 text-rose-950'
                : 'border-indigo-200 bg-indigo-50/95 text-indigo-950'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-600" />
          ) : toast.type === 'error' ? (
            <AlertCircle className="h-6 w-6 shrink-0 text-rose-600" />
          ) : (
            <Info className="h-6 w-6 shrink-0 text-indigo-600" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Base Resume (Master CV)
        </h2>
        <p className="mt-1 text-base text-slate-500">
          The foundation for your job-tailored applications. ATS engines verify against this history.
        </p>
      </div>

      {/* Upload & Naming Box */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xs space-y-6">
        <div>
          <label className="block text-base font-bold text-slate-900 mb-2">
            Resume Label / Title (Optional)
          </label>
          <input
            type="text"
            className={inputClass}
            placeholder="e.g. Fullstack Engineer CV, Tech Lead 2026, Data Science Base..."
            value={cvName}
            onChange={(e) => setCvName(e.target.value)}
          />
          <p className="mt-1.5 text-xs text-slate-500">
            Give this resume a descriptive name so you can easily identify and select it when tailoring for job posts.
          </p>
        </div>

        <input
          ref={fileInput}
          type="file"
          accept=".docx,.pdf"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
        />
        <button
          type="button"
          disabled={busy}
          onClick={() => fileInput.current?.click()}
          className="group relative w-full overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-10 text-center transition hover:border-indigo-500 hover:bg-indigo-50/40 disabled:opacity-60"
        >
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 transition group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white">
            <FileUp className="h-6 w-6" />
          </div>
          <p className="text-base font-bold text-slate-900">
            {busy ? 'Reading & Structuring Document...' : 'Upload Base Resume (.docx or .pdf)'}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Drag & drop your file or click to browse (Max 5 MB)
          </p>
        </button>
      </div>

      {/* Status banner */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm text-slate-700 shadow-xs">
        <span className="flex items-center gap-2.5 font-medium">
          <Sparkles className="h-4 w-4 text-indigo-600" />
          {status}
        </span>
        {version && (
          <span className="rounded-full bg-indigo-50 px-3 py-1 font-semibold text-indigo-700 text-xs">
            Version {version}
          </span>
        )}
      </div>

      {/* Structured CV Editor (Only visible right after uploading a file until user clicks Save) */}
      {isEditing && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Resume Name in Editor */}
          <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xs space-y-3">
            <h3 className="text-xl font-bold text-slate-900">Resume Name / Identifier</h3>
            <input
              type="text"
              className={inputClass}
              placeholder="e.g. Senior Software Engineer CV"
              value={cvName}
              onChange={(e) => setCvName(e.target.value)}
            />
          </section>
          {/* Contact Details */}
          <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 text-slate-900 border-b border-slate-100 pb-4">
              <User className="h-5 w-5 text-indigo-600" />
              <h3 className="text-xl font-bold">Personal & Contact Info</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <input
                  className={inputClass}
                  placeholder="Full Name (e.g. Carlos Dandte)"
                  value={cv.contact.name}
                  onChange={(e) => updateContact('name', e.target.value)}
                />
              </div>
              <div>
                <input
                  className={inputClass}
                  placeholder="Email Address (e.g. carlos@example.com)"
                  value={cv.contact.email}
                  onChange={(e) => updateContact('email', e.target.value)}
                />
              </div>
              <div>
                <input
                  className={inputClass}
                  placeholder="Phone Number (e.g. +1 555 123 4567)"
                  value={cv.contact.phone}
                  onChange={(e) => updateContact('phone', e.target.value)}
                />
              </div>
              <div>
                <input
                  className={inputClass}
                  placeholder="Location (e.g. Austin, TX or Remote)"
                  value={cv.contact.location}
                  onChange={(e) => updateContact('location', e.target.value)}
                />
              </div>
              <div>
                <input
                  className={inputClass}
                  placeholder="LinkedIn Profile URL"
                  value={cv.contact.linkedin}
                  onChange={(e) => updateContact('linkedin', e.target.value)}
                />
              </div>
              <div>
                <input
                  className={inputClass}
                  placeholder="Portfolio or GitHub URL"
                  value={cv.contact.portfolio}
                  onChange={(e) => updateContact('portfolio', e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Professional Summary */}
          <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xs space-y-4">
            <h3 className="text-xl font-bold text-slate-900">Professional Summary</h3>
            <textarea
              rows={4}
              className={`${inputClass} leading-relaxed`}
              placeholder="Brief executive summary highlighting your core strengths and career focus..."
              value={cv.summary}
              onChange={(e) => setCV({ ...cv, summary: e.target.value })}
            />
          </section>

          {/* Work Experience */}
          <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5 text-slate-900">
                <Briefcase className="h-5 w-5 text-indigo-600" />
                <h3 className="text-xl font-bold">Work Experience</h3>
              </div>
              <button
                type="button"
                onClick={addExperience}
                className="inline-flex items-center gap-1.5 text-base font-semibold text-indigo-600 hover:text-indigo-800 transition"
              >
                <Plus className="h-5 w-5" />
                Add Position
              </button>
            </div>

            <div className="space-y-6">
              {cv.experience.map((item, index) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 space-y-4 transition hover:border-slate-300"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="grid flex-1 gap-3 sm:grid-cols-2">
                      <input
                        className={inputClass}
                        placeholder="Job Title (e.g. Senior Software Engineer)"
                        value={item.title}
                        onChange={(e) => updateExperience(index, 'title', e.target.value)}
                      />
                      <input
                        className={inputClass}
                        placeholder="Company Name (e.g. Google, TechCorp)"
                        value={item.company}
                        onChange={(e) => updateExperience(index, 'company', e.target.value)}
                      />
                      <input
                        className={inputClass}
                        placeholder="Location (e.g. Remote / New York, NY)"
                        value={item.location || ''}
                        onChange={(e) => updateExperience(index, 'location', e.target.value)}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          className={inputClass}
                          placeholder="Start (e.g. 2021)"
                          value={item.start}
                          onChange={(e) => updateExperience(index, 'start', e.target.value)}
                        />
                        <input
                          className={inputClass}
                          placeholder="End (e.g. Present)"
                          value={item.end || ''}
                          onChange={(e) => updateExperience(index, 'end', e.target.value)}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeExperience(index)}
                      className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                      title="Remove Position"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Bullets */}
                  <div className="space-y-3 pt-2">
                    <p className="text-sm font-semibold text-slate-700">
                      Key Accomplishments & Responsibilities
                    </p>
                    {item.bullets.map((bullet, bulletIndex) => (
                      <div key={bullet.id} className="flex items-start gap-2.5">
                        <span className="mt-3.5 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                        <textarea
                          rows={2}
                          className={`${inputClass} flex-1 text-base leading-relaxed`}
                          placeholder="Action verb + Context + Measurable result..."
                          value={bullet.text}
                          onChange={(e) => updateBullet(index, bulletIndex, e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => removeBullet(index, bulletIndex)}
                          className="mt-2.5 p-1.5 text-slate-400 hover:text-rose-600 transition"
                          title="Delete bullet"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addBullet(index)}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition pt-1"
                    >
                      <Plus className="h-4 w-4" />
                      Add bullet point
                    </button>
                  </div>
                </div>
              ))}
              {cv.experience.length === 0 && (
                <p className="text-center py-6 text-base text-slate-400">
                  No experience recorded yet. Click "Add Position" or upload your resume above.
                </p>
              )}
            </div>
          </section>

          {/* Bottom Save Button */}
          <div className="flex justify-end pt-4">
            <button
              type="button"
              disabled={busy}
              onClick={save}
              className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-indigo-600 px-8 py-4 text-lg font-bold text-white shadow-md transition hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-60"
            >
              <Save className="h-5 w-5" />
              <span>Save Master CV</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
