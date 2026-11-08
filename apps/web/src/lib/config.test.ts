import {assertApiConfigured} from './config'

describe('assertApiConfigured', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('fails in production when MOCKS_URL is missing', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('MOCKS_URL', '')

    expect(() => assertApiConfigured()).toThrow('MOCKS_URL')
  })

  it('passes in production when MOCKS_URL is set', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('MOCKS_URL', 'http://api.internal/jobs')

    expect(() => assertApiConfigured()).not.toThrow()
  })

  it('passes in development without MOCKS_URL', () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('MOCKS_URL', '')

    expect(() => assertApiConfigured()).not.toThrow()
  })
})
