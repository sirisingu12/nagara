import { API_ERROR_CODES } from '../../../shared/constants.js'
import { ApiError } from '../utils/apiError.js'

export function createLoginRateLimiter({
  limit = 10,
  windowMs = 15 * 60 * 1000,
  now = Date.now,
} = {}) {
  const attempts = new Map()

  return function limitLoginAttempts(request, response, next) {
    const currentTime = now()
    const key = request.ip || request.socket.remoteAddress || 'unknown'
    let record = attempts.get(key)

    if (!record || record.resetAt <= currentTime) {
      record = { count: 0, resetAt: currentTime + windowMs }
      attempts.set(key, record)
    }

    record.count += 1
    if (record.count > limit) {
      response.setHeader(
        'Retry-After',
        String(Math.max(1, Math.ceil((record.resetAt - currentTime) / 1000))),
      )
      return next(
        new ApiError(
          429,
          API_ERROR_CODES.TOO_MANY_REQUESTS,
          'Too many sign-in attempts. Please try again later.',
        ),
      )
    }

    if (attempts.size > 10000) {
      for (const [attemptKey, attempt] of attempts) {
        if (attempt.resetAt <= currentTime) {
          attempts.delete(attemptKey)
        }
      }
    }
    return next()
  }
}
