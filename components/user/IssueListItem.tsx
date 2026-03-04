import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface UserIssue {
  id: string
  title: string
  category: string
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  createdAt: string
  location: string
}

interface IssueListItemProps {
  issue: UserIssue
  onClick: () => void
}

const statusColors: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  open: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" clipRule="evenodd" />
      </svg>
    ),
  },
  'in-progress': {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V15a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
      </svg>
    ),
  },
  resolved: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
  },
  closed: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
  },
}

const priorityColors: Record<string, string> = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
}

export default function IssueListItem({ issue, onClick }: IssueListItemProps) {
  const statusStyle = statusColors[issue.status]

  return (
    <Card
      className="p-4 border-0 shadow-md hover:shadow-lg transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left Section */}
        <div className="flex-1">
          <div className="flex items-start gap-3 mb-3">
            <div className={`p-2 rounded-lg ${statusStyle.bg}`}>
              {statusStyle.icon}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground text-lg">{issue.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{issue.location}</p>
            </div>
          </div>

          {/* Tags */}
          <div className="flex gap-2 flex-wrap">
            <Badge variant="secondary" className="text-xs">
              {issue.category}
            </Badge>
            <Badge className={`text-xs ${priorityColors[issue.priority]}`}>
              {issue.priority.charAt(0).toUpperCase() + issue.priority.slice(1)}
            </Badge>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex flex-col items-end gap-2">
          <Badge className={`${statusStyle.bg} ${statusStyle.text} text-sm`}>
            {issue.status.charAt(0).toUpperCase() + issue.status.slice(1).replace('-', ' ')}
          </Badge>
          <p className="text-xs text-muted-foreground">
            {issue.createdAt}
          </p>
        </div>
      </div>
    </Card>
  )
}
