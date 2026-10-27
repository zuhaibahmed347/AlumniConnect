/**
 * Shared API client for the AlumniConnect REST API (server exposes /api/*).
 *
 * Scalability & Resilience Features:
 * - In-flight GET request deduplication (Singleflight) to prevent duplicate concurrent fetches.
 * - Short-TTL client memory cache with instant invalidation on mutations (POST/PUT/PATCH/DELETE).
 * - Automatic retry with jittered exponential backoff for transient 429/502/503/504 errors.
 * - Debounced write coalescing for background platform state synchronization.
 */

const API_BASE = '/api'
const TOKEN_KEY = 'accessToken'
const PERSONA_STORAGE_KEY = 'siba_active_persona_v1'
const CLIENT_CACHE_TTL_MS = 8_000
const REQUEST_TIMEOUT_MS = 12_000
const MAX_GET_RETRIES = 2

const getLocalStorage = (): Storage => {
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
  invalidateClientApiCache()
}

export function clearToken() {
  const ls = getLocalStorage()
  ls.removeItem(TOKEN_KEY)
  ls.removeItem('siba_student_profile_record_v2')
  ls.removeItem('siba_alumni_profile_record_v2')
  invalidateClientApiCache()
}

export function isAuthenticated(): boolean {
  return Boolean(getToken())
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  /** Query parameters; undefined/null/empty values are omitted. */
  query?: Record<string, string | number | boolean | undefined | null>
  /** Bypass client-side memory cache when true. */
  skipCache?: boolean
}

interface Envelope<T> {
  success?: boolean
  data?: T
  meta?: Record<string, unknown>
  error?: { message?: string; code?: string }
}

interface ClientCacheEntry {
  envelope: Envelope<any>
  expiresAt: number
}

const clientReadCache = new Map<string, ClientCacheEntry>()
const inFlightGetRequests = new Map<string, Promise<Envelope<any>>>()

