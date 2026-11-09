import { getEnvironment } from '../src/config/env.js'
import { checkDatabaseConnection, closeDatabasePool } from '../src/config/database.js'

getEnvironment()

try {
  await checkDatabaseConnection()
  console.log('Database connectivity check passed.')
} catch (error) {
  console.error('Database connectivity check failed.', {
    code: error.code || 'UNKNOWN',
  })
  process.exitCode = 1
} finally {
  await closeDatabasePool()
}
