'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type IssueStatus = 'open' | 'in-progress' | 'review' | 'resolved'

const statusConfig: Record<IssueStatus, { label: string; color: string; dot: string; bg: string; border: string }> = {
    'open':        { label: 'Open',         color: 'text-amber-600',    dot: 'bg-amber-400',   bg: 'bg-amber-50',   border: 'border-amber-200' },
    'in-progress': { label: 'In Progress',  color: 'text-[#576CDB]',    dot: 'bg-[#576CDB]',   bg: 'bg-[#576CDB]/10', border: 'border-[#576CDB]/20' },
    'review':      { label: 'Under Review', color: 'text-purple-600',   dot: 'bg-purple-500',  bg: 'bg-purple-50',  border: 'border-purple-200' },
    'resolved':    { label: 'Resolved',     color: 'text-[#088395]',    dot: 'bg-[#088395]',   bg: 'bg-[#088395]/10', border: 'border-[#088395]/20' },
}

const priorityConfig: Record<string, { color: string; bg: string }> = {
    'High':   { color: 'text-[#F25A5A]', bg: 'bg-[#F25A5A]/10' },
    'Medium': { color: 'text-amber-600', bg: 'bg-amber-50' },
    'Low':    { color: 'text-[#088395]',  bg: 'bg-[#088395]/10' },
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
        description: 'There is a large pothole right outside the main entrance of my building on MG Road. It has been causing problems for vehicles and is a safety hazard, especially at night when visibility is low. Multiple residents have already raised concerns locally.',
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

const defaultIssue = {
    id: 'NEW', title: 'Your recently submitted issue', category: 'Miscellaneous',
    priority: 'Medium', status: 'open' as IssueStatus, location: 'To be confirmed',
    submittedAt: 'Just now',
    description: 'Your issue has been submitted and is awaiting review by the municipal team.',
    activity: [{ actor: 'System', action: 'Issue received and logged', time: 'Just now', type: 'created' }],
}

const activityIconConfig: Record<string, { bg: string; icon: React.ReactNode }> = {
    note:    { bg: 'bg-[#576CDB]/10 text-[#576CDB]', icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg> },
    assign:  { bg: 'bg-amber-50 text-amber-500', icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
    status:  { bg: 'bg-purple-50 text-purple-500', icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg> },
    created: { bg: 'bg-[#088395]/10 text-[#088395]', icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
}

export default function IssueDetailPage({ params }: { params: { issueId: string } }) {
    const { issueId } = params
    const issue = mockIssueData[issueId] ?? { ...defaultIssue, id: issueId }
    const s = statusConfig[issue.status]
    const pc = priorityConfig[issue.priority] ?? priorityConfig['Medium']

    const [comment, setComment] = useState('')
    const [comments, setComments] = useState<{ text: string; time: string }[]>([])
    const [submitting, setSubmitting] = useState(false)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => { setIsMounted(true) }, [])

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
        <div className="min-h-screen bg-[#F9F9FB] font-sans">
            <style>{`
                @keyframes fadeInUp {
                  from { opacity: 0; transform: translateY(12px); }
                  to { opacity: 1; transform: translateY(0); }
                }
                .animate-up {
                  opacity: 0;
                  animation: fadeInUp 0.45s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
                }
            `}</style>

            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-6 flex items-center justify-between h-[68px]">
                    <div className="flex items-center gap-4 min-w-0">
                        <Link href="/" className="flex items-center gap-0.5 select-none group shrink-0">
                            <span className="text-[17px] font-normal tracking-[-0.04em] text-[#201F47]">par</span><span className="text-[17px] font-normal tracking-[-0.04em] text-[#088395]">vah</span><span className="w-1.5 h-1.5 rounded-full bg-[#088395] mb-0.5 ml-0.5 self-end shrink-0 group-hover:scale-125 transition-transform" />
                        </Link>
                        <span className="text-gray-200 shrink-0">/</span>
                        <div className="flex items-center gap-2 text-[13px] font-normal text-gray-400 min-w-0">
                            <Link href="/dashboard" className="hover:text-[#201F47] transition-colors shrink-0">Dashboard</Link>
                            <span className="text-gray-200">/</span>
                            <span className="text-[#201F47] truncate">{issue.title}</span>
                        </div>
                    </div>
                    <span className={`flex items-center gap-1.5 text-[12px] font-normal px-3 py-1.5 rounded-full border shrink-0 ${s.bg} ${s.color} ${s.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        {s.label}
                    </span>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-7">

                {/* Issue Hero Card */}
                <div className={`bg-white rounded-[24px] border border-gray-100 p-6 md:p-7 mb-5 ${isMounted ? 'animate-up' : ''}`} style={{ animationDelay: '0.05s' }}>
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2.5">
                                <span className="text-[11px] font-normal text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full">{issue.id}</span>
                                <span className="text-gray-300">·</span>
                                <span className="text-[12px] font-normal text-gray-500">{issue.category}</span>
                            </div>
                            <h1 className="text-[22px] md:text-[24px] font-normal text-[#201F47] leading-snug mb-4 tracking-tight">{issue.title}</h1>
                            
                            {/* Meta row */}
                            <div className="flex flex-wrap gap-x-5 gap-y-2.5">
                                <div className="flex items-center gap-2 text-[13px] text-gray-500">
                                    <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    <span>{issue.location}{issue.landmark && <span className="text-gray-400"> · {issue.landmark}</span>}</span>
                                </div>
                                <div className="flex items-center gap-2 text-[13px] text-gray-500">
                                    <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    <span>{issue.submittedAt}</span>
                                </div>
                                {issue.assignedTo && (
                                    <div className="flex items-center gap-2 text-[13px] text-gray-500">
                                        <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                        <span>Assigned to <span className="text-[#088395]">{issue.assignedTo}</span></span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Priority badge */}
                        <div className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl text-[12px] font-normal shrink-0 self-start ${pc.bg} ${pc.color}`}>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                            {issue.priority} Priority
                        </div>
                    </div>
                </div>

                {/* Main grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Left: Description + Activity + Comment */}
                    <div className="lg:col-span-2 flex flex-col gap-5">

                        {/* Description */}
                        <div className={`bg-white rounded-[24px] border border-gray-100 p-6 ${isMounted ? 'animate-up' : ''}`} style={{ animationDelay: '0.1s' }}>
                                <p className="text-[12px] font-normal text-gray-400 uppercase tracking-wider mb-4">Description</p>
                                <p className="text-[14px] font-normal text-gray-600 leading-relaxed">{issue.description}</p>
                            </div>

                        {/* Activity Log */}
                        <div className={`bg-white rounded-[24px] border border-gray-100 overflow-hidden ${isMounted ? 'animate-up' : ''}`} style={{ animationDelay: '0.15s' }}>
                            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                                <p className="text-[11px] font-normal text-gray-400 uppercase tracking-wider">Activity Log</p>
                                <span className="text-[11px] font-normal text-gray-400">{issue.activity.length + comments.length} events</span>
                            </div>
                            <div className="p-5 space-y-1">
                                {/* User comments first */}
                                {comments.map((c, i) => (
                                    <div key={`uc-${i}`} className="flex gap-3.5 p-3 rounded-2xl bg-[#088395]/5 mb-2">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#088395] to-[#576CDB] flex items-center justify-center text-white text-[12px] font-normal shrink-0">
                                            JD
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <p className="text-[13px] font-normal text-[#201F47]">You</p>
                                                <span className="text-[11px] text-gray-400">{c.time}</span>
                                            </div>
                                            <p className="text-[13px] font-normal text-gray-600 leading-relaxed">{c.text}</p>
                                        </div>
                                    </div>
                                ))}

                                {/* System Activity Events */}
                                {issue.activity.map((a, i) => {
                                    const cfg = activityIconConfig[a.type] ?? activityIconConfig['created']
                                    return (
                                        <div key={i} className="flex gap-3.5 p-3 rounded-2xl hover:bg-gray-50/50 transition-colors">
                                            <div className={`w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0 ${cfg.bg}`}>
                                                {cfg.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <p className="text-[13px] font-normal text-[#201F47]">{a.actor}</p>
                                                    <span className="text-[11px] text-gray-400">{a.time}</span>
                                                </div>
                                                <p className="text-[13px] font-normal text-gray-500">{a.action}</p>
                                                {a.note && (
                                                    <div className="mt-2.5 bg-gray-50/80 rounded-2xl border border-gray-100 px-4 py-3">
                                                        <p className="text-[13px] font-normal text-gray-600 leading-relaxed">{a.note}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Add Comment */}
                        <div className={`bg-white rounded-[24px] border border-gray-100 p-6 ${isMounted ? 'animate-up' : ''}`} style={{ animationDelay: '0.2s' }}>
                            <p className="text-[11px] font-normal text-gray-400 uppercase tracking-wider mb-4">Add Information or Comment</p>
                            <form onSubmit={handleComment} className="space-y-3">
                                <textarea
                                    rows={3}
                                    value={comment}
                                    onChange={e => setComment(e.target.value)}
                                    placeholder="Add any additional details, updates, or questions about this issue..."
                                    className="w-full px-4 py-3 text-[13px] font-normal border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#088395]/10 focus:border-[#088395] transition-all resize-none bg-gray-50/50 focus:bg-white text-[#201F47] placeholder:text-gray-400"
                                />
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={!comment.trim() || submitting}
                                        className="flex items-center gap-2 px-5 py-2.5 text-[13px] font-normal text-white bg-[#201F47] hover:bg-[#2c2b5c] rounded-[14px] shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        {submitting ? (
                                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                            </svg>
                                        )}
                                        {submitting ? 'Sending...' : 'Send Update'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="flex flex-col gap-4">

                        {/* Status Progress */}
                        <div className={`bg-white rounded-[24px] border border-gray-100 p-5 ${isMounted ? 'animate-up' : ''}`} style={{ animationDelay: '0.12s' }}>
                            <p className="text-[11px] font-normal text-gray-400 uppercase tracking-wider mb-5">Resolution Status</p>
                            <div className="space-y-0">
                                {statusSteps.map((status, idx) => {
                                    const sc = statusConfig[status]
                                    const isDone = idx < currentStep
                                    const isCurrent = idx === currentStep
                                    const isUpcoming = idx > currentStep
                                    return (
                                        <div key={status} className="flex gap-3.5">
                                            <div className="flex flex-col items-center">
                                                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 border-2 transition-all ${
                                                    isDone ? 'bg-[#088395] border-[#088395]' :
                                                    isCurrent ? `${sc.bg} ${sc.border}` :
                                                    'bg-white border-gray-200'
                                                }`}>
                                                    {isDone ? (
                                                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                                    ) : (
                                                        <span className={`w-2 h-2 rounded-full ${isCurrent ? sc.dot : 'bg-gray-200'}`} />
                                                    )}
                                                </div>
                                                {idx < statusSteps.length - 1 && (
                                                    <div className={`w-0.5 h-8 mt-0.5 ${isDone ? 'bg-[#088395]/30' : 'bg-gray-100'}`} />
                                                )}
                                            </div>
                                            <div className="pb-5">
                                                <p className={`text-[13px] font-normal ${
                                                    isCurrent ? sc.color :
                                                    isDone ? 'text-[#088395]' :
                                                    'text-gray-300'
                                                }`}>
                                                    {sc.label}
                                                    {isCurrent && <span className="ml-1.5 text-[10px] font-normal opacity-60">← Current</span>}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Details Panel */}
                        <div className={`bg-white rounded-[24px] border border-gray-100 p-5 ${isMounted ? 'animate-up' : ''}`} style={{ animationDelay: '0.17s' }}>
                            <p className="text-[11px] font-normal text-gray-400 uppercase tracking-wider mb-4">Issue Details</p>
                            <div className="space-y-3.5">
                                {[
                                    { label: 'Issue ID', value: issue.id },
                                    { label: 'Category', value: issue.category },
                                    { label: 'Priority', value: issue.priority },
                                    { label: 'Submitted', value: issue.submittedAt },
                                    { label: 'Assigned To', value: issue.assignedTo ?? 'Pending assignment' },
                                ].map(d => (
                                    <div key={d.label} className="flex justify-between items-start gap-3">
                                        <span className="text-[12px] font-normal text-gray-400 shrink-0">{d.label}</span>
                                        <span className={`text-[12px] font-normal text-right ${d.label === 'Assigned To' && issue.assignedTo ? 'text-[#088395]' : 'text-[#201F47]'}`}>{d.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Urgent help */}
                        <div className={`bg-[#201F47] rounded-[24px] p-5 ${isMounted ? 'animate-up' : ''}`} style={{ animationDelay: '0.22s' }}>
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mb-3">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                            </div>
                            <p className="text-[13px] font-normal text-white mb-1.5">Need urgent help?</p>
                            <p className="text-[12px] font-normal text-white/60 leading-relaxed">
                                For life-threatening situations, call <span className="text-white font-normal">112</span> immediately. For civic emergencies, contact your local municipal helpline.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
