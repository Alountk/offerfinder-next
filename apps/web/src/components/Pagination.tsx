import Link from 'next/link'
import type {OfferFilters} from '@/lib/searchParams'

interface PaginationProps {
  page: number
  totalPages: number
  filters: OfferFilters
}

export function Pagination({page, totalPages, filters}: PaginationProps) {
  if (totalPages <= 1) return null

  const hrefTo = (target: number) => ({pathname: '/', query: {...filters, page: target}})

  return (
    <nav aria-label="Paginación" className="flex items-center justify-between">
      {page > 1 ? (
        <Link href={hrefTo(page - 1)} className="underline">
          Anterior
        </Link>
      ) : (
        <span />
      )}
      <p>
        Página {page} de {totalPages}
      </p>
      {page < totalPages ? (
        <Link href={hrefTo(page + 1)} className="underline">
          Siguiente
        </Link>
      ) : (
        <span />
      )}
    </nav>
  )
}
