'use client'
import React from 'react'
import {useDevToolsColors} from '../hooks/useDevToolsColors'
import type {DevToolsColors} from '../utils/devToolsColors'

function renderValue(value: unknown, colors: DevToolsColors, depth = 0): React.ReactNode {
  if (value === null) return <span style={{color: colors.textMuted}}>null</span>
  if (value === undefined) return <span style={{color: colors.textMuted}}>undefined</span>
  if (typeof value === 'boolean') return <span style={{color: colors.semanticBoolean}}>{value.toString()}</span>
  if (typeof value === 'number') return <span style={{color: colors.semanticNumber}}>{value}</span>
  if (typeof value === 'string') return <span style={{color: colors.semanticString}}>&quot;{value}&quot;</span>

  if (Array.isArray(value)) {
    if (value.length === 0) return <span style={{color: colors.textMuted}}>[]</span>
    return (
      <div style={{marginLeft: `${depth * 16}px`}}>
        {value.map((item, index) => (
          <div key={index} style={{marginBottom: '4px'}}>
            <span style={{color: colors.textSecondary}}>[{index}]:</span> {renderValue(item, colors, depth + 1)}
          </div>
        ))}
      </div>
    )
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value)
    if (entries.length === 0) return <span style={{color: colors.textMuted}}>{'{}'}</span>

    return (
      <div style={{marginLeft: `${depth * 16}px`}}>
        {entries.map(([key, val]) => (
          <div key={key} style={{marginBottom: '4px'}}>
            <span style={{color: colors.semanticKey, fontWeight: '500'}}>{key}:</span>{' '}
            {renderValue(val, colors, depth + 1)}
          </div>
        ))}
      </div>
    )
  }

  return <span style={{color: colors.textPrimary}}>{String(value)}</span>
}

export function JsonViewer({value}: {value: unknown}) {
  const {colors} = useDevToolsColors()

  return (
    <div style={{fontSize: '13px', fontFamily: 'monospace', color: colors.textPrimary}}>
      {renderValue(value, colors)}
    </div>
  )
}
