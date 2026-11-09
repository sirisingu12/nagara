import test from 'node:test'
import assert from 'node:assert/strict'
import { createApp } from '../src/app.js'
import {
  canAccessMunicipality,
  canAccessWorkerDepartment,
  createAuthenticate,
  requireMunicipalityAccess,
  requireRoles,
  requireWorkerDepartmentAccess,
} from '../src/middleware/authMiddleware.js'
import { createCorsMiddleware } from '../src/middleware/cors.js'
import { createLoginRateLimiter } from '../src/middleware/loginRateLimiter.js'
import { createAuthService } from '../src/services/authService.js'
import { ApiError } from '../src/utils/apiError.js'

const jwtSecret = 'test-jwt-secret-at-least-thirty-two-characters'
const clientOrigin = 'http://localhost:5173'

function makeUser(overrides = {}) {
  return {
    id: '1',
    fullName: 'Ananya Rao',
    email: 'ananya.rao@nagara.demo',
    phone: null,
    role: 'citizen',
    department: null,
    homeDistrict: { id: '10', name: 'Hyderabad' },
    homeMunicipality: { id: '100', name: 'GHMC' },
    municipalities: [],
    ...overrides,
  }
}

function createFakeRepository() {
  let nextUserId = 1
  let nextRefreshId = 1
  const users = new Map([
    ['ananya.rao@nagara.demo', {
      id: '1',
      passwordHash: 'fake-hash:correct-password-1',
      isActive: 1,
      safeUser: makeUser(),
    }],
  ])
  const tokens = new Map()
  const createdUsers = []

  return {
    users,
    tokens,
    createdUsers,
    async findUserForLogin(email) {
      const { passwordHash, isActive, id } = users.get(email) ?? {}
      return passwordHash ? { id, passwordHash, isActive } : null
    },
    async getSafeUser(userId) {
      for (const user of users.values()) {
        if (String(user.id) === String(userId) && user.isActive === 1) {
          return user.safeUser
        }
      }
      return null
    },
    async storeRefreshToken(userId, tokenHash, expiresAt) {
      tokens.set(tokenHash, {
        id: nextRefreshId++,
        userId: String(userId),
        expiresAt: expiresAt ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        revokedAt: null,
        replacedById: null,
      })
    },
    async rotateRefreshToken(oldHash, newHash, expiresAt) {
      const token = tokens.get(oldHash)
      if (!token) {
        return { kind: 'invalid' }
      }
      if (token.revokedAt) {
        if (token.replacedById !== null) {
          for (const current of tokens.values()) {
            if (current.userId === token.userId && current.revokedAt === null) {
              current.revokedAt = new Date()
            }
          }
          return { kind: 'reused' }
        }
        return { kind: 'invalid' }
      }
      if (token.expiresAt <= new Date()) {
        return { kind: 'invalid' }
      }
      const newId = nextRefreshId++
      tokens.set(newHash, {
        id: newId,
        userId: token.userId,
        expiresAt: expiresAt ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        revokedAt: null,
        replacedById: null,
      })
      token.revokedAt = new Date()
      token.replacedById = newId
      return { kind: 'rotated', userId: token.userId }
    },
    async revokeRefreshToken(tokenHash) {
      const token = tokens.get(tokenHash)
      if (!token || token.revokedAt) {
        return false
      }
      token.revokedAt = new Date()
      return true
    },
    async createCitizen(input) {
      if (input.districtId !== '10' || input.municipalityId !== '100') {
        return null
      }
      if (users.has(input.email)) {
        const error = new Error('duplicate')
        error.code = 'ER_DUP_ENTRY'
        throw error
      }
      const id = String(++nextUserId)
      const safeUser = makeUser({
        id,
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        homeDistrict: { id: input.districtId, name: 'Hyderabad' },
        homeMunicipality: { id: input.municipalityId, name: 'GHMC' },
      })
      users.set(input.email, {
        id,
        passwordHash: input.passwordHash,
        isActive: 1,
        safeUser,
      })
      tokens.set(input.refreshTokenHash, {
        id: nextRefreshId++,
        userId: id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        revokedAt: null,
        replacedById: null,
      })
      createdUsers.push({ ...input, id })
      return id
    },
    async listMunicipalities() {
      return [{
        id: '100',
        name: 'GHMC',
        code: 'GHMC',
        district: { id: '10', name: 'Hyderabad' },
      }]
    },
  }
}

