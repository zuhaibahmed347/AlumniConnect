import { Constellation3D } from '@/components/3d/Constellation'
import { MediaImage } from '@/components/ui/media-image'
import { MotionConfig, motion, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'

/**
 * Shared easing. Kept identical to the curves in `lib/motion.ts` so CSS
 * transitions and Motion for React animations read as one motion language.
 */
const EASE = [0.16, 1, 0.3, 1] as const

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}

const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
}

/** Scroll-triggered entrance for whole sections. Runs once per page load. */
function Section({
  id,
  className,
  eyebrow,
  title,
  lead,
  children,
}: {
  id?: string
  className?: string
  eyebrow?: string
  title?: string
  lead?: string
  children: ReactNode
}) {
  return (
    <section id={id} className={className}>
      <div className="page-container">
        <motion.div
          className="text-center mb-12"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
        >
          {eyebrow ? (
            <motion.p
              variants={item}
              className="text-primary text-sm font-semibold uppercase tracking-wider mb-3"
            >
              {eyebrow}
            </motion.p>
          ) : null}
          {title ? (
            <motion.h2
              variants={item}
              className="text-3xl sm:text-4xl font-bold leading-tight tracking-tight mb-3"
            >
              {title}
            </motion.h2>
          ) : null}
          {lead ? (
            <motion.p variants={item} className="text-secondary max-w-2xl mx-auto leading-relaxed">
              {lead}
            </motion.p>
          ) : null}
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          {children}
        </motion.div>
      </div>
    </section>
  )
}

const icons = {
  directory: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2v-6a2 2 0 00-2-2h2a2 2 0 002 2zm0 0V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7.98m4 0c3.314 0 6 1.686 6 3.5V19a2 2 0 01-2 2h-2m0-12C7 4 3 8 3 12s4 8 3 12m0-12a8 8 0 100 16 8 8 0 000-16z"
    />
  ),
  mentorship: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 6.253v13m0-13V5.253m4.747 2.997c.09.068.172.138.255.208a6.986 6.986 0 01.255 2.997 3.5 3.5 0 105.99-.001 6.986 6.986 0 01.255-2.997c.083-.07.165-.141.255-.208m-4.748 0a3.5 3.5 0 00-5.99 0 3.5 3.5 0 00-5.99 0"
    />
  ),
  jobs: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  ),
  events: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 19v6a2 2 0 002 2h2a2 2 0 002-2v-6M9 19H7a2 2 0 01-2-2v-6a2 2 0 012-2h2m10 7h2a2 2 0 002-2v-6a2 2 0 00-2-2h-2m-8 7v-2m4-2v2m-4-6v2m6-2v2M9 9h.01M15 9h.01M9 5h.01M15 5h.01"
    />
  ),
} as const

/* `id` doubles as the anchor target for the matching nav link, so every
   in-page nav item scrolls to real content instead of a dead fragment. */
const features = [
  {
    id: 'alumni-directory',
    title: 'Alumni Directory',
    description: 'Search and connect with verified alumni across industries and graduation years.',
    icon: icons.directory,
  },
  {
    id: 'mentorship',
    title: 'Mentorship Program',
    description: 'Find mentors and guide the next generation of Sukkur IBA graduates.',
    icon: icons.mentorship,
  },
  {
    id: 'jobs',
    title: 'Jobs & Referrals',
    description: 'Find your next opportunity and refer alumni into your own team.',
    icon: icons.jobs,
  },
  {
    id: 'university-events',
    title: 'University Events',
    description: 'Stay connected with campus events, reunions, and workshops.',
    icon: icons.events,
  },
] as const

const stories = [
  {
    quote:
      'The mentorship programme paired me with a senior engineer who reviewed my first production architecture.',
    name: 'Ayesha Siddiqui',
    detail: 'BS Computer Science · Class of 2019',
  },
  {
    quote:
      'I posted an open role on the job board and hired two alumni within a month.',
    name: 'Bilal Qureshi',
    detail: 'MBA · Class of 2016',
  },
  {
    quote:
      'Reconnecting at the annual alumni meetup turned into the co-founding of our analytics startup.',
    name: 'Hina Memon',
    detail: 'BS Software Engineering · Class of 2015',
  },
] as const

