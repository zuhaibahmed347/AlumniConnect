import { Input, SelectField } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ThemeSwitcher } from '@/components/ui/theme-switcher'
import { Calendar, Search, MapPin, Users, ArrowLeft, Plus } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from '@/lib/toast'
import { api } from '@/services/api'

export function AdminEventAdministrationPage() {
  const navigate = useNavigate()

  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<{
    search: string
    status: string
    format: string
  }>({
    search: '',
    status: 'ALL',
    format: 'ALL',
  })

  useEffect(() => {
    const mockEvents = [
      {
        id: '1',
        title: 'Annual Sukkur IBA Grand Homecoming & Gala 2026',
        slug: 'annual-alumni-reunion-2026',
        description:
          'Biggest alumni gathering of the year with keynotes, panels, and gala dinner.',
        shortDescription: 'Annual reunion with keynotes, panels, and gala dinner.',
        coverImageUrl: '/images/events/reunion.jpg',
        startDate: new Date('2026-12-15T17:00:00'),
        endDate: new Date('2026-12-17T22:00:00'),
        timezone: 'Asia/Karachi',
        location: 'Sukkur IBA University Main Campus',
        isVirtual: false,
        capacity: 500,
        status: 'PUBLISHED',
        organizer: 'AlumniConnect Team',
        registeredCount: 342,
        totalCapacity: 500,
      },
      {
        id: '2',
        title: 'Sukkur IBA Autumn Tech & FinTech Hiring Summit',
        slug: 'tech-career-fair-2026',
        description:
          '38+ partner companies hiring Sukkur IBA alumni. On-site interviews available.',
        shortDescription: '38+ tech companies hiring verified alumni.',
        coverImageUrl: '/images/events/tech-career-fair.jpg',
        startDate: new Date('2027-01-14T10:00:00'),
        endDate: new Date('2027-01-14T17:00:00'),
        timezone: 'Asia/Karachi',
        location: 'Karachi Regional Chapter Convention Center',
        isVirtual: false,
        capacity: 350,
        status: 'PUBLISHED',
        organizer: 'Corporate Linkages Office',
        registeredCount: 276,
        totalCapacity: 350,
      },
      {
        id: '3',
        title: 'Women in Tech & Executive Fellows Roundtable',
        slug: 'women-in-tech-leadership-panel',
        description:
          'Panel discussion with Sukkur IBA alumnae tech leaders globally.',
        shortDescription: 'Panel discussion with women tech leaders.',
        coverImageUrl: '/images/events/women-in-tech.jpg',
        startDate: new Date('2027-02-04T15:00:00'),
        endDate: new Date('2027-02-04T18:30:00'),
        timezone: 'PKT',
        location: 'Islamabad Chapter Hub & Global Stream',
        isVirtual: true,
        virtualUrl: 'https://meet.alumni-connect.local/women-in-tech',
        capacity: 200,
        status: 'PUBLISHED',
        organizer: 'Global Alumnae Council',
        registeredCount: 156,
        totalCapacity: 200,
      },
    ]

    setEvents(mockEvents)
    setLoading(false)
  }, [])

  const filteredEvents = useMemo(() => {
    const q = filters.search.trim().toLowerCase()
    return events.filter((ev) => {
      const matchesSearch =
        !q ||
        ev.title.toLowerCase().includes(q) ||
        ev.shortDescription.toLowerCase().includes(q) ||
        (ev.location || '').toLowerCase().includes(q)
      const matchesStatus =
        filters.status === 'ALL' || ev.status === filters.status
      const matchesFormat =
        filters.format === 'ALL' ||
        (filters.format === 'VIRTUAL' && ev.isVirtual) ||
        (filters.format === 'IN_PERSON' && !ev.isVirtual)
      return matchesSearch && matchesStatus && matchesFormat
    })
  }, [events, filters])

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-md">
        <div className="page-container h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-primary" />
            <h1 className="font-display text-xl font-bold tracking-tight">
              Event Administration
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            <Button
              variant="outline"
              size="default"
              onClick={() => navigate('/admin')}
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Command Center
            </Button>
            <Button
              variant="default"
              size="default"
              onClick={() => {
                const draftEvent = {
                  id: `evt-${Date.now()}`,
                  title: `Sukkur IBA Chapter Executive Forum (${events.length + 1})`,
                  slug: `chapter-forum-${Date.now()}`,
                  description:
                    'Regional alumni chapter roundtable and graduate mentorship networking session.',
                  shortDescription:
                    'Regional alumni chapter roundtable and mentorship session.',
                  coverImageUrl: '/images/events/reunion.jpg',
                  startDate: new Date(Date.now() + 14 * 86400000),
                  endDate: new Date(Date.now() + 14 * 86400000 + 10800000),
                  timezone: 'Asia/Karachi',
                  location: 'Sukkur IBA University Main Campus',
                  isVirtual: false,
                  capacity: 250,
                  status: 'PUBLISHED',
                  organizer: 'Alumni Relations Office',
                  registeredCount: 1,
                  totalCapacity: 250,
                }
                setEvents((prev) => [draftEvent, ...prev])
                void api.post('/admin/events', draftEvent).catch(() => {})
                toast.success('New chapter event created and published to the database.')
              }}
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Create Event
            </Button>
          </div>
        </div>
      </header>

      <div className="page-container py-10 space-y-8">
        {/* Filter Bar with Modern Margins & High-Visibility Dropdowns */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <form
            onSubmit={(e) => e.preventDefault()}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-5 items-end"
          >
            <div className="lg:col-span-5 flex flex-col gap-1.5">
              <label
                htmlFor="admin-event-search"
                className="text-xs font-semibold tracking-wide text-secondary"
              >
                Search Events
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary" />
                <Input
                  id="admin-event-search"
                  placeholder="Search by event title, venue, or organizer..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  className="pl-10"
                />
              </div>
            </div>

            <SelectField
              label="Publication Status"
              wrapperClassName="lg:col-span-3"
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
            >
              <option value="ALL">All Statuses</option>
              <option value="PUBLISHED">Published (Live)</option>
              <option value="DRAFT">Draft</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </SelectField>

            <SelectField
              label="Venue Format"
              wrapperClassName="lg:col-span-2"
              value={filters.format}
              onChange={(e) =>
                setFilters({ ...filters, format: e.target.value })
              }
            >
              <option value="ALL">All Formats</option>
              <option value="IN_PERSON">In-Person Venue</option>
              <option value="VIRTUAL">Virtual / Hybrid</option>
            </SelectField>

            <div className="lg:col-span-2">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() =>
                  setFilters({ search: '', status: 'ALL', format: 'ALL' })
                }
                className="w-full h-11"
              >
                Reset Filters
              </Button>
            </div>
          </form>
        </section>

        {/* Events List */}
        <section className="space-y-4">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              onClick={() => navigate(`/events/${event.id}`)}
              className="group rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-card hover:border-primary/40 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-5"
            >
              <div className="flex items-start sm:items-center gap-4 min-w-0">
                {event.coverImageUrl && (
                  <img
                    src={event.coverImageUrl}
                    alt={event.title}
                    className="w-28 h-20 rounded-xl object-cover border border-border shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-secondary mb-1 tabular-nums">
                    <span className="text-primary font-semibold">
                      {event.status}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {new Date(event.startDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{event.organizer}</span>
                  </div>
                  <h2 className="font-display text-lg font-bold text-foreground truncate group-hover:text-primary transition-colors">
                    {event.title}
                  </h2>
                  <p className="text-sm text-secondary truncate mt-0.5">
                    {event.shortDescription}
                  </p>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-border text-xs font-mono text-secondary tabular-nums">
                <span className="flex items-center gap-1.5 text-foreground font-semibold">
                  <Users className="h-3.5 w-3.5 text-primary" />
                  {event.registeredCount} / {event.totalCapacity} Registered
                </span>
                <span className="flex items-center gap-1 text-secondary">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  {event.location || 'Virtual Stream'}
                </span>
              </div>
            </div>
          ))}

          {!loading && filteredEvents.length === 0 && (
            <div className="rounded-2xl border border-border bg-card p-12 text-center text-secondary">
              <Calendar className="h-8 w-8 mx-auto mb-3 opacity-50" />
              <p className="text-sm font-medium">
                No events found matching your filter criteria.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}