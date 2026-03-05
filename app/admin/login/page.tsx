'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function AdminLoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    organizationCode: '',
  })
  const [error, setError] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isLogin) {
      if (!formData.email || !formData.password) { setError('Please fill in all fields'); return }
      // Role-based redirect simulation
      if (formData.email.toLowerCase() === 'staff@gmail.com') {
        window.location.href = '/staff/dashboard'
      } else {
        window.location.href = '/admin/organizations'
      }
    } else {
      if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) { setError('Please fill in all fields'); return }
      if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return }
      window.location.href = '/admin/organizations'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left panel - decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-600 via-teal-500 to-cyan-400 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 opacity-20">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-white/30"
              style={{
                width: `${(i + 1) * 120}px`,
                height: `${(i + 1) * 120}px`,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%,-50%)',
              }}
            />
          ))}
        </div>
        <div className="relative text-white text-center">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg border border-white/30">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-3">Parvah Admin</h2>
          <p className="text-teal-100 text-sm max-w-xs leading-relaxed">
            Manage organizations, track civic issues, and coordinate staff with ease.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4 text-center">
            {[['1,234', 'Issues Tracked'], ['48', 'Staff Members'], ['3', 'Organizations']].map(([val, label]) => (
              <div key={label} className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/20">
                <p className="text-xl font-bold">{val}</p>
                <p className="text-teal-100 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-gray-900">Parvah</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">{isLogin ? 'Welcome back' : 'Create account'}</h1>
          <p className="text-sm text-gray-400 mb-8">{isLogin ? 'Sign in to your admin account.' : 'Set up your admin account.'}</p>

          {/* Toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            {['Sign In', 'Register'].map((tab, idx) => (
              <button
                key={tab}
                onClick={() => { setIsLogin(idx === 0); setError('') }}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${(isLogin ? idx === 0 : idx === 1)
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name</label>
                <input
                  name="fullName" type="text" placeholder="Your full name"
                  value={formData.fullName} onChange={handleInputChange}
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all bg-white"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address</label>
              <input
                name="email" type="email" placeholder="admin@example.com"
                value={formData.email} onChange={handleInputChange}
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all bg-white"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-600">Password</label>
                {isLogin && <button type="button" className="text-xs text-teal-600 hover:text-teal-700 font-medium transition-colors">Forgot?</button>}
              </div>
              <input
                name="password" type="password" placeholder="••••••••"
                value={formData.password} onChange={handleInputChange}
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all bg-white"
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Confirm Password</label>
                <input
                  name="confirmPassword" type="password" placeholder="••••••••"
                  value={formData.confirmPassword} onChange={handleInputChange}
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all bg-white"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl shadow-sm transition-colors mt-2"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 space-y-2 text-center">
            <p className="text-sm text-gray-400">
              Not an admin?{' '}
              <Link href="/login" className="text-teal-600 hover:text-teal-700 font-semibold transition-colors">Citizen Login</Link>
            </p>
            <p className="text-xs text-gray-300 mt-2">
              Staff members: use email <span className="font-medium text-gray-400">staff@gmail.com</span> to sign in
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
