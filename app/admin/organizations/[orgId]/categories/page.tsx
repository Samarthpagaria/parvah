'use client'

import { useState } from 'react'
import OrgSidebar from '@/components/admin/OrgSidebar'
import Link from 'next/link'

const mockOrgs: Record<string, string> = {
    'org-1': 'City Municipality',
    'org-2': 'Water Department',
    'org-3': 'Waste Management',
}

interface Category { id: string; name: string; color: string; issueCount: number; description: string }

const initialCategories: Category[] = [
    { id: '1', name: 'Road Maintenance', color: '#f59e0b', issueCount: 24, description: 'Potholes, road damage, signage issues' },
    { id: '2', name: 'Street Lighting', color: '#3b82f6', issueCount: 11, description: 'Broken or missing street lights' },
    { id: '3', name: 'Water Supply', color: '#06b6d4', issueCount: 8, description: 'Leaks, disruptions, water quality' },
    { id: '4', name: 'Cleanliness', color: '#10b981', issueCount: 19, description: 'Illegal dumping, garbage collection' },
    { id: '5', name: 'Parks & Recreation', color: '#8b5cf6', issueCount: 5, description: 'Park maintenance and amenities' },
    { id: '6', name: 'Safety', color: '#ef4444', issueCount: 7, description: 'Public safety hazards and concerns' },
]

const colorOptions = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#06b6d4', '#ec4899', '#6366f1']

export default function CategoriesPage({ params }: { params: { orgId: string } }) {
    const { orgId } = params
    const orgName = mockOrgs[orgId] ?? 'Organization'
    const [categories, setCategories] = useState<Category[]>(initialCategories)
    const [showAdd, setShowAdd] = useState(false)
    const [newName, setNewName] = useState('')
    const [newDesc, setNewDesc] = useState('')
    const [newColor, setNewColor] = useState('#10b981')

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault()
        setCategories(prev => [...prev, {
            id: Date.now().toString(),
            name: newName,
            color: newColor,
            issueCount: 0,
            description: newDesc,
        }])
        setNewName('')
        setNewDesc('')
        setNewColor('#10b981')
        setShowAdd(false)
    }

    const handleDelete = (id: string) => {
        setCategories(prev => prev.filter(c => c.id !== id))
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <OrgSidebar orgId={orgId} orgName={orgName} />

            <div className="flex-1 flex flex-col min-w-0">
                <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
                    <div className="px-6 py-3.5 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                            <Link href="/admin/organizations" className="text-gray-400 hover:text-gray-600 font-medium transition-colors">Organizations</Link>
                            <span className="text-gray-200">/</span>
                            <Link href={`/admin/organizations/${orgId}/dashboard`} className="text-gray-400 hover:text-gray-600 font-medium transition-colors">{orgName}</Link>
                            <span className="text-gray-200">/</span>
                            <span className="text-teal-600 font-medium">Categories</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center text-white font-bold text-xs">SA</div>
                    </div>
                </header>

                <main className="flex-1 p-6 max-w-3xl">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Issue Categories</h1>
                            <p className="text-sm text-gray-500 mt-0.5">Manage issue categories for {orgName}</p>
                        </div>
                        <button
                            onClick={() => setShowAdd(true)}
                            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-sm transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Category
                        </button>
                    </div>

                    {/* Add Category inline form */}
                    {showAdd && (
                        <div className="bg-white rounded-2xl border border-teal-100 shadow-sm p-5 mb-5">
                            <h3 className="text-sm font-semibold text-gray-800 mb-4">New Category</h3>
                            <form onSubmit={handleAdd} className="space-y-4">
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Name <span className="text-red-400">*</span></label>
                                        <input
                                            required
                                            value={newName}
                                            onChange={e => setNewName(e.target.value)}
                                            placeholder="e.g. Road Maintenance"
                                            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Description</label>
                                    <input
                                        value={newDesc}
                                        onChange={e => setNewDesc(e.target.value)}
                                        placeholder="Brief description of issue types..."
                                        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-2">Color</label>
                                    <div className="flex gap-2 flex-wrap">
                                        {colorOptions.map(c => (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={() => setNewColor(c)}
                                                className={`w-7 h-7 rounded-full border-2 transition-all ${newColor === c ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                                                style={{ backgroundColor: c }}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-2 pt-1">
                                    <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm font-medium text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
                                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-sm">Add Category</button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Categories grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {categories.map(cat => (
                            <div key={cat.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-start gap-3 group hover:shadow-md transition-all">
                                <div className="w-3 h-3 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: cat.color }} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-semibold text-gray-800">{cat.name}</p>
                                        <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full flex-shrink-0">
                                            {cat.issueCount} issues
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-0.5">{cat.description}</p>
                                </div>
                                <button
                                    onClick={() => handleDelete(cat.id)}
                                    className="text-gray-200 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    )
}
