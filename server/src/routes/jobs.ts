import { Router } from 'express'
import { prisma } from '../utils/prisma'
import { validateQuery, validateParams } from '../middleware/validation'
import { asyncHandler } from '../utils/asyncHandler'
import { successResponse, paginatedResponse, createdResponse } from '../utils/response'
import { AppError } from '../utils/errors'
import { jobFiltersSchema, idParamSchema, slugParamSchema, JobStatus, UserRole } from '@alumni-connect/shared'
import { requirePermission, AuthenticatedRequest } from '../middleware/auth'
import { logAction } from '../middleware/auditLog'
import {
  sanitizePlainTextContent,
  sanitizeRichTextContent,
  sanitizeUserGeneratedContent,
} from '../utils/sanitize'

const router = Router()

router.get(
  '/',
  validateQuery(jobFiltersSchema),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const {
      search,
      status,
      employmentType,
      isRemote,
      location,
      page,
      limit,
      sortBy,
      sortOrder,
    } = req.query as any

    const where: any = {}
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (status) where.status = status
    if (employmentType) where.employmentType = employmentType
    if (isRemote !== undefined) where.isRemote = isRemote === 'true'
    if (location) where.location = { contains: location, mode: 'insensitive' }

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
  })
)

router.get(
  '/featured',
  asyncHandler(async (_req, res) => {
    const jobs = await prisma.job.findMany({
      where: { status: JobStatus.ACTIVE },
      include: { postedBy: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
      take: 6,
    })

    successResponse(res, { jobs })
  })
)

router.get(
  '/applications',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const stored = await prisma.platformState.getKey('jobApplications')
    const allApplications: any[] =
      Array.isArray(stored) && stored.length > 0
        ? stored
        : await prisma.jobApplication.findMany({ orderBy: { appliedAt: 'desc' } })

    const isAdmin = ([UserRole.SUPER_ADMIN, UserRole.ADMIN] as UserRole[]).includes(
      req.user!.role
    )
    if (isAdmin) {
      return successResponse(res, { applications: allApplications })
    }

    // Find all job IDs owned by the requesting user
    const myJobs = await prisma.job.findMany({
      where: { postedById: req.user!.id },
      select: { id: true },
    })
    const myJobIds = new Set(myJobs.map((j: any) => j.id))

    const authorizedApplications = allApplications.filter((app: any) => {
      if (app.userId === req.user!.id) return true
      if (app.jobId && myJobIds.has(app.jobId)) return true
      if (app.postedById && app.postedById === req.user!.id) return true
      // Allow default seeded employer user to view seeded unowned demo applications
      if (req.user!.id === 'user-employer' && !app.postedById && !app.jobId) return true
      return false
    })

    successResponse(res, { applications: authorizedApplications })
  })
)

router.post(
  '/applications',
  requirePermission('jobs:apply'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const {
      jobId,
      jobTitle,
      company,
      location,
      employmentType,
      applicantMajor,
      applicantGradYear,
      applicantGpa,
      resumeUrl,
      coverNote,
      skills,
    } = req.body || {}

    let postedById: string | undefined
    if (jobId) {
      const targetJob = await prisma.job.findUnique({ where: { id: String(jobId) } })
      postedById = targetJob?.postedById
    }

    const application = await prisma.jobApplication.create({
      data: {
        jobId: jobId ? String(jobId) : undefined,
        postedById,
        jobTitle: String(jobTitle || 'Career Opportunity').slice(0, 200),
        company: String(company || 'Partner Organization').slice(0, 150),
        location: String(location || 'Karachi / Hybrid').slice(0, 150),
        employmentType: employmentType || 'FULL_TIME',
        applicantName: req.user!.name,
        applicantEmail: req.user!.email,
        applicantMajor: String(applicantMajor || 'BS Computer Science').slice(0, 120),
        applicantGradYear: Number(applicantGradYear) || 2026,
        applicantGpa: String(applicantGpa || '3.75 / 4.00').slice(0, 40),
        resumeUrl: String(resumeUrl || '').slice(0, 500),
        coverNote: String(coverNote || '').slice(0, 3000),
        skills: Array.isArray(skills) ? skills.slice(0, 20) : [],
        userId: req.user!.id,
      },
    })

    await logAction(
      req.user!.id,
      'JOB_APPLIED',
      'JobApplication',
      application.id,
      { jobTitle: application.jobTitle },
      req
    )
    createdResponse(res, { application })
  })
)