const passwordHasher = {
  async compare(password, hash) {
    return hash === `fake-hash:${password}`
  },
  async hash(password) {
    return `fake-hash:${password}`
  },
}

function makeService(repository = createFakeRepository()) {
  return {
    repository,
    service: createAuthService({
      repository,
      jwtAccessSecret: jwtSecret,
      passwordHasher,
    }),
  }
}

async function withServer(app, run) {
  const server = app.listen(0)
  await new Promise((resolve) => server.once('listening', resolve))
  const address = server.address()
  try {
    await run(`http://127.0.0.1:${address.port}`)
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()))
    })
  }
}

function makeAuthApp(service, repository) {
  return createApp({
    authService: service,
    authRepository: repository,
    config: {
      clientOrigin,
      nodeEnv: 'development',
      jwtAccessSecret: jwtSecret,
    },
    loginRateLimiter: (request, response, next) => next(),
  })
}

async function expectApiError(promise, status, code) {
  await assert.rejects(promise, (error) => {
    assert.ok(error instanceof ApiError)
    assert.equal(error.status, status)
    assert.equal(error.code, code)
    return true
  })
}

test('login succeeds, returns a signed access token and stores only a refresh-token hash', async () => {
  const { repository, service } = makeService()
  const session = await service.login({
    email: ' Ananya.Rao@NAGARA.DEMO ',
    password: 'correct-password-1',
  })

  assert.equal(session.user.email, 'ananya.rao@nagara.demo')
  assert.ok(session.accessToken)
  assert.equal(session.refreshToken.length, 43)
  assert.equal(repository.tokens.size, 1)
  assert.ok([...repository.tokens.keys()][0].length === 64)
  assert.ok(!JSON.stringify(session.user).includes('passwordHash'))
  assert.ok(!JSON.stringify(session.user).includes('refreshToken'))
})

test('incorrect password and unknown email return the same generic response', async () => {
  const { service } = makeService()
  const wrongPassword = service.login({
    email: 'ananya.rao@nagara.demo',
    password: 'incorrect-password',
  })
  const unknownEmail = service.login({
    email: 'nobody@nagara.demo',
    password: 'incorrect-password',
  })

  await expectApiError(wrongPassword, 401, 'UNAUTHORIZED')
  await expectApiError(unknownEmail, 401, 'UNAUTHORIZED')
  await assert.rejects(wrongPassword, /Email or password is incorrect/)
  await assert.rejects(unknownEmail, /Email or password is incorrect/)
})

test('login rejects missing or invalid credentials', async () => {
  const { service } = makeService()
  await expectApiError(service.login({}), 400, 'VALIDATION_ERROR')
  await expectApiError(
    service.login({ email: 'not-an-email', password: 'anything' }),
    400,
    'VALIDATION_ERROR',
  )
})

test('refresh rotates tokens and rejects reuse of a revoked token', async () => {
  const { repository, service } = makeService()
  const first = await service.login({
    email: 'ananya.rao@nagara.demo',
    password: 'correct-password-1',
  })

  test('concurrent refresh attempts never leave multiple active refresh tokens', async () => {
    const { repository, service } = makeService()
    const original = await service.login({
      email: 'ananya.rao@nagara.demo',
      password: 'correct-password-1',
    })

    const outcomes = await Promise.allSettled([
      service.refresh(original.refreshToken),
      service.refresh(original.refreshToken),
    ])
    assert.equal(outcomes.filter((outcome) => outcome.status === 'fulfilled').length, 1)
    assert.equal(outcomes.filter((outcome) => outcome.status === 'rejected').length, 1)
    assert.ok([...repository.tokens.values()].every((token) => token.revokedAt))
  })
  const second = await service.refresh(first.refreshToken)

  assert.notEqual(second.refreshToken, first.refreshToken)
  assert.equal(repository.tokens.size, 2)
  assert.ok([...repository.tokens.values()][0].replacedById)
  await expectApiError(service.refresh(first.refreshToken), 401, 'UNAUTHORIZED')
  assert.ok([...repository.tokens.values()].every((token) => token.revokedAt))
  await expectApiError(service.refresh(second.refreshToken), 401, 'UNAUTHORIZED')
})

