import {SearchOffersParams} from '@live-coding/mocks-scenarios/searchOffers'

export type RawSearchParams = Record<string, string | string[] | undefined>

export type OfferFilters = Pick<SearchOffersParams, 'q' | 'province' | 'contractType' | 'page'>

const POSITIVE_INTEGER = /^[1-9]\d*$/

export function firstParamValue(value: string | string[] | undefined): string | undefined {
  const first = Array.isArray(value) ? value[0] : value
  const trimmed = first?.trim()
  return trimmed ? trimmed : undefined
}

export function parsePageParam(value: string | string[] | undefined): number | undefined {
  const page = firstParamValue(value)
  return page && POSITIVE_INTEGER.test(page) ? Number(page) : undefined
}

export function parseSearchParams(raw: RawSearchParams): OfferFilters {
  const filters: OfferFilters = {}
  const q = firstParamValue(raw.q)
  const province = firstParamValue(raw.province)
  const contractType = firstParamValue(raw.contractType)
  const page = parsePageParam(raw.page)

  if (q) filters.q = q
  if (province) filters.province = province
  if (contractType) filters.contractType = contractType
  if (page) filters.page = page

  return filters
}
