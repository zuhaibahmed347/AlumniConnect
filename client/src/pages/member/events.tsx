import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, UserPlus } from 'lucide-react'
import { useState, useEffect } from 'react'
import type { EventStatus } from '@alumni-connect/shared/types'

export function EventsHubPage() {

  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    status: undefined as EventStatus | undefined,
    isVirtual: undefined as boolean | undefined,
    page: 1,
    limit: 10,
  })

  useEffect(() => {
    // In a real app, this would fetch events from the API
    const mockEvents = [
      {
        id: '1',
        title: 'Alumni Reunion 2024',
        slug: 'alumni-reunion-2024',
        description: 'Annual gathering of Sukkur IBA alumni',
        coverImageUrl: 'https://images.unsplash.com/photo-1556462564-9286e9b853c6?w=800&h=400&fit=crop',
        startDate: new Date('2024-12-15'),
        endDate: new Date('2024-12-17'),
        timezone: 'UTC',
        location: 'Sukkur IBA University Campus',
        isVirtual: false,
        capacity: 200,
        status: 'PUBLISHED',
        organizer: { name: 'Alumni Association' },
        registrationCount: 156,
        _count: { registrations: 156 },
      },
      {
        id: '2',
        title: 'Career Development Seminar',
        slug: 'career-development-seminar',
        description: 'Professional development and career growth seminar',
        coverImageUrl: 'https://images.unsplash.com/photo-1581091012184-7e0c9b36c793?w=800&h=400&fit=crop',
        startDate: new Date('2024-11-20'),
        endDate: new Date('2024-11-20'),
        timezone: 'UTC',
        location: 'Online (Zoom)',
        isVirtual: true,
        virtualUrl: 'https://zoom.us/j/1234567890',
        capacity: 100,
        status: 'PUBLISHED',
        organizer: { name: 'CDC' },
        registrationCount: 89,
        _count: { registrations: 89 },
      },
      {
        id: '3',
        title: 'Guest Lecture: AI in Business',
        slug: 'guest-lecture-ai-in-business',
        description: 'Exploring the impact of AI on modern business',
        coverImageUrl: 'https://images.unsplash.com/photo-1611759117461-f10d50723b1d?w=800&h=400&fit=crop',
        startDate: new Date('2024-10-25'),
        endDate: new Date('2024-10-25'),
        timezone: 'UTC',
        location: 'Sukkur IBA University - Auditorium',
        isVirtual: false,
        capacity: 50,
        status: 'COMPLETED',
        organizer: { name: 'Computer Science Department' },
        registrationCount: 50,
        _count: { registrations: 50 },
      },
    ]

    setEvents(mockEvents)
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen bg-background p-8">
        <div className="min-h-[200px] flex flex-col items-center justify-center py-8">
          <Loader2 className="h-6 w-6 mx-auto mb-3" />
          <p>Loading events...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">Events</h1>
          <Button variant="ghost" size="sm">
            <UserPlus className="h-4 w-4 mr-2" /> Create Event
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Filters */}
        <section className="mb-6 rounded-lg border bg-card/50 p-4">
          <h2 className="text-sm font-medium mb-4 text-secondary">Filter Events</h2>
          <form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            
            {/* Search */}
            <div>
              <Input
                placeholder="Search events..."
                className="flex-1 rounded border border-border px-3 py-2"
              />
            </div>

            {/* Status */}
            <div>
              <select className="rounded border border-border px-3 py-2">
                <option>All Statuses</option>
                <option>Published</option>
                <option>Draft</option>
                <option>Completed</option>
                <option>Cancelled</option>
              </select>
            </div>

            {/* Virtual */}
            <div>
              <select className="rounded border border-border px-3 py-2">
                <option>All</option>
                <option>In-person</option>
                <option>Online</option>
              </select>
            </div>

            {/* Apply Filters */}
            <Button type="submit" className="sm:col-auto w-auto">
              Apply
            </Button>
          </form>
        </section>

        {/* Events Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading && (
            <div className="min-h-[300px] flex flex-col items-center justify-center py-8 text-secondary">
              <Loader2 className="h-6 w-6 mx-auto mb-3" />
              <p>Loading events...</p>
            </div>
          )}

          {!loading && events.length === 0 && !loading && (
            <div className="min-h-[300px] flex flex-col items-center justify-center py-8 text-secondary text-center">
              <svg className="h-8 w-8 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v6a2 2 0 002 2H9a2 2 0 002-2zM5 13l7 7-7 7" />
              </svg>
              <p>No events found matching your criteria.</p>
            </div>
          )}

          {events.map((event) => {
            const start = event.startDate
            const end = event.endDate
            const isVirtual = event.isVirtual
            const status = event.status
            
            // Determine status label and color
            const statusLabels: Record<string, { label: string; className: string }> = {
              PUBLISHED: { label: 'Upcoming', className: 'text-primary bg-primary/10' },
              COMPLETED: { label: 'Completed', className: 'text-success bg-success/10' },
              CANCELLED: { label: 'Cancelled', className: 'text-warning bg-warning/10' },
              DRAFT: { label: 'Draft', className: 'text-secondary bg-secondary/10' },
            }

            const statusInfo = statusLabels[status] || { label: status, className: 'text-secondary' }

            return (
              <div
                key={event.id}
                className={`rounded-lg border bg-card p-4 hover:bg-card/80 transition-colors cursor-pointer ${isVirtual ? 'opacity-80' : ''}`}
              >
                {event.coverImageUrl && (
                  <img
                    src={event.coverImageUrl}
                    alt={event.title}
                    className="w-full h-40 object-cover rounded-md mb-3"
                  />
                )}
                <h4 className="font-medium mb-1">{event.title}</h4>
                <p className="text-sm text-secondary/70 line-clamp-2 mb-3">
                  {event.description}
                </p>
                <div className="flex items-center justify-between text-xs text-secondary">
                  <div>
                    <span>{event.location}</span>
                    {isVirtual && (
                      <a
                        href={event.virtualUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-primary hover:text-secondary"
                      >
                        Online
                      </a>
                    )}
                  </div>
                  <span className={statusInfo.className}>
                    {statusInfo.label}
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-border/10 flex items-center justify-between">
                  <div>
                    <span>{start.toLocaleDateString()}</span>
                    {end && start !== end && (
                      <span> - {end.toLocaleDateString()}</span>
                    )}
                  </div>
                  <span>{event.registrationCount} registered</span>
                </div>
              </div>
            )
          })}

          {/* Pagination */}
          {events.length > 0 && (
            <div className="mt-6 flex justify-center items-center gap-2 text-sm text-secondary">
              <span>Page {filters.page} of {Math.ceil(events.length / filters.limit)}</span>
              <Button
                variant="outline"
                size="default"
                className="h-8 w-8 flex items-center justify-center"
                onClick={() => setFilters({ ...filters, page: 1 })}
              >
                First
              </Button>
              <Button
                variant="outline"
                size="default"
                className="h-8 w-8 flex items-center justify-center"
                onClick={() => setFilters({ ...filters, page: Math.max(filters.page - 1, 1)})}
              >
                Prev
              </Button>
              <Button
                variant="outline"
                size="default"
                className="h-8 w-8 flex items-center justify-center"
                onClick={() => setFilters({ ...filters, page: Math.min(filters.page + 1, 4)})}
              >
                Next
              </Button>
              <Button
                variant="outline"
                size="default"
                className="h-8 w-8 flex items-center justify-center"
                onClick={() => setFilters({ ...filters, page: 4 })}
              >
                Last
              </Button>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}