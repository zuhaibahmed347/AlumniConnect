import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, Variants } from 'framer-motion'

export function ProfilePage() {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // In a real app, this would fetch the user's profile from the API
    const mockUser = {
      id: '1',
      name: 'Ahmed Hassan',
      email: 'ahmed.hassan@iba-suk.edu.pk',
      role: 'MEMBER',
      status: 'ACTIVE',
      avatarUrl: '/images/avatar.jpg',
      headline: 'Software Engineer at TechCorp',
      bio: ' passionate about building scalable web applications and mentoring junior developers. I graduated from Sukkur IBA in 2020 with a degree in Computer Science.',
      location: 'Karachi, Pakistan',
      website: 'https://ahmedhassan.tech',
      linkedinUrl: 'https://linkedin.com/in/ahmedhassan',
      twitterUrl: 'https://twitter.com/ahmedhassan',
      githubUrl: 'https://github.com/ahmedhassan',
      graduationYear: 2020,
      degree: 'BS Computer Science',
      major: 'Computer Science',
      isPublic: true,
      showEmail: false,
      showPhone: false,
      educations: [
        {
          id: '1',
          institution: 'Sukkur IBA University',
          degree: 'BS Computer Science',
          fieldOfStudy: 'Computer Science',
          startYear: 2016,
          endYear: 2020,
          isCurrent: false,
        },
      ],
      experiences: [
        {
          id: '1',
          company: 'TechCorp',
          title: 'Software Engineer',
          location: 'Karachi, Pakistan',
          employmentType: 'FULL_TIME',
          startDate: new Date(2020, 0, 1),
          endDate: new Date(2022, 11, 31),
        },
      ],
    }

    setUser(mockUser)
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen bg-background p-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="loader" />
          <p>Loading profile...</p>
        </div>
      </main>
    )
  }

  const profileEntrance: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 25,
      },
    },
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 rounded-full">
              <AvatarImage src={user?.avatarUrl} alt={user?.name || 'Profile photo'} />
              <AvatarFallback>{user?.name?.substring(0, 2) || 'UA'}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-bold">{user?.name}</h1>
              <p className="text-sm text-secondary/80">{user?.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/settings')}>
            ← Back
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* Profile Summary Card */}
          <motion.div
            className="bg-white rounded-lg p-6 mb-8"
            variants={profileEntrance}
            initial="hidden"
            animate="visible"
          >
            <h2 className="text-lg font-medium mb-3">Profile Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-secondary/80 text-xs mb-1">Name</p>
                <p className="font-medium">{user?.name}</p>
              </div>
              <div>
                <p className="text-secondary/80 text-xs mb-1">Email</p>
                <p className="font-medium text-primary">{user?.email}</p>
              </div>
              <div>
                <p className="text-secondary/80 text-xs mb-1">Role</p>
                <p className="font-medium">{user?.role}</p>
              </div>
              <div>
                <p className="text-secondary/80 text-xs mb-1">Status</p>
                <p
                  className={
                    user?.status === 'ACTIVE'
                      ? 'text-success'
                      : 'text-error'
                  }
                >
                  {user?.status}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Education Section */}
          <motion.div
            className="bg-white rounded-lg p-6 mb-8"
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          >
            <h2 className="text-lg font-medium mb-3">Education</h2>
            {user?.educations.map((edu: {
              id: string
              institution: string
              degree: string
              fieldOfStudy: string
              startYear: number
              endYear: number
              isCurrent?: boolean
            }) => (
              <div
                key={edu.id}
                className="mb-3 p-3 rounded-lg bg-primary/5 border-primary/20"
                style={{ transitionDelay: '0.1s' }}
              >
                <p className="font-medium">{edu.institution}</p>
                <p className="text-xs text-secondary/70">
                  {edu.degree} in {edu.fieldOfStudy} ({edu.startYear}-{edu.endYear})
                </p>
              </div>
            ))}

            {user?.experiences.map((exp: {
              id: string
              title: string
              company: string
              location: string
              employmentType: string
            }) => (
              <div
                key={exp.id}
                className="mt-4 pt-3 border-t border-primary/20"
                style={{ transitionDelay: '0.15s' }}
              >
                <p className="font-medium">{exp.title} at {exp.company}</p>
                <p className="text-xs text-secondary/70">
                  {exp.location} · {exp.employmentType}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </main>
    </main>
  )
}