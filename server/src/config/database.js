import mysql from 'mysql2/promise'
import { getEnvironment } from './env.js'

let pool

export function getDatabasePool() {
  if (!pool) {
    const { database } = getEnvironment()
    pool = mysql.createPool({
      ...database,
      connectionLimit: 10,
      maxIdle: 10,
      idleTimeout: 60_000,
      waitForConnections: true,
      queueLimit: 0,
      connectTimeout: 10_000,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      timezone: 'Z',
    })
  }

  return pool
}

export async function checkDatabaseConnection() {
  const [rows] = await getDatabasePool().query(
    'SELECT 1 AS database_connected',
  )

  return rows[0].database_connected === 1
}

export async function closeDatabasePool() {
  if (pool) {
    const activePool = pool
    pool = undefined
    await activePool.end()
  }
}
