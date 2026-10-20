import { Button } from '@/components/ui/button'
import { Loader2, Users, Calendar, MessageCircle, Zap, BarChart3 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function AdminCommandCenterPage() {
  const navigate = useNavigate()

  const [stats, setStats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, this would fetch command center stats from the API
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
        title: 'This Month\'s Events',
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
        icon: Clipboard,
        description: 'Successful referrals made through the platform',
      },
    ]

    setStats(mockStats)
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen bg-background p-8">
        <div className="max-w-2xl mx-auto text-center">
          <Loader2 className="h-6 w-6 mx-auto mb-3" />
          <p>Loading command center...</p>
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
        return ''
    }
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight">Institutional Command Center</h1>
            <Calendar className="h-5 w-5 text-secondary" />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
              ← Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

 {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Key Statistics */}
        <section className="bg-white rounded-lg p-6 mb-8">
          <h2 className="text-lg font-medium mb-6">Key Metrics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.id}
                className="p-4 rounded-lg border bg-card/50 hover:bg-card transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-secondary/80 text-xs mb-1">{stat.title}</p>
                    <p className="font-medium h-16">{stat.value}</p>
                  </div>
                  {trendClass(stat.trend)}
                  {trendArrow(stat.trend)}
                </div>
                <p className="text-xs text-secondary/80">
                  {stat.description}
                </p>
              </div>
            ))}
          </div>
        </section>

 {/* Recent Activity */}
        <section className="bg-white rounded-lg p-6 mb-8">
          <h2 className="text-lg font-medium mb-3">Recent Activity</h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
 {/* Activity items */}
            <div className="flex items-start gap-3 py-2 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer">
              <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium">New user registered</p>
                <p className="text-xs text-secondary/70">Dr. Sarah Khan joined as SUPER_ADMIN</p>
              </div>
              <p className="text-xs text-secondary/60">Just now</p>
            </div>
            <div className="flex items-start gap-3 py-2 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer">
              <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium">Event created</p>
                <p className="text-xs text-secondary/70">Annual Alumni Reunion 2024</p>
              </div>
              <p className="text-xs text-secondary/60">2 hours ago</p>
            </div>
            <div className="flex items-start gap-3 py-2 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer">
              <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium">Job posted</p>
                <p className="text-xs text-secondary/70">Senior Full Stack Engineer at TechCorp</p>
              </div>
              <p className="text-xs text-secondary/60">Yesterday</p>
            </div>
            <div className="flex items-start gap-3 py-2 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer">
              <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium">Mentorship request</p>
                <p className="text-xs text-secondary/70">New mentee request submitted</p>
              </div>
              <p className="text-xs text-secondary/60">2 days ago</p>
            </div>
          </div>
        </section>

 {/* System Status */}
        <section className="bg-white rounded-lg p-6">
          <h2 className="text-lg font-medium mb-3">System Status</h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
 {/* Uptime */}
            <div>
              <p className="text-secondary/80 text-xs mb-2">Uptime</p>
              <p className="font-medium h-16">99.9%</p>
              <p className="text-xs text-secondary/80">Last 30 days</p>
            </div>
 {/* Response Time */}
            <div>
              <p className="text-secondary/80 text-xs mb-2">API Response</p>
              <p className="font-medium h-16">247ms</p>
              <p className="text-xs text-secondary/80">Average</p>
            </div>
          </div>
 {/* Database */}
          <div className="grid grid-cols-2 gap-4">
 {/* Database Size */}
            <div>
              <p className="text-secondary/80 text-xs mb-2">Database Size</p>
              <p className="font-medium h-16">2.3 GB</p>
              <p className="text-xs text-secondary/80">PostgreSQL</p>
            </div>
 {/* Last Backup */}
            <div>
              <p className="text-secondary/80 text-xs mb-2">Last Backup</p>
              <p className="font-medium h-16">4 hours ago</p>
              <p className="text-xs text-secondary/80">Automated</p>
            </div>
          </div>
        </section>

 {/* Quick Actions */}
        <section className="bg-white rounded-lg p-6">
          <h2 className="text-lg font-medium mb-3">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
 {/* User Management */}
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin/users')}
                className="w-full justify-start"
              >
                <Users className="h-4 w-4 mr-2" /> User Management
              </Button>
              <p className="text-xs text-secondary/80 mt-1">Manage users</p>
            </div>
 {/* Event Administration */}
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => alert('Navigate to event admin')}
                className="w-full justify-start"
              >
                <Calendar className="h-4 w-4 mr-2" /> Event Administration
              </Button>
              <p className="text-xs text-secondary/80 mt-1">Manage events</p>
            </div>
 {/* Job Administration */}
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => alert('Navigate to job admin')}
                className="w-full justify-start"
              >
                <Zap className="h-4 w-4 mr-2" /> Job Administration
              </Button>
              <p className="text-xs text-secondary/80 mt-1">Manage jobs</p>
            </div>
 {/* Mentorship Oversight */}
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => alert('Navigate to mentorship oversight')}
                className="w-full justify-start"
              >
                <MessageCircle className="h-4 w-4 mr-2" /> Mentorship Oversight
              </Button>
              <p className="text-xs text-secondary/80 mt-1">Oversee mentorship</p>
            </div>
 {/* Analytics */}
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => alert('Navigate to analytics')}
                className="w-full justify-start"
              >
                <BarChart3 className="h-4 w-4 mr-2" /> Analytics
              </Button>
              <p className="text-xs text-secondary/80 mt-1">View analytics</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}