'use client'

interface ErrorPageProps {
  retry: () => void
}

export default function ErrorPage({retry}: ErrorPageProps) {
  return (
    <main className="mx-auto max-w-4xl space-y-4 px-6 py-12">
      <p role="alert">No se han podido cargar las ofertas. Inténtalo de nuevo.</p>
      <button type="button" onClick={() => retry()} className="rounded bg-gray-900 px-4 py-1 text-white">
        Reintentar
      </button>
    </main>
  )
}
