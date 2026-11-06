export interface CatalogItem {
  id: string
  label: string
}

export interface OfferSummaryDTO {
  id: string
  title: string
  companyName: string
  province: CatalogItem
  contractType: CatalogItem
  salary: string | null
  publishedAt: string
}

export interface OfferDetailDTO extends OfferSummaryDTO {
  description: string
  requirements: string[]
  benefits: string[]
  workday: string
  teleworking: string
  vacancies: number
}

export interface PaginatedOffersDTO {
  items: OfferSummaryDTO[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface ApiErrorDTO {
  code: 'OfferNotFound' | 'UnexpectedError'
  message: string
}
