import test from 'node:test'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { COMPLAINT_STATUSES, ROLES } from '../../shared/constants.js'
import { loadMigrations } from '../src/database/migrationRunner.js'

const migrationDirectory = fileURLToPath(
  new URL('../../database/migrations/', import.meta.url),
)

test('initial migration contains all planned InnoDB schema tables', async () => {
  const [migration] = await loadMigrations(migrationDirectory)
  const expectedTables = [
    'districts',
    'municipalities',
    'localities',
    'departments',
    'users',
    'user_municipalities',
    'categories',
    'priority_rules',
    'complaints',
    'refresh_tokens',
    'complaint_images',
    'assignments',
    'complaint_status_history',
    'comments',
    'resolution_evidence',
    'feedback',
    'notifications',
    'sla_extensions',
    'audit_logs',
  ]

  assert.equal(migration.version, '001_initial_schema')
  assert.deepEqual(migration.tableNames, expectedTables)
  assert.ok(migration.statements.every((statement) => /^CREATE TABLE\b/i.test(statement)))
  assert.ok(
    migration.statements.every((statement) =>
      /ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4/i.test(statement),
    ),
  )
})

test('database role and complaint status values match the shared contract', async () => {
  const [migration] = await loadMigrations(migrationDirectory)
  const usersTable = migration.statements.find((statement) =>
    statement.startsWith('CREATE TABLE users'),
  )
  const roleDefinition = usersTable.match(/role ENUM\(([^)]+)\)/)
  const schemaRoles = [...roleDefinition[1].matchAll(/'([^']+)'/g)].map(
    (match) => match[1],
  )

  assert.deepEqual(schemaRoles, Object.values(ROLES))
  assert.doesNotMatch(roleDefinition[1], /admin/i)

  for (const status of Object.values(COMPLAINT_STATUSES)) {
    assert.ok(
      migration.statements.some((statement) =>
        statement.includes(`'${status}'`),
      ),
      `Schema is missing shared status ${status}`,
    )
  }
})

test('schema encodes municipality ownership, overdue flag and required uniqueness', async () => {
  const [migration] = await loadMigrations(migrationDirectory)
  const schema = migration.statements.join('\n')

  assert.match(schema, /UNIQUE KEY uq_users_email \(email\)/)
  assert.match(schema, /FOREIGN KEY \(municipality_id, district_id\)/)
  assert.match(schema, /FOREIGN KEY \(department_id, municipality_id\)/)
  assert.match(schema, /CREATE TABLE user_municipalities[\s\S]*PRIMARY KEY \(user_id, municipality_id\)/)
  assert.match(schema, /is_overdue BOOLEAN NOT NULL DEFAULT FALSE/)
  assert.match(schema, /status ENUM\([\s\S]*'resolution_submitted'/)
  assert.doesNotMatch(schema, /ENUM\([^)]*\boverdue\b/i)
  assert.match(schema, /UNIQUE KEY uq_refresh_tokens_hash \(token_hash\)/)
  assert.match(schema, /UNIQUE KEY uq_feedback_complaint_cycle \(complaint_id, cycle\)/)
})
