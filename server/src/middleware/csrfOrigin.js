import { API_ERROR_CODES } from '../../../shared/constants.js'
import { ApiError } from '../utils/apiError.js'

function getRequestOrigin(request) {
  const origin = request.get('origin')
  if (origin) {
    return origin
  }

  const referer = request.get('referer')
  if (!referer) {
    return null
  }
  try {
    return new URL(referer).origin
  } catch {
    return null
  }
}

export function requireTrustedOrigin(clientOrigin) {
  return function validateOrigin(request, response, next) {
    if (getRequestOrigin(request) !== clientOrigin) {
      return next(
        new ApiError(
          403,
          API_ERROR_CODES.FORBIDDEN,
          'A trusted client origin is required for this request.',
        ),
      )
    }
    return next()
  }
}
