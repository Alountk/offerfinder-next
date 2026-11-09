import Link from 'next/link'
import {Page} from '@/components/Page'
import {PageTitle} from '@/components/PageTitle'

export default function OfferNotFound() {
  return (
    <Page>
      <PageTitle>Oferta no encontrada</PageTitle>
      <p>Puede que la oferta haya caducado o que el enlace sea incorrecto.</p>
      <Link href="/" className="underline">
        Volver a las ofertas
      </Link>
    </Page>
  )
}
