import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
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
    <main className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight">Mentorship Oversight</h1>
            <MessageCircle className="h-5 w-5 text-secondary" />
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
            ← Back to Command Center
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg p-6 mb-8">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-2xl font-bold">{pendingCount}</p>
              <p className="text-secondary/80">Pending Requests</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{activeCount}</p>
              <p className="text-secondary/80">Active Relationships</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 mb-8">
          <h2 className="text-lg font-medium mb-3">Pending Mentorship Requests</h2>
          {requests.length === 0 ? (
            <p className="text-secondary/80">No pending requests</p>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="p-3 rounded-lg border bg-warning/5 border-warning/20 hover:bg-warning/10 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-md flex-shrink-0">
                      <Avatar
                        className="h-6 w-6"
                        >{req.mentorName.substring(0, 2)}</Avatar>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium">
                        {req.mentorName} mentoring {req.menteeName}
                      </p>
                      <p className="text-xs text-secondary/70">
                        "{req.message}"
                      </p>
                    </div>

                    <div className="mt-2 flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => alert('Accept')}>
                        Accept
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => alert('Reject')}>
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg p-6">
          <h2 className="text-lg font-medium mb-3">Active Mentorship Relationships</h2>
          {relationships.length === 0 ? (
            <p className="text-secondary/80">No active relationships</p>
          ) : (
            <div className="space-y-3">
              {relationships.map((rel) => (
                <div
                  key={rel.id}
                  className="p-3 rounded-lg border bg-primary/5 border-primary/20 hover:bg-primary/10 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-md flex-shrink-0">
                      <Avatar
                        className="h-6 w-6"
                        >{rel.mentorName.substring(0, 2)}</Avatar>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium">
                        {rel.mentorName} mentoring {rel.menteeName}
                      </p>
                      <p className="text-xs text-secondary/70">
                        {rel.goals ? rel.goals.join(', ') : 'No goals specified'}
                      </p>
                      <p className="text-xs text-secondary/70">
                        {rel.meetingCount} meetings ·
                        Started{
                          new Date(rel.startedAt).toLocaleDateString()
                        }
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