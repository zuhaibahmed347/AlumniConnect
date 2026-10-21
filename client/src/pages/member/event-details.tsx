import { Button } from '@/components/ui/button'
import { SelectField } from '@/components/ui/input'
import { ThemeSwitcher } from '@/components/ui/theme-switcher'
import { MediaImage } from '@/components/ui/media-image'
import {
  Loader2,
  Clock,
  Check,
  Calendar,
  MapPin,
  Users,
  ArrowLeft,
  Sparkles,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from '@/lib/toast'

export function EventDetailsPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [event, setEvent] = useState<any>(null)
  const [registrationStatus, setRegistrationStatus] = useState<
    'registered' | 'waitlisted' | 'not-registered'
  >('not-registered')
  const [attendanceMode, setAttendanceMode] = useState<'in-person' | 'virtual'>(
    'in-person',
  )
  const [dietaryPreference, setDietaryPreference] = useState('standard')

  useEffect(() => {
    const id = eventId || '1'
    const catalog: Record<string, any> = {
      '1': {
        id: '1',
        title: 'Annual Sukkur IBA Grand Homecoming & Gala 2026',
        category: 'Campus Reunion · Flagship Gathering',
        description:
          'Join us for the largest Sukkur IBA alumni gathering of the year. Reconnect with cohort classmates, network with senior graduates across 42 countries, and celebrate three decades of institutional excellence. Features keynote addresses, faculty roundtables, and the annual scholarship gala dinner.',
        shortDescription:
          'Includes full access to keynote sessions, cohort breakout lounges, and the evening gala dinner at the Main Auditorium.',
        coverImageUrl: '/images/events/reunion.jpg',
        startDate: new Date('2026-12-15T17:00:00'),
        endDate: new Date('2026-12-17T22:00:00'),
        timezone: 'PKT (UTC+5)',
        location: 'Main Auditorium, Sukkur IBA University',
        isVirtual: false,
        capacity: 450,
        status: 'PUBLISHED',
        organizer: 'Alumni Association Executive Board',
        registeredCount: 342,
        totalCapacity: 450,
        waitlistCount: 0,
        registrationDeadline: new Date('2026-12-10T23:59:00'),
      },
      '2': {
        id: '2',
        title: 'Executive Product & Career Acceleration Colloquium',
        category: 'Leadership Seminar · Hybrid',
        description:
          'Interactive executive seminar on transitioning from senior engineering and finance roles into VP and C-suite leadership across global markets.',
        shortDescription:
          'Live stream link and executive workbook distributed 24 hours prior to the session.',
        coverImageUrl: '/images/events/seminar.jpg',
        startDate: new Date('2026-11-20T18:30:00'),
        endDate: new Date('2026-11-20T21:00:00'),
        timezone: 'PKT / GST',
        location: 'Online Live Stream & Dubai DIFC Hub',
        isVirtual: true,
        capacity: 250,
        status: 'PUBLISHED',
        organizer: 'Career Development Center (CDC)',
        registeredCount: 198,
        totalCapacity: 250,
        waitlistCount: 4,
        registrationDeadline: new Date('2026-11-18T23:59:00'),
      },
    }

    setEvent(catalog[id] ?? catalog['1'])
    setLoading(false)
  }, [eventId])

  if (loading) {
    return (
      <main className="min-h-screen bg-background p-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-7 w-7 mx-auto mb-3 animate-spin text-primary" />
          <p className="text-sm font-medium text-secondary">
            Loading event details...
          </p>
        </div>
      </main>
    )
  }

  if (!event) {
    return (
      <main className="min-h-screen bg-background p-8">
        <div className="max-w-xl mx-auto text-center py-16 rounded-2xl border border-border bg-card p-8">
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            Event Not Found
          </h2>
          <p className="text-sm text-secondary mb-6">
            The event you requested could not be found.
          </p>
          <Button onClick={() => navigate('/events')}>Back to Events Hub</Button>
        </div>
      </main>
    )
  }

  const isExpired = new Date(event.registrationDeadline) < new Date()
  const isAtCapacity = event.registeredCount >= event.totalCapacity
  const hasSpace = event.registeredCount < event.totalCapacity

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Sticky Top Bar */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-md">
        <div className="page-container h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="outline"
              size="default"
              onClick={() => navigate('/events')}
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back to Events
            </Button>
            <span aria-hidden="true" className="text-border hidden sm:inline">
              /
            </span>
            <span className="text-xs font-mono text-secondary truncate hidden sm:inline">
              {event.category}
            </span>
          </div>
          <ThemeSwitcher />
        </div>
      </header>

      {/* Main Content Container with Balanced Margins */}
      <div className="page-container py-10 sm:py-12 space-y-8">
        {/* Hero Banner Card */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-border bg-card overflow-hidden shadow-card"
        >
          <div className="grid lg:grid-cols-12 items-stretch">
            <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-primary font-semibold mb-3 tabular-nums">
                  <span>{event.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-secondary">
                    Organized by {event.organizer}
                  </span>
                </div>
                <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-foreground text-balance mb-4">
                  {event.title}
                </h1>
                <p className="text-sm sm:text-base text-secondary leading-relaxed mb-6">
                  {event.description}
                </p>
              </div>

              <div className="pt-5 border-t border-border flex flex-wrap items-center gap-6 text-xs font-mono text-secondary tabular-nums">
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  {new Date(event.startDate).toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  {event.location}
                </span>
              </div>
            </div>

            <div className="lg:col-span-5 min-h-[260px] sm:min-h-[320px] relative">
              <MediaImage
                src={event.coverImageUrl}
                alt={event.title}
                className="h-full w-full rounded-none"
                imgClassName="h-full w-full object-cover object-center"
              />
            </div>
          </div>
        </motion.section>

        {/* 4 Key Event Telemetry Cards (Aligned Equal Heights) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-card flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-mono text-secondary mb-2">
              <span>Date</span>
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <p className="font-display text-lg font-bold text-foreground">
              {new Date(event.startDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
            <p className="text-xs text-secondary mt-1">
              Deadline:{' '}
              {new Date(event.registrationDeadline).toLocaleDateString()}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-card flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-mono text-secondary mb-2">
              <span>Schedule ({event.timezone})</span>
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <p className="font-mono text-lg font-bold text-foreground tabular-nums">
              {new Date(event.startDate).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}{' '}
              –{' '}
              {new Date(event.endDate).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            <p className="text-xs text-secondary mt-1">Doors open 30 mins prior</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-card flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-mono text-secondary mb-2">
              <span>Venue & Format</span>
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <p className="font-display text-base font-bold text-foreground truncate">
              {event.location}
            </p>
            <p className="text-xs text-primary font-medium mt-1">
              {event.isVirtual ? 'Hybrid · Online & In-Person' : 'In-Person Campus Venue'}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-card flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-mono text-secondary mb-2">
              <span>Confirmed Capacity</span>
              <Users className="h-4 w-4 text-primary" />
            </div>
            <p className="font-mono text-lg font-bold text-foreground tabular-nums">
              {event.registeredCount} / {event.totalCapacity} Seats
            </p>
            <p className="text-xs text-secondary mt-1">
              {event.totalCapacity - event.registeredCount} spots remaining
            </p>
          </div>
        </section>

        {/* Two-Column Details & RSVP Form */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Program Agenda */}
          <section className="lg:col-span-7 rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-card space-y-6">
            <div>
              <h2 className="font-display text-xl font-bold text-foreground mb-2">
                Program Overview & Schedule
              </h2>
              <p className="text-sm text-secondary leading-relaxed">
                {event.shortDescription}
              </p>
            </div>

            <div className="divide-y divide-border border-t border-b border-border">
              {[
                {
                  time: '17:00 – 17:45',
                  title: 'Alumni Credentials Check-In & Chapter Welcome Reception',
                  speaker: 'Sukkur IBA Alumni Relations Office',
                },
                {
                  time: '17:45 – 19:00',
                  title: 'Keynote Address: 30 Years of Merit, Innovation & Global Reach',
                  speaker: 'Vice Chancellor & Distinguished Alumni Fellows',
                },
                {
                  time: '19:00 – 20:15',
                  title: 'Cross-Cohort Industry Panels (AI, FinTech & Global Careers)',
                  speaker: 'Chapter Leads from Berlin, Dubai, Karachi & Islamabad',
                },
                {
                  time: '20:15 – 22:00',
                  title: 'Annual Honors Gala Dinner & Mentorship Networking',
                  speaker: 'All Graduating Cohorts (1994–2026)',
                },
              ].map((slot) => (
                <div
                  key={slot.time}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <p className="font-semibold text-sm text-foreground">
                      {slot.title}
                    </p>
                    <p className="text-xs text-secondary mt-0.5">{slot.speaker}</p>
                  </div>
                  <span className="font-mono text-xs font-semibold text-primary tabular-nums shrink-0">
                    {slot.time}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Interactive RSVP & Attendance Preferences Card */}
          <section className="lg:col-span-5 rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-card space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="font-display text-xl font-bold text-foreground">
                  Reserve Your Seat
                </h2>
                <p className="text-xs text-secondary mt-0.5">
                  Verified Sukkur IBA Alumni Pass
                </p>
              </div>
              <div className="text-xs font-mono font-semibold">
                {registrationStatus === 'registered' && (
                  <span className="inline-flex items-center gap-1.5 text-primary">
                    <Check className="h-4 w-4" />
                    Confirmed RSVP
                  </span>
                )}
                {registrationStatus === 'waitlisted' && (
                  <span className="inline-flex items-center gap-1.5 text-gold">
                    <Clock className="h-4 w-4" />
                    Waitlisted
                  </span>
                )}
                {registrationStatus === 'not-registered' && (
                  <span className="inline-flex items-center gap-1.5 text-secondary">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    Open for RSVP
                  </span>
                )}
              </div>
            </div>

            {/* High-Visibility Dropdowns for Attendance Preferences */}
            <div className="space-y-4">
              <SelectField
                label="Attendance Mode"
                value={attendanceMode}
                onChange={(e) =>
                  setAttendanceMode(e.target.value as 'in-person' | 'virtual')
                }
              >
                <option value="in-person">
                  In-Person Seat ({event.location})
                </option>
                <option value="virtual">
                  Virtual Live Stream Pass (Global Chapter Access)
                </option>
              </SelectField>

              <SelectField
                label="Networking Track & Hospitality Preference"
                value={dietaryPreference}
                onChange={(e) => setDietaryPreference(e.target.value)}
              >
                <option value="standard">
                  General Alumni Gala & Engineering Roundtable
                </option>
                <option value="founders">
                  Founders, Venture & Executive Leadership Table
                </option>
                <option value="mentorship">
                  1:1 Scholar Mentorship Matching Lounge
                </option>
              </SelectField>
            </div>

            {/* Action Buttons */}
            {registrationStatus === 'not-registered' && hasSpace && !isExpired && (
              <Button
                type="button"
                size="lg"
                onClick={() => {
                  setRegistrationStatus(isAtCapacity ? 'waitlisted' : 'registered')
                  toast.success('Your seat has been reserved! Pass sent to your email.')
                }}
                className="w-full h-11 text-sm"
              >
                {isAtCapacity ? 'Join Priority Waitlist' : 'Confirm Alumni RSVP'}
              </Button>
            )}

            {registrationStatus === 'registered' && (
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => {
                  setRegistrationStatus('not-registered')
                  toast.success('Your reservation has been cancelled.')
                }}
                className="w-full h-11 text-sm"
              >
                Cancel Reservation
              </Button>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}