import { Button } from '@/components/ui/button'
import { Loader2, Calendar } from 'lucide-react'
import { useState, useEffect } from 'react'

export function MentorshipProgramPage() {
  const [programs, setPrograms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [mentorshipProfile, setMentorshipProfile] = useState<any>(null)

  useEffect(() => {
    // In a real app, this would fetch mentorship programs from the API
    const mockPrograms = [
      {
        id: '1',
        title: 'Traditional Mentorship Program',
        description: 'A structured 6-month mentorship program connecting alumni mentors with current students and recent graduates.',
        status: 'OPEN',
        maxMentees: 3,
        currentMentees: 1,
        isAvailable: true,
        categories: ['Technology', 'Business', 'Arts'],
        skills: ['Leadership', 'Career Planning', 'Technical Growth'],
        eligibility: 'Open to all alumni with 3+ years of experience',
        applicationDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      },
      {
        id: '2',
        title: 'Executive Leadership Mentorship',
        description: 'For senior alumni mentors guiding mid-career professionals into leadership roles. Focus on strategic thinking and team management.',
        status: 'OPEN',
        maxMentees: 2,
        currentMentees: 0,
        isAvailable: true,
        categories: ['Leadership', 'Management'],
        skills: ['Strategic Planning', 'Team Building', 'Decision Making'],
        eligibility: 'Open to VPs and above',
        applicationDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45),
      },
    ]

    setPrograms(mockPrograms)
    setLoading(false)

    // Check if current user has a mentorship profile
    setMentorshipProfile({
      headline: 'Mentor: Senior Software Engineer',
      bio: 'Passionate about helping the next generation of professionals navigate their careers.',
      expertise: ['Software Engineering', 'Leadership', 'Technical Excellence'],
      industries: ['Technology', 'Consulting'],
      maxMentees: 3,
      currentMentees: 1,
      isAvailable: true,
      meetingFrequency: 'Bi-weekly',
      preferredFormat: 'Video Call',
    })
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen bg-background p-8">
        <div className="max-w-2xl mx-auto text-center">
          <Loader2 className="h-6 w-6 mx-auto mb-3" />
          <p>Loading mentorship programs...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight">Mentorship Program</h1>
            <Calendar className="h-5 w-5 text-secondary" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-secondary/80">
              {mentorshipProfile?.isAvailable ? 'Available for mentorship' : 'Not currently available'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Available Programs */}
        <section className="mb-8 bg-white rounded-lg p-4">
          <h2 className="text-lg font-medium mb-4">Available Mentorship Programs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {programs.map((program) => (
              <div
                key={program.id}
                className="p-4 rounded-lg border bg-card/50 hover:bg-card transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium">{program.title}</h3>
                    <p className="text-xs text-secondary/80">{program.status}</p>
                  </div>
                  {program.isAvailable && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => alert('Apply to mentorship program')}
                    >
                      Apply
                    </Button>
                  )}
                </div>
                <p className="text-sm text-secondary/80 line-clamp-3">
                  {program.description}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {program.categories.map((cat: string) => (
                    <span
                      key={cat}
                      className="inline-flex items-center rounded-full border border-primary/20 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/5 transition-colors"
                    >
                      {cat}
                    </span>
                  ))}
                  {program.skills.map((skill: string) => (
                    <span
                      key={skill}
                      className="inline-flex items-center rounded-full border border-primary/20 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/5 transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="mt-2 pt-2 border-t border-border/10 flex justify-between">
                  <span className="text-xs text-secondary">
                    {program.currentMentees}/{program.maxMentees} mentees
                  </span>
                  <span className="text-xs text-secondary/70">
                    {new Date(program.applicationDeadline).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

 {/* My Mentorship Profile */}
        <section className="mb-8 bg-white rounded-lg p-4">
          <h2 className="text-lg font-medium mb-4">My Mentorship Profile</h2>
          {mentorshipProfile && (
            <div>
              <p className="text-sm text-secondary/80 mb-2">You are currently</p>
              <p className="font-medium">
                {mentorshipProfile.isAvailable ? 'Available for mentorship' : 'Not currently available'}
              </p>
              <p className="text-xs text-secondary/80 mb-4">
                {mentorshipProfile.bio.substring(0, 100)}{mentorshipProfile.bio.length > 100 ? '...' : ''}
              </p>
              <div className="flex flex-wrap gap-2">
                {mentorshipProfile.expertise.map((exp: string) => (
                  <span
                    key={exp}
                    className="inline-flex items-center rounded-full border border-primary/20 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/5 transition-colors"
                  >
                    {exp}
                  </span>
                ))}
                {mentorshipProfile.industries.map((ind: string) => (
                  <span
                    key={ind}
                    className="inline-flex items-center rounded-full border border-primary/20 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/5 transition-colors"
                  >
                    {ind}
                  </span>
                ))}
              </div>
              <p className="text-xs text-secondary/80 mt-2">
                Meeting frequency: {mentorshipProfile.meetingFrequency}
                {mentorshipProfile.preferredFormat && ` · ${mentorshipProfile.preferredFormat}`}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => alert('Update mentorship profile')}
              >
                Update Profile
              </Button>
            </div>
          )}
          {!mentorshipProfile && (
            <p className="text-sm text-secondary/80">No mentorship profile found</p>
          )}
        </section>

 {/* Mentor Discovery */}
        <section className="mb-8 bg-white rounded-lg p-4">
          <h2 className="text-lg font-medium mb-4">Find a Mentor</h2>
          <p className="text-sm text-secondary/80 mb-4">
            Browse alumni who are available to mentor. Filter by expertise or industry.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button variant="outline" size="lg" onClick={() => alert('Filter by expertise')}>
              Filter by Expertise
            </Button>
            <Button variant="outline" size="lg" onClick={() => alert('Filter by industry')}>
              Filter by Industry
            </Button>
          </div>
          <div className="mt-4 pt-4 border-t border-border/10">
            <p className="text-xs text-secondary/80">
              No mentors found matching your criteria. Try adjusting your filters.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}