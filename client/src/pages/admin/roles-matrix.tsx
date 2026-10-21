import { Button } from '@/components/ui/button'
import { ThemeSwitcher } from '@/components/ui/theme-switcher'
import { Check, X, Shield } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, Variants } from 'framer-motion'

export function AdminRolesMatrixPage() {
  const navigate = useNavigate()

  const [permissions, setPermissions] = useState<any[]>([])

  useEffect(() => {
    const mockPermissions = [
      {
        role: 'SUPER_ADMIN',
        description: 'Full platform access',
        permissions: {
          users: { view: true, create: true, update: true, delete: true },
          roles: { view: true, create: true, update: true, delete: true },
          events: { view: true, create: true, update: true, delete: true },
          jobs: { view: true, create: true, update: true, delete: true },
          mentorship: { view: true, create: true, update: true, delete: true },
          analytics: { view: true },
          settings: { view: true, update: true },
        },
      },
      {
        role: 'ADMIN',
        description: 'Administrative functions',
        permissions: {
          users: { view: true, create: true, update: true, delete: false },
          roles: { view: true, create: false, update: true, delete: false },
          events: { view: true, create: true, update: true, delete: true },
          jobs: { view: true, create: true, update: true, delete: true },
          mentorship: { view: true, create: true, update: true, delete: false },
          analytics: { view: true },
          settings: { view: true },
        },
      },
      {
        role: 'EVENT_MANAGER',
        description: 'Event management only',
        permissions: {
          users: { view: false, create: false, update: false, delete: false },
          roles: { view: false, create: false, update: false, delete: false },
          events: { view: true, create: true, update: true, delete: true },
          jobs: { view: false, create: false, update: false, delete: false },
          mentorship: { view: false, create: false, update: false, delete: false },
          analytics: { view: true },
          settings: { view: false },
        },
      },
      {
        role: 'MODERATOR',
        description: 'Content moderation',
        permissions: {
          users: { view: true, create: false, update: false, delete: false },
          roles: { view: false, create: false, update: false, delete: false },
          events: { view: true, create: false, update: true, delete: true },
          jobs: { view: false, create: false, update: false, delete: false },
          mentorship: { view: false, create: false, update: false, delete: false },
          analytics: { view: true },
          settings: { view: false },
        },
      },
      {
        role: 'MENTORSHIP_MANAGER',
        description: 'Mentorship program oversight',
        permissions: {
          users: { view: true, create: false, update: false, delete: false },
          roles: { view: false, create: false, update: false, delete: false },
          events: { view: true, create: false, update: false, delete: false },
          jobs: { view: true, create: false, update: false, delete: false },
          mentorship: { view: true, create: true, update: true, delete: true },
          analytics: { view: true },
          settings: { view: false },
        },
      },
      {
        role: 'MEMBER',
        description: 'Standard member access',
        permissions: {
          users: { view: false, create: false, update: false, delete: false },
          roles: { view: false, create: false, update: false, delete: false },
          events: { view: true, create: false, update: false, delete: false },
          jobs: { view: true, create: false, update: false, delete: false },
          mentorship: { view: true, create: false, update: false, delete: false },
          analytics: { view: true },
          settings: { view: false },
        },
      },
    ]

    setPermissions(mockPermissions)
  }, [])

  const cardEntrance: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 25,
        delay: 0.1,
      },
    },
  }

  const permissionStatus = (hasAccess: boolean) => {
    return hasAccess ? (
      <Check className="h-3.5 w-3.5 text-success" />
    ) : (
      <X className="h-3.5 w-3.5 text-error" />
    )
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-foreground">Role-Based Access Control</h1>
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
        {/* Role Summary */}
        <motion.section
          className="bg-card border border-border rounded-lg p-6 shadow-sm"
          variants={cardEntrance}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">Role Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {permissions.map((role) => (
              <div
                key={role.role}
                className="p-4 rounded-lg border border-border bg-stone/40 text-sm"
              >
                <p className="font-semibold text-primary dark:text-accent">{role.role}</p>
                <p className="text-xs text-secondary mt-1">{role.description}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Detailed Permission Breakdown */}
        <motion.section
          className="bg-card border border-border rounded-lg p-6 shadow-sm"
          variants={cardEntrance}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">Permission Details by Role</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {permissions.map((role) => (
              <div
                key={role.role}
                className="p-5 rounded-lg border border-border bg-stone/30"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-primary dark:text-accent">{role.role}</h3>
                    <p className="text-xs text-secondary">{role.description}</p>
                  </div>
                  <Shield className="h-5 w-5 text-primary dark:text-accent" />
                </div>

                {/* Permission Grid */}
                <div className="space-y-2.5">
                  {['users', 'roles', 'events', 'jobs', 'mentorship', 'analytics', 'settings'].map(
                    (category) => {
                      const catPerms = role.permissions[category] || {}
                      return (
                        <div
                          key={category}
                          className="p-3 rounded-lg bg-card border border-border/60 flex items-center justify-between gap-2"
                        >
                          <p className="text-foreground text-xs font-semibold uppercase tracking-wider">{category}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {Object.entries(catPerms).map(
                              ([action, access]) => (
                                <span
                                  key={action}
                                  className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs font-medium ${
                                    access
                                      ? 'bg-success/15 border-success/30 text-success'
                                      : 'bg-error/15 border-error/30 text-error'
                                  }`}
                                >
                                  {permissionStatus(Boolean(access))}
                                  <span>{action}</span>
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      )
                    }
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      </div>
    </main>
  )
}