import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ActionCardProps {
  icon: 'building' | 'user-plus' | 'users'
  title: string
  description: string
  onClick: () => void
  color?: string
}

const iconMap = {
  building: (
    <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2v14a2 2 0 01-2 2z" />
    </svg>
  ),
  'user-plus': (
    <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </svg>
  ),
  users: (
    <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20a6 6 0 0112 0v2H0v-2a6 6 0 0112 0z" />
    </svg>
  ),
}

export default function ActionCard({ icon, title, description, onClick, color = 'from-blue-50 to-blue-100' }: ActionCardProps) {
  return (
    <Card className={`p-6 border-0 shadow-md bg-gradient-to-br ${color} hover:shadow-lg transition-shadow cursor-pointer group`} onClick={onClick}>
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-white rounded-lg group-hover:scale-110 transition-transform">
          {iconMap[icon]}
        </div>
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm mb-4">{description}</p>
      <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
        Get Started
      </Button>
    </Card>
  )
}
