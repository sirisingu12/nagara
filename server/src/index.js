import { closeDatabasePool, checkDatabaseConnection } from './config/database.js'
import { getEnvironment } from './config/env.js'
import app from './app.js'

const config = getEnvironment()

const server = app.listen(config.port, () => {
  console.log(`Nagara API listening on http://localhost:${config.port}`)
})

try {
  await checkDatabaseConnection()
  console.log('Database connectivity check passed.')
} catch (error) {
  console.error('Database connectivity check failed; health endpoint will report it.', {
    code: error.code || 'UNKNOWN',
  })
}

async function shutdown(signal) {
  console.log(`${signal} received; shutting down.`)
  server.close(async (error) => {
    if (error) {
      console.error('HTTP server shutdown failed.')
      process.exitCode = 1
    }

    try {
      await closeDatabasePool()
    } catch {
      console.error('Database pool shutdown failed.')
      process.exitCode = 1
    }
  })
}

process.once('SIGINT', () => shutdown('SIGINT'))
process.once('SIGTERM', () => shutdown('SIGTERM'))
