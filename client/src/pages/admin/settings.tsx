import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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
    // In a real app, this would fetch settings from the API
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen bg-background p-8">
        <div className="max-w-2xl mx-auto text-center">
          <Loader2 className="h-6 w-6 mx-auto mb-3" />
          <p>Loading settings...</p>
        </div>
      </main>
    )
  }

  const handleSave = () => {
    alert('Settings saved successfully!')
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight">Platform Settings</h1>
            <Settings className="h-5 w-5 text-secondary" />
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
            ← Back to Command Center
          </Button>
        </div>
      </header>

 {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Community Guidelines */}
        <section className="bg-white rounded-lg p-6 mb-8">
          <h2 className="text-lg font-medium mb-4">Community Guidelines</h2>
          <p className="text-secondary/80 mb-4">
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
            className="w-full rounded border border-border px-3 py-3 h-32 resize-none"
            placeholder="Enter community guidelines text..."
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            className="mt-4 w-full justify-start"
          >
            <Check className="h-4 w-4 mr-2" /> Save Changes
          </Button>
        </section>

 {/* Verification & Notifications */}
        <section className="grid grid-cols-1 gap-6 mb-8">
 {/* Verification */}
          <div className="bg-white rounded-lg p-6">
            <h3 className="text-secondary/80 text-xs mb-2">Verification Settings</h3>
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <Input
                  type="checkbox"
                  checked={settings.verificationRequired}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      verificationRequired: e.target.checked,
                    })
                  }
                  className="rounded border border-border px-3 py-2"
                />
                <span>Require email verification for new registrations</span>
              </label>
              <label className="flex items-center gap-3">
                <Input
                  type="checkbox"
                  checked={settings.notificationEmail}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      notificationEmail: e.target.checked,
                    })
                  }
                  className="rounded border border-border px-3 py-2"
                />
                <span>Send email notifications</span>
              </label>
              <label className="flex items-center gap-3">
                <Input
                  type="checkbox"
                  checked={settings.notificationInApp}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      notificationInApp: e.target.checked,
                    })
                  }
                  className="rounded border border-border px-3 py-2"
                />
                <span>Send in-app notifications</span>
              </label>
            </div>
          </div>

 {/* Feature Flags */}
          <div className="bg-white rounded-lg p-6">
            <h3 className="text-secondary/80 text-xs mb-2">Feature Flags</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <Input
                  type="checkbox"
                  checked={settings.allowJobApplications}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      allowJobApplications: e.target.checked,
                    })
                  }
                  className="rounded border border-border px-3 py-2"
                />
                <span>Allow job applications</span>
              </label>
              <label className="flex items-center gap-3">
                <Input
                  type="checkbox"
                  checked={settings.allowMentorshipRequests}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      allowMentorshipRequests: e.target.checked,
                    })
                  }
                  className="rounded border border-border px-3 py-2"
                />
                <span>Allow mentorship requests</span>
              </label>
            </div>
          </div>
        </section>

 {/* Data Retention */}
        <section className="bg-white rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Data Retention</h2>
          <p className="text-secondary/80 mb-4">
            Configure how long user data is retained on the platform.
          </p>
          <div className="grid grid-cols-2 gap-4">
 {/* Months */}
            <div>
              <p className="text-secondary/80 text-xs mb-1">Data Retention Period</p>
              <Input
                type="number"
                value={settings.dataRetentionMonths}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    dataRetentionMonths: parseInt(e.target.value),
                  })
                }
                className="rounded border border-border px-3 py-2"
                min={6}
                max={60}
                placeholder="24"
              />
              <p className="text-xs text-secondary/70">months</p>
            </div>
{/* Save Changes */}
            <div className="pt-4 border-t border-border/10">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                className="w-full justify-start"
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