import { Avatar } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion, Variants } from 'framer-motion'

export function AdminUsersPage() {
  const navigate = useNavigate()

  const [users, setUsers] = useState<any[]>([])
  const [filters, setFilters] = useState({
    search: '' ,
    role: '' as string,
    status: '' as string,
    page: 1 as number,
    limit: 20,
  })

  const { register, handleSubmit } = useForm({ defaultValues: { search: '', role: '', status: '', page: 1, limit: 20 } })

  useEffect(() => {
    // In a real app, this would fetch users from the API
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
    // Handle filter submission
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
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">User Management</h1>
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
            ← Back to Dashboard
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">

        {/* Filters */}
        <motion.section
          className="mb-6 rounded-lg border bg-card/50 p-4"
          variants={userRowVariants}
          initial="hidden"
          animate="visible"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols- lg:grid-cols-6 gap-3">
            {/* Search */}
            <div>
              <Input
                placeholder="Search users..."
                {...register('search')}
                className="flex-1 rounded border border-border px-3 py-2"
              />
            </div>

            {/* Role Filter */}
            <div>
              <select {...register('role')} className="rounded border border-border px-3 py-2">
                <option value="">All Roles</option>
                <option>SUPER_ADMIN</option>
                <option>ADMIN</option>
                <option>MEMBER</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select {...register('status')} className="rounded border border-border px-3 py-2">
                <option value="">All Statuses</option>
                <option>ACTIVE</option>
                <option>PENDING_VERIFICATION</option>
                <option>SUSPENDED</option>
              </select>
            </div>

            {/* Apply Filters */}
            <Button type="submit" className="sm:col-auto w-auto">
              Apply
            </Button>
          </form>
        </motion.section>

        {/* Users Table */}
        <motion.section
          variants={userRowVariants}
          initial="hidden"
          animate="visible"
        >
          <section className="bg-white">
            <div className="max-w-7xl mx-auto">
              <div className="overflow-x-auto">
                <table className="w-full min-w-full rounded-lg border border-border/50">
                  <thead>
                    <tr className="border-b border-border/10">
                      <th className="p-3 text-left text-sm font-medium text-secondary">Name</th>
                      <th className="p-3 text-left text-sm font-medium text-secondary">Email</th>
                      <th className="p-3 text-left text-sm font-medium text-secondary">Role</th>
                      <th className="p-3 text-left text-sm font-medium text-secondary">Status</th>
                      <th className="p-3 text-left text-sm font-medium text-secondary">Joined</th>
                      <th className="p-3 text-right text-sm font-medium text-secondary">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <motion.tr
                        key={user.id}
                        variants={userRowVariants}
                        initial="hidden"
                        animate="visible"
                        style={{ transitionDelay: String(users.indexOf(user) * 0.02) + 's' }}
                      >
                        <tr
                          key={user.id}
                          className="border-b border-border/10 hover:bg-primary/5"
                        >
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <Avatar
                                className="h-5 w-5"
                                >{user.name.substring(0, 1)}</Avatar>
                              <span>{user.name}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <a
                              href={`mailto:${user.email}`}
                              className="text-primary hover:text-secondary underline"
                            >
                              {user.email}
                            </a>
                          </td>
                          <td className="p-3">
                            <span
                              className={
                                user.role === 'ADMIN'
                                  ? 'text-primary'
                                  : 'text-secondary'
                              }
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="p-3">
                            <span
                              className={
                                user.status === 'ACTIVE'
                                  ? 'text-success'
                                  : user.status === 'PENDING_VERIFICATION'
                                    ? 'text-warning'
                                    : 'text-error'
                              }
                            >
                              {user.status}
                            </span>
                          </td>
                          <td className="p-3">
                            <p className="text-xs text-secondary/70">
                              {user.createdAt.toLocaleDateString()}
                            </p>
                          </td>
                          <td className="p-3 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-primary hover:text-secondary"
                              onClick={() => alert('Review profile')}
                            >
                              Review
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-warning hover:text-secondary ml-1"
                              onClick={() => alert('Suspend/Reactivate')}
                            >
                              {user.status === 'SUSPENDED' ? 'Reactivate' : 'Suspend'}
                            </Button>
                          </td>
                        </tr>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {users.length > 0 && (
                <div className="mt-6 flex justify-center items-center gap-2 text-sm text-secondary">
                  <span>Page {filters.page} of {4}</span>
                  <Button
                    variant="outline"
                    size="default"
                    className="h-8 w-8 flex items-center justify-center"
                    onClick={() => setFilters({ ...filters, page: 1 })}
                  >
                    First
                  </Button>
                  <Button
                    variant="outline"
                    size="default"
                    className="h-8 w-8 flex items-center justify-center"
                    onClick={() =>
                      setFilters({ ...filters, page: Math.max(filters.page - 1, 1) })
                    }
                  >
                    Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="default"
                    className="h-8 w-8 flex items-center justify-center"
                    onClick={() =>
                      setFilters({ ...filters, page: Math.min(filters.page + 1, 4) })
                    }
                  >
                    Next
                  </Button>
                  <Button
                    variant="outline"
                    size="default"
                    className="h-8 w-8 flex items-center justify-center"
                    onClick={() => setFilters({ ...filters, page: 4 }) }
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