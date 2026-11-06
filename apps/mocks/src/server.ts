import express from 'express'
import cors from 'cors'
import path from 'node:path'
import {MOCK_APPS, scenarios} from '@live-coding/mocks-scenarios'
import {ConfigManager} from './config-manager.js'
import {RequestHistoryStore} from './request-history.js'
import {registerHealthRoutes} from './routes/health.js'
import {registerDebugRoutes} from './routes/debug.js'
import {registerMockRoutes} from './routes/mocks.js'

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5001

const app = express()

// Middlewares
app.use(
  cors({
    origin: true,
    preflightContinue: true,
    credentials: true,
    exposedHeaders: ['X-Mocked-Request']
  })
)
app.use(express.json())

app.use((req, _res, next) => {
  console.log(`${req.method} ${req.url}`)

  next()
})

registerHealthRoutes(app)

// Each app gets its own router (/jobs) with its own scenarios, config and call history,
// so the same method + path can return different responses per app.
const configManagers = MOCK_APPS.map(mockApp => {
  const configPath = path.join(process.cwd(), `scenarios-config.${mockApp}.json`)
  const configManager = new ConfigManager(configPath)
  const requestHistory = new RequestHistoryStore()
  const router = express.Router()

  console.log(`[Mock Server] Registering ${mockApp} mocks under /${mockApp}`)
  registerDebugRoutes(router, scenarios[mockApp], configManager, configPath, requestHistory)
  registerMockRoutes(router, scenarios[mockApp], configManager, requestHistory)
  app.use(`/${mockApp}`, router)

  return configManager
})

// Graceful shutdown
const shutdown = () => {
  console.log('\n[Server] Shutting down...')
  configManagers.forEach(configManager => configManager.destroy())
  process.exit(0)
}
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

// Start server
const server = app.listen(PORT, () => {
  console.info(`[Mock Server] Running on http://localhost:${PORT}`)
})

server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`[Mock Server] Port ${PORT} is already in use. Is another instance already running?`)
  } else {
    console.error('[Mock Server] Failed to start:', error)
  }
  process.exit(1)
})
