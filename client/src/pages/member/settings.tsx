import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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
      <main className="min-h-screen bg-background p-8">
        <div className="min-h-[200px] flex flex-col items-center justify-center py-8">
          <Loader2 className="h-6 w-6 mx-auto mb-3" />
          <p>Loading settings...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">Settings</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Account Security Section */}
        <section className="mb-6 rounded-lg border bg-card/50 p-4">
          <h2 className="text-lg font-medium mb-4">Account Security</h2>
          <div className="space-y-4">
            {/* Password Change */}
            <div>
              <button
                className="w-full justify-between items-center rounded-lg border bg-primary/5 text-left hover:bg-primary/10 transition-colors px-4 py-2.5 text-sm font-medium"
                onClick={() => setShowChangePassword(true)}
              >
                <span>
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
                className="w-full justify-between items-center rounded-lg border bg-primary/5 text-left hover:bg-primary/10 transition-colors px-4 py-2.5 text-sm font-medium"
              >
                <span>
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
                className="w-full justify-between items-center rounded-lg border bg-primary/5 text-left hover:bg-primary/10 transition-colors px-4 py-2.5 text-sm font-medium"
              >
                <span>
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
        <section className="mb-6 rounded-lg border bg-card/50 p-4">
          <h2 className="text-lg font-medium mb-4">Privacy Controls</h2>
          <div className="space-y-4">
            {/* Profile Visibility */}
            <div>
              <p className="text-sm font-medium mb-2">Profile visibility</p>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="visibility" value="public" defaultChecked className="rounded border border-gray-400 w-4 h-4 bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
                  <span className="text-secondary">Public</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="visibility" value="private" className="rounded border border-gray-400 w-4 h-4 bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
                  <span className="text-secondary">Private</span>
                </label>
              </div>
            </div>

            {/* Notification Preferences */}
            <div>
              <p className="text-sm font-medium mb-2">Notification preferences</p>
              <p className="text-xs text-secondary/80">
                Choose what types of notifications you receive
              </p>
              {/* Notification checkboxes would go here */}
            </div>

            {/* Data Download */}
            <div>
              <button
                className="w-full justify-between items-center rounded-lg border bg-primary/5 text-left hover:bg-primary/10 transition-colors px-4 py-2.5 text-sm font-medium"
                aria-label="Download data"
              >
                <span>
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
        <section className="mb-6 rounded-lg border bg-card/50 p-4">
          <h2 className="text-lg font-medium mb-4">Account Management</h2>
          <div className="space-y-3">
            {/* Delete Account */}
            <div>
              <button
                className="w-full justify-between items-center rounded-lg border bg-error/5 text-left hover:bg-error/10 transition-colors px-4 py-2.5 text-sm font-medium text-error"
                onClick={() => setShowDeleteAccount(true)}
              >
                <span>
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
                className="w-full justify-between items-center rounded-lg border bg-warning/5 text-left hover:bg-warning/10 transition-colors px-4 py-2.5 text-sm font-medium text-warning"
                onClick={() => setShowDeactivateAccount(true)}
              >
                <span>
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
                className="w-full justify-between items-center rounded-lg border bg-primary/5 text-left hover:bg-primary/10 transition-colors px-4 py-2.5 text-sm font-medium"
                aria-label="Sign out everywhere"
              >
                <span>
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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
              <h2 className="text-xl font-bold mb-4">Change Password</h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Current password</label>
                  <Input type="password" className="w-full rounded border border-border px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">New password</label>
                  <Input type="password" className="w-full rounded border border-border px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Confirm new password</label>
                  <Input type="password" className="w-full rounded border border-border px-3 py-2" />
                </div>
              </form>
              <div className="flex gap-2 mt-4">
                <Button variant="ghost" size="sm" onClick={() => setShowChangePassword(false)}>Cancel</Button>
                <Button type="submit" className="w-full">Save changes</Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Delete Account Confirmation */}
        {showDeleteAccount && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-8 w-full max-w-md shadow-xl">
              <h2 className="text-xl font-bold mb-6">Delete Account</h2>
              <p className="text-secondary mb-6">
                Are you sure you want to permanently delete your account? This action cannot be undone.
              </p>
              <p className="text-secondary/60 mb-6">
                This will remove your profile, connections, messages, and all account data.
              </p>
              <div className="flex gap-3">
                <Button variant="ghost" size="sm" onClick={() => setShowDeleteAccount(false)}>Cancel</Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    // In real app, would call API to delete account
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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-8 w-full max-w-md shadow-xl">
              <h2 className="text-xl font-bold mb-6">Deactivate Account</h2>
              <p className="text-secondary mb-6">
                Are you sure you want to deactivate your account? Your profile will be hidden but you can reactivate it later.
              </p>
              <div className="flex gap-3">
                <Button variant="ghost" size="sm" onClick={() => setShowDeactivateAccount(false)}>Cancel</Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    // In real app, would call API to deactivate account
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