import { Button } from '@/components/ui/button'
import { Table, Check, X, Shield } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, Variants } from 'framer-motion'

export function AdminRolesMatrixPage() {
  const navigate = useNavigate()

  const [permissions, setPermissions] = useState<any[]>([])

  useEffect(() => {
    // In a real app, this would fetch the permission matrix from the API
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
      <Check className="h-4 w-4 text-success" />
    ) : (
      <X className="h-4 w-4 text-error" />
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight">Role-Based Access Control</h1>
            <Shield className="h-5 w-5 text-secondary" />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
              ← Back to Command Center
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">

        {/* Role Summary */}
        <motion.section
          className="bg-white rounded-lg p-6 mb-8"
          variants={cardEntrance}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-lg font-medium mb-3">Role Summary</h2>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {permissions.map((role) => (
              <div
                key={role.role}
                className="p-3 rounded-lg border bg-card/50 text-sm"
              >
                <p className="font-medium text-primary">{role.role}</p>
                <p className="text-xs text-secondary/80">{role.description}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Permission Matrix */}
        <motion.section
          className="bg-white rounded-lg overflow-hidden"
          variants={cardEntrance}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-lg font-medium border-b border-border/50 pb-3">
            Permission Matrix
          </h2>
          <div className="overflow-x-auto">
            <Table />
          </div>
        </motion.section>

        {/* Detailed Permission Breakdown */}
        <motion.section
          className="bg-white rounded-lg p-6"
          variants={cardEntrance}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-lg font-medium mb-3">Permission Details by Role</h2>
          <div className="grid grid-cols-2 gap-6">
            {permissions.map((role) => (
              <div
                key={role.role}
                className="p-4 rounded-lg border bg-card/50"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium text-primary">{role.role}</h3>
                    <p className="text-xs text-secondary/80">{role.description}</p>
                  </div>
                  <Shield className="h-5 w-5 text-primary" />
                </div>

                {/* Permission Grid */}
                <div className="space-y-3">
                  {['users', 'roles', 'events', 'jobs', 'mentorship', 'analytics', 'settings'].map(
                    (category) => (
                      <div
                        key={category}
                        className="p-3 rounded-lg bg-primary/5"
                      >
                        <p className="text-secondary/80 text-xs mb-1">{category}</p>
                        <div className="flex gap-2">
                          {role.permissions[category as keyof typeof role.permissions].map(
                            (access: boolean, index: number) => (
                              <span
                                key={index}
                                className={
                                  `inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                                    access ? 'bg-success/20 text-success' : 'bg-error/20 text-error'
                                  }`
                                }
                              >
                                {permissionStatus(access)}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )
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