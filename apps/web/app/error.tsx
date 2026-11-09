'use client'

import {Button} from '@/components/Button'
import {Page} from '@/components/Page'

interface ErrorPageProps {
  retry: () => void
}

export default function ErrorPage({retry}: ErrorPageProps) {
  return (
    <Page>
      <p role="alert">No se han podido cargar las ofertas. Inténtalo de nuevo.</p>
      <Button onClick={() => retry()}>Reintentar</Button>
    </Page>
  )
}
