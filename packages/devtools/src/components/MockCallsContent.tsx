'use client'
import React, {useMemo, useState} from 'react'
import {useDevToolsColors} from '../hooks/useDevToolsColors'
import {useMockCallHistory, type MockCallHistoryEntry} from '../hooks/useMockCallHistory'
import {useMockScenarios} from '../hooks/useMockScenarios'
import {useMocksServerUrl} from '../utils/mocksServerUrl'
import {JsonViewer} from './JsonViewer'

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

const statusBadgeStyle = (statusCode: number): React.CSSProperties => {
  let backgroundColor = '#ef4444'
  if (statusCode >= 200 && statusCode < 400) backgroundColor = '#10b981'
  else if (statusCode >= 400 && statusCode < 500) backgroundColor = '#f59e0b'

  return {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600',
    color: 'white',
    backgroundColor,
    marginRight: '8px'
  }
}

export function MockCallsContent() {
  const mocksServerUrl = useMocksServerUrl()
  const {colors} = useDevToolsColors()
  const {history, loading, error, refresh, clearHistory} = useMockCallHistory()
  const {endpoints, updating, updateScenario} = useMockScenarios()
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const endpointsByKey = useMemo(() => {
    return Object.fromEntries(endpoints.map(endpoint => [`${endpoint.method} ${endpoint.path}`, endpoint]))
  }, [endpoints])

  const toggleExpanded = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const sortedHistory = [...history].sort((a, b) => b.timestamp - a.timestamp)

  const headerStyle: React.CSSProperties = {
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
    paddingRight: '16px',
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
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

  const entryStyle: React.CSSProperties = {
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '12px',
    border: `1px solid ${colors.borderSubtle}`,
    color: colors.textPrimary
  }

  const scenarioBadgeStyle: React.CSSProperties = {
    fontSize: '11px',
    padding: '2px 6px',
    borderRadius: '3px',
    backgroundColor: colors.accentTintBg,
    color: colors.accentText,
    fontWeight: '600',
    marginRight: '8px'
  }

  const jsonContainerStyle: React.CSSProperties = {
    marginTop: '8px',
    padding: '12px',
    borderRadius: '6px',
    backgroundColor: colors.codeBg,
    maxHeight: '300px',
    overflow: 'auto'
  }

  const scenarioSelectStyle: React.CSSProperties = {
    padding: '4px 8px',
    borderRadius: '6px',
    border: `1px solid ${colors.inputBorder}`,
    fontSize: '12px',
    backgroundColor: colors.inputBg,
    color: colors.textPrimary,
    cursor: 'pointer',
    outline: 'none',
    marginRight: '8px'
  }

  if (loading && history.length === 0) {
    return <div style={{color: colors.textSecondary, fontSize: '14px'}}>Loading mock call history...</div>
  }

  if (error && history.length === 0) {
    return (
      <div>
        <div style={{color: colors.dangerText, fontSize: '14px', marginBottom: '12px'}}>Error: {error}</div>
        <div style={{color: colors.textSecondary, fontSize: '13px'}}>
          Make sure the mocks server is running on {mocksServerUrl}
        </div>
        <button
          style={{...buttonStyle, backgroundColor: colors.accentText, color: 'white', marginTop: '12px'}}
          onClick={refresh}
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div style={{position: 'relative', fontSize: '14px'}}>
      <div style={headerStyle}>
        <span style={{fontSize: '13px', color: colors.textSecondary, flex: 1}}>
          {sortedHistory.length} call{sortedHistory.length !== 1 ? 's' : ''} tracked (last 50)
        </span>
        <button
          style={{...buttonStyle, backgroundColor: colors.textSecondary, color: 'white'}}
          onClick={refresh}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          Refresh
        </button>
        <button
          style={{...buttonStyle, backgroundColor: colors.dangerText, color: 'white'}}
          onClick={clearHistory}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          Clear
        </button>
      </div>

      {sortedHistory.length === 0 ? (
        <div style={{color: colors.textSecondary, fontSize: '13px'}}>No mock calls recorded yet.</div>
      ) : (
        sortedHistory.map((entry: MockCallHistoryEntry) => {
          const isExpanded = expandedIds.has(entry.id)
          const endpointKey = `${entry.method} ${entry.path}`
          const endpoint = endpointsByKey[endpointKey]
          const isUpdating = updating.has(endpointKey)

          return (
            <div key={entry.id} style={entryStyle}>
              <div style={{display: 'flex', alignItems: 'center', marginBottom: '4px'}}>
                <span style={methodBadgeStyle(entry.method)}>{entry.method}</span>
                <span style={{fontSize: '13px', fontFamily: 'monospace', flex: 1, color: colors.textPrimary}}>
                  {entry.path}
                </span>
                <span style={{fontSize: '11px', color: colors.textMuted}}>
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div style={{display: 'flex', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '4px'}}>
                <span style={scenarioBadgeStyle}>Used: {entry.scenarioId}</span>
                <span style={statusBadgeStyle(entry.statusCode)}>{entry.statusCode}</span>
                {endpoint && (
                  <>
                    <label style={{fontSize: '12px', color: colors.textSecondary}}>Scenario:</label>
                    <select
                      value={endpoint.currentScenario}
                      disabled={isUpdating}
                      onChange={e => updateScenario(endpoint, e.target.value)}
                      style={{
                        ...scenarioSelectStyle,
                        opacity: isUpdating ? 0.5 : 1,
                        cursor: isUpdating ? 'wait' : 'pointer'
                      }}
                    >
                      {endpoint.availableScenarios.map(scenario => (
                        <option key={scenario} value={scenario}>
                          {scenario}
                          {scenario === 'default' ? ' (default)' : ''}
                        </option>
                      ))}
                    </select>
                  </>
                )}
                <button
                  style={{
                    ...buttonStyle,
                    padding: '4px 10px',
                    fontSize: '12px',
                    backgroundColor: 'transparent',
                    color: colors.accentText,
                    border: `1px solid ${colors.accentBorder}`
                  }}
                  onClick={() => toggleExpanded(entry.id)}
                >
                  {isExpanded ? 'Hide JSON' : 'View JSON'}
                </button>
              </div>
              {isExpanded && (
                <div style={jsonContainerStyle}>
                  <JsonViewer value={entry.response} />
                </div>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}
