'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const mockOrgs = [
  {
    id: 'org-1',
    name: 'City Municipality',
    slug: 'city-municipality',
    description: 'Premier administration for urban infrastructure, development, and civic monitoring services.',
    industry: 'Government',
    iconColor: 'text-[#088395]',
    iconBg: 'bg-[#088395]/10',
    iconName: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    stats: {
      issues: 34,
      members: 12
    }
  },
  {
    id: 'org-2',
    name: 'Water Department',
    slug: 'water-department',
    description: 'Core management of water resources, distribution networks, and sanitation facilities.',
    industry: 'Utilities',
    iconColor: 'text-[#576CDB]',
    iconBg: 'bg-[#576CDB]/10',
    iconName: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z',
    stats: {
      issues: 18,
      members: 8
    }
  },
  {
    id: 'org-3',
    name: 'Waste Management',
    slug: 'waste-management',
    description: 'Next-gen environmental cleanup, recycling operations, and waste-to-energy monitoring.',
    industry: 'Environment',
    iconColor: 'text-[#7AB2B2]',
    iconBg: 'bg-[#7AB2B2]/10',
    iconName: 'M4 4h16v2H4V4zm2 4h12v14a2 2 0 01-2 2H8a2 2 0 01-2-2V8zm5 3v8h2v-8h-2z',
    stats: {
      issues: 9,
      members: 6
    }
  },
]

