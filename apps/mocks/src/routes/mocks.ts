import {randomUUID} from 'node:crypto'
import {type Request, type Response, type Router} from 'express'
import {type EndpointScenarios, type ScenarioContext} from '@live-coding/mocks-scenarios'
import {normalizeEndPointForSorting, logEndpoint, getScenarioOverride} from '../utils.js'
import {type ConfigManager} from '../config-manager.js'
import {type RequestHistoryStore} from '../request-history.js'
import {type MockCallHistoryEntry} from '../types.js'

export function registerMockRoutes(
  app: Router,
  scenarios: Record<string, EndpointScenarios>,
  configManager: ConfigManager,
  requestHistory: RequestHistoryStore
) {
  const sortedEndpoints = Object.values(scenarios).sort((a, b) =>
    normalizeEndPointForSorting(a).localeCompare(normalizeEndPointForSorting(b))
  )

  const recordHistory = (
    req: Request,
    entry: Pick<MockCallHistoryEntry, 'method' | 'path' | 'scenarioId' | 'statusCode' | 'response'>
  ) => {
    requestHistory.add({
      id: randomUUID(),
      timestamp: Date.now(),
      requestQuery: Object.keys(req.query).length > 0 ? (req.query as Record<string, unknown>) : undefined,
      requestBody: req.body && Object.keys(req.body).length > 0 ? req.body : undefined,
      ...entry
    })
  }

  sortedEndpoints.forEach(endpoint => {
    const endpointKey = `${endpoint.method} ${endpoint.path}`

    // Default scenario
    const defaultScenario = endpoint.scenarios['default']?.scenario({query: {}, params: {}})
    if (defaultScenario === undefined) throw new Error(`No scenario for default`)

    logEndpoint(endpoint.method, endpoint.path, defaultScenario.statusCode)

    //@ts-expect-error - dinamicaly accessing express app methods
    app[endpoint.method.toLowerCase()](endpoint.path, (req: Request, res: Response) => {
      const context: ScenarioContext = {
        query: req.query as ScenarioContext['query'],
        params: req.params as ScenarioContext['params']
      }
      // A per-request override (see getScenarioOverride) takes priority over everything else,
      // including the NODE_ENV==='test' pin, since it only affects the request that asked for it.
      const perRequestOverride = getScenarioOverride(req, endpointKey)
      const overrideScenarioId = configManager.getScenarioId(endpointKey)
      const scenarioId =
        perRequestOverride ?? (process.env.NODE_ENV === 'test' ? 'default' : overrideScenarioId || 'default')
      const delay = configManager.getDelay(endpointKey)

      const scenarioHandler = endpoint.scenarios[scenarioId]
      if (!scenarioHandler) {
        console.warn(`[Server] Scenario '${scenarioId}' not found for ${endpointKey}, falling back to 'default'`)
        const fallbackHandler = endpoint.scenarios['default']
        if (!fallbackHandler) {
          throw new Error(`No default scenario for ${endpointKey}`)
        }
        const fallbackScenario = fallbackHandler.scenario(context)

        const sendFallback = () => {
          res.statusCode = fallbackScenario.statusCode
          res.setHeaders(fallbackScenario.responseHeaders)
          // Add custom header with endpoint info for DevTools tracking
          res.setHeader('x-mocked-request', endpointKey)
          recordHistory(req, {
            method: endpoint.method,
            path: endpoint.path,
            scenarioId: 'default',
            statusCode: fallbackScenario.statusCode,
            response: fallbackScenario.response
          })
          res.json(fallbackScenario.response)
        }

        if (delay > 0) {
          setTimeout(sendFallback, delay)
        } else {
          sendFallback()
        }
        return
      }

      const runtimeScenario = scenarioHandler.scenario(context)

      const sendResponse = () => {
        res.statusCode = runtimeScenario.statusCode
        res.setHeaders(runtimeScenario.responseHeaders)
        // Add custom header with endpoint info for DevTools tracking
        res.setHeader('x-mocked-request', endpointKey)
        recordHistory(req, {
          method: endpoint.method,
          path: endpoint.path,
          scenarioId,
          statusCode: runtimeScenario.statusCode,
          response: runtimeScenario.response
        })
        res.json(runtimeScenario.response)
      }

      if (delay > 0) {
        setTimeout(sendResponse, delay)
      } else {
        sendResponse()
      }
    })
  })
}
