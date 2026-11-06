declare global {
  interface Window {
    __MOCKED_REQUESTS_HISTORY__?: Array<{method: string; path: string; timestamp: number}>
    __MOCKS_FETCH_PATCHED__?: boolean
  }
}

function recordMockedRequest(response: Response): void {
  const mockedRequest = response.headers.get('X-Mocked-Request')
  if (!mockedRequest) return

  const [method, path] = mockedRequest.split(' ', 2)
  if (!method || !path) return

  window.__MOCKED_REQUESTS_HISTORY__ = [
    ...(window.__MOCKED_REQUESTS_HISTORY__ ?? []).slice(-99),
    {method, path, timestamp: Date.now()}
  ]
  window.dispatchEvent(new CustomEvent('ij:mocked-request'))
}

/** Patches window.fetch (once) so the DevTools can highlight the mocked endpoints the page has called. */
export function installMocksInterceptor(): void {
  if (typeof window === 'undefined' || window.__MOCKS_FETCH_PATCHED__) return
  window.__MOCKS_FETCH_PATCHED__ = true

  const originalFetch = window.fetch.bind(window)
  window.fetch = async (...args) => {
    const response = await originalFetch(...args)
    recordMockedRequest(response)
    return response
  }
}
