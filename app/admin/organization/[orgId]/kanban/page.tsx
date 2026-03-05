'use client'

import { useState, use } from 'react'
import AdminHeader from '@/components/admin/AdminHeader'
import KanbanColumn from '@/components/kanban/KanbanColumn'
import KanbanCard from '@/components/kanban/KanbanCard'
import IssueDetailModal from '@/components/kanban/IssueDetailModal'
import AssignStaffModal from '@/components/kanban/AssignStaffModal'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Issue {
  id: string
  title: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  reporter: string
  assignedTo?: string
  description: string
  createdAt: string
  location?: string
}

export default function KanbanPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = use(params)
  const [issues, setIssues] = useState<{ [key: string]: Issue[] }>({
    open: [
      {
        id: '1',
        title: 'Pothole on Main Street',
        category: 'Road Maintenance',
        priority: 'high',
        reporter: 'John Doe',
        description: 'Large pothole affecting traffic flow',
        createdAt: '2024-03-01',
        location: 'Main Street, Downtown'
      },
      {
        id: '2',
        title: 'Broken Street Light',
        category: 'Street Lighting',
        priority: 'medium',
        reporter: 'Jane Smith',
        description: 'Street light not working at night',
        createdAt: '2024-03-02',
        location: 'Park Avenue'
      },
    ],
    inProgress: [
      {
        id: '3',
        title: 'Water Pipe Leak',
        category: 'Water Supply',
        priority: 'critical',
        reporter: 'Mike Johnson',
        assignedTo: 'Sarah Wilson',
        description: 'Major water leak causing wastage',
        createdAt: '2024-03-01',
        location: 'Oak Street'
      },
    ],
    resolved: [
      {
        id: '4',
        title: 'Gutter Cleaning',
        category: 'Maintenance',
        priority: 'low',
        reporter: 'Alice Brown',
        assignedTo: 'Tom Davis',
        description: 'Gutters cleaned successfully',
        createdAt: '2024-02-28',
        location: 'Park Circle'
      },
    ],
    closed: [
      {
        id: '5',
        title: 'Sidewalk Repair',
        category: 'Safety',
        priority: 'medium',
        reporter: 'Bob Wilson',
        assignedTo: 'John Davis',
        description: 'Sidewalk repaired and ready',
        createdAt: '2024-02-25',
        location: 'Third Street'
      },
    ],
  })

  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)

  const handleMoveIssue = (issueId: string, fromColumn: string, toColumn: string) => {
    const issue = issues[fromColumn].find(i => i.id === issueId)
    if (issue) {
      setIssues(prev => ({
        ...prev,
        [fromColumn]: prev[fromColumn].filter(i => i.id !== issueId),
        [toColumn]: [...prev[toColumn], issue]
      }))
    }
  }

  const handleAssignStaff = (issueId: string, staffName: string) => {
    Object.keys(issues).forEach(column => {
      const issue = issues[column].find(i => i.id === issueId)
      if (issue) {
        issue.assignedTo = staffName
      }
    })
    setIssues({ ...issues })
    setShowAssignModal(false)
  }

  const openIssueDetail = (issue: Issue) => {
    setSelectedIssue(issue)
    setShowDetailModal(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link href="/admin/dashboard" className="text-primary hover:underline text-sm">
                Dashboard
              </Link>
              <span className="text-muted-foreground">/</span>
              <span className="text-sm text-muted-foreground">Kanban Board</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Issue Management Board</h1>
            <p className="text-muted-foreground mt-2">Track and manage citizen-reported issues</p>
          </div>
          <Button
            onClick={() => window.location.href = '/admin/dashboard'}
            variant="outline"
          >
            Back to Dashboard
          </Button>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto pb-4">
          <KanbanColumn
            title="Open"
            count={issues.open.length}
            color="from-red-50 to-red-100"
            textColor="text-red-600"
          >
            {issues.open.map(issue => (
              <KanbanCard
                key={issue.id}
                issue={issue}
                onCardClick={() => openIssueDetail(issue)}
                onAssign={() => {
                  setSelectedIssue(issue)
                  setShowAssignModal(true)
                }}
                onMove={(toColumn) => handleMoveIssue(issue.id, 'open', toColumn)}
              />
            ))}
          </KanbanColumn>

          <KanbanColumn
            title="In Progress"
            count={issues.inProgress.length}
            color="from-yellow-50 to-yellow-100"
            textColor="text-yellow-600"
          >
            {issues.inProgress.map(issue => (
              <KanbanCard
                key={issue.id}
                issue={issue}
                onCardClick={() => openIssueDetail(issue)}
                onAssign={() => {
                  setSelectedIssue(issue)
                  setShowAssignModal(true)
                }}
                onMove={(toColumn) => handleMoveIssue(issue.id, 'inProgress', toColumn)}
              />
            ))}
          </KanbanColumn>

          <KanbanColumn
            title="Resolved"
            count={issues.resolved.length}
            color="from-blue-50 to-blue-100"
            textColor="text-blue-600"
          >
            {issues.resolved.map(issue => (
              <KanbanCard
                key={issue.id}
                issue={issue}
                onCardClick={() => openIssueDetail(issue)}
                onAssign={() => {
                  setSelectedIssue(issue)
                  setShowAssignModal(true)
                }}
                onMove={(toColumn) => handleMoveIssue(issue.id, 'resolved', toColumn)}
              />
            ))}
          </KanbanColumn>

          <KanbanColumn
            title="Closed"
            count={issues.closed.length}
            color="from-green-50 to-green-100"
            textColor="text-green-600"
          >
            {issues.closed.map(issue => (
              <KanbanCard
                key={issue.id}
                issue={issue}
                onCardClick={() => openIssueDetail(issue)}
                onAssign={() => {
                  setSelectedIssue(issue)
                  setShowAssignModal(true)
                }}
                onMove={(toColumn) => handleMoveIssue(issue.id, 'closed', toColumn)}
              />
            ))}
          </KanbanColumn>
        </div>
      </main>

      {/* Modals */}
      {showDetailModal && selectedIssue && (
        <IssueDetailModal
          issue={selectedIssue}
          onClose={() => setShowDetailModal(false)}
        />
      )}
      {showAssignModal && selectedIssue && (
        <AssignStaffModal
          issue={selectedIssue}
          onAssign={handleAssignStaff}
          onClose={() => setShowAssignModal(false)}
        />
      )}
    </div>
  )
}
