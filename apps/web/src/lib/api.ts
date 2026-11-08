import 'server-only'
import type {CatalogItem, OfferDetailDTO, PaginatedOffersDTO} from '@live-coding/mocks-scenarios'
import {API_BASE_URL} from './config'
import {toQueryString} from './queryString'
import { SearchOffersParams } from '@live-coding/mocks-scenarios/searchOffers'

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

const CATALOG_CACHE: RequestInit = {next: {revalidate: 3600}}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, init)
  if (!response.ok) throw new ApiError(response.status, `Request failed with status ${response.status}`)
  return (await response.json()) as T
}

export function searchOffers(params: SearchOffersParams = {}): Promise<PaginatedOffersDTO> {
    return request(`/offers${toQueryString({...params})}`)
}

export async function getOffer(id: string): Promise<OfferDetailDTO> {
  return request(`/offers/${encodeURIComponent(id)}`)
}

export async function getProvinces(): Promise<CatalogItem[]> {
  return request('/catalogs/provinces', CATALOG_CACHE)
}

export async function getContractTypes(): Promise<CatalogItem[]> {
  return request('/catalogs/contract-types', CATALOG_CACHE)
}