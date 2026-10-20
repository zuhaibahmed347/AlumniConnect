import { Constellation3D } from '@/components/3d/Constellation'
export function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}

      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-md fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7l7 9z" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight">AlumniConnect</span>
          </div>
          <div className="hidden sm:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-secondary hover:text-primary transition-colors">Features</a>
            <a href="#events" className="text-sm font-medium text-secondary hover:text-primary transition-colors">Events</a>
            <a href="#jobs" className="text-sm font-medium text-secondary hover:text-primary transition-colors">Jobs</a>
            <a href="#mentorship" className="text-sm font-medium text-secondary hover:text-primary transition-colors">Mentorship</a>
          </div>
          <div className="flex items-center gap-3">
            <a href="/login" className="text-sm font-medium text-secondary hover:text-primary transition-colors">Sign In</a>
            <a href="/register" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
              Join Community
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}

      <section className="pt-20 pb-16 md:pt-32 lg:pt-48 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Hero Content */}
            <div>
              <p className="text-primary text-sm font-medium uppercase tracking-wider mb-4">
                Connecting Graduates. Inspiring Futures.
              </p>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-none tracking-tight mb-6">
                Welcome to AlumniConnect
              </h1>
              <p className="text-lg text-secondary mb-8 max-w-2xl leading-relaxed">
                A premier platform for Sukkur IBA graduates to connect, collaborate, and
                advance their careers. Join a community of alumni and discover mentorship,
                jobs, and events tailored to your interests.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a href="/register" className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 font-medium transition-colors">
                  Join the Community
                </a>
                <a href="/login" className="border border-border text-primary hover:bg-primary/5 px-6 py-3 rounded-lg font-medium transition-colors">
                  Sign In
                </a>
              </div>
            </div>

            {/* 3D Constellation Visual */}

            <Constellation3D className="lg:col-span-1" />

            {/* Floating Feature Cards - subtle, supporting */}

            <div className="lg:col-span-2 pt-6 lg:pt-0">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div
                  className="p-3 rounded-lg border bg-card/50 hover:bg-card transition-colors cursor-pointer group"
                  onMouseEnter={() => {
                    // No state change needed - just subtle visual feedback
                  }}
                >
                  <div className="h-6 flex items-center justify-center mb-2">
                    <svg
                      className="h-4 w-4 text-primary group-hover:text-primary/90 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2v-6a2 2 0 00-2-2h2a2 2 0 002 2zm0 0V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7.98m4 0c3.314 0 6 1.686 6 3.5V19a2 2 0 01-2 2h-2m0-12C7 4 3 8 3 12s4 8 3 12m0-12a8 8 0 100 16 8 8 0 000-16z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-medium mb-1 text-sm">Alumni Directory</h3>
                  <p className="text-xs text-secondary/60">
                    Search and connect with verified alumni
                  </p>
                </div>

                <div
                  className="p-3 rounded-lg border bg-card/50 hover:bg-card transition-colors cursor-pointer group"
                >
                  <div className="h-6 flex items-center justify-center mb-2">
                    <svg
                      className="h-4 w-4 text-primary group-hover:text-primary/90 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13V5.253m4.747 2.997c.09.068.172.138.255.208a6.986 6.986 0 01.255 2.997 3.5 3.5 0 105.99-.001 6.986 6.986 0 01.255-2.997c.083-.07.165-.141.255-.208m-4.748 0a3.5 3.5 0 00-5.99 0 3.5 3.5 0 00-5.99 0"
                      />
                    </svg>
                  </div>
                  <h3 className="font-medium mb-1 text-sm">Mentorship Program</h3>
                  <p className="text-xs text-secondary/60">
                    Find mentors and guide the next generation
                  </p>
                </div>

                <div
                  className="p-3 rounded-lg border bg-card/50 hover:bg-card transition-colors cursor-pointer group"
                >
                  <div className="h-6 flex items-center justify-center mb-2">
                    <svg
                      className="h-4 w-4 text-primary group-hover:text-primary/90 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                  <h3 className="font-medium mb-1 text-sm">Jobs & Referrals</h3>
                  <p className="text-xs text-secondary/60">
                    Find your next opportunity
                  </p>
                </div>

                <div
                  className="p-3 rounded-lg border bg-card/50 hover:bg-card transition-colors cursor-pointer group"
                >
                  <div className="h-6 flex items-center justify-center mb-2">
                    <svg
                      className="h-4 w-4 text-primary group-hover:text-primary/90 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v6a2 2 0 002 2h2a2 2 0 002-2v-6a2 2 0 00-2-2H9zm12 4h.01M10.992 17.9a2.943 2.943 0 012.183 0 2.943 2.943 0 010 5.886 2.943 2.943 0 01-2.183 0 2.943 2.943 0 01-2.183 0H3.1a2.943 2.943 0 01-2.183 0 2.943 2.943 0 010-5.886 2.943 2.943 0 012.183 0h.01M9 9h.01M15 11H9m6 4h.01M9 5h.01"
                      />
                    </svg>
                  </div>
                  <h3 className="font-medium mb-1 text-sm">University Events</h3>
                  <p className="text-xs text-secondary/60">
                    Stay connected with campus events
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}

      <section className="py-16 bg-white" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-primary text-sm font-medium uppercase tracking-wider mb-4">
              Features
            </p>
            <h2 className="text-3xl font-bold leading-none mb-2">
              What You'll Discover
            </h2>
            <p className="text-secondary max-w-2xl mx-auto">
              Explore the platform's key features designed for Sukkur IBA alumni
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 rounded-lg border bg-card/50 hover:bg-card transition-colors cursor-pointer">
              <div className="h-12 flex items-center justify-center mb-3">
                <svg
                  className="h-6 w-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2v-6a2 2 0 00-2-2h2a2 2 0 002 2zm0 0V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7.98m4 0c3.314 0 6 1.686 6 3.5V19a2 2 0 01-2 2h-2m0-12C7 4 3 8 3 12s4 8 3 12m0-12a8 8 0 100 16 8 8 0 000-16z"
                  />
                </svg>
              </div>
              <h3 className="font-medium mb-1">Alumni Directory</h3>
              <p className="text-sm text-secondary">
                Search and connect with verified alumni
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-card/50 hover:bg-card transition-colors cursor-pointer">
              <div className="h-12 flex items-center justify-center mb-3">
                <svg
                  className="h-6 w-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13V5.253m4.747 2.997c.09.068.172.138.255.208a6.986 6.986 0 01.255 2.997 3.5 3.5 0 105.99-.001 6.986 6.986 0 01.255-2.997c.083-.07.165-.141.255-.208m-4.748 0a3.5 3.5 0 00-5.99 0 3.5 3.5 0 00-5.99 0"
                  />
                </svg>
              </div>
              <h3 className="font-medium mb-1">Mentorship Program</h3>
              <p className="text-sm text-secondary">
                Find mentors and guide the next generation
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-card/50 hover:bg-card transition-colors cursor-pointer">
              <div className="h-12 flex items-center justify-center mb-3">
                <svg
                  className="h-6 w-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <h3 className="font-medium mb-1">Jobs & Referrals</h3>
              <p className="text-sm text-secondary">
                Find your next opportunity
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-card/50 hover:bg-card transition-colors cursor-pointer">
              <div className="h-12 flex items-center justify-center mb-3">
                <svg
                  className="h-6 w-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v6a2 2 0 002 2h2a2 2 0 002-2v-6a2 2 0 00-2-2H9zm12 4h.01M10.992 17.9a2.943 2.943 0 012.183 0 2.943 2.943 0 010 5.886 2.943 2.943 0 01-2.183 0 2.943 2.943 0 01-2.183 0H3.1a2.943 2.943 0 01-2.183 0 2.943 2.943 0 010-5.886 2.943 2.943 0 012.183 0h.01M9 9h.01M15 11H9m6 4h.01M9 5h.01"
                  />
                </svg>
              </div>
              <h3 className="font-medium mb-1">University Events</h3>
              <p className="text-sm text-secondary">
                Stay connected with campus events
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories Section */}

      <section className="py-16 bg-secondary/5" id="success-stories">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-primary text-sm font-medium uppercase tracking-wider mb-4">
              Success Stories
            </p>
            <h2 className="text-3xl font-bold leading-none mb-2">
              Alumni Impact
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-lg border bg-card/50">
              <p className="text-secondary text-sm italic">
                Verified alumni achievements
              </p>
            </div>
            <div className="p-6 rounded-lg border bg-card/50">
              <p className="text-secondary text-sm italic">
                Verified alumni achievements
              </p>
            </div>
            <div className="p-6 rounded-lg border bg-card/50">
              <p className="text-secondary text-sm italic">
                Verified alumni achievements
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}

      <section className="py-24 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-primary text-sm font-medium uppercase tracking-wider mb-4">
              Get Started
            </p>
            <h2 className="text-4xl font-bold leading-none mb-2">
              Join 5,000+ Alumni
            </h2>
            <p className="text-secondary mb-6 max-w-2xl mx-auto">
              Create your free profile and start connecting today
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="/register" className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 font-medium transition-colors">
                Create Profile
              </a>
              <a href="/login" className="border border-white/20 text-white px-8 py-3 rounded-lg hover:bg-white/10 font-medium transition-colors">
                Sign In
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}