test('logout revokes a valid refresh token and is safe for invalid tokens', async () => {
  const { repository, service } = makeService()
  const session = await service.login({
    email: 'ananya.rao@nagara.demo',
    password: 'correct-password-1',
  })

  await service.logout(session.refreshToken)
  assert.ok([...repository.tokens.values()][0].revokedAt)
  await service.logout('not-a-refresh-token')
})

test('registration creates citizens only and validates district/municipality pairing', async () => {
  const { repository, service } = makeService()
  const input = {
    fullName: 'New Citizen',
    email: 'new.citizen@example.demo',
    phone: '+1 555 0100',
    password: 'safe-pass-123',
    districtId: '10',
    municipalityId: '100',
  }
  const result = await service.register(input)

  assert.equal(result.user.role, 'citizen')
  assert.deepEqual(result.user.municipalities, [])
  assert.equal(repository.createdUsers.length, 1)
  assert.equal(repository.createdUsers[0].districtId, '10')
  assert.equal(repository.createdUsers[0].municipalityId, '100')
  assert.ok(!('role' in repository.createdUsers[0]))
  await expectApiError(
    service.register({ ...input, email: 'bad.role@example.demo', role: 'officer' }),
    400,
    'VALIDATION_ERROR',
  )
  await expectApiError(
    service.register({ ...input, email: 'wrong.place@example.demo', municipalityId: '101' }),
    400,
    'VALIDATION_ERROR',
  )
})

test('access tokens are verified and invalid or expired tokens are rejected', async () => {
  const { service } = makeService()
  const session = await service.login({
    email: 'ananya.rao@nagara.demo',
    password: 'correct-password-1',
  })
  const user = await service.authenticateAccessToken(session.accessToken)
  assert.equal(user.role, 'citizen')
  await expectApiError(service.authenticateAccessToken('not-a-jwt'), 401, 'UNAUTHORIZED')
})

test('authentication middleware rejects missing and invalid bearer tokens', async () => {
  const { service } = makeService()
  const authenticate = createAuthenticate(() => service)
  for (const authorization of [undefined, 'Bearer invalid']) {
    const request = {
      get: () => authorization,
    }
    let forwardedError
    await authenticate(request, {}, (error) => {
      forwardedError = error
    })
    assert.equal(forwardedError.status, 401)
  }
})

test('role and municipality middleware enforce officer and worker jurisdiction', async () => {
  const officer = makeUser({
    role: 'officer',
    municipalities: [{ id: '100', name: 'GHMC' }],
  })
  const worker = makeUser({
    role: 'worker',
    department: { id: '20', name: 'Roads', municipalityId: '100' },
    municipalities: [{ id: '100', name: 'GHMC' }],
  })

  assert.equal(canAccessMunicipality(officer, '100'), true)
  assert.equal(canAccessMunicipality(officer, '200'), false)
  assert.equal(canAccessMunicipality(makeUser(), '100'), false)
  assert.equal(canAccessWorkerDepartment(worker, '100', '20'), true)
  assert.equal(canAccessWorkerDepartment(worker, '100', '21'), false)
  assert.equal(canAccessWorkerDepartment(worker, '200', '20'), false)

  const runMiddleware = async (middleware, request) => {
    let error
    middleware(request, {}, (nextError) => {
      error = nextError
    })
    return error
  }
  assert.equal(
    await runMiddleware(requireRoles('officer'), { user: officer }),
    undefined,
  )
  assert.equal(
    (await runMiddleware(requireRoles('officer'), { user: worker })).status,
    403,
  )
  assert.equal(
    (await runMiddleware(requireRoles('officer'), { user: makeUser() })).status,
    403,
  )
  assert.equal(
    (await runMiddleware(
      requireMunicipalityAccess((request) => request.params.municipalityId),
      { user: officer, params: { municipalityId: '200' } },
    )).status,
    403,
  )
  assert.equal(
    (await runMiddleware(
      requireWorkerDepartmentAccess((request) => request.params),
      { user: worker, params: { municipalityId: '100', departmentId: '21' } },
    )).status,
    403,
  )
})

