import type {OfferFilters} from '@/lib/searchParams'
import {ButtonLink} from './ButtonLink'

interface EmptyResultsProps {
  filters: OfferFilters
}

export function EmptyResults({filters}: EmptyResultsProps) {
  const hasFilters = Boolean(filters.q || filters.province || filters.contractType)

  return (
    <div className="flex flex-col items-center gap-3 rounded border border-dashed border-border p-gutter text-center">
      <p>No hay ofertas que coincidan con tu búsqueda.</p>
      <p className="text-label text-muted">Prueba con otras palabras o cambia los filtros.</p>
      {hasFilters && (
        <ButtonLink href="/" variant="secondary">
          Quitar filtros
        </ButtonLink>
      )}
    </div>
  )
}
