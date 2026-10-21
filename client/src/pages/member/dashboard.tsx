import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { AnimatedCounter } from '@/components/ui/animated-counter'
import { CampusNewsTicker } from '@/components/ui/campus-news-ticker'
import { ThemeSwitcher } from '@/components/ui/theme-switcher'
import {
  GlobalSearchTrigger,
  InlineGlobalSearchBar,
} from '@/components/ui/global-search-bar'
import { Menu, Bell } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, type Variants } from 'framer-motion'

export function DashboardPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      navigate('/login')
    }
  }, [navigate])

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.05 },
    },
  }

  const statCardVariants: Variants = {
    hidden: { opacity: 0, y: 18, scale: 0.97 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 240,
        damping: 26,
      },
    },
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header with Profile */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between py-4">
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
              Dashboard
            </h1>
            <Menu
              className="h-5 w-5 text-secondary hover:text-primary transition-colors md:hidden"
              aria-label="Open menu"
            />
          </div>
          <div className="relative flex items-center gap-2.5 sm:gap-3">
            <GlobalSearchTrigger compact />
            <ThemeSwitcher />
            <div>
              <Avatar className="h-8 w-8 ring-1 ring-border">
                <AvatarImage src="/images/avatar.jpg" alt="Your profile" />
                <AvatarFallback>UA</AvatarFallback>
              </Avatar>
            </div>
            <div
              className="absolute right-0 top-full mt-2 w-36 rounded-xl bg-card px-4 py-3 shadow-card border border-border hidden md:block"
              aria-label="User menu"
            >
              <Link
                to="/profile"
                className="block text-sm text-primary hover:text-secondary mb-1"
              >
                Profile
              </Link>
              <Link
                to="/settings"
                className="block text-sm text-primary hover:text-secondary mb-1"
              >
                Settings
              </Link>
              <Link
                to="/messages"
                className="block text-sm text-primary hover:text-secondary mb-1"
              >
                Messages
              </Link>
              <Link
                to="/notifications"
                className="block text-sm text-primary hover:text-secondary mb-1"
              >
                Notifications
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/login')}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <motion.div
        className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Welcome Section + Inline Global Search Bar */}
        <motion.section variants={statCardVariants} className="mb-7 space-y-4">
          <div>
            <p className="text-primary dark:text-accent text-xs font-mono uppercase tracking-wider mb-1.5">
              Member Workspace
            </p>
            <h2 className="font-display text-3xl font-bold leading-tight">
              Welcome back to your alumni hub
            </h2>
          </div>
          <InlineGlobalSearchBar />
        </motion.section>

        {/* Live Google Search Grounded Campus News Ticker */}
        <motion.div variants={statCardVariants} className="mb-8">
          <CampusNewsTicker />
        </motion.div>

        {/* Quick Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {[
            { value: 5243, label: 'Active Connections' },
            { value: 1287, label: 'Mentorship Requests' },
            { value: 892, label: 'Events this Month' },
            { value: 23, label: 'Unread Messages' },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              className="p-5 rounded-2xl border border-border bg-card shadow-card"
              variants={statCardVariants}
              whileHover={{
                y: -4,
                boxShadow: '0 16px 36px -8px rgb(9 20 34 / 0.11)',
              }}
              whileTap={{ scale: 0.985 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            >
              <p className="font-mono text-3xl font-bold text-foreground tabular-nums">
                <AnimatedCounter value={stat.value} />
              </p>
              <p className="text-xs font-medium text-secondary mt-1">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </section>

        {/* Recent Activity & Suggestions */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Upcoming Events */}
          <motion.div
            className="p-6 rounded-2xl border border-border bg-card shadow-card"
            variants={statCardVariants}
            whileHover={{ y: -3 }}
          >
            <h3 className="font-display text-lg font-bold mb-4">
              Upcoming Events
            </h3>
            <div className="divide-y divide-border">
              {[
                { title: 'Alumni Reunion 2026', date: 'Dec 15, 2026' },
                { title: 'Autumn Career Fair', date: 'Jan 10, 2027' },
              ].map((ev) => (
                <motion.div
                  key={ev.title}
                  whileHover={{ x: 4 }}
                  className="flex items-center justify-between py-3 cursor-pointer"
                  onClick={() => navigate('/events')}
                >
                  <div>
                    <p className="text-sm font-semibold">{ev.title}</p>
                    <p className="text-xs font-mono text-secondary tabular-nums">
                      {ev.date}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-primary">
                    View →
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Connection Suggestions */}
          <motion.div
            className="p-6 rounded-2xl border border-border bg-card shadow-card"
            variants={statCardVariants}
            whileHover={{ y: -3 }}
          >
            <h3 className="font-display text-lg font-bold mb-1">
              Connection Suggestions
            </h3>
            <p className="text-xs text-secondary mb-4">
              People you may know at Sukkur IBA
            </p>
            <div className="space-y-2 mb-4">
              {[
                { name: 'Ahmed Hassan', cohort: "BBA '20" },
                { name: 'Saba Ahmed', cohort: "MS Computer Science '21" },
              ].map((person) => (
                <motion.div
                  key={person.name}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.99 }}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-stone/60 hover:bg-stone transition-colors cursor-pointer"
                  onClick={() => navigate('/alumni')}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/images/avatar.jpg" alt={person.name} />
                    <AvatarFallback>UA</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold">{person.name}</p>
                    <p className="text-xs text-secondary font-mono">
                      {person.cohort}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => navigate('/alumni')}
            >
              View All Suggestions
            </Button>
          </motion.div>
        </section>

        {/* Recent Notifications */}
        <motion.section
          className="mt-6 p-6 rounded-2xl border border-border bg-card shadow-card"
          variants={statCardVariants}
          whileHover={{ y: -2 }}
        >
          <h3 className="font-display text-lg font-bold mb-4">
            Recent Notifications
          </h3>
          <div className="space-y-2">
            {[
              {
                title: 'New connection request',
                desc: 'Ahmed Hassan sent you a connection request',
              },
              {
                title: 'Event registration confirmed',
                desc: 'You are registered for the Annual Alumni Reunion',
              },
              {
                title: 'New referral job posting',
                desc: 'Senior Software Engineer role posted at TechCorp',
              },
            ].map((item) => (
              <motion.div
                key={item.title}
                whileHover={{ x: 4 }}
                className="flex items-start gap-3 p-3 rounded-xl bg-stone/50 hover:bg-stone transition-colors cursor-pointer"
                onClick={() => navigate('/notifications')}
              >
                <Bell className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-xs text-secondary">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 w-full"
            onClick={() => navigate('/notifications')}
          >
            View All Notifications
          </Button>
        </motion.section>
      </motion.div>
    </main>
  )
}