import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ThemeSwitcher } from '@/components/ui/theme-switcher'
import { Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function SettingsPage() {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [showDeleteAccount, setShowDeleteAccount] = useState(false)
  const [showDeactivateAccount, setShowDeactivateAccount] = useState(false)

  useEffect(() => {
    // In a real app, this would fetch user settings from the API
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground p-8">
        <div className="min-h-[200px] flex flex-col items-center justify-center py-8">
          <Loader2 className="h-6 w-6 mx-auto mb-3 animate-spin text-primary" />
          <p className="text-secondary">Loading settings...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight text-foreground">Settings</h1>
          <ThemeSwitcher />
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Account Security Section */}
        <section className="mb-6 rounded-lg border border-border bg-card p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4">Account Security</h2>
          <div className="space-y-3">
            {/* Password Change */}
            <div>
              <button
                className="w-full flex justify-between items-center rounded-lg border border-border bg-stone/60 text-foreground text-left hover:bg-primary/10 transition-colors px-4 py-2.5 text-sm font-medium"
                onClick={() => setShowChangePassword(true)}
              >
                <span className="flex items-center">
                  Change password
                  <svg className="h-4 w-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7l7 9z" />
                  </svg>
                </span>
              </button>
            </div>

            {/* Active Sessions */}
            <div>
              <button
                className="w-full flex justify-between items-center rounded-lg border border-border bg-stone/60 text-foreground text-left hover:bg-primary/10 transition-colors px-4 py-2.5 text-sm font-medium"
              >
                <span className="flex items-center">
                  Active sessions
                  <svg className="h-4 w-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7l7 9z" />
                  </svg>
                </span>
              </button>
            </div>

            {/* Two-Factor Authentication */}
            <div>
              <button
                className="w-full flex justify-between items-center rounded-lg border border-border bg-stone/60 text-foreground text-left hover:bg-primary/10 transition-colors px-4 py-2.5 text-sm font-medium"
              >
                <span className="flex items-center">
                  Two-factor authentication
                  <svg className="h-4 w-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7l7 9z" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Privacy Controls Section */}
        <section className="mb-6 rounded-lg border border-border bg-card p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4">Privacy Controls</h2>
          <div className="space-y-4">
            {/* Profile Visibility */}
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Profile visibility</p>
              <div className="flex items-center gap-5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    value="public"
                    defaultChecked
                    className="rounded-full border border-border w-4 h-4 bg-card accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                  <span className="text-foreground text-sm">Public</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    value="private"
                    className="rounded-full border border-border w-4 h-4 bg-card accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                  <span className="text-foreground text-sm">Private</span>
                </label>
              </div>
            </div>

            {/* Notification Preferences */}
            <div>
              <p className="text-sm font-medium text-foreground mb-1">Notification preferences</p>
              <p className="text-xs text-secondary">
                Choose what types of notifications you receive
              </p>
            </div>

            {/* Data Download */}
            <div>
              <button
                className="w-full flex justify-between items-center rounded-lg border border-border bg-stone/60 text-foreground text-left hover:bg-primary/10 transition-colors px-4 py-2.5 text-sm font-medium"
                aria-label="Download data"
              >
                <span className="flex items-center">
                  Download your data
                  <svg className="h-4 w-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7l7 9z" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Account Management Section */}
        <section className="mb-6 rounded-lg border border-border bg-card p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4">Account Management</h2>
          <div className="space-y-3">
            {/* Delete Account */}
            <div>
              <button
                className="w-full flex justify-between items-center rounded-lg border border-error/30 bg-error/10 text-left hover:bg-error/20 transition-colors px-4 py-2.5 text-sm font-medium text-error"
                onClick={() => setShowDeleteAccount(true)}
              >
                <span className="flex items-center">
                  Delete account
                  <svg className="h-4 w-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7l7 9z" />
                  </svg>
                </span>
              </button>
            </div>

            {/* Deactivate Account */}
            <div>
              <button
                className="w-full flex justify-between items-center rounded-lg border border-warning/30 bg-warning/10 text-left hover:bg-warning/20 transition-colors px-4 py-2.5 text-sm font-medium text-warning"
                onClick={() => setShowDeactivateAccount(true)}
              >
                <span className="flex items-center">
                  Deactivate account
                  <svg className="h-4 w-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7l7 9z" />
                  </svg>
                </span>
              </button>
            </div>

            {/* Sign Out Everywhere */}
            <div>
              <button
                className="w-full flex justify-between items-center rounded-lg border border-border bg-stone/60 text-foreground text-left hover:bg-primary/10 transition-colors px-4 py-2.5 text-sm font-medium"
                aria-label="Sign out everywhere"
              >
                <span className="flex items-center">
                  Sign out everywhere
                  <svg className="h-4 w-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7l7 9z" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Modal: Change Password */}
        {showChangePassword && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card text-foreground border border-border rounded-lg p-6 w-full max-w-md shadow-xl">
              <h2 className="text-xl font-bold text-foreground mb-4">Change Password</h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Current password</label>
                  <Input type="password" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">New password</label>
                  <Input type="password" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Confirm new password</label>
                  <Input type="password" />
                </div>
              </form>
              <div className="flex gap-2 mt-6">
                <Button variant="ghost" size="sm" onClick={() => setShowChangePassword(false)}>Cancel</Button>
                <Button type="submit" className="w-full">Save changes</Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Delete Account Confirmation */}
        {showDeleteAccount && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card text-foreground border border-border rounded-lg p-8 w-full max-w-md shadow-xl">
              <h2 className="text-xl font-bold text-foreground mb-4">Delete Account</h2>
              <p className="text-foreground/90 mb-4">
                Are you sure you want to permanently delete your account? This action cannot be undone.
              </p>
              <p className="text-secondary text-sm mb-6">
                This will remove your profile, connections, messages, and all account data.
              </p>
              <div className="flex gap-3">
                <Button variant="ghost" size="sm" onClick={() => setShowDeleteAccount(false)}>Cancel</Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    navigate('/login')
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Deactivate Account Confirmation */}
        {showDeactivateAccount && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card text-foreground border border-border rounded-lg p-8 w-full max-w-md shadow-xl">
              <h2 className="text-xl font-bold text-foreground mb-4">Deactivate Account</h2>
              <p className="text-secondary mb-6">
                Are you sure you want to deactivate your account? Your profile will be hidden but you can reactivate it later.
              </p>
              <div className="flex gap-3">
                <Button variant="ghost" size="sm" onClick={() => setShowDeactivateAccount(false)}>Cancel</Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    navigate('/login')
                  }}
                >
                  Deactivate
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}