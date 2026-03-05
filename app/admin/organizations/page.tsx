'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { orgAPI } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

const mockOrgs = [
    {
        id: 'org-1',
        name: 'City Municipality',
        slug: 'city-municipality',
        description: 'Manages civic infrastructure, roads, and public spaces across the city.',
        industry: 'Government',
        members: 12,
        openIssues: 34,
        resolvedIssues: 128,
        createdAt: 'Jan 2024',
        color: 'from-teal-500 to-cyan-400',
    },
    {
        id: 'org-2',
        name: 'Water Department',
        slug: 'water-department',
        description: 'Handles water supply, pipelines, and sanitation infrastructure.',
        industry: 'Utilities',
        members: 8,
        openIssues: 18,
        resolvedIssues: 95,
        createdAt: 'Feb 2024',
        color: 'from-blue-500 to-cyan-500',
    },
    {
        id: 'org-3',
        name: 'Waste Management',
        slug: 'waste-management',
        description: 'Responsible for waste collection, recycling, and disposal services.',
        industry: 'Environment',
        members: 6,
        openIssues: 9,
        resolvedIssues: 67,
        createdAt: 'Mar 2024',
        color: 'from-emerald-500 to-teal-500',
    },
]

export default function OrganizationsPage() {
    const [search, setSearch] = useState('')
    const [organizations, setOrganizations] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const { user, clearAuth } = useAuthStore()

    useEffect(() => {
        const fetchOrgs = async () => {
            try {
                const data: any = await orgAPI.listMy()
                setOrganizations(data.organizations || [])
            } catch (err) {
                console.error('Failed to fetch organizations:', err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchOrgs()
    }, [])

    const filtered = organizations.filter(o =>
        o.name.toLowerCase().includes(search.toLowerCase()) ||
        (o.industry && o.industry.toLowerCase().includes(search.toLowerCase()))
    )

    const handleLogout = () => {
        clearAuth()
        window.location.href = '/admin/login'
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top bar */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center shadow-sm">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <span className="text-lg font-bold text-gray-900">Parvah</span>
                        <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Admin</span>
                    </Link>

                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-gray-800">{user?.full_name || 'Admin'}</p>
                            <p className="text-xs text-gray-400">{user?.email}</p>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                            {user?.full_name?.charAt(0) || 'A'}
                        </div>
                        <button
                            onClick={handleLogout}
                            className="text-sm text-gray-500 hover:text-gray-700 font-medium px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main */}
            <main className="max-w-7xl mx-auto px-6 py-10">
                {/* Page header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Organizations</h1>
                        <p className="text-sm text-gray-500 mt-1">Select an organization to manage or create a new one.</p>
                    </div>
                    <Link href="/admin/organizations/new">
                        <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-5 shadow-sm font-medium">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            New Organization
                        </Button>
                    </Link>
                </div>

                {/* Search */}
                <div className="mb-6 relative max-w-sm">
                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search organizations..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all"
                    />
                </div>

                {/* Org Cards */}
                {filtered.length === 0 ? (
                    <div className="text-center py-24 text-gray-400">
                        <svg className="w-12 h-12 mx-auto mb-3 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <p className="text-sm font-medium">No organizations found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filtered.map(org => (
                            <Link key={org.id} href={`/admin/organizations/${org.id}/dashboard`} className="group">
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
                                    {/* Color bar */}
                                    <div className={`h-1.5 bg-gradient-to-r from-teal-500 to-cyan-400`} />
                                    <div className="p-5">
                                        {/* Header row */}
                                        <div className="flex items-start gap-3 mb-4">
                                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center shadow-sm flex-shrink-0`}>
                                                <span className="text-white font-bold text-sm">{org.name.charAt(0)}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-900 group-hover:text-teal-700 transition-colors text-sm leading-tight">{org.name}</h3>
                                                <span className="inline-block mt-1 text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{org.industry}</span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-2">{org.description}</p>

                                        {/* Stats row */}
                                        <div className="flex items-center gap-4 pt-4 border-t border-gray-50">
                                            <div className="text-center">
                                                <p className="text-lg font-bold text-orange-500">{org.openIssues}</p>
                                                <p className="text-[10px] text-gray-400 font-medium">Open</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-lg font-bold text-teal-600">{org.resolvedIssues}</p>
                                                <p className="text-[10px] text-gray-400 font-medium">Resolved</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-lg font-bold text-gray-700">{org.members}</p>
                                                <p className="text-[10px] text-gray-400 font-medium">Members</p>
                                            </div>
                                            <div className="ml-auto">
                                                <span className="flex items-center gap-1 text-xs text-teal-600 font-medium group-hover:gap-2 transition-all">
                                                    Open
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}

                        {/* Create new org card */}
                        <Link href="/admin/organizations/new" className="group">
                            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 hover:border-teal-300 hover:bg-teal-50/30 transition-all duration-200 h-full min-h-[180px] flex flex-col items-center justify-center gap-3 p-5 cursor-pointer">
                                <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-teal-100 flex items-center justify-center transition-colors">
                                    <svg className="w-5 h-5 text-gray-400 group-hover:text-teal-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-medium text-gray-500 group-hover:text-teal-700 transition-colors">Create Organization</p>
                                    <p className="text-xs text-gray-400 mt-0.5">Add a new organization to manage</p>
                                </div>
                            </div>
                        </Link>
                    </div>
                )}
            </main>
        </div>
    )
}
