import { fileURLToPath } from 'node:url'
import { closeDatabasePool, getDatabasePool } from '../src/config/database.js'
import { getEnvironment } from '../src/config/env.js'
import { loadMigrations, runMigrations } from '../src/database/migrationRunner.js'

const migrationsDirectory = fileURLToPath(
  new URL('../../database/migrations/', import.meta.url),
)

try {
  const { database } = getEnvironment()
  const migrations = await loadMigrations(migrationsDirectory)
  if (migrations.length === 0) {
    throw new Error('No versioned SQL migrations were found.')
  }

  await runMigrations(getDatabasePool(), database.database, migrations)
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
} finally {
  await closeDatabasePool()
}
