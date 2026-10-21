import { Button } from '@/components/ui/button'
import { ThemeSwitcher } from '@/components/ui/theme-switcher'
import { Loader2, Calendar } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, type Variants } from 'framer-motion'
import { toast } from '@/lib/toast'

const listVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.04 },
  },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 240, damping: 26 },
  },
}

export function MentorshipProgramPage() {
  const [programs, setPrograms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [mentorshipProfile, setMentorshipProfile] = useState<any>(null)

  useEffect(() => {
    const mockPrograms = [
      {
        id: '1',
        title: 'Early Career & Systems Engineering Mentorship',
        description:
          'A structured 6-month mentorship program connecting alumni mentors with current students and recent graduates.',
        status: 'OPEN',
        maxMentees: 3,
        currentMentees: 1,
        isAvailable: true,
        categories: ['Technology', 'Business', 'Engineering'],
        skills: ['Leadership', 'Career Planning', 'Technical Growth'],
        eligibility: 'Open to all alumni with 3+ years of experience',
        applicationDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      },
      {
        id: '2',
        title: 'Executive Leadership & Venture Mentorship',
        description:
          'For senior alumni mentors guiding mid-career professionals into executive and founder roles.',
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

    setMentorshipProfile({
      headline: 'Mentor: Senior Software Engineer',
      bio: 'Passionate about helping the next generation of Sukkur IBA graduates navigate their careers.',
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
          <Loader2 className="h-6 w-6 mx-auto mb-3 animate-spin" />
          <p>Loading mentorship programs...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-md">
        <div className="page-container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-xs font-mono uppercase tracking-wider text-primary hover:underline"
            >
              AlumniConnect
            </Link>
            <span aria-hidden="true" className="text-border">
              /
            </span>
            <h1 className="font-display text-xl font-bold tracking-tight">
              Mentorship Program
            </h1>
            <Calendar className="h-4 w-4 text-secondary" />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-primary hidden sm:inline">
              {mentorshipProfile?.isAvailable
                ? 'Available for mentorship'
                : 'Not currently available'}
            </span>
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <motion.div
        className="page-container py-8 space-y-8"
        variants={listVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Available Programs */}
        <motion.section
          variants={cardVariants}
          className="bg-card text-foreground rounded-2xl border border-border p-6 shadow-card"
        >
          <h2 className="font-display text-xl font-bold mb-4">
            Available Mentorship Tracks
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {programs.map((program) => (
              <motion.div
                key={program.id}
                whileHover={{
                  y: -4,
                  boxShadow: '0 16px 36px -8px rgb(9 20 34 / 0.11)',
                }}
                whileTap={{ scale: 0.99 }}
                transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                className="p-6 rounded-xl border border-border bg-background flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="text-xs font-mono text-primary mb-1">
                        {program.status} · {program.eligibility}
                      </p>
                      <h3 className="font-display text-lg font-bold">
                        {program.title}
                      </h3>
                    </div>
                    {program.isAvailable && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() =>
                          toast({
                            title: 'Application Submitted',
                            description: `Your request for ${program.title} has been recorded.`,
                            variant: 'success',
                          })
                        }
                      >
                        Apply
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-secondary leading-relaxed mb-4">
                    {program.description}
                  </p>
                  <p className="text-xs font-mono text-secondary">
                    {[...program.categories, ...program.skills].join(' · ')}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border flex justify-between text-xs font-mono text-secondary tabular-nums">
                  <span>
                    {program.currentMentees}/{program.maxMentees} mentees enrolled
                  </span>
                  <span>
                    Closes{' '}
                    {new Date(program.applicationDeadline).toLocaleDateString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* My Mentorship Profile */}
        <motion.section
          variants={cardVariants}
          whileHover={{ y: -2 }}
          className="bg-card text-foreground rounded-2xl border border-border p-6 shadow-card"
        >
          <h2 className="font-display text-xl font-bold mb-3">
            My Mentorship Profile
          </h2>
          {mentorshipProfile ? (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground">
                {mentorshipProfile.headline}
              </p>
              <p className="text-sm text-secondary">{mentorshipProfile.bio}</p>
              <p className="text-xs font-mono text-secondary">
                {[
                  ...mentorshipProfile.expertise,
                  ...mentorshipProfile.industries,
                ].join(' · ')}
              </p>
              <p className="text-xs text-secondary font-mono">
                Meeting cadence: {mentorshipProfile.meetingFrequency} ·{' '}
                {mentorshipProfile.preferredFormat}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  toast({
                    title: 'Profile Ready',
                    description: 'Your mentorship availability preferences are active.',
                  })
                }
              >
                Update Preferences
              </Button>
            </div>
          ) : (
            <p className="text-sm text-secondary">No mentorship profile found</p>
          )}
        </motion.section>
      </motion.div>
    </main>
  )
}