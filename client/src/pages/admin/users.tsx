import { Avatar } from '@/components/ui/avatar'
import { Input, SelectField } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ThemeSwitcher } from '@/components/ui/theme-switcher'
import { toast } from '@/lib/toast'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion, Variants } from 'framer-motion'

export function AdminUsersPage() {
  const navigate = useNavigate()

  const [users, setUsers] = useState<any[]>([])
  const [filters, setFilters] = useState({
    search: '',
    role: '' as string,
    status: '' as string,
    page: 1 as number,
    limit: 20,
  })

  const { register, handleSubmit } = useForm({ defaultValues: { search: '', role: '', status: '', page: 1, limit: 20 } })

  useEffect(() => {
    const mockUsers = [
      {
        id: '1',
        name: 'Ahmed Hassan',
        email: 'ahmed.hassan@iba-suk.edu.pk',
        role: 'MEMBER',
        status: 'ACTIVE',
        emailVerified: true,
        createdAt: new Date('2020-09-15'),
        lastLoginAt: new Date(),
        profile: {
          headline: 'Software Engineer at TechCorp',
          graduationYear: 2020,
          location: 'Karachi, Pakistan',
        },
      },
      {
        id: '2',
        name: 'Saba Ahmed',
        email: 'saba.ahmed@iba-suk.edu.pk',
        role: 'MEMBER',
        status: 'PENDING_VERIFICATION',
        emailVerified: false,
        createdAt: new Date('2024-01-10'),
        lastLoginAt: null,
        profile: {
          headline: 'Marketing Manager at MegaCorp',
          graduationYear: 2019,
          location: 'Lahore, Pakistan',
        },
      },
      {
        id: '3',
        name: 'Usman Khan',
        email: 'usman.khan@iba-suk.edu.pk',
        role: 'ADMIN',
        status: 'ACTIVE',
        emailVerified: true,
        createdAt: new Date('2019-06-20'),
        lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
        profile: {
          headline: 'Data Scientist at DataInsights',
          graduationYear: 2018,
          location: 'Islamabad, Pakistan',
        },
      },
      {
        id: '4',
        name: 'Fatima Shah',
        email: 'fatima.shah@iba-suk.edu.pk',
        role: 'MEMBER',
        status: 'SUSPENDED',
        emailVerified: true,
        createdAt: new Date('2021-03-05'),
        lastLoginAt: null,
        profile: {
          headline: 'HR Manager at HumaneCorp',
          graduationYear: 2021,
          location: 'Karachi, Pakistan',
        },
      },
    ]

    setUsers(mockUsers)
  }, [])

  const onSubmit = (data: any) => {
    const newPage = data.page != null ? Number(data.page) : filters.page
    const newLimit = data.limit != null ? Number(data.limit) : filters.limit
    setFilters({
      ...filters,
      search: data.search || '',
      role: data.role ?? filters.role,
      status: data.status ?? filters.status,
      page: newPage,
      limit: newLimit,
    })
  }

  const userRowVariants: Variants = {
    hidden: { opacity: 0, x: -12 as const },
    visible: {
      opacity: 1,
      x: 0 as const,
      transition: {
        type: 'spring' as const,
        stiffness: 200 as const,
        damping: 25 as const,
        delay: 0.05 as const,
      },
    },
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight text-foreground">User Management</h1>
          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
              ← Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Filters */}
        <motion.section
          className="mb-6 rounded-lg border border-border bg-card p-4 shadow-sm"
          variants={userRowVariants}
          initial="hidden"
          animate="visible"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-center">
            <div>
              <Input
                placeholder="Search users..."
                {...register('search')}
              />
            </div>

            <div>
              <SelectField {...register('role')} aria-label="Filter by role">
                <option value="">All Roles</option>
                <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                <option value="ADMIN">ADMIN</option>
                <option value="MEMBER">MEMBER</option>
              </SelectField>
            </div>

            <div>
              <SelectField {...register('status')} aria-label="Filter by status">
                <option value="">All Statuses</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="PENDING_VERIFICATION">PENDING_VERIFICATION</option>
                <option value="SUSPENDED">SUSPENDED</option>
              </SelectField>
            </div>

            <Button type="submit" className="w-full sm:w-auto">
              Apply Filters
            </Button>
          </form>
        </motion.section>

        {/* Users Table */}
        <motion.section
          variants={userRowVariants}
          initial="hidden"
          animate="visible"
        >
          <section className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
            <div className="max-w-7xl mx-auto">
              <div className="overflow-x-auto">
                <table className="w-full min-w-full">
                  <thead>
                    <tr className="border-b border-border bg-stone/40">
                      <th className="p-3.5 text-left text-xs font-semibold uppercase tracking-wider text-secondary">Name</th>
                      <th className="p-3.5 text-left text-xs font-semibold uppercase tracking-wider text-secondary">Email</th>
                      <th className="p-3.5 text-left text-xs font-semibold uppercase tracking-wider text-secondary">Role</th>
                      <th className="p-3.5 text-left text-xs font-semibold uppercase tracking-wider text-secondary">Status</th>
                      <th className="p-3.5 text-left text-xs font-semibold uppercase tracking-wider text-secondary">Joined</th>
                      <th className="p-3.5 text-right text-xs font-semibold uppercase tracking-wider text-secondary">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <motion.tr
                        key={user.id}
                        variants={userRowVariants}
                        initial="hidden"
                        animate="visible"
                        className="border-b border-border/60 hover:bg-primary/5 transition-colors"
                      >
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <Avatar className="h-7 w-7 text-xs">
                              {user.name.substring(0, 1)}
                            </Avatar>
                            <span className="font-medium text-foreground">{user.name}</span>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <a
                            href={`mailto:${user.email}`}
                            className="text-primary dark:text-accent hover:underline text-sm"
                          >
                            {user.email}
                          </a>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={
                              user.role === 'ADMIN'
                                ? 'text-primary dark:text-accent font-semibold text-xs'
                                : 'text-secondary text-xs font-medium'
                            }
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`text-xs font-semibold ${
                              user.status === 'ACTIVE'
                                ? 'text-success'
                                : user.status === 'PENDING_VERIFICATION'
                                  ? 'text-warning'
                                  : 'text-error'
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <p className="text-xs text-secondary">
                            {user.createdAt.toLocaleDateString()}
                          </p>
                        </td>
                        <td className="p-3.5 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              toast({
                                title: `Reviewing ${user.name}`,
                                description: `${user.profile?.headline || 'Alumni Member'} (${user.email})`,
                                variant: 'default',
                              })
                            }
                          >
                            Review
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-warning hover:text-warning/80 ml-1"
                            onClick={() =>
                              toast({
                                title: user.status === 'SUSPENDED' ? 'User Reactivated' : 'User Suspended',
                                description: `Account status updated for ${user.name}.`,
                                variant: 'default',
                              })
                            }
                          >
                            {user.status === 'SUSPENDED' ? 'Reactivate' : 'Suspend'}
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {users.length > 0 && (
                <div className="p-4 border-t border-border flex justify-center items-center gap-2 text-sm text-secondary">
                  <span className="mr-2">Page {filters.page} of 4</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilters({ ...filters, page: 1 })}
                  >
                    First
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setFilters({ ...filters, page: Math.max(filters.page - 1, 1) })
                    }
                  >
                    Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setFilters({ ...filters, page: Math.min(filters.page + 1, 4) })
                    }
                  >
                    Next
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilters({ ...filters, page: 4 })}
                  >
                    Last
                  </Button>
                </div>
              )}
            </div>
          </section>
        </motion.section>
      </div>
    </main>
  )
}