'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-0.5 select-none group">
            <span className="text-[20px] font-normal tracking-[-0.04em] text-[#201F47]">par</span><span className="text-[20px] font-normal tracking-[-0.04em] text-[#088395]">vah</span><span className="w-1.5 h-1.5 rounded-full bg-[#088395] mb-0.5 ml-0.5 self-end shrink-0 group-hover:scale-125 transition-transform" />
          </Link>
          <div className="flex gap-2">
            <Link href="/admin/login">
              <Button variant="outline" className="rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium">
                Admin
              </Button>
            </Link>
            <Link href="/login">
              <Button className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium shadow-sm">
                Citizen Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main>
        <section className="max-w-7xl mx-auto px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-teal-100">
            <span className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
            Civic Issue Management Platform
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
            Track. Manage.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-500">Resolve.</span>
          </h1>
          <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Parvah connects citizens, administrators, and staff to resolve community problems efficiently — with real-time tracking, Kanban workflows, and role-based access.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/login">
              <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-8 shadow-sm font-medium">
                Report an Issue
              </Button>
            </Link>
            <Link href="/admin/login">
              <Button size="lg" variant="outline" className="rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50 px-8 font-medium">
                Admin Portal
              </Button>
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-7xl mx-auto px-6 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: (
                  <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                ),
                title: 'For Citizens',
                description: 'Report civic issues in seconds. Attach location, photos, and priority. Track resolution in real-time.',
                href: '/login',
                cta: 'Citizen Portal',
                color: 'bg-teal-50 border-teal-100',
              },
              {
                icon: (
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
                title: 'For Administrators',
                description: 'Manage multiple organizations. Assign issues to staff via Kanban boards. Invite members with role-based access.',
                href: '/admin/login',
                cta: 'Admin Portal',
                color: 'bg-blue-50 border-blue-100',
              },
              {
                icon: (
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                ),
                title: 'For Staff',
                description: 'View assigned issues clearly. Update status with notes. Mark jobs complete and close the loop.',
                href: '/staff/register',
                cta: 'Staff Portal',
                color: 'bg-purple-50 border-purple-100',
              },
            ].map(f => (
              <div key={f.title} className={`rounded-2xl border ${f.color} p-6`}>
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm border border-white">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 mb-5 leading-relaxed">{f.description}</p>
                <Link href={f.href} className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-teal-600 transition-colors">
                  {f.cta}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="bg-gray-50 border-t border-gray-100">
          <div className="max-w-5xl mx-auto px-6 py-20 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-12">How Parvah Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { num: '1', title: 'Report Issues', desc: 'Citizens submit civic issues with location, priority, and category.' },
                { num: '2', title: 'Manage & Assign', desc: 'Admins review on a Kanban board and assign issues to qualified staff.' },
                { num: '3', title: 'Resolve & Track', desc: 'Staff update progress and close issues. Citizens see status changes live.' },
              ].map(s => (
                <div key={s.num} className="text-center">
                  <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold mx-auto mb-4 shadow-sm">{s.num}</div>
                  <h3 className="font-semibold text-gray-800 mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="bg-gradient-to-r from-teal-600 to-cyan-500 rounded-3xl p-10 text-center text-white shadow-lg">
            <h3 className="text-2xl font-bold mb-2">Ready to explore?</h3>
            <p className="text-teal-100 mb-8 text-sm">Try any of the portals — no credentials required for the demo.</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link href="/admin/login">
                <button className="bg-white text-teal-700 hover:bg-teal-50 font-semibold px-6 py-2.5 rounded-xl text-sm shadow-sm transition-colors">Try Admin Portal</button>
              </Link>
              <Link href="/login">
                <button className="bg-white/20 hover:bg-white/30 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors border border-white/20">Citizen Portal</button>
              </Link>
              <Link href="/staff/register">
                <button className="bg-white/20 hover:bg-white/30 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors border border-white/20">Staff Portal</button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-0.5 select-none">
            <span className="text-[15px] font-normal tracking-[-0.04em] text-[#201F47]">par</span><span className="text-[15px] font-normal tracking-[-0.04em] text-[#088395]">vah</span><span className="w-1 h-1 rounded-full bg-[#088395] mb-0.5 ml-0.5 self-end shrink-0" />
          </div>
          <p className="text-xs text-gray-400">© 2024 Parvah. Civic Issue Tracking & Management Platform.</p>
        </div>
      </footer>
    </div>
  )
}
