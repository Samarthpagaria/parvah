'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { issueAPI, authAPI } from '@/utils/backend_api_endpoints'
import AiChatbot from '@/components/AiChatbot'

type IssueStatus = 'open' | 'in_progress' | 'review' | 'resolved'
type IssuePriority = 'low' | 'medium' | 'high' | 'critical'

interface Issue {
    id: string
    title: string
    category: string
    priority: IssuePriority
    status: IssueStatus
    location: string
    submittedAt: string
    lastUpdate: string
    description: string
}

const statusConfig: Record<IssueStatus, { label: string; color: string; text: string; dot: string }> = {
    'open': { label: 'Open', color: 'bg-[#F25A5A]/10', text: 'text-[#F25A5A]', dot: 'bg-[#F25A5A]' },
    'in_progress': { label: 'In Progress', color: 'bg-[#576CDB]/10', text: 'text-[#576CDB]', dot: 'bg-[#576CDB]' },
    'review': { label: 'Under Review', color: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-400' },
    'resolved': { label: 'Resolved', color: 'bg-[#088395]/10', text: 'text-[#088395]', dot: 'bg-[#088395]' },
}

const priorityConfig: Record<IssuePriority, { label: string; color: string; text: string }> = {
    low: { label: 'Low', color: 'bg-gray-100', text: 'text-gray-500' },
    medium: { label: 'Medium', color: 'bg-amber-50', text: 'text-amber-600' },
    high: { label: 'High', color: 'bg-[#F25A5A]/10', text: 'text-[#F25A5A]' },
    critical: { label: 'Critical', color: 'bg-red-100', text: 'text-red-600' },
}


const recentActivity: any[] = []

const activityTypeConfig = {
    resolve: { bg: 'bg-[#088395]/10', icon: 'text-[#088395]' },
    created: { bg: 'bg-[#576CDB]/10', icon: 'text-[#576CDB]' },
    status: { bg: 'bg-amber-50', icon: 'text-amber-500' },
}

export default function UserDashboard() {
    const [filter, setFilter] = useState<'all' | IssueStatus>('all')
    const [showNotifications, setShowNotifications] = useState(false)
    const [isMounted, setIsMounted] = useState(false)
    const [issues, setIssues] = useState<Issue[]>([])
    const [user, setUser] = useState<{ full_name: string } | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setIsMounted(true)
        const fetchData = async () => {
            try {
                const [issuesData, userData] = await Promise.all([
                    issueAPI.list(),
                    authAPI.getMe()
                ])

                const issuesList = issuesData.issues || []

                // Map API issues to UI Issue type if needed
                const mappedIssues = issuesList.map((apiIssue: any) => ({
                    id: apiIssue.id,
                    title: apiIssue.title,
                    category: apiIssue.issue_categories?.name || apiIssue.category || 'General',
                    priority: apiIssue.priority,
                    status: apiIssue.status,
                    location: apiIssue.address || (apiIssue.latitude ? `${apiIssue.latitude}, ${apiIssue.longitude}` : 'Remote'),
                    submittedAt: new Date(apiIssue.created_at).toLocaleDateString(),
                    lastUpdate: 'Recently',
                    description: apiIssue.description
                }))

                setIssues(mappedIssues)
                setUser(userData.user) // authAPI.getMe() returns { type, user }
            } catch (err) {
                console.error('Failed to fetch dashboard data:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const filtered = filter === 'all' ? issues : issues.filter(i => i.status === filter)

    const stats = {
        total: issues.length,
        open: issues.filter(i => i.status === 'open').length,
        inProgress: issues.filter(i => i.status === 'in_progress' || i.status === 'review').length,
        resolved: issues.filter(i => i.status === 'resolved').length,
    }

    return (
        <div className="min-h-screen bg-[#F9F9FB] text-[#201F47] font-sans">
            {/* Navbar */}
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 py-0 flex items-center justify-between h-[68px]">
                    <Link href="/" className="flex items-center gap-0.5 select-none group">
                        <span className="text-[18px] font-normal tracking-[-0.04em] text-[#201F47]">par</span><span className="text-[18px] font-normal tracking-[-0.04em] text-[#088395]">vah</span><span className="w-1.5 h-1.5 rounded-full bg-[#088395] mb-0.5 ml-0.5 self-end shrink-0 group-hover:scale-125 transition-transform" />
                    </Link>

                    <div className="flex items-center gap-3">
                        <Link href="/dashboard/new-issue"
                            className="flex items-center gap-2 bg-[#201F47] hover:bg-[#14122d] text-white text-[13px] font-normal px-4 py-2.5 rounded-[14px] transition-colors shadow-sm">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                            </svg>
                            Report Issue
                        </Link>

                        {/* Notifications */}
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(v => !v)}
                                className="relative w-9 h-9 flex items-center justify-center rounded-[10px] text-gray-400 hover:text-[#201F47] hover:bg-gray-100 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F25A5A] rounded-full border-2 border-white" />
                            </button>
                            {showNotifications && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                                    <div className="absolute right-0 top-12 w-[320px] bg-white rounded-[20px] border border-gray-100 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                                            <div>
                                                <h3 className="text-[15px] font-normal text-[#201F47]">Notifications</h3>
                                                <p className="text-[11px] font-normal text-gray-400 mt-0.5">3 unread</p>
                                            </div>
                                            <button className="text-[12px] font-normal text-[#088395] hover:text-[#066472]">Mark all read</button>
                                        </div>
                                        <div className="divide-y divide-gray-50">
                                            {recentActivity.map((a, i) => (
                                                <div key={i} className={`flex items-start gap-3.5 px-5 py-4 hover:bg-gray-50/60 transition-colors cursor-pointer ${i < 3 ? 'bg-[#F9F9FB]' : 'bg-white'}`}>
                                                    <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${i < 3 ? 'bg-[#F25A5A]' : 'bg-gray-200'}`} />
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-[13px] font-normal leading-tight mb-0.5 ${i < 3 ? 'text-[#201F47]' : 'text-gray-500'}`}>{a.action}</p>
                                                        <p className="text-[11px] font-normal text-gray-400">{a.issueId} · {a.time}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="px-5 py-3 border-t border-gray-50 text-center">
                                            <button className="text-[12px] font-normal text-gray-400 hover:text-[#201F47] transition-colors">View all notifications</button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Profile */}
                        <Link href="/dashboard/profile" className="flex items-center gap-2.5 px-3 py-2 rounded-[12px] hover:bg-gray-100 transition-colors">
                            <div className="w-8 h-8 rounded-[10px] bg-[#201F47] flex items-center justify-center text-white font-normal text-[13px]">
                                {user?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                            </div>
                            <span className="text-[14px] font-normal text-gray-600 hidden sm:block">{user?.full_name || 'Loading...'}</span>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-8">
                {/* Greeting */}
                <div className={`mb-8 transition-all duration-500 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <h1 className="text-[28px] font-normal text-[#201F47] tracking-tight mb-1.5">Good morning, {user?.full_name?.split(' ')[0] || 'User'} 👋</h1>
                    <p className="text-[15px] font-normal text-gray-500">Here's an overview of your reported issues.</p>
                </div>

                {/* Stats Grid */}
                <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 transition-all duration-500 delay-100 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    {[
                        { label: 'Total Issues', value: stats.total, accent: 'bg-[#201F47]/5 text-[#201F47]', svgPath: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                        { label: 'Open', value: stats.open, accent: 'bg-[#F25A5A]/8 text-[#F25A5A]', svgPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
                        { label: 'In Progress', value: stats.inProgress, accent: 'bg-[#576CDB]/8 text-[#576CDB]', svgPath: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' },
                        { label: 'Resolved', value: stats.resolved, accent: 'bg-[#088395]/8 text-[#088395]', svgPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
                    ].map(s => (
                        <div key={s.label} className="bg-white rounded-[20px] border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow flex items-start justify-between group">
                            <div>
                                <p className="text-[12px] font-normal text-gray-400 mb-1 tracking-wide">{s.label}</p>
                                <p className="text-[32px] font-normal text-[#201F47] leading-none tracking-tight">{s.value}</p>
                            </div>
                            <div className={`w-10 h-10 rounded-xl ${s.accent} flex items-center justify-center opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={s.svgPath} />
                                </svg>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main body */}
                <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 transition-all duration-500 delay-200 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

                    {/* My Issues — 2/3 column */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-[15px] font-normal text-[#201F47]">My Issues</h2>
                            <Link href="/dashboard/new-issue" className="flex items-center gap-1.5 text-[13px] font-normal text-[#088395] hover:text-[#066472] transition-colors">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                                </svg>
                                New Issue
                            </Link>
                        </div>

                        {/* Filter chips */}
                        <div className="flex gap-2 flex-wrap mb-5">
                            {(['all', 'open', 'in_progress', 'review', 'resolved'] as const).map(f => (
                                <button key={f} onClick={() => setFilter(f)}
                                    className={`px-3.5 py-1.5 rounded-full text-[12px] font-normal transition-all ${filter === f
                                        ? 'bg-[#201F47] text-white'
                                        : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-[#201F47]'
                                        }`}>
                                    {f === 'all' ? 'All' : f === 'in_progress' ? 'In Progress' : f === 'review' ? 'Under Review' : f.charAt(0).toUpperCase() + f.slice(1)}
                                </button>
                            ))}
                        </div>

                        {/* Issue list */}
                        <div className="space-y-3">
                            {filtered.length === 0 ? (
                                <div className="bg-white rounded-[20px] border border-gray-100 p-12 text-center">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <p className="text-[14px] font-normal text-gray-400">No issues found</p>
                                </div>
                            ) : filtered.map(issue => {
                                const s = statusConfig[issue.status]
                                const p = priorityConfig[issue.priority]
                                return (
                                    <Link key={issue.id} href={`/dashboard/issues/${issue.id}`} className="block group">
                                        <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                                            <div className="flex items-start gap-4">
                                                <div className={`w-1 self-stretch rounded-full shrink-0 ${s.dot}`} />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2 mb-1.5">
                                                        <h3 className="text-[14px] font-normal text-[#201F47] group-hover:text-[#088395] transition-colors leading-snug">
                                                            {issue.title}
                                                        </h3>
                                                        <svg className="w-4 h-4 text-gray-300 group-hover:text-[#088395] transition-colors shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[11px] font-normal text-gray-400 mb-3">
                                                        <span>{issue.id}</span>
                                                        <span className="text-gray-200">·</span>
                                                        <span>{issue.category}</span>
                                                        <span className="text-gray-200">·</span>
                                                        <span className="truncate">{issue.location}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-[11px] font-normal px-2.5 py-1 rounded-full flex items-center gap-1.5 ${s.color} ${s.text}`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                                                            {s.label}
                                                        </span>
                                                        <span className={`text-[11px] font-normal px-2.5 py-1 rounded-full ${p.color} ${p.text}`}>{p.label}</span>
                                                        <span className="text-[11px] font-normal text-gray-400 ml-auto">Updated {issue.lastUpdate}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>

                    {/* Right panel */}
                    <div className="flex flex-col gap-5">
                        {/* Recent Activity */}
                        <div>
                            <h2 className="text-[15px] font-normal text-[#201F47] mb-5">Recent Activity</h2>
                            <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm overflow-hidden">
                                <div className="divide-y divide-gray-50">
                                    {recentActivity.map((a, i) => {
                                        const tc = activityTypeConfig[a.type as keyof typeof activityTypeConfig]
                                        return (
                                            <div key={i} className="p-4 hover:bg-gray-50/50 transition-colors">
                                                <div className="flex gap-3">
                                                    <div className={`w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0 ${tc.bg}`}>
                                                        {a.type === 'resolve' ? (
                                                            <svg className={`w-4 h-4 ${tc.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" /></svg>
                                                        ) : a.type === 'created' ? (
                                                            <svg className={`w-4 h-4 ${tc.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
                                                        ) : (
                                                            <svg className={`w-4 h-4 ${tc.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0 pt-0.5">
                                                        <p className="text-[13px] font-normal text-[#201F47] leading-snug mb-1">{a.action}</p>
                                                        <div className="flex items-center gap-1.5">
                                                            <Link href={`/dashboard/issues/${a.issueId}`} className="text-[11px] font-normal text-[#088395] hover:text-[#066472] transition-colors">{a.issueId}</Link>
                                                            <span className="text-gray-300">·</span>
                                                            <span className="text-[11px] font-normal text-gray-400">{a.time}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Tip Card */}
                        <div className="bg-gradient-to-br from-[#1b1a3e] via-[#201F47] to-[#14122d] rounded-[20px] border border-[#ffffff10] p-5 relative overflow-hidden">
                            <div className="absolute top-[-30%] right-[-10%] w-[60%] h-[60%] bg-[#576CDB]/20 blur-[60px] rounded-full pointer-events-none" />
                            <div className="absolute bottom-[-30%] left-[-10%] w-[50%] h-[50%] bg-[#088395]/20 blur-[60px] rounded-full pointer-events-none" />
                            <div className="relative z-10">
                                <div className="w-8 h-8 rounded-[10px] bg-white/10 flex items-center justify-center mb-4">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                </div>
                                <h3 className="text-[13px] font-normal text-white mb-1.5">Did you know?</h3>
                                <p className="text-[12px] font-normal text-gray-400 leading-relaxed">
                                    You can add more details or photos to an existing issue from the Issue Details page to help staff resolve it faster.
                                </p>
                                <Link href="/dashboard/new-issue" className="inline-flex items-center gap-1.5 mt-4 text-[12px] font-normal text-[#088395] hover:text-[#3BD0E3] transition-colors">
                                    Report a new issue
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" /></svg>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <AiChatbot role="citizen" />
        </div>
    )
}
