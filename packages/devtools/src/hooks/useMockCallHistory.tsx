import {useState, useEffect, useCallback} from 'react'
import {useMocksServerUrl} from '../utils/mocksServerUrl'

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

export interface UseMockCallHistoryReturn {
  history: MockCallHistoryEntry[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  clearHistory: () => Promise<void>
}

const POLL_INTERVAL_MS = 2000

export function useMockCallHistory(): UseMockCallHistoryReturn {
  const mocksHistoryApi = `${useMocksServerUrl()}/api/debug/history`
  const [history, setHistory] = useState<MockCallHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      const response = await fetch(mocksHistoryApi)
      if (!response.ok) {
        throw new Error(`Failed to fetch mock call history: ${response.statusText}`)
      }
      const data = await response.json()
      setHistory(data.history ?? [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [mocksHistoryApi])

  useEffect(() => {
    ;(async () => {
      await refresh()
    })()

    const interval = setInterval(refresh, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [refresh])

  const clearHistory = useCallback(async () => {
    try {
      await fetch(mocksHistoryApi, {method: 'DELETE'})
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }, [refresh, mocksHistoryApi])

  return {history, loading, error, refresh, clearHistory}
}
