'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function UserLoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
  })
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isLogin) {
      if (!formData.email || !formData.password) { setError('Please fill in all fields'); return }
      window.location.href = '/dashboard'
    } else {
      if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword || !formData.phone) {
        setError('Please fill in all fields'); return
      }
      if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return }
      window.location.href = '/dashboard'
    }
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-600 via-teal-500 to-cyan-400 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute rounded-full border border-white/40"
              style={{ width: `${(i + 1) * 130}px`, height: `${(i + 1) * 130}px`, top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
          ))}
        </div>
        <div className="relative text-white text-center max-w-xs">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg border border-white/30">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-3">Citizen Portal</h2>
          <p className="text-teal-100 text-sm leading-relaxed">
            Report civic issues in your community and track their resolution in real time.
          </p>
          <div className="mt-10 space-y-3">
            {[
              ['📍', 'Report issues with exact location'],
              ['📊', 'Track resolution progress live'],
              ['🔔', 'Get notified on status updates'],
              ['💬', 'Add comments and follow-ups'],
            ].map(([icon, text]) => (
              <div key={text} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-white/20">
                <span className="text-base">{icon}</span>
                <p className="text-teal-50 text-xs font-medium">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-gray-900">Parvah</span>
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">{isLogin ? 'Welcome back' : 'Create account'}</h1>
          <p className="text-sm text-gray-400 mb-8">
            {isLogin ? 'Sign in to track your civic issues.' : 'Join and start reporting issues in your community.'}
          </p>

          {/* Toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            {[['Sign In', true], ['Register', false]].map(([label, val]) => (
              <button key={String(label)} onClick={() => { setIsLogin(val as boolean); setError('') }}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${isLogin === val ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                  }`}>
                {label}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name</label>
                  <input name="fullName" type="text" placeholder="Your full name"
                    value={formData.fullName} onChange={handleChange}
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phone Number</label>
                  <input name="phone" type="tel" placeholder="+91 98765 43210"
                    value={formData.phone} onChange={handleChange}
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all bg-white" />
                </div>
              </>
            )}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address</label>
              <input name="email" type="email" placeholder="citizen@example.com"
                value={formData.email} onChange={handleChange}
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all bg-white" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
              <input name="password" type="password" placeholder="••••••••"
                value={formData.password} onChange={handleChange}
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all bg-white" />
            </div>
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Confirm Password</label>
                <input name="confirmPassword" type="password" placeholder="••••••••"
                  value={formData.confirmPassword} onChange={handleChange}
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all bg-white" />
              </div>
            )}
            <button type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl shadow-sm transition-colors mt-2">
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 space-y-2 text-center">
            <p className="text-sm text-gray-400">
              Admin?{' '}
              <Link href="/admin/login" className="text-teal-600 hover:text-teal-700 font-semibold transition-colors">Admin Login</Link>
            </p>
            <p className="text-sm text-gray-400">
              Staff?{' '}
              <Link href="/staff/login" className="text-teal-600 hover:text-teal-700 font-semibold transition-colors">Staff Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
