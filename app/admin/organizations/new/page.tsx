'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function CreateOrganizationPage() {
    const [form, setForm] = useState({
        name: '',
        slug: '',
        description: '',
        industry: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
    })
    const [submitted, setSubmitted] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setForm(prev => ({
            ...prev,
            [name]: value,
            ...(name === 'name' ? { slug: value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') } : {}),
        }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitted(true)
        setTimeout(() => {
            window.location.href = '/admin/organizations'
        }, 1200)
    }

    const industries = ['Government', 'Utilities', 'Environment', 'Transport', 'Health', 'Education', 'Other']

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center gap-3">
                    <Link href="/admin/organizations" className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 transition-colors text-sm font-medium">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Organizations
                    </Link>
                    <span className="text-gray-200">/</span>
                    <span className="text-sm font-semibold text-gray-700">New Organization</span>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-6 py-10">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Create Organization</h1>
                    <p className="text-sm text-gray-500 mt-1">Set up a new organization to start managing civic issues.</p>
                </div>

                {submitted ? (
                    <div className="bg-white rounded-2xl border border-teal-100 shadow-sm p-10 text-center">
                        <div className="w-14 h-14 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-7 h-7 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Organization Created!</h3>
                        <p className="text-sm text-gray-500">Redirecting you back to organizations...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        {/* Section: Basic Info */}
                        <div className="px-6 py-5 border-b border-gray-50">
                            <h2 className="text-sm font-semibold text-gray-700 mb-4">Basic Information</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Organization Name <span className="text-red-400">*</span></label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        placeholder="e.g. City Municipality"
                                        value={form.name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1.5">URL Slug <span className="text-red-400">*</span></label>
                                    <div className="flex items-center">
                                        <span className="px-3 py-2.5 bg-gray-50 border border-r-0 border-gray-200 rounded-l-xl text-xs text-gray-400 whitespace-nowrap">parvah.gov/</span>
                                        <input
                                            type="text"
                                            name="slug"
                                            required
                                            placeholder="city-municipality"
                                            value={form.slug}
                                            onChange={handleChange}
                                            className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Industry</label>
                                    <select
                                        name="industry"
                                        value={form.industry}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all bg-white"
                                    >
                                        <option value="">Select industry...</option>
                                        {industries.map(i => <option key={i} value={i}>{i}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Description</label>
                                    <textarea
                                        name="description"
                                        rows={3}
                                        placeholder="Brief description of what this organization manages..."
                                        value={form.description}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section: Contact */}
                        <div className="px-6 py-5 border-b border-gray-50">
                            <h2 className="text-sm font-semibold text-gray-700 mb-4">Contact Details</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="org@example.gov"
                                        value={form.email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Phone</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        placeholder="+91 98765 43210"
                                        value={form.phone}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Address</label>
                                    <input
                                        type="text"
                                        name="address"
                                        placeholder="Street address"
                                        value={form.address}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1.5">City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        placeholder="City"
                                        value={form.city}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1.5">State</label>
                                    <input
                                        type="text"
                                        name="state"
                                        placeholder="State"
                                        value={form.state}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="px-6 py-4 bg-gray-50/50 flex justify-end gap-3">
                            <Link href="/admin/organizations">
                                <Button type="button" variant="outline" className="rounded-xl border-gray-200 text-gray-600 hover:bg-gray-100">
                                    Cancel
                                </Button>
                            </Link>
                            <Button
                                type="submit"
                                className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-6 shadow-sm font-medium"
                            >
                                Create Organization
                            </Button>
                        </div>
                    </form>
                )}
            </main>
        </div>
    )
}
