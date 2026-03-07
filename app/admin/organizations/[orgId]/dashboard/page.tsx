'use client'

import { useState, useEffect, use } from 'react'
import OrgSidebar from '@/components/admin/OrgSidebar'
import OrgAssistant from '@/components/admin/OrgAssistant'
import Link from 'next/link'
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
    AreaChart, Area
} from 'recharts'
import { analyticsAPI, orgAPI, authAPI, issueAPI } from '@/utils/backend_api_endpoints'
import {
    Activity, CheckCircle2, AlertCircle, Clock,
    BarChart3, PieChart as PieIcon, TrendingUp, Users
} from 'lucide-react'

// Mock fallback data just in case


const COLORS = ['#576CDB', '#088395', '#F25A5A', '#7AB2B2', '#FFBB28', '#FF8042']

type Status = 'open' | 'in_progress' | 'resolved'
type Priority = 'low' | 'medium' | 'high' | 'critical'

interface AssignedIssue {
    id: string
    title: string
    category: string
    description: string
    priority: Priority
    reporter: string
    assignedTo?: string
    assignedAt: string
    status: Status
    location: string
    notes?: string
}

const pConfig: Record<Priority, { label: string; dot: string; badge: string }> = {
    low: { label: 'Low', dot: 'bg-blue-400', badge: 'bg-blue-50 text-blue-600' },
    medium: { label: 'Medium', dot: 'bg-yellow-400', badge: 'bg-yellow-50 text-yellow-700' },
    high: { label: 'High', dot: 'bg-orange-400', badge: 'bg-orange-50 text-orange-700' },
    critical: { label: 'Critical', dot: 'bg-red-500', badge: 'bg-red-50 text-red-700' },
}

const statusConfig: Record<Status, { label: string; color: string; next: Status | null; nextLabel: string }> = {
    'open': { label: 'Pending', color: 'text-amber-600 bg-amber-50', next: 'in_progress', nextLabel: 'Start Working' },
    'in_progress': { label: 'In Progress', color: 'text-blue-600 bg-blue-50', next: 'resolved', nextLabel: 'Mark Complete' },
    'resolved': { label: 'Completed', color: 'text-teal-600 bg-teal-50', next: null, nextLabel: '' },
}

