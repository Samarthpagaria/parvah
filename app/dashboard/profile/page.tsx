'use client'

import Link from 'next/link'

export default function ProfilePage() {
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
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center text-white font-bold text-xl shadow-sm">JD</div>
                    <div>
                        <p className="font-bold text-gray-900">John Doe</p>
                        <p className="text-sm text-gray-500">john.doe@example.com</p>
                        <span className="inline-block mt-1 text-[10px] font-semibold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">Citizen</span>
                    </div>
                </div>

                {/* Info form */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-50">
                        <h2 className="text-sm font-semibold text-gray-700">Personal Information</h2>
                    </div>
                    <div className="px-5 py-5 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Full Name</label>
                                <input defaultValue="John Doe" className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Phone</label>
                                <input defaultValue="+91 98765 43210" className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email Address</label>
                            <input type="email" defaultValue="john.doe@example.com" className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Address</label>
                            <input defaultValue="12B, MG Road, Koramangala, Bengaluru" className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all" />
                        </div>
                    </div>
                    <div className="px-5 py-4 bg-gray-50/50 flex justify-between items-center">
                        <button className="text-sm font-semibold text-red-500 hover:text-red-600 transition-colors"
                            onClick={() => window.location.href = '/login'}>
                            Log Out
                        </button>
                        <button className="px-5 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-colors">
                            Save Changes
                        </button>
                    </div>
                </div>
            </main>
        </div>
    )
}
