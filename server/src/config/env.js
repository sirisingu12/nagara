import dotenv from 'dotenv'
import { fileURLToPath } from 'node:url'

const rootEnvPath = fileURLToPath(new URL('../../../.env', import.meta.url))
const dotenvResult = dotenv.config({ path: rootEnvPath })

if (dotenvResult.error && dotenvResult.error.code !== 'ENOENT') {
  throw new Error('Could not load the root .env file.')
}

function parsePort(value, name, fallback) {
  const port = value === undefined || value === '' ? fallback : Number(value)

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`${name} must be an integer between 1 and 65535.`)
  }

  return port
}

export function parseEnvironment(environment) {
  const missing = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME']
    .filter((name) => environment[name] === undefined)

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}.`,
    )
  }

  if (!environment.DB_HOST.trim()) {
    throw new Error('DB_HOST must not be empty.')
  }

  if (!environment.DB_USER.trim()) {
    throw new Error('DB_USER must not be empty.')
  }

  if (!environment.DB_NAME.trim()) {
    throw new Error('DB_NAME must not be empty.')
  }

  return Object.freeze({
    port: parsePort(environment.PORT, 'PORT', 4000),
    nodeEnv: environment.NODE_ENV || 'development',
    database: Object.freeze({
      host: environment.DB_HOST.trim(),
      port: parsePort(environment.DB_PORT, 'DB_PORT'),
      user: environment.DB_USER.trim(),
      password: environment.DB_PASSWORD,
      database: environment.DB_NAME.trim(),
    }),
  })
}

export function getEnvironment() {
  try {
    return parseEnvironment(process.env)
  } catch (error) {
    throw new Error(
      `Invalid environment configuration: ${error.message} Check the root .env.example.`,
    )
  }
}
