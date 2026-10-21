import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import { config } from './config'
import { errorHandler, notFoundHandler } from './middleware/errorHandler'
import { globalRateLimiter } from './middleware/rateLimiter'
import { auditLog } from './middleware/auditLog'
import { authenticate, AuthenticatedRequest } from './middleware/auth'
import { asyncHandler } from './utils/asyncHandler'
import { successResponse } from './utils/response'

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

const app = express()

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}))
app.use(cors(config.cors))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'))
app.use(globalRateLimiter)

app.get('/api/health', asyncHandler(async (req, res) => {
  successResponse(res, { status: 'ok', timestamp: new Date().toISOString() })
}))

app.use('/api/auth', authRoutes)
app.use('/api/campus-news', campusNewsRoutes)

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

app.listen(config.port, () => {
  console.log(`🚀 Server running on port ${config.port} in ${config.nodeEnv} mode`)
  console.log(`📚 API: ${config.apiUrl}`)
  console.log(`🌐 App: ${config.appUrl}`)
})

export default app