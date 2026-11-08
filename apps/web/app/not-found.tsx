import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="mx-auto max-w-4xl space-y-4 px-6 py-12">
      <h1 className="text-3xl font-bold">Página no encontrada</h1>
      <p>La página que buscas no existe.</p>
      <Link href="/" className="underline">
        Volver a las ofertas
      </Link>
    </main>
  )
}
