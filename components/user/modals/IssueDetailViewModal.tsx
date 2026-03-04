'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

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

interface IssueDetailViewModalProps {
  issue: UserIssue
  onClose: () => void
}

const statusColors: Record<string, { bg: string; text: string }> = {
  open: { bg: 'bg-red-100', text: 'text-red-800' },
  'in-progress': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  resolved: { bg: 'bg-blue-100', text: 'text-blue-800' },
  closed: { bg: 'bg-green-100', text: 'text-green-800' },
}

const priorityColors: Record<string, string> = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
}

export default function IssueDetailViewModal({ issue, onClose }: IssueDetailViewModalProps) {
  const statusStyle = statusColors[issue.status]

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

          {/* Issue ID */}
          <p className="text-sm text-muted-foreground mb-2">Issue ID: {issue.id}</p>

          {/* Title */}
          <h2 className="text-3xl font-bold text-foreground mb-4">{issue.title}</h2>

          {/* Status Bar */}
          <div className="flex flex-wrap gap-3 mb-6">
            <Badge className={`${statusStyle.bg} ${statusStyle.text}`}>
              Status: {issue.status.charAt(0).toUpperCase() + issue.status.slice(1).replace('-', ' ')}
            </Badge>
            <Badge className={`${priorityColors[issue.priority]}`}>
              Priority: {issue.priority.charAt(0).toUpperCase() + issue.priority.slice(1)}
            </Badge>
            <Badge variant="secondary">Category: {issue.category}</Badge>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Left Column */}
            <div>
              <h3 className="font-semibold text-foreground mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">{issue.description}</p>

              <div className="mt-6">
                <h3 className="font-semibold text-foreground mb-2">Location</h3>
                <p className="text-muted-foreground">{issue.location}</p>
              </div>
            </div>

            {/* Right Column */}
            <div>
              <h3 className="font-semibold text-foreground mb-2">Details</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium text-foreground">{issue.createdAt}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="font-medium text-foreground">{issue.updatedAt}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status Progress</p>
                  <div className="mt-2 w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{
                        width: issue.status === 'closed' ? '100%' : issue.status === 'resolved' ? '75%' : issue.status === 'in-progress' ? '50%' : '25%'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-muted/30 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-foreground mb-4">Status Timeline</h3>
            <div className="space-y-3">
              <div className="flex gap-4">
                <div className="w-3 h-3 rounded-full bg-primary mt-2"></div>
                <div>
                  <p className="font-medium text-foreground">Issue Reported</p>
                  <p className="text-sm text-muted-foreground">{issue.createdAt}</p>
                </div>
              </div>
              {(issue.status === 'in-progress' || issue.status === 'resolved' || issue.status === 'closed') && (
                <div className="flex gap-4">
                  <div className="w-3 h-3 rounded-full bg-primary mt-2"></div>
                  <div>
                    <p className="font-medium text-foreground">Assigned to Staff</p>
                    <p className="text-sm text-muted-foreground">Your issue is being handled</p>
                  </div>
                </div>
              )}
              {(issue.status === 'resolved' || issue.status === 'closed') && (
                <div className="flex gap-4">
                  <div className="w-3 h-3 rounded-full bg-green-600 mt-2"></div>
                  <div>
                    <p className="font-medium text-foreground">Resolved</p>
                    <p className="text-sm text-muted-foreground">{issue.updatedAt}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status Message */}
          {issue.status === 'open' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-900">
                Your issue has been reported and is awaiting review by our team. You'll be notified once it's assigned to a staff member.
              </p>
            </div>
          )}
          {issue.status === 'in-progress' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-900">
                Your issue is currently being handled by our staff. We're working on a resolution and will update you soon.
              </p>
            </div>
          )}
          {issue.status === 'resolved' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-900">
                Great news! Your issue has been resolved. Thank you for reporting it and helping us improve our community.
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Close
            </Button>
            {issue.status === 'open' && (
              <Button className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                Delete Issue
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
