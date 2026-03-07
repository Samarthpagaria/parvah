'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { issueAPI, orgAPI } from '@/utils/backend_api_endpoints'

// Supabase URL/key — resolved lazily inside the component (browser-only)
const getSupabaseUrl = () => process.env.NEXT_PUBLIC_SUPABASE_URL!
const getSupabaseAnonKey = () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime']
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES]
const MAX_FILES = 5

type MediaFile = {
    id: string
    file: File
    preview: string // object URL for image preview
    isVideo: boolean
    uploading: boolean
    uploaded: boolean
    error: string
    file_url: string
    file_name: string
    file_type: string
    file_size_kb: number
}

// ─── Map Location Picker ────────────────────────────────────────────────────
function MapLocationPicker({
    latitude,
    longitude,
    onLocationDetected,
}: {
    latitude: number | null
    longitude: number | null
    onLocationDetected: (lat: number, lng: number) => void
}) {
    const mapRef = useRef<HTMLDivElement>(null)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const leafletMapRef = useRef<any>(null)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const markerRef = useRef<any>(null)
    const [leafletReady, setLeafletReady] = useState(false)
    const [locating, setLocating] = useState(false)
    const [geoError, setGeoError] = useState('')
    const [locationLabel, setLocationLabel] = useState('')

    useEffect(() => {
        if (document.getElementById('leaflet-css')) { setLeafletReady(true); return }
        const link = document.createElement('link')
        link.id = 'leaflet-css'
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)
        const script = document.createElement('script')
        script.id = 'leaflet-js'
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
        script.onload = () => setLeafletReady(true)
        document.head.appendChild(script)
    }, [])

    useEffect(() => {
        if (!leafletReady || !mapRef.current || leafletMapRef.current) return
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const L = (window as any).L
        if (!L) return
        const map = L.map(mapRef.current, { center: [12.9716, 77.5946], zoom: 13, zoomControl: true })
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>', maxZoom: 19,
        }).addTo(map)
        leafletMapRef.current = map
        if (latitude !== null && longitude !== null) {
            const marker = L.marker([latitude, longitude]).addTo(map)
            markerRef.current = marker
            map.setView([latitude, longitude], 16)
        }
        return () => { map.remove(); leafletMapRef.current = null; markerRef.current = null }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [leafletReady])

    const handleUseMyLocation = () => {
        setGeoError(''); setLocating(true)
        if (!navigator.geolocation) { setGeoError('Geolocation not supported.'); setLocating(false); return }
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude: lat, longitude: lng } = position.coords
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const L = (window as any).L
                if (leafletMapRef.current && L) {
                    if (markerRef.current) { markerRef.current.remove(); markerRef.current = null }
                    const icon = L.divIcon({
                        html: `<div style="width:28px;height:28px;background:linear-gradient(135deg,#0d9488,#22d3ee);border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 10px rgba(0,0,0,0.25)"></div>`,
                        className: '', iconSize: [28, 28], iconAnchor: [14, 28],
                    })
                    markerRef.current = L.marker([lat, lng], { icon }).addTo(leafletMapRef.current)
                    leafletMapRef.current.setView([lat, lng], 17, { animate: true })
                }
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
                    const data = await res.json()
                    setLocationLabel(data.display_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`)
                } catch { setLocationLabel(`${lat.toFixed(5)}, ${lng.toFixed(5)}`) }
                onLocationDetected(lat, lng); setLocating(false)
            },
            (err) => {
                if (err.code === 1) setGeoError('Location permission denied. Please allow location access.')
                else if (err.code === 2) setGeoError('Unable to determine your location.')
                else setGeoError('Location request timed out. Please try again.')
                setLocating(false)
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        )
    }

    return (
        <div className="space-y-3">
            <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                <div ref={mapRef} style={{ height: '240px', width: '100%', background: '#e5e7eb' }} />
                {!leafletReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                            <p className="text-xs text-gray-400">Loading map...</p>
                        </div>
                    </div>
                )}
            </div>
            <button type="button" onClick={handleUseMyLocation} disabled={locating}
                className="flex items-center gap-2 w-full justify-center px-5 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-60 rounded-xl shadow-sm transition-colors">
                {locating
                    ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Detecting location...</>
                    : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>Use My Location</>
                }
            </button>
            {geoError && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-700 rounded-xl px-4 py-3">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    <p className="text-xs">{geoError}</p>
                </div>
            )}
            {latitude !== null && !geoError && (
                <div className="flex items-start gap-2 bg-teal-50 border border-teal-100 rounded-xl px-4 py-3">
                    <svg className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    <div>
                        <p className="text-xs font-semibold text-teal-800">Location pinned</p>
                        {locationLabel && <p className="text-[11px] text-teal-600 mt-0.5 leading-relaxed line-clamp-2">{locationLabel}</p>}
                        <p className="text-[10px] text-teal-500 mt-0.5 font-mono">{latitude.toFixed(6)}, {longitude?.toFixed(6)}</p>
                    </div>
                </div>
            )}
            {latitude === null && !geoError && (
                <p className="text-xs text-gray-400 text-center">Click <strong className="text-gray-600">&quot;Use My Location&quot;</strong> to pin your exact location</p>
            )}
        </div>
    )
}

// ─── Step labels ────────────────────────────────────────────────────────────
const STEPS = [
    { num: 1, label: 'Organization' },
    { num: 2, label: 'Issue Details' },
    { num: 3, label: 'Location' },
    { num: 4, label: 'Media' },
    { num: 5, label: 'Review' },
]

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function NewIssuePage() {
    const [form, setForm] = useState({
        org_id: '',
        org_name: '',
        title: '',
        category_id: '',
        description: '',
        latitude: null as number | null,
        longitude: null as number | null,
    })
    const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1)
    const [submitted, setSubmitted] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState('')
    const [newIssueId, setNewIssueId] = useState('')

    const [organizations, setOrganizations] = useState<{ id: string; name: string }[]>([])
    const [orgsLoading, setOrgsLoading] = useState(true)
    const [categories, setCategories] = useState<{ id: string; name: string; color: string }[]>([])
    const [catsLoading, setCatsLoading] = useState(false)

    // Media state
    const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [dragOver, setDragOver] = useState(false)

    // Fetch orgs on mount
    useEffect(() => {
        setOrgsLoading(true)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        orgAPI.listActive().then((res: any) => setOrganizations(res.organizations || [])).catch(() => setOrganizations([])).finally(() => setOrgsLoading(false))
    }, [])

    // Fetch categories when org changes
    useEffect(() => {
        if (!form.org_id) { setCategories([]); return }
        setCatsLoading(true)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        orgAPI.listCategoriesByOrg(form.org_id).then((res: any) => setCategories(res.categories || [])).catch(() => setCategories([])).finally(() => setCatsLoading(false))
    }, [form.org_id])

    // Cleanup object URLs on unmount
    useEffect(() => {
        return () => mediaFiles.forEach(f => { if (f.preview) URL.revokeObjectURL(f.preview) })
    }, [mediaFiles])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    // Add files to queue
    const addFiles = useCallback((files: File[]) => {
        const current = mediaFiles.length
        const remaining = MAX_FILES - current
        if (remaining <= 0) return

        const valid = files.slice(0, remaining).filter(f => {
            if (!ALLOWED_TYPES.includes(f.type)) return false
            const isVideo = ALLOWED_VIDEO_TYPES.includes(f.type)
            return isVideo ? f.size <= 52428800 : f.size <= 10485760
        })

        const newEntries: MediaFile[] = valid.map(file => ({
            id: `${Date.now()}-${Math.random()}`,
            file,
            preview: ALLOWED_IMAGE_TYPES.includes(file.type) ? URL.createObjectURL(file) : '',
            isVideo: ALLOWED_VIDEO_TYPES.includes(file.type),
            uploading: false,
            uploaded: false,
            error: '',
            file_url: '',
            file_name: file.name,
            file_type: file.type,
            file_size_kb: Math.round(file.size / 1024),
        }))
        setMediaFiles(prev => [...prev, ...newEntries])
    }, [mediaFiles.length])

    const removeFile = (id: string) => {
        setMediaFiles(prev => {
            const file = prev.find(f => f.id === id)
            if (file?.preview) URL.revokeObjectURL(file.preview)
            return prev.filter(f => f.id !== id)
        })
    }

    // Upload a single file to Supabase Storage
    const uploadFileToStorage = async (entry: MediaFile, issueId: string): Promise<{ file_url: string; file_name: string; file_type: string; file_size_kb: number }> => {
        const ext = entry.file.name.split('.').pop()
        const path = `issue-media/${issueId}/${entry.id}.${ext}`

        // Get the appropriate token (handles both public and admin sessions for testing)
        const publicToken = localStorage.getItem('parvah_public_token')
        const adminToken = localStorage.getItem('parvah_admin_token')
        const token = publicToken || adminToken

        if (!token) {
            console.warn("[uploadFileToStorage] No authentication token found.")
        }

        // Create a supabase client with the user's token for storage
        const userSupabase = createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
            global: { headers: token ? { Authorization: `Bearer ${token}` } : {} },
        })

        console.log(`[upload] Starting upload for ${entry.file_name} to path ${path}...`)

        const { error: uploadError } = await userSupabase.storage
            .from('issue-attachments')
            .upload(path, entry.file, { contentType: entry.file_type, upsert: false })

        if (uploadError) {
            console.error("[upload] Storage upload failed:", uploadError.message)
            throw new Error(`Upload failed: ${uploadError.message}`)
        }

        const { data: urlData } = userSupabase.storage.from('issue-attachments').getPublicUrl(path)
        console.log(`[upload] Success! Public URL: ${urlData.publicUrl}`)

        return {
            file_url: urlData.publicUrl,
            file_name: entry.file_name,
            file_type: entry.file_type,
            file_size_kb: entry.file_size_kb,
        }
    }

    // Main submit handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitError('')
        setSubmitting(true)

        try {
            // Step 1: Create the issue
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const res = await (issueAPI as any).report({
                org_id: form.org_id,
                title: form.title,
                category_id: form.category_id || undefined,
                description: form.description,
                latitude: form.latitude,
                longitude: form.longitude,
            })

            const issueId = res.issue?.id || res.id
            setNewIssueId(issueId)

            // Step 2: Upload each media file and register attachment
            if (mediaFiles.length > 0) {
                await Promise.all(mediaFiles.map(async (entry) => {
                    try {
                        setMediaFiles(prev => prev.map(f => f.id === entry.id ? { ...f, uploading: true } : f))
                        const attachment = await uploadFileToStorage(entry, issueId)

                        // Register in issue_attachments via backend
                        console.log(`[register] Registering attachment for issue ${issueId}...`)
                        await (issueAPI as any).registerAttachment(issueId, attachment)
                        console.log(`[register] Success for ${entry.file_name}`)

                        setMediaFiles(prev => prev.map(f => f.id === entry.id ? { ...f, uploading: false, uploaded: true, file_url: attachment.file_url } : f))
                    } catch (err) {
                        setMediaFiles(prev => prev.map(f => f.id === entry.id ? { ...f, uploading: false, error: (err as Error).message } : f))
                    }
                }))
            }

            setSubmitted(true)
        } catch (err: unknown) {
            setSubmitError((err as Error).message || 'Failed to submit. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    // Drag and drop
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault(); setDragOver(false)
        addFiles(Array.from(e.dataTransfer.files))
    }

    // Step gate conditions
    const canNext1 = !!form.org_id
    const canNext2 = !!form.title.trim() && !!form.category_id
    const canNext3 = !!form.description.trim() && form.latitude !== null && form.longitude !== null
    // Step 4 (media) is optional — always can proceed

    // ── Success screen ────────────────────────────────────────────────────────
    if (submitted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 text-center max-w-sm w-full">
                    <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-5">
                        <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Issue Reported!</h2>
                    <p className="text-sm text-gray-500 mb-1">Your report has been submitted successfully.</p>
                    <p className="text-xs font-semibold text-teal-700 mb-1">Organization: {form.org_name}</p>
                    {mediaFiles.filter(f => f.uploaded).length > 0 && (
                        <p className="text-xs text-teal-600 mb-1">
                            📎 {mediaFiles.filter(f => f.uploaded).length} media file(s) attached
                        </p>
                    )}
                    {form.latitude !== null && (
                        <p className="text-[10px] text-gray-400 mb-5 font-mono">📍 {form.latitude.toFixed(5)}, {form.longitude?.toFixed(5)}</p>
                    )}
                    <p className="text-[10px] font-mono bg-gray-50 rounded-lg px-3 py-2 text-gray-500 mb-6 break-all">ID: {newIssueId}</p>
                    <div className="space-y-2">
                        <Link href={`/dashboard/issues/${newIssueId}`}>
                            <button className="w-full py-3 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-sm">Track This Issue</button>
                        </Link>
                        <Link href="/dashboard">
                            <button className="w-full py-3 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Back to Dashboard</button>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
                <div className="max-w-3xl mx-auto px-6 py-3.5 flex items-center gap-3">
                    <Link href="/dashboard" className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 transition-colors text-sm font-medium">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        Dashboard
                    </Link>
                    <span className="text-gray-200">/</span>
                    <span className="text-sm font-semibold text-gray-700">Report New Issue</span>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Report an Issue</h1>
                    <p className="text-sm text-gray-500 mt-1">Select an organization and describe the civic problem you want to report.</p>
                </div>

                {/* Step indicator */}
                <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
                    {STEPS.map((s, idx) => (
                        <div key={s.num} className="flex items-center gap-2 shrink-0">
                            <div className={`flex items-center gap-2 ${step >= s.num ? 'text-gray-800' : 'text-gray-400'}`}>
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step > s.num ? 'bg-teal-600 text-white' : step === s.num ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-400'}`}>
                                    {step > s.num
                                        ? <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                        : s.num}
                                </div>
                                <span className="text-xs font-semibold hidden sm:block">{s.label}</span>
                            </div>
                            {idx < STEPS.length - 1 && <div className={`h-px w-5 sm:w-8 ${step > s.num ? 'bg-teal-400' : 'bg-gray-200'}`} />}
                        </div>
                    ))}
                </div>

                <form onSubmit={handleSubmit}>

                    {/* ── Step 1: Select Organization ── */}
                    {step === 1 && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-50">
                                <h2 className="text-sm font-semibold text-gray-700">Which organization should handle this issue?</h2>
                                <p className="text-xs text-gray-400 mt-0.5">Select the municipal or civic body responsible for this area.</p>
                            </div>
                            <div className="px-6 py-5">
                                {orgsLoading ? (
                                    <div className="flex items-center justify-center py-10 gap-3 text-gray-400">
                                        <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                                        <span className="text-sm">Loading organizations...</span>
                                    </div>
                                ) : organizations.length === 0 ? (
                                    <p className="text-center py-8 text-gray-400 text-sm">No active organizations found.</p>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {organizations.map(org => (
                                            <button key={org.id} type="button"
                                                onClick={() => setForm(p => ({ ...p, org_id: org.id, org_name: org.name, category_id: '' }))}
                                                className={`text-left px-4 py-4 rounded-xl border-2 transition-all ${form.org_id === org.id ? 'border-teal-500 bg-teal-50' : 'border-gray-100 hover:border-gray-300 bg-white'}`}>
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${form.org_id === org.id ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                                        {org.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className={`text-sm font-semibold ${form.org_id === org.id ? 'text-teal-800' : 'text-gray-700'}`}>{org.name}</span>
                                                </div>
                                                {form.org_id === org.id && (
                                                    <div className="mt-2 flex items-center gap-1 text-teal-600 text-xs font-semibold">
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                                        Selected
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="px-6 py-4 bg-gray-50/50 flex justify-end">
                                <button type="button" disabled={!canNext1} onClick={() => setStep(2)}
                                    className="px-6 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                                    Next →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── Step 2: Category + Title ── */}
                    {step === 2 && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-50">
                                <h2 className="text-sm font-semibold text-gray-700">What&apos;s the issue?</h2>
                                <p className="text-xs text-gray-400 mt-0.5">Reporting to: <span className="font-semibold text-teal-700">{form.org_name}</span></p>
                            </div>
                            <div className="px-6 py-5 space-y-5">
                                {/* Category */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Category <span className="text-red-400">*</span></label>
                                    {catsLoading ? (
                                        <div className="flex items-center gap-2 text-gray-400 text-xs py-2">
                                            <div className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                                            Loading categories for {form.org_name}...
                                        </div>
                                    ) : (
                                        <select name="category_id" value={form.category_id} onChange={handleChange} required
                                            className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all bg-white">
                                            <option value="">Select a category...</option>
                                            {categories.length === 0 && <option disabled value="">No categories for this organization</option>}
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    )}
                                </div>
                                {/* Title */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Issue Title <span className="text-red-400">*</span></label>
                                    <input name="title" value={form.title} onChange={handleChange} required
                                        placeholder="Brief title describing the issue..."
                                        className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all" />
                                    <p className="text-xs text-gray-400 mt-1">At least 5 characters</p>
                                </div>
                            </div>
                            <div className="px-6 py-4 bg-gray-50/50 flex justify-between">
                                <button type="button" onClick={() => setStep(1)} className="px-6 py-2.5 text-sm font-semibold text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">← Back</button>
                                <button type="button" disabled={!canNext2} onClick={() => setStep(3)} className="px-6 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Next →</button>
                            </div>
                        </div>
                    )}

                    {/* ── Step 3: Description + Location ── */}
                    {step === 3 && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-50">
                                <h2 className="text-sm font-semibold text-gray-700">Describe &amp; locate the issue</h2>
                            </div>
                            <div className="px-6 py-5 space-y-6">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description <span className="text-red-400">*</span></label>
                                    <textarea name="description" value={form.description} onChange={handleChange} required rows={4}
                                        placeholder="Describe the issue — what you see, how long it's been there, any safety concerns..."
                                        className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all resize-none" />
                                    <p className="text-xs text-gray-400 mt-1">At least 10 characters</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-2">Issue Location <span className="text-red-400">*</span></label>
                                    <MapLocationPicker latitude={form.latitude} longitude={form.longitude}
                                        onLocationDetected={(lat, lng) => setForm(p => ({ ...p, latitude: lat, longitude: lng }))} />
                                </div>
                            </div>
                            <div className="px-6 py-4 bg-gray-50/50 flex justify-between">
                                <button type="button" onClick={() => setStep(2)} className="px-6 py-2.5 text-sm font-semibold text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">← Back</button>
                                <button type="button" disabled={!canNext3} onClick={() => setStep(4)} className="px-6 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Next →</button>
                            </div>
                        </div>
                    )}

                    {/* ── Step 4: Media Upload ── */}
                    {step === 4 && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-50">
                                <h2 className="text-sm font-semibold text-gray-700">Upload Media <span className="text-gray-400 font-normal">(Optional)</span></h2>
                                <p className="text-xs text-gray-400 mt-0.5">Attach photos or videos to help visualise the issue. Up to {MAX_FILES} files.</p>
                            </div>
                            <div className="px-6 py-5 space-y-4">
                                {/* Drop zone */}
                                <div
                                    onDrop={handleDrop}
                                    onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                                    onDragLeave={() => setDragOver(false)}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${dragOver ? 'border-teal-400 bg-teal-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'} ${mediaFiles.length >= MAX_FILES ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}>
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
                                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-700">
                                                {dragOver ? 'Drop files here' : 'Click or drag to upload'}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP up to 10MB · MP4, MOV up to 50MB</p>
                                            <p className="text-xs text-gray-400">{mediaFiles.length}/{MAX_FILES} files added</p>
                                        </div>
                                    </div>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept=".jpg,.jpeg,.png,.webp,.mp4,.mov,image/jpeg,image/jpg,image/png,image/webp,video/mp4,video/quicktime"
                                    className="hidden"
                                    onChange={(e) => { addFiles(Array.from(e.target.files || [])); e.target.value = '' }}
                                />

                                {/* File preview grid */}
                                {mediaFiles.length > 0 && (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {mediaFiles.map(entry => (
                                            <div key={entry.id} className="relative rounded-xl overflow-hidden border border-gray-100 bg-gray-50 aspect-square">
                                                {/* Preview */}
                                                {entry.isVideo ? (
                                                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gray-900 text-white">
                                                        <svg className="w-8 h-8 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                        </svg>
                                                        <p className="text-[10px] opacity-60 text-center px-2 truncate w-full">{entry.file_name}</p>
                                                    </div>
                                                ) : (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={entry.preview} alt={entry.file_name} className="w-full h-full object-cover" />
                                                )}

                                                {/* Overlay — uploading / done / error */}
                                                {entry.uploading && (
                                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    </div>
                                                )}
                                                {entry.uploaded && (
                                                    <div className="absolute bottom-2 left-2 bg-teal-500 text-white text-[10px] font-semibold rounded-full px-2 py-0.5 flex items-center gap-1">
                                                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                                        Uploaded
                                                    </div>
                                                )}
                                                {entry.error && (
                                                    <div className="absolute inset-0 bg-red-500/80 flex items-center justify-center p-2">
                                                        <p className="text-white text-[10px] text-center">{entry.error}</p>
                                                    </div>
                                                )}

                                                {/* File info bar */}
                                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 pt-4 pb-1.5">
                                                    <p className="text-[10px] text-white truncate">{entry.file_name}</p>
                                                    <p className="text-[9px] text-white/60">{entry.file_size_kb < 1024 ? `${entry.file_size_kb} KB` : `${(entry.file_size_kb / 1024).toFixed(1)} MB`}</p>
                                                </div>

                                                {/* Remove button */}
                                                {!entry.uploading && (
                                                    <button type="button" onClick={() => removeFile(entry.id)}
                                                        className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/50 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-colors">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {mediaFiles.length === 0 && (
                                    <p className="text-xs text-gray-400 text-center">No media added — you can skip this step.</p>
                                )}
                            </div>
                            <div className="px-6 py-4 bg-gray-50/50 flex justify-between">
                                <button type="button" onClick={() => setStep(3)} className="px-6 py-2.5 text-sm font-semibold text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">← Back</button>
                                <button type="button" onClick={() => setStep(5)} className="px-6 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-colors">
                                    {mediaFiles.length > 0 ? 'Next →' : 'Skip →'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── Step 5: Review & Submit ── */}
                    {step === 5 && (
                        <div className="space-y-4">
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="px-6 py-5 border-b border-gray-50">
                                    <h2 className="text-sm font-semibold text-gray-700">Review your report</h2>
                                    <p className="text-xs text-gray-400 mt-0.5">Check everything looks correct before submitting.</p>
                                </div>
                                <div className="px-6 py-5 space-y-4">
                                    {[
                                        { label: 'Organization', value: form.org_name },
                                        { label: 'Category', value: categories.find(c => c.id === form.category_id)?.name ?? form.category_id },
                                        { label: 'Issue Title', value: form.title },
                                    ].map(f => (
                                        <div key={f.label} className="flex gap-4">
                                            <p className="text-xs font-semibold text-gray-400 w-24 flex-shrink-0 mt-0.5">{f.label}</p>
                                            <p className="text-xs text-gray-700 font-medium">{f.value}</p>
                                        </div>
                                    ))}
                                    <div className="flex gap-4">
                                        <p className="text-xs font-semibold text-gray-400 w-24 flex-shrink-0 mt-0.5">Description</p>
                                        <p className="text-xs text-gray-700 leading-relaxed">{form.description}</p>
                                    </div>
                                    {form.latitude !== null && form.longitude !== null && (
                                        <div className="flex gap-4">
                                            <p className="text-xs font-semibold text-gray-400 w-24 flex-shrink-0 mt-0.5">Location</p>
                                            <p className="text-xs font-mono text-teal-700 font-semibold">{form.latitude.toFixed(6)}, {form.longitude.toFixed(6)}</p>
                                        </div>
                                    )}
                                    {mediaFiles.length > 0 && (
                                        <div className="flex gap-4">
                                            <p className="text-xs font-semibold text-gray-400 w-24 flex-shrink-0 mt-0.5">Media</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {mediaFiles.map(f => (
                                                    <span key={f.id} className={`text-[10px] font-semibold rounded-full px-2.5 py-1 ${f.isVideo ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
                                                        {f.isVideo ? '🎥' : '🖼️'} {f.file_name.length > 20 ? f.file_name.substring(0, 18) + '…' : f.file_name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-teal-50 border border-teal-100 rounded-2xl px-5 py-4">
                                <p className="text-xs text-teal-700">✅ By submitting, you confirm this information is accurate. You&apos;ll receive a tracking ID after submission.</p>
                            </div>

                            <div className="flex gap-3">
                                <button type="button" disabled={submitting} onClick={() => setStep(4)}
                                    className="flex-1 py-3 text-sm font-semibold text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50">
                                    ← Edit
                                </button>
                                <button type="submit" disabled={submitting}
                                    className="flex-1 py-3 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-colors disabled:opacity-70 flex items-center justify-center gap-2">
                                    {submitting
                                        ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Submitting...</>
                                        : 'Submit Report'}
                                </button>
                            </div>
                            {submitError && <p className="text-xs text-red-500 text-center mt-2">{submitError}</p>}
                        </div>
                    )}
                </form>
            </main>
        </div>
    )
}
