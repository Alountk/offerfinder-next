import {useEffect, useState} from 'react'
import {useMocksServerUrl} from '../utils/mocksServerUrl'

export interface MockScenarioResponse {
  endpoint: string
  scenarioId: string
  statusCode: number
  response: unknown
}

interface UseMockScenarioResponseReturn {
  data: MockScenarioResponse | null
  loading: boolean
  error: string | null
}

/**
 * Fetches the response of the scenario currently configured for an endpoint.
 * Only fetches while `enabled`, and refetches when the scenario changes.
 */
export function useMockScenarioResponse(
  endpointKey: string,
  currentScenario: string,
  enabled: boolean
): UseMockScenarioResponseReturn {
  const mocksServerUrl = useMocksServerUrl()
  const [data, setData] = useState<MockScenarioResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) return

    const controller = new AbortController()
    const url = `${mocksServerUrl}/api/debug/scenarios/response?endpoint=${encodeURIComponent(endpointKey)}`

    ;(async () => {
      setLoading(true)
      try {
        const response = await fetch(url, {signal: controller.signal})
        if (!response.ok) throw new Error(`Failed to fetch scenario response: ${response.statusText}`)
        setData((await response.json()) as MockScenarioResponse)
        setError(null)
      } catch (err) {
        if (controller.signal.aborted) return
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    })()

    return () => controller.abort()
  }, [mocksServerUrl, endpointKey, currentScenario, enabled])

  return {data, loading, error}
}
