'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { issueAPI } from '@/utils/backend_api_endpoints'

type IssueStatus = 'open' | 'in_progress' | 'on_hold' | 'resolved' | 'closed' | 'rejected'

const statusConfig: Record<string, { label: string; color: string; dot: string; bg: string; border: string }> = {
    'open': { label: 'Open', color: 'text-amber-600', dot: 'bg-amber-400', bg: 'bg-amber-50', border: 'border-amber-200' },
    'in_progress': { label: 'In Progress', color: 'text-[#576CDB]', dot: 'bg-[#576CDB]', bg: 'bg-[#576CDB]/10', border: 'border-[#576CDB]/20' },
    'on_hold': { label: 'On Hold', color: 'text-orange-600', dot: 'bg-orange-500', bg: 'bg-orange-50', border: 'border-orange-200' },
    'resolved': { label: 'Resolved', color: 'text-[#088395]', dot: 'bg-[#088395]', bg: 'bg-[#088395]/10', border: 'border-[#088395]/20' },
    'closed': { label: 'Closed', color: 'text-gray-600', dot: 'bg-gray-400', bg: 'bg-gray-50', border: 'border-gray-200' },
    'rejected': { label: 'Rejected', color: 'text-red-600', dot: 'bg-red-500', bg: 'bg-red-50', border: 'border-red-200' },
}

const priorityConfig: Record<string, { color: string; bg: string }> = {
    'high': { color: 'text-[#F25A5A]', bg: 'bg-[#F25A5A]/10' },
    'medium': { color: 'text-amber-600', bg: 'bg-amber-50' },
    'low': { color: 'text-[#088395]', bg: 'bg-[#088395]/10' },
}

