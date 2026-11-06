import {useSyncExternalStore} from 'react'
import {devToolsColors, type DevToolsColors} from '../utils/devToolsColors'

const QUERY = '(prefers-color-scheme: dark)'

function subscribe(callback: () => void) {
  const media = window.matchMedia(QUERY)
  media.addEventListener('change', callback)
  return () => media.removeEventListener('change', callback)
}

interface UseDevToolsColorsReturn {
  isDark: boolean
  colors: DevToolsColors
}

export function useDevToolsColors(): UseDevToolsColorsReturn {
  const isDark = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false
  )

  return {isDark, colors: isDark ? devToolsColors.dark : devToolsColors.light}
}
