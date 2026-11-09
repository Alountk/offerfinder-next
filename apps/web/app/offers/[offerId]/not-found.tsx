import Link from 'next/link'
import {Page} from '@/components/Page'

export default function OfferNotFound() {
  return (
    <Page>
      <h1 className="text-3xl font-bold">Oferta no encontrada</h1>
      <p>Puede que la oferta haya caducado o que el enlace sea incorrecto.</p>
      <Link href="/" className="underline">
        Volver a las ofertas
      </Link>
    </Page>
  )
}
