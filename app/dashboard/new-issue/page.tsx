'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { issueAPI, orgAPI } from '@/utils/backend_api_endpoints'

const priorities = [
    { value: 'low', label: 'Low', desc: 'Minor inconvenience', color: 'border-blue-200 bg-blue-50 text-blue-700', dot: 'bg-blue-400' },
    { value: 'medium', label: 'Medium', desc: 'Needs attention soon', color: 'border-yellow-200 bg-yellow-50 text-yellow-700', dot: 'bg-yellow-400' },
    { value: 'high', label: 'High', desc: 'Affecting daily life', color: 'border-orange-200 bg-orange-50 text-orange-700', dot: 'bg-orange-400' },
    { value: 'critical', label: 'Critical', desc: 'Safety hazard / urgent', color: 'border-red-200 bg-red-50 text-red-700', dot: 'bg-red-500' },
]

// -------------------------------------------------------------------
// MapLocation component — Leaflet loaded via CDN
// -------------------------------------------------------------------
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
        const map = L.map(mapRef.current, { center: [12.9716, 77.5946], zoom: 13, zoomControl: true, scrollWheelZoom: true })
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
        if (!navigator.geolocation) { setGeoError('Geolocation is not supported by your browser.'); setLocating(false); return }
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude: lat, longitude: lng } = position.coords
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const L = (window as any).L
                if (leafletMapRef.current && L) {
                    if (markerRef.current) { markerRef.current.remove(); markerRef.current = null }
                    const icon = L.divIcon({
                        html: `<div style="width:32px;height:32px;background:linear-gradient(135deg,#0d9488,#22d3ee);border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
                        className: '', iconSize: [32, 32], iconAnchor: [16, 32],
                    })
                    const marker = L.marker([lat, lng], { icon }).addTo(leafletMapRef.current)
                    markerRef.current = marker
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
                if (err.code === 1) setGeoError('Location permission denied. Please allow location access in your browser.')
                else if (err.code === 2) setGeoError('Unable to determine your location. Please try again.')
                else setGeoError('Location request timed out. Please try again.')
                setLocating(false)
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        )
    }

    return (
        <div className="space-y-3">
            <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                <div ref={mapRef} style={{ height: '260px', width: '100%', background: '#e5e7eb' }} />
                {!leafletReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                            <p className="text-xs text-gray-400">Loading map...</p>
                        </div>
                    </div>
                )}
            </div>
            <button type="button" onClick={handleUseMyLocation} disabled={locating}
                className="flex items-center gap-2.5 w-full justify-center px-5 py-3 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-60 rounded-xl shadow-sm transition-colors">
                {locating ? (
                    <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Detecting your location...</>
                ) : (
                    <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>Use My Location</>
                )}
            </button>
            {geoError && (
                <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 text-red-700 rounded-xl px-4 py-3">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-xs">{geoError}</p>
                </div>
            )}
            {latitude !== null && longitude !== null && !geoError && (
                <div className="flex items-start gap-2.5 bg-teal-50 border border-teal-100 rounded-xl px-4 py-3">
                    <svg className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                        <p className="text-xs font-semibold text-teal-800">Location detected</p>
                        {locationLabel && <p className="text-[11px] text-teal-600 mt-0.5 leading-relaxed line-clamp-2">{locationLabel}</p>}
                        <p className="text-[10px] text-teal-500 mt-0.5 font-mono">{latitude.toFixed(6)}, {longitude.toFixed(6)}</p>
                    </div>
                </div>
            )}
            {latitude === null && !geoError && (
                <p className="text-xs text-gray-400 text-center">
                    Click <span className="font-semibold text-gray-600">&quot;Use My Location&quot;</span> to pin your exact location on the map.
                </p>
            )}
        </div>
    )
}

// Step label config
const STEPS = [
    { num: 1, label: 'Organization' },
    { num: 2, label: 'Issue Details' },
    { num: 3, label: 'Location' },
    { num: 4, label: 'Review' },
]

// -------------------------------------------------------------------
// Main New Issue Page
// -------------------------------------------------------------------
export default function NewIssuePage() {
    const [form, setForm] = useState({
        org_id: '',
        org_name: '',
        title: '',
        category_id: '',
        priority: 'medium',
        description: '',
        latitude: null as number | null,
        longitude: null as number | null,
        contactPreference: 'email',
    })
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
    const [submitted, setSubmitted] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [newId, setNewId] = useState('')

    // Organizations list
    const [organizations, setOrganizations] = useState<{ id: string; name: string }[]>([])
    const [orgsLoading, setOrgsLoading] = useState(true)

    // Categories — loaded dynamically when org is selected
    const [categories, setCategories] = useState<{ id: string; name: string; color: string }[]>([])
    const [catsLoading, setCatsLoading] = useState(false)

    // Fetch active organizations on mount
    useEffect(() => {
        setOrgsLoading(true)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        orgAPI.listActive()
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .then((res: any) => setOrganizations(res.organizations || []))
            .catch(() => setOrganizations([]))
            .finally(() => setOrgsLoading(false))
    }, [])

    // Fetch categories whenever org changes
    useEffect(() => {
        if (!form.org_id) { setCategories([]); return }
        setCatsLoading(true)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        orgAPI.listCategoriesByOrg(form.org_id)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .then((res: any) => setCategories(res.categories || []))
            .catch(() => setCategories([]))
            .finally(() => setCatsLoading(false))
    }, [form.org_id])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
        setError('')
    }

    const handleOrgSelect = (id: string, name: string) => {
        setForm(prev => ({ ...prev, org_id: id, org_name: name, category_id: '' }))
        setError('')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const res = await (issueAPI as any).report({
                org_id: form.org_id,
                title: form.title,
                category_id: form.category_id || undefined,
                priority: form.priority,
                description: form.description,
                latitude: form.latitude,
                longitude: form.longitude,
            })
            setNewId(res.issue?.id || res.id)
            setSubmitted(true)
        } catch (err: unknown) {
            setError((err as Error).message || 'Failed to submit report. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    // Step gate conditions
    const canNext1 = !!form.org_id
    const canNext2 = !!form.title && !!form.category_id && !!form.priority
    const canNext3 = !!form.description && form.latitude !== null && form.longitude !== null

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
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Issue Reported!</h2>
                    <p className="text-sm text-gray-500 mb-1">Your issue has been submitted successfully.</p>
                    <p className="text-xs font-semibold text-teal-700 mb-1">Organization: {form.org_name}</p>
                    <p className="text-xs font-semibold text-teal-600 mb-1">Tracking ID: {newId}</p>
                    {form.latitude !== null && (
                        <p className="text-[10px] text-gray-400 mb-6 font-mono">
                            📍 {form.latitude.toFixed(5)}, {form.longitude?.toFixed(5)}
                        </p>
                    )}
                    <div className="space-y-2">
                        <Link href={`/dashboard/issues/${newId}`}>
                            <button className="w-full py-3 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-sm">
                                Track This Issue
                            </button>
                        </Link>
                        <Link href="/dashboard">
                            <button className="w-full py-3 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                                Back to Dashboard
                            </button>
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
                    <Link href="/dashboard"
                        className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 transition-colors text-sm font-medium">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
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
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step > s.num ? 'bg-teal-600 text-white' : step === s.num ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-400'
                                    }`}>
                                    {step > s.num ? (
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : s.num}
                                </div>
                                <span className="text-xs font-semibold hidden sm:block">{s.label}</span>
                            </div>
                            {idx < STEPS.length - 1 && <div className={`h-px w-6 sm:w-10 ${step > s.num ? 'bg-teal-400' : 'bg-gray-200'}`} />}
                        </div>
                    ))}
                </div>

                <form onSubmit={handleSubmit}>

                    {/* ── Step 1: Select Organization ── */}
                    {step === 1 && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-50">
                                <h2 className="text-sm font-semibold text-gray-700">Which organization should handle this issue?</h2>
                                <p className="text-xs text-gray-400 mt-0.5">Select the municipal or civic organization responsible for this area.</p>
                            </div>
                            <div className="px-6 py-5">
                                {orgsLoading ? (
                                    <div className="flex items-center justify-center py-10 gap-3 text-gray-400">
                                        <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                                        <span className="text-sm">Loading organizations...</span>
                                    </div>
                                ) : organizations.length === 0 ? (
                                    <div className="text-center py-8 text-gray-400 text-sm">No active organizations found.</div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {organizations.map(org => (
                                            <button key={org.id} type="button"
                                                onClick={() => handleOrgSelect(org.id, org.name)}
                                                className={`text-left px-4 py-4 rounded-xl border-2 transition-all ${form.org_id === org.id
                                                        ? 'border-teal-500 bg-teal-50 text-teal-800'
                                                        : 'border-gray-100 hover:border-gray-300 text-gray-700 bg-white'
                                                    }`}>
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${form.org_id === org.id ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-500'
                                                        }`}>
                                                        {org.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="text-sm font-semibold leading-snug">{org.name}</span>
                                                </div>
                                                {form.org_id === org.id && (
                                                    <div className="mt-2 flex items-center gap-1 text-teal-600 text-xs font-semibold">
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                                        </svg>
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

                    {/* ── Step 2: Issue Details (Category, Title, Priority) ── */}
                    {step === 2 && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-50">
                                <h2 className="text-sm font-semibold text-gray-700">What&apos;s the issue?</h2>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Reporting to: <span className="font-semibold text-teal-700">{form.org_name}</span>
                                </p>
                            </div>
                            <div className="px-6 py-5 space-y-5">
                                {/* Category */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                        Category <span className="text-red-400">*</span>
                                    </label>
                                    {catsLoading ? (
                                        <div className="flex items-center gap-2 text-gray-400 text-xs py-2">
                                            <div className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                                            Loading categories for {form.org_name}...
                                        </div>
                                    ) : (
                                        <select name="category_id" value={form.category_id} onChange={handleChange} required
                                            className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all bg-white">
                                            <option value="">Select a category...</option>
                                            {categories.length === 0 && (
                                                <option disabled value="">No categories available for this organization</option>
                                            )}
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    )}
                                </div>
                                {/* Title */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                        Issue Title <span className="text-red-400">*</span>
                                    </label>
                                    <input name="title" value={form.title} onChange={handleChange} required
                                        placeholder="Brief title describing the issue..."
                                        className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all" />
                                </div>
                                {/* Priority */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-2.5">
                                        Priority <span className="text-red-400">*</span>
                                    </label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                        {priorities.map(p => (
                                            <button key={p.value} type="button"
                                                onClick={() => setForm(f => ({ ...f, priority: p.value }))}
                                                className={`py-3 px-3 rounded-xl text-xs font-semibold border-2 transition-all text-left ${form.priority === p.value ? `${p.color} border-current` : 'border-gray-100 text-gray-400 hover:border-gray-200 bg-white'
                                                    }`}>
                                                <div className={`w-2 h-2 rounded-full mb-1.5 ${form.priority === p.value ? p.dot : 'bg-gray-300'}`} />
                                                <p>{p.label}</p>
                                                <p className="font-normal opacity-70 mt-0.5 text-[10px]">{p.desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="px-6 py-4 bg-gray-50/50 flex justify-between">
                                <button type="button" onClick={() => setStep(1)}
                                    className="px-6 py-2.5 text-sm font-semibold text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">
                                    ← Back
                                </button>
                                <button type="button" disabled={!canNext2} onClick={() => setStep(3)}
                                    className="px-6 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                                    Next →
                                </button>
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
                                {/* Description */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                        Description <span className="text-red-400">*</span>
                                    </label>
                                    <textarea name="description" value={form.description} onChange={handleChange}
                                        required rows={4}
                                        placeholder="Describe the issue in detail — what you see, how long it's been there, any safety concerns..."
                                        className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all resize-none" />
                                </div>
                                {/* Map */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-2.5">
                                        Issue Location <span className="text-red-400">*</span>
                                    </label>
                                    <MapLocationPicker
                                        latitude={form.latitude}
                                        longitude={form.longitude}
                                        onLocationDetected={(lat, lng) => setForm(prev => ({ ...prev, latitude: lat, longitude: lng }))}
                                    />
                                </div>
                                {/* Contact preference */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-2.5">Preferred Update Method</label>
                                    <div className="flex gap-3">
                                        {[['email', '📧 Email'], ['sms', '📱 SMS'], ['both', '📬 Both']].map(([val, label]) => (
                                            <button key={val} type="button"
                                                onClick={() => setForm(f => ({ ...f, contactPreference: val }))}
                                                className={`flex-1 py-2.5 text-xs font-semibold rounded-xl border-2 transition-all ${form.contactPreference === val ? 'border-teal-400 bg-teal-50 text-teal-700' : 'border-gray-100 text-gray-500 hover:border-gray-200 bg-white'
                                                    }`}>
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="px-6 py-4 bg-gray-50/50 flex justify-between">
                                <button type="button" onClick={() => setStep(2)}
                                    className="px-6 py-2.5 text-sm font-semibold text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">
                                    ← Back
                                </button>
                                <button type="button" disabled={!canNext3} onClick={() => setStep(4)}
                                    className="px-6 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                                    Review →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── Step 4: Review & Submit ── */}
                    {step === 4 && (
                        <div className="space-y-4">
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="px-6 py-5 border-b border-gray-50">
                                    <h2 className="text-sm font-semibold text-gray-700">Review your report</h2>
                                    <p className="text-xs text-gray-400 mt-0.5">Make sure all details are correct before submitting.</p>
                                </div>
                                <div className="px-6 py-5 space-y-4">
                                    {[
                                        { label: 'Organization', value: form.org_name },
                                        { label: 'Category', value: categories.find(c => c.id === form.category_id)?.name ?? form.category_id },
                                        { label: 'Issue Title', value: form.title },
                                        { label: 'Priority', value: priorities.find(p => p.value === form.priority)?.label ?? '' },
                                        { label: 'Updates via', value: form.contactPreference === 'both' ? 'Email & SMS' : form.contactPreference.toUpperCase() },
                                    ].map(f => (
                                        <div key={f.label} className="flex gap-4">
                                            <p className="text-xs font-semibold text-gray-400 w-28 flex-shrink-0 mt-0.5">{f.label}</p>
                                            <p className="text-xs text-gray-700 font-medium">{f.value}</p>
                                        </div>
                                    ))}
                                    <div className="flex gap-4">
                                        <p className="text-xs font-semibold text-gray-400 w-28 flex-shrink-0 mt-0.5">Description</p>
                                        <p className="text-xs text-gray-700 leading-relaxed">{form.description}</p>
                                    </div>
                                    {form.latitude !== null && form.longitude !== null && (
                                        <div className="flex gap-4">
                                            <p className="text-xs font-semibold text-gray-400 w-28 flex-shrink-0 mt-0.5">GPS Location</p>
                                            <div>
                                                <p className="text-xs font-mono text-teal-700 font-semibold">
                                                    {form.latitude.toFixed(6)}, {form.longitude.toFixed(6)}
                                                </p>
                                                <p className="text-[10px] text-gray-400 mt-0.5">Auto-detected via GPS</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-teal-50 border border-teal-100 rounded-2xl px-5 py-4">
                                <p className="text-xs text-teal-700 font-medium">
                                    ✅ By submitting, you confirm this information is accurate. You&apos;ll receive a tracking ID and status updates as the issue is processed.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button type="button" disabled={loading} onClick={() => setStep(3)}
                                    className="flex-1 py-3 text-sm font-semibold text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50">
                                    ← Edit
                                </button>
                                <button type="submit" disabled={loading}
                                    className="flex-1 py-3 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-colors disabled:opacity-70">
                                    {loading ? 'Submitting...' : 'Submit Report'}
                                </button>
                            </div>
                            {error && <p className="text-xs text-red-500 text-center mt-2">{error}</p>}
                        </div>
                    )}
                </form>
            </main>
        </div>
    )
}
