'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

const categories = [
    'Road Maintenance',
    'Street Lighting',
    'Water Supply',
    'Cleanliness & Sanitation',
    'Parks & Recreation',
    'Drainage & Sewage',
    'Transport & Traffic',
    'Public Safety',
    'Noise Pollution',
    'Other',
]

const priorities = [
    { value: 'low', label: 'Low', desc: 'Minor inconvenience', color: 'border-blue-200 bg-blue-50 text-blue-700', dot: 'bg-blue-400' },
    { value: 'medium', label: 'Medium', desc: 'Needs attention soon', color: 'border-yellow-200 bg-yellow-50 text-yellow-700', dot: 'bg-yellow-400' },
    { value: 'high', label: 'High', desc: 'Affecting daily life', color: 'border-orange-200 bg-orange-50 text-orange-700', dot: 'bg-orange-400' },
    { value: 'critical', label: 'Critical', desc: 'Safety hazard / urgent', color: 'border-red-200 bg-red-50 text-red-700', dot: 'bg-red-500' },
]

// -------------------------------------------------------------------
// MapLocation component — Leaflet loaded via CDN, no npm install
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

    // Load Leaflet CSS + JS from CDN once
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

    // Initialize map once Leaflet is ready
    useEffect(() => {
        if (!leafletReady || !mapRef.current || leafletMapRef.current) return

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const L = (window as any).L
        if (!L) return

        const defaultLat = 12.9716
        const defaultLng = 77.5946

        const map = L.map(mapRef.current, {
            center: [defaultLat, defaultLng],
            zoom: 13,
            zoomControl: true,
            scrollWheelZoom: true,
        })

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19,
        }).addTo(map)

        leafletMapRef.current = map

        // If location already set (e.g. revisiting step), show marker
        if (latitude !== null && longitude !== null) {
            const marker = L.marker([latitude, longitude]).addTo(map)
            markerRef.current = marker
            map.setView([latitude, longitude], 16)
        }

        return () => {
            map.remove()
            leafletMapRef.current = null
            markerRef.current = null
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [leafletReady])

    const handleUseMyLocation = () => {
        setGeoError('')
        setLocating(true)

        if (!navigator.geolocation) {
            setGeoError('Geolocation is not supported by your browser.')
            setLocating(false)
            return
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude: lat, longitude: lng } = position.coords
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const L = (window as any).L

                if (leafletMapRef.current && L) {
                    // Remove old marker
                    if (markerRef.current) {
                        markerRef.current.remove()
                        markerRef.current = null
                    }

                    // Create custom icon
                    const icon = L.divIcon({
                        html: `<div style="
              width:32px;height:32px;
              background:linear-gradient(135deg,#0d9488,#22d3ee);
              border-radius:50% 50% 50% 0;
              transform:rotate(-45deg);
              border:3px solid white;
              box-shadow:0 2px 8px rgba(0,0,0,0.3);
            "></div>`,
                        className: '',
                        iconSize: [32, 32],
                        iconAnchor: [16, 32],
                    })

                    const marker = L.marker([lat, lng], { icon }).addTo(leafletMapRef.current)
                    markerRef.current = marker
                    leafletMapRef.current.setView([lat, lng], 17, { animate: true })
                }

                // Reverse geocode using Nominatim (free, no API key)
                try {
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
                    )
                    const data = await res.json()
                    const label = data.display_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`
                    setLocationLabel(label)
                } catch {
                    setLocationLabel(`${lat.toFixed(5)}, ${lng.toFixed(5)}`)
                }

                onLocationDetected(lat, lng)
                setLocating(false)
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
            {/* Map container */}
            <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                <div
                    ref={mapRef}
                    style={{ height: '280px', width: '100%', background: '#e5e7eb' }}
                />
                {!leafletReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                            <p className="text-xs text-gray-400">Loading map...</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Use My Location button */}
            <button
                type="button"
                onClick={handleUseMyLocation}
                disabled={locating}
                className="flex items-center gap-2.5 w-full justify-center px-5 py-3 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-60 rounded-xl shadow-sm transition-colors"
            >
                {locating ? (
                    <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Detecting your location...
                    </>
                ) : (
                    <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Use My Location
                    </>
                )}
            </button>

            {/* Geo error */}
            {geoError && (
                <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 text-red-700 rounded-xl px-4 py-3">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-xs">{geoError}</p>
                </div>
            )}

            {/* Detected location label */}
            {latitude !== null && longitude !== null && !geoError && (
                <div className="flex items-start gap-2.5 bg-teal-50 border border-teal-100 rounded-xl px-4 py-3">
                    <svg className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                        <p className="text-xs font-semibold text-teal-800">Location detected</p>
                        {locationLabel && (
                            <p className="text-[11px] text-teal-600 mt-0.5 leading-relaxed line-clamp-2">{locationLabel}</p>
                        )}
                        <p className="text-[10px] text-teal-500 mt-0.5 font-mono">
                            {latitude.toFixed(6)}, {longitude.toFixed(6)}
                        </p>
                    </div>
                </div>
            )}

            {latitude === null && !geoError && (
                <p className="text-xs text-gray-400 text-center">
                    Click <span className="font-semibold text-gray-600">"Use My Location"</span> to pin your exact location on the map.
                </p>
            )}
        </div>
    )
}

// -------------------------------------------------------------------
// Main New Issue Page
// -------------------------------------------------------------------
export default function NewIssuePage() {
    const [form, setForm] = useState({
        title: '',
        category: '',
        priority: 'medium',
        description: '',
        latitude: null as number | null,
        longitude: null as number | null,
        contactPreference: 'email',
    })
    const [step, setStep] = useState<1 | 2 | 3>(1)
    const [submitted, setSubmitted] = useState(false)
    const [newId] = useState(`ISS-00${Math.floor(Math.random() * 9) + 5}`)

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // The form state for submission:
        // { title, category, priority, description, latitude, longitude, contactPreference }
        setSubmitted(true)
    }

    const canNext1 = !!form.title && !!form.category && !!form.priority
    const canNext2 = !!form.description && form.latitude !== null && form.longitude !== null

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
                    <p className="text-sm text-gray-500 mt-1">Help us improve your community by reporting civic problems.</p>
                </div>

                {/* Step indicator */}
                <div className="flex items-center gap-3 mb-8">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center gap-3">
                            <div className={`flex items-center gap-2 ${step >= s ? 'text-gray-800' : 'text-gray-400'}`}>
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step > s ? 'bg-teal-600 text-white' : step === s ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-400'
                                    }`}>
                                    {step > s ? (
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : s}
                                </div>
                                <span className="text-xs font-semibold hidden sm:block">
                                    {s === 1 ? 'Issue Details' : s === 2 ? 'Location & Info' : 'Review & Submit'}
                                </span>
                            </div>
                            {s < 3 && <div className={`h-px w-8 ${step > s ? 'bg-teal-400' : 'bg-gray-200'}`} />}
                        </div>
                    ))}
                </div>

                <form onSubmit={handleSubmit}>
                    {/* ── Step 1: Issue Details ── */}
                    {step === 1 && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-50">
                                <h2 className="text-sm font-semibold text-gray-700">What's the issue?</h2>
                            </div>
                            <div className="px-6 py-5 space-y-5">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                        Issue Title <span className="text-red-400">*</span>
                                    </label>
                                    <input name="title" value={form.title} onChange={handleChange} required
                                        placeholder="Brief title describing the issue..."
                                        className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                        Category <span className="text-red-400">*</span>
                                    </label>
                                    <select name="category" value={form.category} onChange={handleChange} required
                                        className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all bg-white">
                                        <option value="">Select a category...</option>
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-2.5">
                                        Priority <span className="text-red-400">*</span>
                                    </label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                        {priorities.map(p => (
                                            <button key={p.value} type="button"
                                                onClick={() => setForm(f => ({ ...f, priority: p.value }))}
                                                className={`py-3 px-3 rounded-xl text-xs font-semibold border-2 transition-all text-left ${form.priority === p.value
                                                        ? `${p.color} border-current`
                                                        : 'border-gray-100 text-gray-400 hover:border-gray-200 bg-white'
                                                    }`}>
                                                <div className={`w-2 h-2 rounded-full mb-1.5 ${form.priority === p.value ? p.dot : 'bg-gray-300'}`} />
                                                <p>{p.label}</p>
                                                <p className="font-normal opacity-70 mt-0.5 text-[10px]">{p.desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="px-6 py-4 bg-gray-50/50 flex justify-end">
                                <button type="button" disabled={!canNext1} onClick={() => setStep(2)}
                                    className="px-6 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                                    Next →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── Step 2: Description + Map Location ── */}
                    {step === 2 && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-50">
                                <h2 className="text-sm font-semibold text-gray-700">Describe & locate the issue</h2>
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

                                {/* Map Location */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-2.5">
                                        Issue Location <span className="text-red-400">*</span>
                                    </label>
                                    <MapLocationPicker
                                        latitude={form.latitude}
                                        longitude={form.longitude}
                                        onLocationDetected={(lat, lng) =>
                                            setForm(prev => ({ ...prev, latitude: lat, longitude: lng }))
                                        }
                                    />
                                </div>

                                {/* Contact preference */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-2.5">
                                        Preferred Update Method
                                    </label>
                                    <div className="flex gap-3">
                                        {[['email', '📧 Email'], ['sms', '📱 SMS'], ['both', '📬 Both']].map(([val, label]) => (
                                            <button key={val} type="button"
                                                onClick={() => setForm(f => ({ ...f, contactPreference: val }))}
                                                className={`flex-1 py-2.5 text-xs font-semibold rounded-xl border-2 transition-all ${form.contactPreference === val
                                                        ? 'border-teal-400 bg-teal-50 text-teal-700'
                                                        : 'border-gray-100 text-gray-500 hover:border-gray-200 bg-white'
                                                    }`}>
                                                {label}
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
                                    Review →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── Step 3: Review & Submit ── */}
                    {step === 3 && (
                        <div className="space-y-4">
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="px-6 py-5 border-b border-gray-50">
                                    <h2 className="text-sm font-semibold text-gray-700">Review your report</h2>
                                    <p className="text-xs text-gray-400 mt-0.5">Make sure all details are correct before submitting.</p>
                                </div>
                                <div className="px-6 py-5 space-y-4">
                                    {[
                                        { label: 'Issue Title', value: form.title },
                                        { label: 'Category', value: form.category },
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
                                <button type="button" onClick={() => setStep(2)}
                                    className="flex-1 py-3 text-sm font-semibold text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                                    ← Edit
                                </button>
                                <button type="submit"
                                    className="flex-1 py-3 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-colors">
                                    Submit Report
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </main>
        </div>
    )
}
