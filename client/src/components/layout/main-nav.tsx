import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function MainNav() {
  const navigate = useNavigate()

  return (
    <nav className="border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Left - Logo and Nav */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7l7 9z" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight">AlumniConnect</span>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden p-2 rounded-lg hover:bg-primary/10" aria-label="Open main menu">
          <Menu className="h-5 w-5" />
        </button>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          <a href="/dashboard" className="text-sm font-medium text-secondary hover:text-primary transition-colors">Dashboard</a>
          <a href="/alumni" className="text-sm font-medium text-secondary hover:text-primary transition-colors">Alumni Directory</a>
          <a href="/jobs" className="text-sm font-medium text-secondary hover:text-primary transition-colors">Jobs</a>
          <a href="/events" className="text-sm font-medium text-secondary hover:text-primary transition-colors">Events</a>
          <a href="/mentorship" className="text-sm font-medium text-secondary hover:text-primary transition-colors">Mentorship</a>
        </div>
      </div>

      {/* Right - User Menu */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div>
            <Avatar className="h-8 w-8">UA</Avatar>
          </div>
          <div className="absolute right-0 top-full mt-2 w-32 rounded-lg bg-white px-3 py-2 shadow-sm border border-border/50 hidden md:block" aria-label="User menu">
            <a href="/profile" className="block text-sm text-primary hover:text-secondary mb-1">Profile</a>
            <a href="/settings" className="block text-sm text-primary hover:text-secondary mb-1">Settings</a>
            <a href="/messages" className="block text-sm text-primary hover:text-secondary mb-1">Messages</a>
            <a href="/notifications" className="block text-sm text-primary hover:text-secondary mb-1">Notifications</a>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigate('/logout')
              }}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}