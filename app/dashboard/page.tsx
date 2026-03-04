'use client'

import { useState } from 'react'
import Link from 'next/link'

type IssueStatus = 'open' | 'in-progress' | 'review' | 'resolved'
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

const statusConfig: Record<IssueStatus, { label: string; color: string; dot: string }> = {
    'open': { label: 'Open', color: 'bg-orange-50 text-orange-600', dot: 'bg-orange-400' },
    'in-progress': { label: 'In Progress', color: 'bg-blue-50 text-blue-600', dot: 'bg-blue-500' },
    'review': { label: 'Under Review', color: 'bg-purple-50 text-purple-600', dot: 'bg-purple-500' },
    'resolved': { label: 'Resolved', color: 'bg-teal-50 text-teal-600', dot: 'bg-teal-500' },
}

const priorityConfig: Record<IssuePriority, { label: string; badge: string }> = {
    low: { label: 'Low', badge: 'bg-blue-50 text-blue-600' },
    medium: { label: 'Medium', badge: 'bg-yellow-50 text-yellow-700' },
    high: { label: 'High', badge: 'bg-orange-50 text-orange-700' },
    critical: { label: 'Critical', badge: 'bg-red-50 text-red-700' },
}

const mockIssues: Issue[] = [
    {
        id: 'ISS-001',
        title: 'Large pothole outside my building',
        category: 'Road Maintenance',
        priority: 'high',
        status: 'in-progress',
        location: '12B, MG Road, Koramangala',
        submittedAt: 'Mar 01, 2024',
        lastUpdate: '2 hours ago',
        description: 'There is a large pothole right outside the main entrance of my building. It has been causing problems for vehicles and is a safety hazard.',
    },
    {
        id: 'ISS-002',
        title: 'Street light not working for 2 weeks',
        category: 'Street Lighting',
        priority: 'medium',
        status: 'open',
        location: 'Park Avenue, Indiranagar',
        submittedAt: 'Mar 03, 2024',
        lastUpdate: '1 day ago',
        description: 'The street light near the park has not been working for over two weeks, making it unsafe to walk at night.',
    },
    {
        id: 'ISS-003',
        title: 'Overflowing garbage bin at bus stop',
        category: 'Cleanliness',
        priority: 'medium',
        status: 'review',
        location: 'Bus Stop 42, BTM Layout',
        submittedAt: 'Feb 28, 2024',
        lastUpdate: '3 hours ago',
        description: 'The garbage bin at the bus stop has been overflowing for 3 days. It is causing unhygienic conditions and bad smell.',
    },
    {
        id: 'ISS-004',
        title: 'Water supply disruption since morning',
        category: 'Water Supply',
        priority: 'critical',
        status: 'resolved',
        location: 'Sector 4, HSR Layout',
        submittedAt: 'Feb 25, 2024',
        lastUpdate: '5 days ago',
        description: 'Water supply in our area has been disrupted since 6 AM. Multiple households are affected.',
    },
]

const recentActivity = [
    { issueId: 'ISS-001', action: 'Status updated to In Progress', actor: 'City Municipality Staff', time: '2 hours ago', type: 'status' },
    { issueId: 'ISS-003', action: 'Issue is now Under Review', actor: 'System', time: '3 hours ago', type: 'status' },
    { issueId: 'ISS-002', action: 'Your issue was received', actor: 'Parvah', time: '1 day ago', type: 'created' },
    { issueId: 'ISS-004', action: 'Issue marked as Resolved', actor: 'Water Department Staff', time: '5 days ago', type: 'resolve' },
]