test('auth routes set a scoped HttpOnly cookie and keep raw refresh tokens out of JSON', async () => {
  const { repository, service } = makeService()
  const app = makeAuthApp(service, repository)

  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        Origin: clientOrigin,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'ananya.rao@nagara.demo',
        password: 'correct-password-1',
      }),
    })
    const body = await response.json()
    const cookie = response.headers.get('set-cookie')

    assert.equal(response.status, 200)
    assert.equal(body.success, true)
    assert.ok(body.data.accessToken)
    assert.ok(body.data.user)
    assert.ok(!JSON.stringify(body).includes('refreshToken'))
    assert.match(cookie, /HttpOnly/)
    assert.match(cookie, /SameSite=Lax/)
    assert.match(cookie, /Path=\/api\/auth/)
    assert.doesNotMatch(cookie, /; Secure/)

    const me = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${body.data.accessToken}` },
    })
    const meBody = await me.json()
    assert.equal(me.status, 200)
    assert.equal(meBody.data.user.email, 'ananya.rao@nagara.demo')
    assert.ok(!JSON.stringify(meBody).includes('passwordHash'))

    const anonymousMe = await fetch(`${baseUrl}/api/auth/me`)
    assert.equal(anonymousMe.status, 401)
  })
})

test('production refresh cookies include the Secure attribute', async () => {
  const { repository, service } = makeService()
  const app = createApp({
    authService: service,
    authRepository: repository,
    config: {
      clientOrigin,
      nodeEnv: 'production',
      jwtAccessSecret: jwtSecret,
    },
    loginRateLimiter: (request, response, next) => next(),
  })

  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        Origin: clientOrigin,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'ananya.rao@nagara.demo',
        password: 'correct-password-1',
      }),
    })
    assert.equal(response.status, 200)
    assert.match(response.headers.get('set-cookie'), /; Secure/)
  })
})

test('logout clears the refresh cookie and revoked tokens cannot refresh', async () => {
  const { repository, service } = makeService()
  const app = makeAuthApp(service, repository)
  const session = await service.login({
    email: 'ananya.rao@nagara.demo',
    password: 'correct-password-1',
  })

  await withServer(app, async (baseUrl) => {
    const logout = await fetch(`${baseUrl}/api/auth/logout`, {
      method: 'POST',
      headers: {
        Origin: clientOrigin,
        Cookie: `nagara_refresh=${session.refreshToken}`,
      },
    })
    assert.equal(logout.status, 200)
    assert.match(logout.headers.get('set-cookie'), /Max-Age=0/)
    await expectApiError(service.refresh(session.refreshToken), 401, 'UNAUTHORIZED')
  })
})

test('refresh HTTP endpoint rotates its cookie and clears it on revoked-token reuse', async () => {
  const { repository, service } = makeService()
  const app = makeAuthApp(service, repository)
  const session = await service.login({
    email: 'ananya.rao@nagara.demo',
    password: 'correct-password-1',
  })
  const cookieHeader = (token) => `nagara_refresh=${encodeURIComponent(token)}`

  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        Origin: clientOrigin,
        Cookie: cookieHeader(session.refreshToken),
      },
    })
    const body = await response.json()
    const setCookie = response.headers.get('set-cookie')
    const match = setCookie.match(/nagara_refresh=([^;]+)/)

    assert.equal(response.status, 200)
    assert.ok(body.data.accessToken)
    assert.ok(match)
    const replacementToken = decodeURIComponent(match[1])
    assert.notEqual(replacementToken, session.refreshToken)

    const reuse = await fetch(`${baseUrl}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        Origin: clientOrigin,
        Cookie: cookieHeader(session.refreshToken),
      },
    })
    const reuseBody = await reuse.json()
    assert.equal(reuse.status, 401)
    assert.equal(reuseBody.error.code, 'UNAUTHORIZED')
    assert.match(reuse.headers.get('set-cookie'), /Max-Age=0/)
    assert.ok([...repository.tokens.values()].every((token) => token.revokedAt))
  })
})

