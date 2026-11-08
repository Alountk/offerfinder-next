/** Base URL of the jobs API. In this exercise it is served by the mock server. Use it from server code. */
export const API_BASE_URL = process.env.MOCKS_URL ?? 'http://localhost:5001/jobs'

export function assertApiConfigured() {
  if (process.env.NODE_ENV === 'production' && !process.env.MOCKS_URL) {
    throw new Error('MOCKS_URL is required in production: set the base URL of the jobs API')
  }
}