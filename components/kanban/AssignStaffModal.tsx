'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Issue {
  id: string
  title: string
}

interface AssignStaffModalProps {
  issue: Issue
  onAssign: (issueId: string, staffName: string) => void
  onClose: () => void
}

export default function AssignStaffModal({ issue, onAssign, onClose }: AssignStaffModalProps) {
  const [selectedStaff, setSelectedStaff] = useState('')

  // Mock staff data
  const staffMembers = [
    { id: '1', name: 'Sarah Wilson', department: 'Public Works', designation: 'Field Officer' },
    { id: '2', name: 'Tom Davis', department: 'Public Works', designation: 'Inspector' },
    { id: '3', name: 'John Davis', department: 'Maintenance', designation: 'Supervisor' },
    { id: '4', name: 'Lisa Anderson', department: 'Water Supply', designation: 'Technician' },
    { id: '5', name: 'Mark Johnson', department: 'Road Safety', designation: 'Coordinator' },
  ]

  const handleAssign = () => {
    if (selectedStaff) {
      onAssign(issue.id, selectedStaff)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md border-0 shadow-xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">Assign Staff Member</h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Issue Title */}
          <div className="mb-6 p-4 bg-primary/10 rounded-lg">
            <p className="text-sm text-muted-foreground">Issue</p>
            <p className="font-semibold text-foreground">{issue.title}</p>
          </div>

          {/* Staff Selection */}
          <div className="mb-6">
            <Label className="text-sm font-medium mb-3 block">Select Staff Member</Label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {staffMembers.map(staff => (
                <button
                  key={staff.id}
                  onClick={() => setSelectedStaff(staff.name)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    selectedStaff === staff.name
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-foreground">{staff.name}</p>
                      <p className="text-xs text-muted-foreground">{staff.department}</p>
                    </div>
                    <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                      {staff.designation}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssign}
              disabled={!selectedStaff}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
            >
              Assign
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
