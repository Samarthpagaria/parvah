'use client'

import { useState, useEffect, use } from 'react'
import OrgSidebar from '@/components/admin/OrgSidebar'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { orgAPI, authAPI } from '@/utils/backend_api_endpoints'

const mockOrgs: Record<string, { name: string; slug: string; industry: string; email: string; phone: string; address: string; description: string }> = {
    'org-1': { name: 'City Municipality', slug: 'city-municipality', industry: 'Government', email: 'admin@city.gov', phone: '+91 98765 43210', address: 'City Hall, Main Street, Downtown', description: 'Urban infrastructure and civic governance.' },
    'org-2': { name: 'Water Department', slug: 'water-department', industry: 'Utilities', email: 'water@city.gov', phone: '+91 87654 32109', address: 'Water Authority Building, Sector 4', description: 'Water supply, distribution and sanitation.' },
    'org-3': { name: 'Waste Management', slug: 'waste-management', industry: 'Environment', email: 'waste@city.gov', phone: '+91 76543 21098', address: 'BBMP Waste Facility, Ring Road', description: 'Waste collection, processing and disposal.' },
}

export default function SettingsPage({ params }: { params: Promise<{ orgId: string }> }) {
    const { orgId } = use(params)
    const router = useRouter()
    const [form, setForm] = useState({ name: '', slug: '', industry: 'Government', email: '', phone: '', address: '', description: '' })
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saved, setSaved] = useState(false)
    const [isMounted, setIsMounted] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    useEffect(() => {
        setIsMounted(true)
        const fetchData = async () => {
            try {
                const [orgRes, userRes] = await Promise.all([
                    orgAPI.getDetails(orgId),
                    authAPI.getMe()
                ])
                const o = orgRes.organization
                setForm({
                    name: o.name || '',
                    slug: o.slug || '',
                    industry: o.industry || 'Government',
                    email: o.email || '',
                    phone: o.phone || '',
                    address: o.address || '',
                    description: o.description || ''
                })
                setUser(userRes.user)
            } catch (err) {
                console.error('Failed to fetch settings:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [orgId])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
        setSaved(false)
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await orgAPI.update(orgId, form)
            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
        } catch (err) {
            console.error('Failed to update settings:', err)
        }
    }

    const handleDelete = async () => {
        try {
            await orgAPI.deactivate(orgId)
            router.push('/admin/organizations')
        } catch (err) {
            console.error('Failed to deactivate organization:', err)
        }
    }

    const inputClass = "w-full px-4 py-3 text-[14px] font-normal text-[#201F47] border border-gray-200 rounded-[14px] focus:outline-none focus:ring-2 focus:ring-[#088395]/20 focus:border-[#088395] transition-all bg-white placeholder-gray-300"
    const labelClass = "block text-[11px] font-normal text-gray-500 uppercase tracking-wider mb-2"

    return (
        <div className="min-h-screen bg-[#F9F9FB] flex font-sans">
            <OrgSidebar orgId={orgId} orgName={form.name} />

            <div className="flex-1 flex flex-col min-w-0">
                {/* Top bar */}
                <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40">
                    <div className="px-6 md:px-8 flex items-center justify-between h-[68px]">
                        <div className="flex items-center gap-2 md:gap-3 text-[14px] font-normal truncate">
                            <Link href="/admin/organizations" className="text-gray-400 hover:text-[#201F47] transition-colors hidden sm:block">Organizations</Link>
                            <span className="text-gray-300 hidden sm:block">/</span>
                            <Link href={`/admin/organizations/${orgId}/dashboard`} className="text-gray-400 hover:text-[#201F47] transition-colors">{form.name}</Link>
                            <span className="text-gray-300">/</span>
                            <span className="text-[#201F47]">Settings</span>
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

                <main className="flex-1 p-6 md:p-8 overflow-auto">
                    {/* Page Header */}
                    <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 transition-all duration-500 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
                        <div>
                            <h1 className="text-[28px] font-normal text-[#201F47] leading-tight mb-1.5 tracking-tight">Settings</h1>
                            <p className="text-[15px] font-normal text-gray-500">Configure and manage your organization details.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link href={`/admin/organizations/${orgId}/dashboard`}>
                                <button type="button" className="px-4 py-2.5 text-[13px] font-normal text-gray-500 bg-white border border-gray-200 rounded-[12px] hover:bg-gray-50 transition-colors shadow-sm">
                                    Discard
                                </button>
                            </Link>
                            <button
                                onClick={handleSave}
                                className="px-5 py-2.5 text-[13px] font-normal text-white bg-[#201F47] hover:bg-[#14122d] rounded-[12px] shadow-sm transition-colors flex items-center gap-2"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                Save Changes
                            </button>
                        </div>
                    </div>

                    {/* Toast */}
                    {saved && (
                        <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
                            <div className="bg-[#201F47] text-white text-[13px] font-normal px-5 py-3.5 rounded-[14px] shadow-2xl flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-emerald-400/20 flex items-center justify-center">
                                    <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                </div>
                                Settings saved successfully.
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSave}>
                        {/* Bento Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">

                            {/* Card 1: Identity — spans 2 cols */}
                            <div className={`lg:col-span-3 bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden transition-all duration-500 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '100ms' }}>
                                <div className="px-6 py-5 border-b border-gray-50 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-[10px] bg-[#201F47]/5 flex items-center justify-center text-[#201F47]">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                    </div>
                                    <div>
                                        <h2 className="text-[15px] font-normal text-[#201F47]">Organization Identity</h2>
                                        <p className="text-[12px] font-normal text-gray-400">Core information about your organization.</p>
                                    </div>
                                </div>
                                <div className="p-6 space-y-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className={labelClass}>Organization Name</label>
                                            <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. City Municipality" className={inputClass} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Industry</label>
                                            <select name="industry" value={form.industry} onChange={handleChange} className={inputClass + ' cursor-pointer'}>
                                                {['Government', 'Utilities', 'Environment', 'Transport', 'Health', 'Education', 'Other'].map(i => <option key={i}>{i}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Description</label>
                                        <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Brief description of what this organization does…" className={inputClass + ' resize-none'} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>System Slug / URL</label>
                                        <div className="flex items-stretch rounded-[14px] border border-gray-200 overflow-hidden focus-within:border-[#088395] focus-within:ring-2 focus-within:ring-[#088395]/20 transition-all">
                                            <span className="px-4 flex items-center bg-[#F9F9FB] border-r border-gray-200 text-[13px] font-normal text-gray-400 select-none whitespace-nowrap">
                                                parvah.gov/
                                            </span>
                                            <input name="slug" value={form.slug} onChange={handleChange} className="flex-1 px-4 py-3 text-[14px] font-normal text-[#201F47] focus:outline-none bg-white" />
                                        </div>
                                        <p className="text-[11px] font-normal text-gray-400 mt-2">Unique path used in the public-facing issue portal.</p>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Row 2: Contact */}
                        <div className={`bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden mb-5 transition-all duration-500 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '200ms' }}>
                            <div className="px-6 py-5 border-b border-gray-50 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-[10px] bg-[#088395]/10 flex items-center justify-center text-[#088395]">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                </div>
                                <div>
                                    <h2 className="text-[15px] font-normal text-[#201F47]">Contact Information</h2>
                                    <p className="text-[12px] font-normal text-gray-400">Official communication channels for this organization.</p>
                                </div>
                            </div>
                            <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-5">
                                <div>
                                    <label className={labelClass}>Support Email</label>
                                    <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="admin@org.gov" className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Contact Phone</label>
                                    <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 XXXXX XXXXX" className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Headquarters Address</label>
                                    <input name="address" value={form.address} onChange={handleChange} placeholder="Building, Street, City" className={inputClass} />
                                </div>
                            </div>
                        </div>

                        {/* Row 3: Danger Zone */}
                        <div className={`bg-white rounded-[24px] border border-[#F25A5A]/20 shadow-sm overflow-hidden transition-all duration-500 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '250ms' }}>
                            <div className="px-6 py-5 border-b border-[#F25A5A]/10 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-[10px] bg-[#F25A5A]/5 flex items-center justify-center text-[#F25A5A]">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                </div>
                                <div>
                                    <h2 className="text-[15px] font-normal text-[#F25A5A]">Danger Zone</h2>
                                    <p className="text-[12px] font-normal text-gray-400">Irreversible actions that affect this organization permanently.</p>
                                </div>
                            </div>
                            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <p className="text-[14px] font-normal text-[#201F47] mb-1">Permanently Delete Organization</p>
                                    <p className="text-[12px] font-normal text-gray-400 max-w-lg leading-relaxed">This will erase all issues, members, categories, and settings linked to this organization. It cannot be undone.</p>
                                </div>
                                {!showDeleteConfirm ? (
                                    <button
                                        type="button"
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="px-5 py-2.5 text-[13px] font-normal text-[#F25A5A] border border-[#F25A5A]/30 bg-white hover:bg-[#F25A5A] hover:text-white rounded-[12px] transition-all whitespace-nowrap shadow-sm"
                                    >
                                        Delete Organization
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-3 shrink-0">
                                        <span className="text-[12px] font-normal text-gray-500">Are you sure?</span>
                                        <button type="button" onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2.5 text-[13px] font-normal text-gray-500 bg-white border border-gray-200 rounded-[12px] hover:bg-gray-50 transition-colors">
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleDelete}
                                            className="px-4 py-2.5 text-[13px] font-normal text-white bg-[#F25A5A] hover:bg-red-600 rounded-[12px] transition-colors shadow-sm"
                                        >
                                            Confirm Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </form>
                </main>
            </div>
        </div>
    )
}
