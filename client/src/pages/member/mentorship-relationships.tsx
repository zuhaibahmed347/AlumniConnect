import { Button } from '@/components/ui/button'
import { ThemeSwitcher } from '@/components/ui/theme-switcher'
import { toast } from '@/lib/toast'
import { Loader2, Calendar, Users } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { useState, useEffect } from 'react'

export function MentorshipRelationshipsPage() {
  const [relationships, setRelationships] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, this would fetch mentorship relationships from the API
    const mockRelationships = [
      {
        id: '1',
        mentorName: 'Dr. Sarah Khan',
        menteeName: 'Ahmed Hassan',
        status: 'ACTIVE',
        requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90),
        startedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60),
        meetingCount: 8,
        lastMeeting: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
        duration: '6 months',
        goals: ['Career transition', 'Leadership development', 'Technical growth'],
      },
      {
        id: '2',
        mentorName: 'Ahmed Khan',
        menteeName: 'Fatima Shah',
        status: 'PENDING',
        requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
        startedAt: null,
        meetingCount: 0,
        lastMeeting: null,
        duration: 'Pending',
        goals: ['Career advice'],
      },
      {
        id: '3',
        mentorName: 'Usman Khan',
        menteeName: 'Saba Ahmed',
        status: 'COMPLETED',
        requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180),
        startedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
        meetingCount: 12,
        lastMeeting: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
        duration: '6 months',
        goals: ['Career planning'],
      },
    ]

    setRelationships(mockRelationships)
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen bg-background p-8">
        <div className="max-w-2xl mx-auto text-center">
          <Loader2 className="h-6 w-6 mx-auto mb-3" />
          <p>Loading mentorship relationships...</p>
        </div>
      </main>
    )
  }

  const statusLabels: Record<string, { className: string; label: string }> = {
    ACTIVE: { className: 'bg-success/20 text-success', label: 'Active' },
    PENDING: { className: 'bg-warning/20 text-warning', label: 'Pending' },
    COMPLETED: { className: 'bg-success/20 text-success', label: 'Completed' },
    CANCELLED: { className: 'bg-error/20 text-error', label: 'Cancelled' },
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/80 bg-background/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight">Mentorship Relationships</h1>
            <Calendar className="h-5 w-5 text-secondary" />
          </div>
          <div className="flex items-center gap-2.5">
            <ThemeSwitcher />
            <Button variant="ghost" size="sm" onClick={() => toast.success('Mentorship request modal ready')}>
              <Users className="h-4 w-4 mr-2" /> New Request
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <section className="bg-card text-foreground border border-border rounded-2xl p-5 mb-6 shadow-card">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-2xl font-bold text-foreground">3</p>
              <p className="text-secondary">Active</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">1</p>
              <p className="text-secondary">Pending</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">1</p>
              <p className="text-secondary">Completed</p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <div className="max-w-7xl mx-auto">
            <div className="overflow-x-auto">
              {loading && (
                <div className="min-h-[200px] flex flex-col items-center justify-center py-8 text-secondary">
                  <Loader2 className="h-6 w-6 mx-auto mb-3" />
                  <p>Loading relationships...</p>
                </div>
              )}

              {!loading && relationships.length === 0 && (
                <div className="min-h-[200px] flex flex-col items-center justify-center py-8 text-secondary">
                  <svg
                    className="h-8 w-8 mb-3 opacity-50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v6a2 2 0 002 2H9a2 2 0 002-2zM5 13l7 7-7 7"
                    />
                  </svg>
                  <p>No mentorship relationships found</p>
                </div>
              )}

              {relationships.map((rel) => (
                <div
                  key={rel.id}
                  className="group rounded-lg border bg-card p-4 hover:bg-card/80 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-md flex-shrink-0">
                      <Avatar
                        className="h-8 w-8"
                        >{rel.mentorName.substring(0, 2)}</Avatar>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{rel.mentorName}</p>
                      <p className="text-xs text-secondary/70 truncate">
                        Mentoring {rel.menteeName}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span
                        className={statusLabels[rel.status]?.className || 'text-secondary/70'}
                      >
                        {statusLabels[rel.status]?.label || rel.status}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-border/10">
                    <p className="text-secondary/80 text-sm mb-1">
                      Status: {statusLabels[rel.status]?.label || rel.status}
                    </p>
                    <p className="text-secondary/80 text-sm mb-2">
                      {rel.duration} · {rel.meetingCount} meetings
                    </p>
                    {rel.lastMeeting && (
                      <p className="text-xs text-secondary/70">
                        Last meeting: {new Date(rel.lastMeeting).toLocaleDateString()}
                      </p>
                    )}
                    <div className="mt-2 flex gap-2">
                      {rel.status === 'PENDING' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toast.success('Accepted mentorship request')}
                        >
                          Accept
                        </Button>
                      )}
                      {rel.status === 'ACTIVE' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toast.success('Session note saved')}
                        >
                          Note
                        </Button>
                      )}
                      {['ACTIVE', 'PENDING'].includes(rel.status) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toast.success('Mentorship status updated')}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {relationships.length === 0 && !loading && (
                <div className="min-h-[200px] flex flex-col items-center justify-center py-8 text-secondary">
                  <svg
                    className="h-8 w-8 mb-3 opacity-50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v6a2 2 0 002 2H9a2 2 0 002-2zM5 13l7 7-7 7"
                    />
                  </svg>
                  <p>No mentorship relationships found</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}