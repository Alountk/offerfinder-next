const DEFAULT_MOCKS_SERVER_URL = 'http://localhost:5001/jobs'

/** Browser-side URL of the mock server router. Override with NEXT_PUBLIC_MOCKS_URL. */
export function useMocksServerUrl(): string {
  return process.env.NEXT_PUBLIC_MOCKS_URL ?? DEFAULT_MOCKS_SERVER_URL
}
