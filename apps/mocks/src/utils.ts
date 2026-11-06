import {HttpMethod} from '@live-coding/mocks-scenarios'
import {styleText} from 'node:util'
const MOCK_SCENARIO_OVERRIDES_HEADER = 'x-mock-scenario-overrides'
import {type Request} from 'express'

const COLORS_BY_METHOD = {
  [HttpMethod.GET]: 'bgGreen',
  [HttpMethod.POST]: 'bgCyan',
  [HttpMethod.PUT]: 'bgMagenta',
  [HttpMethod.DELETE]: 'bgRed'
} as Record<HttpMethod, 'bgGreen' | 'bgCyan' | 'bgRed' | 'bgMagenta'>

function colorByMethod(method: HttpMethod): 'bgGreen' | 'bgCyan' | 'bgRed' | 'bgMagenta' | 'bgGray' {
  return COLORS_BY_METHOD[method] ?? 'bgGray'
}

function colorByStatusCode(statusCode: number): 'green' | 'red' | 'yellow' {
  if (statusCode >= 200 && statusCode < 400) return 'green'
  else if (statusCode >= 400 && statusCode < 500) return 'yellow'
  else return 'red'
}

export function normalizeEndPointForSorting({path}: {path: string}): string {
  return `${path.replace(/\/\d+\//g, '/')}`
}

export function logEndpoint(method: HttpMethod, path: string, statusCode: number) {
  console.log(
    styleText(colorByStatusCode(statusCode), `${statusCode}`),
    styleText([colorByMethod(method), 'black', 'bold'], `${method.padEnd(6)} ${path}`)
  )
}

// Lets a single Playwright test force a scenario for one endpoint (e.g. `{"GET /v1/me": "notLogged"}`)
// without affecting the 'default' pin the other parallel tests rely on (see mocks.ts).
export function getScenarioOverride(req: Request, endpointKey: string): string | undefined {
  const header = req.headers[MOCK_SCENARIO_OVERRIDES_HEADER]
  if (typeof header !== 'string') return undefined

  try {
    const overrides = JSON.parse(header) as Record<string, string>
    return overrides[endpointKey]
  } catch {
    return undefined
  }
}
