import { Router } from 'express'
import { API_ERROR_CODES } from '../../../shared/constants.js'
import { checkDatabaseConnection } from '../config/database.js'

export function createHealthRouter(databaseCheck = checkDatabaseConnection) {
  const router = Router()

  router.get('/health', async (request, response) => {
    try {
      await databaseCheck()
      return response.json({
        success: true,
        data: {
          application: { status: 'ok' },
          database: { status: 'ok' },
        },
      })
    } catch (error) {
      console.error('Database health check failed.', {
        code: error.code || 'UNKNOWN',
      })
      return response.status(503).json({
        success: false,
        error: {
          code: API_ERROR_CODES.SERVICE_UNAVAILABLE,
          message: 'Database connectivity check failed.',
          details: [],
        },
        data: {
          application: { status: 'ok' },
          database: { status: 'unavailable' },
        },
      })
    }
  })

  return router
}

export default createHealthRouter()
