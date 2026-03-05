'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { authAPI } from '@/lib/api'
import { useRouter, usePathname } from 'next/navigation'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const { user, token, setAuth, clearAuth } = useAuthStore()
    const [isHydrated, setIsHydrated] = useState(false)
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        // Zustand persist hydration happens on mount
        setIsHydrated(true)

        const validateSession = async () => {
            if (token) {
                try {
                    const userData: any = await authAPI.getMe()
                    // Update user data if it changed
                    setAuth(userData.user, token, userData.type)
                } catch (err) {
                    console.error('Session validation failed:', err)
                    clearAuth()
                    if (pathname.startsWith('/admin') || pathname.startsWith('/dashboard') || pathname.startsWith('/staff')) {
                        router.push('/login')
                    }
                }
            }
        }

        validateSession()
    }, [])

    if (!isHydrated) {
        return null // Or a loading spinner
    }

    return <>{children}</>
}
