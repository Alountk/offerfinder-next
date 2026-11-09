import Link from 'next/link'
import {Page} from '@/components/Page'

export default function NotFound() {
  return (
    <Page>
      <h1 className="text-3xl font-bold">Página no encontrada</h1>
      <p>La página que buscas no existe.</p>
      <Link href="/" className="underline">
        Volver a las ofertas
      </Link>
    </Page>
  )
}
