'use client'
import React, {useEffect, useState} from 'react'
import {MocksContent} from './components/MocksContent'
import {MockCallsContent} from './components/MockCallsContent'
import {useDevToolsColors} from './hooks/useDevToolsColors'
import {installMocksInterceptor} from './utils/mocksInterceptor'

type Tab = 'mocks' | 'mockCalls'

const TABS: Array<{id: Tab; label: string}> = [
  {id: 'mocks', label: 'Mocks'},
  {id: 'mockCalls', label: 'Mock Calls'}
]

/** Floating panel to inspect the mock server endpoints, force scenarios/delays and see the call history. */
export function DevTools() {
  const {colors} = useDevToolsColors()
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('mocks')

  useEffect(() => {
    installMocksInterceptor()
  }, [])

  return (
    <div style={{position: 'fixed', right: 16, bottom: 16, zIndex: 2147483647, fontFamily: 'system-ui, sans-serif'}}>
      {open && (
        <div
          role="dialog"
          aria-label="DevTools"
          style={{
            width: 560,
            maxWidth: 'calc(100vw - 32px)',
            height: 560,
            maxHeight: 'calc(100vh - 80px)',
            marginBottom: 8,
            display: 'flex',
            flexDirection: 'column',
            background: colors.panelBg,
            color: colors.textPrimary,
            border: `1px solid ${colors.borderSubtle}`,
            borderRadius: 8,
            boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
            overflow: 'hidden'
          }}
        >
          <div
            style={{display: 'flex', background: colors.headerAltBg, borderBottom: `1px solid ${colors.borderSubtle}`}}
          >
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '10px 16px',
                  border: 'none',
                  cursor: 'pointer',
                  background: activeTab === tab.id ? colors.accentBg : 'transparent',
                  color: activeTab === tab.id ? colors.accentText : colors.textSecondary,
                  fontWeight: activeTab === tab.id ? 600 : 400
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div style={{flex: 1, overflow: 'auto', padding: 12}}>
            {activeTab === 'mocks' && <MocksContent />}
            {activeTab === 'mockCalls' && <MockCallsContent />}
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen(value => !value)}
        aria-expanded={open}
        style={{
          display: 'block',
          marginLeft: 'auto',
          padding: '8px 14px',
          borderRadius: 999,
          border: `1px solid ${colors.accentBorder}`,
          background: colors.panelBg,
          color: colors.accentText,
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
        }}
      >
        🛠 DevTools
      </button>
    </div>
  )
}
