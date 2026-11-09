import { createHash, randomBytes } from 'node:crypto'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { API_ERROR_CODES, ROLES } from '../../../shared/constants.js'
import { ApiError, validationError } from '../utils/apiError.js'

const ACCESS_TOKEN_TTL = '2h'
const BCRYPT_COST = 12

let dummyHashPromise

function getDummyHash() {
  if (!dummyHashPromise) {
    dummyHashPromise = bcrypt.hash(randomBytes(32).toString('hex'), BCRYPT_COST)
  }
  return dummyHashPromise
}

function hashRefreshToken(token) {
  return createHash('sha256').update(token).digest('hex')
}

function normalizeEmail(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

function validateCredentials(email, password) {
  const details = []
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    details.push({ field: 'email', message: 'Enter a valid email address.' })
  }
  if (
    typeof password !== 'string' ||
    password.length === 0 ||
    Buffer.byteLength(password, 'utf8') > 72
  ) {
    details.push({ field: 'password', message: 'Enter a valid password.' })
  }
  if (details.length > 0) {
    throw validationError(details)
  }
}

function validateRegistration(body) {
  const fullName = typeof body?.fullName === 'string' ? body.fullName.trim() : ''
  const email = normalizeEmail(body?.email)
  const phone = typeof body?.phone === 'string' ? body.phone.trim() : ''
  const password = body?.password
  const districtId = body?.districtId
  const municipalityId = body?.municipalityId
  const details = []

  if (fullName.length < 2 || fullName.length > 160) {
    details.push({ field: 'fullName', message: 'Name must be between 2 and 160 characters.' })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    details.push({ field: 'email', message: 'Enter a valid email address.' })
  }
  if (phone.length < 7 || phone.length > 32 || !/^[+()\d .-]+$/.test(phone)) {
    details.push({ field: 'phone', message: 'Enter a valid phone number.' })
  }
  if (
    typeof password !== 'string' ||
    password.length < 8 ||
    Buffer.byteLength(password, 'utf8') > 72 ||
    !/[A-Za-z]/.test(password) ||
    !/\d/.test(password)
  ) {
    details.push({
      field: 'password',
      message: 'Password must be 8–72 characters and include at least one letter and one number.',
    })
  }
  if (!/^[1-9]\d*$/.test(String(districtId ?? ''))) {
    details.push({ field: 'districtId', message: 'Select a valid district.' })
  }
  if (!/^[1-9]\d*$/.test(String(municipalityId ?? ''))) {
    details.push({ field: 'municipalityId', message: 'Select a valid municipality.' })
  }
  if (body?.role !== undefined && body.role !== ROLES.CITIZEN) {
    details.push({ field: 'role', message: 'Public registration is limited to citizens.' })
  }
  if (details.length > 0) {
    throw validationError(details)
  }

  return {
    fullName,
    email,
    phone,
    password,
    districtId: String(districtId),
    municipalityId: String(municipalityId),
  }
}

function invalidCredentialsError() {
  return new ApiError(
    401,
    API_ERROR_CODES.UNAUTHORIZED,
    'Email or password is incorrect.',
  )
}

function invalidSessionError() {
  return new ApiError(
    401,
    API_ERROR_CODES.UNAUTHORIZED,
    'Your session is invalid or has expired. Please sign in again.',
  )
}

function createAccessToken(userId, secret) {
  return jwt.sign(
    { sub: String(userId) },
    secret,
    {
      algorithm: 'HS256',
      audience: 'nagara-client',
      expiresIn: ACCESS_TOKEN_TTL,
      issuer: 'nagara-api',
    },
  )
}

function createRefreshToken() {
  return randomBytes(32).toString('base64url')
}

