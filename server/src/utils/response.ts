import { Response } from 'express'
import { ApiResponse, PaginatedResponse } from '@alumni-connect/shared'

const REDACTED_KEYS = new Set([
  'passwordHash',
  'passwordResetToken',
  'passwordResetTokenHash',
  'passwordResetExpires',
])

function stripSensitiveFields<T>(value: T, depth = 0): T {
  if (depth > 10 || value === null || value === undefined) {
    return value
  }
  if (Array.isArray(value)) {
    return value.map((item) => stripSensitiveFields(item, depth + 1)) as unknown as T
  }
  if (typeof value === 'object' && !(value instanceof Date)) {
    const cleaned: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (REDACTED_KEYS.has(k)) continue
      cleaned[k] = stripSensitiveFields(v, depth + 1)
    }
    return cleaned as T
  }
  return value
}

export function successResponse<T>(
  res: Response,
  data: T,
  statusCode: number = 200,
  meta?: Record<string, unknown>
) {
  const safeData = stripSensitiveFields(data)
  const response: ApiResponse<T> = {
    success: true,
    data: safeData,
    meta,
  }
  return res.status(statusCode).json(response)
}

export function errorResponse(
  res: Response,
  message: string,
  statusCode: number = 500,
  code: string = 'ERROR',
  details?: Record<string, unknown>
) {
  const response: ApiResponse<null> = {
    success: false,
    error: { message, code, details },
  }
  return res.status(statusCode).json(response)
}

export function paginatedResponse<T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number,
  meta?: Record<string, unknown>
) {
  const safeData = stripSensitiveFields(data)
  const totalPages = Math.ceil(total / limit)
  const paginationMeta = {
    total,
    page,
    limit,
    totalPages,
    ...meta,
  }
  const response: PaginatedResponse<T> = {
    data: safeData,
    meta: paginationMeta,
  }
  return res.json({
    success: true,
    data: response,
    items: safeData,
    meta: paginationMeta,
  })
}

export function createdResponse<T>(
  res: Response,
  data: T,
  meta?: Record<string, unknown>
) {
  return successResponse(res, data, 201, meta)
}

export function noContentResponse(res: Response) {
  return res.status(204).send()
}