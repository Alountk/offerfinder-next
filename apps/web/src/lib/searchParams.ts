import {SearchOffersParams} from '@live-coding/mocks-scenarios/searchOffers'

export type RawSearchParams = Record<string, string | string[] | undefined>

export type OfferFilters = Pick<SearchOffersParams, 'q' | 'province' | 'contractType'>

export function firstParamValue(value: string | string[] | undefined): string | undefined {
  const first = Array.isArray(value) ? value[0] : value
  const trimmed = first?.trim()
  return trimmed ? trimmed : undefined
}

export function parseSearchParams(raw: RawSearchParams): OfferFilters {
  const filters: OfferFilters = {}
  const q = firstParamValue(raw.q)
  const province = firstParamValue(raw.province)
  const contractType = firstParamValue(raw.contractType)

  if (q) filters.q = q
  if (province) filters.province = province
  if (contractType) filters.contractType = contractType

  return filters
}
