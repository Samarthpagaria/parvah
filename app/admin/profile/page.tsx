'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { authAPI } from '@/utils/backend_api_endpoints'
import React from "react";
type Tab = 'profile' | 'security' | 'activity'

const recentActivity = [
    { id: 1, action: 'Approved issue #142 — Pothole on Main St.', time: '2 mins ago', type: 'approved' },
    { id: 2, action: 'Assigned Sarah Wilson to issue #201', time: '34 mins ago', type: 'assign' },
    { id: 3, action: 'Closed issue #98 — Street light broken', time: '1 hr ago', type: 'closed' },
    { id: 4, action: 'Created organization: Water Department', time: '3 hrs ago', type: 'create' },
    { id: 5, action: 'Invited Raj Kumar as Read Only to City Municipality', time: '1 day ago', type: 'invite' },
    { id: 6, action: 'Updated category: Road Maintenance', time: '2 days ago', type: 'edit' },
]

const loginSessions = [
    { device: 'Chrome on Windows', ip: '192.168.1.10', time: 'Active now', current: true },
    { device: 'Safari on iPhone', ip: '10.0.0.45', time: '2 hours ago', current: false },
    { device: 'Firefox on Mac', ip: '172.16.0.3', time: 'Yesterday 6:10 PM', current: false },
]

const activityTypeConfig: Record<string, { color: string; icon: React.ReactElement }> = {
    approved: {
        color: 'bg-emerald-50 text-emerald-600',
        icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
    },
    assign: {
        color: 'bg-[#576CDB]/10 text-[#576CDB]',
        icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
    },
    closed: {
        color: 'bg-gray-100 text-gray-500',
        icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
    },
    create: {
        color: 'bg-[#088395]/10 text-[#088395]',
        icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
    },
    invite: {
        color: 'bg-purple-50 text-purple-600',
        icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
    },
    edit: {
        color: 'bg-amber-50 text-amber-600',
        icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
    },
}

