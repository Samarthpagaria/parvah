'use client'

import { useState, useEffect, use } from 'react'
import OrgSidebar from '@/components/admin/OrgSidebar'
import Link from 'next/link'
import { orgAPI, categoryAPI } from '@/lib/api'
import { toast } from 'sonner'

interface Category { id: string; name: string; color: string; issueCount: number; description: string }

const colorOptions = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#06b6d4', '#ec4899', '#6366f1']

export default function CategoriesPage({ params }: { params: Promise<{ orgId: string }> }) {
    const { orgId } = use(params)
    const [orgName, setOrgName] = useState('Loading...')
    const [categories, setCategories] = useState<Category[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showAdd, setShowAdd] = useState(false)
    const [newName, setNewName] = useState('')
    const [newDesc, setNewDesc] = useState('')
    const [newColor, setNewColor] = useState('#10b981')
    const [isSaving, setIsSaving] = useState(false)

    const fetchCategories = async () => {
        setIsLoading(true)
        try {
            const [orgData, catData] = await Promise.all([
                orgAPI.getDetails(orgId) as Promise<any>,
                categoryAPI.list(orgId) as Promise<any>
            ])
            setOrgName(orgData.organization.name)
            setCategories(catData.categories || [])
        } catch (err) {
            console.error('Failed to fetch categories:', err)
            toast.error('Failed to load categories')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchCategories()
    }, [orgId])

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            await categoryAPI.create(orgId, {
                name: newName,
                color: newColor,
                description: newDesc
            })
            toast.success('Category added successfully')
            fetchCategories()
            setNewName('')
            setNewDesc('')
            setNewColor('#10b981')
            setShowAdd(false)
        } catch (err: any) {
            toast.error(err.message || 'Failed to add category')
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        try {
            await categoryAPI.delete(orgId, id)
            toast.success('Category deleted successfully')
            fetchCategories()
        } catch (err: any) {
            toast.error(err.message || 'Failed to delete category')
        }
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
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center text-white font-bold text-xs shadow-sm">SA</div>
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
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-sm disabled:opacity-50"
                                    >
                                        {isSaving ? 'Adding...' : 'Add Category'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Categories grid */}
                    {isLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
                            ))}
                        </div>
                    ) : (
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
                                        onClick={() => {
                                            if (confirm(`Are you sure you want to delete ${cat.name}?`)) {
                                                handleDelete(cat.id)
                                            }
                                        }}
                                        className="text-gray-200 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                            {categories.length === 0 && (
                                <div className="col-span-2 text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                                    <p className="text-sm text-gray-400">No categories found. Add one to get started.</p>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}
