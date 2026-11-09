import { API_ERROR_CODES } from '../../../shared/constants.js'

export class ApiError extends Error {
  constructor(status, code, message, details = []) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

export function validationError(details) {
  return new ApiError(
    400,
    API_ERROR_CODES.VALIDATION_ERROR,
    'Please check the provided information.',
    details,
  )
}
