'use client'

import { useState } from 'react'
import Link from 'next/link'

type Status = 'assigned' | 'in-progress' | 'completed'
type Priority = 'low' | 'medium' | 'high' | 'critical'

interface AssignedIssue {
  id: string
  title: string
  category: string
  description: string
  priority: Priority
  reporter: string
  assignedAt: string
  status: Status
  location: string
  notes?: string
}

const priorityConfig: Record<Priority, { label: string; dot: string; badge: string }> = {
  low: { label: 'Low', dot: 'bg-blue-400', badge: 'bg-blue-50 text-blue-600' },
  medium: { label: 'Medium', dot: 'bg-yellow-400', badge: 'bg-yellow-50 text-yellow-700' },
  high: { label: 'High', dot: 'bg-orange-400', badge: 'bg-orange-50 text-orange-700' },
  critical: { label: 'Critical', dot: 'bg-red-500', badge: 'bg-red-50 text-red-700' },
}

const statusConfig: Record<Status, { label: string; color: string; next: Status | null; nextLabel: string }> = {
  'assigned': { label: 'Pending', color: 'text-amber-600 bg-amber-50', next: 'in-progress', nextLabel: 'Start Working' },
  'in-progress': { label: 'In Progress', color: 'text-blue-600 bg-blue-50', next: 'completed', nextLabel: 'Mark Complete' },
  'completed': { label: 'Completed', color: 'text-teal-600 bg-teal-50', next: null, nextLabel: '' },
}

const mockIssues: AssignedIssue[] = [
  { id: '1', title: 'Pothole on Main Street', category: 'Road Maintenance', description: 'Large pothole affecting traffic flow near the market area. Requires immediate asphalt repair.', priority: 'high', reporter: 'John Doe', assignedAt: 'Mar 03', status: 'in-progress', location: 'Main Street, Downtown', notes: 'Currently assessing damage. Repair materials ordered.' },
  { id: '2', title: 'Water Pipe Leak', category: 'Water Supply', description: 'Major water leak causing significant wastage near residential area.', priority: 'critical', reporter: 'Mike Johnson', assignedAt: 'Mar 01', status: 'in-progress', location: 'Oak Street', notes: 'Leak isolated. Awaiting replacement pipe delivery.' },
  { id: '3', title: 'Broken Street Light', category: 'Street Lighting', description: 'Street light not functioning during night hours, creating safety hazard.', priority: 'medium', reporter: 'Jane Smith', assignedAt: 'Mar 04', status: 'assigned', location: 'Park Avenue' },
]

