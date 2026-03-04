'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import AdminHeader from '@/components/admin/AdminHeader'
import {
    ChevronLeft,
    UserPlus,
    Mail,
    ShieldCheck,
    Clock,
    CheckCircle2,
    MoreVertical,
    User
} from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

interface Member {
    id: string
    email: string
    role: 'read' | 'edit' | 'staff'
    status: 'active' | 'pending'
    joinedAt?: string
}

export default function ManageMembersPage() {
    const params = useParams()
    const router = useRouter()
    const orgId = params.orgId as string

    const [members, setMembers] = useState<Member[]>([
        { id: '1', email: 'owner@city.gov', role: 'edit', status: 'active', joinedAt: '2024-01-15' },
        { id: '2', email: 'staff1@city.gov', role: 'staff', status: 'active', joinedAt: '2024-02-10' },
        { id: '3', email: 'viewer@city.gov', role: 'read', status: 'pending' },
    ])

    const [inviteEmail, setInviteEmail] = useState('')
    const [inviteRole, setInviteRole] = useState<'read' | 'edit' | 'staff'>('staff')

    const handleInvite = (e: React.FormEvent) => {
        e.preventDefault()
        if (!inviteEmail) return

        const newInvite: Member = {
            id: Math.random().toString(36).substr(2, 9),
            email: inviteEmail,
            role: inviteRole,
            status: 'pending'
        }

        setMembers([newInvite, ...members])
        setInviteEmail('')
        // Mock success: toast or console
        console.log(`Invite sent to ${inviteEmail} with role ${inviteRole}`)
    }

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'read': return <Badge variant="outline" className="bg-slate-50">Read Only</Badge>
            case 'edit': return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Editor</Badge>
            case 'staff': return <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">Staff</Badge>
            default: return <Badge>{role}</Badge>
        }
    }

    return (
        <div className="min-h-screen bg-slate-50/50">
            <AdminHeader />

            <main className="container mx-auto px-4 py-8">
                <div className="max-w-5xl mx-auto text">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <Link
                                href="/admin/dashboard"
                                className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-2 transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4 mr-1" />
                                Back to Dashboard
                            </Link>
                            <h1 className="text-3xl font-bold text-slate-900">Manage Organization Members</h1>
                            <p className="text-slate-500 mt-1">Invite team members and assign roles for {orgId === 'org-1' ? 'City Municipality' : 'this organization'}.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text">
                        {/* Invite Form */}
                        <div className="lg:col-span-1">
                            <Card className="p-6 border-slate-200 shadow-sm sticky top-24">
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <UserPlus className="w-5 h-5 text-primary" />
                                    </div>
                                    <h2 className="text-xl font-semibold">Invite Member</h2>
                                </div>

                                <form onSubmit={handleInvite} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="colleague@example.com"
                                                value={inviteEmail}
                                                onChange={(e) => setInviteEmail(e.target.value)}
                                                className="pl-10 h-11 rounded-xl border-slate-200"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="role" className="text-sm font-medium">Select Role</Label>
                                        <Select value={inviteRole} onValueChange={(val: any) => setInviteRole(val)}>
                                            <SelectTrigger className="h-11 rounded-xl border-slate-200">
                                                <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="read">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">Read</span>
                                                        <span className="text-xs text-slate-500">Can only view issues and analytics</span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="edit">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">Edit</span>
                                                        <span className="text-xs text-slate-500">Can manage issues but not members</span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="staff">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">Staff</span>
                                                        <span className="text-xs text-slate-500">Can resolve assigned issues</span>
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold mt-2"
                                    >
                                        Send Invitation
                                    </Button>
                                </form>

                                <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100 italic text-xs text-slate-500">
                                    Invited members will receive a link to set up their account and join this organization.
                                </div>
                            </Card>
                        </div>

                        {/* Members List */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4" />
                                    Existing Members ({members.length})
                                </h3>
                            </div>

                            {members.map((member) => (
                                <Card key={member.id} className="p-4 border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900">{member.email}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {getRoleBadge(member.role)}
                                                    <span className="text-[10px] text-slate-400">•</span>
                                                    {member.status === 'active' ? (
                                                        <span className="text-xs text-slate-400 flex items-center gap-1">
                                                            <CheckCircle2 className="w-3 h-3 text-green-500" />
                                                            Joined {member.joinedAt}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-amber-600 flex items-center gap-1 font-medium bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                                                            <Clock className="w-3 h-3" />
                                                            Pending Invite
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900 rounded-full">
                                            <MoreVertical className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
