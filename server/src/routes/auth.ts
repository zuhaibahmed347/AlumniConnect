import { Router } from 'express'
import argon2 from 'argon2'
import { prisma } from '../utils/prisma'
import { generateTokens, verifyRefreshToken } from '../utils/jwt'
import { validateBody } from '../middleware/validation'
import { asyncHandler } from '../utils/asyncHandler'
import { successResponse, errorResponse, createdResponse } from '../utils/response'
import { AppError } from '../utils/errors'
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema } from '@alumni-connect/shared'
import { AuthenticatedRequest } from '../middleware/auth'
import { config } from '../config'
import { logAction } from '../middleware/auditLog'

const router = Router()

router.post('/register', validateBody(registerSchema), asyncHandler(async (req, res) => {
  const { email, password, name } = req.body

  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    throw AppError.conflict('Email already registered')
  }

  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16,
    timeCost: 3,
    parallelism: 1,
  })

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      role: 'MEMBER',
      status: 'ACTIVE',
      emailVerified: true,
    },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  })

  const tokens = generateTokens({ sub: user.id, email: user.email, role: user.role })

  res.cookie('refreshToken', tokens.refreshToken, {
    ...config.cookie,
    path: '/api/auth/refresh',
  })

  await logAction(user.id, 'USER_REGISTERED', 'User', user.id, { email }, req)

  createdResponse(res, { user, accessToken: tokens.accessToken })
}))

router.post('/login', validateBody(loginSchema), asyncHandler(async (req, res) => {
  const { email, password } = req.body

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    throw AppError.unauthorized('Invalid credentials')
  }

  const valid = await argon2.verify(user.passwordHash, password)
  if (!valid) {
    throw AppError.unauthorized('Invalid credentials')
  }

  if (user.status !== 'ACTIVE') {
    throw AppError.forbidden('Account is not active')
  }

  const tokens = generateTokens({ sub: user.id, email: user.email, role: user.role })

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  })

  res.cookie('refreshToken', tokens.refreshToken, {
    ...config.cookie,
    path: '/api/auth/refresh',
  })

  await logAction(user.id, 'USER_LOGIN', 'User', user.id, { email }, req)

  successResponse(res, {
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    accessToken: tokens.accessToken,
  })
}))

router.post('/logout', asyncHandler(async (req, res) => {
  res.clearCookie('refreshToken', { ...config.cookie, path: '/api/auth/refresh' })
  successResponse(res, { message: 'Logged out successfully' })
}))

router.post('/refresh', asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken
  if (!refreshToken) {
    throw AppError.unauthorized('No refresh token')
  }

  const payload = verifyRefreshToken(refreshToken)

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, role: true, status: true },
  })

  if (!user || user.status !== 'ACTIVE') {
    throw AppError.unauthorized('User not found or inactive')
  }

  const tokens = generateTokens({ sub: user.id, email: user.email, role: user.role })

  res.cookie('refreshToken', tokens.refreshToken, {
    ...config.cookie,
    path: '/api/auth/refresh',
  })

  successResponse(res, { accessToken: tokens.accessToken })
}))

router.post('/forgot-password', validateBody(forgotPasswordSchema), asyncHandler(async (req, res) => {
  const { email } = req.body

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    successResponse(res, { message: 'If the email exists, a reset link has been sent' })
    return
  }

  const resetToken = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordResetToken: resetToken, passwordResetExpires: expiresAt },
  })

  console.log(`[DEV] Password reset token for ${email}: ${resetToken}`)

  successResponse(res, { message: 'If the email exists, a reset link has been sent' })
}))

router.post('/reset-password', validateBody(resetPasswordSchema), asyncHandler(async (req, res) => {
  const { token, password } = req.body

  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: token,
      passwordResetExpires: { gt: new Date() },
    },
  })

  if (!user) {
    throw AppError.badRequest('Invalid or expired reset token')
  }

  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16,
    timeCost: 3,
    parallelism: 1,
  })

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      passwordResetToken: null,
      passwordResetExpires: null,
    },
  })

  await logAction(user.id, 'PASSWORD_RESET', 'User', user.id, {}, req)

  successResponse(res, { message: 'Password reset successful' })
}))

router.post('/change-password', validateBody(changePasswordSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { currentPassword, newPassword } = req.body
  const userId = req.user!.id

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw AppError.notFound('User not found')

  const valid = await argon2.verify(user.passwordHash, currentPassword)
  if (!valid) throw AppError.unauthorized('Current password is incorrect')

  const passwordHash = await argon2.hash(newPassword, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16,
    timeCost: 3,
    parallelism: 1,
  })

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  })

  await logAction(userId, 'PASSWORD_CHANGED', 'User', userId, {}, req)

  successResponse(res, { message: 'Password changed successfully' })
}))

router.get('/me', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true, email: true, name: true, avatarUrl: true, role: true, status: true,
      emailVerified: true, createdAt: true, lastLoginAt: true,
      profile: { select: { headline: true, bio: true, graduationYear: true } },
    },
  })

  if (!user) throw AppError.notFound('User not found')

  successResponse(res, { user })
}))

export default router