export default function UserDashboard() {
    const [filter, setFilter] = useState<'all' | IssueStatus>('all')
    const [showNotifications, setShowNotifications] = useState(false)

    const filtered = filter === 'all' ? mockIssues : mockIssues.filter(i => i.status === filter)

    const stats = {
        total: mockIssues.length,
        open: mockIssues.filter(i => i.status === 'open').length,
        inProgress: mockIssues.filter(i => i.status === 'in-progress' || i.status === 'review').length,
        resolved: mockIssues.filter(i => i.status === 'resolved').length,
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
                <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center shadow-sm">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <span className="text-lg font-bold text-gray-900">Parvah</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        {/* New Issue button */}
                        <Link href="/dashboard/new-issue"
                            className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-sm transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Report Issue
                        </Link>

                        {/* Notifications */}
                        <div className="relative">
                            <button onClick={() => setShowNotifications(!showNotifications)}
                                className="relative w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                            </button>
                            {showNotifications && (
                                <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl border border-gray-100 shadow-xl z-50 overflow-hidden">
                                    <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
                                        <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
                                        <span className="text-[10px] font-semibold bg-red-50 text-red-600 px-2 py-0.5 rounded-full">3 new</span>
                                    </div>
                                    <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                                        {recentActivity.slice(0, 4).map((a, i) => (
                                            <div key={i} className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer">
                                                <div className="flex gap-2.5">
                                                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${i < 3 ? 'bg-teal-500' : 'bg-gray-200'}`} />
                                                    <div>
                                                        <p className="text-xs font-medium text-gray-800">{a.action}</p>
                                                        <p className="text-[10px] text-gray-400 mt-0.5">{a.issueId} · {a.time}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="px-4 py-2.5 border-t border-gray-50 text-center">
                                        <button className="text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors">View all notifications</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Profile */}
                        <Link href="/dashboard/profile"
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                JD
                            </div>
                            <span className="text-sm font-semibold text-gray-700 hidden sm:block">John Doe</span>
                            <svg className="w-4 h-4 text-gray-400 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-8">
                {/* Greeting */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Good morning, John 👋</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Here's an overview of all your reported issues.</p>
                </div>

                {/* Status Summary */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Total Issues', value: stats.total, color: 'text-gray-800', bg: 'bg-white', border: 'border-gray-100' },
                        { label: 'Open', value: stats.open, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
                        { label: 'In Progress', value: stats.inProgress, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
                        { label: 'Resolved', value: stats.resolved, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100' },
                    ].map(s => (
                        <div key={s.label} className={`${s.bg} rounded-2xl p-5 border ${s.border} shadow-sm`}>
                            <p className="text-xs font-medium text-gray-500 mb-1">{s.label}</p>
                            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* My Issues (left, 2/3 width) */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-semibold text-gray-800">My Issues</h2>
                            <Link href="/dashboard/new-issue"
                                className="flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                New Issue
                            </Link>
                        </div>

                        {/* Filter chips */}
                        <div className="flex gap-2 flex-wrap mb-4">
                            {(['all', 'open', 'in-progress', 'review', 'resolved'] as const).map(f => (
                                <button key={f} onClick={() => setFilter(f)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filter === f
                                            ? 'bg-gray-900 text-white'
                                            : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
                                        }`}>
                                    {f === 'all' ? 'All' : f === 'in-progress' ? 'In Progress' : f === 'review' ? 'Under Review' : f.charAt(0).toUpperCase() + f.slice(1)}
                                </button>
                            ))}
                        </div>

                        {/* Issue list */}
                        <div className="space-y-3">
                            {filtered.length === 0 ? (
                                <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <p className="text-sm font-medium text-gray-400">No issues found</p>
                                </div>
                            ) : filtered.map(issue => {
                                const s = statusConfig[issue.status]
                                const p = priorityConfig[issue.priority]
                                return (
                                    <Link key={issue.id} href={`/dashboard/issues/${issue.id}`} className="block group">
                                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-150">
                                            <div className="flex items-start gap-3">
                                                <div className={`w-1.5 min-h-[50px] rounded-full flex-shrink-0 mt-1 ${s.dot}`} />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-teal-700 transition-colors leading-snug">
                                                            {issue.title}
                                                        </h3>
                                                        <svg className="w-4 h-4 text-gray-300 group-hover:text-teal-400 transition-colors flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 mt-1.5">
                                                        <span className="text-[10px] text-gray-400">{issue.id}</span>
                                                        <span className="text-gray-200">·</span>
                                                        <span className="text-[10px] text-gray-400">{issue.category}</span>
                                                        <span className="text-gray-200">·</span>
                                                        <span className="text-[10px] text-gray-400">{issue.location}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-2.5">
                                                        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${s.color}`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{s.label}
                                                        </span>
                                                        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${p.badge}`}>{p.label}</span>
                                                        <span className="text-[10px] text-gray-400 ml-auto">Updated {issue.lastUpdate}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>

                    {/* Right panel: Recent Activity */}
                    <div>
                        <h2 className="text-base font-semibold text-gray-800 mb-4">Recent Activity</h2>
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="divide-y divide-gray-50">
                                {recentActivity.map((a, i) => (
                                    <div key={i} className="p-4 hover:bg-gray-50/50 transition-colors">
                                        <div className="flex gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${a.type === 'resolve' ? 'bg-teal-100' : a.type === 'created' ? 'bg-blue-100' : 'bg-orange-100'
                                                }`}>
                                                {a.type === 'resolve' ? (
                                                    <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                ) : a.type === 'created' ? (
                                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-gray-800 leading-snug">{a.action}</p>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    <Link href={`/dashboard/issues/${a.issueId}`} className="text-[10px] font-semibold text-teal-600 hover:text-teal-700 transition-colors">{a.issueId}</Link>
                                                    <span className="text-gray-300">·</span>
                                                    <span className="text-[10px] text-gray-400">{a.time}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick tips */}
                        <div className="mt-4 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl border border-teal-100 p-4">
                            <h3 className="text-xs font-semibold text-teal-700 mb-2">💡 Did you know?</h3>
                            <p className="text-xs text-teal-600 leading-relaxed">
                                You can add more details or photos to an existing issue from the Issue Details page to help staff resolve it faster.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
