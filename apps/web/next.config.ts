import type {NextConfig} from 'next'

const nextConfig: NextConfig = {
  typedRoutes: true,
  transpilePackages: ['@live-coding/devtools', '@live-coding/mocks-scenarios']
}

export default nextConfig
