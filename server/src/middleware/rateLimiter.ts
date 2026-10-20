import rateLimit from 'express-rate-limit'
import { config } from '../config'
import { AppError } from '../utils/errors'

export const globalRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: { success: false, error: { message: 'Too many requests', code: 'TOO_MANY_REQUESTS' } },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip || 'unknown',
  handler: (req, res) => {
    throw AppError.tooManyRequests('Too many requests from this IP')
  },
})

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: { message: 'Too many authentication attempts', code: 'TOO_MANY_REQUESTS' } },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip || 'unknown',
  handler: (req, res) => {
    throw AppError.tooManyRequests('Too many authentication attempts')
  },
})

export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { success: false, error: { message: 'Too many upload attempts', code: 'TOO_MANY_REQUESTS' } },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip || 'unknown',
  handler: (req, res) => {
    throw AppError.tooManyRequests('Too many upload attempts')
  },
})