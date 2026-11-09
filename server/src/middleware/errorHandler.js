import { API_ERROR_CODES } from '../../../shared/constants.js'

export default function errorHandler(error, request, response, next) {
  if (response.headersSent) {
    return next(error)
  }

  const status =
    Number.isInteger(error.status) && error.status >= 400 && error.status <= 599
      ? error.status
      : 500
  const knownCodes = new Set(Object.values(API_ERROR_CODES))
  const code = error.name === 'ApiError' && knownCodes.has(error.code)
    ? error.code
    : status === 400
      ? API_ERROR_CODES.VALIDATION_ERROR
      : status === 401
        ? API_ERROR_CODES.UNAUTHORIZED
        : status === 403
          ? API_ERROR_CODES.FORBIDDEN
          : status === 404
            ? API_ERROR_CODES.NOT_FOUND
            : status === 409
              ? API_ERROR_CODES.CONFLICT
              : status === 429
                ? API_ERROR_CODES.TOO_MANY_REQUESTS
                : status === 503
                  ? API_ERROR_CODES.SERVICE_UNAVAILABLE
                  : API_ERROR_CODES.INTERNAL_SERVER_ERROR

  if (status >= 500) {
    console.error('Request failed.', { status, code })
  }

  return response.status(status).json({
    success: false,
    error: {
      code,
      message: error.name === 'ApiError'
        ? error.message
        : status === 400
          ? 'The request could not be understood.'
          : status === 413
            ? 'The request body is too large.'
            : status === 404
              ? 'The requested resource was not found.'
              : status === 503
                ? 'The service is temporarily unavailable.'
                : 'An unexpected error occurred.',
      details: error.name === 'ApiError' && Array.isArray(error.details)
        ? error.details
        : [],
    },
  })
}
