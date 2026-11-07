import type {PaginatedOffersDTO} from '@live-coding/mocks-scenarios'
import {ApiError, getContractTypes, getProvinces, searchOffers} from './api'
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

  it('send search param as a query string value', async () => {
    fetchMock.mockResolvedValue(jsonResponse(page))

    await searchOffers({q: 'react dev', province: '28', contractType: 'indefinido'})

    expect(Object.fromEntries(lastRequestUrl().searchParams)).toEqual({
      q: 'react dev',
      province: '28',
      contractType: 'indefinido'
    })
  })
})

describe('catalogs', () => {
  const items = [{id: '28', label: 'Madrid'}]

  it('getProvinces calls GET /catalogs/provinces', async () => {
    fetchMock.mockResolvedValue(jsonResponse(items))

    await expect(getProvinces()).resolves.toEqual(items)

    expect(lastRequestUrl().href).toBe(`${API_BASE_URL}/catalogs/provinces`)
  })

  it('getContractTypes calls GET /catalogs/contract-types', async () => {
    fetchMock.mockResolvedValue(jsonResponse(items))

    await expect(getContractTypes()).resolves.toEqual(items)

    expect(lastRequestUrl().href).toBe(`${API_BASE_URL}/catalogs/contract-types`)
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
