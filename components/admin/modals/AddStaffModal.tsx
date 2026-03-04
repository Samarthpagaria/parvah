'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface AddStaffModalProps {
  onClose: () => void
}

export default function AddStaffModal({ onClose }: AddStaffModalProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    organizationId: 'org-1',
    staffCode: '',
  })

  const [staffCode, setStaffCode] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const generateStaffCode = () => {
    const code = `STF-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    setStaffCode(code)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Mock submission
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border-0">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">Add New Staff Member</h2>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName" className="text-sm font-medium">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Enter full name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="staff@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="department" className="text-sm font-medium">Department</Label>
                <Input
                  id="department"
                  name="department"
                  type="text"
                  placeholder="E.g., Public Works"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="mt-1"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="designation" className="text-sm font-medium">Designation</Label>
                <Input
                  id="designation"
                  name="designation"
                  type="text"
                  placeholder="E.g., Field Officer"
                  value={formData.designation}
                  onChange={handleInputChange}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="organizationId" className="text-sm font-medium">Assign to Organization</Label>
                <select
                  id="organizationId"
                  name="organizationId"
                  value={formData.organizationId}
                  onChange={(e) => setFormData(prev => ({ ...prev, organizationId: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-lg bg-background"
                >
                  <option value="org-1">City Municipality</option>
                  <option value="org-2">Water Department</option>
                  <option value="org-3">Waste Management</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="staffCode" className="text-sm font-medium">Staff Registration Code</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="staffCode"
                  type="text"
                  placeholder="Generate a code for staff"
                  value={staffCode}
                  readOnly
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={generateStaffCode}
                  variant="outline"
                  className="whitespace-nowrap"
                >
                  Generate Code
                </Button>
              </div>
              {staffCode && (
                <p className="text-xs text-muted-foreground mt-2">
                  Share this code with the staff member for registration
                </p>
              )}
            </div>

            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <p className="text-sm text-teal-900">
                <strong>Note:</strong> Generate a unique code for the staff member to use during registration. They will set their own password.
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
                Add Staff Member
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}
