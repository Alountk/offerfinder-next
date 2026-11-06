export interface EndpointConfig {
  scenarioId?: string | null
  delay?: number // milliseconds, 0 = no delay
}

export interface ScenariosConfig {
  [endpointKey: string]: string | EndpointConfig // Support both old (string) and new (object) formats
}

export interface EndpointInfo {
  method: string
  path: string
  currentScenario: string
  availableScenarios: string[]
  isOverridden: boolean
  isValidScenario: boolean
  delay: number // current delay in ms
}

export interface DebugScenariosResponse {
  endpoints: EndpointInfo[]
  configPath: string
  hasConfigFile: boolean
}

export interface UpdateScenarioRequest {
  endpoint: string
  scenarioId: string | null // null to remove override
  delay?: number // optional delay to set
}

export interface UpdateScenarioResponse {
  success: boolean
  endpoint: string
  scenarioId: string | null
  error?: string
}

export interface MockCallHistoryEntry {
  id: string
  timestamp: number
  method: string
  path: string
  scenarioId: string
  statusCode: number
  requestQuery?: Record<string, unknown>
  requestBody?: unknown
  response: unknown
}

export interface DebugHistoryResponse {
  history: MockCallHistoryEntry[]
}

export interface DebugScenarioResponse {
  endpoint: string
  scenarioId: string
  statusCode: number
  response: unknown
}
