import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import { config } from './config'
import { errorHandler, notFoundHandler } from './middleware/errorHandler'
import { globalRateLimiter } from './middleware/rateLimiter'
import {
  concurrencyGuard,
  scalableResponseCacheAndCompression,
  getScalabilityMetrics,
} from './middleware/scalability'
import {
  apiPerformanceLogger,
  getApiPerformanceSummary,
} from './middleware/performanceLogger'
import { authenticate } from './middleware/auth'
import { asyncHandler } from './utils/asyncHandler'
import { successResponse } from './utils/response'
import { requestSanitizerMiddleware } from './utils/sanitize'
import { AppError } from './utils/errors'

import authRoutes from './routes/auth'
import userRoutes from './routes/users'
import profileRoutes from './routes/profiles'
import alumniRoutes from './routes/alumni'
import eventRoutes from './routes/events'
import jobRoutes from './routes/jobs'
import mentorshipRoutes from './routes/mentorship'
import conversationRoutes from './routes/conversations'
import messageRoutes from './routes/messages'
import notificationRoutes from './routes/notifications'
import announcementRoutes from './routes/announcements'
import adminRoutes from './routes/admin'
import campusNewsRoutes from './routes/campusNews'
import stateRoutes from './routes/state'

const app = express()

// Trust reverse proxy headers (Cloud Run / Nginx / Load Balancer)
app.set('trust proxy', 1)
app.disable('x-powered-by')

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
        connectSrc: ["'self'", 'https:'],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        frameAncestors: ["'self'"],
      },
    },
  })
)

const allowedOrigins = new Set([
  config.appUrl,
  config.apiUrl,
  'http://localhost:3000',
  'http://localhost:4000',
  'http://127.0.0.1:3000',
])

function isPermittedOrigin(origin: string | undefined): boolean {
  if (!origin) return true
  if (allowedOrigins.has(origin)) return true
  try {
    const parsed = new URL(origin)
    if (parsed.hostname.endsWith('.run.app')) return true
  } catch {
    return false
  }
  return false
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (isPermittedOrigin(origin)) {
        callback(null, true)
      } else {
        callback(null, false)
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-active-persona',
      'x-csrf-token',
      'x-requested-with',
    ],
  })
)

app.use(concurrencyGuard)
app.use(apiPerformanceLogger)
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true, limit: '2mb' }))
app.use(cookieParser())
app.use(requestSanitizerMiddleware)

/**
 * CSRF & Cross-Origin Mutation Guard:
 * Rejects state-changing requests (POST/PUT/PATCH/DELETE) originating from
 * untrusted cross-site origins, and requires either a valid Origin/Referer or
 * a custom API header when authentication cookies are present.
 */
app.use((req: Request, _res: Response, next: NextFunction) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next()
  }

  const origin = req.headers.origin
  if (origin && !isPermittedOrigin(origin)) {
    return next(AppError.forbidden('CSRF origin validation failed: untrusted origin'))
  }

  const hasCookieAuth = Boolean(req.cookies?.refreshToken || req.cookies?.accessToken)
  const hasCustomHeader = Boolean(
    req.headers.authorization ||
      req.headers['x-active-persona'] ||
      req.headers['x-csrf-token'] ||
      req.headers['x-requested-with']
  )

  if (hasCookieAuth && !origin && !hasCustomHeader) {
    return next(
      AppError.forbidden('CSRF protection: state-changing cookie requests require origin or custom header')
    )
  }

  next()
})

if (config.nodeEnv === 'development') {
  app.use(morgan('dev', { skip: (req) => req.path === '/api/health' }))
}
app.use(globalRateLimiter)
app.use(scalableResponseCacheAndCompression)

app.get(
  '/api/health',
  asyncHandler(async (_req, res) => {
    successResponse(res, {
      status: 'ok',
      timestamp: new Date().toISOString(),
      scalability: getScalabilityMetrics(),
      performance: getApiPerformanceSummary(),
    })
  })
)

app.get(
  '/api/health/performance',
  asyncHandler(async (_req, res) => {
    successResponse(res, {
      performance: getApiPerformanceSummary(),
      scalability: getScalabilityMetrics(),
    })
  })
)

app.use('/api/auth', authRoutes)
app.use('/api/campus-news', campusNewsRoutes)
app.use('/api/state', stateRoutes)

app.use('/api/users', authenticate, userRoutes)
app.use('/api/profiles', authenticate, profileRoutes)
app.use('/api/alumni', authenticate, alumniRoutes)
app.use('/api/events', authenticate, eventRoutes)
app.use('/api/jobs', authenticate, jobRoutes)
app.use('/api/mentorship', authenticate, mentorshipRoutes)
app.use('/api/conversations', authenticate, conversationRoutes)
app.use('/api/messages', authenticate, messageRoutes)
app.use('/api/notifications', authenticate, notificationRoutes)
app.use('/api/announcements', authenticate, announcementRoutes)
app.use('/api/admin', authenticate, adminRoutes)

app.use(notFoundHandler)
app.use(errorHandler)

if (process.env.NODE_ENV !== 'test' && !process.env.VITEST) {
  const server = app.listen(config.port, () => {
    console.log(`🚀 Server running on port ${config.port} in ${config.nodeEnv} mode`)
    console.log(`📚 API: ${config.apiUrl}`)
    console.log(`🌐 App: ${config.appUrl}`)
  })

  // Tune HTTP Keep-Alive & socket concurrency for high-throughput load balancers
  server.keepAliveTimeout = 65_000
  server.headersTimeout = 66_000
  server.maxRequestsPerSocket = 1000
}

export default app