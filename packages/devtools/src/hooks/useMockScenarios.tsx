import {useState, useEffect, useCallback} from 'react'
import {useMocksServerUrl} from '../utils/mocksServerUrl'

export interface EndpointInfo {
  method: string
  path: string
  currentScenario: string
  availableScenarios: string[]
  isOverridden: boolean
  isValidScenario: boolean
  delay: number
}

export interface UseMockScenariosReturn {
  endpoints: EndpointInfo[]
  loading: boolean
  error: string | null
  updating: Set<string>
  fetchEndpoints: () => Promise<void>
  updateScenario: (endpoint: EndpointInfo, scenarioId: string) => Promise<void>
}

export function useMockScenarios(): UseMockScenariosReturn {
  const mocksApiBase = `${useMocksServerUrl()}/api/debug/scenarios`
  const [endpoints, setEndpoints] = useState<EndpointInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState<Set<string>>(new Set())

  const fetchEndpoints = useCallback(async () => {
    try {
      const response = await fetch(mocksApiBase)
      if (!response.ok) {
        throw new Error(`Failed to fetch scenarios: ${response.statusText}`)
      }
      const data = await response.json()
      setEndpoints(data.endpoints || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching mock scenarios:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [mocksApiBase])

  useEffect(() => {
    ;(async () => {
      await fetchEndpoints()
    })()
  }, [fetchEndpoints])

  const updateScenario = useCallback(
    async (endpoint: EndpointInfo, scenarioId: string) => {
      const endpointKey = `${endpoint.method} ${endpoint.path}`
      const isDefault = scenarioId === 'default'

      try {
        setUpdating(prev => new Set(prev).add(endpointKey))

        const response = await fetch(mocksApiBase, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            endpoint: endpointKey,
            scenarioId: isDefault ? null : scenarioId
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to update scenario')
        }

        await fetchEndpoints()
      } catch (err) {
        console.error('Error updating scenario:', err)
        alert(`Failed to update scenario: ${err instanceof Error ? err.message : 'Unknown error'}`)
      } finally {
        setUpdating(prev => {
          const next = new Set(prev)
          next.delete(endpointKey)
          return next
        })
      }
    },
    [fetchEndpoints, mocksApiBase]
  )

  return {endpoints, loading, error, updating, fetchEndpoints, updateScenario}
}
