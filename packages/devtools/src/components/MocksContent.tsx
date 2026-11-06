'use client'
import React, {useState, useEffect} from 'react'
import {useDevToolsColors} from '../hooks/useDevToolsColors'
import {useMockScenarios, type EndpointInfo} from '../hooks/useMockScenarios'
import {useMocksServerUrl} from '../utils/mocksServerUrl'
import {ScenarioResponse} from './ScenarioResponse'

declare global {
  interface Window {
    __MOCKED_REQUESTS_HISTORY__?: Array<{
      method: string
      path: string
      timestamp: number
    }>
  }
}

export function MocksContent() {
  const mocksServerUrl = useMocksServerUrl()
  const mocksApiBase = `${mocksServerUrl}/api/debug/scenarios`
  const {colors} = useDevToolsColors()
  const {endpoints, loading, error, updating, fetchEndpoints, updateScenario} = useMockScenarios()
  const [searchQuery, setSearchQuery] = useState('')
  const [delayValues, setDelayValues] = useState<Record<string, number>>({})
  const [showOnlyCalledEndpoints, setShowOnlyCalledEndpoints] = useState(false)
  const [mockedRequestsHistory, setMockedRequestsHistory] = useState<
    Array<{method: string; path: string; timestamp: number}>
  >([])

  // Listen to mocked request events
  useEffect(() => {
    const handleMockedRequestUpdate = () => {
      setMockedRequestsHistory(window.__MOCKED_REQUESTS_HISTORY__ ?? [])
    }

    // Initial load
    handleMockedRequestUpdate()

    // Listen for updates
    window.addEventListener('ij:mocked-request', handleMockedRequestUpdate)

    return () => {
      window.removeEventListener('ij:mocked-request', handleMockedRequestUpdate)
    }
  }, [])

  const handleDelayChange = async (endpoint: EndpointInfo, delayMs: number) => {
    const endpointKey = `${endpoint.method} ${endpoint.path}`

    // Validate input
    const delay = Math.max(0, Math.min(10000, delayMs))

    // Update local state immediately for responsive UI
    setDelayValues(prev => ({...prev, [endpointKey]: delay}))

    try {
      const response = await fetch(mocksApiBase, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          endpoint: endpointKey,
          scenarioId: endpoint.isOverridden ? endpoint.currentScenario : null,
          delay
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update delay')
      }

      // Refresh to confirm server state
      await fetchEndpoints()
    } catch (err) {
      console.error('Error updating delay:', err)
      alert(`Failed to update delay: ${err instanceof Error ? err.message : 'Unknown error'}`)
      // Revert on error
      await fetchEndpoints()
    }
  }

  const handleResetAll = async () => {
    if (!confirm('Are you sure you want to reset all scenario overrides to default?')) {
      return
    }

    try {
      // Reset all overridden endpoints to default
      const overriddenEndpoints = endpoints.filter(e => e.isOverridden)

      await Promise.all(
        overriddenEndpoints.map(endpoint => {
          const endpointKey = `${endpoint.method} ${endpoint.path}`
          return fetch(mocksApiBase, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              endpoint: endpointKey,
              scenarioId: null
            })
          })
        })
      )
      await fetchEndpoints()
    } catch (err) {
      console.error('Error resetting scenarios:', err)
      alert(`Failed to reset scenarios: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  // Helper: Check if endpoint was called
  const isEndpointCalled = (endpoint: EndpointInfo): boolean => {
    const endpointKey = `${endpoint.method} ${endpoint.path}`

    return mockedRequestsHistory.some(entry => {
      const historyKey = `${entry.method} ${entry.path}`
      return historyKey === endpointKey
    })
  }

  // Helper: Count calls to endpoint
  const getEndpointCallCount = (endpoint: EndpointInfo): number => {
    const endpointKey = `${endpoint.method} ${endpoint.path}`

    return mockedRequestsHistory.filter(entry => {
      const historyKey = `${entry.method} ${entry.path}`
      return historyKey === endpointKey
    }).length
  }

  const filteredEndpoints = endpoints.filter(endpoint => {
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch =
      endpoint.method.toLowerCase().includes(searchLower) ||
      endpoint.path.toLowerCase().includes(searchLower) ||
      endpoint.currentScenario.toLowerCase().includes(searchLower)

    if (!matchesSearch) return false

    // Filter by called endpoints if checkbox is active
    if (showOnlyCalledEndpoints && !isEndpointCalled(endpoint)) {
      return false
    }

    return true
  })

  // Styles (matching DevTools pattern)
  const searchContainerStyle: React.CSSProperties = {
    position: 'sticky',
    top: '-16px',
    zIndex: 100,
    backgroundColor: colors.panelBg,
    paddingTop: '16px',
    paddingBottom: '16px',
    borderBottom: `2px solid ${colors.borderSubtle}`,
    marginBottom: '16px',
    marginLeft: '-16px',
    marginRight: '-16px',
    paddingLeft: '16px',
    paddingRight: '16px'
  }

  const searchInputStyle: React.CSSProperties = {
    flex: 1,
    padding: '8px 12px',
    borderRadius: '6px',
    border: `1px solid ${colors.inputBorder}`,
    backgroundColor: colors.inputBg,
    color: colors.textPrimary,
    fontSize: '14px',
    outline: 'none'
  }

  const buttonStyle: React.CSSProperties = {
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  }

  const endpointItemStyle: React.CSSProperties = {
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '12px',
    border: `1px solid ${colors.borderSubtle}`,
    color: colors.textPrimary,
    transition: 'all 0.15s ease'
  }

  const overriddenEndpointStyle: React.CSSProperties = {
    ...endpointItemStyle,
    backgroundColor: colors.accentTintBg,
    borderLeft: `3px solid ${colors.accentText}`
  }

  const methodBadgeStyle = (method: string): React.CSSProperties => {
    const methodColors: Record<string, string> = {
      GET: '#10b981',
      POST: '#3b82f6',
      PUT: '#8b5cf6',
      DELETE: '#ef4444',
      PATCH: '#f59e0b'
    }

    return {
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: '600',
      color: 'white',
      backgroundColor: methodColors[method] || '#6b7280',
      marginRight: '8px'
    }
  }

  const overrideBadgeStyle: React.CSSProperties = {
    fontSize: '10px',
    padding: '2px 6px',
    borderRadius: '3px',
    backgroundColor: colors.accentText,
    color: 'white',
    fontWeight: '600',
    marginLeft: '8px'
  }

  const selectStyle: React.CSSProperties = {
    padding: '6px 10px',
    borderRadius: '6px',
    border: `1px solid ${colors.inputBorder}`,
    fontSize: '13px',
    backgroundColor: colors.inputBg,
    color: colors.textPrimary,
    cursor: 'pointer',
    outline: 'none',
    width: '100%',
    maxWidth: '200px'
  }

  const inputStyle: React.CSSProperties = {
    padding: '6px 10px',
    borderRadius: '6px',
    border: `1px solid ${colors.inputBorder}`,
    fontSize: '13px',
    backgroundColor: colors.inputBg,
    color: colors.textPrimary,
    outline: 'none'
  }

  if (loading && endpoints.length === 0) {
    return <div style={{color: colors.textSecondary, fontSize: '14px'}}>Loading mock scenarios...</div>
  }

  if (error && endpoints.length === 0) {
    return (
      <div>
        <div style={{color: colors.dangerText, fontSize: '14px', marginBottom: '12px'}}>Error: {error}</div>
        <div style={{color: colors.textSecondary, fontSize: '13px'}}>
          Make sure the mocks server is running on {mocksServerUrl}
        </div>
        <button
          style={{...buttonStyle, backgroundColor: colors.accentText, color: 'white', marginTop: '12px'}}
          onClick={fetchEndpoints}
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div style={{position: 'relative', fontSize: '14px'}}>
      <div style={searchContainerStyle}>
        <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
          <input
            type="text"
            placeholder="Search endpoints..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={searchInputStyle}
            onFocus={e => (e.target.style.borderColor = colors.accentBorder)}
            onBlur={e => (e.target.style.borderColor = colors.inputBorder)}
          />
          <button
            style={{...buttonStyle, backgroundColor: colors.dangerText, color: 'white'}}
            onClick={handleResetAll}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Reset All
          </button>
          <button
            style={{...buttonStyle, backgroundColor: colors.textSecondary, color: 'white'}}
            onClick={fetchEndpoints}
            disabled={loading}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Refresh
          </button>
        </div>

        {/* Filter controls */}
        <div style={{display: 'flex', gap: '12px', alignItems: 'center', marginTop: '8px'}}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              color: colors.textPrimary,
              cursor: 'pointer'
            }}
          >
            <input
              type="checkbox"
              checked={showOnlyCalledEndpoints}
              onChange={e => setShowOnlyCalledEndpoints(e.target.checked)}
              style={{cursor: 'pointer'}}
            />
            Show only called endpoints ({mockedRequestsHistory.length} requests tracked)
          </label>

          {mockedRequestsHistory.length > 0 && (
            <button
              style={{
                ...buttonStyle,
                backgroundColor: 'transparent',
                color: colors.textSecondary,
                border: `1px solid ${colors.inputBorder}`,
                padding: '4px 8px',
                fontSize: '12px'
              }}
              onClick={() => {
                window.__MOCKED_REQUESTS_HISTORY__ = []
                setMockedRequestsHistory([])
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = colors.hoverOverlay)}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              Clear history
            </button>
          )}
        </div>
      </div>

      {filteredEndpoints.length === 0 ? (
        <div style={{color: colors.textSecondary, fontSize: '13px'}}>
          {searchQuery ? 'No endpoints match your search' : 'No endpoints available'}
        </div>
      ) : (
        filteredEndpoints.map(endpoint => {
          const endpointKey = `${endpoint.method} ${endpoint.path}`
          const isUpdating = updating.has(endpointKey)
          const callCount = getEndpointCallCount(endpoint)
          const wasCalled = callCount > 0

          return (
            <div key={endpointKey} style={endpoint.isOverridden ? overriddenEndpointStyle : endpointItemStyle}>
              <div style={{display: 'flex', alignItems: 'center', marginBottom: '8px'}}>
                <span style={methodBadgeStyle(endpoint.method)}>{endpoint.method}</span>
                <span style={{fontSize: '13px', fontFamily: 'monospace', flex: 1, color: colors.textPrimary}}>
                  {endpoint.path}
                </span>
                {endpoint.isOverridden && <span style={overrideBadgeStyle}>OVERRIDE</span>}
                {/* Call count indicator */}
                {wasCalled && (
                  <span
                    style={{
                      fontSize: '11px',
                      padding: '2px 6px',
                      borderRadius: '3px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      fontWeight: '600',
                      marginLeft: '8px'
                    }}
                  >
                    {callCount} call{callCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                <label style={{fontSize: '13px', fontWeight: '500', color: colors.textSecondary}}>Scenario:</label>
                <select
                  value={endpoint.currentScenario}
                  onChange={e => updateScenario(endpoint, e.target.value)}
                  disabled={isUpdating}
                  style={{
                    ...selectStyle,
                    opacity: isUpdating ? 0.5 : 1,
                    cursor: isUpdating ? 'wait' : 'pointer'
                  }}
                  onFocus={e => (e.target.style.borderColor = colors.accentBorder)}
                  onBlur={e => (e.target.style.borderColor = colors.inputBorder)}
                >
                  {endpoint.availableScenarios.map(scenario => (
                    <option key={scenario} value={scenario}>
                      {scenario}
                      {scenario === 'default' ? ' (default)' : ''}
                    </option>
                  ))}
                </select>

                <label style={{fontSize: '13px', fontWeight: '500', color: colors.textSecondary, marginLeft: '12px'}}>
                  Delay (ms):
                </label>
                <input
                  type="number"
                  min="0"
                  max="10000"
                  step="100"
                  value={delayValues[endpointKey] ?? endpoint.delay ?? 0}
                  onChange={e => {
                    const value = parseInt(e.target.value) || 0
                    handleDelayChange(endpoint, value)
                  }}
                  disabled={isUpdating}
                  style={{
                    ...inputStyle,
                    width: '80px',
                    opacity: isUpdating ? 0.5 : 1,
                    cursor: isUpdating ? 'wait' : 'auto'
                  }}
                  onFocus={e => (e.target.style.borderColor = colors.accentBorder)}
                  onBlur={e => (e.target.style.borderColor = colors.inputBorder)}
                />

                {(delayValues[endpointKey] ?? 0) > 0 && (
                  <span style={{fontSize: '11px', color: colors.textSecondary}}>
                    ({((delayValues[endpointKey] ?? 0) / 1000).toFixed(1)}s)
                  </span>
                )}

                {!endpoint.isValidScenario && (
                  <span style={{fontSize: '12px', color: colors.dangerText}}>⚠ Invalid scenario</span>
                )}
              </div>

              <ScenarioResponse endpointKey={endpointKey} currentScenario={endpoint.currentScenario} />
            </div>
          )
        })
      )}
    </div>
  )
}
