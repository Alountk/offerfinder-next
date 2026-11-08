import Link from 'next/link'

export default function OfferNotFound() {
  return (
    <main className="mx-auto max-w-4xl space-y-4 px-6 py-12">
      <h1 className="text-3xl font-bold">Oferta no encontrada</h1>
      <p>Puede que la oferta ya no esté disponible, que ha caducado o que el enlace sea incorrecto.</p>
      <Link href="/" className="underline">
        Volver a las ofertas
      </Link>
    </main>
  )
}
