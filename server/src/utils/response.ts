import { Response } from 'express'
import { ApiResponse, PaginatedResponse } from '@alumni-connect/shared'

export function successResponse<T>(res: Response, data: T, statusCode: number = 200, meta?: Record<string, unknown>) {
  const response: ApiResponse<T> = {
    success: true,
    data,
    meta,
  }
  return res.status(statusCode).json(response)
}

export function errorResponse(res: Response, message: string, statusCode: number = 500, code: string = 'ERROR', details?: Record<string, unknown>) {
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
  const totalPages = Math.ceil(total / limit)
  const response: PaginatedResponse<T> = {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages,
      ...meta,
    },
  }
  return res.json({ success: true, data: response })
}

export function createdResponse<T>(res: Response, data: T, meta?: Record<string, unknown>) {
  return successResponse(res, data, 201, meta)
}

export function noContentResponse(res: Response) {
  return res.status(204).send()
}