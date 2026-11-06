'use client'
import dynamic from 'next/dynamic'

const DevTools = dynamic(() => import('./DevTools').then(module => module.DevTools), {ssr: false})

/** Renders the DevTools only in development. Safe to drop in the root layout. */
export function DevToolsLoader() {
  return process.env.NODE_ENV === 'development' ? <DevTools /> : null
}
