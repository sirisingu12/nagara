import test from 'node:test'
import assert from 'node:assert/strict'
import express from 'express'
import { createApp } from '../src/app.js'
import errorHandler from '../src/middleware/errorHandler.js'

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

test('health endpoint separates application and database status', async () => {
  const app = createApp({ databaseCheck: async () => true })

  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/health`)
    const body = await response.json()

    assert.equal(response.status, 200)
    assert.ok(response.headers.get('x-content-type-options'))
    assert.deepEqual(body, {
      success: true,
      data: {
        application: { status: 'ok' },
        database: { status: 'ok' },
      },
    })
  })
})

test('health endpoint reports database outage without hiding application health', async () => {
  const app = createApp({
    databaseCheck: async () => {
      throw new Error('private database details')
    },
  })

  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/health`)
    const body = await response.json()

    assert.equal(response.status, 503)
    assert.equal(body.success, false)
    assert.deepEqual(body.data, {
      application: { status: 'ok' },
      database: { status: 'unavailable' },
    })
    assert.doesNotMatch(JSON.stringify(body), /private database details/)
  })
})

test('Express 5 forwards rejected async route handlers to the error middleware', async () => {
  const app = express()
  app.get('/failure', async () => {
    throw new Error('private failure details')
  })
  app.use(errorHandler)

  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/failure`)
    const body = await response.json()

    assert.equal(response.status, 500)
    assert.equal(body.success, false)
    assert.equal(body.error.code, 'INTERNAL_SERVER_ERROR')
    assert.doesNotMatch(JSON.stringify(body), /private failure details/)
  })
})

test('unknown routes use the standard not-found response', async () => {
  const app = createApp({ databaseCheck: async () => true })

  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/missing`)
    const body = await response.json()

    assert.equal(response.status, 404)
    assert.deepEqual(body.error, {
      code: 'NOT_FOUND',
      message: 'The requested resource was not found.',
      details: [],
    })
  })
})
