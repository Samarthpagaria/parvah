'use client'

import { useState, useEffect, use } from 'react'
import OrgSidebar from '@/components/admin/OrgSidebar'
import Link from 'next/link'
import { orgAPI, authAPI } from '@/utils/backend_api_endpoints'

const mockOrgs: Record<string, string> = {
    'org-1': 'City Municipality',
    'org-2': 'Water Department',
    'org-3': 'Waste Management',
}

interface Category { id: string; name: string; color: string; issueCount: number; description: string }

const initialCategories: Category[] = [
    { id: '1', name: 'Road Maintenance', color: '#F25A5A', issueCount: 24, description: 'Potholes, road damage, signage issues' },
    { id: '2', name: 'Street Lighting', color: '#576CDB', issueCount: 11, description: 'Broken or missing street lights' },
    { id: '3', name: 'Water Supply', color: '#088395', issueCount: 8, description: 'Leaks, disruptions, water quality' },
    { id: '4', name: 'Cleanliness', color: '#7AB2B2', issueCount: 19, description: 'Illegal dumping, garbage collection' },
    { id: '5', name: 'Parks & Recreation', color: '#8b5cf6', issueCount: 5, description: 'Park maintenance and amenities' },
    { id: '6', name: 'Safety', color: '#201F47', issueCount: 7, description: 'Public safety hazards and concerns' },
]

const colorOptions = ['#F25A5A', '#576CDB', '#088395', '#7AB2B2', '#201F47', '#8b5cf6', '#f59e0b', '#ec4899']

