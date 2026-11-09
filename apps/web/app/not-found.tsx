import Link from 'next/link'
import {Page} from '@/components/Page'
import {PageTitle} from '@/components/PageTitle'

export default function NotFound() {
  return (
    <Page>
      <PageTitle>Página no encontrada</PageTitle>
      <p>La página que buscas no existe.</p>
      <Link href="/" className="underline">
        Volver a las ofertas
      </Link>
    </Page>
  )
}
