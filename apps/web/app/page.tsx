import { OffersLoading } from '@/components/OffersLoading'
import {OffersResults} from '@/components/OffersResults'
import {SearchFilters} from '@/components/SearchFilters'
import {getContractTypes, getProvinces} from '@/lib/api'
import {parseSearchParams, type RawSearchParams} from '@/lib/searchParams'
import { Suspense } from 'react'

interface HomePageProps {
  searchParams: Promise<RawSearchParams>
}

export default async function HomePage({searchParams}: HomePageProps) {
  const filters = parseSearchParams(await searchParams)
  const [provinces, contractTypes] = await Promise.all([getProvinces(), getContractTypes()])

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-6 py-12">
      <h1 className="text-3xl font-bold">Ofertas de empleo</h1>
      <SearchFilters provinces={provinces} contractTypes={contractTypes} values={filters} />
      <Suspense key={JSON.stringify(filters)} fallback={<OffersLoading />}>
        <OffersResults filters={filters} />
      </Suspense>
    </main>
  )
}
