'use client'
import React, {useState} from 'react'
import {useDevToolsColors} from '../hooks/useDevToolsColors'
import {useMockScenarioResponse} from '../hooks/useMockScenarioResponse'
import {JsonViewer} from './JsonViewer'

interface ScenarioResponseProps {
  endpointKey: string
  currentScenario: string
}

/** Collapsible preview of the JSON returned by the scenario currently configured for an endpoint. */
export function ScenarioResponse({endpointKey, currentScenario}: ScenarioResponseProps) {
  const {colors} = useDevToolsColors()
  const [expanded, setExpanded] = useState(false)
  const {data, loading, error} = useMockScenarioResponse(endpointKey, currentScenario, expanded)

  return (
    <div style={{marginTop: '8px'}}>
      <button
        onClick={() => setExpanded(value => !value)}
        aria-expanded={expanded}
        style={{
          background: 'transparent',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: 500,
          color: colors.accentText
        }}
      >
        {expanded ? '▾' : '▸'} Response
      </button>

      {expanded && (
        <div
          style={{
            marginTop: '6px',
            padding: '8px',
            borderRadius: '6px',
            backgroundColor: colors.codeBg,
            maxHeight: '240px',
            overflow: 'auto',
            fontFamily: 'monospace',
            fontSize: '12px'
          }}
        >
          {error && <div style={{color: colors.dangerText}}>Error: {error}</div>}
          {!error && !data && loading && <div style={{color: colors.textSecondary}}>Loading...</div>}
          {data && (
            <>
              <div style={{color: colors.textSecondary, marginBottom: '6px'}}>
                {data.scenarioId} · status {data.statusCode}
              </div>
              <JsonViewer value={data.response} />
            </>
          )}
        </div>
      )}
    </div>
  )
}
