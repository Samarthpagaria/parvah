'use client'

import { useState, useEffect, use } from 'react'
import OrgSidebar from '@/components/admin/OrgSidebar'
import Link from 'next/link'
import { orgAPI, issueAPI, analyticsAPI } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'

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

interface Column {
    key: string;
    label: string;
    color: string;
    accent: string;
    headerBg: string;
}

const columnConfig: Column[] = [
    { key: 'open', label: 'Open', color: 'text-orange-600', accent: 'bg-orange-500', headerBg: 'bg-orange-50 border-orange-100' },
    { key: 'in_progress', label: 'In Progress', color: 'text-blue-600', accent: 'bg-blue-500', headerBg: 'bg-blue-50 border-blue-100' },
    { key: 'review', label: 'Review', color: 'text-purple-600', accent: 'bg-purple-500', headerBg: 'bg-purple-50 border-purple-100' },
    { key: 'resolved', label: 'Resolved', color: 'text-teal-600', accent: 'bg-teal-500', headerBg: 'bg-teal-50 border-teal-100' },
]

const priorityConfig: Record<string, { label: string; dot: string; badge: string }> = {
    low: { label: 'Low', dot: 'bg-blue-400', badge: 'bg-blue-50 text-blue-600' },
    medium: { label: 'Medium', dot: 'bg-yellow-400', badge: 'bg-yellow-50 text-yellow-700' },
    high: { label: 'High', dot: 'bg-orange-400', badge: 'bg-orange-50 text-orange-700' },
    critical: { label: 'Critical', dot: 'bg-red-500', badge: 'bg-red-50 text-red-700' },
}

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
    onView: () => void
    columns: Column[]
    currentCol: string
}) {
    const p = priorityConfig[issue.priority]
    const [showMenu, setShowMenu] = useState(false)

    return (
        <div
            onClick={onView}
            className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 p-4 group cursor-pointer"
        >
            <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="text-sm font-semibold text-gray-800 leading-snug flex-1">{issue.title}</h4>
                <div className="relative flex-shrink-0">
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu) }}
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
                            {columns.filter((c: Column) => c.key !== currentCol).map((c: Column) => (
                                <button
                                    key={c.key}
                                    onClick={(e) => { e.stopPropagation(); onMove(c.key); setShowMenu(false) }}
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
                        onClick={(e) => { e.stopPropagation(); onAssign() }}
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

function AssignModal({
    issue,
    members,
    onAssign,
    onClose
}: {
    issue: Issue;
    members: any[];
    onAssign: (issueId: string, staffId: string) => void;
    onClose: () => void
}) {
    // Show members who can handle issues (owner, admin, staff)
    const staffMembers = members.filter(m => ['owner', 'admin', 'staff'].includes(m.role))

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
                <div className="p-3 max-h-[400px] overflow-auto">
                    {staffMembers.length === 0 && (
                        <div className="p-8 text-center">
                            <p className="text-xs text-gray-400">No staff members found in this organization.</p>
                        </div>
                    )}
                    {staffMembers.map(m => (
                        <button
                            key={m.admin_user?.id}
                            onClick={() => onAssign(issue.id, m.admin_user?.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all hover:bg-teal-50 text-left ${issue.assignedTo === m.admin_user?.full_name ? 'bg-teal-50 text-teal-700' : 'text-gray-700'}`}
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {m.admin_user?.full_name?.charAt(0) || 'S'}
                            </div>
                            <div>
                                <p className="text-sm font-semibold">{m.admin_user?.full_name}</p>
                                <p className="text-[10px] text-gray-400">{m.admin_user?.email}</p>
                            </div>
                            {issue.assignedTo === m.admin_user?.full_name && (
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

function DetailsModal({
    issue,
    onClose
}: {
    issue: Issue;
    onClose: () => void
}) {
    const p = priorityConfig[issue.priority]

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${p.badge}`}>
                                {p.label} Priority
                            </span>
                            <span className="text-[10px] font-medium text-gray-400 bg-white border border-gray-100 px-2 py-0.5 rounded-full">
                                {issue.category}
                            </span>
                        </div>
                        <h3 className="font-bold text-gray-900 text-xl leading-tight">{issue.title}</h3>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center text-gray-300 hover:text-gray-500 hover:bg-white border border-transparent hover:border-gray-100 transition-all">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Description</h4>
                            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-2xl p-5 border border-gray-100">
                                {issue.description || 'No description provided.'}
                            </p>
                        </div>

                        {issue.location && (
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Location</h4>
                                <div className="flex items-center gap-2 text-gray-700 bg-teal-50/50 rounded-2xl p-4 border border-teal-100/50">
                                    <svg className="w-5 h-5 text-teal-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    </svg>
                                    <span className="text-sm font-medium">{issue.location}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Reported By</h4>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-sm font-bold text-gray-500">
                                    {issue.reporter.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-800">{issue.reporter}</p>
                                    <p className="text-[10px] text-gray-400">{issue.createdAt}</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Assigned To</h4>
                            {issue.assignedTo ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center text-sm font-bold text-white shadow-sm">
                                        {issue.assignedTo.charAt(0)}
                                    </div>
                                    <p className="text-sm font-bold text-gray-800">{issue.assignedTo}</p>
                                </div>
                            ) : (
                                <div className="px-4 py-3 bg-orange-50 rounded-xl border border-orange-100">
                                    <p className="text-[11px] font-bold text-orange-600 uppercase tracking-tight">Unassigned</p>
                                </div>
                            )}
                        </div>

                        <div className="pt-4 mt-4 border-t border-gray-50">
                            <p className="text-[10px] text-gray-300 font-medium">Issue ID: {issue.id}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function OrgDashboardPage({ params }: { params: Promise<{ orgId: string }> }) {
    const { orgId } = use(params)
    const [org, setOrg] = useState<any>(null)
    const [stats, setStats] = useState<any>(null)
    const [issues, setIssues] = useState<Record<string, Issue[]>>({
        open: [],
        in_progress: [],
        review: [],
        resolved: [],
    })
    const [members, setMembers] = useState<any[]>([])
    const [trends, setTrends] = useState<any[]>([])
    const [recentActivity, setRecentActivity] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [assignTarget, setAssignTarget] = useState<Issue | null>(null)
    const [detailTarget, setDetailTarget] = useState<Issue | null>(null)
    const { user } = useAuthStore()

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const [orgData, statsData, issuesData, membersData, trendsData]: any = await Promise.all([
                orgAPI.getDetails(orgId),
                analyticsAPI.getOverview(orgId),
                issueAPI.list({ org_id: orgId, limit: 100, sort: 'updated_at', order: 'desc' }),
                orgAPI.listMembers(orgId),
                analyticsAPI.getTrends(orgId, 'daily')
            ])

            setOrg(orgData.organization)
            setStats(statsData)
            setMembers(membersData.members || [])
            setTrends(trendsData.trends || [])

            // Derive recent activity from issues
            const getActionLabel = (status: string) => {
                switch (status) {
                    case 'open': return 'reported';
                    case 'in_progress': return 'started working on';
                    case 'review': return 'marked for review';
                    case 'resolved': return 'resolved';
                    default: return 'updated';
                }
            }

            const activity = (issuesData.issues || []).slice(0, 5).map((issue: any) => ({
                actor: issue.admin_users?.full_name || issue.public_users?.full_name || 'System',
                action: getActionLabel(issue.status || 'open'),
                issue: issue.title,
                time: new Date(issue.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                type: issue.status === 'open' ? 'create' : 'update'
            }))
            setRecentActivity(activity)

            // Group issues by status
            const grouped: Record<string, Issue[]> = {
                open: [],
                in_progress: [],
                review: [],
                resolved: [],
            }

            issuesData.issues.forEach((issue: any) => {
                const status = issue.status || 'open'
                if (grouped[status]) {
                    grouped[status].push({
                        id: issue.id,
                        title: issue.title,
                        category: issue.issue_categories?.name || 'Uncategorized',
                        priority: issue.priority,
                        reporter: issue.public_users?.full_name || 'Citizen',
                        assignedTo: issue.admin_users?.full_name,
                        description: issue.description,
                        createdAt: new Date(issue.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                        location: issue.address
                    })
                }
            })
            setIssues(grouped)
        } catch (err) {
            console.error('Failed to fetch dashboard data:', err)
            toast.error('Failed to load dashboard data')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [orgId])

    const totalIssues = stats?.total || 0
    const openCount = stats?.open || 0
    const inProgressCount = stats?.inProgress || 0
    const resolvedCount = stats?.totalResolved || 0

    const handleAssign = async (issueId: string, staffId: string) => {
        try {
            await issueAPI.assignStaff(issueId, staffId)
            toast.success('Staff assigned successfully')
            fetchData() // Refresh
        } catch (err) {
            console.error('Failed to assign staff:', err)
            toast.error('Failed to assign staff')
        }
        setAssignTarget(null)
    }

    const handleMove = async (issueId: string, toStatus: string) => {
        try {
            await issueAPI.updateStatus(issueId, toStatus)
            toast.success(`Status updated to ${toStatus.replace('_', ' ')}`)
            fetchData() // Refresh
        } catch (err) {
            console.error('Failed to update status:', err)
            toast.error('Failed to update status')
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <OrgSidebar orgId={orgId} orgName={org?.name || 'Loading...'} />

            <div className="flex-1 flex flex-col min-w-0">
                {/* Top bar */}
                <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
                    <div className="px-6 py-3.5 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                            <Link href="/admin/organizations" className="text-gray-400 hover:text-gray-600 transition-colors font-medium">Organizations</Link>
                            <span className="text-gray-200">/</span>
                            <span className="text-gray-700 font-semibold">{org?.name || '...'}</span>
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
                        {isLoading ? (
                            <div className="animate-pulse space-y-2">
                                <div className="h-7 w-48 bg-gray-200 rounded-lg"></div>
                                <div className="h-4 w-72 bg-gray-100 rounded-lg"></div>
                            </div>
                        ) : (
                            <>
                                <h1 className="text-xl font-bold text-gray-900">{org?.name}</h1>
                                <p className="text-sm text-gray-500 mt-0.5">{org?.description}</p>
                            </>
                        )}
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {[
                            { label: 'Total Issues', value: totalIssues, icon: '📋', color: 'text-gray-700', bg: 'bg-white' },
                            { label: 'Resolved', value: resolvedCount, icon: '✅', color: 'text-teal-600', bg: 'bg-white' },
                            { label: 'Resolution Rate', value: stats?.resolutionRate || '0%', icon: '📈', color: 'text-blue-600', bg: 'bg-white' },
                            { label: 'Avg Time (hrs)', value: stats?.avgResolutionHours || 'N/A', icon: '⏱️', color: 'text-purple-600', bg: 'bg-white' },
                        ].map(stat => (
                            <div key={stat.label} className={`${stat.bg} rounded-2xl p-5 border border-gray-100 shadow-sm transition-all hover:shadow-md`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-lg">{stat.icon}</span>
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                                </div>
                                <p className={`text-3xl font-bold ${stat.color}`}>{isLoading ? '...' : stat.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Trends Highlight */}
                    {!isLoading && trends.length > 0 && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-sm font-bold text-gray-800">Issue Trends</h2>
                                    <p className="text-[10px] text-gray-400 mt-0.5">Reported issues over the last 30 days</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                                    <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">Real-time Data</span>
                                </div>
                            </div>
                            <div className="h-24 flex items-end gap-1.5 px-2">
                                {trends.slice(-14).map((day: any, i: number) => {
                                    const maxCount = Math.max(...trends.map(t => t.count)) || 1
                                    const height = (day.count / maxCount) * 100
                                    return (
                                        <div key={i} className="flex-1 group relative">
                                            <div
                                                className="bg-teal-50 group-hover:bg-teal-100 rounded-t-lg transition-all duration-300 relative overflow-hidden"
                                                style={{ height: `${Math.max(height, 8)}%` }}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-t from-teal-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[9px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                {day.count} issues ({day.date})
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                            <div className="flex justify-between mt-3 px-1">
                                <span className="text-[9px] font-bold text-gray-300 uppercase italic">Earlier</span>
                                <span className="text-[9px] font-bold text-gray-300 uppercase italic">Latest</span>
                            </div>
                        </div>
                    )}

                    {/* Two-column layout: Kanban + Activity */}
                    <div className="flex gap-6">
                        {/* Kanban Board */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-sm font-semibold text-gray-800">Issue Board</h2>
                                <span className="text-xs text-gray-400">{totalIssues} total issues</span>
                            </div>
                            <div className="grid grid-cols-4 gap-3 min-w-[900px]">
                                {columnConfig.map((col: Column) => (
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
                                                    onView={() => setDetailTarget(issue)}
                                                    onMove={(to) => handleMove(issue.id, to)}
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
                    members={members}
                    onAssign={handleAssign}
                    onClose={() => setAssignTarget(null)}
                />
            )}

            {/* Details Modal */}
            {detailTarget && (
                <DetailsModal
                    issue={detailTarget}
                    onClose={() => setDetailTarget(null)}
                />
            )}
        </div>
    )
}
