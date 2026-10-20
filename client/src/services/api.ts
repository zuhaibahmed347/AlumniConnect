/**
 * Shared API client for the AlumniConnect REST API (server exposes /api/v1).
 *
 * - Sends the JWT access token from localStorage as a Bearer header.
 * - Parses the server's consistent { success, data, meta, error } envelope.
 * - Throws ApiError with the server's message so screens can show real errors.
 */

const API_BASE = '/api'
const TOKEN_KEY = 'accessToken'

// LocalStorage accessor (browser API)
const getLocalStorage = (): Storage => {
  // Type augmentation handled by bundler; fallback for type checking
  const ls = globalThis.localStorage!
  return ls
}

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export function getToken(): string | null {
  return getLocalStorage().getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  getLocalStorage().setItem(TOKEN_KEY, token)
}

export function clearToken() {
  getLocalStorage().removeItem(TOKEN_KEY)
}

export function isAuthenticated(): boolean {
  return Boolean(getToken())
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  /** Query parameters; undefined/null/empty values are omitted. */
  query?: Record<string, string | number | boolean | undefined | null>
}

interface Envelope<T> {
  success?: boolean
  data?: T
  meta?: Record<string, unknown>
  error?: { message?: string; code?: string }
}

async function rawRequest<T>(path: string, options: RequestOptions = {}): Promise<Envelope<T>> {
  const { body, query, headers, ...rest } = options

  let url = `${API_BASE}${path}`
  if (query) {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, String(value))
      }
    }
    const qs = params.toString()
    if (qs) url += `?${qs}`
  }

  const token = getToken()
  const requestHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...(headers as Record<string, string> | undefined),
  }
  if (body !== undefined) requestHeaders['Content-Type'] = 'application/json'
  if (token) requestHeaders.Authorization = `Bearer ${token}`

  let response: Response
  try {
    response = await fetch(url, {
      ...rest,
      headers: requestHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError('Cannot reach the server. Please check your connection and try again.', 0)
  }

  if (response.status === 401) {
    // Session expired or invalid — drop the stale token so route guards redirect.
    clearToken()
  }

  let payload: Envelope<T> | null = null
  try {
    payload = (await response.json()) as Envelope<T> | null
  } catch {
    // Non-JSON body (e.g. HTML error page) — fall through to status handling.
  }

  if (!response.ok) {
    const message =
      payload?.error?.message ??
      (response.status === 404
        ? 'The requested resource was not found.'
        : `Request failed with status ${response.status}.`)
    throw new ApiError(message, response.status)
  }

  return payload ?? { success: true }
}

/** Standard paginated list envelope used by the server's list endpoints. */
export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export const api = {
  /** Single-resource GET; returns the unwrapped data payload. */
  async get<T>(path: string, options?: RequestOptions): Promise<T> {
    const payload = await rawRequest<T>(path, { ...options, method: 'GET' })
    return (payload.data ?? payload) as T
  },
  /** List GET; returns items plus pagination metadata. */
  async list<T>(
    path: string,
    options?: RequestOptions,
  ): Promise<Paginated<T>> {
    const payload = await rawRequest<T[]>(path, { ...options, method: 'GET' })
    const items = Array.isArray(payload.data) ? payload.data : []
    const meta = payload.meta ?? {}
    return {
      items,
      total: Number(meta.total ?? items.length),
      page: Number(meta.page ?? 1),
      limit: Number(meta.limit ?? (items.length || 20)),
      totalPages: Number(meta.totalPages ?? 1),
    }
  },
  async post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    const payload = await rawRequest<T>(path, { ...options, method: 'POST', body })
    return (payload.data ?? payload) as T
  },
  async patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    const payload = await rawRequest<T>(path, { ...options, method: 'PATCH', body })
    return (payload.data ?? payload) as T
  },
  async put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    const payload = await rawRequest<T>(path, { ...options, method: 'PUT', body })
    return (payload.data ?? payload) as T
  },
  async delete<T>(path: string, options?: RequestOptions): Promise<T> {
    const payload = await rawRequest<T>(path, { ...options, method: 'DELETE' })
    return (payload.data ?? payload) as T
  },
}
