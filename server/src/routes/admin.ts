import { Router } from 'express'
import { prisma } from '../utils/prisma'
import { validateQuery, validateParams, validateBody } from '../middleware/validation'
import { asyncHandler } from '../utils/asyncHandler'
import { successResponse, paginatedResponse, errorResponse } from '../utils/response'
import { AppError } from '../utils/errors'
import { z } from 'zod'
import { paginationSchema, idParamSchema, userFiltersSchema, userUpdateSchema, eventFiltersSchema, jobFiltersSchema } from '@alumni-connect/shared'
import { requirePermission, requireRole, AuthenticatedRequest } from '../middleware/auth'
import { UserRole, UserStatus, EventStatus, JobStatus, MentorshipStatus } from '@prisma/client'

const router = Router()

router.use(requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EVENT_MANAGER, UserRole.MODERATOR, UserRole.MENTORSHIP_MANAGER))

router.get('/dashboard', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const [
    totalUsers,
    activeUsers,
    pendingUsers,
    totalEvents,
    publishedEvents,
    totalJobs,
    activeJobs,
    mentorshipRequests,
    activeMentorships,
    unreadNotifications,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: UserStatus.ACTIVE } }),
    prisma.user.count({ where: { status: UserStatus.PENDING_VERIFICATION } }),
    prisma.event.count(),
    prisma.event.count({ where: { status: EventStatus.PUBLISHED } }),
    prisma.job.count(),
    prisma.job.count({ where: { status: JobStatus.ACTIVE } }),
    prisma.mentorshipRequest.count({ where: { status: MentorshipStatus.PENDING } }),
    prisma.mentorshipRequest.count({ where: { status: { in: [MentorshipStatus.ACCEPTED, MentorshipStatus.ACTIVE] } } }),
    prisma.notification.count({ where: { isRead: false } }),
  ])

  const recentUsers = await prisma.user.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
  })

  const recentEvents = await prisma.event.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true, status: true, startDate: true, createdAt: true },
  })

  const recentJobs = await prisma.job.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true, company: true, status: true, createdAt: true },
  })

  successResponse(res, {
    stats: {
      users: { total: totalUsers, active: activeUsers, pending: pendingUsers },
      events: { total: totalEvents, published: publishedEvents },
      jobs: { total: totalJobs, active: activeJobs },
      mentorship: { pendingRequests: mentorshipRequests, active: activeMentorships },
      notifications: { unread: unreadNotifications },
    },
    recent: { users: recentUsers, events: recentEvents, jobs: recentJobs },
  })
}))

router.get('/users', validateQuery(userFiltersSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { search, role, status, graduationYear, page, limit, sortBy, sortOrder } = req.query as any

  const where: any = {}
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ]
  }
  if (role) where.role = role
  if (status) where.status = status

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true, email: true, name: true, avatarUrl: true, role: true, status: true,
        emailVerified: true, createdAt: true, lastLoginAt: true,
        profile: { select: { headline: true, graduationYear: true, location: true } },
      },
      orderBy: { [sortBy || 'createdAt']: sortOrder || 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ])

  paginatedResponse(res, users, total, page, limit)
}))

router.get('/users/:id', validateParams(idParamSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    include: {
      profile: {
        include: {
          educations: true,
          experiences: true,
          profileSkills: { include: { skill: true } },
        },
      },
      _count: { select: { eventRegistrations: true, sentMessages: true, notifications: true } },
    },
  })

  if (!user) throw AppError.notFound('User not found')

  successResponse(res, { user })
}))

router.patch('/users/:id', validateParams(idParamSchema), validateBody(userUpdateSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params
  const { role, status, ...data } = req.body

  if (role && req.user!.role !== UserRole.SUPER_ADMIN && role === UserRole.SUPER_ADMIN) {
    throw AppError.forbidden('Only super admins can assign super admin role')
  }

  const user = await prisma.user.update({
    where: { id },
    data: { ...data, ...(role && { role }), ...(status && { status }) },
    select: { id: true, email: true, name: true, role: true, status: true },
  })

  successResponse(res, { user })
}))

