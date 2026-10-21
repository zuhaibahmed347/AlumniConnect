import { Button } from '@/components/ui/button'
import { ThemeSwitcher } from '@/components/ui/theme-switcher'
import { toast } from '@/lib/toast'
import { Loader2, Shield, Clock, Settings, LogOut, User } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function AdminProfilePage() {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [admin, setAdmin] = useState<any>(null)

  useEffect(() => {
    const mockAdmin = {
      id: '1',
      name: 'System Administrator',
      email: 'admin@alumni-connect.local',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
      lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      createdAt: new Date('2024-01-15'),
    }

    setAdmin(mockAdmin)
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground p-8">
        <div className="max-w-2xl mx-auto text-center">
          <Loader2 className="h-6 w-6 mx-auto mb-3 animate-spin text-primary" />
          <p className="text-secondary">Loading admin profile...</p>
        </div>
      </main>
    )
  }

  const formatDate = (date: Date | string | undefined) =>
    date ? new Date(date).toLocaleDateString() : 'Never'

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-foreground">Admin Profile</h1>
            <Shield className="h-5 w-5 text-secondary" />
          </div>
          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
              ← Back to Command Center
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Admin Info */}
        <section className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4">Profile Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-secondary text-xs mb-1">Name</p>
              <p className="font-medium text-foreground">{admin?.name}</p>
            </div>
            <div>
              <p className="text-secondary text-xs mb-1">Email</p>
              <p className="font-medium text-primary dark:text-accent">{admin?.email}</p>
            </div>
            <div>
              <p className="text-secondary text-xs mb-1">Role</p>
              <p className="font-medium text-foreground">
                {admin?.role === 'SUPER_ADMIN' ? 'Super Administrator' : admin?.role}
              </p>
            </div>
            <div>
              <p className="text-secondary text-xs mb-1">Status</p>
              <p className={admin?.status === 'ACTIVE' ? 'text-success font-medium' : 'text-error font-medium'}>
                {admin?.status}
              </p>
            </div>
          </div>
        </section>

        {/* Security Settings */}
        <section className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4">Security Settings</h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-secondary text-xs mb-1">Last Login</p>
              <p className="text-sm text-foreground">
                {formatDate(admin?.lastLoginAt)}
              </p>
            </div>
            <div>
              <p className="text-secondary text-xs mb-1">Account Status</p>
              <p className="text-sm text-foreground">
                {admin?.status === 'ACTIVE' ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <h3 className="text-secondary text-xs font-medium mb-3">Security Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast({ title: 'Password Update', description: 'Password update link dispatched to your admin email.', variant: 'default' })}
                  className="w-full justify-start"
                >
                  <Settings className="h-4 w-4 mr-2" /> Change Password
                </Button>
                <p className="text-xs text-secondary mt-1">Update your password</p>
              </div>
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast({ title: 'Active Sessions', description: '1 active administrator session verified.', variant: 'default' })}
                  className="w-full justify-start"
                >
                  <Clock className="h-4 w-4 mr-2" /> Active Sessions
                </Button>
                <p className="text-xs text-secondary mt-1">Manage logged-in devices</p>
              </div>
              <div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => toast({ title: 'Sessions Terminated', description: 'All other administrator sessions have been signed out.', variant: 'default' })}
                  className="w-full justify-start"
                >
                  <LogOut className="h-4 w-4 mr-2" /> Sign Out All Others
                </Button>
                <p className="text-xs text-secondary mt-1">Force sign out from all devices</p>
              </div>
            </div>
          </div>
        </section>

        {/* Session Management */}
        <section className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-2">Session Management</h2>
          <p className="text-secondary text-sm mb-4">
            Monitor and manage active administrator sessions for security.
          </p>
          <div className="space-y-3">
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-primary dark:text-accent flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">Current Session</p>
                  <p className="text-xs text-secondary">
                    Logged in 2 hours ago • IP: 192.168.1.45
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toast({ title: 'Session Active', description: 'Current session cannot be terminated from here.', variant: 'default' })}
                >
                  End
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}