'use client'

import { useState } from 'react'
import OrgSidebar from '@/components/admin/OrgSidebar'
import Link from 'next/link'

interface Issue {
    id: string
    title: string
    category: string
    priority: 'low' | 'medium' | 'high' | 'critical'
    reporter: string
    assignedTo?: string
    description: string
    createdAt: string
    location?: string
}

const mockOrgs: Record<string, { name: string; description: string; industry: string }> = {
    'org-1': { name: 'City Municipality', description: 'Civic infrastructure & roads', industry: 'Government' },
    'org-2': { name: 'Water Department', description: 'Water supply & sanitation', industry: 'Utilities' },
    'org-3': { name: 'Waste Management', description: 'Waste collection & disposal', industry: 'Environment' },
}

const staffList = ['Sarah Wilson', 'Tom Davis', 'John Davis', 'Priya Mehta', 'Raj Kumar', 'Emily Chen']

const initialIssues: Record<string, Issue[]> = {
    open: [
        { id: '1', title: 'Pothole on Main Street', category: 'Road Maintenance', priority: 'high', reporter: 'John Doe', description: 'Large pothole affecting traffic flow', createdAt: 'Mar 01', location: 'Main Street, Downtown' },
        { id: '2', title: 'Broken Street Light', category: 'Street Lighting', priority: 'medium', reporter: 'Jane Smith', description: 'Street light not working at night', createdAt: 'Mar 02', location: 'Park Avenue' },
        { id: '6', title: 'Debris on Footpath', category: 'Cleanliness', priority: 'low', reporter: 'Anita Rao', description: 'Garbage dumped on the footpath', createdAt: 'Mar 04', location: 'MG Road' },
    ],
    inProgress: [
        { id: '3', title: 'Water Pipe Leak', category: 'Water Supply', priority: 'critical', reporter: 'Mike Johnson', assignedTo: 'Sarah Wilson', description: 'Major water leak causing wastage', createdAt: 'Mar 01', location: 'Oak Street' },
        { id: '7', title: 'Park Bench Damaged', category: 'Parks & Recreation', priority: 'medium', reporter: 'Sara Lee', assignedTo: 'Tom Davis', description: 'Bench in central park is broken', createdAt: 'Mar 03', location: 'Central Park' },
    ],
    review: [
        { id: '8', title: 'Traffic Signal Down', category: 'Transport', priority: 'high', reporter: 'Vinod Sharma', assignedTo: 'Priya Mehta', description: 'Traffic signal at intersection not working', createdAt: 'Feb 28', location: 'Ring Road Junction' },
    ],
    resolved: [
        { id: '4', title: 'Gutter Cleaning', category: 'Maintenance', priority: 'low', reporter: 'Alice Brown', assignedTo: 'Tom Davis', description: 'Gutters cleaned successfully', createdAt: 'Feb 28', location: 'Park Circle' },
        { id: '5', title: 'Sidewalk Repair', category: 'Safety', priority: 'medium', reporter: 'Bob Wilson', assignedTo: 'John Davis', description: 'Sidewalk repaired and ready', createdAt: 'Feb 25', location: 'Third Street' },
    ],
}

const priorityConfig: Record<string, { label: string; dot: string; badge: string }> = {
    low: { label: 'Low', dot: 'bg-blue-400', badge: 'bg-blue-50 text-blue-600' },
    medium: { label: 'Medium', dot: 'bg-yellow-400', badge: 'bg-yellow-50 text-yellow-700' },
    high: { label: 'High', dot: 'bg-orange-400', badge: 'bg-orange-50 text-orange-700' },
    critical: { label: 'Critical', dot: 'bg-red-500', badge: 'bg-red-50 text-red-700' },
}

const columnConfig = [
    { key: 'open', label: 'Open', color: 'text-orange-600', accent: 'bg-orange-500', headerBg: 'bg-orange-50 border-orange-100' },
    { key: 'inProgress', label: 'In Progress', color: 'text-blue-600', accent: 'bg-blue-500', headerBg: 'bg-blue-50 border-blue-100' },
    { key: 'review', label: 'Review', color: 'text-purple-600', accent: 'bg-purple-500', headerBg: 'bg-purple-50 border-purple-100' },
    { key: 'resolved', label: 'Resolved', color: 'text-teal-600', accent: 'bg-teal-500', headerBg: 'bg-teal-50 border-teal-100' },
]

const recentActivity = [
    { actor: 'Sarah Wilson', action: 'updated status on', issue: 'Water Pipe Leak', time: '12m ago', type: 'update' },
    { actor: 'John Doe', action: 'submitted', issue: 'Debris on Footpath', time: '1h ago', type: 'create' },
    { actor: 'Tom Davis', action: 'resolved', issue: 'Park Bench Damaged', time: '2h ago', type: 'resolve' },
    { actor: 'Priya Mehta', action: 'assigned to self', issue: 'Traffic Signal Down', time: '3h ago', type: 'assign' },
]

