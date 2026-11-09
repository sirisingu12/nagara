import { API_ERROR_CODES } from '../../../shared/constants.js'
import { ApiError } from '../utils/apiError.js'

const allowedMethods = 'GET,POST,PATCH,PUT,DELETE,OPTIONS'
const allowedHeaders = 'Authorization,Content-Type'

export function createCorsMiddleware(resolveClientOrigin) {
  return function cors(request, response, next) {
    const origin = request.get('origin')
    response.vary('Origin')

    if (!origin) {
      return request.method === 'OPTIONS' ? response.sendStatus(204) : next()
    }

    const clientOrigin = resolveClientOrigin()
    if (origin && origin !== clientOrigin) {
      return next(
        new ApiError(
          403,
          API_ERROR_CODES.FORBIDDEN,
          'This origin is not allowed to access the API.',
        ),
      )
    }

    if (origin === clientOrigin) {
      response.setHeader('Access-Control-Allow-Origin', clientOrigin)
      response.setHeader('Access-Control-Allow-Credentials', 'true')
      response.setHeader('Access-Control-Allow-Methods', allowedMethods)
      response.setHeader('Access-Control-Allow-Headers', allowedHeaders)
    }

    if (request.method === 'OPTIONS') {
      return response.sendStatus(204)
    }

    return next()
  }
}
