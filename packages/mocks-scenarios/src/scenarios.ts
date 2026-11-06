import {type MockHandler, type HttpMethod, type MockApp} from './MockHandler'

export interface EndpointScenarios {
  method: HttpMethod
  path: string
  scenarios: Record<string, MockHandler>
}

export const scenarios: Record<MockApp, Record<string, EndpointScenarios>> = {jobs: {}}

export function register(scenarioId: string, handler: MockHandler) {
  const key = `${handler.method} ${handler.path}`
  const appScenarios = scenarios[handler.app]
  if (!appScenarios[key]) {
    appScenarios[key] = {
      method: handler.method,
      path: handler.path,
      scenarios: {
        [scenarioId]: handler
      }
    }
  } else {
    appScenarios[key].scenarios = {
      ...appScenarios[key].scenarios,
      [scenarioId]: handler
    }
  }
}
