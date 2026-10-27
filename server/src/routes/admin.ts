import { Router } from 'express'
import { prisma } from '../utils/prisma'
import { validateQuery, validateParams, validateBody } from '../middleware/validation'
import { asyncHandler } from '../utils/asyncHandler'
import { successResponse, paginatedResponse, errorResponse } from '../utils/response'
import { AppError } from '../utils/errors'
import { z } from 'zod'
import { paginationSchema, idParamSchema, userFiltersSchema, userUpdateSchema, eventFiltersSchema, jobFiltersSchema, UserRole, UserStatus, EventStatus, JobStatus, MentorshipStatus } from '@alumni-connect/shared'
import { requirePermission, requireRole, AuthenticatedRequest } from '../middleware/auth'
import {
  getApiPerformanceSummary,
  purgeExpiredPerformanceLogs,
  PERFORMANCE_LOG_TTL_DAYS,
} from '../middleware/performanceLogger'
import { getScalabilityMetrics } from '../middleware/scalability'

const router = Router()

router.use(requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MODERATOR))

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
    performance: getApiPerformanceSummary(),
  })
}))

router.get('/performance', asyncHandler(async (_req: AuthenticatedRequest, res) => {
  await purgeExpiredPerformanceLogs(Date.now(), PERFORMANCE_LOG_TTL_DAYS)
  successResponse(res, {
    performance: getApiPerformanceSummary(),
    scalability: getScalabilityMetrics(),
  })
}))

router.post('/performance/purge-ttl', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const retentionDays =
    typeof req.body?.retentionDays === 'number' &&
    req.body.retentionDays >= 1 &&
    req.body.retentionDays <= 90
      ? req.body.retentionDays
      : PERFORMANCE_LOG_TTL_DAYS

  const ttlPolicy = await purgeExpiredPerformanceLogs(Date.now(), retentionDays)

  await prisma.auditLog.create({
    data: {
      userId: req.user!.id,
      action: `TTL_PURGE_PERFORMANCE_LOGS (${retentionDays}d policy, purged ${ttlPolicy.lastPurgeRemovedCount} expired logs)`,
      resource: 'performance_logs',
      metadata: ttlPolicy,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    },
  })

  successResponse(res, {
    ttlPolicy,
    performance: getApiPerformanceSummary(),
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
    select: {
      id: true,
      email: true,
      name: true,
      avatarUrl: true,
      role: true,
      status: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
      lastLoginAt: true,
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

router.patch(
  '/users/:id',
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateParams(idParamSchema),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params
    const { role, status, name, avatarUrl, emailVerified } = req.body || {}

    if (role !== undefined && !Object.values(UserRole).includes(role as UserRole)) {
      throw AppError.badRequest('Invalid user role')
    }
    if (status !== undefined && !Object.values(UserStatus).includes(status as UserStatus)) {
      throw AppError.badRequest('Invalid user status')
    }
    if (role === UserRole.SUPER_ADMIN && req.user!.role !== UserRole.SUPER_ADMIN) {
      throw AppError.forbidden('Only super administrators can assign SUPER_ADMIN role')
    }

    const safeUpdate: Record<string, unknown> = {}
    if (typeof name === 'string') safeUpdate.name = name.trim()
    if (typeof avatarUrl === 'string') safeUpdate.avatarUrl = avatarUrl.trim()
    if (typeof emailVerified === 'boolean') safeUpdate.emailVerified = emailVerified
    if (role) safeUpdate.role = role
    if (status) safeUpdate.status = status

    const user = await prisma.user.update({
      where: { id },
      data: safeUpdate,
      select: { id: true, email: true, name: true, role: true, status: true },
    })

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'ADMIN_USER_UPDATED',
        resource: 'User',
        resourceId: id,
        metadata: { role, status },
      },
    })

    successResponse(res, { user })
  })
)

router.delete(
  '/users/:id',
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateParams(idParamSchema),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params

    if (id === req.user!.id) throw AppError.badRequest('Cannot delete yourself')

    const target = await prisma.user.findUnique({ where: { id } })
    if (!target) throw AppError.notFound('User not found')

    if (target.role === UserRole.SUPER_ADMIN && req.user!.role !== UserRole.SUPER_ADMIN) {
      throw AppError.forbidden('Cannot delete a super administrator account')
    }

    await prisma.user.delete({ where: { id } })

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'ADMIN_USER_DELETED',
        resource: 'User',
        resourceId: id,
        metadata: {},
      },
    })

    successResponse(res, { message: 'User deleted' })
  })
)

