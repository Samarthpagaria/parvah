import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const token = request.cookies.get('parvah_token')?.value
    const userType = request.cookies.get('parvah_user_type')?.value
    const { pathname } = request.nextUrl

    // 1. Protection for /admin routes
    if (pathname.startsWith('/admin')) {
        // Exception: /admin/login is the entry point
        if (pathname === '/admin/login') {
            // If already logged in as admin, redirect to organizations
            if (token && userType === 'admin') {
                return NextResponse.redirect(new URL('/admin/organizations', request.url))
            }
            return NextResponse.next()
        }

        // Require admin token for all other /admin routes
        if (!token || userType !== 'admin') {
            return NextResponse.redirect(new URL('/admin/login', request.url))
        }
    }

    // 2. Protection for /staff routes
    if (pathname.startsWith('/staff')) {
        if (pathname === '/staff/login') {
            if (token && userType === 'admin') {
                return NextResponse.redirect(new URL('/staff/dashboard', request.url))
            }
            return NextResponse.next()
        }

        if (!token || userType !== 'admin') {
            return NextResponse.redirect(new URL('/staff/login', request.url))
        }
    }

    // 3. Protection for /dashboard (Public User)
    if (pathname.startsWith('/dashboard')) {
        if (!token || userType !== 'public') {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    // 4. Redirect logged-in users away from /login or /admin/login
    if (pathname === '/login') {
        if (token && userType === 'public') {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    }

    return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: [
        '/admin/:path*',
        '/staff/:path*',
        '/dashboard/:path*',
        '/login',
    ],
}