const activityIconConfig: Record<string, { bg: string; icon: React.ReactNode }> = {
    issue_created: { bg: 'bg-teal-50 text-teal-600', icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> },
    issue_assigned: { bg: 'bg-amber-50 text-amber-500', icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
    status_updated: { bg: 'bg-blue-50 text-blue-500', icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg> },
    issue_resolved: { bg: 'bg-green-50 text-green-600', icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> },
    comment_added: { bg: 'bg-purple-50 text-purple-500', icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg> },
    attachment_added: { bg: 'bg-indigo-50 text-indigo-500', icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg> },
}

export default function IssueDetailPage({ params }: { params: Promise<{ issueId: string }> }) {
    const { issueId } = use(params)
    const [issue, setIssue] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [comment, setComment] = useState('')
    const [comments, setComments] = useState<any[]>([])
    const [activity, setActivity] = useState<any[]>([])
    const [attachments, setAttachments] = useState<any[]>([])
    const [submitting, setSubmitting] = useState(false)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
        const fetchIssueData = async () => {
            try {
                const [details, act, comms, atts] = await Promise.all([
                    issueAPI.getDetails(issueId),
                    (issueAPI as any).getActivity(issueId),
                    (issueAPI as any).getComments(issueId),
                    (issueAPI as any).getAttachments(issueId)
                ])

                const dbIssue = details.issue || details
                const mappedIssue = {
                    ...dbIssue,
                    category: dbIssue.issue_categories?.name || 'General',
                    submittedAt: new Date(dbIssue.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
                    assignedTo: dbIssue.admin_users?.full_name || null,
                }

                setIssue(mappedIssue)
                setActivity(act.activity || [])
                setComments(comms.comments || [])
                setAttachments(atts.attachments || [])
            } catch (err) {
                console.error("Failed to fetch issue", err)
            } finally {
                setLoading(false)
            }
        }
        fetchIssueData()
    }, [issueId])

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F9F9FB] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#201F47] border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-500 font-normal animate-pulse">Loading Issue Details...</p>
                </div>
            </div>
        )
    }

    if (!issue) {
        return (
            <div className="min-h-screen bg-[#F9F9FB] flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-normal text-[#201F47] mb-2">Issue Not Found</h2>
                    <p className="text-gray-500 mb-6">The issue you are looking for doesn't exist or you don't have access.</p>
                    <Link href="/dashboard" className="text-[#088395] hover:underline">Back to Dashboard</Link>
                </div>
            </div>
        )
    }

    const s = statusConfig[issue.status] || statusConfig['open']
    const pc = priorityConfig[issue.priority?.toLowerCase()] ?? priorityConfig['medium']

    const handleComment = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!comment.trim()) return
        setSubmitting(true)
        try {
            const res = await (issueAPI as any).postComment(issueId, comment)
            if (res.comment) {
                setComments(prev => [res.comment, ...prev])
                setComment('')
                // Refresh activity after comment
                const act = await (issueAPI as any).getActivity(issueId)
                setActivity(act.activity || [])
            }
        } catch (err) {
            console.error('Failed to post comment', err)
        } finally {
            setSubmitting(false)
        }
    }

    const getActivityDescription = (a: any) => {
        const isSelf = a.actor_type === 'public_user';
        const actorLabel = isSelf ? 'You' : 'Admin';

        switch (a.action) {
            case 'issue_created':
                return isSelf ? 'Issue Created by You' : `Issue Created by ${a.actor_name || 'Admin'}`
            case 'issue_assigned':
                return `Admin assigned this issue to ${a.target_name || 'Staff'}`
            case 'status_updated':
                return `Status updated to ${statusConfig[a.new_value?.status]?.label || a.new_value?.status?.replace(/_/g, ' ') || 'New Status'}`
            case 'issue_resolved':
                return 'Staff marked the issue as Resolved'
            case 'comment_added':
                return `Comment added by ${isSelf ? 'You' : 'Admin'}`
            case 'attachment_added':
                return `${isSelf ? 'You' : 'Admin'} added an attachment: ${a.new_value?.file_name || 'file'}`
            default:
                return a.action?.replace(/_/g, ' ') || 'Activity recorded'
        }
    }

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
                        <Link href="/" className="flex items-center gap-0.5 select-none group shrink-0 font-normal">
                            <span className="text-[#201F47] text-[17px] tracking-tight">par</span><span className="text-[#088395] text-[17px] tracking-tight">vah</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#088395] mb-0.5 ml-0.5 group-hover:scale-125 transition-transform" />
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

            <main className="max-w-5xl mx-auto px-6 py-8">

                {/* Hero Header */}
                <div className={`mb-8 ${isMounted ? 'animate-up' : ''}`} style={{ animationDelay: '0.05s' }}>
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                        <span className="text-[11px] font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-lg tracking-wider uppercase">{issue.id.split('-')[0]}</span>
                        <span className={`px-3 py-1 rounded-lg text-[11px] font-semibold tracking-wider uppercase ${pc.bg} ${pc.color}`}>
                            {issue.priority || 'medium'} Priority
                        </span>
                        <span className="text-[12px] text-gray-400 font-medium">{issue.category}</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-[#201F47] tracking-tight mb-4">{issue.title}</h1>
                    <div className="flex flex-wrap gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            {issue.latitude ? `${issue.latitude.toFixed(5)}, ${issue.longitude.toFixed(5)}` : 'Location not provided'}
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            {issue.submittedAt}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Content */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* 1. Description */}
                        <section className={`bg-white rounded-3xl border border-gray-100 p-8 shadow-sm ${isMounted ? 'animate-up' : ''}`} style={{ animationDelay: '0.1s' }}>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Description</h3>
                            <p className="text-[15px] text-gray-600 font-normal leading-relaxed">{issue.description}</p>
                        </section>

                        {/* 2. Attachments */}
                        {attachments.length > 0 && (
                            <section className={`bg-white rounded-3xl border border-gray-100 p-8 shadow-sm ${isMounted ? 'animate-up' : ''}`} style={{ animationDelay: '0.12s' }}>
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Attachments</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {attachments.map((att) => (
                                        <div key={att.id} className="group relative aspect-square rounded-2xl overflow-hidden border border-gray-100 bg-gray-50">
                                            {att.file_type.startsWith('image/') ? (
                                                <img src={att.file_url} alt={att.file_name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-400">
                                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                                    <span className="text-[10px] font-semibold uppercase">{att.file_name.split('.').pop()}</span>
                                                </div>
                                            )}
                                            <a href={att.file_url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* 3. Comments */}
                        <section className={`bg-white rounded-3xl border border-gray-100 p-8 shadow-sm ${isMounted ? 'animate-up' : ''}`} style={{ animationDelay: '0.14s' }}>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Discussion</h3>

                            {/* Comment Form */}
                            <form onSubmit={handleComment} className="mb-8 p-1.5 bg-gray-50 rounded-2xl flex items-center gap-2 border border-gray-100 focus-within:bg-white focus-within:ring-4 focus-within:ring-teal-500/10 focus-within:border-teal-500/30 transition-all">
                                <input
                                    value={comment}
                                    onChange={e => setComment(e.target.value)}
                                    placeholder="Add a comment or update..."
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-3 placeholder:text-gray-400"
                                />
                                <button
                                    disabled={!comment.trim() || submitting}
                                    className="p-2.5 rounded-xl bg-[#201F47] text-white hover:bg-teal-600 transition-colors disabled:opacity-20"
                                >
                                    {submitting ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                    )}
                                </button>
                            </form>

                            <div className="space-y-6">
                                {comments.length === 0 ? (
                                    <p className="text-gray-400 text-sm text-center py-4 italic">No comments yet</p>
                                ) : (
                                    comments.map((c) => (
                                        <div key={c.id} className="flex gap-4 group">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${c.author_type === 'staff' ? 'bg-teal-600' : 'bg-[#201F47]'}`}>
                                                <span className="text-white text-xs font-bold leading-none">{c.author_type === 'staff' ? 'S' : 'U'}</span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="text-sm font-bold text-[#201F47]">{c.author_type === 'staff' ? 'Management' : 'You'}</span>
                                                    <span className="text-[11px] font-medium text-gray-400">{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(c.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-2xl rounded-tl-none group-hover:bg-gray-100/70 transition-colors">{c.content}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>

                        {/* 4. Activity Timeline */}
                        <section className={`bg-white rounded-3xl border border-gray-100 p-8 shadow-sm ${isMounted ? 'animate-up' : ''}`} style={{ animationDelay: '0.16s' }}>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-8">Activity Timeline</h3>
                            <div className="relative space-y-8 before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">
                                {activity.map((a, i) => {
                                    const cfg = activityIconConfig[a.action] || activityIconConfig['status_updated']
                                    return (
                                        <div key={a.id || i} className="relative flex gap-6 pl-10 group">
                                            {/* Dot on line */}
                                            <div className={`absolute left-0 w-9 h-9 rounded-full flex items-center justify-center z-10 border-4 border-white shadow-sm transition-transform group-hover:scale-110 ${cfg.bg}`}>
                                                {cfg.icon}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-[#201F47] mb-0.5">{getActivityDescription(a)}</p>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                                                        {a.actor_type === 'public_user' ? 'User' : 'Admin'}
                                                    </span>
                                                    <span className="text-[11px] text-gray-400 font-medium">{new Date(a.created_at).toLocaleString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                                {a.action === 'status_updated' && a.new_value?.status && (
                                                    <p className="text-xs text-teal-600 font-semibold bg-teal-50 inline-block px-2.5 py-1 rounded-lg border border-teal-100">
                                                        {a.old_value?.status || 'open'} → {a.new_value.status}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </section>
                    </div>

                    {/* Right: Sidebar */}
                    <div className="space-y-6">
                        {/* Summary Status Panel */}
                        <div className={`bg-[#201F47] rounded-3xl p-8 text-white shadow-xl shadow-[#201F47]/20 ${isMounted ? 'animate-up' : ''}`} style={{ animationDelay: '0.18s' }}>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-6">Current Status</p>
                            <div className="flex items-center gap-3 mb-8">
                                <div className={`w-3 h-3 rounded-full animate-pulse ${s.dot}`} />
                                <h4 className="text-2xl font-bold">{s.label}</h4>
                            </div>
                            <div className="space-y-4 pt-6 border-t border-white/10">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-white/50">Urgency</span>
                                    <span className={`font-bold px-2 py-0.5 rounded-lg text-[10px] uppercase tracking-wider ${pc.bg} ${pc.color}`}>
                                        {issue.priority || 'Medium'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-white/50">Staff</span>
                                    <span className="font-bold text-teal-400">{issue.assignedTo || 'Pending'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Location Mini Card */}
                        <div className={`bg-white rounded-3xl border border-gray-100 p-6 shadow-sm ${isMounted ? 'animate-up' : ''}`} style={{ animationDelay: '0.2s' }}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                </div>
                                <h4 className="text-sm font-bold text-[#201F47]">Location Detail</h4>
                            </div>
                            <div className="space-y-3">
                                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-[12px] text-gray-600 font-medium leading-relaxed">{issue.address || 'Street address not available'}</p>
                                </div>
                                <div className="flex items-center gap-2 px-1">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Coordinates</span>
                                    <span className="text-[11px] font-mono text-gray-500">{issue.latitude?.toFixed(6) || 0}, {issue.longitude?.toFixed(6) || 0}</span>
                                </div>
                            </div>
                        </div>

                        {/* Help Banner */}
                        <div className={`bg-gradient-to-br from-teal-500 to-teal-700 rounded-3xl p-6 text-white shadow-lg shadow-teal-500/20 ${isMounted ? 'animate-up' : ''}`} style={{ animationDelay: '0.22s' }}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <h4 className="text-sm font-bold">Help & Support</h4>
                            </div>
                            <p className="text-xs text-white/80 leading-relaxed mb-4">
                                Questions about your report? Contact the organization's helpline directly for faster resolution.
                            </p>
                            <button className="w-full py-3 bg-white text-teal-700 rounded-2xl text-[12px] font-bold hover:bg-teal-50 transition-colors">
                                View Help Center
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
