import bcrypt from 'bcrypt'
import { closeDatabasePool, getDatabasePool } from '../src/config/database.js'
import { getEnvironment } from '../src/config/env.js'

const demoPassword = 'NagaraDemo#2026'
const passwordCost = 12

const districts = [
  { code: 'HYD', name: 'Hyderabad' },
  { code: 'HNK', name: 'Hanamkonda' },
]

const municipalities = [
  { code: 'GHMC', name: 'GHMC', districtCode: 'HYD' },
  { code: 'WARANGAL', name: 'Warangal', districtCode: 'HNK' },
]

const departments = [
  { municipalityCode: 'GHMC', name: 'Roads', description: 'Roads and pothole maintenance.' },
  { municipalityCode: 'GHMC', name: 'Water', description: 'Water supply and leakage response.' },
  { municipalityCode: 'GHMC', name: 'Electricity', description: 'Streetlights and public electricity issues.' },
  { municipalityCode: 'GHMC', name: 'Sanitation', description: 'Waste collection and sanitation.' },
  { municipalityCode: 'GHMC', name: 'Public Works', description: 'Public property and infrastructure.' },
  { municipalityCode: 'WARANGAL', name: 'Roads', description: 'Roads and pothole maintenance.' },
  { municipalityCode: 'WARANGAL', name: 'Water', description: 'Water supply and leakage response.' },
  { municipalityCode: 'WARANGAL', name: 'Sanitation', description: 'Waste collection and sanitation.' },
  { municipalityCode: 'WARANGAL', name: 'Electricity', description: 'Streetlights and public electricity issues.' },
]

const categories = [
  { slug: 'roads-and-potholes', name: 'Roads and Potholes', iconKey: 'road' },
  { slug: 'water-supply-and-leakage', name: 'Water Supply and Leakage', iconKey: 'droplet' },
  { slug: 'streetlights-and-electricity', name: 'Streetlights and Electricity', iconKey: 'lamp' },
  { slug: 'garbage-and-sanitation', name: 'Garbage and Sanitation', iconKey: 'trash' },
  { slug: 'public-property-damage', name: 'Public Property Damage', iconKey: 'building' },
  { slug: 'public-safety-and-hazards', name: 'Public Safety and Hazards', iconKey: 'shield' },
]

const priorityRules = [
  { ruleKey: 'default-critical', priority: 'critical', slaHours: 24 },
  { ruleKey: 'default-high', priority: 'high', slaHours: 72 },
  { ruleKey: 'default-medium', priority: 'medium', slaHours: 168 },
  { ruleKey: 'default-low', priority: 'low', slaHours: 336 },
]

const users = [
  {
    email: 'ananya.rao@nagara.demo',
    fullName: 'Ananya Rao',
    phone: null,
    role: 'citizen',
    municipalityCode: 'GHMC',
    departmentName: null,
  },
  {
    email: 'karthik.reddy@nagara.demo',
    fullName: 'Karthik Reddy',
    phone: null,
    role: 'citizen',
    municipalityCode: 'WARANGAL',
    departmentName: null,
  },
  {
    email: 'meera.nair@nagara.demo',
    fullName: 'Meera Nair',
    phone: null,
    role: 'officer',
    municipalityCode: 'GHMC',
    departmentName: null,
  },
  {
    email: 'imran.shaik@nagara.demo',
    fullName: 'Imran Shaik',
    phone: null,
    role: 'officer',
    municipalityCode: 'WARANGAL',
    departmentName: null,
  },
  {
    email: 'ravi.kumar@nagara.demo',
    fullName: 'Ravi Kumar',
    phone: null,
    role: 'worker',
    municipalityCode: 'GHMC',
    departmentName: 'Roads',
  },
  {
    email: 'lakshmi.devi@nagara.demo',
    fullName: 'Lakshmi Devi',
    phone: null,
    role: 'worker',
    municipalityCode: 'GHMC',
    departmentName: 'Water',
  },
  {
    email: 'suresh.goud@nagara.demo',
    fullName: 'Suresh Goud',
    phone: null,
    role: 'worker',
    municipalityCode: 'WARANGAL',
    departmentName: 'Sanitation',
  },
]

