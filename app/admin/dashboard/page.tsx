'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import AdminHeader from '@/components/admin/AdminHeader'
import ActionCard from '@/components/admin/ActionCard'
import OrganizationModal from '@/components/admin/modals/OrganizationModal'
import AddAdminModal from '@/components/admin/modals/AddAdminModal'
import AddStaffModal from '@/components/admin/modals/AddStaffModal'

export default function AdminDashboard() {
  const [selectedOrg, setSelectedOrg] = useState('org-1')
  const [showOrgModal, setShowOrgModal] = useState(false)
  const [showAdminModal, setShowAdminModal] = useState(false)
  const [showStaffModal, setShowStaffModal] = useState(false)

  // Mock data
  const organizations = [
    { id: 'org-1', name: 'City Municipality', code: 'CM001' },
    { id: 'org-2', name: 'Water Department', code: 'WD001' },
    { id: 'org-3', name: 'Waste Management', code: 'WM001' },
  ]

  const handleViewKanban = () => {
    window.location.href = `/admin/organization/${selectedOrg}/kanban`
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />

      <main className="container mx-auto px-4 py-8">
        {/* Organization Selector */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Select Organization</h2>
          <div className="flex gap-4 flex-wrap">
            {organizations.map(org => (
              <button
                key={org.id}
                onClick={() => setSelectedOrg(org.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedOrg === org.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-border'
                  }`}
              >
                {org.name}
              </button>
            ))}
          </div>
        </div>

        {/* Organization Info */}
        <Card className="p-6 mb-8 border-0 shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-bold text-foreground">
                {organizations.find(o => o.id === selectedOrg)?.name}
              </h3>
              <p className="text-muted-foreground mt-2">
                Organization Code: {organizations.find(o => o.id === selectedOrg)?.code}
              </p>
            </div>
            <Button
              onClick={handleViewKanban}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              View Kanban Board
            </Button>
          </div>
        </Card>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/admin/organizations/new" className="block group">
            <ActionCard
              icon="building"
              title="Create Organization"
              description="Register a new entity for issue tracking"
              color="from-blue-50 to-blue-100"
              className="h-full border-slate-200 group-hover:border-blue-300 transition-all group-hover:shadow-lg rounded-2xl"
            />
          </Link>

          <Link href={`/admin/organization/${selectedOrg}/members`} className="block group">
            <ActionCard
              icon="users"
              title="Manage Members"
              description="Invite and manage admin roles for this org"
              color="from-purple-50 to-purple-100"
              className="h-full border-slate-200 group-hover:border-purple-300 transition-all group-hover:shadow-lg rounded-2xl"
            />
          </Link>

          <div onClick={() => setShowAdminModal(true)} className="cursor-pointer group">
            <ActionCard
              icon="user-plus"
              title="Quick Add Admin"
              description="Assign a new admin to the system"
              color="from-teal-50 to-teal-100"
              className="h-full border-slate-200 group-hover:border-teal-300 transition-all group-hover:shadow-lg rounded-2xl"
            />
          </div>

          <div onClick={() => setShowStaffModal(true)} className="cursor-pointer group">
            <ActionCard
              icon="users"
              title="Quick Add Staff"
              description="Add staff members to handle issues"
              color="from-cyan-50 to-cyan-100"
              className="h-full border-slate-200 group-hover:border-cyan-300 transition-all group-hover:shadow-lg rounded-2xl"
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
          <Card className="p-6 border-0 shadow-md">
            <p className="text-muted-foreground text-sm font-medium">Total Issues</p>
            <p className="text-4xl font-bold text-primary mt-2">1,234</p>
          </Card>
          <Card className="p-6 border-0 shadow-md">
            <p className="text-muted-foreground text-sm font-medium">Open Issues</p>
            <p className="text-4xl font-bold text-secondary mt-2">342</p>
          </Card>
          <Card className="p-6 border-0 shadow-md">
            <p className="text-muted-foreground text-sm font-medium">In Progress</p>
            <p className="text-4xl font-bold text-accent mt-2">156</p>
          </Card>
          <Card className="p-6 border-0 shadow-md">
            <p className="text-muted-foreground text-sm font-medium">Resolved</p>
            <p className="text-4xl font-bold text-green-600 mt-2">736</p>
          </Card>
        </div>
      </main>

      {/* Modals */}
      {showOrgModal && <OrganizationModal onClose={() => setShowOrgModal(false)} />}
      {showAdminModal && <AddAdminModal onClose={() => setShowAdminModal(false)} />}
      {showStaffModal && <AddStaffModal onClose={() => setShowStaffModal(false)} />}
    </div>
  )
}
