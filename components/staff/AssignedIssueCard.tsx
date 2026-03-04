import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface AssignedIssue {
  id: string
  title: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  reporter: string
  assignedAt: string
  status: 'assigned' | 'in-progress' | 'completed'
  location: string
  notes?: string
}

interface AssignedIssueCardProps {
  issue: AssignedIssue
  onUpdateStatus: () => void
}

const statusColors: Record<string, { bg: string; text: string; icon: string }> = {
  assigned: { bg: 'bg-blue-100', text: 'text-blue-800', icon: '📋' },
  'in-progress': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '⚙️' },
  completed: { bg: 'bg-green-100', text: 'text-green-800', icon: '✓' },
}

const priorityColors: Record<string, string> = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
}

export default function AssignedIssueCard({ issue, onUpdateStatus }: AssignedIssueCardProps) {
  const statusStyle = statusColors[issue.status]

  return (
    <Card className="p-6 border-0 shadow-md hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-start gap-3 mb-2">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-foreground">{issue.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{issue.location}</p>
            </div>
            <Badge className={`${statusStyle.bg} ${statusStyle.text}`}>
              {issue.status === 'assigned' ? 'Pending' : issue.status === 'in-progress' ? 'In Progress' : 'Completed'}
            </Badge>
          </div>

          {/* Tags */}
          <div className="flex gap-2 flex-wrap mb-4">
            <Badge variant="secondary" className="text-xs">
              {issue.category}
            </Badge>
            <Badge className={`text-xs ${priorityColors[issue.priority]}`}>
              {issue.priority.charAt(0).toUpperCase() + issue.priority.slice(1)}
            </Badge>
          </div>

          {/* Description & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1">Reporter</p>
              <p className="text-sm text-foreground">{issue.reporter}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1">Assigned On</p>
              <p className="text-sm text-foreground">{issue.assignedAt}</p>
            </div>
          </div>

          {issue.notes && (
            <div className="bg-muted/30 rounded-lg p-3 mb-4">
              <p className="text-xs text-muted-foreground font-medium mb-1">Progress Notes</p>
              <p className="text-sm text-foreground">{issue.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Action Button */}
      <div className="flex gap-2 pt-4 border-t border-border">
        <Button
          onClick={onUpdateStatus}
          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {issue.status === 'completed' ? 'View Details' : 'Update Status'}
        </Button>
      </div>
    </Card>
  )
}