export default function OrganizationsPage() {
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  const [isMounted, setIsMounted] = useState(false)
  const [showNotifs, setShowNotifs] = useState(false)

  const notifications = [
    { id: 1, title: 'New issue reported', desc: 'Pothole on Ring Road, City Municipality', time: '2m ago', unread: true, color: 'bg-[#F25A5A]' },
    { id: 2, title: 'Issue resolved', desc: 'Gutter Cleaning marked done by Tom Davis', time: '1h ago', unread: true, color: 'bg-emerald-500' },
    { id: 3, title: 'Member invited', desc: 'Priya Mehta joined Waste Management', time: '3h ago', unread: false, color: 'bg-[#576CDB]' },
    { id: 4, title: 'Status updated', desc: 'Water Pipe Leak moved to In Review', time: 'Yesterday', unread: false, color: 'bg-[#088395]' },
  ]

  const unreadCount = notifications.filter(n => n.unread).length

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const filtered = mockOrgs.filter(o =>
    (o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.industry.toLowerCase().includes(search.toLowerCase())) &&
    (activeFilter === 'All' || o.industry === activeFilter)
  )

  return (
    <div className="min-h-screen bg-[#F9F9FB] text-[#201F47] font-sans pb-16">
      {/* Navigation */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-0.5 select-none group">
            <span className="text-[18px] font-normal tracking-[-0.04em] text-[#201F47] transition-colors group-hover:text-[#201F47]">par</span><span className="text-[18px] font-normal tracking-[-0.04em] text-[#088395]">vah</span><span className="w-1.5 h-1.5 rounded-full bg-[#088395] mb-0.5 ml-0.5 self-end shrink-0 group-hover:scale-125 transition-transform" />
          </Link>

          <div className="flex items-center gap-4">
            {/* Notification Icon with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifs(v => !v)}
                className="relative text-[#94a3b8] hover:text-[#201F47] transition-colors pr-2 border-r border-gray-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-0.5 min-w-[16px] h-4 px-1 bg-[#F25A5A] rounded-full border-2 border-white flex items-center justify-center text-[9px] font-normal text-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Panel */}
              {showNotifs && (
                <>
                  {/* Backdrop to close on click outside */}
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifs(false)} />
                  <div className="absolute right-2 top-10 w-[340px] bg-white rounded-[20px] border border-gray-100 shadow-2xl shadow-gray-200/60 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                      <div>
                        <h3 className="text-[15px] font-normal text-[#201F47]">Notifications</h3>
                        <p className="text-[11px] font-normal text-gray-400 mt-0.5">{unreadCount} unread</p>
                      </div>
                      <button className="text-[12px] font-normal text-[#088395] hover:text-[#066472] transition-colors">
                        Mark all read
                      </button>
                    </div>

                    {/* Notification list */}
                    <div className="divide-y divide-gray-50">
                      {notifications.map(n => (
                        <div
                          key={n.id}
                          className={`flex items-start gap-3.5 px-5 py-4 hover:bg-gray-50/60 transition-colors cursor-pointer ${n.unread ? 'bg-[#F9F9FB]' : 'bg-white'}`}
                        >
                          <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${n.unread ? n.color : 'bg-gray-200'}`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-[13px] font-normal leading-tight mb-0.5 ${n.unread ? 'text-[#201F47]' : 'text-gray-500'}`}>
                              {n.title}
                            </p>
                            <p className="text-[12px] font-normal text-gray-400 leading-relaxed truncate">{n.desc}</p>
                            <p className="text-[11px] font-normal text-gray-300 mt-1">{n.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-3 border-t border-gray-50 text-center">
                      <button className="text-[12px] font-normal text-gray-400 hover:text-[#201F47] transition-colors">View all notifications</button>
                    </div>
                  </div>
                </>
              )}
            </div>
            <button className="text-[#94a3b8] hover:text-[#201F47] transition-colors font-normal text-sm">
              Administrator
            </button>
            <Link href="/admin/profile" className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#088395]/10 text-[#088395] font-normal text-sm hover:ring-2 hover:ring-[#088395]/20 transition-all">
              SA
            </Link>
            <button 
              onClick={() => window.location.href = '/admin/login'}
              className="text-[#94a3b8] hover:text-[#F25A5A] transition-colors font-normal text-[11px] uppercase tracking-widest pl-4 border-l border-gray-200"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Header Section */}
        <div className={`flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 transition-all duration-700 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div>
            <h1 className="text-3xl font-normal tracking-tight text-[#201F47] mb-2">Organizations</h1>
            <p className="text-base font-normal text-[#94a3b8]">Manage and oversee all registered infrastructure nodes.</p>
          </div>
          <Link 
            href="/admin/organizations/new" 
            className="bg-[#F25A5A] hover:bg-[#e04f4f] text-white px-6 py-2.5 rounded-2xl font-normal text-sm transition-all flex items-center gap-2 shadow-sm shadow-[#F25A5A]/20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7H5"/></svg>
            New Organization
          </Link>
        </div>

        {/* Filter & Search */}
        <div className={`flex flex-wrap items-center justify-between gap-4 mb-10 transition-all duration-700 delay-100 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex gap-2">
            {['All', 'Government', 'Utilities', 'Environment'].map(f => (
              <button 
                key={f} 
                onClick={() => setActiveFilter(f)} 
                className={`px-4 py-2 rounded-2xl text-sm font-normal transition-all ${
                  activeFilter === f 
                    ? 'bg-[#201F47] text-white shadow-sm' 
                    : 'bg-white border border-gray-200 text-[#94a3b8] hover:bg-gray-50'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          
          <div className="relative max-w-xs w-full">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input 
              type="text" 
              placeholder="Search organizations..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl outline-none text-sm font-normal text-[#201F47] placeholder:text-gray-400 focus:border-[#088395] focus:ring-4 focus:ring-[#088395]/10 transition-all" 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
        </div>

        {/* Bento Grid layout for cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {filtered.map((org, index) => (
            <div 
              key={org.id} 
              className={`group bg-white rounded-[24px] border border-gray-100 p-6 flex flex-col hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              style={{ transitionDelay: `${150 + index * 50}ms` }}
            >
              {/* Card Header */}
              <div className="flex justify-between items-start mb-5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${org.iconBg}`}>
                  <svg className={`w-5 h-5 ${org.iconColor}`} fill="currentColor" viewBox="0 0 24 24">
                    <path d={org.iconName} />
                  </svg>
                </div>
                
                {/* Next button replacing edit option */}
                <Link 
                  href={`/admin/organizations/${org.id}/dashboard`}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-[#201F47] text-white opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 shadow-md shadow-[#201F47]/20"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              {/* Title & Description */}
              <div className="flex-1 mb-[18px]">
                <h3 className="text-[17px] leading-tight font-normal text-[#201F47] mb-2">
                  {org.name}
                </h3>
                <p className="text-[13px] leading-relaxed font-normal text-[#94a3b8] line-clamp-2">
                  {org.description}
                </p>
              </div>

              {/* Clean minimal statistics */}
              <div className="flex items-center gap-4 mb-5 pt-4 border-t border-gray-50">
                <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                    <span className="text-[13px] font-normal text-gray-500">{org.stats.issues} Issues</span>
                </div>
                <div className="flex items-center gap-1.5 border-l border-gray-100 pl-4">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                    <span className="text-[13px] font-normal text-gray-500">{org.stats.members} Staff</span>
                </div>
              </div>

              {/* Actions */}
              <div>
                <Link 
                  href={`/admin/organizations/${org.id}/dashboard`}
                  className="block w-full text-center py-2.5 rounded-xl bg-[#F9F9FB] text-[#201F47] text-sm font-normal hover:bg-[#f0f2f5] transition-colors"
                >
                  Learn more
                </Link>
              </div>
            </div>
          ))}

          {/* Add New Node Card */}
          <Link 
            href="/admin/organizations/new" 
            className={`bg-white rounded-[24px] border border-dashed border-gray-200 p-6 flex flex-col items-center justify-center min-h-[300px] hover:border-[#F25A5A]/30 hover:bg-[#F25A5A]/5 transition-all duration-300 group ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ transitionDelay: `${150 + filtered.length * 50}ms` }}
          >
            <div className="w-12 h-12 rounded-xl bg-[#F9F9FB] border border-gray-100 flex items-center justify-center text-[#94a3b8] group-hover:bg-[#F25A5A]/10 group-hover:text-[#F25A5A] group-hover:scale-110 transition-all duration-300 mb-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="text-base font-normal text-[#201F47]">Add New Node</h3>
            <p className="text-sm font-normal text-[#94a3b8] mt-1">Create organization</p>
          </Link>
        </div>
      </main>
    </div>
  )
}
