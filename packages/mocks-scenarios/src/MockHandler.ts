export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
  OPTIONS = 'OPTIONS',
  HEAD = 'HEAD'
}

export interface Scenario<TBody = unknown, TResponse = unknown> {
  statusCode: number
  responseHeaders: Map<string, string | number | readonly string[]>
  response: TResponse
  body?: TBody
}

export const MOCK_APPS = ['jobs'] as const
export type MockApp = (typeof MOCK_APPS)[number]

/** Request data a scenario can use to build its response (e.g. to filter and paginate). */
export interface ScenarioContext {
  query: Record<string, string | string[] | undefined>
  params: Record<string, string | string[] | undefined>
}

export interface MockHandler {
  app: MockApp
  method: HttpMethod
  path: string
  scenario(context: ScenarioContext): Scenario
}

function deriveFromStack(): {app: MockApp; method: HttpMethod; path: string} {
  // Get the call stack
  const stack = new Error().stack
  if (!stack) throw new Error('Could not derive file path from stack')

  // Find the Scenarios.ts file in the stack - match any line containing Scenarios.ts
  // Stack format varies between environments, so we look for the file path pattern
  const match = stack.match(
    /\(([^)]*Scenarios\.(ts|js|mjs)):\d+:\d+\)|at [^\s]+ \(([^)]*Scenarios\.(ts|js|mjs)):\d+:\d+\)|^\s+at ([^\s]*Scenarios\.(ts|js|mjs)):\d+:\d+/m
  )

  const filePath = match?.[1] || match?.[3] || match?.[5]
  if (!filePath) throw new Error(`Could not find Scenarios.ts in stack: ${stack}`)

  // Match: /mocks/{app}/{domain}/{METHOD}/{path}/Scenarios.ts
  // The app selects the mock server router that serves it; the domain is just organizational, we ignore it
  const mocksDirMatch = filePath.match(/\/mocks\/([^/]+)\/[^/]+\/([^/]+)\/(.+)\/Scenarios\.(ts|js|mjs)$/)
  if (!mocksDirMatch) throw new Error(`Invalid mock file path: ${filePath}`)

  const [, appStr, methodStr, pathSegments] = mocksDirMatch

  const app = MOCK_APPS.find(candidate => candidate === appStr)
  if (!app) throw new Error(`Invalid mock app: ${appStr}`)

  // Parse method
  const method = HttpMethod[methodStr as keyof typeof HttpMethod]
  if (!method) throw new Error(`Invalid HTTP method: ${methodStr}`)

  // Path is everything after the method
  const path = '/' + pathSegments

  return {app, method, path}
}

/**
 * Base class for mock scenarios. Automatically derives HTTP method and path from the file location.
 *
 * File structure convention: `/mocks/{app}/{domain}/{METHOD}/{path}/Scenarios.ts`
 * - {app}: App whose mock server router serves the endpoint (jobs)
 * - {domain}: Organizational folder (e.g., api.example.com)
 * - {METHOD}: HTTP method (GET, POST, PUT, PATCH, DELETE, etc.)
 * - {path}: API endpoint path segments (becomes the actual endpoint path)
 *
 * Example:
 * File: `/mocks/jobs/api.example.com/GET/offers/:offerId/Scenarios.ts`
 * Derives to: GET /offers/:offerId
 *
 * IMPORTANT: The folder structure MUST match the actual API endpoint path.
 * No transformations or mappings are applied.
 *
 * Works in both development and production by inspecting the call stack.
 */
export abstract class BaseScenario<TBody = unknown, TResponse = unknown> implements MockHandler {
  public readonly app: MockApp
  public readonly method: HttpMethod
  public readonly path: string

  constructor() {
    const derived = deriveFromStack()
    this.app = derived.app
    this.method = derived.method
    this.path = derived.path
  }

  abstract scenario(context: ScenarioContext): Scenario<TBody, TResponse>
}
