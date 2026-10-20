import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function AdminAnalyticsPage() {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, this would fetch analytics data from the API
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen bg-background p-8">
        <div className="max-w-2xl mx-auto text-center">
          <Loader2 className="h-6 w-6 mx-auto mb-3" />
          <p>Loading analytics...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight">Analytics & Reporting</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
            ← Back to Command Center
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <p>Analytics data would be displayed here</p>
      </div>
    </main>
  )
}