export default function CategoriesPage({ params }: { params: Promise<{ orgId: string }> }) {
    const { orgId } = use(params)
    const [org, setOrg] = useState<any>(null)
    const [categories, setCategories] = useState<Category[]>([])
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [showAdd, setShowAdd] = useState(false)
    const [newName, setNewName] = useState('')
    const [newDesc, setNewDesc] = useState('')
    const [newColor, setNewColor] = useState('#088395')
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
        const fetchData = async () => {
            try {
                const [orgRes, userRes] = await Promise.all([
                    orgAPI.getDetails(orgId),
                    authAPI.getMe()
                ])
                setOrg(orgRes.organization)
                setUser(userRes.user)
            } catch (err: any) {
                console.error('[Categories] org fetch failed:', err?.message)
            }

            try {
                const catRes = await orgAPI.listCategories(orgId)
                setCategories((catRes.categories || []).map((c: any) => ({
                    id: c.id,
                    name: c.name,
                    color: c.color || '#088395',
                    description: c.description,
                    issueCount: 0
                })))
            } catch (err: any) {
                console.error('[Categories] categories fetch failed:', err?.message)
            }

            setLoading(false)
        }
        fetchData()
    }, [orgId])

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const res = await orgAPI.createCategory(orgId, {
                name: newName,
                color: newColor,
                description: newDesc
            })
            setCategories(prev => [...prev, {
                id: res.category.id,
                name: res.category.name,
                color: res.category.color,
                issueCount: 0,
                description: res.category.description,
            }])
            setNewName('')
            setNewDesc('')
            setNewColor('#088395')
            setShowAdd(false)
        } catch (err) {
            console.error('Failed to create category:', err)
        }
    }

    const handleDelete = async (id: string) => {
        try {
            await orgAPI.deleteCategory(orgId, id)
            setCategories(prev => prev.filter(c => c.id !== id))
        } catch (err) {
            console.error('Failed to delete category:', err)
        }
    }

    const orgName = org?.name || 'Organization'

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
                    <div className="px-5 md:px-6 flex items-center justify-between h-[60px]">
                        <div className="flex items-center gap-2 md:gap-3 text-[13px] font-normal truncate">
                            <Link href="/admin/organizations" className="text-gray-400 hover:text-[#201F47] transition-colors hidden sm:block">Organizations</Link>
                            <span className="text-gray-300 hidden sm:block">/</span>
                            <span className="text-gray-400">{orgName}</span>
                            <span className="text-gray-300">/</span>
                            <span className="text-[#201F47]">Categories</span>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                            <button className="relative text-gray-400 hover:text-[#201F47] transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#F25A5A] rounded-full border-2 border-white" />
                            </button>
                            <Link href="/admin/profile" className="w-8 h-8 rounded-xl bg-[#088395]/10 text-[#088395] flex items-center justify-center font-normal text-[13px] hover:ring-2 hover:ring-[#088395]/20 transition-all">
                                {user?.full_name?.split(' ').map((n: any) => n[0]).join('') || 'SA'}
                            </Link>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-5 md:p-6 max-w-5xl w-full mx-auto">
                    {/* Header */}
                    <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 ${isMounted ? 'animate-up' : ''}`} style={{ animationDelay: '0.1s' }}>
                        <div>
                            <h1 className="text-[24px] font-normal text-[#201F47] leading-tight mb-1.5 tracking-tight">Issue Categories</h1>
                            <p className="text-[14px] font-normal text-gray-500">Manage classifications and metadata schemas for {orgName}.</p>
                        </div>
                        <button
                            onClick={() => setShowAdd(true)}
                            className="bg-[#201F47] hover:bg-[#2c2b5c] text-white px-5 py-2 rounded-[14px] font-normal text-[13px] transition-all flex items-center gap-2 shadow-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                            </svg>
                            Create Category
                        </button>
                    </div>

                    {/* Add Category inline form */}
                    {showAdd && (
                        <div className={`bg-white rounded-[20px] border border-gray-100 shadow-lg shadow-gray-200/20 p-5 md:p-6 mb-6 animate-fade ${isMounted ? 'animate-up' : ''}`} style={{ animationDelay: '0.15s' }}>
                            <div className="flex items-center justify-between mb-5 border-b border-gray-50 pb-3">
                                <h3 className="text-[16px] font-normal text-[#201F47]">New Category Definition</h3>
                                <button onClick={() => setShowAdd(false)} className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-50 hover:text-[#F25A5A] transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleAdd} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[13px] font-normal text-[#201F47] mb-2">Category Name <span className="text-[#F25A5A]">*</span></label>
                                        <input
                                            required
                                            value={newName}
                                            onChange={e => setNewName(e.target.value)}
                                            placeholder="e.g. Traffic Signals"
                                            className="w-full px-4 py-2.5 text-[13px] font-normal border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#088395]/10 focus:border-[#088395] transition-all bg-gray-50/50 focus:bg-white text-[#201F47] placeholder:text-gray-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[13px] font-normal text-[#201F47] mb-2">Description</label>
                                        <input
                                            value={newDesc}
                                            onChange={e => setNewDesc(e.target.value)}
                                            placeholder="Brief explanation of this issue type..."
                                            className="w-full px-4 py-2.5 text-[13px] font-normal border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#088395]/10 focus:border-[#088395] transition-all bg-gray-50/50 focus:bg-white text-[#201F47] placeholder:text-gray-400"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[13px] font-normal text-[#201F47] mb-2.5">Identifier Color</label>
                                    <div className="flex gap-2.5 flex-wrap">
                                        {colorOptions.map(c => (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={() => setNewColor(c)}
                                                className={`w-7 h-7 rounded-full transition-all flex items-center justify-center ${newColor === c ? 'ring-2 ring-offset-2 ring-[#201F47] scale-110' : 'hover:scale-105 border border-white/20 shadow-sm'}`}
                                                style={{ backgroundColor: c }}
                                            >
                                                {newColor === c && (
                                                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 pt-2">
                                    <button type="button" onClick={() => setShowAdd(false)} className="px-5 py-2 text-[13px] font-normal text-gray-500 border border-transparent rounded-xl hover:bg-gray-100/50 transition-colors">Cancel</button>
                                    <button type="submit" className="px-5 py-2 text-[13px] font-normal text-white bg-[#088395] hover:bg-[#066f7d] rounded-[14px] transition-all shadow-sm shadow-[#088395]/20">Create Category</button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Categories grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categories.map((cat, idx) => (
                            <div
                                key={cat.id}
                                className={`group bg-white rounded-[20px] border border-gray-100 p-5 flex flex-col hover:shadow-md hover:shadow-gray-200/40 transition-all duration-300 hover:-translate-y-0.5 ${isMounted ? 'animate-up' : ''}`}
                                style={{ animationDelay: `${0.15 + idx * 0.05}s` }}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-gray-100 bg-gray-50 transition-colors group-hover:bg-white" style={{ color: cat.color }}>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(cat.id)}
                                        className="text-gray-300 hover:text-[#F25A5A] hover:bg-[#F25A5A]/10 w-7 h-7 flex items-center justify-center rounded-full transition-all opacity-0 group-hover:opacity-100 shrink-0"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="flex-1 mb-[14px]">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                                        <h3 className="text-[15px] leading-tight font-normal text-[#201F47] group-hover:text-[#088395] transition-colors truncate">
                                            {cat.name}
                                        </h3>
                                    </div>
                                    <p className="text-[12px] leading-relaxed font-normal text-[#94a3b8] line-clamp-2 min-h-[36px]">
                                        {cat.description || "No description provided"}
                                    </p>
                                </div>

                                <div className="pt-3.5 border-t border-gray-50 flex items-center">
                                    <span className="text-[11px] font-normal text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full whitespace-nowrap border border-gray-100">
                                        {cat.issueCount} {cat.issueCount === 1 ? 'Associated Issue' : 'Associated Issues'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    )
}
