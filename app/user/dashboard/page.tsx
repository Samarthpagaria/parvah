'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import UserHeader from '@/components/user/UserHeader'
import IssueListItem from '@/components/user/IssueListItem'
import ReportIssueModal from '@/components/user/modals/ReportIssueModal'
import IssueDetailViewModal from '@/components/user/modals/IssueDetailViewModal'

interface UserIssue {
  id: string
  title: string
  category: string
  description: string
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  createdAt: string
  updatedAt: string
  location: string
}

export default function UserDashboard() {
  const [issues, setIssues] = useState<UserIssue[]>([
    {
      id: '1',
      title: 'Pothole on Main Street',
      category: 'Road Maintenance',
      description: 'Large pothole affecting traffic flow near the market',
      status: 'in-progress',
      priority: 'high',
      createdAt: '2024-03-01',
      updatedAt: '2024-03-03',
      location: 'Main Street, Downtown',
    },
    {
      id: '2',
      title: 'Broken Street Light',
      category: 'Street Lighting',
      description: 'Street light not working at night',
      status: 'open',
      priority: 'medium',
      createdAt: '2024-03-02',
      updatedAt: '2024-03-02',
      location: 'Park Avenue',
    },
    {
      id: '3',
      title: 'Gutter Cleaning',
      category: 'Maintenance',
      description: 'Gutters cleaned successfully',
      status: 'closed',
      priority: 'low',
      createdAt: '2024-02-28',
      updatedAt: '2024-03-01',
      location: 'Park Circle',
    },
  ])

  const [showReportModal, setShowReportModal] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState<UserIssue | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'in-progress' | 'resolved' | 'closed'>('all')

  const handleReportIssue = (issueData: any) => {
    const newIssue: UserIssue = {
      id: String(issues.length + 1),
      title: issueData.title,
      category: issueData.category,
      description: issueData.description,
      status: 'open',
      priority: issueData.priority,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      location: issueData.location,
    }
    setIssues([newIssue, ...issues])
    setShowReportModal(false)
  }

  const filteredIssues = filterStatus === 'all'
    ? issues
    : issues.filter(issue => issue.status === filterStatus)

  const statusStats = {
    open: issues.filter(i => i.status === 'open').length,
    inProgress: issues.filter(i => i.status === 'in-progress').length,
    resolved: issues.filter(i => i.status === 'resolved').length,
    closed: issues.filter(i => i.status === 'closed').length,
  }

  return (
    <div className="min-h-screen bg-background">
      <UserHeader />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">Welcome Back</h1>
          <p className="text-muted-foreground text-lg">Report civic issues and track their progress</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Card className="p-4 border-0 shadow-md">
            <p className="text-muted-foreground text-sm">Total Issues</p>
            <p className="text-3xl font-bold text-primary mt-2">{issues.length}</p>
          </Card>
          <Card className="p-4 border-0 shadow-md">
            <p className="text-muted-foreground text-sm">Open</p>
            <p className="text-3xl font-bold text-red-600 mt-2">{statusStats.open}</p>
          </Card>
          <Card className="p-4 border-0 shadow-md">
            <p className="text-muted-foreground text-sm">In Progress</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{statusStats.inProgress}</p>
          </Card>
          <Card className="p-4 border-0 shadow-md">
            <p className="text-muted-foreground text-sm">Resolved</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{statusStats.resolved + statusStats.closed}</p>
          </Card>
        </div>

        {/* Report Button & Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Your Issues</h2>
            <p className="text-muted-foreground text-sm mt-1">Track and manage all your reported issues</p>
          </div>
          <Button
            onClick={() => setShowReportModal(true)}
            className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Report New Issue
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(['all', 'open', 'in-progress', 'resolved', 'closed'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === status
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-border'
              }`}
            >
              {status === 'all' ? 'All Issues' : status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Issues List */}
        <div className="space-y-4">
          {filteredIssues.length > 0 ? (
            filteredIssues.map(issue => (
              <IssueListItem
                key={issue.id}
                issue={issue}
                onClick={() => {
                  setSelectedIssue(issue)
                  setShowDetailModal(true)
                }}
              />
            ))
          ) : (
            <Card className="p-12 text-center border-0 shadow-md">
              <svg className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="text-xl font-semibold text-foreground mb-2">No Issues Found</h3>
              <p className="text-muted-foreground mb-4">You haven't reported any issues with this status yet.</p>
              <Button
                onClick={() => setShowReportModal(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Report Your First Issue
              </Button>
            </Card>
          )}
        </div>
      </main>

      {/* Modals */}
      {showReportModal && (
        <ReportIssueModal
          onSubmit={handleReportIssue}
          onClose={() => setShowReportModal(false)}
        />
      )}
      {showDetailModal && selectedIssue && (
        <IssueDetailViewModal
          issue={selectedIssue}
          onClose={() => setShowDetailModal(false)}
        />
      )}
    </div>
  )
}
