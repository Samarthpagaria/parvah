'use client'

import { useState, use } from 'react'
import Link from 'next/link'

type IssueStatus = 'open' | 'in-progress' | 'review' | 'resolved'

const statusConfig: Record<IssueStatus, { label: string; color: string; dot: string; bg: string }> = {
    'open': { label: 'Open', color: 'text-orange-600', dot: 'bg-orange-400', bg: 'bg-orange-50' },
    'in-progress': { label: 'In Progress', color: 'text-blue-600', dot: 'bg-blue-500', bg: 'bg-blue-50' },
    'review': { label: 'Under Review', color: 'text-purple-600', dot: 'bg-purple-500', bg: 'bg-purple-50' },
    'resolved': { label: 'Resolved', color: 'text-teal-600', dot: 'bg-teal-500', bg: 'bg-teal-50' },
}

const mockIssueData: Record<string, {
    id: string; title: string; category: string; priority: string
    status: IssueStatus; location: string; landmark?: string
    submittedAt: string; description: string; assignedTo?: string
    activity: { actor: string; action: string; time: string; note?: string; type: string }[]
}> = {
    'ISS-001': {
        id: 'ISS-001', title: 'Large pothole outside my building', category: 'Road Maintenance',
        priority: 'High', status: 'in-progress', location: '12B, MG Road, Koramangala',
        landmark: 'Opposite to Apollo Pharmacy', submittedAt: 'March 01, 2024 · 09:45 AM',
        description: 'There is a large pothole right outside the main entrance of my building on MG Road. It has been causing problems for vehicles and is a safety hazard, especially at night when visibility is low.',
        assignedTo: 'Tom Davis',
        activity: [
            { actor: 'Tom Davis', action: 'Added a progress note', time: '2 hours ago', note: 'Inspected the site. Damage is significant. Ordered repair materials — asphalt and compactor. Work scheduled for tomorrow morning.', type: 'note' },
            { actor: 'City Municipality', action: 'Assigned to Tom Davis', time: '5 hours ago', type: 'assign' },
            { actor: 'City Municipality', action: 'Status updated to In Progress', time: '5 hours ago', type: 'status' },
            { actor: 'System', action: 'Issue received and logged', time: 'Mar 01, 09:45 AM', type: 'created' },
        ],
    },
    'ISS-002': {
        id: 'ISS-002', title: 'Street light not working for 2 weeks', category: 'Street Lighting',
        priority: 'Medium', status: 'open', location: 'Park Avenue, Indiranagar',
        submittedAt: 'March 03, 2024 · 06:12 PM',
        description: 'The street light near the park end of Park Avenue has not been working for over two weeks. This makes it very unsafe to walk at night, especially for residents returning from work late.',
        activity: [
            { actor: 'System', action: 'Issue received and logged', time: 'Mar 03, 06:12 PM', type: 'created' },
        ],
    },
    'ISS-003': {
        id: 'ISS-003', title: 'Overflowing garbage bin at bus stop', category: 'Cleanliness',
        priority: 'Medium', status: 'review', location: 'Bus Stop 42, BTM Layout',
        submittedAt: 'February 28, 2024 · 11:30 AM',
        description: 'The garbage bin at the bus stop has been overflowing for 3 consecutive days with no collection. It is causing unhygienic conditions and an unpleasant smell for commuters.',
        assignedTo: 'Priya Mehta',
        activity: [
            { actor: 'Priya Mehta', action: 'Issue is being reviewed', time: '3 hours ago', note: 'Visited the site. Escalating to the Waste Management department for priority collection.', type: 'note' },
            { actor: 'City Municipality', action: 'Status updated to Under Review', time: '3 hours ago', type: 'status' },
            { actor: 'City Municipality', action: 'Assigned to Priya Mehta', time: '1 day ago', type: 'assign' },
            { actor: 'System', action: 'Issue received and logged', time: 'Feb 28, 11:30 AM', type: 'created' },
        ],
    },
}

