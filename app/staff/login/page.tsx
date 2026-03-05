'use client'

import { useEffect } from 'react'

// Staff now log in through the shared Admin Login page.
// staff@gmail.com → redirected to /staff/dashboard automatically.
export default function StaffLoginRedirect() {
  useEffect(() => {
    window.location.replace('/admin/login')
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-400">Redirecting to login...</p>
      </div>
    </div>
  )
}
