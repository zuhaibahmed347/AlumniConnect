import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { config } from '../config'
import { JWTPayload, AuthTokens } from '@alumni-connect/shared'
import { AppError } from './errors'

const revokedTokenDigests = new Map<string, number>()
const userTokensRevokedBeforeSec = new Map<string, number>()

function hashTokenDigest(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

function cleanupExpiredRevocations(): void {
  const nowMs = Date.now()
  if (revokedTokenDigests.size > 2000) {
    for (const [digest, expMs] of revokedTokenDigests.entries()) {
      if (expMs <= nowMs) revokedTokenDigests.delete(digest)
    }
  }
}

export function revokeToken(token: string | undefined | null): void {
  if (!token) return
  cleanupExpiredRevocations()
  const digest = hashTokenDigest(token)
  // Retain revocation for 7 days
  revokedTokenDigests.set(digest, Date.now() + 7 * 24 * 60 * 60 * 1000)
}

export function revokeAllTokensForUser(userId: string): void {
  if (!userId) return
  // Use current second timestamp; tokens issued before this second are rejected
  userTokensRevokedBeforeSec.set(userId, Math.floor(Date.now() / 1000))
}

export function isTokenRevoked(token: string, payload?: JWTPayload): boolean {
  const digest = hashTokenDigest(token)
  const expMs = revokedTokenDigests.get(digest)
  if (expMs && expMs > Date.now()) {
    return true
  }
  if (payload?.sub && payload?.iat) {
    const revokedBefore = userTokensRevokedBeforeSec.get(payload.sub)
    if (revokedBefore && payload.iat < revokedBefore) {
      return true
    }
  }
  return false
}

export function generateTokens(payload: Omit<JWTPayload, 'iat' | 'exp'>): AuthTokens {
  const jti = crypto.randomUUID()
  const accessToken = jwt.sign({ ...payload, jti }, config.jwt.secret, {
    algorithm: 'HS256',
    expiresIn: config.jwt.accessExpiry as jwt.SignOptions['expiresIn'],
    issuer: config.jwt.issuer,
    audience: config.jwt.audience,
  })

  const refreshToken = jwt.sign(
    { ...payload, jti: `${jti}-refresh` },
    config.jwt.refreshSecret,
    {
      algorithm: 'HS256',
      expiresIn: config.jwt.refreshExpiry as jwt.SignOptions['expiresIn'],
      issuer: config.jwt.issuer,
      audience: config.jwt.audience,
    }
  )

  return { accessToken, refreshToken }
}

export function verifyAccessToken(token: string): JWTPayload {
  try {
    const payload = jwt.verify(token, config.jwt.secret, {
      algorithms: ['HS256'],
      issuer: config.jwt.issuer,
      audience: config.jwt.audience,
    }) as JWTPayload

    if (isTokenRevoked(token, payload)) {
      throw AppError.unauthorized('Access token has been revoked')
    }

    return payload
  } catch (error) {
    if (error instanceof AppError) throw error
    if (error instanceof jwt.TokenExpiredError) {
      throw AppError.unauthorized('Access token expired', { expired: true })
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw AppError.unauthorized('Invalid access token')
    }
    throw AppError.unauthorized('Token verification failed')
  }
}

export function verifyRefreshToken(token: string): JWTPayload {
  try {
    const payload = jwt.verify(token, config.jwt.refreshSecret, {
      algorithms: ['HS256'],
      issuer: config.jwt.issuer,
      audience: config.jwt.audience,
    }) as JWTPayload

    if (isTokenRevoked(token, payload)) {
      throw AppError.unauthorized('Refresh token has been revoked')
    }

    return payload
  } catch (error) {
    if (error instanceof AppError) throw error
    if (error instanceof jwt.TokenExpiredError) {
      throw AppError.unauthorized('Refresh token expired', { expired: true })
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw AppError.unauthorized('Invalid refresh token')
    }
    throw AppError.unauthorized('Token verification failed')
  }
}

export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload
  } catch {
    return null
  }
}