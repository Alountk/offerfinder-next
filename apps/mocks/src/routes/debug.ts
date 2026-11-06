import {type Request, type Response, type Router} from 'express'
import fs from 'node:fs'
import {type EndpointScenarios} from '@live-coding/mocks-scenarios'
import {type ConfigManager} from '../config-manager.js'
import {type RequestHistoryStore} from '../request-history.js'
import {
  type DebugHistoryResponse,
  type DebugScenarioResponse,
  type DebugScenariosResponse,
  type UpdateScenarioRequest,
  type UpdateScenarioResponse
} from '../types.js'

export function registerDebugRoutes(
  app: Router,
  scenarios: Record<string, EndpointScenarios>,
  configManager: ConfigManager,
  configPath: string,
  requestHistory: RequestHistoryStore
) {
  // Debug endpoint: Get all scenarios info
  app.get('/api/debug/scenarios', (_req: Request, res: Response) => {
    const endpoints = Object.entries(scenarios).map(([key, endpoint]) => {
      const availableScenarios = Object.keys(endpoint.scenarios)
      const overriddenScenario = configManager.getScenarioId(key)
      const delay = configManager.getDelay(key)
      const currentScenario = overriddenScenario || 'default'
      const isValidScenario = availableScenarios.includes(currentScenario)

      return {
        method: endpoint.method,
        path: endpoint.path,
        currentScenario,
        availableScenarios,
        isOverridden: overriddenScenario !== null,
        isValidScenario,
        delay
      }
    })

    const response: DebugScenariosResponse = {
      endpoints,
      configPath,
      hasConfigFile: fs.existsSync(configPath)
    }

    res.json(response)
  })

  // Debug endpoint: Preview the response of the scenario currently configured for an endpoint.
  // It is built without request data (no query/params), so endpoints that depend on them show their base response.
  app.get('/api/debug/scenarios/response', (req: Request, res: Response) => {
    const endpoint = req.query.endpoint
    if (typeof endpoint !== 'string' || !scenarios[endpoint]) {
      return res.status(404).json({success: false, error: `Endpoint not found: ${String(endpoint)}`})
    }

    const requestedScenarioId = configManager.getScenarioId(endpoint) || 'default'
    const scenarioId = scenarios[endpoint].scenarios[requestedScenarioId] ? requestedScenarioId : 'default'
    const handler = scenarios[endpoint].scenarios[scenarioId]
    if (!handler) {
      return res.status(404).json({success: false, error: `No default scenario for ${endpoint}`})
    }

    const {statusCode, response} = handler.scenario({query: {}, params: {}})
    const body: DebugScenarioResponse = {endpoint, scenarioId, statusCode, response}
    res.json(body)
  })

  // Debug endpoint: Update scenario configuration
  app.post('/api/debug/scenarios', (req: Request, res: Response) => {
    try {
      const {endpoint, scenarioId, delay} = req.body as UpdateScenarioRequest

      if (!endpoint || typeof endpoint !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Missing or invalid endpoint parameter'
        })
      }

      if (scenarioId !== null && typeof scenarioId !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Invalid scenarioId parameter'
        })
      }

      // Validate endpoint exists
      if (!scenarios[endpoint]) {
        return res.status(404).json({
          success: false,
          error: `Endpoint not found: ${endpoint}`
        })
      }

      // Validate scenario exists for endpoint
      if (scenarioId !== null && !scenarios[endpoint].scenarios[scenarioId]) {
        return res.status(400).json({
          success: false,
          error: `Scenario '${scenarioId}' not found for endpoint ${endpoint}`
        })
      }

      // Update configuration
      configManager.setScenarioId(endpoint, scenarioId)

      // Update delay if provided
      if (delay !== undefined) {
        if (typeof delay !== 'number' || delay < 0 || delay > 10000) {
          return res.status(400).json({
            success: false,
            error: 'Delay must be a number between 0 and 10000'
          })
        }
        configManager.setDelay(endpoint, delay)
      }

      const response: UpdateScenarioResponse = {
        success: true,
        endpoint,
        scenarioId
      }

      res.json(response)
    } catch (error) {
      console.error('[Server] Error updating scenario:', error)
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  })

  // Debug endpoint: Get recent mock call history (newest first)
  app.get('/api/debug/history', (_req: Request, res: Response) => {
    const response: DebugHistoryResponse = {
      history: requestHistory.getAll()
    }
    res.json(response)
  })

  // Debug endpoint: Clear mock call history
  app.delete('/api/debug/history', (_req: Request, res: Response) => {
    requestHistory.clear()
    res.json({success: true})
  })
}
