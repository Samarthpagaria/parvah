'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ReportIssueModalProps {
  onSubmit: (issueData: any) => void
  onClose: () => void
}

export default function ReportIssueModal({ onSubmit, onClose }: ReportIssueModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Road Maintenance',
    description: '',
    priority: 'medium',
    location: '',
    media: '',
  })

  const categories = [
    'Road Maintenance',
    'Street Lighting',
    'Water Supply',
    'Waste Management',
    'Drainage',
    'Public Spaces',
    'Safety',
    'Other',
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border-0">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">Report a Civic Issue</h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-sm font-medium">Issue Title</Label>
              <Input
                id="title"
                name="title"
                type="text"
                placeholder="E.g., Pothole on Main Street"
                value={formData.title}
                onChange={handleInputChange}
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="category" className="text-sm font-medium">Category</Label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full mt-1 px-3 py-2 border border-input rounded-lg bg-background"
                required
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium">Description</Label>
              <textarea
                id="description"
                name="description"
                placeholder="Describe the issue in detail..."
                value={formData.description}
                onChange={handleInputChange}
                className="w-full mt-1 px-3 py-2 border border-input rounded-lg bg-background min-h-24 resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                <Input
                  id="location"
                  name="location"
                  type="text"
                  placeholder="Enter location or address"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="priority" className="text-sm font-medium">Priority</Label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-lg bg-background"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="media" className="text-sm font-medium">Upload Image (Optional)</Label>
              <div className="mt-1 border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
                <svg className="w-10 h-10 text-muted-foreground mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <p className="text-sm text-muted-foreground">Click or drag to upload image</p>
                <input
                  id="media"
                  name="media"
                  type="file"
                  accept="image/*"
                  onChange={handleInputChange}
                  className="hidden"
                />
              </div>
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <p className="text-sm text-foreground">
                <strong>Note:</strong> Your issue will be reviewed by our team and assigned to relevant staff members. You'll receive updates on the status.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Report Issue
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}
