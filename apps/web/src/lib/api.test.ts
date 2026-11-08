import type {OfferDetailDTO, PaginatedOffersDTO} from '@live-coding/mocks-scenarios'
import {ApiError, getContractTypes, getOffer, getProvinces, searchOffers} from './api'
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

describe('getOffer', () => {
  const offer: OfferDetailDTO = {
    id: 'of-0001',
    title: 'Frontend Developer',
    companyName: 'Acme',
    province: {id: 'madrid', label: 'Madrid'},
    contractType: {id: 'indefinido', label: 'Indefinido'},
    salary: null,
    publishedAt: '2026-01-01',
    description: 'Build things',
    requirements: ['React'],
    benefits: ['Remote'],
    workday: 'Completa',
    teleworking: 'Híbrido',
    vacancies: 1
  }

  it('calls GET /offers/:id and returns the detail', async () => {
    fetchMock.mockResolvedValue(jsonResponse(offer))

    await expect(getOffer('of-0001')).resolves.toEqual(offer)

    expect(lastRequestUrl().href).toBe(`${API_BASE_URL}/offers/of-0001`)
  })

  it('encodes the id so it cannot change the requested path or query', async () => {
    fetchMock.mockResolvedValue(jsonResponse(offer))

    await getOffer('../catalogs/provinces?x=1')

    expect(lastRequestUrl().pathname).toBe(`${new URL(API_BASE_URL).pathname}/offers/..%2Fcatalogs%2Fprovinces%3Fx%3D1`)
    expect(lastRequestUrl().search).toBe('')
  })

  it('throws an ApiError with status 404 when the offer does not exist', async () => {
    fetchMock.mockResolvedValue(jsonResponse({code: 'OfferNotFound', message: 'Offer not found'}, 404))

    const error = await getOffer('of-9999').catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({status: 404})
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
