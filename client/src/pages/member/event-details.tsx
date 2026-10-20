import { Button } from '@/components/ui/button'
import { Loader2, Clock, Check } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
export function EventDetailsPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [event, setEvent] = useState<any>(null)
  const [isRegistered, setIsRegistered] = useState(false)
  const [registrationStatus, setRegistrationStatus] = useState<'registered' | 'waitlisted' | 'not-registered'>('not-registered')

  useEffect(() => {
    // In a real app, this would fetch the event from the API
    if (!eventId) {
      setLoading(false)
      return
    }

    // Mock event data - would come from API based on eventId
    const mockEvent = {
      id: eventId || '1',
      title: 'Annual Alumni Reunion 2024',
      slug: 'annual-alumni-reunion-2024',
      description: 'Join us for the biggest alumni gathering of the year! Reconnect with old friends, network with fellow graduates, and celebrate our shared journey. Featuring keynote speakers, panel discussions, and a gala dinner.',
      shortDescription: 'Annual reunion with keynotes, panels, and gala dinner.',
      coverImageUrl: 'https://images.unsplash.com/photo-1559rad01662-a9a1651cf9e1?w=800&h=400&fit=crop',

      startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45),
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45 + 1000 * 60 * 60 * 5),
      timezone: 'Asia/Karachi',
      location: 'Sukkur IBA University Main Campus',
      isVirtual: false,
      virtualUrl: '',
      capacity: 500,
      status: 'PUBLISHED',
      organizer: 'AlumniConnect Team',
      organizerEmail: 'events@alumni-connect.local',
      registeredCount: 234,
      totalCapacity: 500,
      waitlistCount: 12,
      registrationDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    }

    setEvent(mockEvent)
    setLoading(false)

    // Check if user is registered (mock)
    setIsRegistered(Math.random() > 0.5)
    setRegistrationStatus(isRegistered ? 'registered' : 'not-registered')
  }, [eventId])

  if (loading) {
    return (
      <main className="min-h-screen bg-background p-8">
        <div className="max-w-2xl mx-auto text-center">
          <Loader2 className="h-6 w-6 mx-auto mb-3" />
          <p>Loading event details...</p>
        </div>
      </main>
    )
  }

  if (!event) {
    return (
      <main className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto text-center py-8">
          <svg
            className="h-12 w-12 mx-auto mb-4 text-secondary/60"
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
          <h2 className="text-2xl font-bold">Event Not Found</h2>
          <p className="text-secondary/80">The event you requested could not be found.</p>
        </div>
      </main>
    )
  }

  const isExpired = new Date(event.registrationDeadline) < new Date()

  const isAtCapacity = event.registeredCount >= event.totalCapacity
  const hasSpace = event.registeredCount < event.totalCapacity

  return (
    <main className="min-h-screen bg-background">
      {/* Event Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/events')}>
              ← Back to Events
            </Button>
            {event.coverImageUrl && (
              <div className="h-24 w-full rounded-t-lg overflow-hidden mb-4">
                <img
                  src={event.coverImageUrl}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold">{event.title}</h1>
              <p className="text-sm text-secondary/80">
                {new Date(event.startDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Event Info Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Event Date */}
          <div className="bg-white rounded-lg p-4">
            <div className="text-primary/60 text-xs mb-2">Date</div>
            <p className="font-medium h-16">{new Date(event.startDate).toLocaleDateString()}</p>
          </div>
          {/* Event Time */}
          <div className="bg-white rounded-lg p-4">
            <div className="text-primary/60 text-xs mb-2">Time</div>
            <p className="font-medium">
              {new Date(event.startDate).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })} - {new Date(event.endDate).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}</p>
          </div>
          {/* Location */}
          <div className="bg-white rounded-lg p-4">
            <div className="text-primary/60 text-xs mb-2">Location</div>
            <p className="font-medium">
              {event.location}
              {event.isVirtual && <span className="ml-2">Online</span>}
            </p>
          </div>
          {/* Capacity */}
          <div className="bg-white rounded-lg p-4">
            <div className="text-primary/60 text-xs mb-2">Capacity</div>
            <p className="font-medium">
              {event.registeredCount}/{event.totalCapacity}
              {event.waitlistCount > 0 && ` (+${event.waitlistCount} waitlisted)`}
            </p>
          </div>
        </section>

        {/* Event Description */}
        <section className="bg-white rounded-lg p-6 mb-8">
          <h2 className="text-lg font-medium mb-4">Description</h2>
          <p className="text-secondary/80">{event.description}</p>
          {event.shortDescription && (
            <p className="text-secondary/80 mt-3 small">{event.shortDescription}</p>
          )}
        </section>

        {/* Agenda */}
        {event.isVirtual && (
          <section className="bg-white rounded-lg p-6 mb-8">
            <h2 className="text-lg font-medium mb-4">Agenda</h2>
            <div className="space-y-3 text-sm text-secondary">
              <div>
                <p className="font-medium">18:00 - 18:30</p>
                <p>Welcome & Registration</p>
              </div>
              <div>
                <p className="font-medium">18:30 - 19:30</p>
                <p>Keynote Speech</p>
              </div>
              <div>
                <p className="font-medium">19:30 - 20:30</p>
                <p>Panel Discussion</p>
              </div>
              <div>
                <p className="font-medium">20:30 - 22:00</p>
                <p>Gala Dinner & Networking</p>
              </div>
            </div>
          </section>
        )}

        {/* Registration Section */}
        <section className="bg-white rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Registration</h2>

          {/* Registration Status */}
          <div className="mb-6">
            <p className="text-secondary/80 text-sm mb-2">Your Status</p>
            <div className="flex gap-2">
              {registrationStatus === 'registered' && (
                <div className="flex items-center gap-2 bg-success/10 text-success">
                  <Check className="h-4 w-4" />
                  <span>Registered</span>
                </div>
              )}
              {registrationStatus === 'waitlisted' && (
                <div className="flex items-center gap-2 bg-warning/10 text-warning">
                  <Clock className="h-4 w-4" />
                  <span>Waitlisted</span>
                </div>
              )}
              {registrationStatus === 'not-registered' && (
                <div className="flex items-center gap-2 bg-primary/10 text-primary">
                  <span>Not Registered</span>
                </div>
              )}
            </div>
          </div>

          {/* Register/Unregister Button */}
          {registrationStatus === 'not-registered' && hasSpace && !isExpired && (
            <Button
              type="button"
              onClick={() => setIsRegistered(true)}
              className="w-full bg-primary text-white py-3 rounded-md hover:bg-primary/90 transition-colors"
            >
              {isAtCapacity ? 'Waitlist' : 'Register'}
            </Button>
          )}
          {registrationStatus === 'not-registered' && isExpired && (
            <p className="text-sm text-secondary/80">
              Registration deadline has passed.
            </p>
          )}
          {registrationStatus === 'registered' && (
            <Button
              type="button"
              onClick={() => setIsRegistered(false)}
              className="w-full border border-primary text-primary py-3 rounded-md hover:bg-primary/5 transition-colors"
            >
              Unregister
            </Button>
          )}
          {registrationStatus === 'waitlisted' && !isExpired && hasSpace && (
            <Button
              type="button"
              onClick={() => setRegistrationStatus('not-registered')}
              className="w-full bg-primary text-white py-3 rounded-md hover:bg-primary/90 transition-colors"
            >
              Move off waitlist
            </Button>
          )}
          {registrationStatus === 'waitlisted' && isExpired && (
            <p className="text-sm text-secondary/80">
              Waitlist expired.
            </p>
          )}

          {/* Registration Details */}
          {hasSpace || registrationStatus !== 'not-registered' && (
            <div className="mt-4 pt-4 border-t border-border/10 text-sm text-secondary">
              <p>Registration deadline: {new Date(event.registrationDeadline).toLocaleDateString()}</p>
              <p>Registered: {event.registeredCount} of {event.totalCapacity}</p>
              {event.waitlistCount > 0 && (
                <p>Waitlist: {event.waitlistCount} participants</p>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}