export function LandingPage() {
  return (
    /* `reducedMotion="user"` makes every Motion animation on this page honour
       prefers-reduced-motion without each component opting in manually. */
    <MotionConfig reducedMotion="user">
      <main className="min-h-screen bg-background">
        {/* Navigation */}

        <nav className="border-b border-border/50 bg-background/80 backdrop-blur-md fixed w-full z-50">
          <div className="page-container py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7l7 9z" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight">AlumniConnect</span>
            </div>
            <div className="hidden sm:flex items-center gap-6">
              <a href="#features" className="text-sm font-medium text-secondary hover:text-primary transition-colors">Features</a>
              <a href="#events" className="text-sm font-medium text-secondary hover:text-primary transition-colors">Events</a>
              <a href="#jobs" className="text-sm font-medium text-secondary hover:text-primary transition-colors">Jobs</a>
              <a href="#mentorship" className="text-sm font-medium text-secondary hover:text-primary transition-colors">Mentorship</a>
            </div>
            <div className="flex items-center gap-3">
              <a href="/login" className="text-sm font-medium text-secondary hover:text-primary transition-colors">Sign In</a>
              <a href="/register" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
                Join Community
              </a>
            </div>
          </div>
        </nav>

        {/* Hero Section */}

        <section className="relative overflow-hidden pt-20 pb-16 md:pt-32 lg:pt-48">
          {/* Campus aerial as the hero backdrop, heavily scrimmed so the copy
              stays fully legible at every viewport. */}
          <MediaImage
            src="/images/campus.jpg"
            alt="Aerial view of the Sukkur IBA University campus"
            eager
            className="absolute inset-0 h-full w-full rounded-none"
            imgClassName="object-cover object-center"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-background via-background/94 to-background/55"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent"
          />

          <div className="page-container relative">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Hero Content */}
              <motion.div initial="hidden" animate="visible" variants={stagger}>
                <motion.p
                  variants={item}
                  className="text-primary text-sm font-semibold uppercase tracking-wider mb-4"
                >
                  Connecting Graduates. Inspiring Futures.
                </motion.p>
                <motion.h1
                  variants={item}
                  className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-6"
                >
                  Welcome to AlumniConnect
                </motion.h1>
                <motion.p
                  variants={item}
                  className="text-lg text-secondary mb-8 max-w-2xl leading-relaxed"
                >
                  A premier platform for Sukkur IBA graduates to connect, collaborate, and
                  advance their careers. Join a community of alumni and discover mentorship,
                  jobs, and events tailored to your interests.
                </motion.p>
                <motion.div variants={item} className="flex flex-col sm:flex-row gap-3">
                  <a href="/register" className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 font-medium transition-colors">
                    Join the Community
                  </a>
                  <a href="/login" className="border border-border text-primary hover:bg-primary/5 px-6 py-3 rounded-lg font-medium transition-colors">
                    Sign In
                  </a>
                </motion.div>
              </motion.div>

              {/* Signature 3D constellation — degrades to CSS on mobile,
                  reduced-motion, and devices without WebGL. */}
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
              >
                <Constellation3D className="h-[320px] sm:h-[400px] lg:h-[460px]" />
              </motion.div>

              {/* Floating Feature Cards - subtle, supporting */}

              <div className="lg:col-span-2 pt-6 lg:pt-0">
                <motion.div
                  className="grid grid-cols-2 gap-4 sm:grid-cols-4"
                  variants={stagger}
                  initial="hidden"
                  animate="visible"
                >
                  {features.map((feature) => (
                    <motion.a
                      key={feature.title}
                      href={`#${feature.id}`}
                      variants={item}
                      className="p-3 rounded-lg border bg-card/50 hover:bg-card hover:shadow-card transition-colors group block"
                    >
                      <div className="h-6 flex items-center justify-center mb-2">
                        <svg
                          className="h-4 w-4 text-primary group-hover:text-primary/90 transition-colors"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          {feature.icon}
                        </svg>
                      </div>
                      <h3 className="font-semibold mb-1 text-sm">{feature.title}</h3>
                      <p className="text-xs text-secondary/70 leading-relaxed">
                        {feature.description}
                      </p>
                    </motion.a>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}

        <Section
          id="features"
          className="py-20 bg-white"
          eyebrow="Features"
          title="What You'll Discover"
          lead="Explore the platform's key features designed for Sukkur IBA alumni"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                id={feature.id}
                variants={item}
                whileHover={{ y: -4, transition: { duration: 0.2, ease: EASE } }}
                className="p-5 rounded-lg border bg-card/60 hover:bg-card hover:shadow-card-hover transition-shadow"
              >
                <div className="h-12 flex items-center justify-center mb-3 rounded-lg bg-primary/10">
                  <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {feature.icon}
                  </svg>
                </div>
                <h3 className="font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm text-secondary leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* Events Section */}

        <section id="events" className="py-20 bg-background">
          <div className="page-container">
            <motion.div
              className="grid items-center gap-10 lg:grid-cols-2"
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.25 }}
            >
              <MediaImage
                src="/images/seminar.jpg"
                alt="Alumni and students attending a seminar at Sukkur IBA"
                className="aspect-[599/316] rounded-2xl shadow-card lg:order-2"
                imgClassName="object-cover object-center"
              />

              <motion.div variants={item} className="lg:order-1">
                <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-3">
                  Events
                </p>
                <h2 className="text-3xl sm:text-4xl font-bold leading-tight tracking-tight mb-3">
                  Reunions, seminars and campus meetups
                </h2>
                <p className="text-secondary leading-relaxed mb-6">
                  Alumni chapters host guest sessions, career workshops and on-campus
                  reunions throughout the year. Browse the events hub to RSVP, add a
                  date to your calendar, and see who else from your cohort is attending.
                </p>
                <a
                  href="/events"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 font-medium text-white transition-colors hover:bg-primary/90"
                >
                  Browse events
                  <span aria-hidden="true">→</span>
                </a>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Success Stories Section */}

        <Section
          id="success-stories"
          className="py-20 bg-secondary/5"
          eyebrow="Success Stories"
          title="Alumni Impact"
          lead="Verified alumni achievements from across the Sukkur IBA community"
        >
          <motion.div variants={item}>
            <MediaImage
              src="/images/alumni-gathering.jpg"
              alt="Sukkur IBA alumni gathered together on campus"
              className="aspect-[16/9] rounded-2xl shadow-card mb-10"
              imgClassName="object-cover object-center"
            />
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {stories.map((story) => (
              <motion.figure
                key={story.name}
                variants={item}
                whileHover={{ y: -4, transition: { duration: 0.2, ease: EASE } }}
                className="p-6 rounded-lg border bg-card/60 hover:bg-card hover:shadow-card-hover transition-shadow flex flex-col gap-4"
              >
                <blockquote className="text-secondary text-sm italic leading-relaxed">
                  “{story.quote}”
                </blockquote>
                <figcaption className="mt-auto">
                  <p className="font-semibold text-sm">{story.name}</p>
                  <p className="text-xs text-secondary/70">{story.detail}</p>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </Section>

        {/* CTA Section */}

        <section id="join" className="py-24 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="page-container">
            <motion.div
              className="text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.4 }}
              variants={stagger}
            >
              <motion.p
                variants={item}
                className="text-primary text-sm font-semibold uppercase tracking-wider mb-3"
              >
                Get Started
              </motion.p>
              <motion.h2
                variants={item}
                className="text-4xl sm:text-5xl font-bold leading-tight tracking-tight mb-3"
              >
                Join 5,000+ Alumni
              </motion.h2>
              <motion.p variants={item} className="text-secondary mb-6 max-w-2xl mx-auto leading-relaxed">
                Create your free profile and start connecting today
              </motion.p>
              <motion.div variants={item} className="flex flex-col sm:flex-row gap-3 justify-center">
                <a href="/register" className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 font-medium transition-colors">
                  Create Profile
                </a>
                <a href="/login" className="border border-border text-primary px-8 py-3 rounded-lg hover:bg-primary/5 font-medium transition-colors">
                  Sign In
                </a>
              </motion.div>
            </motion.div>
          </div>
        </section>

      </main>
    </MotionConfig>
  )
}
