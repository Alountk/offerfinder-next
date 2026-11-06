import type {OfferDetailDTO, OfferSummaryDTO, PaginatedOffersDTO} from '../domain/types'

export const DEFAULT_PAGE_SIZE = 10
export const MAX_PAGE_SIZE = 50

export interface SearchOffersParams {
  q?: string
  province?: string
  contractType?: string
  page?: number
  pageSize?: number
}

export function toSummary({
  id,
  title,
  companyName,
  province,
  contractType,
  salary,
  publishedAt
}: OfferDetailDTO): OfferSummaryDTO {
  return {id, title, companyName, province, contractType, salary, publishedAt}
}

function positiveInt(value: number | undefined, fallback: number): number {
  return value !== undefined && Number.isInteger(value) && value > 0 ? value : fallback
}

/** Pure filter + pagination over a list of offers; this is what the mock server does behind GET /offers. */
export function searchOffers(offers: OfferDetailDTO[], params: SearchOffersParams): PaginatedOffersDTO {
  const q = params.q?.trim().toLowerCase()
  const filtered = offers.filter(
    offer =>
      (!q || `${offer.title} ${offer.companyName}`.toLowerCase().includes(q)) &&
      (!params.province || offer.province.id === params.province) &&
      (!params.contractType || offer.contractType.id === params.contractType)
  )

  const pageSize = Math.min(positiveInt(params.pageSize, DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE)
  const page = positiveInt(params.page, 1)
  const totalPages = Math.ceil(filtered.length / pageSize)
  const start = (page - 1) * pageSize

  return {
    items: filtered.slice(start, start + pageSize).map(toSummary),
    page,
    pageSize,
    total: filtered.length,
    totalPages
  }
}