export default function OrgDashboardPage({ params }: { params: Promise<{ orgId: string }> }) {
    const { orgId } = use(params)
    const [loading, setLoading] = useState(true)
    const [org, setOrg] = useState<any>(null)
    const [user, setUser] = useState<any>(null)
    const [overview, setOverview] = useState<any>(null)
    const [trends, setTrends] = useState<any[]>([])
    const [categories, setCategories] = useState<any[]>([])
    const [statusDist, setStatusDist] = useState<any[]>([])
    const [staffPerf, setStaffPerf] = useState<any[]>([])
    const [role, setRole] = useState<any>(null)
    const [assignedIssues, setAssignedIssues] = useState<AssignedIssue[]>([])
    const [allIssues, setAllIssues] = useState<Record<string, AssignedIssue[]>>({ open: [], in_progress: [], resolved: [] })
    const [staffList, setStaffList] = useState<any[]>([])
    const [selectedIssue, setSelectedIssue] = useState<AssignedIssue | null>(null)
    const [assignTarget, setAssignTarget] = useState<AssignedIssue | null>(null)
    const [filter, setFilter] = useState<'all' | Status>('all')

    const handleAssign = async (issueId: string, staffMember: any) => {
        try {
            await issueAPI.assignStaff(issueId, staffMember.id)
            const updated = { ...allIssues }
            Object.keys(updated).forEach(col => {
                updated[col] = updated[col].map(i => i.id === issueId ? { ...i, assignedTo: staffMember.full_name } : i)
            })
            setAllIssues(updated)
            setAssignTarget(null)
        } catch (err) {
            console.error('Assign failed:', err)
        }
    }

    const handleMove = async (issueId: string, from: string, to: string) => {
        if (from === to) return
        try {
            await issueAPI.updateStatus(issueId, to as any)
            const issue = allIssues[from].find(i => i.id === issueId)
            if (!issue) return
            setAllIssues(prev => ({
                ...prev,
                [from]: prev[from].filter(i => i.id !== issueId),
                [to]: [{ ...issue, status: to as Status }, ...prev[to]],
            }))
        } catch (err) {
            console.error('Move failed:', err)
        }
    }

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [ov, tr, cat, st, sp, orgRes, userRes] = await Promise.all([
                    analyticsAPI.getOverview(orgId),
                    analyticsAPI.getTrends(orgId),
                    analyticsAPI.getByCategory(orgId),
                    analyticsAPI.getByStatus(orgId),
                    analyticsAPI.getStaffPerformance(orgId),
                    orgAPI.getDetails(orgId),
                    authAPI.getMe()
                ])
                setOverview(ov)
                setTrends(tr.trends || [])
                setCategories(cat.categories || [])
                setStatusDist(st.distribution || [])
                setStaffPerf(sp.staff || [])
                setOrg(orgRes.organization)
                const myRole = orgRes.my_role
                setRole(myRole)
                setUser(userRes.user)

                if (myRole === 'staff') {
                    const issuesRes = await issueAPI.list({ assigned_to: userRes.user.id, org_id: orgId })
                    const list = (issuesRes.issues || []).map((i: any) => ({
                        id: i.id,
                        title: i.title,
                        category: i.issue_categories?.name || 'General',
                        description: i.description,
                        priority: i.priority,
                        reporter: i.public_users?.full_name || 'Citizen',
                        assignedTo: i.admin_users?.full_name,
                        assignedAt: new Date(i.created_at).toLocaleDateString(undefined, { month: 'short', day: '2-digit' }),
                        status: i.status === 'open' ? 'open' : i.status === 'resolved' ? 'resolved' : 'in_progress' as Status,
                        location: i.address || 'Local Area',
                        notes: i.resolution_note
                    }))
                    setAssignedIssues(list)
                } else {
                    // Load all issues and staff for admin management
                    const [issuesRes, membersRes] = await Promise.all([
                        issueAPI.list({ org_id: orgId }),
                        orgAPI.listMembers(orgId)
                    ])
                    const rawIssues = (issuesRes.issues || []).map((i: any) => ({
                        id: i.id,
                        title: i.title,
                        category: i.issue_categories?.name || 'General',
                        description: i.description,
                        priority: i.priority,
                        reporter: i.public_users?.full_name || 'Citizen',
                        assignedTo: i.admin_users?.full_name,
                        assignedAt: new Date(i.created_at).toLocaleDateString(undefined, { month: 'short', day: '2-digit' }),
                        status: i.status === 'open' ? 'open' : i.status === 'resolved' ? 'resolved' : 'in_progress' as Status,
                        location: i.address || 'Local Area',
                        notes: i.resolution_note
                    }))
                    setAllIssues({
                        open: rawIssues.filter((i: any) => i.status === 'open'),
                        in_progress: rawIssues.filter((i: any) => i.status === 'in_progress'),
                        resolved: rawIssues.filter((i: any) => i.status === 'resolved'),
                    })
                    setStaffList((membersRes.members || []).map((m: any) => ({
                        id: m.admin_user?.id || m.admin_user_id,
                        full_name: m.admin_user?.full_name || 'Unknown',
                        role: m.role
                    })))
                }
            } catch (err) {
                console.error("Failed to fetch analytics", err)
            } finally {
                setLoading(false)
            }
        }
        fetchAll()
    }, [orgId])

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F9F9FB] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#201F47] border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-500 font-normal animate-pulse">Loading Analytics Hub...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F9F9FB] flex font-sans">
            <OrgSidebar orgId={orgId} orgName={org?.name || overview?.orgName || 'Organization'} role={role} />

            <div className="flex-1 flex flex-col min-w-0">
                <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40">
                    <div className="px-6 md:px-8 flex items-center justify-between h-[68px]">
                        <div className="flex items-center gap-2 md:gap-3 text-[14px] font-normal truncate">
                            <Link href="/admin/organizations" className="text-gray-400 hover:text-[#201F47] transition-colors hidden sm:block">Organizations</Link>
                            <span className="text-gray-300 hidden sm:block">/</span>
                            <span className="text-gray-400">{org?.name || overview?.orgName || 'Organization'}</span>
                            <span className="text-gray-300">/</span>
                            <span className="text-[#201F47]">Analytics Dashboard</span>
                        </div>
                        <div className="flex items-center gap-4 flex-shrink-0">
                            <Link href="/admin/profile" className="w-8 h-8 rounded-xl bg-[#088395]/10 text-[#088395] flex items-center justify-center font-normal text-[13px] hover:ring-2 hover:ring-[#088395]/20 transition-all">
                                {user?.full_name?.split(' ').map((n: any) => n[0]).join('') || 'A'}
                            </Link>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-6 md:p-8 overflow-auto flex flex-col">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
                        <div>
                            <h1 className="text-[28px] font-normal text-[#201F47] leading-tight mb-2 tracking-tight">
                                {role === 'staff' ? 'Staff Overview' : 'Analytics Hub'}
                            </h1>
                            <p className="text-[15px] font-normal text-gray-500">
                                {role === 'staff'
                                    ? 'Track your personal contributions and assigned tasks.'
                                    : 'Real-time insights and performance metrics for your organization.'}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            {role !== 'staff' && (
                                <button
                                    onClick={() => window.scrollTo({ top: document.getElementById('pipeline')?.offsetTop ? document.getElementById('pipeline')!.offsetTop - 100 : 1000, behavior: 'smooth' })}
                                    className="px-4 py-2 bg-[#201F47] text-white text-[13px] rounded-xl hover:bg-[#14122d] transition-all flex items-center gap-2 shadow-lg shadow-[#201F47]/10"
                                >
                                    <Activity className="w-4 h-4" />
                                    Manage Issues
                                </button>
                            )}
                        </div>
                    </div>

                    {role === 'staff' ? (
                        <div className="flex-1 flex flex-col min-h-0">
                            {/* Staff Stats */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                <KPICard title="Your Tasks" value={assignedIssues.length} icon={<Activity className="text-purple-500" />} trend="Active assignments" />
                                <KPICard title="Pending" value={assignedIssues.filter(i => i.status === 'open').length} icon={<AlertCircle className="text-amber-500" />} trend="Awaiting action" />
                                <KPICard title="In Progress" value={assignedIssues.filter(i => i.status === 'in_progress').length} icon={<Clock className="text-blue-500" />} trend="Current focus" />
                                <KPICard title="Completed" value={assignedIssues.filter(i => i.status === 'resolved').length} icon={<CheckCircle2 className="text-teal-500" />} trend="Last 30 days" />
                            </div>

                            {/* Filters */}
                            <div className="flex items-center gap-2 mb-6 flex-wrap">
                                {(['all', 'open', 'in_progress', 'resolved'] as const).map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={`px-4 py-1.5 rounded-full text-xs font-normal transition-all ${filter === f
                                            ? 'bg-[#201F47] text-white'
                                            : 'bg-white text-gray-400 border border-gray-100 hover:border-gray-200 hover:text-gray-600'
                                            }`}
                                    >
                                        {f === 'all' ? 'All Assignments' : statusConfig[f].label}
                                    </button>
                                ))}
                                <span className="text-[11px] text-gray-400 ml-auto font-normal">{assignedIssues.filter(i => filter === 'all' || i.status === filter).length} showing</span>
                            </div>

                            {/* Assignments List */}
                            <div className="space-y-4">
                                {assignedIssues.filter(i => filter === 'all' || i.status === filter).length === 0 ? (
                                    <div className="bg-white rounded-[32px] border border-dashed border-gray-200 p-16 text-center">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle2 className="w-8 h-8 text-gray-300" />
                                        </div>
                                        <p className="text-[15px] font-normal text-gray-400">No issues found with this status.</p>
                                    </div>
                                ) : assignedIssues.filter(i => filter === 'all' || i.status === filter).map(issue => {
                                    const p = pConfig[issue.priority]
                                    const s = statusConfig[issue.status]
                                    return (
                                        <div key={issue.id} className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all groups">
                                            <div className="flex items-start gap-5">
                                                <div className={`w-1 rounded-full flex-shrink-0 self-stretch ${p.dot}`} />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div>
                                                            <h3 className="text-[16px] font-normal text-[#201F47] mb-1">{issue.title}</h3>
                                                            <p className="text-[13px] text-gray-400 font-normal">{issue.location}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2 flex-shrink-0">
                                                            <span className={`text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-lg ${p.badge} flex items-center gap-1.5`}>
                                                                <span className={`w-1 h-1 rounded-full ${p.dot}`} />{p.label}
                                                            </span>
                                                            <span className={`text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-lg ${s.color}`}>{s.label}</span>
                                                        </div>
                                                    </div>
                                                    <p className="text-[14px] text-gray-500 font-normal mt-3 leading-relaxed line-clamp-2">{issue.description}</p>
                                                    {issue.notes && (
                                                        <div className="mt-4 bg-[#F9F9FB] rounded-2xl px-4 py-3 border border-gray-50">
                                                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Latest Update</p>
                                                            <p className="text-[13px] text-gray-600 font-normal italic">"{issue.notes}"</p>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-50/50">
                                                        <div className="flex items-center gap-4">
                                                            <span className="text-[11px] font-medium text-[#088395] bg-[#088395]/5 px-2 py-0.5 rounded-md">{issue.category}</span>
                                                            <span className="text-[11px] font-normal text-gray-400">Reported by <span className="text-gray-600 font-medium">{issue.reporter}</span></span>
                                                            <span className="text-[11px] font-normal text-gray-300">/</span>
                                                            <span className="text-[11px] font-normal text-gray-400">{issue.assignedAt}</span>
                                                        </div>
                                                        {issue.status !== 'resolved' && (
                                                            <button
                                                                onClick={() => setSelectedIssue(issue)}
                                                                className="text-[13px] font-normal text-white bg-[#088395] hover:bg-[#066d7c] px-5 py-2 rounded-xl transition-all shadow-lg shadow-[#088395]/10"
                                                            >
                                                                Update Status
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            {selectedIssue && (
                                <StatusUpdateModal
                                    issue={selectedIssue}
                                    onUpdate={async (id, newStatus, notes) => {
                                        try {
                                            await issueAPI.updateStatus(id, newStatus)
                                            setAssignedIssues(prev => prev.map(i => i.id === id ? { ...i, status: newStatus, notes } : i))
                                            setSelectedIssue(null)
                                        } catch (err) {
                                            alert('Failed to update status')
                                        }
                                    }}
                                    onClose={() => setSelectedIssue(null)}
                                />
                            )}
                        </div>
                    ) : (
                        <>
                            {/* KPI Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                <KPICard title="Total Issues" value={overview?.total} icon={<Activity className="text-blue-500" />} trend="+12% from last month" />
                                <KPICard title="Open Issues" value={overview?.open} icon={<AlertCircle className="text-red-500" />} trend="Requires attention" />
                                <KPICard
                                    title="Avg. Resolution"
                                    value={overview?.avgResolutionHours != null ? `${overview.avgResolutionHours}h` : '0h'}
                                    icon={<Clock className="text-orange-500" />}
                                    trend="Improved performance"
                                />
                                <KPICard title="Resolution Rate" value={`${overview?.resolutionRate || 0}%`} icon={<CheckCircle2 className="text-green-500" />} trend="Consistent performance" />
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                {/* Submission Trends */}
                                <ChartWrapper title="Submission Volume" subtitle="Daily reports over time" icon={<TrendingUp className="w-4 h-4" />}>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <AreaChart data={trends}>
                                            <defs>
                                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#576CDB" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#576CDB" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Area type="monotone" dataKey="count" stroke="#576CDB" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </ChartWrapper>

                                {/* Status Distribution */}
                                <ChartWrapper title="Status Distribution" subtitle="Issue lifecycle breakdown" icon={<PieIcon className="w-4 h-4" />}>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={statusDist}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={80}
                                                outerRadius={100}
                                                paddingAngle={5}
                                                dataKey="count"
                                                nameKey="status"
                                            >
                                                {statusDist.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </ChartWrapper>

                                {/* Category Analysis */}
                                <ChartWrapper title="Category Breakdown" subtitle="Issues reported by category" icon={<BarChart3 className="w-4 h-4" />}>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={categories} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                                            <XAxis type="number" axisLine={false} tickLine={false} hide />
                                            <YAxis
                                                dataKey="categoryName"
                                                type="category"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#4B5563', fontSize: 12 }}
                                                width={100}
                                            />
                                            <Tooltip
                                                cursor={{ fill: 'transparent' }}
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Bar dataKey="count" fill="#088395" radius={[0, 4, 4, 0]} barSize={20} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartWrapper>

                                {/* Staff Efficiency */}
                                <ChartWrapper title="Staff Performance" subtitle="Resolved issues per member" icon={<Users className="w-4 h-4" />}>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={staffPerf}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                            <XAxis dataKey="fullName" axisLine={false} tickLine={false} tick={{ fill: '#4B5563', fontSize: 11 }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                                            <Tooltip
                                                cursor={{ fill: '#f9fafb' }}
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Bar dataKey="resolvedCount" fill="#576CDB" radius={[4, 4, 0, 0]} barSize={40} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartWrapper>
                            </div>

                            {/* Issues Pipeline for Admins */}
                            <div id="pipeline" className="mt-12">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-[20px] font-normal text-[#201F47]">Operational Pipeline</h2>
                                        <p className="text-[13px] text-gray-400">Drag and drop issues to update status or assign staff.</p>
                                    </div>
                                    <div className="bg-white border border-gray-100 px-3 py-1.5 rounded-full flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                        <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Live View</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {(['open', 'in_progress', 'resolved'] as const).map(status => {
                                        const colIssues = allIssues[status] || []
                                        const config = statusConfig[status]
                                        return (
                                            <div key={status} className="bg-gray-50/50 rounded-[28px] p-4 border border-gray-100/50 flex flex-col min-h-[400px]">
                                                <div className="flex items-center justify-between mb-4 px-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`w-2 h-2 rounded-full ${status === 'open' ? 'bg-amber-400' : status === 'in_progress' ? 'bg-blue-400' : 'bg-teal-400'}`} />
                                                        <h3 className="text-[14px] font-semibold text-[#201F47] uppercase tracking-wide">{config.label}</h3>
                                                    </div>
                                                    <span className="text-[11px] font-medium text-gray-400 bg-white border border-gray-100 px-2 py-0.5 rounded-lg">{colIssues.length}</span>
                                                </div>

                                                <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1 custom-scrollbar">
                                                    {colIssues.length === 0 ? (
                                                        <div className="h-24 flex items-center justify-center border border-dashed border-gray-200 rounded-2xl">
                                                            <p className="text-[12px] text-gray-300">No issues</p>
                                                        </div>
                                                    ) : colIssues.map(issue => (
                                                        <div
                                                            key={issue.id}
                                                            className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group cursor-default"
                                                        >
                                                            <div className="flex items-start justify-between gap-3 mb-2">
                                                                <h4 className="text-[14px] font-medium text-[#201F47] leading-tight flex-1">{issue.title}</h4>
                                                                <div className="relative group/menu">
                                                                    <button className="text-gray-300 hover:text-gray-600">
                                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                                            <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                                                                        </svg>
                                                                    </button>
                                                                    <div className="absolute right-0 top-6 bg-white rounded-xl border border-gray-100 shadow-xl z-20 py-1 min-w-[140px] hidden group-hover/menu:block">
                                                                        <button onClick={() => setAssignTarget(issue)} className="w-full text-left px-4 py-2 text-[12px] text-gray-600 hover:bg-gray-50 flex items-center gap-2">
                                                                            <Users className="w-3.5 h-3.5" /> {issue.assignedTo ? 'Reassign' : 'Assign'}
                                                                        </button>
                                                                        {(['open', 'in_progress', 'resolved'] as const).filter(s => s !== status).map(s => (
                                                                            <button
                                                                                key={s}
                                                                                onClick={() => handleMove(issue.id, status, s)}
                                                                                className="w-full text-left px-4 py-2 text-[12px] text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                                                                            >
                                                                                <TrendingUp className="w-3.5 h-3.5" /> Move to {statusConfig[s].label}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-2 mb-3">
                                                                <span className={`text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${pConfig[issue.priority].badge}`}>
                                                                    {issue.priority}
                                                                </span>
                                                                <span className="text-[9px] uppercase tracking-wider font-medium text-gray-400">{issue.category}</span>
                                                            </div>

                                                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                                                                <div className="flex items-center gap-1.5">
                                                                    {issue.assignedTo ? (
                                                                        <div className="flex items-center gap-1.5">
                                                                            <div className="w-5 h-5 rounded-full bg-teal-50 flex items-center justify-center text-[9px] font-bold text-teal-600 border border-teal-100">
                                                                                {issue.assignedTo.charAt(0)}
                                                                            </div>
                                                                            <span className="text-[11px] text-gray-500 font-medium truncate max-w-[70px]">{issue.assignedTo.split(' ')[0]}</span>
                                                                        </div>
                                                                    ) : (
                                                                        <button onClick={() => setAssignTarget(issue)} className="text-[10px] text-[#088395] font-medium bg-[#088395]/5 px-2 py-0.5 rounded hover:bg-[#088395]/10 transition-colors">
                                                                            + Assign
                                                                        </button>
                                                                    )}
                                                                </div>
                                                                <span className="text-[10px] text-gray-300 font-normal">{issue.assignedAt}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </>
                    )}

                    {assignTarget && (
                        <AssignModal
                            issue={assignTarget}
                            staff={staffList}
                            onAssign={handleAssign}
                            onClose={() => setAssignTarget(null)}
                        />
                    )
                    }
                </main>
            </div>

            <OrgAssistant orgId={orgId} />
        </div>
    )
}

function KPICard({ title, value, icon, trend }: { title: string; value: any; icon: React.ReactNode; trend: string }) {
    return (
        <div className="bg-white rounded-[24px] border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
            <div className="relative z-10 flex flex-col gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center transition-colors group-hover:bg-white group-hover:shadow-inner">
                    {icon}
                </div>
                <div>
                    <p className="text-[13px] font-normal text-gray-400 mb-1">{title}</p>
                    <p className="text-[32px] font-normal text-[#201F47] leading-none tracking-tight">{value || 0}</p>
                </div>
                <p className="text-[11px] font-normal text-gray-400 mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 inline text-green-500" />
                    {trend}
                </p>
            </div>
        </div>
    )
}

function ChartWrapper({ title, subtitle, children, icon }: { title: string; subtitle: string; children: React.ReactNode; icon: React.ReactNode }) {
    return (
        <div className="bg-white rounded-[24px] border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 rounded-lg bg-[#201F47]/5 flex items-center justify-center text-[#201F47]">
                            {icon}
                        </div>
                        <h3 className="text-[17px] font-normal text-[#201F47]">{title}</h3>
                    </div>
                    <p className="text-[13px] font-normal text-gray-400 ml-10">{subtitle}</p>
                </div>
            </div>
            <div className="w-full">
                {children}
            </div>
        </div>
    )
}

function StatusUpdateModal({ issue, onUpdate, onClose }: { issue: AssignedIssue; onUpdate: (id: string, s: Status, n?: string) => void; onClose: () => void }) {
    const [notes, setNotes] = useState(issue.notes ?? '')
    const next = statusConfig[issue.status].next
    const nextLabel = statusConfig[issue.status].nextLabel

    return (
        <div className="fixed inset-0 bg-[#201F47]/20 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
                    <div>
                        <h3 className="font-normal text-[#201F47] text-[17px]">Update Status</h3>
                        <p className="text-[12px] text-gray-400 mt-0.5 truncate max-w-[260px]">{issue.title}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-300 hover:text-gray-500 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-6 space-y-6">
                    <div className="bg-[#F9F9FB] rounded-2xl p-4 border border-gray-50">
                        <p className="text-[12px] text-gray-500 font-normal">Current: <span className={`font-semibold px-2 py-0.5 rounded-lg text-[10px] ml-1 uppercase tracking-wider ${statusConfig[issue.status].color}`}>{statusConfig[issue.status].label}</span></p>
                        {next && <p className="text-[12px] text-gray-500 mt-2 font-normal">Next: <span className="font-medium text-[#201F47]">{statusConfig[next].label}</span></p>}
                    </div>
                    <div>
                        <label className="block text-[12px] font-normal text-gray-500 mb-2 ml-1">Work Log / Progress Notes</label>
                        <textarea
                            rows={4}
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="Describe what you've done or any blockers you've encountered..."
                            className="w-full px-4 py-3 text-[14px] font-normal border border-gray-100 rounded-2xl outline-none focus:border-[#088395] focus:ring-4 focus:ring-[#088395]/5 transition-all resize-none placeholder:text-gray-300"
                        />
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="flex-1 py-3 text-[14px] font-normal text-gray-500 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">Discard</button>
                        {next ? (
                            <button
                                onClick={() => onUpdate(issue.id, next, notes)}
                                className="flex-1 py-3 text-[14px] font-normal text-white bg-[#088395] hover:bg-[#066d7c] rounded-2xl transition-all shadow-lg shadow-[#088395]/10"
                            >
                                {nextLabel}
                            </button>
                        ) : (
                            <button disabled className="flex-1 py-3 text-[14px] font-normal text-gray-400 bg-gray-100 rounded-2xl cursor-not-allowed">
                                Fully Resolved
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function AssignModal({ issue, staff, onAssign, onClose }: { issue: AssignedIssue; staff: any[]; onAssign: (id: string, staff: any) => void; onClose: () => void }) {
    return (
        <div className="fixed inset-0 bg-[#201F47]/20 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
                    <div>
                        <h3 className="font-normal text-[#201F47] text-[17px]">Assign Staff</h3>
                        <p className="text-[12px] text-gray-400 mt-0.5 truncate max-w-[200px]">{issue.title}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-300 hover:text-gray-500 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-4 max-h-[350px] overflow-y-auto custom-scrollbar">
                    {staff.length === 0 ? (
                        <div className="py-8 text-center">
                            <p className="text-sm text-gray-400">No staff members found.</p>
                        </div>
                    ) : staff.map((s) => (
                        <button
                            key={s.id}
                            onClick={() => onAssign(issue.id, s)}
                            className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all hover:bg-gray-50 mb-1 ${issue.assignedTo === s.full_name ? 'bg-teal-50 border-teal-100 border' : 'border-transparent border'}`}
                        >
                            <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-teal-600 font-bold shadow-sm">
                                {s.full_name?.charAt(0)}
                            </div>
                            <div className="flex-1">
                                <p className="text-[14px] font-medium text-[#201F47] leading-none mb-1">{s.full_name}</p>
                                <p className="text-[11px] text-gray-400 uppercase tracking-wider">{s.role}</p>
                            </div>
                            {issue.assignedTo === s.full_name && (
                                <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center">
                                    <CheckCircle2 className="w-3 h-3 text-white" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
                <div className="p-4 bg-gray-50/50 border-t border-gray-50">
                    <button onClick={onClose} className="w-full py-3 text-[14px] font-normal text-gray-500 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors">Cancel</button>
                </div>
            </div>
        </div>
    )
}
