'use client'

import { useState } from 'react'
import OrgSidebar from '@/components/admin/OrgSidebar'
import Link from 'next/link'

const mockOrgs: Record<string, { name: string; slug: string; industry: string; email: string; phone: string; address: string }> = {
    'org-1': { name: 'City Municipality', slug: 'city-municipality', industry: 'Government', email: 'admin@city.gov', phone: '+91 98765 43210', address: 'City Hall, Main Street, Downtown' },
    'org-2': { name: 'Water Department', slug: 'water-department', industry: 'Utilities', email: 'water@city.gov', phone: '+91 87654 32109', address: 'Water Authority Building, Sector 4' },
    'org-3': { name: 'Waste Management', slug: 'waste-management', industry: 'Environment', email: 'waste@city.gov', phone: '+91 76543 21098', address: 'BBMP Waste Facility, Ring Road' },
}

export default function SettingsPage({ params }: { params: { orgId: string } }) {
    const { orgId } = params
    const orgData = mockOrgs[orgId] ?? { name: 'Organization', slug: '', industry: '', email: '', phone: '', address: '' }
    const [form, setForm] = useState(orgData)
    const [saved, setSaved] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
        setSaved(false)
    }

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault()
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
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
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center text-white font-bold text-xs">SA</div>
                    </div>
                </header>

                <main className="flex-1 p-6 max-w-2xl">
                    <div className="mb-6">
                        <h1 className="text-xl font-bold text-gray-900">Organization Settings</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Manage your organization's profile and configuration.</p>
                    </div>

                    {saved && (
                        <div className="mb-4 flex items-center gap-2.5 text-sm font-medium text-teal-700 bg-teal-50 border border-teal-100 rounded-xl px-4 py-3">
                            <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Settings saved successfully!
                        </div>
                    )}

                    <form onSubmit={handleSave} className="space-y-4">
                        {/* Basic Info */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-50">
                                <h2 className="text-sm font-semibold text-gray-700">Basic Information</h2>
                            </div>
                            <div className="px-5 py-5 space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Organization Name</label>
                                    <input name="name" value={form.name} onChange={handleChange}
                                        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Slug</label>
                                    <div className="flex items-center">
                                        <span className="px-3 py-2.5 bg-gray-50 border border-r-0 border-gray-200 rounded-l-xl text-xs text-gray-400">parvah.gov/</span>
                                        <input name="slug" value={form.slug} onChange={handleChange}
                                            className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all" />
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
                            <div className="px-5 py-4 border-b border-gray-50">
                                <h2 className="text-sm font-semibold text-gray-700">Contact Details</h2>
                            </div>
                            <div className="px-5 py-5 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Email</label>
                                        <input type="email" name="email" value={form.email} onChange={handleChange}
                                            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Phone</label>
                                        <input type="tel" name="phone" value={form.phone} onChange={handleChange}
                                            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Address</label>
                                    <input name="address" value={form.address} onChange={handleChange}
                                        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all" />
                                </div>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-red-50">
                                <h2 className="text-sm font-semibold text-red-700">Danger Zone</h2>
                            </div>
                            <div className="px-5 py-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-800">Delete Organization</p>
                                    <p className="text-xs text-gray-400 mt-0.5">Permanently remove this organization and all its data.</p>
                                </div>
                                <button type="button" className="text-sm font-medium text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 px-4 py-2 rounded-xl transition-colors">
                                    Delete
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <Link href={`/admin/organizations/${orgId}/dashboard`}>
                                <button type="button" className="px-4 py-2.5 text-sm font-medium text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
                            </Link>
                            <button type="submit" className="px-6 py-2.5 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-colors">
                                Save Changes
                            </button>
                        </div>
                    </form>
                </main>
            </div>
        </div>
    )
}