router.patch(
  '/applications/:id',
  validateParams(idParamSchema),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params
    const existingApp = await prisma.jobApplication.findUnique({ where: { id } })
    if (!existingApp) {
      throw AppError.notFound('Job application not found')
    }

    const isAdmin = ([UserRole.SUPER_ADMIN, UserRole.ADMIN] as UserRole[]).includes(
      req.user!.role
    )

    let isJobOwner = existingApp.postedById === req.user!.id
    if (!isJobOwner && existingApp.jobId) {
      const job = await prisma.job.findUnique({ where: { id: existingApp.jobId } })
      if (job && job.postedById === req.user!.id) {
        isJobOwner = true
      }
    }
    if (!isJobOwner && req.user!.id === 'user-employer' && !existingApp.postedById && !existingApp.jobId) {
      isJobOwner = true
    }

    if (!isJobOwner && !isAdmin) {
      throw AppError.forbidden('You can only manage applications for your own job postings')
    }

    const allowedFields: Record<string, unknown> = {}
    if (typeof req.body?.status === 'string') allowedFields.status = req.body.status
    if (typeof req.body?.notes === 'string') allowedFields.notes = req.body.notes.slice(0, 2000)

    const updated = await prisma.jobApplication.update({
      where: { id },
      data: allowedFields,
    })

    await logAction(
      req.user!.id,
      'JOB_APPLICATION_UPDATED',
      'JobApplication',
      id,
      allowedFields,
      req
    )
    successResponse(res, { application: updated })
  })
)

router.get(
  '/employer/org',
  asyncHandler(async (_req: AuthenticatedRequest, res) => {
    const org = await prisma.platformState.getKey('employerOrg')
    successResponse(res, { org })
  })
)

router.put(
  '/employer/org',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const isAuthorizedEmployerOrAdmin =
      req.user!.role === UserRole.SUPER_ADMIN ||
      req.user!.role === UserRole.ADMIN ||
      req.user!.role === UserRole.EVENT_MANAGER ||
      req.user!.persona === 'EMPLOYER'

    if (!isAuthorizedEmployerOrAdmin) {
      throw AppError.forbidden('Only verified employers or administrators can update employer organization settings')
    }

    const org = await prisma.platformState.setKey('employerOrg', req.body)
    await logAction(
      req.user!.id,
      'EMPLOYER_ORG_UPDATED',
      'EmployerOrganization',
      req.user!.id,
      { name: req.body?.name },
      req
    )
    successResponse(res, { org })
  })
)

router.get(
  '/my/jobs',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { status, page = 1, limit = 20 } = req.query as any

    const where: any = { postedById: req.user!.id }
    if (status) where.status = status

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      prisma.job.count({ where }),
    ])

    paginatedResponse(res, jobs, total, Number(page), Number(limit))
  })
)

router.get(
  '/slug/:slug',
  validateParams(slugParamSchema),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const job = await prisma.job.findUnique({
      where: { slug: req.params.slug },
      include: { postedBy: { select: { id: true, name: true, avatarUrl: true } } },
    })

    if (!job) throw AppError.notFound('Job not found')

    successResponse(res, { job })
  })
)

router.get(
  '/:id/applications',
  validateParams(idParamSchema),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const job = await prisma.job.findUnique({ where: { id: req.params.id } })
    if (!job) throw AppError.notFound('Job not found')

    const isOwner = job.postedById === req.user!.id
    const isAdmin = ([UserRole.SUPER_ADMIN, UserRole.ADMIN] as UserRole[]).includes(
      req.user!.role
    )

    if (!isOwner && !isAdmin) {
      throw AppError.forbidden('You can only view applicant records for your own job postings')
    }

    const applications = await prisma.jobApplication.findMany({
      where: { jobId: job.id },
      orderBy: { appliedAt: 'desc' },
    })

    successResponse(res, { applications })
  })
)

router.get(
  '/:id',
  validateParams(idParamSchema),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: { postedBy: { select: { id: true, name: true, avatarUrl: true } } },
    })

    if (!job) throw AppError.notFound('Job not found')

    successResponse(res, { job })
  })
)

router.post(
  '/',
  requirePermission('jobs:write'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const rawBody = sanitizeUserGeneratedContent(req.body || {}, {
      richTextFields: ['description', 'requirements', 'benefits'],
      plainTextFields: ['title', 'company', 'location', 'applicationUrl', 'applicationEmail'],
    })
    const title = sanitizePlainTextContent(String(rawBody.title || 'Career Opportunity')).slice(0, 200) || 'Career Opportunity'
    const slug =
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') +
      '-' +
      Date.now().toString(36)

    // Strip any client-supplied id or postedById to prevent ownership spoofing
    const { id: _ignoreId, postedById: _ignoreOwner, ...safeBody } = rawBody

    const job = await prisma.job.create({
      data: {
        ...safeBody,
        title,
        company: sanitizePlainTextContent(String(rawBody.company || 'Partner Organization')).slice(0, 150) || 'Partner Organization',
        description: sanitizeRichTextContent(
          String(rawBody.description || 'Verified Sukkur IBA University career opportunity.')
        ).slice(0, 10000),
        slug,
        status:
          rawBody.status === 'PUBLISHED'
            ? JobStatus.ACTIVE
            : rawBody.status || JobStatus.ACTIVE,
        expiresAt: rawBody.expiresAt
          ? new Date(rawBody.expiresAt)
          : new Date(Date.now() + 45 * 86400000),
        postedById: req.user!.id,
      },
      include: { postedBy: { select: { id: true, name: true, avatarUrl: true } } },
    })

    await logAction(
      req.user!.id,
      'JOB_CREATED',
      'Job',
      job.id,
      { title: job.title, company: job.company },
      req
    )

    createdResponse(res, { job })
  })
)

