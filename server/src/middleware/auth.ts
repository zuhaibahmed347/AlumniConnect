import { Request, Response, NextFunction } from 'express'
import { prisma } from '../utils/prisma'
import { verifyAccessToken, isTokenRevoked } from '../utils/jwt'
import { AppError } from '../utils/errors'
import { UserRole, UserStatus } from '@alumni-connect/shared'

export type ServerPersona = 'STUDENT' | 'ALUMNI' | 'MENTOR' | 'EMPLOYER' | 'ADMIN'

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
    name: string
    role: UserRole
    status: UserStatus
    persona?: ServerPersona
  }
}

const DEMO_TOKEN_TO_USER_ID: Record<string, string> = {
  'demo-session-student': 'user-student',
  'demo-session-alumni': 'user-alumni',
  'demo-session-mentor': 'user-mentor',
  'demo-session-employer': 'user-employer',
  'demo-session-admin': 'user-admin',
}

function inferPersonaForUser(user: { id: string; email: string; role: UserRole }): ServerPersona {
  if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN || user.role === UserRole.MODERATOR) {
    return 'ADMIN'
  }
  if (user.role === UserRole.EVENT_MANAGER || user.id === 'user-employer') {
    return 'EMPLOYER'
  }
  if (user.role === UserRole.MENTORSHIP_MANAGER || user.id === 'user-mentor') {
    return 'MENTOR'
  }
  if (user.id === 'user-student' || user.email.includes('.bscs22@')) {
    return 'STUDENT'
  }
  return 'ALUMNI'
}

function extractRequestToken(req: Request): string | null {
  const authHeader = req.headers.authorization
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim()
    return token.length > 0 ? token : null
  }
  const cookieToken = req.cookies?.accessToken
  if (typeof cookieToken === 'string' && cookieToken.trim().length > 0) {
    return cookieToken.trim()
  }
  return null
}

async function resolveUserFromToken(token: string) {
  if (isTokenRevoked(token)) {
    throw AppError.unauthorized('Session token has been revoked')
  }

  const normalized = token.trim().toLowerCase()
  const allowDemoTokens = process.env.ALLOW_DEMO_TOKENS !== 'false'
  const mappedUserId = allowDemoTokens ? DEMO_TOKEN_TO_USER_ID[normalized] : undefined

  if (mappedUserId) {
    return prisma.user.findUnique({
      where: { id: mappedUserId },
      select: { id: true, email: true, name: true, role: true, status: true, emailVerified: true },
    })
  }

  const payload = verifyAccessToken(token)
  return prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, name: true, role: true, status: true, emailVerified: true },
  })
}

export const authenticate = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const token = extractRequestToken(req)
    if (!token) {
      throw AppError.unauthorized('Authentication required')
    }

    const user = await resolveUserFromToken(token)
    if (!user) {
      throw AppError.unauthorized('Invalid or expired authentication credentials')
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw AppError.forbidden('Account is not active')
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      persona: inferPersonaForUser(user),
    }

    next()
  } catch (error) {
    next(error)
  }
}

export const optionalAuth = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const token = extractRequestToken(req)
    if (token) {
      const user = await resolveUserFromToken(token)
      if (user && user.status === UserStatus.ACTIVE) {
        req.user = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
          persona: inferPersonaForUser(user),
        }
      }
    }
    next()
  } catch {
    next()
  }
}

export const requireRole = (...roles: UserRole[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(AppError.unauthorized('Authentication required'))
    }

    if (!roles.includes(req.user.role)) {
      return next(AppError.forbidden('Insufficient role permissions'))
    }

    next()
  }
}

export const requirePermission = (permission: string) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(AppError.unauthorized('Authentication required'))
    }

    if (req.user.role === UserRole.SUPER_ADMIN || req.user.role === UserRole.ADMIN) {
      return next()
    }

    const rolePermissions: Record<UserRole, string[]> = {
      [UserRole.SUPER_ADMIN]: ['*'],
      [UserRole.ADMIN]: [
        'users:read', 'users:write', 'users:delete', 'users:manage-roles',
        'events:read', 'events:write', 'events:delete', 'events:manage',
        'jobs:read', 'jobs:write', 'jobs:delete', 'jobs:manage', 'jobs:apply',
        'mentorship:read', 'mentorship:write', 'mentorship:manage',
        'moderation:read', 'moderation:write',
        'announcements:read', 'announcements:write', 'announcements:delete',
        'profile:read', 'profile:write', 'messages:read', 'messages:write', 'notifications:read',
      ],
      [UserRole.EVENT_MANAGER]: [
        'events:read', 'events:write', 'events:delete', 'events:manage',
        'jobs:read', 'jobs:write', 'jobs:delete', 'jobs:manage', 'jobs:apply',
        'users:read', 'profile:read', 'profile:write',
        'messages:read', 'messages:write', 'notifications:read', 'announcements:read',
      ],
      [UserRole.MODERATOR]: [
        'users:read', 'users:write', 'moderation:read', 'moderation:write',
        'events:read', 'events:write', 'jobs:read', 'jobs:write',
        'announcements:read', 'announcements:write',
        'profile:read', 'profile:write', 'messages:read', 'messages:write', 'notifications:read',
      ],
      [UserRole.MENTORSHIP_MANAGER]: [
        'mentorship:read', 'mentorship:write', 'mentorship:manage',
        'events:read', 'events:write', 'jobs:read', 'jobs:write',
        'users:read', 'profile:read', 'profile:write',
        'messages:read', 'messages:write', 'notifications:read', 'announcements:read',
      ],
      [UserRole.MEMBER]: [
        'profile:read', 'profile:write',
        'events:read', 'events:register',
        'jobs:read', 'jobs:apply',
        'mentorship:read', 'mentorship:write', 'mentorship:request',
        'messages:read', 'messages:write', 'notifications:read', 'announcements:read',
      ],
    }

    // Allow Alumni members (non-students) to post alumni referral jobs/events
    const permissions = [...(rolePermissions[req.user.role] || [])]
    if (req.user.role === UserRole.MEMBER && req.user.persona !== 'STUDENT') {
      permissions.push('jobs:write', 'events:write')
    }

    if (!permissions.includes('*') && !permissions.includes(permission)) {
      return next(AppError.forbidden(`Permission required: ${permission}`))
    }

    next()
  }
}

export const requireOwnershipOrAdmin = (
  getResourceUserId: (req: AuthenticatedRequest) => Promise<string>
) => {
  return async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw AppError.unauthorized('Authentication required')
      }

      if (req.user.role === UserRole.SUPER_ADMIN || req.user.role === UserRole.ADMIN) {
        return next()
      }

      const resourceUserId = await getResourceUserId(req)
      if (resourceUserId !== req.user.id) {
        throw AppError.forbidden('You can only access your own resources')
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}