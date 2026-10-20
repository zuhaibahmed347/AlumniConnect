import { Router } from 'express'
import { prisma } from '../utils/prisma'
import { validateQuery, validateParams, validateBody } from '../middleware/validation'
import { asyncHandler } from '../utils/asyncHandler'
import { successResponse, paginatedResponse, createdResponse, errorResponse } from '../utils/response'
import { AppError } from '../utils/errors'
import { jobFiltersSchema, idParamSchema, slugParamSchema, createJobSchema, updateJobSchema } from '@alumni-connect/shared'
import { requirePermission, AuthenticatedRequest } from '../middleware/auth'
import { logAction } from '../middleware/auditLog'
import { JobStatus, EmploymentType } from '@prisma/client'

const router = Router()

router.get('/', validateQuery(jobFiltersSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { search, status, employmentType, isRemote, location, page, limit, sortBy, sortOrder } = req.query as any

  const where: any = {}
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { company: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ]
  }
  if (status) where.status = status
  else where.status = JobStatus.ACTIVE
  if (employmentType) where.employmentType = employmentType
  if (isRemote !== undefined) where.isRemote = isRemote === 'true'
  if (location) where.location = { contains: location, mode: 'insensitive' }
  where.expiresAt = { gte: new Date() }

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      include: {
        postedBy: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { [sortBy || 'createdAt']: sortOrder || 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.job.count({ where }),
  ])

  paginatedResponse(res, jobs, total, page, limit)
}))

router.get('/featured', asyncHandler(async (req, res) => {
  const jobs = await prisma.job.findMany({
    where: { status: JobStatus.ACTIVE, expiresAt: { gte: new Date() } },
    include: { postedBy: { select: { id: true, name: true, avatarUrl: true } } },
    orderBy: { createdAt: 'desc' },
    take: 6,
  })

  successResponse(res, { jobs })
}))

router.get('/:id', validateParams(idParamSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const job = await prisma.job.findUnique({
    where: { id: req.params.id },
    include: { postedBy: { select: { id: true, name: true, avatarUrl: true, email: true } } },
  })

  if (!job) throw AppError.notFound('Job not found')

  successResponse(res, { job })
}))

router.get('/slug/:slug', validateParams(slugParamSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const job = await prisma.job.findUnique({
    where: { slug: req.params.slug },
    include: { postedBy: { select: { id: true, name: true, avatarUrl: true, email: true } } },
  })

  if (!job) throw AppError.notFound('Job not found')

  successResponse(res, { job })
}))

router.post('/', validateBody(createJobSchema), requirePermission('jobs:write'), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const slug = req.body.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    + '-' + Date.now().toString(36)

  const job = await prisma.job.create({
    data: {
      ...req.body,
      slug,
      expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : null,
      postedById: req.user!.id,
    },
    include: { postedBy: { select: { id: true, name: true, avatarUrl: true } } },
  })

  await logAction(req.user!.id, 'JOB_CREATED', 'Job', job.id, req.body, req)

  createdResponse(res, { job })
}))

router.patch('/:id', validateParams(idParamSchema), validateBody(updateJobSchema), requirePermission('jobs:write'), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params

  const job = await prisma.job.findUnique({ where: { id } })
  if (!job) throw AppError.notFound('Job not found')

  const isPoster = job.postedById === req.user!.id
  const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(req.user!.role)

  if (!isPoster && !isAdmin) {
    throw AppError.forbidden('You can only update your own jobs')
  }

  const data = { ...req.body }
  if (data.expiresAt) data.expiresAt = new Date(data.expiresAt)

  const updated = await prisma.job.update({
    where: { id },
    data,
    include: { postedBy: { select: { id: true, name: true, avatarUrl: true } } },
  })

  await logAction(req.user!.id, 'JOB_UPDATED', 'Job', id, req.body, req)

  successResponse(res, { job: updated })
}))

router.delete('/:id', validateParams(idParamSchema), requirePermission('jobs:delete'), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params

  const job = await prisma.job.findUnique({ where: { id } })
  if (!job) throw AppError.notFound('Job not found')

  const isPoster = job.postedById === req.user!.id
  const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(req.user!.role)

  if (!isPoster && !isAdmin) {
    throw AppError.forbidden('You can only delete your own jobs')
  }

  await prisma.job.delete({ where: { id } })

  await logAction(req.user!.id, 'JOB_DELETED', 'Job', id, {}, req)

  successResponse(res, { message: 'Job deleted' })
}))

router.get('/my/jobs', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { status, page = 1, limit = 20 } = req.query as any

  const where: any = { postedById: req.user!.id }
  if (status) where.status = status

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.job.count({ where }),
  ])

  paginatedResponse(res, jobs, total, page, limit)
}))

export default router