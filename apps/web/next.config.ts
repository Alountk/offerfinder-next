import type {NextConfig} from 'next'
import path from 'node:path'

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.join(import.meta.dirname, '../..'),
  typedRoutes: true,
  transpilePackages: ['@live-coding/devtools', '@live-coding/mocks-scenarios']
}

export default nextConfig
