import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Menu, Bell } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, Variants } from 'framer-motion'

export function DashboardPage() {
  const navigate = useNavigate()

  useEffect(() => {
    // Check authentication - in real app, this would verify the auth token
    const token = localStorage.getItem('accessToken')
    if (!token) {
      navigate('/login')
    }
  }, [navigate])

  // Stat card variants
  const statCardVariants: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 25,
        delay: 0.1,
      },
    },
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header with Profile */}

      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight">Dashboard</h1>
            <Menu className="h-5 w-5 text-secondary hover:text-primary transition-colors md:hidden" aria-label="Open menu" />
          </div>
          <div className="relative">
            <div>
              <Avatar className="h-8 w-8">UA</Avatar>
            </div>
            <div className="absolute right-0 top-full mt-2 w-36 rounded-lg bg-white px-4 py-3 shadow-sm border border-border/50 hidden md:block" aria-label="User menu">
              <a href="/profile" className="block text-sm text-primary hover:text-secondary mb-1">Profile</a>
              <a href="/settings" className="block text-sm text-primary hover:text-secondary mb-1">Settings</a>
              <a href="/messages" className="block text-sm text-primary hover:text-secondary mb-1">Messages</a>
              <a href="/notifications" className="block text-sm text-primary hover:text-secondary mb-1">Notifications</a>
              <Button variant="ghost" size="sm" onClick={() => navigate('/logout')}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">

        {/* Welcome Section */}
        <section className="mb-8">
          <p className="text-primary text-sm font-medium uppercase tracking-wider mb-3">Welcome back!</p>
          <h2 className="text-2xl font-bold leading-none">What's happening today?</h2>
        </section>

        {/* Quick Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Stat Cards */}
          <motion.div
            className="p-4 rounded-lg border bg-card/50"
            variants={statCardVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center mb-3">
              <svg className="h-3 w-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2v-6a2 2 0 00-2-2h2a2 2 0 002 2zm0 0V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7.98m4 0c3.314 0 6 1.686 6 3.5V19a2 2 0 01-2 2h-2m0-12C7 4 3 8 3 12s4 8 3 12m0-12a8 8 0 100 16 8 8 0 000-16z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold">5,243</p>
              <p className="text-sm text-secondary">Active Connections</p>
            </div>
          </motion.div>

          <motion.div
            className="p-4 rounded-lg border bg-card/50"
            variants={statCardVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            style={{ transitionDelay: '0.15s' }}
          >
            <div className="h-6 w-6 rounded-md bg-secondary/10 flex items-center justify-center mb-3">
              <svg className="h-3 w-3 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13V5.253m4.747 2.997c.09.068.172.138.255.208a6.986 6.986 0 01.255 2.997 3.5 3.5 0 105.99-.001 6.986 6.986 0 01.255-2.997c.083-.07.165-.141.255-.208m-4.748 0a3.5 3.5 0 00-5.99 0 3.5 3.5 0 00-5.99 0" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold">1,287</p>
              <p className="text-sm text-secondary">Mentorship Requests</p>
            </div>
          </motion.div>

          <motion.div
            className="p-4 rounded-lg border bg-card/50"
            variants={statCardVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            style={{ transitionDelay: '0.2s' }}
          >
            <div className="h-6 w-6 rounded-md bg-success/10 flex items-center justify-center mb-3">
              <svg className="h-3 w-3 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v6a2 2 0 002 2H9a2 2 0 002-2zM5 13l7 7-7 7" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold">892</p>
              <p className="text-sm text-secondary">Events this Month</p>
            </div>
          </motion.div>

          <motion.div
            className="p-4 rounded-lg border bg-card/50"
            variants={statCardVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            style={{ transitionDelay: '0.25s' }}
          >
            <div className="h-6 w-6 rounded-md bg-indigo-100 flex items-center justify-center mb-3">
              <svg className="h-3 w-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.6a3 3 0 013 3.5v4.5a2.5 2.5 0 01-5 0v-4.5a3 3 0 00-3-3H6v-4h2.1a5.5 5.5 0 015.5 5.5 2.5 2.5 0 01-5 0 5.5 5.5 0 01-5.5-5.5H19v4h-1.1z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold">23</p>
              <p className="text-sm text-secondary">Unread Messages</p>
            </div>
          </motion.div>
        </section>

        {/* Recent Activity & Suggestions */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2">

          {/* Upcoming Events */}
          <motion.div
            className="p-4 rounded-lg border bg-card/50"
            variants={statCardVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            style={{ transitionDelay: '0.3s' }}
          >
            <h3 className="font-medium mb-3">Upcoming Events</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 py-2 border-b border-border/10 last:border-0">
                <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v6a2 2 0 002 2H9a2 2 0 002-2zM5 13l7 7-7 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-medium">Alumni Reunion 2024</p>
                  <p className="text-xs text-secondary">Dec 15, 2024</p>
                </div>
              </div>
              <div className="flex items-center gap-3 py-2 border-b border-border/10 last:border-0">
                <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v6a2 2 0 002 2H9a2 2 0 002-2zM5 13l7 7-7 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-medium">Career Fair</p>
                  <p className="text-xs text-secondary">Jan 10, 2025</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Connection Suggestions */}
          <motion.div
            className="p-4 rounded-lg border bg-card/50"
            variants={statCardVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            style={{ transitionDelay: '0.35s' }}
          >
            <h3 className="font-medium mb-3">Connection Suggestions</h3>
            <p className="text-sm text-secondary/80 mb-4">
              People you may know at Sukkur IBA
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-3 py-2 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer">
                <Avatar className="h-6 w-6">UA</Avatar>
                <div>
                  <p className="font-medium">Ahmed Hassan</p>
                  <p className="text-xs text-secondary">BBA '20</p>
                </div>
              </div>
              <div className="flex items-center gap-3 py-2 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer">
                <Avatar className="h-6 w-6">UA</Avatar>
                <div>
                  <p className="font-medium">Saba Ahmed</p>
                  <p className="text-xs text-secondary">MS Computer Science '21</p>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full"
            >
              View All Suggestions
            </Button>
          </motion.div>
        </section>

        {/* Recent Notifications */}
        <motion.section
          className="mt-8 p-4 rounded-lg border bg-card/50"
          variants={statCardVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          style={{ transitionDelay: '0.4s' }}
        >
          <h3 className="font-medium mb-3">Recent Notifications</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {/* Notification items */}
            <div className="flex items-start gap-3 py-2 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer">
              <Bell className="h-4 w-4 text-primary flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium">New connection request</p>
                <p className="text-xs text-secondary">Ahmed Hassan sent you a connection request</p>
              </div>
            </div>
            <div className="flex items-start gap-3 py-2 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer">
              <Bell className="h-4 w-4 text-primary flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium">Event registration</p>
                <p className="text-xs text-secondary">You're registered for the Alumni Reunion</p>
              </div>
            </div>
            <div className="flex items-start gap-3 py-2 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer">
              <Bell className="h-4 w-4 text-primary flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium">Job posting</p>
                <p className="text-xs text-secondary">New Software Engineer role posted</p>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 w-full text-sm"
          >
            View All Notifications
          </Button>
        </motion.section>
      </div>
    </main>
  )
}