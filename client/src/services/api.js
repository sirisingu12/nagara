const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'

let accessToken = null
let refreshRequest = null
const refreshExcludedPaths = new Set([
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/logout',
])

export class ApiClientError extends Error {
  constructor(message, status, code, details = []) {
    super(message)
    this.name = 'ApiClientError'
    this.status = status
    this.code = code
    this.details = details
  }
}

function notifySessionExpired() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('nagara:session-expired'))
  }
}

async function request(path, { auth = true, retryOnRefresh = true, ...options } = {}) {
  const headers = new Headers(options.headers)
  let body = options.body
  if (body !== undefined && !(body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
    body = JSON.stringify(body)
  }
  if (auth && accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    body,
    credentials: 'include',
    headers,
  })

  if (
    response.status === 401 &&
    auth &&
    retryOnRefresh &&
    !refreshExcludedPaths.has(path)
  ) {
    try {
      const session = await apiClient.refresh()
      accessToken = session.accessToken
      return request(path, { ...options, auth: true, retryOnRefresh: false })
    } catch (error) {
      accessToken = null
      notifySessionExpired()
      throw error
    }
  }

  if (response.status === 204) {
    return null
  }

  let payload
  try {
    payload = await response.json()
  } catch {
    throw new ApiClientError('The server returned an invalid response.', response.status)
  }

  if (!response.ok || payload.success !== true) {
    throw new ApiClientError(
      payload.error?.message || 'The request could not be completed.',
      response.status,
      payload.error?.code,
      payload.error?.details || [],
    )
  }

  return payload.data
}

export const apiClient = Object.freeze({
  get(path, options = {}) {
    return request(path, { ...options, method: 'GET' })
  },
  post(path, body, options = {}) {
    return request(path, { ...options, method: 'POST', body })
  },
  setAccessToken(token) {
    accessToken = token || null
  },
  clearAccessToken() {
    accessToken = null
  },
  login(credentials) {
    return request('/auth/login', { method: 'POST', body: credentials, auth: false })
  },
  register(details) {
    return request('/auth/register', { method: 'POST', body: details, auth: false })
  },
  refresh() {
    if (!refreshRequest) {
      refreshRequest = request('/auth/refresh', {
        method: 'POST',
        auth: false,
      }).finally(() => {
        refreshRequest = null
      })
    }
    return refreshRequest
  },
  logout() {
    return request('/auth/logout', { method: 'POST', auth: false })
  },
})