router.get('/moderation', asyncHandler(async (req: AuthenticatedRequest, res) => {
  let queue = await prisma.platformState.getKey('moderationQueue')
  if (!Array.isArray(queue) || queue.length === 0) {
    queue = [
      {
        id: 'mod-1',
        category: 'USER_VERIFICATION',
        title: 'Alumni Degree Verification — Saba Ahmed (BBA ’19)',
        submittedBy: 'saba.ahmed@iba-suk.edu.pk',
        submittedAt: '2 hours ago',
        detail: 'Transcript & Registrar Roll #SIBA-2015-0842 matched against convocation ledger.',
        status: 'PENDING',
      },
      {
        id: 'mod-2',
        category: 'EMPLOYER_APPROVAL',
        title: 'Employer Partner Request — Menapay Ventures',
        submittedBy: 'Sanaullah Memon (VP Product · Dubai Chapter)',
        submittedAt: '5 hours ago',
        detail: 'Requesting recruiter posting privileges for Summer 2026 FinTech Fellowship.',
        status: 'PENDING',
      },
      {
        id: 'mod-3',
        category: 'JOB_MODERATION',
        title: 'Job Posting Review — Graduate Software Engineer (TechCorp)',
        submittedBy: 'Engr. Tariq Mahmood (BSCS ’15)',
        submittedAt: 'Yesterday',
        detail: 'Verified compensation band (PKR 240k–320k/mo) and Sukkur/Karachi hybrid hub.',
        status: 'PENDING',
      },
    ]
    await prisma.platformState.setKey('moderationQueue', queue)
  }
  const auditLogs = await prisma.auditLog.findMany({
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
    take: 15,
  })
  successResponse(res, { queue, auditLogs })
}))

router.post('/moderation/:id/decide', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params
  const { decision, reason, title } = req.body || {}

  const currentQueue = (await prisma.platformState.getKey('moderationQueue')) || []
  const updatedQueue = Array.isArray(currentQueue)
    ? currentQueue.map((item: any) => (item.id === id ? { ...item, status: decision } : item))
    : []
  await prisma.platformState.setKey('moderationQueue', updatedQueue)

  const logEntry = await prisma.auditLog.create({
    data: {
      userId: req.user!.id,
      action: `${decision || 'APPROVED'}: ${title || id}${reason ? ` — Reason: ${reason}` : ''}`,
      resource: 'ModerationQueue',
      resourceId: id,
      metadata: { decision, reason, title },
    },
  })

  successResponse(res, { queue: updatedQueue, auditLog: logEntry })
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

router.post('/events', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const title = String(req.body?.title || 'Sukkur IBA Chapter Gathering').trim()
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString(36)
  const event = await prisma.event.create({
    data: {
      ...req.body,
      title,
      slug,
      description: req.body?.description || 'Official Sukkur IBA University chapter event.',
      shortDescription: req.body?.shortDescription || req.body?.description || 'Chapter gathering.',
      startDate: req.body?.startDate ? new Date(req.body.startDate) : new Date(Date.now() + 14 * 86400000),
      endDate: req.body?.endDate ? new Date(req.body.endDate) : new Date(Date.now() + 15 * 86400000),
      location: req.body?.location || 'Sukkur IBA University Main Campus',
      status: req.body?.status || EventStatus.PUBLISHED,
      capacity: Number(req.body?.capacity) || 250,
      organizerId: req.user!.id,
    },
  })
  await prisma.auditLog.create({
    data: {
      userId: req.user!.id,
      action: 'ADMIN_EVENT_CREATED',
      resource: 'Event',
      resourceId: event.id,
      metadata: { title: event.title },
    },
  })
  successResponse(res, { event })
}))

router.patch('/events/:id', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const updated = await prisma.event.update({
    where: { id: req.params.id },
    data: req.body,
  })
  successResponse(res, { event: updated })
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

router.patch('/jobs/:id', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const updated = await prisma.job.update({
    where: { id: req.params.id },
    data: req.body,
  })
  successResponse(res, { job: updated })
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