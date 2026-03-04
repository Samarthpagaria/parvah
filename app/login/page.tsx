'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

export default function UserLoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    address: '',
    organization: '',
  })
  const [error, setError] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (isLogin) {
      if (!formData.email || !formData.password) {
        setError('Please fill in all fields')
        return
      }
      // Mock login - redirect to user dashboard
      window.location.href = '/dashboard'
    } else {
      if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword || !formData.phone || !formData.address || !formData.organization) {
        setError('Please fill in all fields')
        return
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match')
        return
      }
      // Mock registration - redirect to user dashboard
      window.location.href = '/dashboard'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-b from-aqua-100 to-transparent rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-t from-teal-100 to-transparent rounded-full blur-3xl opacity-30"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg mb-4">
            <span className="text-2xl font-bold text-white">C</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Parvah</h1>
          <p className="text-gray-600">Citizen Portal</p>
        </div>

        {/* Card */}
        <Card className="p-6 shadow-xl border-0 bg-white">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 bg-white rounded-xl p-1 shadow-sm border border-teal-100">
            <button
              onClick={() => {
                setIsLogin(true)
                setError('')
                setFormData({ email: '', password: '', confirmPassword: '', fullName: '', phone: '', address: '', organization: '' })
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${isLogin
                  ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsLogin(false)
                setError('')
                setFormData({ email: '', password: '', confirmPassword: '', fullName: '', phone: '', address: '', organization: '' })
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${!isLogin
                  ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <Label htmlFor="fullName" className="text-sm font-medium text-gray-700 mb-2 block">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="border-teal-200 focus:border-teal-500 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-2 block">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="border-teal-200 focus:border-teal-500 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <Label htmlFor="address" className="text-sm font-medium text-gray-700 mb-2 block">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    type="text"
                    placeholder="Enter your address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="border-teal-200 focus:border-teal-500 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <Label htmlFor="organization" className="text-sm font-medium text-gray-700 mb-2 block">Organization Name</Label>
                  <Input
                    id="organization"
                    name="organization"
                    type="text"
                    placeholder="Enter your organization name"
                    value={formData.organization}
                    onChange={handleInputChange}
                    className="border-teal-200 focus:border-teal-500 focus:ring-teal-500"
                  />
                </div>
              </>
            )}

            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="citizen@example.com"
                value={formData.email}
                onChange={handleInputChange}
                className="border-teal-200 focus:border-teal-500 focus:ring-teal-500"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium text-gray-700 mb-2 block">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                className="border-teal-200 focus:border-teal-500 focus:ring-teal-500"
              />
            </div>

            {!isLogin && (
              <div>
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 mb-2 block">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="border-teal-200 focus:border-teal-500 focus:ring-teal-500"
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-medium py-2 rounded-lg shadow-md transition-all"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-center text-sm text-gray-600">
              Are you an admin?{' '}
              <Link href="/admin/login" className="text-teal-600 hover:text-teal-700 font-medium">
                Admin Login
              </Link>
            </p>
          </div>
        </Card>

        {/* Links */}
        <div className="mt-8 text-center text-sm text-gray-600 space-y-2">
          <p>Are you an admin?{' '}
            <Link href="/admin/login" className="text-teal-600 hover:text-teal-700 font-medium">
              Admin Login
            </Link>
          </p>
          <p>Staff member?{' '}
            <Link href="/staff/login" className="text-teal-600 hover:text-teal-700 font-medium">
              Staff Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