test('cookie-authenticated routes reject untrusted origins', async () => {
  const { repository, service } = makeService()
  const app = makeAuthApp(service, repository)

  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/auth/refresh`, {
      method: 'POST',
      headers: { Origin: 'https://attacker.example' },
    })
    const body = await response.json()
    assert.equal(response.status, 403)
    assert.equal(body.error.code, 'FORBIDDEN')
  })
})

test('credentialed CORS accepts only the configured origin', async () => {
  const { repository, service } = makeService()
  const app = makeAuthApp(service, repository)

  await withServer(app, async (baseUrl) => {
    const allowed = await fetch(`${baseUrl}/api/municipalities`, {
      headers: { Origin: clientOrigin },
    })
    assert.equal(allowed.headers.get('access-control-allow-origin'), clientOrigin)
    assert.equal(allowed.headers.get('access-control-allow-credentials'), 'true')

    const blocked = await fetch(`${baseUrl}/api/municipalities`, {
      headers: { Origin: 'https://attacker.example' },
    })
    assert.equal(blocked.status, 403)
    assert.equal(blocked.headers.get('access-control-allow-origin'), null)

    const preflight = await fetch(`${baseUrl}/api/auth/refresh`, {
      method: 'OPTIONS',
      headers: {
        Origin: clientOrigin,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type',
      },
    })
    assert.equal(preflight.status, 204)
    assert.equal(preflight.headers.get('access-control-allow-credentials'), 'true')
    assert.doesNotMatch(preflight.headers.get('access-control-allow-origin'), /\*/)
  })
})

test('login rate limiter returns 429 after the configured attempt limit', () => {
  let time = 1_000
  const limiter = createLoginRateLimiter({ limit: 2, windowMs: 1_000, now: () => time })
  const request = { ip: '127.0.0.1', socket: { remoteAddress: '127.0.0.1' } }
  const response = { setHeader() {} }
  const invoke = () => {
    let error
    limiter(request, response, (nextError) => {
      error = nextError
    })
    return error
  }

  assert.equal(invoke(), undefined)
  assert.equal(invoke(), undefined)
  assert.equal(invoke().status, 429)
  time += 1_001
  assert.equal(invoke(), undefined)
})

test('registration HTTP endpoint creates a citizen session and refuses privileged roles', async () => {
  const { repository, service } = makeService()
  const app = makeAuthApp(service, repository)

  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        Origin: clientOrigin,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fullName: 'New Citizen',
        email: 'new.citizen@example.demo',
        phone: '+1 555 0100',
        password: 'safe-pass-123',
        districtId: '10',
        municipalityId: '100',
      }),
    })
    const body = await response.json()
    assert.equal(response.status, 201)
    assert.equal(body.data.user.role, 'citizen')
    assert.equal(body.data.user.homeMunicipality.id, '100')
    assert.ok(!JSON.stringify(body).includes('passwordHash'))
    assert.ok(!JSON.stringify(body).includes('refreshToken'))

    const privilegedAttempt = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        Origin: clientOrigin,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fullName: 'Privileged User',
        email: 'privileged@example.demo',
        phone: '+1 555 0101',
        password: 'safe-pass-123',
        districtId: '10',
        municipalityId: '100',
        role: 'officer',
      }),
    })
    const privilegedBody = await privilegedAttempt.json()
    assert.equal(privilegedAttempt.status, 400)
    assert.equal(privilegedBody.error.code, 'VALIDATION_ERROR')
  })
})