export function createAuthService({ repository, jwtAccessSecret, passwordHasher = bcrypt }) {
  if (!repository || typeof jwtAccessSecret !== 'string' || jwtAccessSecret.length < 32) {
    throw new Error('Auth service requires a repository and a secure JWT access secret.')
  }

  return {
    async login(body) {
      const email = normalizeEmail(body?.email)
      const password = body?.password
      validateCredentials(email, password)

      const user = await repository.findUserForLogin(email)
      const passwordHash = user?.passwordHash ?? await getDummyHash()
      const passwordMatches = await passwordHasher.compare(password, passwordHash)
      if (!user || Number(user.isActive) !== 1 || !passwordMatches) {
        throw invalidCredentialsError()
      }

      const refreshToken = createRefreshToken()
      await repository.storeRefreshToken(
        user.id,
        hashRefreshToken(refreshToken),
      )
      const safeUser = await repository.getSafeUser(user.id)
      if (!safeUser) {
        await repository.revokeRefreshToken(hashRefreshToken(refreshToken))
        throw invalidCredentialsError()
      }

      return {
        accessToken: createAccessToken(user.id, jwtAccessSecret),
        refreshToken,
        user: safeUser,
      }
    },

    async register(body) {
      const input = validateRegistration(body)
      const passwordHash = await passwordHasher.hash(input.password, BCRYPT_COST)
      const refreshToken = createRefreshToken()
      let userId
      try {
        userId = await repository.createCitizen({
          ...input,
          passwordHash,
          refreshTokenHash: hashRefreshToken(refreshToken),
        })
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          throw new ApiError(
            409,
            API_ERROR_CODES.CONFLICT,
            'An account with this email already exists.',
          )
        }
        throw error
      }

      if (!userId) {
        throw validationError([
          {
            field: 'municipalityId',
            message: 'The selected municipality does not belong to the selected district.',
          },
        ])
      }

      const safeUser = await repository.getSafeUser(userId)
      if (!safeUser) {
        throw new Error('Newly registered account could not be loaded.')
      }

      return {
        accessToken: createAccessToken(userId, jwtAccessSecret),
        refreshToken,
        user: safeUser,
      }
    },

    async refresh(refreshToken) {
      if (typeof refreshToken !== 'string' || !/^[A-Za-z0-9_-]{40,50}$/.test(refreshToken)) {
        throw invalidSessionError()
      }

      const replacementToken = createRefreshToken()
      const newHash = hashRefreshToken(replacementToken)
      const result = await repository.rotateRefreshToken(
        hashRefreshToken(refreshToken),
        newHash,
      )
      if (result.kind !== 'rotated') {
        throw invalidSessionError()
      }

      const safeUser = await repository.getSafeUser(result.userId)
      if (!safeUser) {
        await repository.revokeRefreshToken(newHash)
        throw invalidSessionError()
      }

      return {
        accessToken: createAccessToken(result.userId, jwtAccessSecret),
        refreshToken: replacementToken,
        user: safeUser,
      }
    },

    async logout(refreshToken) {
      if (typeof refreshToken === 'string' && /^[A-Za-z0-9_-]{40,50}$/.test(refreshToken)) {
        await repository.revokeRefreshToken(hashRefreshToken(refreshToken))
      }
    },

    async authenticateAccessToken(token) {
      if (typeof token !== 'string' || token.length === 0) {
        throw invalidSessionError()
      }
      let payload
      try {
        payload = jwt.verify(token, jwtAccessSecret, {
          algorithms: ['HS256'],
          audience: 'nagara-client',
          issuer: 'nagara-api',
        })
      } catch {
        throw invalidSessionError()
      }
      if (
        typeof payload !== 'object' ||
        typeof payload.sub !== 'string' ||
        !/^[1-9]\d*$/.test(payload.sub)
      ) {
        throw invalidSessionError()
      }

      const user = await repository.getSafeUser(payload.sub)
      if (!user) {
        throw invalidSessionError()
      }
      return user
    },
  }
}

export const authValidation = Object.freeze({
  validateCredentials,
  validateRegistration,
})
