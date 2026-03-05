'use client'

import { useState, useEffect, use } from 'react'
import OrgSidebar from '@/components/admin/OrgSidebar'
import Link from 'next/link'
import { orgAPI } from '@/lib/api'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function SettingsPage({ params }: { params: Promise<{ orgId: string }> }) {
    const { orgId } = use(params)
    const router = useRouter()
    const [form, setForm] = useState({ name: 'Loading...', slug: '', industry: 'Government', email: '', phone: '', address: '' })
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        const fetchOrg = async () => {
            try {
                const data: any = await orgAPI.getDetails(orgId)
                const org = data.organization
                setForm({
                    name: org.name || '',
                    slug: org.slug || '',
                    industry: org.industry || 'Government',
                    email: org.email || '',
                    phone: org.phone || '',
                    address: org.address || ''
                })
            } catch (err) {
                console.error('Failed to fetch org:', err)
                toast.error('Failed to load settings')
            } finally {
                setIsLoading(false)
            }
        }
        fetchOrg()
    }, [orgId])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            await orgAPI.update(orgId, form)
            toast.success('Settings saved successfully')
        } catch (err: any) {
            toast.error(err.message || 'Failed to save settings')
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this organization? This action cannot be undone.')) {
            try {
                await orgAPI.deactivate(orgId)
                toast.success('Organization deleted successfully')
                router.push('/admin/organizations')
            } catch (err: any) {
                toast.error(err.message || 'Failed to delete organization')
            }
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-teal-600 animate-pulse font-medium">Loading settings...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <OrgSidebar orgId={orgId} orgName={form.name} />

            <div className="flex-1 flex flex-col min-w-0">
                <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
                    <div className="px-6 py-3.5 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                            <Link href="/admin/organizations" className="text-gray-400 hover:text-gray-600 font-medium transition-colors">Organizations</Link>
                            <span className="text-gray-200">/</span>
                            <Link href={`/admin/organizations/${orgId}/dashboard`} className="text-gray-400 hover:text-gray-600 font-medium transition-colors">{form.name}</Link>
                            <span className="text-gray-200">/</span>
                            <span className="text-teal-600 font-medium">Settings</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center text-white font-bold text-xs shadow-sm">SA</div>
                    </div>
                </header>

                <main className="flex-1 p-6 max-w-2xl">
                    <div className="mb-6">
                        <h1 className="text-xl font-bold text-gray-900">Organization Settings</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Manage your organization's profile and configuration.</p>
                    </div>

                    <form onSubmit={handleSave} className="space-y-4">
                        {/* Basic Info */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/30">
                                <h2 className="text-sm font-semibold text-gray-700">Basic Information</h2>
                            </div>
                            <div className="px-5 py-5 space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Organization Name</label>
                                    <input name="name" value={form.name} onChange={handleChange} required
                                        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all placeholder:text-gray-300" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Slug</label>
                                    <div className="flex items-center">
                                        <span className="px-3 py-2.5 bg-gray-50 border border-r-0 border-gray-200 rounded-l-xl text-xs text-gray-400">parvah.gov/</span>
                                        <input name="slug" value={form.slug} onChange={handleChange} required
                                            className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all placeholder:text-gray-300" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Industry</label>
                                    <select name="industry" value={form.industry} onChange={handleChange}
                                        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 bg-white transition-all">
                                        {['Government', 'Utilities', 'Environment', 'Transport', 'Health', 'Education', 'Other'].map(i => <option key={i}>{i}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Contact */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/30">
                                <h2 className="text-sm font-semibold text-gray-700">Contact Details</h2>
                            </div>
                            <div className="px-5 py-5 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Email</label>
                                        <input type="email" name="email" value={form.email} onChange={handleChange}
                                            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all placeholder:text-gray-300" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Phone</label>
                                        <input type="tel" name="phone" value={form.phone} onChange={handleChange}
                                            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all placeholder:text-gray-300" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Address</label>
                                    <input name="address" value={form.address} onChange={handleChange}
                                        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all placeholder:text-gray-300" />
                                </div>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-red-50 bg-red-50/30">
                                <h2 className="text-sm font-semibold text-red-700">Danger Zone</h2>
                            </div>
                            <div className="px-5 py-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-800">Delete Organization</p>
                                    <p className="text-xs text-gray-400 mt-0.5">Permanently remove this organization and all its data.</p>
                                </div>
                                <button type="button" onClick={handleDelete} className="text-sm font-medium text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 px-4 py-2 rounded-xl transition-colors bg-white">
                                    Delete
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <Link href={`/admin/organizations/${orgId}/dashboard`}>
                                <button type="button" className="px-4 py-2.5 text-sm font-medium text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
                            </Link>
                            <button type="submit" disabled={isSaving} className="px-6 py-2.5 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md transition-colors disabled:opacity-50">
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </main>
            </div>
        </div>
    )
}
