import {searchOffers} from '@/lib/api'
import {toQueryString} from '@/lib/queryString'
import type {OfferFilters} from '@/lib/searchParams'
import type {Route} from 'next'
import Link from 'next/link'
import {redirect} from 'next/navigation'
import {EmptyResults} from './EmptyResults'
import {Pagination} from './Pagination'

interface OffersResultsProps {
  filters: OfferFilters
}

export async function OffersResults({filters}: OffersResultsProps) {
  const {items, page, totalPages} = await searchOffers(filters)

  if (totalPages > 0 && page > totalPages) redirect(`/${toQueryString({...filters, page: totalPages})}` as Route)

  return (
    <>
      {items.length === 0 ? (
        <EmptyResults filters={filters} />
      ) : (
        <ul className="divide-y divide-border rounded border border-border">
          {items.map(offer => (
            <li key={offer.id} className="space-y-1 px-gutter py-3">
              <h2 className="font-semibold">
                <Link href={`/offers/${offer.id}`} className="underline">
                  {offer.title}
                </Link>
              </h2>
              <p>{offer.companyName}</p>
              <p className="text-label text-muted">
                {offer.province.label} · {offer.contractType.label}
              </p>
            </li>
          ))}
        </ul>
      )}
      <Pagination page={page} totalPages={totalPages} filters={filters} />
    </>
  )
}