async function getExistingId(connection, table, column, value) {
  const [rows] = await connection.execute(
    `SELECT id FROM ${table} WHERE ${column} = ?`,
    [value],
  )
  return rows[0]?.id ?? null
}

async function insertReferenceRow(connection, sql, values, table, column, value) {
  await connection.execute(sql, values)
  const id = await getExistingId(connection, table, column, value)
  if (id === null) {
    throw new Error(`Could not resolve seeded ${table} record.`)
  }
  return id
}

async function seedData(connection, passwordHashes) {
  const districtIds = new Map()
  for (const district of districts) {
    const id = await insertReferenceRow(
      connection,
      'INSERT INTO districts (code, name) VALUES (?, ?) ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)',
      [district.code, district.name],
      'districts',
      'code',
      district.code,
    )
    const [rows] = await connection.execute(
      'SELECT name FROM districts WHERE id = ?',
      [id],
    )
    if (rows[0].name !== district.name) {
      throw new Error(`Existing district code ${district.code} has conflicting data.`)
    }
    districtIds.set(district.code, id)
  }

  const municipalityIds = new Map()
  for (const municipality of municipalities) {
    const districtId = districtIds.get(municipality.districtCode)
    const id = await insertReferenceRow(
      connection,
      'INSERT INTO municipalities (district_id, name, code) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)',
      [districtId, municipality.name, municipality.code],
      'municipalities',
      'code',
      municipality.code,
    )
    const [rows] = await connection.execute(
      'SELECT district_id, name FROM municipalities WHERE id = ?',
      [id],
    )
    if (
      Number(rows[0].district_id) !== Number(districtId) ||
      rows[0].name !== municipality.name
    ) {
      throw new Error(`Existing municipality code ${municipality.code} has conflicting data.`)
    }
    municipalityIds.set(municipality.code, id)
  }

  const departmentIds = new Map()
  for (const department of departments) {
    const municipalityId = municipalityIds.get(department.municipalityCode)
    const [existing] = await connection.execute(
      'SELECT id, description, is_active FROM departments WHERE municipality_id = ? AND name = ?',
      [municipalityId, department.name],
    )
    let id = existing[0]?.id
    if (id === undefined) {
      const [result] = await connection.execute(
        'INSERT INTO departments (municipality_id, name, description) VALUES (?, ?, ?)',
        [municipalityId, department.name, department.description],
      )
      id = result.insertId
    } else if (
      existing[0].description !== department.description ||
      Number(existing[0].is_active) !== 1
    ) {
      throw new Error(
        `Existing ${department.municipalityCode} ${department.name} department has conflicting data.`,
      )
    }
    departmentIds.set(`${department.municipalityCode}:${department.name}`, id)
  }

  for (const category of categories) {
    const id = await insertReferenceRow(
      connection,
      'INSERT INTO categories (slug, name, icon_key) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)',
      [category.slug, category.name, category.iconKey],
      'categories',
      'slug',
      category.slug,
    )
    const [rows] = await connection.execute(
      'SELECT name, icon_key, is_active FROM categories WHERE id = ?',
      [id],
    )
    if (
      rows[0].name !== category.name ||
      rows[0].icon_key !== category.iconKey ||
      Number(rows[0].is_active) !== 1
    ) {
      throw new Error(`Existing category ${category.slug} has conflicting data.`)
    }
  }

  for (const rule of priorityRules) {
    const [existing] = await connection.execute(
      'SELECT priority, sla_hours, is_active FROM priority_rules WHERE rule_key = ?',
      [rule.ruleKey],
    )
    if (existing[0] === undefined) {
      await connection.execute(
        'INSERT INTO priority_rules (rule_key, priority, sla_hours) VALUES (?, ?, ?)',
        [rule.ruleKey, rule.priority, rule.slaHours],
      )
    } else if (
      existing[0].priority !== rule.priority ||
      Number(existing[0].sla_hours) !== rule.slaHours ||
      Number(existing[0].is_active) !== 1
    ) {
      throw new Error(`Existing priority rule ${rule.ruleKey} has conflicting data.`)
    }
  }

  const userIds = new Map()
  for (let index = 0; index < users.length; index += 1) {
    const user = users[index]
    const districtId = districtIds.get(
      municipalities.find((municipality) => municipality.code === user.municipalityCode)
        .districtCode,
    )
    const municipalityId = municipalityIds.get(user.municipalityCode)
    const departmentId =
      user.departmentName === null
        ? null
        : departmentIds.get(`${user.municipalityCode}:${user.departmentName}`)

    await connection.execute(
      `INSERT INTO users (
        full_name, email, phone, password_hash, role, department_id,
        home_district_id, home_municipality_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)`,
      [
        user.fullName,
        user.email,
        user.phone,
        passwordHashes[index],
        user.role,
        departmentId,
        user.role === 'citizen' ? districtId : null,
        user.role === 'citizen' ? municipalityId : null,
      ],
    )
    const [existing] = await connection.execute(
      'SELECT id, role, department_id, home_district_id, home_municipality_id, is_active FROM users WHERE email = ?',
      [user.email],
    )
    const row = existing[0]
    if (
      row === undefined ||
      row.role !== user.role ||
      (row.department_id === null ? null : Number(row.department_id)) !==
        (departmentId === null ? null : Number(departmentId)) ||
      Number(row.is_active) !== 1
    ) {
      throw new Error(`Existing demo account ${user.email} has conflicting role or department data.`)
    }
    if (
      user.role === 'citizen' &&
      (Number(row.home_district_id) !== Number(districtId) ||
        Number(row.home_municipality_id) !== Number(municipalityId))
    ) {
      throw new Error(`Existing demo account ${user.email} has conflicting home municipality data.`)
    }

    const [memberships] = await connection.execute(
      'SELECT municipality_id FROM user_municipalities WHERE user_id = ?',
      [row.id],
    )
    const currentIds = new Set(memberships.map((membership) => Number(membership.municipality_id)))
    if (
      user.role === 'citizen'
        ? currentIds.size !== 0
        : currentIds.size > 1 ||
          (currentIds.size === 1 && !currentIds.has(Number(municipalityId)))
    ) {
      throw new Error(`Existing demo account ${user.email} has conflicting municipality access.`)
    }

    if (user.role !== 'citizen' && !currentIds.has(Number(municipalityId))) {
      await connection.execute(
        'INSERT INTO user_municipalities (user_id, municipality_id) VALUES (?, ?)',
        [row.id, municipalityId],
      )
    }
    userIds.set(user.email, row.id)
  }

  return {
    municipalities: municipalityIds.size,
    departments: departmentIds.size,
    categories: categories.length,
    users: userIds.size,
    userIds,
    municipalityIds,
    departmentIds,
  }
}

async function runSeed() {
  const { database } = getEnvironment()
  const hashes = await Promise.all(
    users.map(() => bcrypt.hash(demoPassword, passwordCost)),
  )
  const pool = getDatabasePool()
  const connection = await pool.getConnection()

  try {
    const [migrationRows] = await connection.execute(
      'SELECT version FROM schema_migrations WHERE version = ?',
      ['001_initial_schema'],
    )
    if (migrationRows.length !== 1) {
      throw new Error('Run the database migrations before seeding demo data.')
    }

    await connection.beginTransaction()
    const results = await seedData(connection, hashes)
    await connection.commit()
    console.log(
      `Demo seed complete: ${results.users} accounts, ${results.municipalities} municipalities, ${results.departments} departments, ${results.categories} categories.`,
    )
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
    await closeDatabasePool()
  }
}

try {
  await runSeed()
} catch (error) {
  console.error(`Demo seed failed: ${error.message}`)
  process.exitCode = 1
  await closeDatabasePool()
}
