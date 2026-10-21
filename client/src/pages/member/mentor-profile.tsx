import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ThemeSwitcher } from '@/components/ui/theme-switcher'
import { toast } from '@/lib/toast'
import { Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Avatar } from '@/components/ui/avatar'

export function MentorProfilePage() {
  const { mentorId } = useParams<{ mentorId: string }>()

  const [loading, setLoading] = useState(true)
  const [mentor, setMentor] = useState<any>(null)
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [requestMessage, setRequestMessage] = useState('')

  useEffect(() => {
    // In a real app, this would fetch the mentor's profile from the API
    if (!mentorId) {
      setLoading(false)
      return
    }

    // Mock mentor data - would come from API based on mentorId
    const mockMentor = {
      id: mentorId || '1',
      name: 'Dr. Sarah Khan',
      headline: 'Director of Engineering at TechCorp',
      bio: 'Led engineering teams building scalable web platforms. 10+ years experience in software architecture, team management, and technical leadership. Graduated from Sukkur IBA University in 2012 with a Degree in Computer Science. Passionate about mentoring the next generation of tech leaders.',
      expertise: ['Software Architecture', 'Team Leadership', 'System Design', 'Career Development'],
      industries: ['Technology', 'SaaS', 'FinTech'],
      maxMentees: 3,
      currentMentees: 1,
      isAvailable: true,
      meetingFrequency: 'Bi-weekly',
      preferredFormat: 'Video Call',
      location: 'Karachi, Pakistan',
      company: 'TechCorp',
      totalMenteesServed: 15,
      avgRating: 4.8,
    }

    setMentor(mockMentor)
    setLoading(false)
  }, [mentorId])

  if (loading) {
    return (
      <main className="min-h-screen bg-background p-8">
        <div className="max-w-2xl mx-auto text-center">
          <Loader2 className="h-6 w-6 mx-auto mb-3" />
          <p>Loading mentor profile...</p>
        </div>
      </main>
    )
  }

  if (!mentor) {
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
          <h2 className="text-2xl font-bold">Mentor Not Found</h2>
          <p className="text-secondary/80">The mentor profile you requested could not be found.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Mentor Header */}
      <header className="border-b border-border/80 bg-background/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar
              size="lg"
              className="border border-border"
              >{mentor.name.substring(0, 2)}</Avatar>
            <div>
              <p className="font-medium text-foreground">{mentor.name}</p>
              <p className="text-sm text-secondary">
                {mentor.headline}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <ThemeSwitcher />
            {mentor.isAvailable && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRequestForm(true)}
              >
                Request Mentorship
              </Button>
            )}
          </div>
        </div>
      </header>

 {/* Mentor Details */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <section className="bg-card text-foreground border border-border rounded-2xl p-6 mb-8 shadow-card">
          <h2 className="text-lg font-medium mb-4">Profile</h2>
          <p className="text-secondary/80 mb-6">{mentor.bio}</p>

 {/* Expertise & Industries */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div>
              <h3 className="text-secondary/80 text-xs mb-2">Areas of Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {mentor.expertise.map((exp: string) => (
                  <span
                    key={exp}
                    className="inline-flex items-center rounded-full border border-primary/20 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/5 transition-colors"
                  >
                    {exp}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-secondary/80 text-xs mb-2">Industries</h3>
              <div className="flex flex-wrap gap-2">
                {mentor.industries.map((ind: string) => (
                  <span
                    key={ind}
                    className="inline-flex items-center rounded-full border border-primary/20 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/5 transition-colors"
                  >
                    {ind}
                  </span>
                ))}
              </div>
            </div>
          </div>

 {/* Availability & Capacity */}
          <div className="mb-6 p-4 rounded-lg bg-primary/5">
            <p className="text-secondary/80 mb-2">Availability</p>
            <p className="font-medium">
              {mentor.isAvailable ? 'Available for mentorship' : 'Not currently accepting mentees'}
            </p>
            <p className="text-xs text-secondary/80">
              Max mentees: {mentor.maxMentees}
              {mentor.currentMentees > 0 && ` | Current: ${mentor.currentMentees}`}
            </p>
          </div>

 {/* Contact & Meeting Details */}
          <div>
            <h3 className="text-secondary/80 text-xs mb-2">Contact & Format</h3>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Location:</span> {mentor.location}
              </p>
              <p className="text-sm">
                <span className="font-medium">Company:</span> {mentor.company}
              </p>
              <p className="text-sm">
                <span className="font-medium">Meeting frequency:</span>
                {mentor.meetingFrequency}
              </p>
              <p className="text-sm">
                <span className="font-medium">Preferred format:</span>
                {mentor.preferredFormat}
              </p>
            </div>
          </div>

 {/* Request Mentorship Form */}
 {showRequestForm && (
            <div className="mt-8 p-6 rounded-lg bg-primary/5">
              <h3 className="text-lg font-medium mb-4">Request Mentorship</h3>
              <p className="text-secondary/80 mb-4">
                Fill out the form below to request a mentorship relationship. Mentors review requests and respond within 5-7 business days.
              </p>
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault()
                  const message = requestMessage.trim()
                  if (!message || !mentor.isAvailable) {
                    toast.error('Mentor is not currently accepting requests or message is empty')
                    return
                  }
                  toast.success(
                    'Mentorship request submitted! The mentor will review your request within 5-7 business days.'
                  )
                  setShowRequestForm(false)
                  setRequestMessage('')
                }}
              >
                <div>
                  <label htmlFor="goal" className="block text-sm font-medium mb-2">
                    Your mentorship goal
                  </label>
                  <Input
                    id="goal"
                    placeholder="e.g., Career transition, leadership development, technical growth..."
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    className="rounded border border-border px-3 py-2"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={!requestMessage.trim() || !mentor.isAvailable}
                    className="flex-1 bg-primary text-white"
                  >
                    Send Request
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setShowRequestForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}