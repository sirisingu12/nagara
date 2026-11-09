import { API_ERROR_CODES, ROLES } from '../../../shared/constants.js'
import { ApiError } from '../utils/apiError.js'

function getBearerToken(header) {
  if (typeof header !== 'string') {
    return null
  }
  const match = header.match(/^Bearer ([^\s]+)$/i)
  return match?.[1] ?? null
}

export function createAuthenticate(resolveAuthService) {
  return async function authenticate(request, response, next) {
    try {
      const token = getBearerToken(request.get('authorization'))
      if (!token) {
        throw new ApiError(401, API_ERROR_CODES.UNAUTHORIZED, 'Authentication is required.')
      }
      request.user = await resolveAuthService().authenticateAccessToken(token)
      return next()
    } catch (error) {
      return next(error)
    }
  }
}

export function requireRoles(...roles) {
  return function authorizeRole(request, response, next) {
    if (!request.user) {
      return next(
        new ApiError(401, API_ERROR_CODES.UNAUTHORIZED, 'Authentication is required.'),
      )
    }
    if (!roles.includes(request.user.role)) {
      return next(
        new ApiError(403, API_ERROR_CODES.FORBIDDEN, 'You do not have permission to perform this action.'),
      )
    }
    return next()
  }
}

export function canAccessMunicipality(user, municipalityId) {
  if (
    !user ||
    ![ROLES.OFFICER, ROLES.WORKER].includes(user.role) ||
    !/^[1-9]\d*$/.test(String(municipalityId ?? ''))
  ) {
    return false
  }
  return Array.isArray(user.municipalities) && user.municipalities.some(
    (municipality) => String(municipality.id) === String(municipalityId),
  )
}

export function canAccessWorkerDepartment(user, municipalityId, departmentId) {
  return (
    user?.role === ROLES.WORKER &&
    user.department?.id !== undefined &&
    String(user.department.id) === String(departmentId) &&
    String(user.department.municipalityId) === String(municipalityId) &&
    canAccessMunicipality(user, municipalityId)
  )
}

export function requireMunicipalityAccess(getMunicipalityId) {
  return function requireScope(request, response, next) {
    const municipalityId = getMunicipalityId(request)
    if (!canAccessMunicipality(request.user, municipalityId)) {
      return next(
        new ApiError(403, API_ERROR_CODES.FORBIDDEN, 'This municipality is outside your assigned jurisdiction.'),
      )
    }
    return next()
  }
}

export function requireWorkerDepartmentAccess(getScope) {
  return function requireWorkerDepartment(request, response, next) {
    const { municipalityId, departmentId } = getScope(request)
    if (!canAccessWorkerDepartment(request.user, municipalityId, departmentId)) {
      return next(
        new ApiError(403, API_ERROR_CODES.FORBIDDEN, 'This task is outside your assigned municipality or department.'),
      )
    }
    return next()
  }
}
