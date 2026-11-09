import express from 'express'
import helmet from 'helmet'
import { API_ERROR_CODES } from '../../shared/constants.js'
import { getEnvironment } from './config/env.js'
import { getDatabasePool } from './config/database.js'
import { createCorsMiddleware } from './middleware/cors.js'
import errorHandler from './middleware/errorHandler.js'
import { createAuthRepository } from './repositories/authRepository.js'
import { createAuthRouter } from './routes/auth.js'
import { createHealthRouter } from './routes/health.js'

export function createApp({
  databaseCheck,
  authService,
  authRepository,
  config,
  loginRateLimiter,
} = {}) {
  const app = express()
  const getConfig = () => config ?? getEnvironment()

  app.use(helmet())
  app.use(createCorsMiddleware(() => getConfig().clientOrigin))
  app.use(express.json({ limit: '32kb' }))
  app.use('/api', createHealthRouter(databaseCheck))
  app.use(
    '/api/auth',
    createAuthRouter({
      resolveAuthService: authService ? () => authService : undefined,
      repository: authRepository,
      config: config ? {
        clientOrigin: config.clientOrigin,
        nodeEnv: config.nodeEnv,
        jwtAccessSecret: config.jwtAccessSecret,
      } : undefined,
      loginRateLimiter,
    }),
  )

  app.get('/api/municipalities', async (request, response) => {
    const repository =
      authRepository ?? createAuthRepository(getDatabasePool())
    const municipalities = await repository.listMunicipalities()
    return response.json({ success: true, data: municipalities })
  })

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
