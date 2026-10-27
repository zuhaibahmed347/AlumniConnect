import rateLimit from 'express-rate-limit'
import crypto from 'crypto'
import { Request } from 'express'
import { config } from '../config'
import { AppError } from '../utils/errors'

/**
 * Generates a session-aware composite rate-limit key so that hundreds of
 * students/alumni on the same university campus Wi-Fi NAT or reverse proxy IP
 * each get their own isolated token bucket.
 */
function buildCompositeClientKey(req: Request): string {
  const forwarded = req.headers['x-forwarded-for']
  const ip =
    (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : undefined) ||
    req.ip ||
    'unknown-ip'

  const authHeader = req.headers.authorization
  const persona = String(req.headers['x-active-persona'] || 'default')

  if (authHeader) {
    const tokenDigest = crypto
      .createHash('sha1')
      .update(authHeader)
      .digest('hex')
      .slice(0, 12)
    return `${ip}:${persona}:${tokenDigest}`
  }

  return `${ip}:${persona}`
}

export const globalRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: Math.max(config.rateLimit.maxRequests, 1200),
  message: {
    success: false,
    error: { message: 'Too many requests', code: 'TOO_MANY_REQUESTS' },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path.startsWith('/api/health'),
  keyGenerator: (req) => buildCompositeClientKey(req),
  handler: () => {
    throw AppError.tooManyRequests('Too many requests from this client session')
  },
})

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  message: {
    success: false,
    error: { message: 'Too many authentication attempts', code: 'TOO_MANY_REQUESTS' },
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const email = typeof req.body?.email === 'string' ? req.body.email.toLowerCase().trim() : ''
    return `${buildCompositeClientKey(req)}:${email}`
  },
  handler: () => {
    throw AppError.tooManyRequests('Too many authentication attempts')
  },
})

export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: {
    success: false,
    error: { message: 'Too many upload attempts', code: 'TOO_MANY_REQUESTS' },
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => buildCompositeClientKey(req),
  handler: () => {
    throw AppError.tooManyRequests('Too many upload attempts')
  },
})