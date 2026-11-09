import test from 'node:test'
import assert from 'node:assert/strict'
import { parseEnvironment } from '../src/config/env.js'

const validEnvironment = {
  DB_HOST: '127.0.0.1',
  DB_PORT: '3306',
  DB_USER: 'nagara_user',
  DB_PASSWORD: '',
  DB_NAME: 'nagara',
  JWT_ACCESS_SECRET: 'test-secret-with-at-least-32-characters',
}

test('parses valid database settings and defaults the application port', () => {
  const config = parseEnvironment(validEnvironment)

  assert.equal(config.port, 4000)
  assert.equal(config.database.host, '127.0.0.1')
  assert.equal(config.database.port, 3306)
  assert.equal(config.database.user, 'nagara_user')
  assert.equal(config.database.password, '')
  assert.equal(config.database.database, 'nagara')
  assert.equal(config.clientOrigin, 'http://localhost:5173')
})

test('reports missing variables by name without exposing values', () => {
  assert.throws(
    () => parseEnvironment({ DB_PASSWORD: 'do-not-display-this' }),
    (error) => {
      assert.match(error.message, /DB_HOST/)
      assert.doesNotMatch(error.message, /do-not-display-this/)
      return true
    },
  )
})

test('rejects invalid database and application ports', () => {
  assert.throws(
    () => parseEnvironment({ ...validEnvironment, DB_PORT: '3306x' }),
    /DB_PORT must be an integer/,
  )
  assert.throws(
    () => parseEnvironment({ ...validEnvironment, PORT: '70000' }),
    /PORT must be an integer/,
  )
})

test('requires a strong access-token secret and an exact client origin', () => {
  assert.throws(
    () => parseEnvironment({ ...validEnvironment, JWT_ACCESS_SECRET: 'short' }),
    /JWT_ACCESS_SECRET must be a private value/,
  )
  assert.throws(
    () => parseEnvironment({
      ...validEnvironment,
      JWT_ACCESS_SECRET: 'replace-with-at-least-32-random-characters',
    }),
    /JWT_ACCESS_SECRET must be a private value/,
  )
  assert.throws(
    () => parseEnvironment({ ...validEnvironment, CLIENT_ORIGIN: 'https://example.com/path' }),
    /CLIENT_ORIGIN must be a valid HTTP or HTTPS origin/,
  )
})
