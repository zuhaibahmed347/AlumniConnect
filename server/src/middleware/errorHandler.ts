import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { AppError, isAppError, formatError } from '../utils/errors'
import { errorResponse } from '../utils/response'
import { config } from '../config'

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(`[ERROR] ${req.method} ${req.path}`, {
    message: error.message,
    stack: config.nodeEnv === 'development' ? error.stack : undefined,
  })

  if (isAppError(error)) {
    return errorResponse(res, error.message, error.statusCode, error.code, error.details)
  }

  if (error instanceof ZodError) {
    const errors: Record<string, string[]> = {}
    for (const issue of error.issues) {
      const path = issue.path.join('.')
      if (!errors[path]) errors[path] = []
      errors[path].push(issue.message)
    }
    return errorResponse(res, 'Validation failed', 400, 'VALIDATION_ERROR', { errors })
  }

  const anyErr = error as Error & { code?: string; meta?: { target?: string[] } }
  if (anyErr.code === 'P2002') {
    const target = anyErr.meta?.target?.join(', ') || 'field'
    return errorResponse(res, `A record with this ${target} already exists`, 409, 'DUPLICATE_ENTRY')
  }
  if (anyErr.code === 'P2025') {
    return errorResponse(res, 'Record not found', 404, 'NOT_FOUND')
  }
  if (anyErr.code === 'P2003') {
    return errorResponse(res, 'Foreign key constraint failed', 400, 'FOREIGN_KEY_ERROR')
  }

  const formatted = formatError(error)
  const statusCode = isAppError(error) ? error.statusCode : 500

  return errorResponse(
    res,
    formatted.message,
    statusCode,
    formatted.code,
    config.nodeEnv === 'development' ? formatted.details : undefined
  )
}

export function notFoundHandler(req: Request, res: Response) {
  return errorResponse(res, `Route ${req.method} ${req.path} not found`, 404, 'NOT_FOUND')
}