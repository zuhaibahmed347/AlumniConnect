import { Button } from '@/components/ui/button'
import { ThemeSwitcher } from '@/components/ui/theme-switcher'
import { toast } from '@/lib/toast'
import { Loader2, Users, Calendar, MessageCircle, Zap, BarChart3, ClipboardList } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function AdminCommandCenterPage() {
  const navigate = useNavigate()

  const [stats, setStats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const mockStats = [
      {
        id: '1',
        title: 'Total Alumni',
        value: '3,421',
        change: '+12%',
        trend: 'up',
        icon: Users,
        description: 'Verified alumni in the AlumniConnect network',
      },
      {
        id: '2',
        title: 'Active Members',
        value: '2,847',
        change: '+8%',
        trend: 'up',
        icon: BarChart3,
        description: 'Members active in the last 30 days',
      },
      {
        id: '3',
        title: "This Month's Events",
        value: '5',
        change: '+2',
        trend: 'up',
        icon: Calendar,
        description: 'Upcoming and recent events',
      },
      {
        id: '4',
        title: 'Job Listings',
        value: '24',
        change: '+5',
        trend: 'up',
        icon: Zap,
        description: 'Active job postings from alumni companies',
      },
      {
        id: '5',
        title: 'Mentorship Relationships',
        value: '12',
        change: '+3',
        trend: 'up',
        icon: MessageCircle,
        description: 'Active mentor-mentee relationships',
      },
      {
        id: '6',
        title: 'Total Referrals',
        value: '89',
        change: '+15',
        trend: 'up',
        icon: ClipboardList,
        description: 'Successful referrals made through the platform',
      },
    ]

    setStats(mockStats)
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground p-8">
        <div className="max-w-2xl mx-auto text-center">
          <Loader2 className="h-6 w-6 mx-auto mb-3 animate-spin text-primary" />
          <p className="text-secondary">Loading command center...</p>
        </div>
      </main>
    )
  }

  const trendClass = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return 'bg-success/20 text-success'
      case 'down':
        return 'bg-error/20 text-error'
      default:
        return 'bg-secondary/20 text-secondary'
    }
  }

  const trendArrow = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7"/></svg>
      case 'down':
        return <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
      default:
        return null
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-foreground">Institutional Command Center</h1>
            <Calendar className="h-5 w-5 text-secondary" />
          </div>
          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
              ← Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Key Statistics */}
        <section className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-6">Key Metrics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.id}
                className="p-4 rounded-lg border border-border bg-stone/40 hover:bg-stone/70 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-secondary text-xs mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground font-mono">{stat.value}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${trendClass(stat.trend)}`}>
                    {trendArrow(stat.trend)}
                    {stat.change}
                  </span>
                </div>
                <p className="text-xs text-secondary">
                  {stat.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Activity */}
        <section className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-3">Recent Activity</h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/10 hover:bg-primary/15 transition-colors cursor-pointer">
              <div className="w-8 h-8 rounded-md bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Users className="h-4 w-4 text-primary dark:text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">New user registered</p>
                <p className="text-xs text-secondary">Dr. Sarah Khan joined as SUPER_ADMIN</p>
              </div>
              <p className="text-xs text-secondary">Just now</p>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/10 hover:bg-primary/15 transition-colors cursor-pointer">
              <div className="w-8 h-8 rounded-md bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Calendar className="h-4 w-4 text-primary dark:text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">Event created</p>
                <p className="text-xs text-secondary">Annual Alumni Reunion 2024</p>
              </div>
              <p className="text-xs text-secondary">2 hours ago</p>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/10 hover:bg-primary/15 transition-colors cursor-pointer">
              <div className="w-8 h-8 rounded-md bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Zap className="h-4 w-4 text-primary dark:text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">Job posted</p>
                <p className="text-xs text-secondary">Senior Full Stack Engineer at TechCorp</p>
              </div>
              <p className="text-xs text-secondary">Yesterday</p>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/10 hover:bg-primary/15 transition-colors cursor-pointer">
              <div className="w-8 h-8 rounded-md bg-primary/20 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="h-4 w-4 text-primary dark:text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">Mentorship request</p>
                <p className="text-xs text-secondary">New mentee request submitted</p>
              </div>
              <p className="text-xs text-secondary">2 days ago</p>
            </div>
          </div>
        </section>

        {/* System Status */}
        <section className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4">System Status</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-stone/40 border border-border">
              <p className="text-secondary text-xs mb-1">Uptime</p>
              <p className="text-xl font-bold text-foreground font-mono">99.9%</p>
              <p className="text-xs text-secondary mt-1">Last 30 days</p>
            </div>
            <div className="p-4 rounded-lg bg-stone/40 border border-border">
              <p className="text-secondary text-xs mb-1">API Response</p>
              <p className="text-xl font-bold text-foreground font-mono">247ms</p>
              <p className="text-xs text-secondary mt-1">Average</p>
            </div>
            <div className="p-4 rounded-lg bg-stone/40 border border-border">
              <p className="text-secondary text-xs mb-1">Database Size</p>
              <p className="text-xl font-bold text-foreground font-mono">2.3 GB</p>
              <p className="text-xs text-secondary mt-1">PostgreSQL</p>
            </div>
            <div className="p-4 rounded-lg bg-stone/40 border border-border">
              <p className="text-secondary text-xs mb-1">Last Backup</p>
              <p className="text-xl font-bold text-foreground font-mono">4 hours ago</p>
              <p className="text-xs text-secondary mt-1">Automated</p>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin/users')}
                className="w-full justify-start"
              >
                <Users className="h-4 w-4 mr-2" /> User Management
              </Button>
              <p className="text-xs text-secondary mt-1">Manage users</p>
            </div>
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin/events')}
                className="w-full justify-start"
              >
                <Calendar className="h-4 w-4 mr-2" /> Event Administration
              </Button>
              <p className="text-xs text-secondary mt-1">Manage events</p>
            </div>
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin/jobs')}
                className="w-full justify-start"
              >
                <Zap className="h-4 w-4 mr-2" /> Job Administration
              </Button>
              <p className="text-xs text-secondary mt-1">Manage jobs</p>
            </div>
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin/mentorship')}
                className="w-full justify-start"
              >
                <MessageCircle className="h-4 w-4 mr-2" /> Mentorship Oversight
              </Button>
              <p className="text-xs text-secondary mt-1">Oversee mentorship</p>
            </div>
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast({ title: 'Analytics Module', description: 'Institutional analytics report is up to date.', variant: 'default' })}
                className="w-full justify-start"
              >
                <BarChart3 className="h-4 w-4 mr-2" /> Analytics
              </Button>
              <p className="text-xs text-secondary mt-1">View analytics</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}