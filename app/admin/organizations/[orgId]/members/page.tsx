'use client'

import { useState, useEffect, use } from 'react'
import OrgSidebar from '@/components/admin/OrgSidebar'
import Link from 'next/link'
import { orgAPI, inviteAPI } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

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

const roleConfig: Record<Role, { label: string; bg: string; text: string; desc: string }> = {
    owner: { label: 'Owner', bg: 'bg-purple-50', text: 'text-purple-700', desc: 'Full access' },
    edit: { label: 'Edit', bg: 'bg-teal-50', text: 'text-teal-700', desc: 'Can manage issues & comments' },
    read: { label: 'Read', bg: 'bg-blue-50', text: 'text-blue-700', desc: 'View only' },
    staff: { label: 'Staff', bg: 'bg-orange-50', text: 'text-orange-700', desc: 'Handles assigned issues' },
}

export default function MembersPage({ params }: { params: Promise<{ orgId: string }> }) {
    const { orgId } = use(params)
    const [orgName, setOrgName] = useState('Loading...')
    const [members, setMembers] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')

    const [showInvite, setShowInvite] = useState(false)
    const [inviteEmail, setInviteEmail] = useState('')
    const [inviteRole, setInviteRole] = useState<string>('read')
    const [inviteSent, setInviteSent] = useState(false)
    const [isInviting, setIsInviting] = useState(false)

    const { user } = useAuthStore()

    useEffect(() => {
        const fetchOrgAndMembers = async () => {
            try {
                const orgData: any = await orgAPI.getDetails(orgId)
                setOrgName(orgData.organization.name)

                const membersData: any = await orgAPI.listMembers(orgId)
                setMembers(membersData.members || [])
            } catch (err) {
                console.error('Failed to fetch data:', err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchOrgAndMembers()
    }, [orgId])

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsInviting(true)
        setError('')

        try {
            await inviteAPI.send(orgId, inviteEmail, inviteRole)
            setInviteSent(true)

            // Refresh members list (optional, might not show invited yet depending on backend)
            // But let's assume it adds to the list

            setTimeout(() => {
                setShowInvite(false)
                setInviteEmail('')
                setInviteRole('read')
                setInviteSent(false)
            }, 1500)
        } catch (err: any) {
            setError(err.message || 'Failed to send invitation')
        } finally {
            setIsInviting(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <OrgSidebar orgId={orgId} orgName={orgName} />

            <div className="flex-1 flex flex-col min-w-0">
                {/* Top bar */}
                <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
                    <div className="px-6 py-3.5 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                            <Link href="/admin/organizations" className="text-gray-400 hover:text-gray-600 font-medium transition-colors">Organizations</Link>
                            <span className="text-gray-200">/</span>
                            <Link href={`/admin/organizations/${orgId}/dashboard`} className="text-gray-400 hover:text-gray-600 font-medium transition-colors">{orgName}</Link>
                            <span className="text-gray-200">/</span>
                            <span className="text-teal-600 font-medium">Members</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center text-white font-bold text-xs">SA</div>
                    </div>
                </header>

                <main className="flex-1 p-6 max-w-4xl">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Members</h1>
                            <p className="text-sm text-gray-500 mt-0.5">{members.length} members in {orgName}</p>
                        </div>
                        <button
                            onClick={() => setShowInvite(true)}
                            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-sm transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Invite Member
                        </button>
                    </div>

                    {/* Role legend */}
                    <div className="flex flex-wrap gap-2 mb-5">
                        {(Object.keys(roleConfig) as Role[]).map(r => {
                            const cfg = roleConfig[r]
                            return (
                                <div key={r} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                                    {cfg.label}
                                    <span className="font-normal opacity-60">— {cfg.desc}</span>
                                </div>
                            )
                        })}
                    </div>

                    {/* Members list */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="divide-y divide-gray-50">
                            {members.map(m => {
                                const role = (m.role as Role) || 'read'
                                const rc = roleConfig[role]
                                const name = m.admin_user?.full_name || 'Pending'
                                const email = m.admin_user?.email || m.email || 'No email'
                                const avatar = name.charAt(0) || '?'

                                return (
                                    <div key={m.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                            {avatar}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-semibold text-gray-800 truncate">{name}</p>
                                                {!m.is_active && (
                                                    <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full flex-shrink-0">Pending</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-400 truncate">{email}</p>
                                        </div>
                                        <span className={`text-xs font-medium px-3 py-1 rounded-full flex-shrink-0 ${rc.bg} ${rc.text}`}>{rc.label}</span>
                                        <span className="text-xs text-gray-400 flex-shrink-0 hidden sm:block">
                                            {m.joined_at ? new Date(m.joined_at).toLocaleDateString() : 'Pending'}
                                        </span>
                                        {role !== 'owner' && (
                                            <button className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </main>
            </div>

            {/* Invite Modal */}
            {showInvite && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900">Invite Member</h3>
                            <button onClick={() => setShowInvite(false)} className="text-gray-300 hover:text-gray-500 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {inviteSent ? (
                            <div className="p-8 text-center">
                                <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p className="text-sm font-semibold text-gray-800">Invite sent!</p>
                                <p className="text-xs text-gray-400 mt-1">The invitation link has been emailed to {inviteEmail}</p>
                            </div>
                        ) : (
                            <form onSubmit={handleInvite} className="p-5 space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        value={inviteEmail}
                                        onChange={e => setInviteEmail(e.target.value)}
                                        placeholder="member@example.com"
                                        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Role</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(['read', 'edit', 'staff'] as Role[]).map(r => {
                                            const rc = roleConfig[r]
                                            return (
                                                <button
                                                    key={r}
                                                    type="button"
                                                    onClick={() => setInviteRole(r)}
                                                    className={`py-2.5 px-3 rounded-xl text-xs font-medium border-2 transition-all ${inviteRole === r ? `${rc.bg} ${rc.text} border-current` : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}
                                                >
                                                    {rc.label}
                                                    <p className="text-[10px] font-normal opacity-60 mt-0.5">{rc.desc}</p>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                                <div className="flex gap-2 pt-1">
                                    <button type="button" onClick={() => setShowInvite(false)} className="flex-1 py-2.5 text-sm font-medium text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
                                    <button
                                        type="submit"
                                        disabled={isInviting}
                                        className="flex-1 py-2.5 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-sm disabled:opacity-50"
                                    >
                                        {isInviting ? 'Sending...' : 'Send Invite'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
