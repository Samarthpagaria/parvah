'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authAPI } from '@/utils/backend_api_endpoints'

export default function ProfilePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    
    const [form, setForm] = useState({
        full_name: '',
        email: '',
        phone: '',
        address: ''
    })

    useEffect(() => {
        authAPI.getMe()
            .then((res: any) => {
                const user = res.user || res
                setForm({
                    full_name: user.full_name || '',
                    email: user.email || '',
                    phone: user.phone || '',
                    address: user.address || ''
                })
            })
            .catch((err: any) => {
                console.error("Failed to load profile", err)
                setError('Failed to load profile info.')
            })
            .finally(() => setLoading(false))
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
        setSuccess(false)
        setError('')
    }

    const handleSave = async () => {
        setSaving(true)
        setSuccess(false)
        setError('')
        try {
            await authAPI.updateProfile({
                full_name: form.full_name,
                phone: form.phone,
                address: form.address
            })
            setSuccess(true)
        } catch (err: any) {
            setError(err.message || 'Failed to update profile')
        } finally {
            setSaving(false)
        }
    }

    const handleLogout = async () => {
        try {
            await authAPI.logout()
        } catch (err) {
            console.error('Logout error', err)
        } finally {
            router.push('/')
        }
    }

    const getInitials = (name: string) => {
        const parts = (name || '').trim().split(' ')
        if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
        if (parts[0]) return parts[0].substring(0, 2).toUpperCase()
        return 'U'
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
                <div className="max-w-3xl mx-auto px-6 py-3.5 flex items-center gap-3">
                    <Link href="/dashboard" className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 transition-colors text-sm font-medium">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Dashboard
                    </Link>
                    <span className="text-gray-200">/</span>
                    <span className="text-sm font-semibold text-gray-700">Profile</span>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-8 space-y-4">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Manage your account information and preferences.</p>
                </div>

                {/* Avatar card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-5">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center text-white font-bold text-xl shadow-sm">
                        {getInitials(form.full_name)}
                    </div>
                    <div>
                        <p className="font-bold text-gray-900">{form.full_name || 'Anonymous'}</p>
                        <p className="text-sm text-gray-500">{form.email}</p>
                        <span className="inline-block mt-1 text-[10px] font-semibold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">Citizen</span>
                    </div>
                </div>

                {/* Info form */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-50 flex justify-between items-center">
                        <h2 className="text-sm font-semibold text-gray-700">Personal Information</h2>
                        {success && <span className="text-xs font-semibold text-teal-600">Saved successfully!</span>}
                        {error && <span className="text-xs font-semibold text-red-500">{error}</span>}
                    </div>
                    <div className="px-5 py-5 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Full Name</label>
                                <input 
                                    name="full_name"
                                    value={form.full_name}
                                    onChange={handleChange}
                                    placeholder="Enter your full name" 
                                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all" 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Phone</label>
                                <input 
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    placeholder="Enter your phone number" 
                                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all" 
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email Address</label>
                            <input 
                                type="email" 
                                value={form.email} 
                                disabled
                                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Address</label>
                            <input 
                                name="address"
                                value={form.address}
                                onChange={handleChange}
                                placeholder="Enter your current address" 
                                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all" 
                            />
                        </div>
                    </div>
                    <div className="px-5 py-4 bg-gray-50/50 flex justify-between items-center">
                        <button 
                            className="text-sm font-semibold text-red-500 hover:text-red-600 transition-colors"
                            onClick={handleLogout}
                        >
                            Log Out
                        </button>
                        <button 
                            className="px-5 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-colors disabled:opacity-70 flex items-center gap-2"
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    )
}
