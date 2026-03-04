import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface IssueCardProps {
  issue: {
    id: string
    title: string
    category: string
    priority: 'low' | 'medium' | 'high' | 'critical'
    reporter: string
    assignedTo?: string
  }
  onCardClick: () => void
  onAssign: () => void
  onMove: (toColumn: string) => void
}

const priorityColors: Record<string, { bg: string; text: string; border: string }> = {
  low: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  medium: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  high: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  critical: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
}

export default function KanbanCard({
  issue,
  onCardClick,
  onAssign,
  onMove,
}: IssueCardProps) {
  const priorityStyle = priorityColors[issue.priority]

  return (
    <Card
      className={`p-4 cursor-pointer hover:shadow-lg transition-all border ${priorityStyle.border}`}
      onClick={onCardClick}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-semibold text-foreground text-sm flex-1">{issue.title}</h4>
        <div className="ml-2">
          <Badge variant="outline" className={`text-xs ${priorityStyle.text}`}>
            {issue.priority}
          </Badge>
        </div>
      </div>

      {/* Category */}
      <div className="mb-3">
        <Badge variant="secondary" className="text-xs">
          {issue.category}
        </Badge>
      </div>

      {/* Reporter & Assignment */}
      <div className="space-y-2 mb-3">
        <div className="text-xs">
          <p className="text-muted-foreground">Reporter: <span className="font-medium text-foreground">{issue.reporter}</span></p>
        </div>
        {issue.assignedTo && (
          <div className="text-xs bg-primary/10 rounded px-2 py-1">
            <p className="text-muted-foreground">Assigned to: <span className="font-medium text-primary">{issue.assignedTo}</span></p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-border">
        {!issue.assignedTo && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onAssign()
            }}
            className="flex-1 text-xs py-1.5 px-2 bg-primary/10 text-primary hover:bg-primary/20 rounded font-medium transition-colors"
          >
            Assign
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onMove('inProgress')
          }}
          className="flex-1 text-xs py-1.5 px-2 bg-muted text-muted-foreground hover:bg-border rounded font-medium transition-colors"
        >
          Move
        </button>
      </div>
    </Card>
  )
}
