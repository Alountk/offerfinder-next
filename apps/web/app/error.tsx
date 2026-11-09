'use client'

import {Button} from '@/components/Button'

interface ErrorPageProps {
  retry: () => void
}

export default function ErrorPage({retry}: ErrorPageProps) {
  return (
    <main className="mx-auto max-w-4xl space-y-4 px-6 py-12">
      <p role="alert">No se han podido cargar las ofertas. Inténtalo de nuevo.</p>
      <Button onClick={() => retry()}>Reintentar</Button>
    </main>
  )
}