export function invalidateClientApiCache(): void {
  clientReadCache.clear()
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function rawRequest<T>(path: string, options: RequestOptions = {}): Promise<Envelope<T>> {
  const { body, query, headers, skipCache, ...rest } = options
  const method = (rest.method || 'GET').toUpperCase()

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

  let activePersona = 'ALUMNI'
  try {
    activePersona = getLocalStorage().getItem(PERSONA_STORAGE_KEY) || 'ALUMNI'
  } catch {
    activePersona = 'ALUMNI'
  }

  const token = getToken() || `demo-session-${activePersona.toLowerCase()}`
  const cacheKey = `${activePersona}:${token.slice(-12)}:${url}`

  // Any mutation invalidates cached GET responses immediately
  if (method !== 'GET') {
    clientReadCache.clear()
  } else if (!skipCache) {
    const cached = clientReadCache.get(cacheKey)
    if (cached && cached.expiresAt > Date.now()) {
      return cached.envelope as Envelope<T>
    }

    const existingInFlight = inFlightGetRequests.get(cacheKey)
    if (existingInFlight) {
      return existingInFlight as Promise<Envelope<T>>
    }
  }

  const executeFetchWithRetry = async (): Promise<Envelope<T>> => {
    const requestHeaders: Record<string, string> = {
      Accept: 'application/json',
      'x-active-persona': activePersona,
      'x-requested-with': 'XMLHttpRequest',
      ...(headers as Record<string, string> | undefined),
    }
    if (body !== undefined) requestHeaders['Content-Type'] = 'application/json'
    if (token) requestHeaders.Authorization = `Bearer ${token}`

    const maxAttempts = method === 'GET' ? MAX_GET_RETRIES + 1 : 1
    let lastError: unknown = null

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

      let response: Response
      try {
        response = await fetch(url, {
          ...rest,
          method,
          credentials: 'include',
          headers: requestHeaders,
          body: body !== undefined ? JSON.stringify(body) : undefined,
          signal: rest.signal ?? controller.signal,
        })
      } catch (err) {
        clearTimeout(timeoutId)
        lastError = err
        if (attempt < maxAttempts - 1) {
          await sleep(220 * Math.pow(2, attempt) + Math.floor(Math.random() * 80))
          continue
        }
        throw new ApiError(
          'Cannot reach the server. Please check your connection and try again.',
          0,
        )
      } finally {
        clearTimeout(timeoutId)
      }

      // Retry transient overload / gateway statuses on idempotent GET requests
      if (
        method === 'GET' &&
        attempt < maxAttempts - 1 &&
        (response.status === 429 ||
          response.status === 502 ||
          response.status === 503 ||
          response.status === 504)
      ) {
        await sleep(250 * Math.pow(2, attempt) + Math.floor(Math.random() * 100))
        continue
      }

      if (response.status === 401) {
        const current = getToken()
        if (current && !current.startsWith('demo-session-')) {
          clearToken()
        }
      }

      let payload: Envelope<T> | null = null
      try {
        payload = (await response.json()) as Envelope<T> | null
      } catch {
        // Non-JSON body — fall through to status handling.
      }

      if (!response.ok) {
        const message =
          payload?.error?.message ??
          (response.status === 404
            ? 'The requested resource was not found.'
            : `Request failed with status ${response.status}.`)
        throw new ApiError(message, response.status)
      }

      const resolved = payload ?? { success: true }
      if (method === 'GET' && !skipCache) {
        if (clientReadCache.size >= 150) {
          const oldest = clientReadCache.keys().next().value
          if (oldest) clientReadCache.delete(oldest)
        }
        clientReadCache.set(cacheKey, {
          envelope: resolved,
          expiresAt: Date.now() + CLIENT_CACHE_TTL_MS,
        })
      }

      return resolved
    }

    throw lastError instanceof ApiError
      ? lastError
      : new ApiError('Request failed after retries.', 0)
  }

  if (method === 'GET' && !skipCache) {
    const promise = executeFetchWithRetry().finally(() => {
      inFlightGetRequests.delete(cacheKey)
    })
    inFlightGetRequests.set(cacheKey, promise)
    return promise
  }

  return executeFetchWithRetry()
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
    const payload = await rawRequest<any>(path, { ...options, method: 'GET' })
    const rawData = payload.data
    const items: T[] = Array.isArray(rawData)
      ? rawData
      : Array.isArray(rawData?.data)
        ? rawData.data
        : []
    const meta = payload.meta ?? rawData?.meta ?? {}
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

const STATE_KEY_TO_STORAGE_KEY: Record<string, string> = {
  jobApplications: 'siba_job_applications_v1',
  employerJobs: 'siba_employer_jobs_v1',
  employerOrg: 'siba_employer_org_v1',
  connectedAlumniIds: 'siba_connected_alumni_ids_v1',
  alumniOverrides: 'siba_alumni_profile_overrides_v1',
  mentorshipRequests: 'siba_mentorship_requests_v1',
  shortlistedMentorIds: 'siba_shortlisted_mentor_ids_v1',
  enrolledTrackIds: 'siba_enrolled_mentorship_tracks_v1',
  eventRsvps: 'siba_event_rsvp_map_v1',
  mentorCustomSlots: 'siba_mentor_custom_slots_v1',
  studentProfile: 'siba_student_profile_record_v2',
  alumniProfile: 'siba_alumni_profile_record_v2',
}

const pendingSyncTimers = new Map<string, ReturnType<typeof setTimeout>>()

/**
 * Coalesces rapid state updates per key (220ms debounce) so burst UI interactions
 * only transmit the latest state snapshot to the backend.
 */
export function syncPlatformStateKey(key: string, value: unknown): void {
  if (typeof window === 'undefined') return
  const existingTimer = pendingSyncTimers.get(key)
  if (existingTimer) {
    clearTimeout(existingTimer)
  }
  const timer = setTimeout(() => {
    pendingSyncTimers.delete(key)
    void api.put(`/state/${key}`, { value }).catch(() => {
      // Non-blocking background sync
    })
  }, 220)
  pendingSyncTimers.set(key, timer)
}

let bootstrapInFlight = false

export function bootstrapPlatformState(): void {
  if (typeof window === 'undefined' || bootstrapInFlight) return
  bootstrapInFlight = true
  void api
    .get<{ platformState?: Record<string, unknown> }>('/state/bootstrap')
    .then((res) => {
      const state = res?.platformState
      if (!state || typeof state !== 'object') return
      let hydratedAny = false
      for (const [stateKey, storageKey] of Object.entries(STATE_KEY_TO_STORAGE_KEY)) {
        const serverVal = state[stateKey]
        if (serverVal !== undefined && serverVal !== null) {
          try {
            window.localStorage.setItem(storageKey, JSON.stringify(serverVal))
            hydratedAny = true
          } catch {
            // Ignore quota errors
          }
        }
      }
      if (hydratedAny) {
        window.dispatchEvent(new CustomEvent('siba-backend-hydrated', { detail: state }))
        window.dispatchEvent(new CustomEvent('siba-event-rsvp-sync'))
      }
    })
    .catch(() => {
      // Offline / initial boot fallback
    })
    .finally(() => {
      bootstrapInFlight = false
    })
}
