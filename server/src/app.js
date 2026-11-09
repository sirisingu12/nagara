import express from 'express'
import { API_ERROR_CODES } from '../../shared/constants.js'
import errorHandler from './middleware/errorHandler.js'
import { createHealthRouter } from './routes/health.js'

export function createApp({ databaseCheck } = {}) {
  const app = express()

  app.use('/api', createHealthRouter(databaseCheck))

  app.use((request, response) => {
    response.status(404).json({
      success: false,
      error: {
        code: API_ERROR_CODES.NOT_FOUND,
        message: 'The requested resource was not found.',
        details: [],
      },
    })
  })

  app.use(errorHandler)

  return app
}

export default createApp()
