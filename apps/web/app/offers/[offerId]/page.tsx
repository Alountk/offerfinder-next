import {ApiError, getOffer} from '@/lib/api'
import {OfferDetailDTO} from '@live-coding/mocks-scenarios'
import Link from 'next/link'
import {notFound} from 'next/navigation'

interface OfferPageProps {
  params: Promise<{offerId: string}>
}

interface ListSectionProps {
  id: string
  title: string
  items: string[]
}

async function findOffer(offerId: string): Promise<OfferDetailDTO> {
  try {
    return await getOffer(offerId)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound()
    throw error
  }
}

function ListSection({id, title, items}: ListSectionProps) {
  if (items.length === 0) return null

  return (
    <section aria-labelledby={id} className="space-y-2">
      <h2 id={id} className="text-xl font-semibold">
        {title}
      </h2>
      <ul className="list-disc space-y-1 pl-6">
        {items.map(item => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  )
}

export default async function OfferPage({params}: OfferPageProps) {
  const {offerId} = await params
  const offer = await findOffer(offerId)

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-6 py-12">
      <Link href="/" className="text-sm underline">
        Volver a las ofertas
      </Link>
      <header className="space-y-1">
        <h1 className="text-3xl font-bold">{offer.title}</h1>
        <p>{offer.companyName}</p>
        <p className="text-sm text-gray-600">
          {offer.province.label} · {offer.contractType.label}
        </p>
      </header>
      <dl className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-gray-600">Jornada</dt>
          <dd>{offer.workday}</dd>
        </div>
        <div>
          <dt className="text-gray-600">Teletrabajo</dt>
          <dd>{offer.teleworking}</dd>
        </div>
        <div>
          <dt className="text-gray-600">Vacantes</dt>
          <dd>{offer.vacancies}</dd>
        </div>
        {offer.salary && (
          <div>
            <dt className="text-gray-600">Salario</dt>
            <dd>{offer.salary}</dd>
          </div>
        )}
      </dl>
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Descripción</h2>
        <p>{offer.description}</p>
      </section>
      <ListSection id="requirements" title="Requisitos" items={offer.requirements} />
      <ListSection id="benefits" title="Beneficios" items={offer.benefits} />
    </main>
  )
}