router.delete('/users/:id', validateParams(idParamSchema), requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params

  if (id === req.user!.id) throw AppError.badRequest('Cannot delete yourself')

  await prisma.user.delete({ where: { id } })

  successResponse(res, { message: 'User deleted' })
}))

router.get('/events', validateQuery(eventFiltersSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { search, status, isVirtual, startDateFrom, startDateTo, page, limit, sortBy, sortOrder } = req.query as any

  const where: any = {}
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ]
  }
  if (status) where.status = status
  if (isVirtual !== undefined) where.isVirtual = isVirtual === 'true'
  if (startDateFrom || startDateTo) {
    where.startDate = {}
    if (startDateFrom) where.startDate.gte = new Date(startDateFrom)
    if (startDateTo) where.startDate.lte = new Date(startDateTo)
  }

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      include: { organizer: { select: { id: true, name: true, email: true } }, _count: { select: { registrations: true } } },
      orderBy: { [sortBy || 'createdAt']: sortOrder || 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.event.count({ where }),
  ])

  paginatedResponse(res, events, total, page, limit)
}))

router.get('/jobs', validateQuery(jobFiltersSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { search, status, employmentType, isRemote, location, page, limit, sortBy, sortOrder } = req.query as any

  const where: any = {}
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { company: { contains: search, mode: 'insensitive' } },
    ]
  }
  if (status) where.status = status
  if (employmentType) where.employmentType = employmentType
  if (isRemote !== undefined) where.isRemote = isRemote === 'true'
  if (location) where.location = { contains: location, mode: 'insensitive' }

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      include: { postedBy: { select: { id: true, name: true, email: true } } },
      orderBy: { [sortBy || 'createdAt']: sortOrder || 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.job.count({ where }),
  ])

  paginatedResponse(res, jobs, total, page, limit)
}))

router.get('/mentorship/requests', validateQuery(paginationSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { page, limit, status } = req.query as any

  const where: any = {}
  if (status) where.status = status

  const [requests, total] = await Promise.all([
    prisma.mentorshipRequest.findMany({
      where,
      include: {
        mentor: { include: { user: { select: { id: true, name: true, email: true } } } },
        mentee: { include: { user: { select: { id: true, name: true, email: true } } } },
      },
      orderBy: { requestedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.mentorshipRequest.count({ where }),
  ])

  paginatedResponse(res, requests, total, page, limit)
}))

router.get('/analytics', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const [
    usersByRole,
    usersByStatus,
    eventsByStatus,
    jobsByStatus,
    mentorshipByStatus,
    registrationsByMonth,
    jobsPostedByMonth,
  ] = await Promise.all([
    prisma.user.groupBy({ by: ['role'], _count: true }),
    prisma.user.groupBy({ by: ['status'], _count: true }),
    prisma.event.groupBy({ by: ['status'], _count: true }),
    prisma.job.groupBy({ by: ['status'], _count: true }),
    prisma.mentorshipRequest.groupBy({ by: ['status'], _count: true }),
    prisma.$queryRaw`SELECT DATE_TRUNC('month', "registeredAt") as month, COUNT(*) as count FROM "EventRegistration" WHERE "registeredAt" >= NOW() - INTERVAL '12 months' GROUP BY month ORDER BY month`,
    prisma.$queryRaw`SELECT DATE_TRUNC('month', "createdAt") as month, COUNT(*) as count FROM "Job" WHERE "createdAt" >= NOW() - INTERVAL '12 months' GROUP BY month ORDER BY month`,
  ])

  successResponse(res, {
    usersByRole, usersByStatus, eventsByStatus, jobsByStatus, mentorshipByStatus,
    registrationsByMonth, jobsPostedByMonth,
  })
}))

router.get('/audit-logs', validateQuery(paginationSchema.extend({ action: z.string().optional(), resource: z.string().optional() })), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { page, limit, action, resource, userId } = req.query as any

  const where: any = {}
  if (action) where.action = { contains: action, mode: 'insensitive' }
  if (resource) where.resource = { contains: resource, mode: 'insensitive' }
  if (userId) where.userId = userId

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ])

  paginatedResponse(res, logs, total, page, limit)
}))

export default router