router.patch(
  '/:id',
  validateParams(idParamSchema),
  requirePermission('jobs:write'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params

    const job = await prisma.job.findUnique({ where: { id } })
    if (!job) throw AppError.notFound('Job not found')

    const isOwner = job.postedById === req.user!.id
    const isAdmin = ([UserRole.SUPER_ADMIN, UserRole.ADMIN] as UserRole[]).includes(
      req.user!.role
    )

    if (!isOwner && !isAdmin) {
      throw AppError.forbidden('You can only update your own job postings')
    }

    // Prevent ownership reassignment and sanitize updated job fields
    const { id: _ignoreId, postedById: _ignoreOwner, ...rawUpdate } = req.body || {}
    const data = sanitizeUserGeneratedContent(rawUpdate, {
      richTextFields: ['description', 'requirements', 'benefits'],
      plainTextFields: ['title', 'company', 'location', 'applicationUrl', 'applicationEmail'],
    })
    if (data.expiresAt) data.expiresAt = new Date(data.expiresAt)

    const updated = await prisma.job.update({
      where: { id },
      data,
      include: { postedBy: { select: { id: true, name: true, avatarUrl: true } } },
    })

    await logAction(req.user!.id, 'JOB_UPDATED', 'Job', id, data, req)

    successResponse(res, { job: updated })
  })
)

router.delete(
  '/:id',
  validateParams(idParamSchema),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params

    const job = await prisma.job.findUnique({ where: { id } })
    if (!job) throw AppError.notFound('Job not found')

    const isOwner = job.postedById === req.user!.id
    const isAdmin = ([UserRole.SUPER_ADMIN, UserRole.ADMIN] as UserRole[]).includes(
      req.user!.role
    )

    if (!isOwner && !isAdmin) {
      throw AppError.forbidden('You can only delete your own job postings')
    }

    await prisma.job.delete({ where: { id } })

    await logAction(req.user!.id, 'JOB_DELETED', 'Job', id, {}, req)

    successResponse(res, { message: 'Job deleted' })
  })
)

router.post(
  '/:id/apply',
  validateParams(idParamSchema),
  requirePermission('jobs:apply'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params
    const {
      coverLetter,
      coverNote,
      resumeUrl,
      jobTitle,
      company,
      location,
      employmentType,
      applicantMajor,
      applicantGradYear,
      applicantGpa,
      skills,
    } = req.body || {}

    const job = await prisma.job.findUnique({ where: { id } })
    if (!job) {
      throw AppError.notFound('Job not found')
    }

    const application = await prisma.jobApplication.create({
      data: {
        id: `app-${Date.now().toString(36)}`,
        jobId: id,
        postedById: job.postedById,
        jobTitle: jobTitle || job.title || 'Alumni Referred Opportunity',
        company: company || job.company || 'Partner Organization',
        location: location || job.location || 'Karachi / Hybrid',
        employmentType: employmentType || job.employmentType || 'FULL_TIME',
        appliedAt: new Date().toISOString().slice(0, 10),
        status: 'SUBMITTED',
        applicantName: req.user!.name,
        applicantEmail: req.user!.email,
        applicantMajor: applicantMajor || 'BS Computer Science',
        applicantGradYear: applicantGradYear || 2026,
        applicantGpa: applicantGpa || '3.78 / 4.00',
        resumeUrl: resumeUrl || 'https://iba-suk.edu.pk/portfolios/scholar-cv.pdf',
        coverNote:
          coverNote ||
          coverLetter ||
          'Submitted via Sukkur IBA Alumni Connect Job Board.',
        skills: Array.isArray(skills)
          ? skills.slice(0, 20)
          : ['TypeScript', 'React', 'System Design'],
        userId: req.user!.id,
      },
    })

    if (job.postedById) {
      await prisma.notification.create({
        data: {
          userId: job.postedById,
          type: 'JOB_APPLICATION',
          title: `New Application: ${application.jobTitle}`,
          message: `${application.applicantName} applied for ${application.jobTitle} at ${application.company}`,
          data: {
            jobId: id,
            applicationId: application.id,
            applicantId: req.user!.id,
          },
        },
      })
    }

    await logAction(
      req.user!.id,
      'JOB_APPLIED',
      'Job',
      id,
      { company: application.company, title: application.jobTitle },
      req
    )

    createdResponse(res, {
      application,
      message: 'Application submitted successfully',
    })
  })
)

export default router