export default function AdminProfilePage() {
    const [isMounted, setIsMounted] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [activeTab, setActiveTab] = useState<Tab>('profile')
    const [twoFAEnabled, setTwoFAEnabled] = useState(true)
    const [saveSuccess, setSaveSuccess] = useState(false)
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState({
        firstName: '',
        lastName: '',
        email: '',
        role: 'Admin',
        phone: '',
        department: '',
        location: '',
        bio: '',
    })

    useEffect(() => {
        setIsMounted(true)
        const fetchUser = async () => {
            try {
                const res = await authAPI.getMe()
                const u = res.user
                const names = (u.full_name || '').split(' ')
                setProfile({
                    firstName: names[0] || '',
                    lastName: names.slice(1).join(' ') || '',
                    email: u.email || '',
                    role: u.is_super_admin ? 'Super Admin' : 'Staff',
                    phone: u.phone || '', // Assuming these exist or come from profile
                    department: '',
                    location: '',
                    bio: u.bio || '',
                })
            } catch (err) {
                console.error('Failed to fetch user:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchUser()
    }, [])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await authAPI.updateProfile({
                full_name: `${profile.firstName} ${profile.lastName}`,
                bio: profile.bio,
            })
            setIsEditing(false)
            setSaveSuccess(true)
            setTimeout(() => setSaveSuccess(false), 3000)
        } catch (err) {
            console.error('Failed to update profile:', err)
        }
    }

    const handleLogout = async () => {
        try {
            await authAPI.logout()
            window.location.href = '/admin/login'
        } catch (err) {
            console.error('Logout failed:', err)
            // Fallback
            window.location.href = '/admin/login'
        }
    }

    const tabs: { id: Tab; label: string }[] = [
        { id: 'profile', label: 'Profile' },
        { id: 'security', label: 'Security' },
        { id: 'activity', label: 'Activity' },
    ]

    return (
        <div className="min-h-screen bg-[#F9F9FB] text-[#201F47] font-sans pb-16">
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
                  animation: fadeIn 0.3s ease forwards;
                }
            `}</style>

            {/* Navigation */}
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 py-0 flex items-center justify-between h-[64px]">
                    <Link href="/admin/organizations" className="flex items-center gap-0.5 select-none group">
                        <span className="text-[18px] font-normal tracking-[-0.04em] text-[#201F47]">par</span><span className="text-[18px] font-normal tracking-[-0.04em] text-[#088395]">vah</span><span className="w-1.5 h-1.5 rounded-full bg-[#088395] mb-0.5 ml-0.5 self-end shrink-0 group-hover:scale-125 transition-transform" />
                    </Link>
                    <div className="flex items-center gap-4">
                        <button className="relative text-[#94a3b8] hover:text-[#201F47] transition-colors pr-4 border-r border-gray-200">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <span className="absolute -top-0.5 -right-3 w-2 h-2 bg-[#F25A5A] rounded-full" />
                        </button>
                        <span className="text-[#201F47] font-normal text-sm">{profile.firstName} {profile.lastName}</span>
                        <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#088395]/10 text-[#088395] font-normal text-sm">
                            {profile.firstName[0]}{profile.lastName[0]}
                        </div>
                        <button
                            onClick={handleLogout}
                            className="text-[#94a3b8] hover:text-[#F25A5A] transition-colors font-normal text-[11px] uppercase tracking-widest pl-4 border-l border-gray-200"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-8">
                {/* Breadcrumb + Title + actions header */}
                <div className={`flex flex-col md:flex-row md:items-start justify-between gap-5 mb-8 ${isMounted ? 'animate-up' : ''}`} style={{ animationDelay: '0.05s' }}>
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-[13px] text-gray-400 font-normal">
                            <Link href="/admin/organizations" className="hover:text-[#201F47] transition-colors">Admin</Link>
                            <span>/</span>
                            <span className="text-[#201F47]">Profile</span>
                        </div>
                        <h1 className="text-[26px] font-normal tracking-tight text-[#201F47]">My Profile</h1>
                        <p className="text-[14px] text-gray-500 mt-1 font-normal">Manage your account settings and preferences</p>
                    </div>
                    {!isEditing && activeTab === 'profile' && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="bg-[#201F47] hover:bg-[#2c2b5c] text-white px-5 py-2.5 rounded-[16px] font-normal text-sm transition-all flex items-center gap-2 shadow-sm shrink-0"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            Edit Profile
                        </button>
                    )}
                </div>

                {/* Save confirmation toast */}
                {saveSuccess && (
                    <div className="fixed bottom-6 right-6 bg-[#088395] text-white text-sm font-normal px-5 py-3 rounded-2xl shadow-lg shadow-[#088395]/20 flex items-center gap-2.5 animate-up z-50">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        Profile saved successfully
                    </div>
                )}

                {/* Bento Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

                    {/* ── LEFT COLUMN ── */}
                    <div className="lg:col-span-4 flex flex-col gap-4">

                        {/* Avatar/Identity Card */}
                        <div className={`bg-white rounded-[24px] border border-gray-100 p-6 flex flex-col items-center text-center ${isMounted ? 'animate-up' : ''}`} style={{ animationDelay: '0.15s' }}>
                            <div className="relative mb-5 group cursor-pointer">
                                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#088395] to-[#576CDB] flex items-center justify-center text-white text-2xl font-normal shadow-lg shadow-[#088395]/20 transition-transform group-hover:scale-105">
                                    {profile.firstName[0]}{profile.lastName[0]}
                                </div>
                                <div className="absolute inset-0 bg-black/20 rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                </div>
                            </div>
                            <h2 className="text-[18px] font-normal text-[#201F47] mb-1.5">{profile.firstName} {profile.lastName}</h2>
                            <span className="text-[12px] font-normal text-[#088395] bg-[#088395]/10 px-3 py-1 rounded-full">{profile.role}</span>

                            <div className="w-full h-px bg-gray-100 my-5" />

                            <div className="w-full space-y-3.5 text-left">
                                <div className="flex items-center gap-3 text-[13px] text-gray-500">
                                    <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    <span className="truncate font-normal">{profile.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-[13px] text-gray-500">
                                    <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                    <span className="font-normal">{profile.phone}</span>
                                </div>
                                <div className="flex items-center gap-3 text-[13px] text-gray-500">
                                    <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    <span className="font-normal">{profile.location}</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats Card */}
                        <div className={`bg-white rounded-[24px] border border-gray-100 p-5 ${isMounted ? 'animate-up' : ''}`} style={{ animationDelay: '0.2s' }}>
                            <p className="text-[12px] text-gray-400 uppercase tracking-wider font-normal mb-4">Overview</p>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { label: 'Organizations', value: '6', color: 'text-[#088395]', bg: 'bg-[#088395]/10' },
                                    { label: 'Issues Resolved', value: '142', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                    { label: 'Members Managed', value: '38', color: 'text-[#576CDB]', bg: 'bg-[#576CDB]/10' },
                                ].map(stat => (
                                    <div key={stat.label} className={`${stat.bg} rounded-2xl p-3.5 text-center`}>
                                        <p className={`text-[22px] font-normal ${stat.color}`}>{stat.value}</p>
                                        <p className="text-[10px] font-normal text-gray-500 mt-0.5 leading-tight">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>


                    </div>

                    {/* ── RIGHT COLUMN ── */}
                    <div className="lg:col-span-8 flex flex-col gap-4">

                        {/* Tab Bar */}
                        <div className={`bg-white rounded-[20px] border border-gray-100 p-1.5 flex gap-1 ${isMounted ? 'animate-up' : ''}`} style={{ animationDelay: '0.1s' }}>
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => { setActiveTab(tab.id); setIsEditing(false) }}
                                    className={`flex-1 py-2.5 text-[13px] font-normal rounded-[14px] transition-all ${activeTab === tab.id ? 'bg-[#201F47] text-white shadow-sm' : 'text-gray-500 hover:text-[#201F47] hover:bg-gray-50'}`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* ── TAB: PROFILE ── */}
                        {activeTab === 'profile' && (
                            <>
                                {isEditing ? (
                                    <div className={`bg-white rounded-[24px] border border-gray-100 p-6 ${isMounted ? 'animate-up' : ''}`} style={{ animationDelay: '0.15s' }}>
                                        <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-50">
                                            <h3 className="text-[16px] font-normal text-[#201F47]">Edit Information</h3>
                                            <button onClick={() => setIsEditing(false)} className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-50 hover:text-[#F25A5A] transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                        <form onSubmit={handleSave} className="space-y-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {[
                                                    { label: 'First Name', key: 'firstName', type: 'text' },
                                                    { label: 'Last Name', key: 'lastName', type: 'text' },
                                                    { label: 'Email Address', key: 'email', type: 'email' },
                                                    { label: 'Phone Number', key: 'phone', type: 'tel' },
                                                    { label: 'Department', key: 'department', type: 'text' },
                                                    { label: 'Location', key: 'location', type: 'text' },
                                                ].map(field => (
                                                    <div key={field.key}>
                                                        <label className="block text-[13px] font-normal text-[#201F47] mb-2">{field.label}</label>
                                                        <input
                                                            type={field.type}
                                                            value={profile[field.key as keyof typeof profile]}
                                                            onChange={e => setProfile({ ...profile, [field.key]: e.target.value })}
                                                            className="w-full px-4 py-2.5 text-[13px] font-normal border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#088395]/10 focus:border-[#088395] transition-all bg-gray-50/50 focus:bg-white text-[#201F47] placeholder:text-gray-400"
                                                        />
                                                    </div>
                                                ))}
                                                <div className="sm:col-span-2">
                                                    <label className="block text-[13px] font-normal text-[#201F47] mb-2">Bio</label>
                                                    <textarea
                                                        rows={3}
                                                        value={profile.bio}
                                                        onChange={e => setProfile({ ...profile, bio: e.target.value })}
                                                        className="w-full px-4 py-2.5 text-[13px] font-normal border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#088395]/10 focus:border-[#088395] transition-all bg-gray-50/50 focus:bg-white text-[#201F47] placeholder:text-gray-400 resize-none"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 pt-3 border-t border-gray-50">
                                                <button type="button" onClick={() => setIsEditing(false)} className="px-5 py-2 text-[13px] font-normal text-gray-500 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
                                                <button type="submit" className="px-5 py-2 text-[13px] font-normal text-white bg-[#088395] hover:bg-[#066f7d] rounded-xl transition-all shadow-sm shadow-[#088395]/20">Save Changes</button>
                                            </div>
                                        </form>
                                    </div>
                                ) : (
                                    <>
                                        {/* Bio Card */}
                                        <div className={`bg-white rounded-[24px] border border-gray-100 p-6 ${isMounted ? 'animate-up' : ''}`} style={{ animationDelay: '0.15s' }}>
                                            <p className="text-[12px] text-gray-400 uppercase tracking-wider font-normal mb-3">About</p>
                                            <p className="text-[14px] font-normal text-gray-600 leading-relaxed">{profile.bio}</p>
                                        </div>

                                        {/* Personal Info */}
                                        <div className={`bg-white rounded-[24px] border border-gray-100 p-6 ${isMounted ? 'animate-up' : ''}`} style={{ animationDelay: '0.2s' }}>
                                            <p className="text-[12px] text-gray-400 uppercase tracking-wider font-normal mb-5">Personal Information</p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8">
                                                {[
                                                    { label: 'Full Name', value: `${profile.firstName} ${profile.lastName}` },
                                                    { label: 'Email Address', value: profile.email },
                                                    { label: 'Phone', value: profile.phone },
                                                    { label: 'Department', value: profile.department },
                                                    { label: 'Location', value: profile.location },
                                                    { label: 'Role', value: profile.role },
                                                ].map(item => (
                                                    <div key={item.label}>
                                                        <p className="text-[11px] font-normal text-gray-400 mb-1 uppercase tracking-wide">{item.label}</p>
                                                        <p className="text-[14px] font-normal text-[#201F47]">{item.value}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Danger Zone */}
                                <div className={`bg-white rounded-[24px] border border-[#F25A5A]/20 p-5 ${isMounted ? 'animate-up' : ''}`} style={{ animationDelay: '0.25s' }}>
                                    <p className="text-[12px] text-[#F25A5A] uppercase tracking-wider font-normal mb-4">Danger Zone</p>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[14px] font-normal text-[#201F47]">Deactivate Account</p>
                                            <p className="text-[12px] font-normal text-gray-400 mt-0.5">This action cannot be undone.</p>
                                        </div>
                                        <button className="px-4 py-2 border border-[#F25A5A]/30 text-[#F25A5A] rounded-xl text-[13px] font-normal hover:bg-[#F25A5A]/5 transition-colors">
                                            Deactivate
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ── TAB: SECURITY ── */}
                        {activeTab === 'security' && (
                            <>
                                {/* Password */}
                                <div className={`bg-white rounded-[24px] border border-gray-100 p-6 ${isMounted ? 'animate-up' : ''}`} style={{ animationDelay: '0.15s' }}>
                                    <p className="text-[12px] text-gray-400 uppercase tracking-wider font-normal mb-5">Password</p>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[14px] font-normal text-[#201F47]">Account Password</p>
                                            <p className="text-[12px] font-normal text-gray-400 mt-0.5">Last changed 3 months ago. We recommend changing it regularly.</p>
                                        </div>
                                        <button className="px-4 py-2 border border-gray-200 rounded-xl text-[13px] font-normal text-gray-600 hover:text-[#201F47] hover:border-gray-300 whitespace-nowrap transition-all">Update Password</button>
                                    </div>
                                </div>

                                {/* 2FA */}
                                <div className={`bg-white rounded-[24px] border border-gray-100 p-6 ${isMounted ? 'animate-up' : ''}`} style={{ animationDelay: '0.2s' }}>
                                    <p className="text-[12px] text-gray-400 uppercase tracking-wider font-normal mb-5">Two-Factor Authentication</p>
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-[14px] font-normal text-[#201F47] mb-0.5">Authenticator App</p>
                                            <p className="text-[12px] font-normal text-gray-400">Adds a second layer of security using an authenticator app on your phone.</p>
                                        </div>
                                        <button
                                            onClick={() => setTwoFAEnabled(p => !p)}
                                            className={`relative w-12 h-6 rounded-full transition-all shrink-0 ${twoFAEnabled ? 'bg-[#088395]' : 'bg-gray-200'}`}
                                        >
                                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${twoFAEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                                        </button>
                                    </div>
                                </div>


                            </>
                        )}

                        {/* ── TAB: ACTIVITY ── */}
                        {activeTab === 'activity' && (
                            <div className={`bg-white rounded-[24px] border border-gray-100 p-6 ${isMounted ? 'animate-up' : ''}`} style={{ animationDelay: '0.15s' }}>
                                <div className="flex items-center justify-between mb-5">
                                    <p className="text-[12px] text-gray-400 uppercase tracking-wider font-normal">Recent Activity</p>
                                    <span className="text-[11px] font-normal text-gray-400">{recentActivity.length} events</span>
                                </div>
                                <div className="space-y-0.5">
                                    {recentActivity.map((event, idx) => {
                                        const config = activityTypeConfig[event.type]
                                        return (
                                            <div
                                                key={event.id}
                                                className={`flex items-start gap-3.5 p-3.5 rounded-2xl hover:bg-gray-50 transition-colors group ${isMounted ? 'animate-up' : ''}`}
                                                style={{ animationDelay: `${0.2 + idx * 0.04}s` }}
                                            >
                                                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${config.color}`}>
                                                    {config.icon}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[13px] font-normal text-[#201F47] leading-snug">{event.action}</p>
                                                    <p className="text-[11px] font-normal text-gray-400 mt-0.5">{event.time}</p>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
