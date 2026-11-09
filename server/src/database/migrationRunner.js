import { createHash } from 'node:crypto'
import { readdir, readFile } from 'node:fs/promises'
import { basename, join } from 'node:path'

const migrationNamePattern = /^\d{3,}_[a-z0-9_]+\.sql$/
const trackingTable = 'schema_migrations'

export async function loadMigrations(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const fileNames = entries
    .filter((entry) => entry.isFile() && migrationNamePattern.test(entry.name))
    .map((entry) => entry.name)
    .sort()

  const migrations = await Promise.all(
    fileNames.map(async (fileName) => {
      const sql = await readFile(join(directory, fileName), 'utf8')
      const statements = sql
        .split(';')
        .map((statement) => statement.trim())
        .filter(Boolean)

      if (statements.some((statement) => !/^CREATE TABLE\b/i.test(statement))) {
        throw new Error(
          `Migration ${fileName} contains an unsupported or destructive statement.`,
        )
      }

      const tableNames = statements.map((statement) => {
        const match = statement.match(
          /^CREATE TABLE\s+`?([a-zA-Z0-9_]+)`?\s*\(/i,
        )
        if (!match) {
          throw new Error(`Migration ${fileName} has an invalid CREATE TABLE statement.`)
        }
        return match[1]
      })

      return {
        version: basename(fileName, '.sql'),
        fileName,
        statements,
        tableNames,
        checksum: createHash('sha256').update(sql).digest('hex'),
      }
    }),
  )

  const versions = new Set(migrations.map((migration) => migration.version))
  if (versions.size !== migrations.length) {
    throw new Error('Migration filenames must have unique versions.')
  }

  return migrations
}

async function getSchemaObjects(connection, databaseName) {
  const [objects] = await connection.execute(
    `SELECT TABLE_NAME AS name, TABLE_TYPE AS type
     FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = ?
     ORDER BY TABLE_NAME`,
    [databaseName],
  )
  return objects
}

async function verifyTrackingTable(connection) {
  const [columns] = await connection.query(
    `SELECT COLUMN_NAME AS name
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
    [trackingTable],
  )
  const columnNames = new Set(columns.map((column) => column.name))
  if (!columnNames.has('version') || !columnNames.has('checksum') || !columnNames.has('applied_at')) {
    throw new Error('The schema_migrations table has an unexpected structure.')
  }
}

export async function runMigrations(pool, databaseName, migrations) {
  const connection = await pool.getConnection()

  try {
    let objects = await getSchemaObjects(connection, databaseName)
    const plannedTables = new Set([
      trackingTable,
      ...migrations.flatMap((migration) => migration.tableNames),
    ])
    const unexpectedObjects = objects.filter((object) => !plannedTables.has(object.name))

    if (unexpectedObjects.length > 0) {
      throw new Error(
        `Unexpected database objects found: ${unexpectedObjects.map((object) => object.name).join(', ')}.`,
      )
    }

    const trackerExists = objects.some(
      (object) => object.name === trackingTable && object.type === 'BASE TABLE',
    )
    if (objects.some((object) => object.name === trackingTable && object.type !== 'BASE TABLE')) {
      throw new Error('schema_migrations exists but is not a base table.')
    }

    if (!trackerExists && objects.length > 0) {
      throw new Error(
        'Database tables already exist without a migration history; no changes were applied.',
      )
    }

    await connection.query(
      `CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(190) NOT NULL,
        checksum CHAR(64) NOT NULL,
        applied_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (version)
      ) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`,
    )
    await verifyTrackingTable(connection)

    const [appliedRows] = await connection.query(
      'SELECT version, checksum FROM schema_migrations ORDER BY version',
    )
    const applied = new Map(
      appliedRows.map((row) => [row.version, row.checksum]),
    )
    const knownVersions = new Set(migrations.map((migration) => migration.version))

    for (const version of applied.keys()) {
      if (!knownVersions.has(version)) {
        throw new Error(`Applied migration ${version} has no matching migration file.`)
      }
    }

    const objectTypes = new Map(
      objects.map((object) => [object.name, object.type]),
    )
    for (const migration of migrations) {
      if (!applied.has(migration.version)) {
        continue
      }
      const missingTables = migration.tableNames.filter(
        (name) => objectTypes.get(name) !== 'BASE TABLE',
      )
      if (missingTables.length > 0) {
        throw new Error(
          `Applied migration ${migration.version} is missing expected tables: ${missingTables.join(', ')}.`,
        )
      }
    }

    for (const migration of migrations) {
      if (applied.has(migration.version)) {
        if (applied.get(migration.version) !== migration.checksum) {
          throw new Error(
            `Applied migration ${migration.version} has changed; no changes were applied.`,
          )
        }
        continue
      }

      objects = await getSchemaObjects(connection, databaseName)
      const objectNames = new Set(objects.map((object) => object.name))
      const existingTargets = migration.tableNames.filter((name) => objectNames.has(name))
      if (existingTargets.length > 0) {
        throw new Error(
          `Migration ${migration.version} conflicts with existing objects: ${existingTargets.join(', ')}. No changes were applied.`,
        )
      }

      try {
        for (const statement of migration.statements) {
          await connection.query(statement)
        }
        await connection.execute(
          'INSERT INTO schema_migrations (version, checksum) VALUES (?, ?)',
          [migration.version, migration.checksum],
        )
        console.log(`Applied migration ${migration.version}.`)
      } catch (error) {
        throw new Error(
          `Migration ${migration.version} failed (database error ${error.code || 'UNKNOWN'}). MySQL DDL may have partially applied; inspect the schema before retrying.`,
        )
      }
    }

    const finalObjects = await getSchemaObjects(connection, databaseName)
    const unknownAfterMigration = finalObjects.filter(
      (object) => !plannedTables.has(object.name),
    )
    if (unknownAfterMigration.length > 0) {
      throw new Error(
        `Unexpected objects appeared during migration: ${unknownAfterMigration.map((object) => object.name).join(', ')}.`,
      )
    }

    console.log('Database migrations are up to date.')
  } finally {
    connection.release()
  }
}
