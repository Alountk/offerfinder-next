import type {PaginatedOffersDTO} from '@live-coding/mocks-scenarios'
import {ApiError, searchOffers} from './api'
import {API_BASE_URL} from './config'

const fetchMock = vi.fn<typeof fetch>()

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {status, headers: {'Content-Type': 'application/json'}})
}

function lastRequestUrl(): URL {
  return new URL(String(fetchMock.mock.calls.at(-1)?.[0]))
}

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('searchOffers', () => {
  const page: PaginatedOffersDTO = {items: [], page: 1, pageSize: 10, total: 0, totalPages: 0}

  it('calls GET /offers and returns the paginated body', async () => {
    fetchMock.mockResolvedValue(jsonResponse(page))

    await expect(searchOffers()).resolves.toEqual(page)

    expect(lastRequestUrl().href).toBe(`${API_BASE_URL}/offers`)
  })
})

describe('errors', () => {
  it('throws an ApiError with the response status when the request fails', async () => {
    fetchMock.mockResolvedValue(jsonResponse({name: 'ApiError', message: 'Request failed with status 500'}, 500))

    const error = await searchOffers().catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({name: 'ApiError', status: 500, message: 'Request failed with status 500'})
  })

  it('throws an ApiError even when the error body is not JSON', async () => {
    fetchMock.mockResolvedValue(new Response('<html>Bad gateway</html>', {status: 502}))

    const error = await searchOffers().catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({name: 'ApiError', status: 502, message: 'Request failed with status 502'})
  })
})
