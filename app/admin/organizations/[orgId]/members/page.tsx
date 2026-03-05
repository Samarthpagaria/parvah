'use client'

import { useState, useEffect } from 'react'
import OrgSidebar from '@/components/admin/OrgSidebar'
import Link from 'next/link'

const mockOrgs: Record<string, string> = {
    'org-1': 'City Municipality',
    'org-2': 'Water Department',
    'org-3': 'Waste Management',
}

type Role = 'owner' | 'edit' | 'read' | 'staff'

interface Member {
    id: string
    name: string
    email: string
    role: Role
    joinedAt: string
    status: 'active' | 'invited'
    avatar: string
}

const initialMembers: Member[] = [
    { id: '1', name: 'Super Admin', email: 'admin@parvah.gov', role: 'owner', joinedAt: 'Jan 2024', status: 'active', avatar: 'SA' },
    { id: '2', name: 'Sarah Wilson', email: 'sarah@city.gov', role: 'edit', joinedAt: 'Feb 2024', status: 'active', avatar: 'SW' },
    { id: '3', name: 'Tom Davis', email: 'tom@city.gov', role: 'staff', joinedAt: 'Mar 2024', status: 'active', avatar: 'TD' },
    { id: '4', name: 'Priya Mehta', email: 'priya@city.gov', role: 'staff', joinedAt: 'Mar 2024', status: 'active', avatar: 'PM' },
    { id: '5', name: 'Raj Kumar', email: 'raj@city.gov', role: 'read', joinedAt: 'Mar 2024', status: 'invited', avatar: 'RK' },
]

const roleConfig: Record<Role, { label: string; bg: string; text: string; desc: string }> = {
    owner: { label: 'Owner', bg: 'bg-[#F9F9FB]', text: 'text-[#201F47]', desc: 'Full administration access' },
    edit: { label: 'Editor', bg: 'bg-[#088395]/10', text: 'text-[#088395]', desc: 'Can manage issues and comments' },
    read: { label: 'Read Only', bg: 'bg-[#576CDB]/10', text: 'text-[#576CDB]', desc: 'View access only' },
    staff: { label: 'Staff', bg: 'bg-[#F25A5A]/10', text: 'text-[#F25A5A]', desc: 'Handles assigned civic issues' },
}

const roleGradient: Record<Role, string> = {
    owner: 'bg-[#F9F9FB] text-[#201F47] border-gray-100',
    edit: 'bg-[#088395]/10 text-[#088395] border-[#088395]/20',
    staff: 'bg-[#F25A5A]/10 text-[#F25A5A] border-[#F25A5A]/20',
    read: 'bg-[#576CDB]/10 text-[#576CDB] border-[#576CDB]/20',
}