// Fallback for new issues
const defaultIssue = {
    id: 'NEW', title: 'Your recently submitted issue', category: 'Miscellaneous',
    priority: 'Medium', status: 'open' as IssueStatus, location: 'To be confirmed',
    submittedAt: 'Just now',
    description: 'Your issue has been submitted and is awaiting review by the municipal team.',
    activity: [
        { actor: 'System', action: 'Issue received and logged', time: 'Just now', type: 'created' },
    ],
}

export default function IssueDetailPage({ params }: { params: Promise<{ issueId: string }> }) {
    const { issueId } = use(params)
    const issue = mockIssueData[issueId] ?? { ...defaultIssue, id: issueId }
    const s = statusConfig[issue.status]

    const [comment, setComment] = useState('')
    const [comments, setComments] = useState<{ text: string; time: string }[]>([])
    const [submitting, setSubmitting] = useState(false)

    const handleComment = (e: React.FormEvent) => {
        e.preventDefault()
        if (!comment.trim()) return
        setSubmitting(true)
        setTimeout(() => {
            setComments(prev => [{ text: comment, time: 'Just now' }, ...prev])
            setComment('')
            setSubmitting(false)
        }, 500)
    }

    const statusSteps: IssueStatus[] = ['open', 'in-progress', 'review', 'resolved']
    const currentStep = statusSteps.indexOf(issue.status)

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
                <div className="max-w-5xl mx-auto px-6 py-3.5 flex items-center gap-3">
                    <Link href="/dashboard" className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 transition-colors text-sm font-medium">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Dashboard
                    </Link>
                    <span className="text-gray-200">/</span>
                    <span className="text-sm font-semibold text-gray-700 truncate">{issue.title}</span>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-8">
                {/* Issue header card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-semibold text-gray-400">{issue.id}</span>
                                <span className="text-gray-200">·</span>
                                <span className="text-xs font-medium text-gray-400">{issue.category}</span>
                            </div>
                            <h1 className="text-xl font-bold text-gray-900 leading-snug">{issue.title}</h1>
                        </div>
                        <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full flex-shrink-0 ${s.bg} ${s.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                            {s.label}
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            {issue.location}
                            {issue.landmark && ` · ${issue.landmark}`}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {issue.submittedAt}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            Priority: <span className="font-semibold text-gray-700">{issue.priority}</span>
                        </span>
                        {issue.assignedTo && (
                            <span className="flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Assigned to: <span className="font-semibold text-teal-700">{issue.assignedTo}</span>
                            </span>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Left: Description + Comments */}
                    <div className="lg:col-span-2 space-y-5">
                        {/* Description */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <h2 className="text-sm font-semibold text-gray-700 mb-3">Issue Description</h2>
                            <p className="text-sm text-gray-600 leading-relaxed">{issue.description}</p>
                        </div>

                        {/* Activity Log */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-50">
                                <h2 className="text-sm font-semibold text-gray-700">Activity Log</h2>
                            </div>
                            <div className="p-5 space-y-5">
                                {/* User comments first */}
                                {comments.map((c, i) => (
                                    <div key={i} className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">JD</div>
                                        <div className="flex-1 bg-teal-50 rounded-xl border border-teal-100 px-4 py-3">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <p className="text-xs font-semibold text-teal-800">You</p>
                                                <span className="text-[10px] text-gray-400">{c.time}</span>
                                            </div>
                                            <p className="text-xs text-gray-700 leading-relaxed">{c.text}</p>
                                        </div>
                                    </div>
                                ))}

                                {/* System activity */}
                                {issue.activity.map((a, i) => (
                                    <div key={i} className="flex gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${a.type === 'resolve' ? 'bg-teal-100' :
                                            a.type === 'created' ? 'bg-gray-100' :
                                                a.type === 'note' ? 'bg-blue-100' : 'bg-orange-100'
                                            }`}>
                                            {a.type === 'note' ? (
                                                <span className="text-blue-600 text-xs font-bold">{a.actor.charAt(0)}</span>
                                            ) : a.type === 'created' ? (
                                                <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                            ) : (
                                                <svg className="w-3.5 h-3.5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="text-xs font-semibold text-gray-700">{a.actor}</p>
                                                <span className="text-[10px] text-gray-400">{a.time}</span>
                                            </div>
                                            <p className="text-xs text-gray-500">{a.action}</p>
                                            {a.note && (
                                                <div className="mt-2 bg-gray-50 rounded-xl border border-gray-100 px-4 py-3">
                                                    <p className="text-xs text-gray-600 leading-relaxed">{a.note}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Add Comment */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <h2 className="text-sm font-semibold text-gray-700 mb-3">Add Information or Comment</h2>
                            <form onSubmit={handleComment} className="space-y-3">
                                <textarea
                                    rows={3}
                                    value={comment}
                                    onChange={e => setComment(e.target.value)}
                                    placeholder="Add any additional details, updates, or questions about this issue..."
                                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all resize-none"
                                />
                                <div className="flex justify-end">
                                    <button type="submit" disabled={!comment.trim() || submitting}
                                        className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                                        {submitting ? (
                                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                            </svg>
                                        )}
                                        {submitting ? 'Sending...' : 'Send'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Right: Status tracker */}
                    <div className="space-y-4">
                        {/* Status Progress */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <h2 className="text-sm font-semibold text-gray-700 mb-5">Issue Status</h2>
                            <div className="space-y-0">
                                {statusSteps.map((status, idx) => {
                                    const sc = statusConfig[status]
                                    const isDone = idx < currentStep
                                    const isCurrent = idx === currentStep
                                    return (
                                        <div key={status} className="flex gap-3">
                                            <div className="flex flex-col items-center">
                                                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2 transition-all ${isDone ? 'bg-teal-500 border-teal-500' :
                                                    isCurrent ? `${sc.bg} border-current` : 'bg-white border-gray-200'
                                                    }`}>
                                                    {isDone ? (
                                                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    ) : (
                                                        <span className={`w-2 h-2 rounded-full ${isCurrent ? sc.dot : 'bg-gray-200'}`} />
                                                    )}
                                                </div>
                                                {idx < statusSteps.length - 1 && (
                                                    <div className={`w-0.5 h-8 ${isDone ? 'bg-teal-300' : 'bg-gray-100'}`} />
                                                )}
                                            </div>
                                            <div className="pb-5">
                                                <p className={`text-xs font-semibold ${isCurrent ? sc.color : isDone ? 'text-teal-600' : 'text-gray-400'}`}>
                                                    {sc.label}
                                                    {isCurrent && <span className="ml-1.5 text-[10px] font-medium opacity-70">← Current</span>}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Quick info */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
                            <h2 className="text-sm font-semibold text-gray-700">Details</h2>
                            {[
                                { label: 'Issue ID', value: issue.id },
                                { label: 'Category', value: issue.category },
                                { label: 'Priority', value: issue.priority },
                                { label: 'Submitted', value: issue.submittedAt },
                                { label: 'Assigned To', value: issue.assignedTo ?? 'Pending assignment' },
                            ].map(d => (
                                <div key={d.label} className="flex justify-between gap-2">
                                    <span className="text-[11px] font-medium text-gray-400">{d.label}</span>
                                    <span className="text-[11px] font-semibold text-gray-700 text-right">{d.value}</span>
                                </div>
                            ))}
                        </div>

                        {/* Need help? */}
                        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl border border-teal-100 p-4">
                            <p className="text-xs font-semibold text-teal-700 mb-1">Need urgent help?</p>
                            <p className="text-xs text-teal-600 leading-relaxed">
                                For life-threatening situations, call <span className="font-bold">112</span> immediately. For civic emergencies, contact your local municipal helpline.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
