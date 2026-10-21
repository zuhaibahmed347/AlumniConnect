import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ThemeSwitcher } from '@/components/ui/theme-switcher'
import { toast } from '@/lib/toast'
import { Loader2, Check, Settings } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function AdminSettingsPage() {
  const navigate = useNavigate()

  const [settings, setSettings] = useState<any>({
    communityGuidelines: '',
    verificationRequired: true,
    maxConnections: 500,
    notificationEmail: true,
    notificationInApp: true,
    allowJobApplications: true,
    allowMentorshipRequests: true,
    dataRetentionMonths: 24,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground p-8">
        <div className="max-w-2xl mx-auto text-center">
          <Loader2 className="h-6 w-6 mx-auto mb-3 animate-spin text-primary" />
          <p className="text-secondary">Loading settings...</p>
        </div>
      </main>
    )
  }

  const handleSave = () => {
    toast({
      title: 'Settings Saved',
      description: 'Platform settings have been updated successfully.',
      variant: 'success',
    })
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-foreground">Platform Settings</h1>
            <Settings className="h-5 w-5 text-secondary" />
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
        {/* Community Guidelines */}
        <section className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-2">Community Guidelines</h2>
          <p className="text-secondary text-sm mb-4">
            Rules and policies governing user behavior on the platform.
          </p>
          <Input
            value={settings.communityGuidelines}
            onChange={(e) =>
              setSettings({
                ...settings,
                communityGuidelines: e.target.value,
              })
            }
            placeholder="Enter community guidelines text..."
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            className="mt-4"
          >
            <Check className="h-4 w-4 mr-2" /> Save Changes
          </Button>
        </section>

        {/* Verification & Notifications */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Verification */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground mb-4">Verification Settings</h3>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.verificationRequired}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      verificationRequired: e.target.checked,
                    })
                  }
                  className="rounded border-border w-4 h-4 accent-primary"
                />
                <span className="text-sm text-foreground">Require email verification for new registrations</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notificationEmail}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      notificationEmail: e.target.checked,
                    })
                  }
                  className="rounded border-border w-4 h-4 accent-primary"
                />
                <span className="text-sm text-foreground">Send email notifications</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notificationInApp}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      notificationInApp: e.target.checked,
                    })
                  }
                  className="rounded border-border w-4 h-4 accent-primary"
                />
                <span className="text-sm text-foreground">Send in-app notifications</span>
              </label>
            </div>
          </div>

          {/* Feature Flags */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground mb-4">Feature Flags</h3>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.allowJobApplications}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      allowJobApplications: e.target.checked,
                    })
                  }
                  className="rounded border-border w-4 h-4 accent-primary"
                />
                <span className="text-sm text-foreground">Allow job applications</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.allowMentorshipRequests}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      allowMentorshipRequests: e.target.checked,
                    })
                  }
                  className="rounded border-border w-4 h-4 accent-primary"
                />
                <span className="text-sm text-foreground">Allow mentorship requests</span>
              </label>
            </div>
          </div>
        </section>

        {/* Data Retention */}
        <section className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-2">Data Retention</h2>
          <p className="text-secondary text-sm mb-4">
            Configure how long user data is retained on the platform.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div>
              <p className="text-foreground text-xs font-medium mb-1.5">Data Retention Period (months)</p>
              <Input
                type="number"
                value={settings.dataRetentionMonths}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    dataRetentionMonths: parseInt(e.target.value),
                  })
                }
                min={6}
                max={60}
                placeholder="24"
              />
            </div>
            <div>
              <Button
                variant="outline"
                onClick={handleSave}
              >
                <Check className="h-4 w-4 mr-2" /> Save Changes
              </Button>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}