export default function MembersPage({ params }: { params: { orgId: string } }) {
    const { orgId } = params
    const orgName = mockOrgs[orgId] ?? 'Organization'
    const [members, setMembers] = useState<Member[]>(initialMembers)
    const [showInvite, setShowInvite] = useState(false)
    const [inviteEmail, setInviteEmail] = useState('')
    const [inviteRole, setInviteRole] = useState<Role>('read')
    const [inviteSent, setInviteSent] = useState(false)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    const handleInvite = (e: React.FormEvent) => {
        e.preventDefault()
        const newMember: Member = {
            id: Date.now().toString(),
            name: inviteEmail.split('@')[0],
            email: inviteEmail,
            role: inviteRole,
            joinedAt: 'Now',
            status: 'invited',
            avatar: inviteEmail.charAt(0).toUpperCase() + (inviteEmail.charAt(1) ?? '').toUpperCase(),
        }
        setMembers(prev => [...prev, newMember])
        setInviteSent(true)
        setTimeout(() => {
            setShowInvite(false)
            setInviteEmail('')
            setInviteRole('read')
            setInviteSent(false)
        }, 1500)
    }

    return (
        <div className="min-h-screen bg-[#F9F9FB] flex font-sans">
            <style>{`
                @keyframes fadeInUp {
                  from { opacity: 0; transform: translateY(15px); }
                  to { opacity: 1; transform: translateY(0); }
                }

                @keyframes fadeIn {
                  from { opacity: 0; }
                  to { opacity: 1; }
                }

                .animate-up {
                  opacity: 0;
                  animation: fadeInUp 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
                }

                .animate-fade {
                  opacity: 0;
                  animation: fadeIn 0.4s ease forwards;
                }
            `}</style>

            <OrgSidebar orgId={orgId} orgName={orgName} />

            <div className="flex-1 flex flex-col min-w-0">
                {/* Top bar */}
                <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40">
                    <div className="px-6 md:px-8 flex items-center justify-between h-[68px]">
                        <div className="flex items-center gap-2 md:gap-3 text-[14px] font-normal truncate">
                            <Link href="/admin/organizations" className="text-gray-400 hover:text-[#201F47] transition-colors hidden sm:block">Organizations</Link>
                            <span className="text-gray-300 hidden sm:block">/</span>
                            <span className="text-gray-400">{orgName}</span>
                            <span className="text-gray-300">/</span>
                            <span className="text-[#201F47]">Members</span>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                            <button className="relative text-gray-400 hover:text-[#201F47] transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#F25A5A] rounded-full border-2 border-white" />
                            </button>
                            <Link href="/admin/profile" className="w-8 h-8 rounded-xl bg-teal/10 text-[#088395] flex items-center justify-center font-normal text-[13px] hover:ring-2 hover:ring-[#088395]/20 transition-all">SA</Link>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
                    {/* Header */}
                    <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 ${isMounted ? 'animate-up' : ''}`} style={{ animationDelay: '0.1s' }}>
                        <div>
                            <h1 className="text-[28px] font-normal text-[#201F47] leading-tight mb-2 tracking-tight">Organization Members</h1>
                            <p className="text-[15px] font-normal text-gray-500">Manage access and roles for {members.length} active personnel in {orgName}.</p>
                        </div>
                        <button
                            onClick={() => setShowInvite(true)}
                            className="bg-[#201F47] hover:bg-[#2c2b5c] text-white px-6 py-2.5 rounded-2xl font-normal text-sm transition-all flex items-center gap-2 shadow-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                            </svg>
                            Invite Member
                        </button>
                    </div>

                    {/* Members List/Table perfectly matched to the minimal aesthetic */}
                    <div 
                        className={`bg-white rounded-[24px] border border-gray-100 overflow-hidden shadow-sm ${isMounted ? 'animate-up' : ''}`} 
                        style={{ animationDelay: '0.15s' }}
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[700px]">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100">
                                        <th className="px-6 py-4 text-[13px] font-normal text-gray-500 whitespace-nowrap w-[40%]">Member</th>
                                        <th className="px-6 py-4 text-[13px] font-normal text-gray-500 whitespace-nowrap">Role</th>
                                        <th className="px-6 py-4 text-[13px] font-normal text-gray-500 whitespace-nowrap">Status</th>
                                        <th className="px-6 py-4 text-[13px] font-normal text-gray-500 whitespace-nowrap">Joined</th>
                                        <th className="px-6 py-4 text-[13px] font-normal text-gray-500 whitespace-nowrap text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {members.map((m, idx) => {
                                        const rc = roleConfig[m.role]
                                        return (
                                            <tr 
                                                key={m.id} 
                                                className={`group border-b border-gray-50 last:border-none hover:bg-gray-50/50 transition-colors ${isMounted ? 'animate-up' : ''}`}
                                                style={{ animationDelay: `${0.2 + idx * 0.05}s` }}
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3.5">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border font-normal text-[15px] shrink-0 ${roleGradient[m.role]}`}>
                                                            {m.avatar}
                                                        </div>
                                                        <div>
                                                            <h3 className="text-[15px] leading-tight font-normal text-[#201F47] mb-0.5 group-hover:text-[#088395] transition-colors">
                                                                {m.name}
                                                            </h3>
                                                            <p className="text-[13px] leading-tight font-normal text-[#94a3b8]">
                                                                {m.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-[11px] font-normal px-2.5 py-1 rounded-full whitespace-nowrap ${rc.bg} ${rc.text}`}>
                                                        {rc.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {m.status === 'invited' ? (
                                                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 w-fit whitespace-nowrap">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                            <span className="text-[11px] font-normal text-amber-600">Pending</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 w-fit whitespace-nowrap">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                            <span className="text-[11px] font-normal text-emerald-600">Active</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-[13px] font-normal text-gray-500 whitespace-nowrap">{m.joinedAt}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                                                        {m.role !== 'owner' && (
                                                            <button className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-[#F25A5A]/10 hover:text-[#F25A5A] transition-colors focus:outline-none focus:ring-2 focus:ring-[#F25A5A]/20">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        )}
                                                        <button className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-[#201F47] transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>

            {/* Invite Modal */}
            {showInvite && (
                <div className="fixed inset-0 bg-[#201F47]/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade">
                    <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-gray-100">
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <h3 className="font-normal text-[#201F47] text-[17px]">Invite New Member</h3>
                            <button onClick={() => setShowInvite(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-100 text-gray-400 hover:text-[#F25A5A] shadow-sm transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {inviteSent ? (
                            <div className="p-8 text-center">
                                <div className="w-14 h-14 bg-[#088395]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-7 h-7 text-[#088395]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p className="text-[17px] font-normal text-[#201F47]">Invite Sent!</p>
                                <p className="text-[13px] text-[#94a3b8] mt-1.5 leading-relaxed font-normal">The invitation link has been emailed to <br className="hidden sm:block" /> <strong className="text-[#201F47] font-normal">{inviteEmail}</strong></p>
                            </div>
                        ) : (
                            <form onSubmit={handleInvite} className="p-6 space-y-5">
                                <div>
                                    <label className="block text-[13px] font-normal text-[#201F47] mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        value={inviteEmail}
                                        onChange={e => setInviteEmail(e.target.value)}
                                        placeholder="colleague@organization.gov"
                                        className="w-full pl-4 pr-4 py-3 bg-white border border-gray-200 rounded-xl outline-none text-sm font-normal text-[#201F47] placeholder:text-gray-400 focus:border-[#088395] focus:ring-4 focus:ring-[#088395]/10 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[13px] font-normal text-[#201F47] mb-2">Assign Role</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                        {(['read', 'edit', 'staff'] as Role[]).map(r => {
                                            const rc = roleConfig[r]
                                            const isSelected = inviteRole === r;
                                            return (
                                                <button
                                                    key={r}
                                                    type="button"
                                                    onClick={() => setInviteRole(r)}
                                                    className={`py-3 px-3 rounded-xl text-left border transition-all ${isSelected ? `${rc.bg} ${rc.text} border-current` : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'}`}
                                                >
                                                    <p className="text-[14px] font-normal mb-0.5">{rc.label}</p>
                                                    <p className="text-[11px] font-normal leading-tight opacity-70">{rc.desc}</p>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setShowInvite(false)} className="flex-1 py-3 text-[14px] font-normal text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
                                    <button type="submit" className="flex-1 py-3 text-[14px] font-normal text-white bg-[#088395] hover:bg-[#066f7d] rounded-xl transition-all shadow-sm shadow-[#088395]/20">Send Invitation</button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
