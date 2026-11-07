import {Pagination} from '@/components/Pagination'
import {SearchFilters} from '@/components/SearchFilters'
import {getContractTypes, getProvinces, searchOffers} from '@/lib/api'
import {parseSearchParams, RawSearchParams} from '@/lib/searchParams'

interface HomePageProps {
  searchParams: Promise<RawSearchParams>
}

export default async function HomePage({searchParams}: HomePageProps) {
  const filters = parseSearchParams(await searchParams)
  const [{items, page, totalPages}, provinces, contractTypes] = await Promise.all([
    searchOffers(filters),
    getProvinces(),
    getContractTypes()
  ])

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-6 py-12">
      <h1 className="text-3xl font-bold">Ofertas de empleo</h1>
      <SearchFilters provinces={provinces} contractTypes={contractTypes} values={filters} />
      <ul className="divide-y rounded border">
        {items.map(offer => (
          <li key={offer.id} className="space-y-1 px-4 py-3">
            <h2 className="font-semibold">{offer.title}</h2>
            <p>{offer.companyName}</p>
            <p className="text-sm text-gray-600">
              {offer.province.label} · {offer.contractType.label}
            </p>
          </li>
        ))}
      </ul>
      <Pagination page={page} totalPages={totalPages} filters={filters} />
    </main>
  )
}
