import type {PaginatedOffersDTO} from '@live-coding/mocks-scenarios'
import {API_BASE_URL} from './config'

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

export function searchOffers(): Promise<PaginatedOffersDTO> {
  return request(`/offers`)
}
