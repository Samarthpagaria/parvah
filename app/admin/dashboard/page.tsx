'use client'

import { useEffect } from 'react'

export default function AdminDashboardRedirect() {
  useEffect(() => {
    window.location.replace('/admin/organizations')
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-400">Redirecting...</p>
      </div>
    </div>
  )
}
