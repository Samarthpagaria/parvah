'use client'

import { useState, useEffect, use } from 'react'
import OrgSidebar from '@/components/admin/OrgSidebar'
import Link from 'next/link'
import { orgAPI, issueAPI, authAPI } from '@/utils/backend_api_endpoints'

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

const priorityConfig: Record<string, { label: string; color: string; bg: string }> = {
    low: { label: 'Low', color: 'text-[#576CDB]', bg: 'bg-[#576CDB]/15' },
    medium: { label: 'Medium', color: 'text-[#088395]', bg: 'bg-[#088395]/15' },
    high: { label: 'High', color: 'text-[#F25A5A]', bg: 'bg-[#F25A5A]/15' },
    critical: { label: 'Critical', color: 'text-red-600', bg: 'bg-red-100' },
}

const columnConfig = [
    { key: 'open', label: 'To Do', color: 'text-gray-200', barBg: 'bg-gray-400' },
    { key: 'in_progress', label: 'In Progress', color: 'text-[#8AA1FF]', barBg: 'bg-[#576CDB]' },
    { key: 'resolved', label: 'Done', color: 'text-[#9AD9D9]', barBg: 'bg-[#7AB2B2]' },
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

function AssignModal({ issue, staff, onAssign, onClose }: { issue: Issue; staff: any[]; onAssign: (id: string, staff: any) => void; onClose: () => void }) {
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
                <div className="p-4 max-h-[300px] overflow-y-auto custom-scrollbar-inner">
                    {staff.map((s, idx) => (
                        <button
                            key={s.id || `staff-${idx}`}
                            onClick={() => { if (s.id) onAssign(issue.id, s); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-normal transition-all hover:bg-gray-50 text-left ${issue.assignedTo === s.full_name ? 'bg-[#088395]/10 text-[#088395] border border-[#088395]/20' : 'text-[#201F47] border border-transparent'}`}
                        >
                            <div className="w-8 h-8 rounded-full bg-[#FAFAFA] border border-gray-100 flex items-center justify-center text-gray-500 text-xs font-normal flex-shrink-0">
                                {s.full_name?.charAt(0)}
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-[#201F47]">{s.full_name}</p>
                                <p className="text-[11px] text-gray-400 uppercase">{s.role}</p>
                            </div>
                            {issue.assignedTo === s.full_name && (
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

export default function KanbanPage({ params }: { params: Promise<{ orgId: string }> }) {
    const { orgId } = use(params)
    const [org, setOrg] = useState<any>(null)
    const [issues, setIssues] = useState<Record<string, Issue[]>>({ open: [], in_progress: [], resolved: [] })
    const [staff, setStaff] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [assignTarget, setAssignTarget] = useState<Issue | null>(null)
    const [dragOverCol, setDragOverCol] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [orgRes, issuesRes, membersRes] = await Promise.all([
                    orgAPI.getDetails(orgId),
                    issueAPI.list({ org_id: orgId }),
                    orgAPI.listMembers(orgId)
                ])
                setOrg(orgRes.organization)
                const rawIssues = (issuesRes.issues || []).map((i: any) => ({
                    id: i.id,
                    title: i.title,
                    status: i.status || 'open',
                    category: i.issue_categories?.name || 'Uncategorized',
                    priority: i.priority || 'medium',
                    reporter: i.public_users?.full_name || 'Anonymous',
                    assignedTo: i.admin_users?.full_name,
                    description: i.description,
                    createdAt: new Date(i.created_at).toLocaleDateString(undefined, { month: 'short', day: '2-digit' }),
                    location: i.address
                }))
                setIssues({
                    open: rawIssues.filter((i: any) => i.status === 'open'),
                    in_progress: rawIssues.filter((i: any) => i.status === 'in_progress'),
                    resolved: rawIssues.filter((i: any) => i.status === 'resolved'),
                })
                setStaff((membersRes.members || []).map((m: any) => ({
                    id: m.admin_user?.id || m.admin_user_id,
                    full_name: m.admin_user?.full_name || 'Unknown',
                    role: m.role
                })))
            } catch (err) {
                console.error('Fetch failed:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [orgId])

    const totalIssues = Object.values(issues).flat().length

    const handleAssign = async (issueId: string, staffMember: any) => {
        try {
            await issueAPI.assignStaff(issueId, staffMember.id)
            const updated = { ...issues }
            Object.keys(updated).forEach(col => {
                updated[col] = updated[col].map(i => i.id === issueId ? { ...i, assignedTo: staffMember.full_name } : i)
            })
            setIssues(updated)
            setAssignTarget(null)
        } catch (err) {
            console.error('Assign failed:', err)
        }
    }

    const handleMove = async (issueId: string, from: string, to: string) => {
        if (from === to) return
        try {
            await issueAPI.updateStatus(issueId, to as any)
            const issue = issues[from].find(i => i.id === issueId)
            if (!issue) return
            setIssues(prev => ({
                ...prev,
                [from]: prev[from].filter(i => i.id !== issueId),
                [to]: [issue, ...prev[to]],
            }))
        } catch (err) {
            console.error('Move failed:', err)
        }
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

    if (loading) return null

    return (
        <div className="min-h-screen bg-[#F9F9FB] flex font-sans">
            <OrgSidebar orgId={orgId} orgName={org?.name || 'Organization'} />

            <div className="flex-1 flex flex-col min-w-0">
                <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40">
                    <div className="px-6 md:px-8 flex items-center justify-between h-[68px]">
                        <div className="flex items-center gap-2 md:gap-3 text-[14px] font-normal truncate">
                            <Link href="/admin/organizations" className="text-gray-400 hover:text-[#201F47] transition-colors hidden sm:block">Organizations</Link>
                            <span className="text-gray-300 hidden sm:block">/</span>
                            <span className="text-gray-400">{org?.name}</span>
                            <span className="text-gray-300">/</span>
                            <span className="text-[#201F47]">Board</span>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-6 md:p-8 overflow-auto flex flex-col">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
                        <div>
                            <h1 className="text-[28px] font-normal text-[#201F47] leading-tight mb-2 tracking-tight">Interactive Board</h1>
                            <p className="text-[15px] font-normal text-gray-500">Manage and track organizational workflow dynamically.</p>
                        </div>
                    </div>

                    <div className="flex-1 min-h-0">
                        <div className="rounded-[24px] bg-gradient-to-br from-[#1b1a3e] via-[#201F47] to-[#14122d] shadow-2xl p-4 md:p-5 border border-[#ffffff10] relative flex flex-col h-full min-h-[500px]">
                            <div className="flex items-center justify-between mb-4 z-10 relative shrink-0">
                                <h2 className="text-[17px] font-normal text-white">Issues Pipeline</h2>
                                <span className="text-[12px] text-gray-400 font-normal px-2.5 py-1 bg-white/5 rounded-full border border-white/10">{totalIssues} active</span>
                            </div>

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
                                            <div className="flex items-center gap-2 mb-3 px-1 mt-1 shrink-0">
                                                <span className={`w-2 h-2 rounded-full ${col.barBg} shadow-[0_0_8px_rgba(255,255,255,0.2)]`} />
                                                <span className={`text-[14px] font-normal ${col.color}`}>{col.label}</span>
                                                <span className="ml-auto flex items-center justify-center w-6 h-6 rounded-[8px] bg-white/10 text-[12px] font-normal text-white border border-white/5 shadow-inner">
                                                    {issues[col.key]?.length ?? 0}
                                                </span>
                                            </div>

                                            <div className="space-y-2.5 flex-1 overflow-y-auto pr-1.5 custom-scrollbar-inner pb-2">
                                                {(issues[col.key] ?? []).map((issue, i) => (
                                                    <IssueCard
                                                        key={issue.id}
                                                        issue={issue}
                                                        onAssign={() => setAssignTarget(issue)}
                                                        onMove={(to) => handleMove(issue.id, col.key, to)}
                                                        columns={columnConfig}
                                                        currentCol={col.key}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {assignTarget && (
                <AssignModal
                    issue={assignTarget}
                    staff={staff}
                    onAssign={handleAssign}
                    onClose={() => setAssignTarget(null)}
                />
            )}

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { height: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.02); border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 4px; }
                .custom-scrollbar-inner::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar-inner::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 4px; }
            `}</style>
        </div>
    )
}
