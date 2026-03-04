'use client'

import { useState } from 'react'
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

export default function NewIssuePage() {
    const [form, setForm] = useState({
        title: '',
        category: '',
        priority: 'medium',
        description: '',
        location: '',
        landmark: '',
        contactPreference: 'email',
    })
    const [step, setStep] = useState<1 | 2 | 3>(1)
    const [submitted, setSubmitted] = useState(false)
    const [newId] = useState(`ISS-00${Math.floor(Math.random() * 9) + 5}`)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitted(true)
    }

    const canNext1 = form.title && form.category && form.priority
    const canNext2 = form.description && form.location

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
                    <p className="text-xs font-semibold text-teal-600 mb-6">Tracking ID: {newId}</p>
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
                    <Link href="/dashboard" className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 transition-colors text-sm font-medium">
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
                            {s < 3 && <div className={`flex-1 h-px w-8 ${step > s ? 'bg-teal-400' : 'bg-gray-200'}`} />}
                        </div>
                    ))}
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Step 1 */}
                    {step === 1 && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-50">
                                <h2 className="text-sm font-semibold text-gray-700">What's the issue?</h2>
                            </div>
                            <div className="px-6 py-5 space-y-5">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Issue Title <span className="text-red-400">*</span></label>
                                    <input name="title" value={form.title} onChange={handleChange} required
                                        placeholder="Brief title describing the issue..."
                                        className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Category <span className="text-red-400">*</span></label>
                                    <select name="category" value={form.category} onChange={handleChange} required
                                        className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all bg-white">
                                        <option value="">Select a category...</option>
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-2.5">Priority <span className="text-red-400">*</span></label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                        {priorities.map(p => (
                                            <button key={p.value} type="button" onClick={() => setForm(f => ({ ...f, priority: p.value }))}
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
                            <div className="px-6 py-4 bg-gray-50/50 flex justify-end">
                                <button type="button" disabled={!canNext1} onClick={() => setStep(2)}
                                    className="px-6 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                                    Next →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2 */}
                    {step === 2 && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-50">
                                <h2 className="text-sm font-semibold text-gray-700">Where & what happened?</h2>
                            </div>
                            <div className="px-6 py-5 space-y-5">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description <span className="text-red-400">*</span></label>
                                    <textarea name="description" value={form.description} onChange={handleChange} required rows={4}
                                        placeholder="Describe the issue in detail — what you see, how long it's been there, any safety concerns..."
                                        className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all resize-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Location / Address <span className="text-red-400">*</span></label>
                                    <input name="location" value={form.location} onChange={handleChange} required
                                        placeholder="e.g. 12B, MG Road, Koramangala, Bengaluru"
                                        className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nearby Landmark (optional)</label>
                                    <input name="landmark" value={form.landmark} onChange={handleChange}
                                        placeholder="e.g. Opposite to Apollo Pharmacy"
                                        className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-2.5">Preferred Update Method</label>
                                    <div className="flex gap-3">
                                        {[['email', '📧 Email'], ['sms', '📱 SMS'], ['both', '📬 Both']].map(([val, label]) => (
                                            <button key={val} type="button" onClick={() => setForm(f => ({ ...f, contactPreference: val }))}
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

                    {/* Step 3: Review */}
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
                                        { label: 'Location', value: form.location },
                                        { label: 'Landmark', value: form.landmark || '—' },
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
                                </div>
                            </div>

                            <div className="bg-teal-50 border border-teal-100 rounded-2xl px-5 py-4">
                                <p className="text-xs text-teal-700 font-medium">
                                    ✅ By submitting, you confirm this information is accurate. You'll receive a tracking ID and status updates as the issue is processed.
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
