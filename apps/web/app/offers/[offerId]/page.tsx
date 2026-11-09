import type {Metadata} from 'next'
import Link from 'next/link'
import {notFound} from 'next/navigation'
import type {OfferDetailDTO} from '@live-coding/mocks-scenarios'
import {ApiError, getOffer} from '@/lib/api'
import {Page} from '@/components/Page'

interface OfferPageProps {
  params: Promise<{offerId: string}>
}

interface ListSectionProps {
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

function ListSection({title, items}: ListSectionProps) {
  return (
    <section className="space-y-2">
      <h2 className="text-xl font-semibold">{title}</h2>
      <ul className="list-disc space-y-1 pl-6">
        {items.map(item => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  )
}

export async function generateMetadata({params}: OfferPageProps): Promise<Metadata> {
  const {offerId} = await params
  const offer = await findOffer(offerId)

  return {title: `${offer.title} · ${offer.companyName}`, description: offer.description}
}

export default async function OfferPage({params}: OfferPageProps) {
  const {offerId} = await params
  const offer = await findOffer(offerId)

  return (
    <Page>
      <Link href="/" className="text-sm underline">
        Volver a las ofertas
      </Link>
      <header className="space-y-1">
        <h1 className="text-3xl font-bold">{offer.title}</h1>
        <p>{offer.companyName}</p>
        <p className="text-sm text-muted">
          {offer.province.label} · {offer.contractType.label}
        </p>
      </header>
      <dl className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-muted">Jornada</dt>
          <dd>{offer.workday}</dd>
        </div>
        <div>
          <dt className="text-muted">Teletrabajo</dt>
          <dd>{offer.teleworking}</dd>
        </div>
        <div>
          <dt className="text-muted">Vacantes</dt>
          <dd>{offer.vacancies}</dd>
        </div>
        {offer.salary && (
          <div>
            <dt className="text-muted">Salario</dt>
            <dd>{offer.salary}</dd>
          </div>
        )}
      </dl>
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Descripción</h2>
        <p>{offer.description}</p>
      </section>
      <ListSection title="Requisitos" items={offer.requirements} />
      <ListSection title="Beneficios" items={offer.benefits} />
    </Page>
  )
}
