'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface AssignedIssue {
  id: string
  title: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  reporter: string
  status: 'assigned' | 'in-progress' | 'completed'
  location: string
  notes?: string
}

interface UpdateStatusModalProps {
  issue: AssignedIssue
  onUpdate: (issueId: string, newStatus: 'assigned' | 'in-progress' | 'completed', notes?: string) => void
  onClose: () => void
}

const priorityColors: Record<string, string> = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
}

export default function UpdateStatusModal({ issue, onUpdate, onClose }: UpdateStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState(issue.status)
  const [notes, setNotes] = useState(issue.notes || '')

  const statusOptions = [
    { value: 'assigned', label: 'Pending', description: 'Issue has been assigned but not started' },
    { value: 'in-progress', label: 'In Progress', description: 'Currently working on the issue' },
    { value: 'completed', label: 'Completed', description: 'Issue has been resolved' },
  ]

  const handleUpdate = () => {
    onUpdate(issue.id, selectedStatus as 'assigned' | 'in-progress' | 'completed', notes)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl border-0 shadow-xl">
        <div className="p-6">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="float-right text-muted-foreground hover:text-foreground"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header */}
          <h2 className="text-2xl font-bold text-foreground mb-6">Update Issue Status</h2>

          {/* Issue Info */}
          <div className="bg-muted/30 rounded-lg p-4 mb-6">
            <p className="text-sm text-muted-foreground mb-1">Issue</p>
            <p className="font-semibold text-foreground text-lg mb-3">{issue.title}</p>
            <div className="flex gap-2 flex-wrap">
              <Badge className={`text-xs ${priorityColors[issue.priority]}`}>
                {issue.priority.toUpperCase()}
              </Badge>
              <Badge variant="secondary" className="text-xs">{issue.category}</Badge>
            </div>
          </div>

          {/* Status Selection */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-foreground mb-4">Select New Status</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {statusOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setSelectedStatus(option.value as 'assigned' | 'in-progress' | 'completed')}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedStatus === option.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary'
                  }`}
                >
                  <p className="font-semibold text-foreground">{option.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Progress Notes */}
          <div className="mb-6">
            <label className="text-sm font-semibold text-foreground block mb-2">
              Progress Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about the progress or updates made on this issue..."
              className="w-full px-3 py-2 border border-input rounded-lg bg-background min-h-24 resize-none"
            />
            <p className="text-xs text-muted-foreground mt-2">
              These notes will be visible to the admin and citizen
            </p>
          </div>

          {/* Status Flow Helper */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-900">
              <strong>Workflow:</strong> Start with Pending → Move to In Progress when you begin work → Mark as Completed when the issue is resolved.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Update Status
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
