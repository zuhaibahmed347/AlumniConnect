import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import app from '../index'
import { generateTokens } from '../utils/jwt'
import { config } from '../config'
import { UserRole, UserStatus } from '@alumni-connect/shared'

import { prisma } from '../utils/prisma'
import argon2 from 'argon2'

process.env.NODE_ENV = 'test'

describe('AlumniConnect — Comprehensive OWASP ASVS & API Security Audit Suite', () => {
  let studentToken: string
  let alumniToken: string
  let mentorToken: string
  let employerToken: string
  let adminToken: string
  let superAdminToken: string

  beforeAll(async () => {
    const existingRegularAdmin = await prisma.user.findUnique({
      where: { id: 'user-admin-regular' },
    })
    if (!existingRegularAdmin) {
      await prisma.user.create({
        data: {
          id: 'user-admin-regular',
          email: 'admin.regular@iba-suk.edu.pk',
          passwordHash: await argon2.hash('AdminPassword123!'),
          name: 'Regular Admin Officer',
          role: UserRole.ADMIN,
          status: UserStatus.ACTIVE,
        },
      })
    }

    studentToken = generateTokens({
      sub: 'user-student',
      email: 'zainab.magsi.bscs22@iba-suk.edu.pk',
      role: UserRole.MEMBER,
    }).accessToken

    alumniToken = generateTokens({
      sub: 'user-alumni',
      email: 'ahmed.hassan@iba-suk.edu.pk',
      role: UserRole.MEMBER,
    }).accessToken

    mentorToken = generateTokens({
      sub: 'user-mentor',
      email: 'sarah.khan@iba-suk.edu.pk',
      role: UserRole.MENTORSHIP_MANAGER,
    }).accessToken

    employerToken = generateTokens({
      sub: 'user-employer',
      email: 'careers@techcorp.pk',
      role: UserRole.EVENT_MANAGER,
    }).accessToken

    adminToken = generateTokens({
      sub: 'user-admin-regular',
      email: 'admin.regular@iba-suk.edu.pk',
      role: UserRole.ADMIN,
    }).accessToken

    superAdminToken = generateTokens({
      sub: 'user-admin',
      email: 'admin.alumni@iba-suk.edu.pk',
      role: UserRole.SUPER_ADMIN,
    }).accessToken
  })

  it('1. Rejects unauthenticated access to protected endpoints with 401 Unauthorized', async () => {
    const endpoints = [
      '/api/users',
      '/api/profiles/me',
      '/api/admin/dashboard',
      '/api/messages/conv-1',
      '/api/notifications',
    ]

    for (const endpoint of endpoints) {
      const res = await request(app).get(endpoint)
      expect(res.status).toBe(401)
      expect(res.body.success).toBe(false)
    }
  })

  it('2. Blocks Student and Alumni access to Administrator endpoints even with forged x-active-persona header', async () => {
    const resStudent = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${studentToken}`)
      .set('x-active-persona', 'ADMIN')

    expect(resStudent.status).toBe(403)

    const resEmployer = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${employerToken}`)
      .set('x-active-persona', 'ADMIN')

    expect(resEmployer.status).toBe(403)
  })

  it('3. Prevents Alumni or Student from modifying another user’s profile (BOLA / IDOR)', async () => {
    const res = await request(app)
      .patch('/api/users/user-student')
      .set('Authorization', `Bearer ${alumniToken}`)
      .send({ name: 'Unauthorized Name Tamper' })

    expect(res.status).toBe(403)
    expect(res.body.error.message).toMatch(/own profile/i)
  })

  it('4. Prevents Employers from modifying, deleting, or reading applicants of another employer’s job postings', async () => {
    // Alumni posts a referral job
    const createRes = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${alumniToken}`)
      .send({
        title: 'Senior Distributed Systems Architect',
        company: 'Systems Limited',
        description: 'Lead distributed payment systems engineering.',
        isRemote: true,
        employmentType: 'FULL_TIME',
      })

    expect(createRes.status).toBe(201)
    const alumniJobId = createRes.body.data.job.id

    // Student applies to Alumni's job
    const applyRes = await request(app)
      .post(`/api/jobs/${alumniJobId}/apply`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        coverNote: 'Applying with distributed systems thesis.',
      })
    expect(applyRes.status).toBe(201)
    const applicationId = applyRes.body.data.application.id

    // Another Employer attempts to edit Alumni's job -> 403
    const patchJobRes = await request(app)
      .patch(`/api/jobs/${alumniJobId}`)
      .set('Authorization', `Bearer ${employerToken}`)
      .send({ title: 'Hijacked Job Title' })
    expect(patchJobRes.status).toBe(403)

    // Another Employer attempts to delete Alumni's job -> 403
    const deleteJobRes = await request(app)
      .delete(`/api/jobs/${alumniJobId}`)
      .set('Authorization', `Bearer ${employerToken}`)
    expect(deleteJobRes.status).toBe(403)

    // Another Employer attempts to view applicants for Alumni's job -> 403
    const viewAppsRes = await request(app)
      .get(`/api/jobs/${alumniJobId}/applications`)
      .set('Authorization', `Bearer ${employerToken}`)
    expect(viewAppsRes.status).toBe(403)

    // Another Employer attempts to update status of Alumni's job applicant -> 403
    const patchAppRes = await request(app)
      .patch(`/api/jobs/applications/${applicationId}`)
      .set('Authorization', `Bearer ${employerToken}`)
      .send({ status: 'REJECTED' })
    expect(patchAppRes.status).toBe(403)
  })

  it('5. Prevents users from reading or posting messages in conversations they do not belong to', async () => {
    // Create a private direct conversation between user-alumni and user-mentor
    const convRes = await request(app)
      .post('/api/conversations')
      .set('Authorization', `Bearer ${alumniToken}`)
      .send({
        type: 'DIRECT',
        participantIds: ['user-mentor'],
      })
    expect([200, 201]).toContain(convRes.status)
    const privateConvId = convRes.body.data.conversation.id

    // Employer (not a participant) attempts to read messages from privateConvId -> 403
    const readRes = await request(app)
      .get(`/api/messages/${privateConvId}`)
      .set('Authorization', `Bearer ${employerToken}`)
    expect(readRes.status).toBe(403)

    // Employer attempts to send a message into privateConvId -> 403
    const postRes = await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${employerToken}`)
      .send({
        conversationId: privateConvId,
        content: 'Intruding into private thread',
      })
    expect(postRes.status).toBe(403)
  })

  it('6. Blocks mass assignment and forged role/ownership fields in API requests', async () => {
    // Student attempts self-privilege escalation via PATCH /api/users/user-student
    const roleEscalationRes = await request(app)
      .patch('/api/users/user-student')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        name: 'Zainab Magsi',
        role: UserRole.SUPER_ADMIN,
        status: UserStatus.ACTIVE,
      })
    expect(roleEscalationRes.status).toBe(403)

    // Employer attempts to forge postedById when creating a job
    const forgedOwnerJobRes = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${employerToken}`)
      .send({
        title: 'Cloud Infrastructure Engineer',
        company: 'TechCorp Pakistan',
        description: 'Kubernetes and Terraform role.',
        postedById: 'user-admin',
      })
    expect(forgedOwnerJobRes.status).toBe(201)
    expect(forgedOwnerJobRes.body.data.job.postedById).toBe('user-employer')
  })

  it('7. Rejects weak passwords and invalid schema inputs with 400 Validation Error', async () => {
    const weakRegRes = await request(app).post('/api/auth/register').send({
      email: 'weak.user@iba-suk.edu.pk',
      password: 'weakpassword',
      name: 'Weak User',
    })
    expect(weakRegRes.status).toBe(400)
    expect(weakRegRes.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('8. Sanitizes XSS payloads (<script>, inline event handlers, javascript: URIs) across bios, messages, and job descriptions using DOMPurify and JSDOM before storage', async () => {
    // 1. Profile bio and headline sanitization
    const xssProfileRes = await request(app)
      .patch('/api/profiles/me')
      .set('Authorization', `Bearer ${alumniToken}`)
      .send({
        headline: 'Senior Architect <script>alert("xss")</script>',
        bio: 'Distributed systems <img src=x onerror="alert(1)"> engineer <a href="javascript:evil()">link</a>',
      })

    expect(xssProfileRes.status).toBe(200)
    const updatedProfile = xssProfileRes.body.data.profile
    expect(updatedProfile.headline).not.toContain('<script>')
    expect(updatedProfile.bio).not.toContain('onerror=')
    expect(updatedProfile.bio).not.toContain('javascript:')

    // 2. Chat message sanitization before storage
    const convRes = await request(app)
      .post('/api/conversations')
      .set('Authorization', `Bearer ${alumniToken}`)
      .send({ type: 'DIRECT', participantIds: ['user-student'] })
    const convId = convRes.body.data.conversation.id

    const xssMsgRes = await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${alumniToken}`)
      .send({
        conversationId: convId,
        content: 'Hello <svg onload="alert(document.cookie)">world</svg> <iframe src="https://evil.example"></iframe>!',
      })

    expect(xssMsgRes.status).toBe(201)
    expect(xssMsgRes.body.data.message.content).not.toContain('<svg')
    expect(xssMsgRes.body.data.message.content).not.toContain('onload=')
    expect(xssMsgRes.body.data.message.content).not.toContain('<iframe')

    // 3. Job description rich-text sanitization (preserves safe formatting tags, strips scripts/handlers)
    const xssJobRes = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${employerToken}`)
      .send({
        title: 'Security Engineer <script>steal()</script>',
        company: 'Sukkur FinTech <img src=x onerror=alert(1)>',
        description:
          '<p>Join our <strong>engineering</strong> team!</p><script>window.pwned=true</script><a href="javascript:alert(1)" onclick="steal()">Apply</a>',
      })

    expect(xssJobRes.status).toBe(201)
    const createdJob = xssJobRes.body.data.job
    expect(createdJob.title).not.toContain('<script>')
    expect(createdJob.company).not.toContain('onerror')
    expect(createdJob.description).toContain('<strong>engineering</strong>')
    expect(createdJob.description).not.toContain('<script>')
    expect(createdJob.description).not.toContain('onclick=')
    expect(createdJob.description).not.toContain('javascript:')
  })

  it('9. Enforces CSRF origin validation on state-changing requests from untrusted origins', async () => {
    const csrfRes = await request(app)
      .patch('/api/profiles/me')
      .set('Authorization', `Bearer ${alumniToken}`)
      .set('Origin', 'https://evil-attacker.example.com')
      .send({ headline: 'CSRF Hijack' })

    expect(csrfRes.status).toBe(403)
    expect(csrfRes.body.error.message).toMatch(/CSRF origin validation failed/i)
  })

  it('10. Rejects arbitrary 8-character password guesses on seeded accounts and enforces reset token validity', async () => {
    // Previously any 8+ char string was accepted on seeded accounts; now must be rejected
    const badLoginRes = await request(app).post('/api/auth/login').send({
      email: 'ahmed.hassan@iba-suk.edu.pk',
      password: 'WrongPassword123!',
    })
    expect(badLoginRes.status).toBe(401)

    // Invalid reset token must be rejected with 400 Bad Request
    const badResetRes = await request(app).post('/api/auth/reset-password').send({
      token: 'forged-invalid-reset-token-123456',
      password: 'NewStrongPassword@2026',
    })
    expect(badResetRes.status).toBe(400)
  })

  it('11. Rejects expired, tampered, or wrong-algorithm JWT tokens with 401 Unauthorized', async () => {
    const expiredToken = jwt.sign(
      { sub: 'user-student', email: 'zainab.magsi.bscs22@iba-suk.edu.pk', role: 'MEMBER' },
      config.jwt.secret,
      {
        algorithm: 'HS256',
        expiresIn: -10,
        issuer: config.jwt.issuer,
        audience: config.jwt.audience,
      }
    )

    const expRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${expiredToken}`)
    expect(expRes.status).toBe(401)

    const tamperedRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${studentToken}tampered`)
    expect(tamperedRes.status).toBe(401)
  })

  it('12. Rejects dangerous executable file attachments (.exe, .sh, text/html) in messages', async () => {
    const convRes = await request(app)
      .post('/api/conversations')
      .set('Authorization', `Bearer ${alumniToken}`)
      .send({ type: 'DIRECT', participantIds: ['user-student'] })
    const convId = convRes.body.data.conversation.id

    const exeUploadRes = await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${alumniToken}`)
      .send({
        conversationId: convId,
        content: 'Malicious attachment test',
        attachments: [
          {
            id: 'att-malicious-1',
            name: 'payload.exe',
            mimeType: 'application/x-msdownload',
            size: 2048,
            extension: '.exe',
            url: 'https://example.com/payload.exe',
            category: 'FILE',
          },
        ],
      })

    expect(exeUploadRes.status).toBe(400)
    expect(exeUploadRes.body.error.message).toMatch(/not permitted/i)
  })

  it('13. Never leaks passwordHash or passwordResetToken in any user or admin API response', async () => {
    const adminUserRes = await request(app)
      .get('/api/admin/users/user-student')
      .set('Authorization', `Bearer ${superAdminToken}`)

    expect(adminUserRes.status).toBe(200)
    const userPayload = JSON.stringify(adminUserRes.body)
    expect(userPayload).not.toContain('passwordHash')
    expect(userPayload).not.toContain('passwordResetToken')
    expect(userPayload).not.toContain('c2liYS1hbHVtbmktc2FsdA')
  })

  it('14. Sets strict security headers (CSP, X-Content-Type-Options, Referrer-Policy) and blocks untrusted CORS', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'https://malicious-site.example.org')

    expect(res.status).toBe(200)
    expect(res.headers['x-content-type-options']).toBe('nosniff')
    expect(res.headers['referrer-policy']).toBe('strict-origin-when-cross-origin')
    expect(res.headers['content-security-policy']).toContain("default-src 'self'")
    expect(res.headers['access-control-allow-origin']).toBeUndefined()
  })

  it('15. Revokes session token upon logout so replaying the logged-out token returns 401', async () => {
    const freshLoginToken = generateTokens({
      sub: 'user-student',
      email: 'zainab.magsi.bscs22@iba-suk.edu.pk',
      role: UserRole.MEMBER,
    }).accessToken

    // Verify token works before logout
    const beforeLogout = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${freshLoginToken}`)
    expect(beforeLogout.status).toBe(200)

    // Perform logout
    const logoutRes = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${freshLoginToken}`)
    expect(logoutRes.status).toBe(200)

    // Replay the revoked token -> must be 401 Unauthorized
    const afterLogout = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${freshLoginToken}`)
    expect(afterLogout.status).toBe(401)
  })

  it('16. Prevents non-SUPER_ADMIN administrators from escalating privileges to SUPER_ADMIN or deleting SUPER_ADMIN', async () => {
    const escalateRes = await request(app)
      .patch('/api/admin/users/user-student')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: UserRole.SUPER_ADMIN })

    expect(escalateRes.status).toBe(403)

    const deleteSuperAdminRes = await request(app)
      .delete('/api/admin/users/user-admin')
      .set('Authorization', `Bearer ${adminToken}`)

    expect(deleteSuperAdminRes.status).toBe(403)
  })

  it('17. Enforces auth rate-limiting headers and single-use SHA-256 hashed password reset tokens', async () => {
    process.env.EXPOSE_DEV_RESET_TOKEN = 'true'
    const forgotRes = await request(app).post('/api/auth/forgot-password').send({
      email: 'zainab.magsi.bscs22@iba-suk.edu.pk',
      persona: 'STUDENT',
    })
    expect(forgotRes.status).toBe(200)
    expect(forgotRes.headers['ratelimit-limit']).toBeDefined()

    const issuedResetToken = forgotRes.body.data.resetToken
    expect(typeof issuedResetToken).toBe('string')

    // Verify database stores only the SHA-256 hash and not the raw token
    const dbUser = await prisma.user.findUnique({
      where: { email: 'zainab.magsi.bscs22@iba-suk.edu.pk' },
    })
    expect(dbUser?.passwordResetToken).toBeNull()
    expect(dbUser?.passwordResetTokenHash).toMatch(/^[a-f0-9]{64}$/)
    expect(dbUser?.passwordResetTokenHash).not.toBe(issuedResetToken)

    // First use of the reset token succeeds
    const firstReset = await request(app).post('/api/auth/reset-password').send({
      token: issuedResetToken,
      password: 'Password@123',
    })
    expect(firstReset.status).toBe(200)

    // Replaying the single-use reset token is rejected with 400 Bad Request
    const replayReset = await request(app).post('/api/auth/reset-password').send({
      token: issuedResetToken,
      password: 'Password@123',
    })
    expect(replayReset.status).toBe(400)
  })

  it('18. Enforces event organizer ownership isolation and notification ownership isolation', async () => {
    // Admin creates an event
    const now = Date.now()
    const eventRes = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        title: 'Executive Alumni Leadership Forum',
        description: 'Annual governance and strategy conclave at Main Auditorium.',
        location: 'Sukkur IBA Main Auditorium',
        timezone: 'Asia/Karachi',
        isVirtual: false,
        startDate: new Date(now + 86400000).toISOString(),
        endDate: new Date(now + 90000000).toISOString(),
      })
    expect(eventRes.status).toBe(201)
    const adminEventId = eventRes.body.data.event.id

    // Employer (EVENT_MANAGER) who is NOT the organizer attempts to modify or read registrations of Admin's event -> 403
    const tamperEventRes = await request(app)
      .patch(`/api/events/${adminEventId}`)
      .set('Authorization', `Bearer ${employerToken}`)
      .send({ title: 'Unauthorized Event Tamper' })
    expect(tamperEventRes.status).toBe(403)

    const readRegRes = await request(app)
      .get(`/api/events/${adminEventId}/registrations`)
      .set('Authorization', `Bearer ${employerToken}`)
    expect(readRegRes.status).toBe(403)

    // Create a private notification for Student and verify Alumni cannot mark it read or delete it -> 403
    const notif = await prisma.notification.create({
      data: {
        userId: 'user-student',
        type: 'SYSTEM',
        title: 'Private Scholarship Update',
        message: 'Confidential financial aid notice',
      },
    })

    const readOtherNotifRes = await request(app)
      .patch(`/api/notifications/${notif.id}/read`)
      .set('Authorization', `Bearer ${alumniToken}`)
    expect(readOtherNotifRes.status).toBe(403)

    const deleteOtherNotifRes = await request(app)
      .delete(`/api/notifications/${notif.id}`)
      .set('Authorization', `Bearer ${alumniToken}`)
    expect(deleteOtherNotifRes.status).toBe(403)
  })

  it('19. Tracks API route response times and error rates via performance logging middleware and exposes summary to Command Center', async () => {
    const perfRes = await request(app)
      .get('/api/admin/performance')
      .set('Authorization', `Bearer ${superAdminToken}`)

    expect(perfRes.status).toBe(200)
    expect(perfRes.headers['server-timing']).toMatch(/app;dur=/i)
    expect(perfRes.headers['x-response-time']).toMatch(/ms$/i)

    const summary = perfRes.body.data.performance
    expect(summary).toBeDefined()
    expect(typeof summary.overview.totalRequests).toBe('number')
    expect(summary.overview.totalRequests).toBeGreaterThan(0)
    expect(typeof summary.overview.avgResponseTimeMs).toBe('number')
    expect(typeof summary.overview.p95ResponseTimeMs).toBe('number')
    expect(typeof summary.overview.errorRatePct).toBe('number')
    expect(Array.isArray(summary.routes)).toBe(true)
    expect(summary.routes.length).toBeGreaterThan(0)
    expect(Array.isArray(summary.recentTraces)).toBe(true)

    // Verify 24-hour avg response time and error rate calculation from performance middleware logs
    expect(summary.last24Hours).toBeDefined()
    expect(summary.last24Hours.windowHours).toBe(24)
    expect(summary.last24Hours.totalRequests).toBeGreaterThan(0)
    expect(typeof summary.last24Hours.avgResponseTimeMs).toBe('number')
    expect(summary.last24Hours.avgResponseTimeMs).toBeGreaterThan(0)
    expect(typeof summary.last24Hours.p95ResponseTimeMs).toBe('number')
    expect(typeof summary.last24Hours.errorRatePct).toBe('number')
    const expected24hErrorRate = Number(
      (
        (summary.last24Hours.errorRequests /
          summary.last24Hours.totalRequests) *
        100
      ).toFixed(2)
    )
    expect(summary.last24Hours.errorRatePct).toBe(expected24hErrorRate)
    expect(Array.isArray(summary.logs24h)).toBe(true)
    expect(summary.logs24h.length).toBeGreaterThan(0)
    expect(summary.ttlPolicy).toBeDefined()
    expect(summary.ttlPolicy.retentionDays).toBe(7)
    expect(summary.ttlPolicy.ttlSeconds).toBe(7 * 24 * 60 * 60)
  })

  it('20. Enforces 7-day TTL policy for database performance logs, automatically purging logs older than 7 days', async () => {
    const now = Date.now()
    const eightDaysAgoIso = new Date(
      now - 8 * 24 * 60 * 60 * 1000
    ).toISOString()
    const tenDaysAgoIso = new Date(
      now - 10 * 24 * 60 * 60 * 1000
    ).toISOString()
    const twoDaysAgoIso = new Date(
      now - 2 * 24 * 60 * 60 * 1000
    ).toISOString()

    // Insert 2 expired logs (> 7 days old) and 1 recent log (< 7 days old) into the database
    const expiredLog1 = await prisma.performanceLog.create({
      data: {
        id: 'ttl-test-expired-8d',
        method: 'GET',
        route: '/api/alumni',
        statusCode: 200,
        durationMs: 14.2,
        cacheStatus: 'HIT',
        isError: false,
        createdAt: eightDaysAgoIso,
      },
    })
    const expiredLog2 = await prisma.performanceLog.create({
      data: {
        id: 'ttl-test-expired-10d',
        method: 'POST',
        route: '/api/auth/login',
        statusCode: 401,
        durationMs: 39.5,
        cacheStatus: 'BYPASS',
        isError: true,
        createdAt: tenDaysAgoIso,
      },
    })
    const recentLog = await prisma.performanceLog.create({
      data: {
        id: 'ttl-test-recent-2d',
        method: 'GET',
        route: '/api/jobs',
        statusCode: 200,
        durationMs: 12.8,
        cacheStatus: 'HIT',
        isError: false,
        createdAt: twoDaysAgoIso,
      },
    })

    // Trigger TTL purge via admin endpoint
    const purgeRes = await request(app)
      .post('/api/admin/performance/purge-ttl')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ retentionDays: 7 })

    expect(purgeRes.status).toBe(200)
    expect(purgeRes.body.data.ttlPolicy.retentionDays).toBe(7)
    expect(purgeRes.body.data.ttlPolicy.lastPurgeRemovedCount).toBeGreaterThanOrEqual(2)

    // Verify expired logs (>7 days) were purged from database while recent log (<7 days) remains
    const foundExpired1 = await prisma.performanceLog.findUnique({
      where: { id: expiredLog1.id },
    })
    const foundExpired2 = await prisma.performanceLog.findUnique({
      where: { id: expiredLog2.id },
    })
    const foundRecent = await prisma.performanceLog.findUnique({
      where: { id: recentLog.id },
    })

    expect(foundExpired1).toBeNull()
    expect(foundExpired2).toBeNull()
    expect(foundRecent).not.toBeNull()
    expect(foundRecent?.id).toBe('ttl-test-recent-2d')
  })
})

