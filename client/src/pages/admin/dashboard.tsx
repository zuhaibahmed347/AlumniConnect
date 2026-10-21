import { Bell } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Users, Calendar, TrendingUp, MessageCircle, Zap, Layout, Settings, LogOut, BarChart3 } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, Variants } from 'framer-motion'

export function AdminDashboardPage() {
  const navigate = useNavigate()

  useEffect(() => {
    // In a real app, this would check admin authentication
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

  // Activity item variants
  const activityVariants: Variants = {
    hidden: { opacity: 0, x: -12 },
    visible: {
      opacity: 1,
      x: 0,
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
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar h-screen border-r border-border/50 flex flex-col">
        <div className="p-4 border-b border-border/50">
          <img
            src="/images/university-logo.jpg"
            alt="Sukkur IBA University"
            className="h-8 w-8 rounded-lg object-cover"
          />
          <span className="text-xl font-bold ml-3">Admin</span>
        </div>
        <nav className="flex-1 p-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Dashboard"
            className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-primary/10"
          >
            <Layout className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Users"
            className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-primary/10"
          >
            <Users className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Events"
            className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-primary/10"
          >
            <Calendar className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Jobs"
            className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-primary/10"
          >
            <Zap className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Mentorship"
            className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-primary/10"
          >
            <MessageCircle className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Analytics"
            className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-primary/10"
          >
            <TrendingUp className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Settings"
            className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-primary/10"
          >
            <Settings className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Sign Out"
            className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-error/10"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <header className="border-b border-border/50 bg-background/80 backdrop-blur-md px-6 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold tracking-tight">Dashboard</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Notifications"
                className="relative"
              >
                <Bell className="h-5 w-5 text-secondary" />
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary"></span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Profile"
                className="relative"
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src="/images/avatar.jpg" alt="Your profile" />
                  <AvatarFallback>UA</AvatarFallback>
                </Avatar>
              </Button>
            </div>
          </div>
        </header>

        {/* Stats Cards */}
        <section className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Users */}
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
              <p className="text-2xl font-bold">1,247</p>
              <p className="text-sm text-secondary">Total Users</p>
            </div>
          </motion.div>

          {/* Active Members */}
          <motion.div
            className="p-4 rounded-lg border bg-card/50"
            variants={statCardVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            style={{ transitionDelay: '0.1' as const }}
          >
            <div className="h-6 w-6 rounded-md bg-success/10 flex items-center justify-center mb-3">
              <svg className="h-3 w-3 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v6a2 2 0 002 2H9a2 2 0 002-2zM5 13l7 7-7 7" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold">987</p>
              <p className="text-sm text-secondary">Active Members</p>
            </div>
          </motion.div>

          {/* Pending Verification */}
          <motion.div
            className="p-4 rounded-lg border bg-warning/10 flex items-center justify-center"
            variants={statCardVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            style={{ transitionDelay: '0.15' as const }}
          >
            <div className="h-6 w-6 rounded-md bg-warning flex items-center justify-center mb-3">
              <svg className="h-3 w-3 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 4v2a6 6 0 006 6h2a2 2 0 002-2v-6a2 2 0 00-2-2h-2a2 2 0 00-2 2v-2m0 4a2 2 0 110-4h4" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold">123</p>
              <p className="text-sm text-secondary">Pending Verification</p>
            </div>
          </motion.div>

          {/* Active Events */}
          <motion.div
            className="p-4 rounded-lg border bg-primary/10 flex items-center justify-center"
            variants={statCardVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            style={{ transitionDelay: '0.2' as const }}
          >
            <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center mb-3">
              <svg className="h-3 w-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v6a2 2 0 002 2H9a2 2 0 002-2zM5 13l7 7-7 7" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold">45</p>
              <p className="text-sm text-secondary">Active Events</p>
            </div>
          </motion.div>
        </section>

        {/* Recent Activity */}
        <motion.section
          className="p-6 rounded-lg border bg-card/50 mb-6"
          variants={activityVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <h2 className="text-lg font-medium mb-3">Recent Activity</h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {/* Activity items */}
            <div className="flex items-start gap-3 py-2 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer">
              <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v6a2 2 0 002 2H9a2 2 0 002-2zM5 13l7 7-7 7" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium">New user registered</p>
                <p className="text-xs text-secondary/70">Ahmed Hassan joined the community</p>
              </div>
              <p className="text-xs text-secondary/60">Just now</p>
            </div>
            <div className="flex items-start gap-3 py-2 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer">
              <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v6a2 2 0 002 2H9a2 2 0 002-2zM5 13l7 7-7 7" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium">Event created</p>
                <p className="text-xs text-secondary/70">New alumni event posted</p>
              </div>
              <p className="text-xs text-secondary/60">2 hours ago</p>
            </div>
            <div className="flex items-start gap-3 py-2 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer">
              <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v6a2 2 0 002 2H9a2 2 0 002-2zM5 13l7 7-7 7" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium">Job posted</p>
                <p className="text-xs text-secondary/70">Software Engineer position</p>
              </div>
              <p className="text-xs text-secondary/60">Yesterday</p>
            </div>
          </div>
        </motion.section>

        {/* Quick Links */}
        <motion.section
          className="p-6 rounded-lg border bg-card/50"
          variants={statCardVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          style={{ transitionDelay: '0.3' as const }}
        >
          <h2 className="text-lg font-medium mb-3">Quick Links</h2>
          <div className="space-y-3">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
            >
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4" /> User Management
              </span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
            >
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Event Administration
              </span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
            >
              <span className="flex items-center gap-2">
                <Zap className="h-4 w-4" /> Job Administration
              </span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
            >
              <span className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" /> Mentorship Oversight
              </span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
            >
              <span className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" /> Analytics
              </span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
            >
              <span className="flex items-center gap-2">
                <Settings className="h-4 w-4" /> Platform Settings
              </span>
            </Button>
          </div>
        </motion.section>
      </div>
    </main>
  )
}