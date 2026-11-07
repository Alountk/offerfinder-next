import {defineConfig} from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  oxc: {jsx: {runtime: 'automatic'}},
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      'server-only': path.resolve(import.meta.dirname, 'vitest.server-only.ts')
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'app/**/*.test.{ts,tsx}']
  }
})
