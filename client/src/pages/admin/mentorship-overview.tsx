import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ThemeSwitcher } from '@/components/ui/theme-switcher'
import { toast } from '@/lib/toast'
import { MessageCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function AdminMentorshipOverviewPage() {
  const navigate = useNavigate()

  const [requests, setRequests] = useState<any[]>([])
  const [relationships, setRelationships] = useState<any[]>([])

  useEffect(() => {
    const mockRequests = [
      {
        id: '1',
        mentorName: 'Dr. Sarah Khan',
        menteeName: 'Ahmed Hassan',
        message: 'Looking for guidance on transitioning into senior engineering roles.',
        status: 'PENDING',
        requestedAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
      },
      {
        id: '2',
        mentorName: 'Ahmed Khan',
        menteeName: 'Fatima Shah',
        message: 'Seeking career advice in finance and investment.',
        status: 'PENDING',
        requestedAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
      },
      {
        id: '3',
        mentorName: 'Usman Khan',
        menteeName: 'Saba Ahmed',
        message: 'Interest in product management career path.',
        status: 'ACCEPTED',
        requestedAt: Date.now() - 1000 * 60 * 60 * 24 * 20,
        respondedAt: Date.now() - 1000 * 60 * 60 * 24 * 15,
        startedAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
      },
    ]

    const mockRelationships = [
      {
        id: '1',
        mentorName: 'Dr. Sarah Khan',
        menteeName: 'Ahmed Hassan',
        status: 'ACTIVE',
        startedAt: Date.now() - 1000 * 60 * 60 * 24 * 90,
        meetingCount: 8,
        goals: ['Career transition', 'Leadership development'],
      },
      {
        id: '2',
        mentorName: 'Ahmed Khan',
        menteeName: 'Fatima Shah',
        status: 'ACTIVE',
        startedAt: Date.now() - 1000 * 60 * 60 * 24 * 60,
        meetingCount: 3,
        goals: ['Career advice'],
      },
    ]

    setRequests(mockRequests)
    setRelationships(mockRelationships)
  }, [])

  const pendingCount = requests.filter((r) => r.status === 'PENDING').length
  const activeCount = relationships.filter((r) => r.status === 'ACTIVE').length

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-foreground">Mentorship Oversight</h1>
            <MessageCircle className="h-5 w-5 text-secondary" />
          </div>
          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
              ← Back to Command Center
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-stone/40 border border-border">
              <p className="text-2xl font-bold text-foreground font-mono">{pendingCount}</p>
              <p className="text-secondary text-sm">Pending Requests</p>
            </div>
            <div className="p-4 rounded-lg bg-stone/40 border border-border">
              <p className="text-2xl font-bold text-foreground font-mono">{activeCount}</p>
              <p className="text-secondary text-sm">Active Relationships</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4">Pending Mentorship Requests</h2>
          {requests.length === 0 ? (
            <p className="text-secondary">No pending requests</p>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-lg border bg-warning/10 border-warning/30 hover:bg-warning/15 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        {req.mentorName.substring(0, 2)}
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground">
                          {req.mentorName} mentoring {req.menteeName}
                        </p>
                        <p className="text-xs text-secondary mt-0.5">
                          "{req.message}"
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toast({ title: 'Request Approved', description: `Approved mentorship between ${req.mentorName} and ${req.menteeName}.`, variant: 'success' })}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toast({ title: 'Request Declined', description: `Declined mentorship request.`, variant: 'default' })}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4">Active Mentorship Relationships</h2>
          {relationships.length === 0 ? (
            <p className="text-secondary">No active relationships</p>
          ) : (
            <div className="space-y-3">
              {relationships.map((rel) => (
                <div
                  key={rel.id}
                  className="p-4 rounded-lg border bg-primary/10 border-primary/20 hover:bg-primary/15 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      {rel.mentorName.substring(0, 2)}
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground">
                        {rel.mentorName} mentoring {rel.menteeName}
                      </p>
                      <p className="text-xs text-secondary mt-0.5">
                        {rel.goals ? rel.goals.join(', ') : 'No goals specified'}
                      </p>
                      <p className="text-xs text-secondary mt-1">
                        {rel.meetingCount} meetings · Started {new Date(rel.startedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}