import 'server-only'
import type {CatalogItem, PaginatedOffersDTO} from '@live-coding/mocks-scenarios'
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

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`)
  if (!response.ok) throw new ApiError(response.status, `Request failed with status ${response.status}`)
  return (await response.json()) as T
}

export function searchOffers(params: SearchOffersParams = {}): Promise<PaginatedOffersDTO> {
    return request(`/offers${toQueryString({...params})}`)
}

export async function getProvinces(): Promise<CatalogItem[]> {
  return request('/catalogs/provinces')
}

export async function getContractTypes(): Promise<CatalogItem[]> {
  return request('/catalogs/contract-types')
}