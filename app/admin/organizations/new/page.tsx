'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { orgAPI } from '@/utils/backend_api_endpoints'

export default function CreateOrganizationPage() {
    const [form, setForm] = useState({
        name: '',
        slug: '',
        join_code: '',
        description: '',
        industry: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
    })
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setForm(prev => ({
            ...prev,
            [name]: value,
            ...(name === 'name' ? { slug: value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') } : {}),
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)
        try {
            const res = await orgAPI.create({
                name: form.name,
                slug: form.slug,
                join_code: form.join_code,
                description: form.description,
                industry: form.industry,
            })
            console.log('Org created:', res)
            setSubmitted(true)
            setTimeout(() => {
                window.location.href = '/admin/organizations'
            }, 1200)
        } catch (err: any) {
            console.error('Failed to create organization:', err)
            setError(err.message || 'Failed to create organization. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const industries = ['Government', 'Utilities', 'Environment', 'Transport', 'Health', 'Education', 'Other']

    return (
        <div className="min-h-screen bg-[#F9F9FB] font-sans pb-16">
            <style>{`
                .animate-slide-up {
                    opacity: 0;
                    transform: translateY(15px);
                    transition: all 0.7s cubic-bezier(0.2, 0.8, 0.2, 1);
                }
                .animate-slide-up.mounted {
                    opacity: 1;
                    transform: translateY(0);
                }
            `}</style>

            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link href="/admin/organizations" className="flex items-center gap-2 text-gray-400 hover:text-[#201F47] transition-colors text-[14px] font-normal">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                            </svg>
                            Organizations
                        </Link>
                        <span className="text-gray-300 font-light">/</span>
                        <span className="text-[14px] font-normal text-[#201F47]">New Organization</span>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-10">
                <div className={`mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 animate-slide-up ${isMounted ? 'mounted' : ''}`} style={{ transitionDelay: '0ms' }}>
                    <div>
                        <h1 className="text-[28px] font-normal tracking-tight text-[#201F47] mb-2">Create Organization</h1>
                        <p className="text-[15px] font-normal text-[#94a3b8]">Set up a new infrastructure node to start managing civic issues.</p>
                    </div>
                </div>

                {submitted ? (
                    <div className="bg-white rounded-[24px] border border-[#088395]/20 shadow-lg shadow-[#088395]/5 p-12 text-center max-w-2xl mx-auto mt-8 animate-in zoom-in fade-in duration-500">
                        <div className="w-16 h-16 bg-[#088395]/10 rounded-full flex items-center justify-center mx-auto mb-5">
                            <svg className="w-8 h-8 text-[#088395]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-normal text-[#201F47] mb-1.5">Organization Provisioned</h3>
                        <p className="text-[14px] text-gray-500 font-normal">Redirecting you to the registry...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl text-sm mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                {error}
                            </div>
                        )}
                        {/* Bento Grid Layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

                            {/* Left Column (8 cols) */}
                            <div className="lg:col-span-8 flex flex-col gap-5">

                                {/* Basic Info Card */}
                                <div className={`bg-white rounded-[24px] border border-gray-100 p-6 sm:p-8 hover:shadow-lg hover:shadow-gray-200/40 transition-shadow animate-slide-up ${isMounted ? 'mounted' : ''}`} style={{ transitionDelay: '100ms' }}>
                                    <div className="flex items-center gap-3.5 mb-7">
                                        <div className="w-11 h-11 rounded-xl bg-[#088395]/10 flex items-center justify-center border border-[#088395]/20 text-[#088395]">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h2 className="text-[17px] font-normal text-[#201F47]">Basic Information</h2>
                                            <p className="text-[13px] font-normal text-gray-400 mt-0.5">Core details about the organization.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5">
                                        <div className="sm:col-span-2">
                                            <label className="block text-[13px] font-normal text-[#201F47] mb-2">Organization Name <span className="text-[#F25A5A]">*</span></label>
                                            <input
                                                type="text"
                                                name="name"
                                                required
                                                placeholder="e.g. City Municipality"
                                                value={form.name}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 text-[14px] font-normal border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#088395]/10 focus:border-[#088395] transition-all bg-gray-50/50 focus:bg-white text-[#201F47] placeholder:text-gray-400"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[13px] font-normal text-[#201F47] mb-2">Join Code <span className="text-[#F25A5A]">*</span></label>
                                            <input
                                                type="text"
                                                name="join_code"
                                                required
                                                placeholder="e.g. CITY2024"
                                                value={form.join_code}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 text-[14px] font-normal border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#088395]/10 focus:border-[#088395] transition-all bg-gray-50/50 focus:bg-white text-[#201F47] placeholder:text-gray-400"
                                            />
                                            <p className="text-[11px] text-gray-400 mt-1.5">Users will enter this code during registration to join this organization.</p>
                                        </div>

                                        <div>
                                            <label className="block text-[13px] font-normal text-[#201F47] mb-2">URL Slug <span className="text-[#F25A5A]">*</span></label>
                                            <div className="flex items-center">
                                                <span className="px-4 py-3 bg-gray-50 border border-r-0 border-gray-200 rounded-l-xl text-[14px] font-normal text-gray-400 whitespace-nowrap">parvah.gov/</span>
                                                <input
                                                    type="text"
                                                    name="slug"
                                                    required
                                                    placeholder="city"
                                                    value={form.slug}
                                                    onChange={handleChange}
                                                    className="flex-1 px-4 py-3 text-[14px] font-normal border border-gray-200 rounded-r-xl focus:outline-none focus:ring-4 focus:ring-[#088395]/10 focus:border-[#088395] transition-all bg-gray-50/50 focus:bg-white w-full text-[#201F47] placeholder:text-gray-400"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[13px] font-normal text-[#201F47] mb-2">Industry</label>
                                            <div className="relative">
                                                <select
                                                    name="industry"
                                                    value={form.industry}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 text-[14px] font-normal border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#088395]/10 focus:border-[#088395] transition-all bg-gray-50/50 focus:bg-white appearance-none text-[#201F47]"
                                                >
                                                    <option value="" className="text-gray-400">Select industry...</option>
                                                    {industries.map(i => <option key={i} value={i} className="text-[#201F47]">{i}</option>)}
                                                </select>
                                                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-400">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" /></svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Location Card */}
                                <div className={`bg-white rounded-[24px] border border-gray-100 p-6 sm:p-8 hover:shadow-lg hover:shadow-gray-200/40 transition-shadow animate-slide-up ${isMounted ? 'mounted' : ''}`} style={{ transitionDelay: '300ms' }}>
                                    <div className="flex items-center gap-3.5 mb-7">
                                        <div className="w-11 h-11 rounded-xl bg-[#576CDB]/10 flex items-center justify-center border border-[#576CDB]/20 text-[#576CDB]">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h2 className="text-[17px] font-normal text-[#201F47]">Location Details</h2>
                                            <p className="text-[13px] font-normal text-gray-400 mt-0.5">Physical address of the headquarters.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5">
                                        <div className="sm:col-span-2">
                                            <label className="block text-[13px] font-normal text-[#201F47] mb-2">Street Address</label>
                                            <input
                                                type="text"
                                                name="address"
                                                placeholder="Enter full street address"
                                                value={form.address}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 text-[14px] font-normal border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#576CDB]/10 focus:border-[#576CDB] transition-all bg-gray-50/50 focus:bg-white text-[#201F47] placeholder:text-gray-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[13px] font-normal text-[#201F47] mb-2">City</label>
                                            <input
                                                type="text"
                                                name="city"
                                                placeholder="City name"
                                                value={form.city}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 text-[14px] font-normal border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#576CDB]/10 focus:border-[#576CDB] transition-all bg-gray-50/50 focus:bg-white text-[#201F47] placeholder:text-gray-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[13px] font-normal text-[#201F47] mb-2">State / Province</label>
                                            <input
                                                type="text"
                                                name="state"
                                                placeholder="State name"
                                                value={form.state}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 text-[14px] font-normal border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#576CDB]/10 focus:border-[#576CDB] transition-all bg-gray-50/50 focus:bg-white text-[#201F47] placeholder:text-gray-400"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column (4 cols) */}
                            <div className="lg:col-span-4 flex flex-col gap-5">

                                {/* Description Card */}
                                <div className={`bg-white rounded-[24px] border border-gray-100 p-6 sm:p-8 hover:shadow-lg hover:shadow-gray-200/40 transition-shadow flex-1 animate-slide-up ${isMounted ? 'mounted' : ''}`} style={{ transitionDelay: '200ms' }}>
                                    <div className="flex items-center gap-3.5 mb-7">
                                        <div className="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-200 text-gray-500">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h7" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h2 className="text-[17px] font-normal text-[#201F47]">Description</h2>
                                            <p className="text-[13px] font-normal text-gray-400 mt-0.5">Brief summary.</p>
                                        </div>
                                    </div>

                                    <textarea
                                        name="description"
                                        rows={4}
                                        placeholder="Give a brief overview of the organization, its purpose, and what issues it handles..."
                                        value={form.description}
                                        onChange={handleChange}
                                        className="w-full h-[calc(100%-6.5rem)] min-h-[140px] px-4 py-3 text-[14px] font-normal border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-gray-200 focus:border-gray-400 transition-all bg-gray-50/50 focus:bg-white resize-none text-[#201F47] placeholder:text-gray-400"
                                    />
                                </div>

                                {/* Contact Card */}
                                <div className={`bg-white rounded-[24px] border border-gray-100 p-6 sm:p-8 hover:shadow-lg hover:shadow-gray-200/40 transition-shadow animate-slide-up ${isMounted ? 'mounted' : ''}`} style={{ transitionDelay: '400ms' }}>
                                    <div className="flex items-center gap-3.5 mb-7">
                                        <div className="w-11 h-11 rounded-xl bg-[#09637E]/10 flex items-center justify-center border border-[#09637E]/20 text-[#09637E]">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h2 className="text-[17px] font-normal text-[#201F47]">Contact</h2>
                                            <p className="text-[13px] font-normal text-gray-400 mt-0.5">Ways to get in touch.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-[13px] font-normal text-[#201F47] mb-2">Email Address</label>
                                            <input
                                                type="email"
                                                name="email"
                                                placeholder="org@example.gov"
                                                value={form.email}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 text-[14px] font-normal border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#09637E]/10 focus:border-[#09637E] transition-all bg-gray-50/50 focus:bg-white text-[#201F47] placeholder:text-gray-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[13px] font-normal text-[#201F47] mb-2">Phone Number</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                placeholder="+91 98765 43210"
                                                value={form.phone}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 text-[14px] font-normal border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#09637E]/10 focus:border-[#09637E] transition-all bg-gray-50/50 focus:bg-white text-[#201F47] placeholder:text-gray-400"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className={`flex items-center justify-end gap-3 mt-8 pt-8 border-t border-gray-100 animate-slide-up ${isMounted ? 'mounted' : ''}`} style={{ transitionDelay: '500ms' }}>
                            <Link href="/admin/organizations">
                                <button type="button" className="rounded-xl px-5 py-3 text-[14px] font-normal text-gray-500 hover:text-[#201F47] hover:bg-white border border-transparent hover:border-gray-200 transition-all">
                                    Cancel
                                </button>
                            </Link>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`bg-[#088395] hover:bg-[#077382] text-white rounded-xl px-7 py-3 shadow-md shadow-[#088395]/20 font-normal text-[14px] transition-all flex items-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {loading && (
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                )}
                                {loading ? 'Creating...' : 'Create Organization'}
                            </button>
                        </div>
                    </form>
                )}
            </main>
        </div>
    )
}
