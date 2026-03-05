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
        { id: '1', title: 'Pothole on Main Street', category: 'Road', priority: 'high', reporter: 'John Doe', description: 'Large pothole affecting traffic flow', createdAt: 'Mar 01', location: 'Main Street' },
        { id: '2', title: 'Broken Street Light', category: 'Lighting', priority: 'medium', reporter: 'Jane Smith', description: 'Street light not working at night', createdAt: 'Mar 02', location: 'Park Avenue' },
        { id: '6', title: 'Debris on Footpath', category: 'Cleanliness', priority: 'low', reporter: 'Anita Rao', description: 'Garbage dumped on the footpath', createdAt: 'Mar 04', location: 'MG Road' },
    ],
    inProgress: [
        { id: '3', title: 'Water Pipe Leak', category: 'Water', priority: 'critical', reporter: 'Mike J.', assignedTo: 'Sarah Wilson', description: 'Major water leak causing wastage', createdAt: 'Mar 01', location: 'Oak Street' },
        { id: '7', title: 'Park Bench Damaged', category: 'Parks', priority: 'medium', reporter: 'Sara Lee', assignedTo: 'Tom Davis', description: 'Bench in central park is broken', createdAt: 'Mar 03', location: 'Central Park' },
    ],
    review: [
        { id: '8', title: 'Traffic Signal Down', category: 'Transport', priority: 'high', reporter: 'Vinod S.', assignedTo: 'Priya Mehta', description: 'Traffic signal at intersection not working', createdAt: 'Feb 28', location: 'Ring Road' },
    ],
    resolved: [
        { id: '4', title: 'Gutter Cleaning', category: 'Maintenance', priority: 'low', reporter: 'Alice B.', assignedTo: 'Tom Davis', description: 'Gutters cleaned successfully', createdAt: 'Feb 28', location: 'Park Circle' },
        { id: '5', title: 'Sidewalk Repair', category: 'Safety', priority: 'medium', reporter: 'Bob W.', assignedTo: 'John Davis', description: 'Sidewalk repaired and ready', createdAt: 'Feb 25', location: 'Third Street' },
    ],
}

const priorityConfig: Record<string, { label: string; color: string; bg: string }> = {
    low: { label: 'Low', color: 'text-[#576CDB]', bg: 'bg-[#576CDB]/15' },
    medium: { label: 'Medium', color: 'text-[#088395]', bg: 'bg-[#088395]/15' },
    high: { label: 'High', color: 'text-[#F25A5A]', bg: 'bg-[#F25A5A]/15' },
    critical: { label: 'Critical', color: 'text-red-600', bg: 'bg-red-100' },
}

const columnConfig = [
    { key: 'open', label: 'To Do', color: 'text-gray-200', barBg: 'bg-gray-400' },
    { key: 'inProgress', label: 'In Progress', color: 'text-[#8AA1FF]', barBg: 'bg-[#576CDB]' },
    { key: 'review', label: 'In Review', color: 'text-[#3BD0E3]', barBg: 'bg-[#088395]' },
    { key: 'resolved', label: 'Done', color: 'text-[#9AD9D9]', barBg: 'bg-[#7AB2B2]' },
]

