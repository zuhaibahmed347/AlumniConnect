import { Button } from '@/components/ui/button'
import { Loader2, Shield, Clock, Settings, LogOut, User } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function AdminProfilePage() {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [admin, setAdmin] = useState<any>(null)

  useEffect(() => {
    // In a real app, this would fetch the admin profile from the API
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
      <main className="min-h-screen bg-background p-8">
        <div className="max-w-2xl mx-auto text-center">
          <Loader2 className="h-6 w-6 mx-auto mb-3" />
          <p>Loading admin profile...</p>
        </div>
      </main>
    )
  }

  const formatDate = (date: Date | string | undefined) =>
    date ? new Date(date).toLocaleDateString() : 'Never'

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight">Admin Profile</h1>
            <Shield className="h-5 w-5 text-secondary" />
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
            ← Back to Command Center
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Admin Info */}
        <section className="bg-white rounded-lg p-6 mb-8">
          <h2 className="text-lg font-medium mb-3">Profile Information</h2>
          <div className="grid grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <p className="text-secondary/80 text-xs mb-1">Name</p>
              <p className="font-medium">{admin?.name}</p>
            </div>
            {/* Email */}
            <div>
              <p className="text-secondary/80 text-xs mb-1">Email</p>
              <p className="font-medium text-primary">{admin?.email}</p>
            </div>
            {/* Role */}
            <div>
              <p className="text-secondary/80 text-xs mb-1">Role</p>
              <p className="font-medium">
                {admin?.role === 'SUPER_ADMIN' ? 'Super Administrator' : admin?.role}
              </p>
            </div>
            {/* Status */}
            <div>
              <p className="text-secondary/80 text-xs mb-1">Status</p>
              <p className={admin?.status === 'ACTIVE' ? 'text-success' : 'text-error'}>
                {admin?.status}
              </p>
            </div>
          </div>
        </section>

        {/* Security Settings */}
        <section className="mt-8 bg-white rounded-lg p-6">
          <h2 className="text-lg font-medium mb-3">Security Settings</h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Last Login */}
            <div>
              <p className="text-secondary/80 text-xs mb-1">Last Login</p>
              <p className="text-sm text-secondary">
                {formatDate(admin?.lastLoginAt)}
              </p>
            </div>
            {/* Account Status */}
            <div>
              <p className="text-secondary/80 text-xs mb-1">Account Status</p>
              <p className="text-sm">
                {admin?.status === 'ACTIVE' ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>

          {/* Security Actions */}
          <div className="pt-4 border-t border-border/10">
            <h3 className="text-secondary/80 text-xs mb-2">Security Actions</h3>
            <div className="space-y-3">
              {/* Change Password */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => alert('Open change password modal')}
                className="w-full justify-start"
              >
                <Settings className="h-4 w-4 mr-2" /> Change Password
              </Button>
              <p className="text-xs text-secondary/80 mt-1">Update your password</p>
              {/* Security Sessions */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => alert('View active sessions')}
                className="w-full justify-start"
              >
                <Clock className="h-4 w-4 mr-2" /> Active Sessions
              </Button>
              <p className="text-xs text-secondary/80 mt-1">Manage logged-in devices</p>
              {/* Sign Out All */}
              <Button
                variant="destructive"
                size="sm"
                onClick={() => alert('Sign out all other sessions')}
                className="w-full justify-start"
              >
                <LogOut className="h-4 w-4 mr-2" /> Sign Out All Others
              </Button>
              <p className="text-xs text-secondary/80 mt-1">Force sign out from all devices</p>
            </div>
          </div>
        </section>

        {/* Session Management */}
        <section className="mt-8 bg-white rounded-lg p-6">
          <h2 className="text-lg font-medium mb-3">Session Management</h2>
          <p className="text-secondary/80 mb-4">
            Monitor and manage active administrator sessions for security.
          </p>
          <div className="space-y-3">
            {/* Active Session Item */}
            <div className="p-3 rounded-lg bg-primary/5 border-primary/20 hover:bg-primary/10 transition-colors">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium">Current Session</p>
                  <p className="text-xs text-secondary/70">
                    Logged in 2 hours ago • IP: 192.168.1.45
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => alert('End session')}
                  className="text-primary/20 hover:text-primary px-2 py-1 rounded text-xs"
                >
                  End
                </Button>
              </div>
            </div>
            {/* No active sessions */}
            {false && (
              <p className="p-3 rounded-lg bg-secondary/5 text-secondary/80 text-center py-8">
                No active sessions
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}