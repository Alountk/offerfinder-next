import type {OfferFilters} from '@/lib/searchParams'
import {ButtonLink} from './ButtonLink'

interface PaginationProps {
  page: number
  totalPages: number
  filters: OfferFilters
}

export function Pagination({page, totalPages, filters}: PaginationProps) {
  if (totalPages <= 1) return null

  const hrefTo = (target: number) => ({pathname: '/', query: {...filters, page: target}})

  return (
    <nav aria-label="Paginación" className="flex flex-wrap items-center justify-between gap-2">
      {page > 1 ? (
        <ButtonLink href={hrefTo(page - 1)} variant="secondary">
          Anterior
        </ButtonLink>
      ) : (
        <span />
      )}
      <p className="whitespace-nowrap">
        Página {page} de {totalPages}
      </p>
      {page < totalPages ? (
        <ButtonLink href={hrefTo(page + 1)} variant="secondary">
          Siguiente
        </ButtonLink>
      ) : (
        <span />
      )}
    </nav>
  )
}