function UpdateModal({ issue, onUpdate, onClose }: { issue: AssignedIssue; onUpdate: (id: string, s: Status, n?: string) => void; onClose: () => void }) {
  const [notes, setNotes] = useState(issue.notes ?? '')
  const next = statusConfig[issue.status].next
  const nextLabel = statusConfig[issue.status].nextLabel

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">Update Status</h3>
            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[260px]">{issue.title}</p>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-500 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500">Current status: <span className={`font-semibold px-2 py-0.5 rounded-full text-xs ml-1 ${statusConfig[issue.status].color}`}>{statusConfig[issue.status].label}</span></p>
            {next && <p className="text-xs text-gray-500 mt-1">→ Will move to: <span className="font-medium text-gray-700">{statusConfig[next].label}</span></p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Progress Notes</label>
            <textarea
              rows={4}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add notes about progress, blockers, or observations..."
              className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all resize-none"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-2.5 text-sm font-medium text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
            {next ? (
              <button onClick={() => onUpdate(issue.id, next, notes)} className="flex-1 py-2.5 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors shadow-sm">
                {nextLabel}
              </button>
            ) : (
              <button onClick={() => onUpdate(issue.id, 'completed', notes)} className="flex-1 py-2.5 text-sm font-medium text-gray-400 bg-gray-100 rounded-xl cursor-not-allowed">
                Already Completed
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function StaffDashboard() {
  const [issues, setIssues] = useState<AssignedIssue[]>(mockIssues)
  const [selected, setSelected] = useState<AssignedIssue | null>(null)
  const [filter, setFilter] = useState<'all' | Status>('all')

  const handleUpdate = (id: string, newStatus: Status, notes?: string) => {
    setIssues(prev => prev.map(i => i.id === id ? { ...i, status: newStatus, notes } : i))
    setSelected(null)
  }

  const filtered = filter === 'all' ? issues : issues.filter(i => i.status === filter)
  const stats = {
    total: issues.length,
    pending: issues.filter(i => i.status === 'assigned').length,
    inProgress: issues.filter(i => i.status === 'in-progress').length,
    completed: issues.filter(i => i.status === 'completed').length,
  }
  const critical = issues.filter(i => i.priority === 'critical' && i.status !== 'completed')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-gray-900">Parvah</span>
            <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Staff</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-800">Sarah Wilson</p>
              <p className="text-xs text-gray-400">City Municipality</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">SW</div>
            <button onClick={() => window.location.href = '/admin/login'} className="text-sm text-gray-400 hover:text-gray-600 font-medium px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Greeting */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Your Assignments</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage and update the status of your assigned civic issues.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total', value: stats.total, color: 'text-gray-800', bg: 'bg-gray-50' },
            { label: 'Pending', value: stats.pending, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'In Progress', value: stats.inProgress, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Completed', value: stats.completed, color: 'text-teal-600', bg: 'bg-teal-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-2xl p-4 border border-white shadow-sm`}>
              <p className="text-xs font-medium text-gray-500 mb-1">{s.label}</p>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Critical alert */}
        {critical.length > 0 && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-2xl px-4 py-3.5 mb-6">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm text-red-700 font-medium">
              You have <strong>{critical.length} critical issue{critical.length > 1 ? 's' : ''}</strong> that need immediate attention.
            </p>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          {(['all', 'assigned', 'in-progress', 'completed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${filter === f
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
                }`}
            >
              {f === 'all' ? 'All Issues' : f === 'assigned' ? 'Pending' : f === 'in-progress' ? 'In Progress' : 'Completed'}
            </button>
          ))}
          <span className="text-xs text-gray-400 ml-auto">{filtered.length} showing</span>
        </div>

        {/* Issues list */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <p className="text-sm font-medium text-gray-400">No issues with this status.</p>
            </div>
          ) : filtered.map(issue => {
            const p = priorityConfig[issue.priority]
            const s = statusConfig[issue.status]
            return (
              <div key={issue.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all">
                <div className="flex items-start gap-4">
                  <div className={`w-2 h-full min-h-[60px] rounded-full flex-shrink-0 ${p.dot}`} style={{ width: '3px' }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">{issue.title}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">{issue.location}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${p.badge} flex items-center gap-1`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />{p.label}
                        </span>
                        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${s.color}`}>{s.label}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 leading-relaxed line-clamp-2">{issue.description}</p>
                    {issue.notes && (
                      <div className="mt-3 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Progress Notes</p>
                        <p className="text-xs text-gray-600">{issue.notes}</p>
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-gray-400">
                          <span className="font-medium text-gray-500">{issue.category}</span>
                        </span>
                        <span className="text-[10px] text-gray-300">·</span>
                        <span className="text-[10px] text-gray-400">Reported by <span className="font-medium text-gray-600">{issue.reporter}</span></span>
                        <span className="text-[10px] text-gray-300">·</span>
                        <span className="text-[10px] text-gray-400">{issue.assignedAt}</span>
                      </div>
                      {issue.status !== 'completed' && (
                        <button
                          onClick={() => setSelected(issue)}
                          className="text-xs font-semibold text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-4 py-1.5 rounded-xl transition-colors"
                        >
                          Update Status
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </main>

      {selected && (
        <UpdateModal issue={selected} onUpdate={handleUpdate} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