function IssueCard({
    issue,
    onAssign,
    onMove,
    columns,
    currentCol,
}: {
    issue: Issue
    onAssign: () => void
    onMove: (to: string) => void
    columns: typeof columnConfig
    currentCol: string
}) {
    const p = priorityConfig[issue.priority]
    const [showMenu, setShowMenu] = useState(false)

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 p-4 group">
            <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="text-sm font-semibold text-gray-800 leading-snug flex-1">{issue.title}</h4>
                <div className="relative flex-shrink-0">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                        </svg>
                    </button>
                    {showMenu && (
                        <div className="absolute right-0 top-7 bg-white rounded-xl border border-gray-100 shadow-lg z-20 py-1.5 min-w-[160px]">
                            <button onClick={() => { onAssign(); setShowMenu(false) }} className="w-full text-left px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                                {issue.assignedTo ? 'Reassign' : 'Assign Staff'}
                            </button>
                            <div className="border-t border-gray-50 my-1" />
                            <p className="px-4 py-1 text-[10px] font-semibold text-gray-300 uppercase tracking-wider">Move to</p>
                            {columns.filter(c => c.key !== currentCol).map(c => (
                                <button
                                    key={c.key}
                                    onClick={() => { onMove(c.key); setShowMenu(false) }}
                                    className="w-full text-left px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                                >
                                    {c.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 mb-3">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${p.badge} flex items-center gap-1`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
                    {p.label}
                </span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{issue.category}</span>
            </div>

            {issue.location && (
                <div className="flex items-center gap-1 mb-3">
                    <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <span className="text-[10px] text-gray-400">{issue.location}</span>
                </div>
            )}

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[9px] font-bold text-gray-500">
                        {issue.reporter.charAt(0)}
                    </div>
                    <span className="text-[10px] text-gray-400 truncate max-w-[80px]">{issue.reporter}</span>
                </div>
                {issue.assignedTo ? (
                    <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center text-[9px] font-bold text-teal-700">
                            {issue.assignedTo.charAt(0)}
                        </div>
                        <span className="text-[10px] text-teal-600 font-medium truncate max-w-[80px]">{issue.assignedTo}</span>
                    </div>
                ) : (
                    <button
                        onClick={onAssign}
                        className="text-[10px] font-medium text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded-lg transition-colors"
                    >
                        Assign
                    </button>
                )}
            </div>

            <div className="mt-2 text-[10px] text-gray-300">{issue.createdAt}</div>
        </div>
    )
}

function AssignModal({ issue, onAssign, onClose }: { issue: Issue; onAssign: (id: string, name: string) => void; onClose: () => void }) {
    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-gray-900 text-sm">Assign Staff</h3>
                        <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[220px]">{issue.title}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-300 hover:text-gray-500 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-3">
                    {staffList.map(s => (
                        <button
                            key={s}
                            onClick={() => onAssign(issue.id, s)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all hover:bg-teal-50 text-left ${issue.assignedTo === s ? 'bg-teal-50 text-teal-700' : 'text-gray-700'}`}
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {s.charAt(0)}
                            </div>
                            {s}
                            {issue.assignedTo === s && (
                                <span className="ml-auto text-teal-500">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default function OrgDashboardPage({ params }: { params: { orgId: string } }) {
    const { orgId } = params
    const org = mockOrgs[orgId] ?? { name: 'Organization', description: '', industry: '' }

    const [issues, setIssues] = useState(initialIssues)
    const [assignTarget, setAssignTarget] = useState<Issue | null>(null)

    const totalIssues = Object.values(issues).flat().length
    const openCount = issues.open.length
    const inProgressCount = issues.inProgress.length
    const resolvedCount = issues.resolved.length

    const handleAssign = (issueId: string, staffName: string) => {
        const updated = { ...issues }
        Object.keys(updated).forEach(col => {
            updated[col] = updated[col].map(i => i.id === issueId ? { ...i, assignedTo: staffName } : i)
        })
        setIssues(updated)
        setAssignTarget(null)
    }

    const handleMove = (issueId: string, from: string, to: string) => {
        const issue = issues[from].find(i => i.id === issueId)
        if (!issue) return
        setIssues(prev => ({
            ...prev,
            [from]: prev[from].filter(i => i.id !== issueId),
            [to]: [issue, ...prev[to]],
        }))
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <OrgSidebar orgId={orgId} orgName={org.name} />

            <div className="flex-1 flex flex-col min-w-0">
                {/* Top bar */}
                <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
                    <div className="px-6 py-3.5 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                            <Link href="/admin/organizations" className="text-gray-400 hover:text-gray-600 transition-colors font-medium">Organizations</Link>
                            <span className="text-gray-200">/</span>
                            <span className="text-gray-700 font-semibold">{org.name}</span>
                            <span className="text-gray-200">/</span>
                            <span className="text-teal-600 font-medium">Dashboard</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="relative text-gray-400 hover:text-gray-600 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
                            </button>
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center text-white font-bold text-xs shadow-sm">SA</div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-6 overflow-auto">
                    {/* Page title */}
                    <div className="mb-6">
                        <h1 className="text-xl font-bold text-gray-900">{org.name}</h1>
                        <p className="text-sm text-gray-500 mt-0.5">{org.description}</p>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {[
                            { label: 'Total Issues', value: totalIssues, icon: '📋', color: 'text-gray-700', bg: 'bg-gray-50' },
                            { label: 'Open', value: openCount, icon: '🔴', color: 'text-orange-600', bg: 'bg-orange-50' },
                            { label: 'In Progress', value: inProgressCount, icon: '🔵', color: 'text-blue-600', bg: 'bg-blue-50' },
                            { label: 'Resolved', value: resolvedCount, icon: '✅', color: 'text-teal-600', bg: 'bg-teal-50' },
                        ].map(stat => (
                            <div key={stat.label} className={`${stat.bg} rounded-2xl p-4 border border-white shadow-sm`}>
                                <p className="text-xs font-medium text-gray-500 mb-1">{stat.label}</p>
                                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Two-column layout: Kanban + Activity */}
                    <div className="flex gap-6">
                        {/* Kanban Board */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-sm font-semibold text-gray-800">Issue Board</h2>
                                <span className="text-xs text-gray-400">{totalIssues} total issues</span>
                            </div>
                            <div className="grid grid-cols-4 gap-3 min-w-[900px]">
                                {columnConfig.map(col => (
                                    <div key={col.key} className="flex flex-col">
                                        {/* Column header */}
                                        <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border mb-2 ${col.headerBg}`}>
                                            <span className={`w-2 h-2 rounded-full ${col.accent}`} />
                                            <span className={`text-xs font-semibold ${col.color}`}>{col.label}</span>
                                            <span className={`ml-auto text-[10px] font-bold ${col.color} opacity-70`}>{issues[col.key]?.length ?? 0}</span>
                                        </div>
                                        {/* Cards */}
                                        <div className="space-y-2.5 flex-1">
                                            {(issues[col.key] ?? []).map(issue => (
                                                <IssueCard
                                                    key={issue.id}
                                                    issue={issue}
                                                    onAssign={() => setAssignTarget(issue)}
                                                    onMove={(to) => handleMove(issue.id, col.key, to)}
                                                    columns={columnConfig}
                                                    currentCol={col.key}
                                                />
                                            ))}
                                            {(issues[col.key] ?? []).length === 0 && (
                                                <div className="h-20 rounded-xl border-2 border-dashed border-gray-100 flex items-center justify-center">
                                                    <p className="text-[11px] text-gray-300 font-medium">No issues</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right panel: Activity + Quick Actions */}
                        <div className="w-64 flex-shrink-0 space-y-4">
                            {/* Notifications */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
                                    <h3 className="text-xs font-semibold text-gray-700">Recent Activity</h3>
                                    <span className="text-[10px] font-medium text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">Live</span>
                                </div>
                                <div className="divide-y divide-gray-50">
                                    {recentActivity.map((a, i) => (
                                        <div key={i} className="px-4 py-3">
                                            <div className="flex items-start gap-2">
                                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0 mt-0.5">
                                                    {a.actor.charAt(0)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[11px] text-gray-600 leading-snug">
                                                        <span className="font-semibold text-gray-800">{a.actor}</span>{' '}
                                                        {a.action}{' '}
                                                        <span className="font-medium text-teal-600">"{a.issue}"</span>
                                                    </p>
                                                    <p className="text-[10px] text-gray-300 mt-1">{a.time}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="px-4 py-3 border-b border-gray-50">
                                    <h3 className="text-xs font-semibold text-gray-700">Quick Actions</h3>
                                </div>
                                <div className="p-3 space-y-1.5">
                                    <Link href={`/admin/organizations/${orgId}/members`} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-gray-600 hover:bg-teal-50 hover:text-teal-700 transition-colors">
                                        <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                        </svg>
                                        Invite Member
                                    </Link>
                                    <Link href={`/admin/organizations/${orgId}/categories`} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-gray-600 hover:bg-teal-50 hover:text-teal-700 transition-colors">
                                        <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                        </svg>
                                        Add Category
                                    </Link>
                                    <Link href={`/admin/organizations/${orgId}/settings`} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-gray-600 hover:bg-teal-50 hover:text-teal-700 transition-colors">
                                        <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Export Report
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Assign Modal */}
            {assignTarget && (
                <AssignModal
                    issue={assignTarget}
                    onAssign={handleAssign}
                    onClose={() => setAssignTarget(null)}
                />
            )}
        </div>
    )
}
