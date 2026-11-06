import fs from 'node:fs'
import path from 'node:path'
import {type ScenariosConfig} from './types.js'

export class ConfigManager {
  private configPath: string
  private config: ScenariosConfig = {}
  private watcher: fs.FSWatcher | null = null

  constructor(configPath: string) {
    this.configPath = configPath
    this.loadConfig()
    this.watchConfig()
  }

  private loadConfig(): void {
    try {
      if (fs.existsSync(this.configPath)) {
        const data = fs.readFileSync(this.configPath, 'utf-8')
        const parsed = JSON.parse(data)
        if (this.validateConfig(parsed)) {
          this.config = parsed
          console.log(`[Config Manager] Loaded ${Object.keys(this.config).length} scenario overrides`)
        } else {
          console.warn('[Config Manager] Invalid config structure, using empty config')
          this.config = {}
        }
      } else {
        console.log('[Config Manager] No config file found, using defaults')
        this.config = {}
      }
    } catch (error) {
      console.error('[Config Manager] Error loading config:', error)
      this.config = {}
    }
  }

  private validateConfig(data: unknown): data is ScenariosConfig {
    if (typeof data !== 'object' || data === null) return false

    return Object.entries(data).every(([key, value]) => {
      if (typeof key !== 'string') return false

      // Allow string (old format) or object (new format)
      if (typeof value === 'string') return true

      if (typeof value === 'object' && value !== null) {
        const config = value as {scenarioId?: unknown; delay?: unknown}
        // scenarioId is optional string, delay is optional number
        if (config.scenarioId !== undefined && typeof config.scenarioId !== 'string' && config.scenarioId !== null)
          return false
        if (config.delay !== undefined && typeof config.delay !== 'number') return false
        return true
      }

      return false
    })
  }

  private watchConfig(): void {
    const dir = path.dirname(this.configPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {recursive: true})
    }

    try {
      this.watcher = fs.watch(dir, (eventType, filename) => {
        if (filename === path.basename(this.configPath)) {
          console.log(`[Config Manager] Config file changed, reloading...`)
          this.loadConfig()
        }
      })
    } catch (error) {
      console.warn('[Config Manager] Failed to watch config file:', error)
    }
  }

  getScenarioId(endpointKey: string): string | null {
    const config = this.config[endpointKey]

    // Old format: direct string
    if (typeof config === 'string') return config

    // New format: object with scenarioId
    if (typeof config === 'object' && config !== null) {
      return config.scenarioId ?? null
    }

    return null
  }

  getDelay(endpointKey: string): number {
    const config = this.config[endpointKey]
    if (typeof config === 'object' && config !== null) {
      return config.delay ?? 0
    }
    return 0 // Default: no delay
  }

  setScenarioId(endpointKey: string, scenarioId: string | null): void {
    const current = this.config[endpointKey]

    if (scenarioId === null) {
      // If removing scenario and no delay exists, delete entry entirely
      if (typeof current === 'object' && current !== null && current.delay !== undefined) {
        // Keep delay, remove scenarioId
        this.config[endpointKey] = {delay: current.delay}
      } else {
        delete this.config[endpointKey]
      }
    } else {
      // Setting a scenario
      if (typeof current === 'object' && current !== null) {
        // Update existing object config
        this.config[endpointKey] = {...current, scenarioId}
      } else {
        // Create new object config (migrate from string or create new)
        this.config[endpointKey] = {scenarioId}
      }
    }
    this.saveConfig()
  }

  setDelay(endpointKey: string, delay: number): void {
    const current = this.config[endpointKey]

    if (typeof current === 'string') {
      // Migrate from old format: "scenarioId" → { scenarioId: "...", delay: ... }
      this.config[endpointKey] = {scenarioId: current, delay}
    } else if (typeof current === 'object' && current !== null) {
      // Update existing object config
      this.config[endpointKey] = {...current, delay}
    } else {
      // New config entry with only delay
      this.config[endpointKey] = {delay}
    }

    this.saveConfig()
  }

  clearAll(): void {
    this.config = {}
    this.saveConfig()
  }

  private saveConfig(): void {
    try {
      const data = JSON.stringify(this.config, null, 2)
      fs.writeFileSync(this.configPath, data, 'utf-8')
      console.log('[Config Manager] Config saved successfully')
    } catch (error) {
      console.error('[Config Manager] Error saving config:', error)
      throw error
    }
  }

  getAllOverrides(): ScenariosConfig {
    return {...this.config}
  }

  destroy(): void {
    if (this.watcher) {
      this.watcher.close()
      this.watcher = null
    }
  }
}
