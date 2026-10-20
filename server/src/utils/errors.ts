export class AppError extends Error {
  public readonly statusCode: number
  public readonly code: string
  public readonly details?: Record<string, unknown>
  public isOperational: boolean

  constructor(message: string, statusCode: number, code: string, details?: Record<string, unknown>) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.details = details
    this.isOperational = true

    Object.setPrototypeOf(this, AppError.prototype)
    Error.captureStackTrace(this, this.constructor)
  }

  static badRequest(message: string, details?: Record<string, unknown>) {
    return new AppError(message, 400, 'BAD_REQUEST', details)
  }

  static unauthorized(message: string = 'Unauthorized', details?: Record<string, unknown>) {
    return new AppError(message, 401, 'UNAUTHORIZED', details)
  }

  static forbidden(message: string = 'Forbidden', details?: Record<string, unknown>) {
    return new AppError(message, 403, 'FORBIDDEN', details)
  }

  static notFound(message: string = 'Resource not found', details?: Record<string, unknown>) {
    return new AppError(message, 404, 'NOT_FOUND', details)
  }

  static conflict(message: string, details?: Record<string, unknown>) {
    return new AppError(message, 409, 'CONFLICT', details)
  }

  static tooManyRequests(message: string = 'Too many requests', details?: Record<string, unknown>) {
    return new AppError(message, 429, 'TOO_MANY_REQUESTS', details)
  }

  static internal(message: string = 'Internal server error', details?: Record<string, unknown>) {
    const error = new AppError(message, 500, 'INTERNAL_ERROR', details)
    error.isOperational = false
    return error
  }

  static validation(errors: Record<string, string[]>) {
    return new AppError('Validation failed', 400, 'VALIDATION_ERROR', { errors })
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}

export function formatError(error: unknown): { message: string; code: string; details?: Record<string, unknown> } {
  if (isAppError(error)) {
    return { message: error.message, code: error.code, details: error.details }
  }
  if (error instanceof Error) {
    return { message: error.message, code: 'UNKNOWN_ERROR' }
  }
  return { message: 'An unknown error occurred', code: 'UNKNOWN_ERROR' }
}