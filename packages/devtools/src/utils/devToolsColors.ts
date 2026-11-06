export interface DevToolsLogTypeColors {
  pageView: string
  track: string
  identify: string
  experiment: string
  reset: string
  default: string
}

export interface DevToolsColors {
  panelBg: string
  headerAltBg: string
  codeBg: string
  textPrimary: string
  textSecondary: string
  textMuted: string
  textDisabled: string
  borderSubtle: string
  inputBg: string
  inputBorder: string
  accentText: string
  accentBg: string
  accentBgHover: string
  accentBorder: string
  accentBorderHover: string
  accentTintBg: string
  neutralChipBg: string
  neutralChipText: string
  dangerText: string
  dangerSoftBg: string
  dangerSoftText: string
  semanticBoolean: string
  semanticNumber: string
  semanticString: string
  semanticKey: string
  logType: DevToolsLogTypeColors
  hoverOverlay: string
}

const light: DevToolsColors = {
  panelBg: '#ffffff',
  headerAltBg: '#f9fafb',
  codeBg: '#f4f4f4',
  textPrimary: '#111827',
  textSecondary: '#6b7280',
  textMuted: '#9ca3af',
  textDisabled: '#9ca3af',
  borderSubtle: 'rgba(0, 0, 0, 0.1)',
  inputBg: '#ffffff',
  inputBorder: 'rgba(0, 0, 0, 0.2)',
  accentText: '#0b4dd0',
  accentBg: 'rgba(11, 77, 208, 0.08)',
  accentBgHover: 'rgba(11, 77, 208, 0.15)',
  accentBorder: 'rgba(11, 77, 208, 0.2)',
  accentBorderHover: 'rgba(11, 77, 208, 0.3)',
  accentTintBg: 'rgba(11, 77, 208, 0.05)',
  neutralChipBg: '#e5e7eb',
  neutralChipText: '#374151',
  dangerText: '#ef4444',
  dangerSoftBg: '#fee2e2',
  dangerSoftText: '#991b1b',
  semanticBoolean: '#0ea5e9',
  semanticNumber: '#8b5cf6',
  semanticString: '#10b981',
  semanticKey: '#ef4444',
  logType: {
    pageView: 'blue',
    track: 'green',
    identify: 'purple',
    experiment: 'orange',
    reset: 'red',
    default: 'black'
  },
  hoverOverlay: 'rgba(0, 0, 0, 0.05)'
}

const dark: DevToolsColors = {
  panelBg: '#1a1d23',
  headerAltBg: '#25282e',
  codeBg: '#111317',
  textPrimary: '#e5e7eb',
  textSecondary: '#9ca3af',
  textMuted: '#9ca3af',
  textDisabled: '#9ca3af',
  borderSubtle: 'rgba(255, 255, 255, 0.12)',
  inputBg: '#20232a',
  inputBorder: 'rgba(255, 255, 255, 0.22)',
  accentText: '#5b9dff',
  accentBg: 'rgba(91, 157, 255, 0.16)',
  accentBgHover: 'rgba(91, 157, 255, 0.24)',
  accentBorder: 'rgba(91, 157, 255, 0.35)',
  accentBorderHover: 'rgba(91, 157, 255, 0.45)',
  accentTintBg: 'rgba(91, 157, 255, 0.1)',
  neutralChipBg: '#374151',
  neutralChipText: '#d1d5db',
  dangerText: '#f87171',
  dangerSoftBg: '#7f1d1d',
  dangerSoftText: '#fecaca',
  semanticBoolean: '#38bdf8',
  semanticNumber: '#a78bfa',
  semanticString: '#34d399',
  semanticKey: '#f87171',
  logType: {
    pageView: '#60a5fa',
    track: '#34d399',
    identify: '#a78bfa',
    experiment: '#fb923c',
    reset: '#f87171',
    default: '#e5e7eb'
  },
  hoverOverlay: 'rgba(255, 255, 255, 0.08)'
}

export const devToolsColors = {light, dark}
