'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-cyan-50">
      {/* Header */}
      <header className="border-b border-border bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-foreground">Parvah</span>
          </Link>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link href="/admin/login">Admin</Link>
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
              <Link href="/login">Citizen Login</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 text-balance">
            Civic Issues, Simplified
          </h1>
          <p className="text-xl text-muted-foreground mb-8 text-balance">
            Parvah is a comprehensive civic issue tracking and management platform connecting citizens, administrators, and staff to resolve community problems efficiently.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
              <Link href="/login">Report an Issue</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/admin/login">Admin Portal</Link>
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          <Card className="p-6 border-0 shadow-md hover:shadow-lg transition-all">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">For Citizens</h3>
            <p className="text-muted-foreground mb-4">
              Easily report civic issues in your community, track their progress, and stay updated with real-time notifications.
            </p>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/login">Citizen Portal</Link>
            </Button>
          </Card>

          <Card className="p-6 border-0 shadow-md hover:shadow-lg transition-all">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">For Administrators</h3>
            <p className="text-muted-foreground mb-4">
              Manage organizations, coordinate staff, and oversee all civic issues through an intuitive Kanban board.
            </p>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/admin/login">Admin Portal</Link>
            </Button>
          </Card>

          <Card className="p-6 border-0 shadow-md hover:shadow-lg transition-all">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">For Staff</h3>
            <p className="text-muted-foreground mb-4">
              Receive issue assignments, update progress, and mark tasks as completed with detailed notes.
            </p>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/staff/register">Staff Registration</Link>
            </Button>
          </Card>
        </div>

        {/* How It Works Section */}
        <div className="bg-white rounded-lg border border-border p-12 mb-20">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">How Parvah Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                number: '1',
                title: 'Report Issues',
                description: 'Citizens report civic problems with location, category, and priority details.'
              },
              {
                number: '2',
                title: 'Manage & Assign',
                description: 'Admins review issues and assign them to appropriate staff members via dashboard.'
              },
              {
                number: '3',
                title: 'Resolve & Track',
                description: 'Staff update progress and mark issues complete. Citizens receive real-time updates.'
              },
            ].map((step, idx) => (
              <div key={idx} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-8 text-center mb-20">
          <h3 className="text-xl font-bold text-foreground mb-4">Test the Platform</h3>
          <p className="text-muted-foreground mb-6">
            You can access all portals with the login pages. No credentials needed - just click to access the dashboards!
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
              <Link href="/admin/login">Try Admin Portal</Link>
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
              <Link href="/login">Try Citizen Portal</Link>
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
              <Link href="/staff/register">Try Staff Registration</Link>
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-white/50 backdrop-blur-sm py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground mb-2">
            Parvah - Civic Issue Tracking and Management Platform
          </p>
          <p className="text-xs text-muted-foreground">
            © 2024 Parvah. All rights reserved. | Frontend UI Implementation
          </p>
        </div>
      </footer>
    </div>
  )
}
