import {FiltersLoading} from '@/components/FiltersLoading'
import {OffersLoading} from '@/components/OffersLoading'
import {Page} from '@/components/Page'
import {PageTitle} from '@/components/PageTitle'

export default function Loading() {
  return (
    <Page>
      <PageTitle>Ofertas de empleo</PageTitle>
      <FiltersLoading />
      <OffersLoading />
    </Page>
  )
}