const recentActivity = [
    { actor: 'Sarah Wilson', action: 'updated status of', issue: 'Water Pipe Leak', time: '12m ago' },
    { actor: 'John Doe', action: 'submitted', issue: 'Debris on Footpath', time: '1h ago' },
    { actor: 'Tom Davis', action: 'resolved', issue: 'Park Bench Damaged', time: '2h ago' },
    { actor: 'Priya Mehta', action: 'assigned to self', issue: 'Traffic Signal Down', time: '3h ago' },
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
    const [isDragging, setIsDragging] = useState(false)

    const handleDragStart = (e: React.DragEvent) => {
        setIsDragging(true)
        e.dataTransfer.setData('issueId', issue.id)
        e.dataTransfer.setData('sourceCol', currentCol)
        e.dataTransfer.effectAllowed = 'move'
        // Slight delay for the visual drag image representation to complete before fading the original
        setTimeout(() => setIsDragging(false), 0)
    }

    const handleDragEnd = () => {
        setIsDragging(false)
    }

    return (
        <div 
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            className={`bg-white rounded-[16px] border border-gray-100 p-4 group relative hover:shadow-xl hover:shadow-[#201F47]/5 transition-all duration-300 transform ${isDragging ? 'opacity-50 scale-95' : 'hover:-translate-y-1'} cursor-grab active:cursor-grabbing`}
        >
            {/* Context Menu Button */}
            <button
                onClick={() => setShowMenu(!showMenu)}
                className="absolute top-3 right-3 w-6 h-6 rounded flex items-center justify-center text-gray-300 hover:text-gray-600 hover:bg-gray-50 transition-colors opacity-0 group-hover:opacity-100 z-10"
            >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                </svg>
            </button>
            {showMenu && (
                <div className="absolute right-3 top-9 bg-white rounded-xl border border-gray-100 shadow-xl z-20 py-1 min-w-[140px]">
                    <button onClick={() => { onAssign(); setShowMenu(false) }} className="w-full text-left px-4 py-2 text-[13px] font-normal text-gray-600 hover:bg-gray-50 transition-colors">
                        {issue.assignedTo ? 'Reassign' : 'Assign Staff'}
                    </button>
                    <div className="border-t border-gray-50 my-1" />
                    <p className="px-4 py-1 text-[11px] font-normal text-gray-400 uppercase tracking-widest">Move to</p>
                    {columns.filter(c => c.key !== currentCol).map(c => (
                        <button
                            key={c.key}
                            onClick={() => { onMove(c.key); setShowMenu(false) }}
                            className="w-full text-left px-4 py-2 text-[13px] font-normal text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            {c.label}
                        </button>
                    ))}
                </div>
            )}

            <div className="flex items-center gap-2 mb-3">
                <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${p.bg} ${p.color}`}>
                    {p.label}
                </span>
                <span className="text-[11px] font-normal px-2.5 py-0.5 rounded-full bg-[#F9F9FB] text-gray-500 border border-gray-100">
                    {issue.category}
                </span>
            </div>

            <h4 className="text-[15px] font-normal text-[#201F47] leading-tight mb-2 pr-4">{issue.title}</h4>
            
            {issue.location && (
                <div className="flex items-center gap-1.5 mb-4">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <span className="text-[12px] font-normal text-gray-500">{issue.location}</span>
                </div>
            )}

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                <div className="flex items-center gap-2">
                    {issue.assignedTo ? (
                        <>
                            <div className="w-6 h-6 rounded-full bg-[#088395]/10 flex items-center justify-center text-[10px] font-normal text-[#088395]">
                                {issue.assignedTo.charAt(0)}
                            </div>
                            <span className="text-[12px] font-normal text-gray-600 truncate max-w-[80px]">{issue.assignedTo}</span>
                        </>
                    ) : (
                        <button
                            onClick={onAssign}
                            className="flex items-center gap-1 text-[12px] font-normal text-[#088395] hover:text-[#066472] transition-colors bg-[#088395]/5 hover:bg-[#088395]/10 px-2 py-1 rounded-lg"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                            </svg>
                            Assign
                        </button>
                    )}
                </div>
                <div className="text-[11px] font-normal text-gray-400">{issue.createdAt}</div>
            </div>
        </div>
    )
}

function AssignModal({ issue, onAssign, onClose }: { issue: Issue; onAssign: (id: string, name: string) => void; onClose: () => void }) {
    return (
        <div className="fixed inset-0 bg-[#201F47]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-gray-100">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div>
                        <h3 className="font-normal text-[#201F47] text-[17px]">Assign Staff</h3>
                        <p className="text-sm font-normal text-gray-400 mt-1 truncate max-w-[220px]">{issue.title}</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-100 text-gray-400 hover:text-gray-900 shadow-sm transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-4">
                    {staffList.map(s => (
                        <button
                            key={s}
                            onClick={() => onAssign(issue.id, s)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-normal transition-all hover:bg-gray-50 text-left ${issue.assignedTo === s ? 'bg-[#088395]/10 text-[#088395] border border-[#088395]/20' : 'text-[#201F47] border border-transparent'}`}
                        >
                            <div className="w-8 h-8 rounded-full bg-[#FAFAFA] border border-gray-100 flex items-center justify-center text-gray-500 text-xs font-normal flex-shrink-0">
                                {s.charAt(0)}
                            </div>
                            {s}
                            {issue.assignedTo === s && (
                                <span className="ml-auto text-[#088395]">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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
    const [dragOverCol, setDragOverCol] = useState<string | null>(null)

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
        if (from === to) return
        const issue = issues[from].find(i => i.id === issueId)
        if (!issue) return
        setIssues(prev => ({
            ...prev,
            [from]: prev[from].filter(i => i.id !== issueId),
            [to]: [issue, ...prev[to]],
        }))
    }

    const onDragOver = (e: React.DragEvent, colKey: string) => {
        e.preventDefault()
        setDragOverCol(colKey)
    }

    const onDrop = (e: React.DragEvent, colKey: string) => {
        e.preventDefault()
        setDragOverCol(null)
        const issueId = e.dataTransfer.getData('issueId')
        const sourceCol = e.dataTransfer.getData('sourceCol')
        if (issueId && sourceCol) {
            handleMove(issueId, sourceCol, colKey)
        }
    }

    return (
        <div className="min-h-screen bg-[#F9F9FB] flex font-sans">
            <OrgSidebar orgId={orgId} orgName={org.name} />

            <div className="flex-1 flex flex-col min-w-0">
                {/* Top bar */}
                <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40">
                    <div className="px-6 md:px-8 flex items-center justify-between h-[68px]">
                        <div className="flex items-center gap-2 md:gap-3 text-[14px] font-normal truncate">
                            <Link href="/admin/organizations" className="text-gray-400 hover:text-[#201F47] transition-colors hidden sm:block">Organizations</Link>
                            <span className="text-gray-300 hidden sm:block">/</span>
                            <span className="text-gray-400">{org.name}</span>
                            <span className="text-gray-300">/</span>
                            <span className="text-[#201F47]">Dashboard</span>
                        </div>
                        <div className="flex items-center gap-4 flex-shrink-0">
                            <button className="relative text-gray-400 hover:text-[#201F47] transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#F25A5A] rounded-full border-2 border-white" />
                            </button>
                            <Link href="/admin/profile" className="w-8 h-8 rounded-xl bg-[#088395]/10 text-[#088395] flex items-center justify-center font-normal text-[13px] hover:ring-2 hover:ring-[#088395]/20 transition-all">SA</Link>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-6 md:p-8 overflow-auto flex flex-col">
                    {/* Header Details */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
                        <div>
                            <h1 className="text-[28px] font-normal text-[#201F47] leading-tight mb-2 tracking-tight">{org.name} Workspace</h1>
                            <p className="text-[15px] font-normal text-gray-500">Track and manage organizational workflow dynamically.</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <Link href={`/admin/organizations/${orgId}/members`} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-100 text-[13px] font-normal text-gray-600 hover:text-[#088395] hover:border-[#088395]/20 hover:bg-[#088395]/5 transition-all shadow-sm">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                                Invite Member
                            </Link>
                            <Link href={`/admin/organizations/${orgId}/categories`} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-100 text-[13px] font-normal text-gray-600 hover:text-[#576CDB] hover:border-[#576CDB]/20 hover:bg-[#576CDB]/5 transition-all shadow-sm">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                                Add Category
                            </Link>
                            <Link href={`/admin/organizations/${orgId}/settings`} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-100 text-[13px] font-normal text-gray-600 hover:text-[#F25A5A] hover:border-[#F25A5A]/20 hover:bg-[#F25A5A]/5 transition-all shadow-sm">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                Export Report
                            </Link>
                        </div>
                    </div>

                    {/* Highly Professional Minimal Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 shrink-0">
                        {[
                            { label: 'Total Issues', value: totalIssues, accent: 'bg-[#201F47]/5 text-[#201F47]' },
                            { label: 'Open', value: openCount, accent: 'bg-[#F25A5A]/5 text-[#F25A5A]' },
                            { label: 'In Progress', value: inProgressCount, accent: 'bg-[#576CDB]/5 text-[#576CDB]' },
                            { label: 'Resolved', value: resolvedCount, accent: 'bg-[#088395]/5 text-[#088395]' },
                        ].map(stat => (
                            <div key={stat.label} className="bg-white rounded-[20px] border border-gray-100 p-5 shadow-sm shadow-gray-200/50 hover:shadow-md transition-shadow group flex items-start justify-between">
                                <div>
                                    <p className="text-[13px] font-normal text-gray-400 mb-1 tracking-wide">{stat.label}</p>
                                    <p className="text-[32px] font-normal text-[#201F47] leading-none tracking-tight">{stat.value}</p>
                                </div>
                                <div className={`w-10 h-10 rounded-xl ${stat.accent} flex items-center justify-center opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all`}>
                                   {stat.label === 'Total Issues' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
                                   {stat.label === 'Open' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                                   {stat.label === 'In Progress' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>}
                                   {stat.label === 'Resolved' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Main Workspace Layout */}
                    <div className="flex flex-col gap-6 md:gap-6 flex-1 min-h-0">
                        
                        {/* Interactive Kanban Board - Dark Theme Extension */}
                        <div className="rounded-[24px] bg-gradient-to-br from-[#1b1a3e] via-[#201F47] to-[#14122d] shadow-2xl p-4 md:p-5 border border-[#ffffff10] relative flex flex-col min-h-[460px]">
                            {/* Decorative background glow */}
                            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#576CDB]/20 blur-[120px] rounded-full pointer-events-none" />
                            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#088395]/20 blur-[120px] rounded-full pointer-events-none" />

                            <div className="flex items-center justify-between mb-4 z-10 relative shrink-0">
                                <h2 className="text-[17px] font-normal text-white">Interactive Board</h2>
                                <span className="text-[12px] text-gray-400 font-normal px-2.5 py-1 bg-white/5 rounded-full border border-white/10">{totalIssues} active</span>
                            </div>

                            {/* Responsive Horizontal layout for Kanban columns */}
                            <div className="flex-1 overflow-x-auto overflow-y-hidden z-10 custom-scrollbar pb-2">
                                <div className="flex gap-3 min-w-max h-full">
                                    {columnConfig.map(col => (
                                        <div 
                                            key={col.key} 
                                            onDragOver={(e) => onDragOver(e, col.key)}
                                            onDragLeave={() => setDragOverCol(null)}
                                            onDrop={(e) => onDrop(e, col.key)}
                                            className={`flex flex-col w-[300px] xl:w-[320px] bg-white/5 rounded-[16px] border ${dragOverCol === col.key ? 'border-[#576CDB]' : 'border-white/5'} p-2.5 transition-colors duration-300 h-full max-h-full`}
                                        >
                                            {/* Minimal Dark Column Header */}
                                            <div className="flex items-center gap-2 mb-3 px-1 mt-1 shrink-0">
                                                <span className={`w-2 h-2 rounded-full ${col.barBg} shadow-[0_0_8px_rgba(255,255,255,0.2)]`} />
                                                <span className={`text-[14px] font-normal ${col.color}`}>{col.label}</span>
                                                <span className="ml-auto flex items-center justify-center w-6 h-6 rounded-[8px] bg-white/10 text-[12px] font-normal text-white border border-white/5 shadow-inner">
                                                    {issues[col.key]?.length ?? 0}
                                                </span>
                                            </div>
                                            
                                            {/* Cards Space - Vertically scrollable internal area */}
                                            <div className="space-y-2.5 flex-1 overflow-y-auto pr-1.5 custom-scrollbar-inner pb-2">
                                                {(issues[col.key] ?? []).map((issue, i) => (
                                                    <div 
                                                        key={issue.id} 
                                                        className="animate-in fade-in slide-in-from-bottom-2"
                                                        style={{ animationDelay: `${i * 50}ms` }}
                                                    >
                                                        <IssueCard
                                                            issue={issue}
                                                            onAssign={() => setAssignTarget(issue)}
                                                            onMove={(to) => handleMove(issue.id, col.key, to)}
                                                            columns={columnConfig}
                                                            currentCol={col.key}
                                                        />
                                                    </div>
                                                ))}
                                                {(issues[col.key] ?? []).length === 0 && (
                                                    <div className="flex-1 min-h-[100px] rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center text-gray-400 gap-2">
                                                        <svg className="w-5 h-5 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        <p className="text-[12px] font-normal text-gray-500">Drop cards here</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Bottom panel: Activity Timeline */}
                        <div className="w-full shrink-0">
                            {/* Notifications Widget */}
                            <div className="bg-white rounded-[20px] border border-gray-100 p-5 md:p-6 shadow-sm shadow-gray-200/50">
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="text-[15px] font-normal text-[#201F47]">Timeline</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {recentActivity.map((a, i) => (
                                        <div key={i} className="flex items-start gap-3.5">
                                            <div className="w-8 h-8 rounded-[10px] bg-[#F9F9FB] border border-gray-100 flex items-center justify-center text-[12px] font-normal text-gray-600 shrink-0">
                                                {a.actor.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0 pt-0.5">
                                                <p className="text-[13px] font-normal text-gray-500 leading-relaxed">
                                                    <span className="text-[#201F47] block sm:inline">{a.actor}</span>{' '}
                                                    {a.action}{' '}
                                                    <span className="text-[#576CDB]">"{a.issue}"</span>
                                                </p>
                                                <p className="text-[11px] font-normal text-gray-400 mt-1 flex items-center gap-1.5">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    {a.time}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
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

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    height: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
                
                .custom-scrollbar-inner::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar-inner::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar-inner::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 4px;
                }
                .custom-scrollbar-inner::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            `}</style>
        </div>
    )
}
