import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Calendar } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function AdminEventAdministrationPage() {
  const navigate = useNavigate()

  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<{ search: string; status: string }>({
    search: '',
    status: '',
})

  useEffect(() => {
    const mockEvents = [
      {
        id: '1',
        title: 'Annual Alumni Reunion 2024',
        slug: 'annual-alumni-reunion-2024',
        description:
          'Biggest alumni gathering of the year with keynotes, panels, and gala dinner.',
        shortDescription: 'Annual reunion with keynotes, panels, and gala dinner.',
        coverImageUrl: '/images/events/reunion.jpg',
        startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45),
        endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45 + 1000 * 60 * 60 * 5),
        timezone: 'Asia/Karachi',
        location: 'Sukkur IBA University Main Campus',
        isVirtual: false,
        capacity: 500,
        status: 'PUBLISHED',
        organizer: 'AlumniConnect Team',
        registeredCount: 234,
        totalCapacity: 500,
      },
      {
        id: '2',
        title: 'Tech Career Fair 2024',
        slug: 'tech-career-fair-2024',
        description:
          '30+ tech companies hiring alumni. On-site interviews available.',
        shortDescription: '30+ tech companies hiring alumni.',
        // No photo supplied for this event yet — empty string renders the
        // designed placeholder box instead of a 404 <img>.
        coverImageUrl: '',
        startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30 + 1000 * 60 * 60 * 6),
        timezone: 'Asia/Karachi',
        location: 'Sukkur IBA University Auditorium',
        isVirtual: false,
        capacity: 300,
        status: 'PUBLISHED',
        organizer: 'Event Manager',
        registeredCount: 189,
        totalCapacity: 300,
      },
      {
        id: '3',
        title: 'Women in Tech Leadership Panel',
        slug: 'women-in-tech-leadership-panel',
        description:
          'Panel discussion with women tech leaders globally.',
        shortDescription: 'Panel discussion with women tech leaders.',
        // No photo supplied for this event yet — empty string renders the
        // designed placeholder box instead of a 404 <img>.
        coverImageUrl: '',
        startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15),
        endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15 + 1000 * 60 * 60 * 2),
        timezone: 'UTC',
        isVirtual: true,
        virtualUrl: 'https://meet.alumni-connect.local/women-in-tech',
        capacity: 200,
        status: 'PUBLISHED',
        organizer: 'Event Manager',
        registeredCount: 156,
        totalCapacity: 200,
      },
    ]

    setEvents(mockEvents)
    setLoading(false)
  }, [])

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight">Event Administration</h1>
            <Calendar className="h-5 w-5 text-secondary" />
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
            ← Back to Command Center
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div>
          <div className="bg-white rounded-lg p-4 mb-6">
            <form className="grid grid-cols-1 sm:grid-cols-6 gap-3">
              <div>
                <Input
                  placeholder="Search events..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  className="rounded border border-border px-3 py-2"
                />
              </div>
              <div>
                <select
                  value={filters.status || ''}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      status: (e.target.value || undefined) as string
                    })
                  }
                  className="rounded border border-border px-3 py-2"
                >
                  <option value="">All Statuses</option>
                  <option>DRAFT</option>
                  <option>PUBLISHED</option>
                  <option>CANCELLED</option>
                  <option>COMPLETED</option>
                </select>
              </div>
              <div>
                <Button type="submit" className="sm:col-auto w-auto">
                  Apply Filters
                </Button>
              </div>
            </form>
          </div>

          <div className="bg-white">
            <div className="max-w-7xl mx-auto">
              <div className="overflow-x-auto">
                <div className="space-y-2">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="group rounded-lg border bg-card p-4 hover:bg-card/80 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        {event.coverImageUrl && (
                          <div className="w-24 h-14 rounded-md overflow-hidden flex-shrink-0">
                            <img
                              src={event.coverImageUrl}
                              alt={event.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        {!event.coverImageUrl && (
                          <div className="w-24 h-14 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <svg
                              className="h-6 w-6 text-primary"
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
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{event.title}</p>
                          <p className="text-xs text-secondary/70 truncate">
                            {event.shortDescription || ''}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 text-xs">
                          <span className='text-secondary/70'>
                            {event.status}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-border/10 text-xs text-secondary">
                        <p>
                          {new Date(event.startDate).toLocaleDateString()} ·
                          {event.location}
                        </p>
                        <p>
                          Registered: {event.registeredCount}/{event.totalCapacity}
                        </p>
                      </div>
                    </div>
                  ))}

                  {loading || events.length === 0 && (
                    <div className="min-h-[200px] flex flex-col items-center justify-center py-8 text-secondary">
                      <Calendar className="h-8 w-8 mb-3 opacity-50" />
                      <p>No events found matching your criteria</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}