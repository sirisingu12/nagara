import { Router } from 'express'
import { getDatabasePool } from '../config/database.js'
import { getEnvironment } from '../config/env.js'
import { createAuthenticate } from '../middleware/authMiddleware.js'
import { requireTrustedOrigin } from '../middleware/csrfOrigin.js'
import { createLoginRateLimiter } from '../middleware/loginRateLimiter.js'
import { createAuthRepository } from '../repositories/authRepository.js'
import { createAuthService } from '../services/authService.js'
import { ApiError } from '../utils/apiError.js'

export const REFRESH_COOKIE_NAME = 'nagara_refresh'
const REFRESH_COOKIE_PATH = '/api/auth'
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000

function readCookie(request, name) {
  const cookieHeader = request.get('cookie')
  if (!cookieHeader) {
    return null
  }
  for (const cookie of cookieHeader.split(';')) {
    const separatorIndex = cookie.indexOf('=')
    if (separatorIndex < 0 || cookie.slice(0, separatorIndex).trim() !== name) {
      continue
    }
    try {
      return decodeURIComponent(cookie.slice(separatorIndex + 1).trim())
    } catch {
      return null
    }
  }
  return null
}

function serializeRefreshCookie(token, isProduction) {
  const parts = [
    `${REFRESH_COOKIE_NAME}=${encodeURIComponent(token)}`,
    `Path=${REFRESH_COOKIE_PATH}`,
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${Math.floor(REFRESH_COOKIE_MAX_AGE / 1000)}`,
  ]
  if (isProduction) {
    parts.push('Secure')
  }
  return parts.join('; ')
}

function serializeClearedCookie(isProduction) {
  const parts = [
    `${REFRESH_COOKIE_NAME}=`,
    `Path=${REFRESH_COOKIE_PATH}`,
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
  ]
  if (isProduction) {
    parts.push('Secure')
  }
  return parts.join('; ')
}

function sendSession(response, session, isProduction, status = 200) {
  response.setHeader(
    'Set-Cookie',
    serializeRefreshCookie(session.refreshToken, isProduction),
  )
  return response.status(status).json({
    success: true,
    data: {
      accessToken: session.accessToken,
      user: session.user,
    },
  })
}

export function createAuthRouter({
  resolveAuthService,
  repository,
  config,
  loginRateLimiter = createLoginRateLimiter(),
} = {}) {
  const router = Router()
  let authService = null
  let authRepository = repository ?? null
  const getConfig = () => config ?? getEnvironment()
  const getRepository = () => {
    if (!authRepository) {
      authRepository = createAuthRepository(getDatabasePool())
    }
    return authRepository
  }
  const getService = () => {
    if (resolveAuthService) {
      return resolveAuthService()
    }
    if (!authService) {
      authService = createAuthService({
        repository: getRepository(),
        jwtAccessSecret: getConfig().jwtAccessSecret,
      })
    }
    return authService
  }
  const trustedOrigin = (request, response, next) =>
    requireTrustedOrigin(getConfig().clientOrigin)(request, response, next)
  const authenticate = createAuthenticate(getService)

  router.post('/login', loginRateLimiter, trustedOrigin, async (request, response) => {
    const session = await getService().login(request.body)
    return sendSession(response, session, getConfig().nodeEnv === 'production')
  })

  router.post('/register', trustedOrigin, async (request, response) => {
    const session = await getService().register(request.body)
    return sendSession(response, session, getConfig().nodeEnv === 'production', 201)
  })

  router.post('/refresh', trustedOrigin, async (request, response, next) => {
    try {
      const session = await getService().refresh(
        readCookie(request, REFRESH_COOKIE_NAME),
      )
      return sendSession(response, session, getConfig().nodeEnv === 'production')
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        response.setHeader(
          'Set-Cookie',
          serializeClearedCookie(getConfig().nodeEnv === 'production'),
        )
      }
      return next(error)
    }
  })

  router.post('/logout', trustedOrigin, async (request, response) => {
    response.setHeader(
      'Set-Cookie',
      serializeClearedCookie(getConfig().nodeEnv === 'production'),
    )
    await getService().logout(readCookie(request, REFRESH_COOKIE_NAME))
    return response.json({
      success: true,
      data: { loggedOut: true },
    })
  })

  router.get('/me', authenticate, (request, response) =>
    response.json({ success: true, data: { user: request.user } }),
  )

  return router
}

export default createAuthRouter()
