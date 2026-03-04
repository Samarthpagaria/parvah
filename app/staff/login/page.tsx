'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function StaffLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [staffCode, setStaffCode] = useState('')
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Please fill in all fields'); return }
    localStorage.setItem('staffUser', JSON.stringify({ email, type: 'staff' }))
    router.push('/staff/dashboard')
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password || !staffCode) { setError('Please fill in all fields'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    localStorage.setItem('staffUser', JSON.stringify({ email, staffCode, type: 'staff' }))
    router.push('/staff/dashboard')
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-purple-500 to-blue-500 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 opacity-20">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="absolute rounded-full border border-white/30"
              style={{ width: `${(i + 1) * 120}px`, height: `${(i + 1) * 120}px`, top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
          ))}
        </div>
        <div className="relative text-white text-center">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg border border-white/30">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-3">Staff Portal</h2>
          <p className="text-purple-100 text-sm max-w-xs leading-relaxed">
            View your assigned issues, update progress, and mark civic problems as resolved.
          </p>
          <div className="mt-10 bg-white/10 rounded-2xl p-5 backdrop-blur-sm border border-white/20 text-left">
            {[
              'View all your assigned issues',
              'Update issue status with notes',
              'Get notified on new assignments',
              'Mark completed tasks as resolved',
            ].map(f => (
              <div key={f} className="flex items-center gap-2.5 py-2">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-purple-100 text-xs">{f}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-gray-900">Parvah Staff</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">{activeTab === 'login' ? 'Staff sign in' : 'Create staff account'}</h1>
          <p className="text-sm text-gray-400 mb-8">{activeTab === 'login' ? 'Access your assigned issues.' : 'Register with your staff code.'}</p>

          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            {[['login', 'Sign In'], ['register', 'Register']].map(([tab, label]) => (
              <button key={tab} onClick={() => { setActiveTab(tab as 'login' | 'register'); setError('') }}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                {label}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm">{error}</div>
          )}

          {activeTab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address</label>
                <input type="email" placeholder="staff@example.com" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all bg-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
                <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all bg-white" />
              </div>
              <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl shadow-sm transition-colors">Sign In</button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address</label>
                <input type="email" placeholder="staff@example.com" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all bg-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Staff Invite Code</label>
                <input type="text" placeholder="e.g., STAFF-2024-XYZ" value={staffCode} onChange={e => setStaffCode(e.target.value)}
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all bg-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
                <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all bg-white" />
              </div>
              <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl shadow-sm transition-colors">Create Account</button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200 space-y-2 text-center">
            <p className="text-sm text-gray-400">Not a staff member? <Link href="/login" className="text-purple-600 hover:text-purple-700 font-semibold transition-colors">Citizen Portal</Link></p>
            <p className="text-sm text-gray-400">Admin? <Link href="/admin/login" className="text-purple-600 hover:text-purple-700 font-semibold transition-colors">Admin Login</Link></p>
          </div>
        </div>
      </div>
    </div>
  )
}
