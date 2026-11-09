import { API_ERROR_CODES } from '../../../shared/constants.js'

export default function errorHandler(error, request, response, next) {
  if (response.headersSent) {
    return next(error)
  }

  const status =
    Number.isInteger(error.status) && error.status >= 400 && error.status <= 599
      ? error.status
      : 500
  const code =
    status === 404
      ? API_ERROR_CODES.NOT_FOUND
      : status === 503
        ? API_ERROR_CODES.SERVICE_UNAVAILABLE
        : API_ERROR_CODES.INTERNAL_SERVER_ERROR

  console.error('Request failed.', { status, code })

  return response.status(status).json({
    success: false,
    error: {
      code,
      message:
        status === 404
          ? 'The requested resource was not found.'
          : status === 503
            ? 'The service is temporarily unavailable.'
            : 'An unexpected error occurred.',
      details: [],
    },
  })
}
