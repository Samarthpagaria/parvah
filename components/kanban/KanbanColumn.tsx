import { Card } from '@/components/ui/card'

interface KanbanColumnProps {
  title: string
  count: number
  color: string
  textColor: string
  children: React.ReactNode
}

export default function KanbanColumn({
  title,
  count,
  color,
  textColor,
  children,
}: KanbanColumnProps) {
  return (
    <div className="flex flex-col h-[600px]">
      {/* Column Header */}
      <div className={`bg-gradient-to-r ${color} rounded-t-lg p-4 mb-0`}>
        <div className="flex justify-between items-center">
          <h3 className={`font-bold text-lg ${textColor}`}>{title}</h3>
          <span className={`${textColor} bg-white/60 px-3 py-1 rounded-full text-sm font-semibold`}>
            {count}
          </span>
        </div>
      </div>

      {/* Cards Container */}
      <div className="flex-1 overflow-y-auto bg-muted/30 rounded-b-lg p-4 space-y-3">
        {children}
        {count === 0 && (
          <div className="h-32 flex items-center justify-center text-center">
            <p className="text-muted-foreground text-sm">No issues in this column</p>
          </div>
        )}
      </div>
    </div>
  )
}
