'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import StaffHeader from '@/components/staff/StaffHeader'
import AssignedIssueCard from '@/components/staff/AssignedIssueCard'
import UpdateStatusModal from '@/components/staff/modals/UpdateStatusModal'

interface AssignedIssue {
  id: string
  title: string
  category: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  reporter: string
  assignedAt: string
  status: 'assigned' | 'in-progress' | 'completed'
  location: string
  notes?: string
}

export default function StaffDashboard() {
  const [issues, setIssues] = useState<AssignedIssue[]>([
    {
      id: '1',
      title: 'Pothole on Main Street',
      category: 'Road Maintenance',
      description: 'Large pothole affecting traffic flow near the market',
      priority: 'high',
      reporter: 'John Doe',
      assignedAt: '2024-03-03',
      status: 'in-progress',
      location: 'Main Street, Downtown',
      notes: 'Currently assessing damage. Will require asphalt repair materials.',
    },
    {
      id: '3',
      title: 'Water Pipe Leak',
      category: 'Water Supply',
      description: 'Major water leak causing wastage',
      priority: 'critical',
      reporter: 'Mike Johnson',
      assignedAt: '2024-03-01',
      status: 'in-progress',
      location: 'Oak Street',
      notes: 'Leak isolated. Awaiting replacement pipe.',
    },
    {
      id: '2',
      title: 'Broken Street Light',
      category: 'Street Lighting',
      description: 'Street light not working at night',
      priority: 'medium',
      reporter: 'Jane Smith',
      assignedAt: '2024-03-04',
      status: 'assigned',
      location: 'Park Avenue',
    },
  ])

  const [selectedIssue, setSelectedIssue] = useState<AssignedIssue | null>(null)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState<'all' | 'assigned' | 'in-progress' | 'completed'>('all')

  const handleStatusUpdate = (issueId: string, newStatus: 'assigned' | 'in-progress' | 'completed', notes?: string) => {
    setIssues(prevIssues =>
      prevIssues.map(issue =>
        issue.id === issueId
          ? { ...issue, status: newStatus, notes: notes || issue.notes }
          : issue
      )
    )
    setShowStatusModal(false)
  }

  const filteredIssues = filterStatus === 'all'
    ? issues
    : issues.filter(issue => issue.status === filterStatus)

  const stats = {
    assigned: issues.filter(i => i.status === 'assigned').length,
    inProgress: issues.filter(i => i.status === 'in-progress').length,
    completed: issues.filter(i => i.status === 'completed').length,
  }

  const priorityCritical = issues.filter(i => i.priority === 'critical').length

  return (
    <div className="min-h-screen bg-background">
      <StaffHeader />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">Your Assignments</h1>
          <p className="text-muted-foreground text-lg">Manage and update the status of assigned civic issues</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Card className="p-4 border-0 shadow-md">
            <p className="text-muted-foreground text-sm">Total Assigned</p>
            <p className="text-3xl font-bold text-primary mt-2">{issues.length}</p>
          </Card>
          <Card className="p-4 border-0 shadow-md">
            <p className="text-muted-foreground text-sm">Pending</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.assigned}</p>
          </Card>
          <Card className="p-4 border-0 shadow-md">
            <p className="text-muted-foreground text-sm">In Progress</p>
            <p className="text-3xl font-bold text-orange-600 mt-2">{stats.inProgress}</p>
          </Card>
          <Card className="p-4 border-0 shadow-md">
            <p className="text-muted-foreground text-sm">Completed</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats.completed}</p>
          </Card>
        </div>

        {/* Alert for Critical Issues */}
        {priorityCritical > 0 && (
          <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-8 rounded">
            <p className="text-red-900 font-semibold">
              Attention: You have {priorityCritical} critical issue(s) that need immediate attention!
            </p>
          </div>
        )}

        {/* Filters */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Assigned Issues</h2>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'assigned', 'in-progress', 'completed'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === status
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-border'
                }`}
              >
                {status === 'all' ? 'All Issues' : status === 'assigned' ? 'Pending' : status === 'in-progress' ? 'In Progress' : 'Completed'}
              </button>
            ))}
          </div>
        </div>

        {/* Issues List */}
        <div className="space-y-4">
          {filteredIssues.length > 0 ? (
            filteredIssues.map(issue => (
              <AssignedIssueCard
                key={issue.id}
                issue={issue}
                onUpdateStatus={() => {
                  setSelectedIssue(issue)
                  setShowStatusModal(true)
                }}
              />
            ))
          ) : (
            <Card className="p-12 text-center border-0 shadow-md">
              <svg className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-semibold text-foreground mb-2">No Issues Found</h3>
              <p className="text-muted-foreground">You don't have any issues with this status at the moment.</p>
            </Card>
          )}
        </div>
      </main>

      {/* Modals */}
      {showStatusModal && selectedIssue && (
        <UpdateStatusModal
          issue={selectedIssue}
          onUpdate={handleStatusUpdate}
          onClose={() => setShowStatusModal(false)}
        />
      )}
    </div>
  )
}
