'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

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

interface IssueDetailModalProps {
  issue: Issue
  onClose: () => void
}

const priorityColors: Record<string, string> = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
}

export default function IssueDetailModal({ issue, onClose }: IssueDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl border-0 shadow-xl">
        <div className="p-8">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="float-right text-muted-foreground hover:text-foreground mb-4"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header */}
          <h2 className="text-3xl font-bold text-foreground mb-4">{issue.title}</h2>

          {/* Status Bar */}
          <div className="flex flex-wrap gap-3 mb-6">
            <Badge className={`${priorityColors[issue.priority]}`}>
              Priority: {issue.priority.charAt(0).toUpperCase() + issue.priority.slice(1)}
            </Badge>
            <Badge variant="secondary">Category: {issue.category}</Badge>
            <Badge variant="outline">ID: {issue.id}</Badge>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Left Column */}
            <div>
              <h3 className="font-semibold text-foreground mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">{issue.description}</p>

              <div className="mt-6">
                <h3 className="font-semibold text-foreground mb-2">Location</h3>
                <p className="text-muted-foreground">{issue.location || 'Not specified'}</p>
              </div>
            </div>

            {/* Right Column */}
            <div>
              <h3 className="font-semibold text-foreground mb-2">Details</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Reporter</p>
                  <p className="font-medium text-foreground">{issue.reporter}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Assigned To</p>
                  <p className="font-medium text-foreground">
                    {issue.assignedTo || 'Unassigned'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created Date</p>
                  <p className="font-medium text-foreground">{issue.createdAt}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-muted/30 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-foreground mb-4">Activity Timeline</h3>
            <div className="space-y-3">
              <div className="flex gap-4">
                <div className="w-3 h-3 rounded-full bg-primary mt-2"></div>
                <div>
                  <p className="font-medium text-foreground">Issue Created</p>
                  <p className="text-sm text-muted-foreground">{issue.createdAt} - {issue.reporter}</p>
                </div>
              </div>
              {issue.assignedTo && (
                <div className="flex gap-4">
                  <div className="w-3 h-3 rounded-full bg-primary mt-2"></div>
                  <div>
                    <p className="font-medium text-foreground">Assigned to Staff</p>
                    <p className="text-sm text-muted-foreground">Assigned to {issue.assignedTo}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Close
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Edit Issue
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
