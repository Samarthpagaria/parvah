'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface OrgSidebarProps {
    orgId: string
    orgName: string
    role?: 'owner' | 'edit' | 'read' | 'staff'
}

const navItems = [
    {
        label: 'Analytics',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
        href: (id: string) => `/admin/organizations/${id}/dashboard`,
        key: 'dashboard',
    },
    {
        label: 'Board',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
        ),
        href: (id: string) => `/admin/organizations/${id}/kanban`,
        key: 'kanban',
    },
    {
        label: 'Members',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
        href: (id: string) => `/admin/organizations/${id}/members`,
        key: 'members',
    },
    {
        label: 'Categories',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
        ),
        href: (id: string) => `/admin/organizations/${id}/categories`,
        key: 'categories',
    },
    {
        label: 'Settings',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
        href: (id: string) => `/admin/organizations/${id}/settings`,
        key: 'settings',
    },
]

export default function OrgSidebar({ orgId, orgName, role }: OrgSidebarProps) {
    const pathname = usePathname()

    const filteredNavItems = navItems.filter(item => {
        if (role === 'staff') {
            return ['dashboard', 'kanban'].includes(item.key)
        }
        if (role === 'read') {
            return ['dashboard', 'kanban', 'categories'].includes(item.key)
        }
        return true
    })

    const isActive = (key: string) => {
        if (key === 'dashboard') return pathname.includes('/dashboard')
        return pathname.includes(`/${key}`)
    }

    return (
        <aside className="w-64 min-h-screen bg-white border-r border-gray-100 flex flex-col shadow-sm">
            {/* Logo */}
            <div className="px-5 pt-5 pb-4 border-b border-gray-50">
                <Link href="/admin/organizations" className="flex items-center gap-0.5 select-none group w-fit">
                    <span className="text-[17px] font-normal tracking-[-0.04em] text-[#201F47]">par</span><span className="text-[17px] font-normal tracking-[-0.04em] text-[#088395]">vah</span><span className="w-1.5 h-1.5 rounded-full bg-[#088395] mb-0.5 ml-0.5 self-end shrink-0 group-hover:scale-125 transition-transform" />
                </Link>
            </div>

            {/* Org Header */}
            <div className="px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center shadow-sm">
                        <span className="text-white font-bold text-sm">{(orgName || 'O').charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{orgName || 'Loading...'}</p>
                        <p className="text-xs text-gray-400">Organization</p>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-3 space-y-0.5">
                <p className="px-3 pt-3 pb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Navigation</p>
                {filteredNavItems.map((item) => {
                    const active = isActive(item.key)
                    return (
                        <Link
                            key={item.key}
                            href={item.href(orgId)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${active
                                ? 'bg-teal-50 text-teal-700'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <span className={`transition-colors ${active ? 'text-teal-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                                {item.icon}
                            </span>
                            {item.label}
                            {active && (
                                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-500" />
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* Bottom: Profile & Exit */}
            <div className="p-3 border-t border-gray-100 space-y-0.5">
                <Link
                    href="/admin/profile"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all"
                >
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                </Link>
                <Link
                    href="/admin/organizations"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-50 hover:text-red-600 transition-all"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Exit Organization
                </Link>
            </div>
        </aside>
    )
}
