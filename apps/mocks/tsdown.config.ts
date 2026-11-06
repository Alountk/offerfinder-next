import {defineConfig} from 'tsdown'

export default defineConfig({
  entry: ['src/server.ts'],
  format: ['esm'],
  platform: 'node',
  target: 'node22',
  minify: false,
  // Enable source maps with inline sources for stack trace mapping
  sourcemap: 'inline',
  outDir: 'dist',
  clean: true,
  // Bundle all dependencies into single file
  deps: {
    alwaysBundle: [/.*/]
  },
  // Shims for Node.js built-ins (needed for ESM)
  shims: true
})
