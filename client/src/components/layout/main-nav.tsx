import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'

export function MainNav() {
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/90 backdrop-blur-md">
      <div className="page-container h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Lockup */}
        <Link
          to="/"
          className="flex items-center gap-2.5 text-lg font-display font-bold tracking-tight text-foreground whitespace-nowrap shrink-0"
        >
          <img
            src="/images/university-logo.jpg"
            alt="Sukkur IBA University"
            className="h-8 w-8 rounded-lg object-cover ring-1 ring-border"
          />
          <span>AlumniConnect</span>
        </Link>

        {/* Zone 2: Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-secondary">
          <Link
            to="/dashboard"
            className="hover:text-foreground hover:underline underline-offset-8 decoration-primary/60 transition-colors whitespace-nowrap shrink-0"
          >
            Dashboard
          </Link>
          <Link
            to="/alumni"
            className="hover:text-foreground hover:underline underline-offset-8 decoration-primary/60 transition-colors whitespace-nowrap shrink-0"
          >
            Directory
          </Link>
          <Link
            to="/jobs"
            className="hover:text-foreground hover:underline underline-offset-8 decoration-primary/60 transition-colors whitespace-nowrap shrink-0"
          >
            Jobs
          </Link>
          <Link
            to="/events"
            className="hover:text-foreground hover:underline underline-offset-8 decoration-primary/60 transition-colors whitespace-nowrap shrink-0"
          >
            Events
          </Link>
          <Link
            to="/mentorship"
            className="hover:text-foreground hover:underline underline-offset-8 decoration-primary/60 transition-colors whitespace-nowrap shrink-0"
          >
            Mentorship
          </Link>
        </nav>

        {/* Zone 3: User Menu & Mobile Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <Link to="/profile" aria-label="Your profile">
            <Avatar className="h-8 w-8 ring-1 ring-border">
              <AvatarImage src="/images/avatar.jpg" alt="Your profile" />
              <AvatarFallback>UA</AvatarFallback>
            </Avatar>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/login')}
            className="hidden sm:inline-flex"
          >
            Sign Out
          </Button>
          <button
            type="button"
            className="md:hidden p-2 rounded-lg hover:bg-stone"
            aria-label="Open main menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  )
}