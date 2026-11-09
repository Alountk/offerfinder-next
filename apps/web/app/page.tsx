import {Suspense} from 'react'
import {OffersLoading} from '@/components/OffersLoading'
import {OffersResults} from '@/components/OffersResults'
import {SearchFilters} from '@/components/SearchFilters'
import {applyFilters} from '@/lib/applyFilters'
import {getContractTypes, getProvinces} from '@/lib/api'
import {parseSearchParams, type RawSearchParams} from '@/lib/searchParams'
import {Page} from '@/components/Page'
import {PageTitle} from '@/components/PageTitle'

interface HomePageProps {
  searchParams: Promise<RawSearchParams>
}

export default async function HomePage({searchParams}: HomePageProps) {
  const filters = parseSearchParams(await searchParams)
  const [provinces, contractTypes] = await Promise.all([getProvinces(), getContractTypes()])

  return (
    <Page>
      <PageTitle>Ofertas de empleo</PageTitle>
      <SearchFilters provinces={provinces} contractTypes={contractTypes} values={filters} action={applyFilters} />
      <Suspense key={JSON.stringify(filters)} fallback={<OffersLoading />}>
        <OffersResults filters={filters} />
      </Suspense>
    </Page>
  )
}
