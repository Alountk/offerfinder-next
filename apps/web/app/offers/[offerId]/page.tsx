import type {Metadata} from 'next'
import type {ReactNode} from 'react'
import Link from 'next/link'
import {notFound} from 'next/navigation'
import type {OfferDetailDTO} from '@live-coding/mocks-scenarios'
import {ApiError, getOffer} from '@/lib/api'
import {Page} from '@/components/Page'
import {PageTitle} from '@/components/PageTitle'

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

interface FactProps {
  label: string
  highlight?: boolean
  children: ReactNode
}

function Fact({label, highlight = false, children}: FactProps) {
  return (
    <div>
      <dt className="text-label text-muted">{label}</dt>
      <dd className={highlight ? 'text-lead font-semibold' : undefined}>{children}</dd>
    </div>
  )
}

function ListSection({title, items}: ListSectionProps) {
  return (
    <section className="space-y-2 print:break-inside-avoid">
      <h2 className="text-section font-semibold">{title}</h2>
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
      <Link href="/" className="text-label underline print:hidden">
        Volver a las ofertas
      </Link>
      <header className="space-y-1">
        <PageTitle>{offer.title}</PageTitle>
        <p className="text-lead">{offer.companyName}</p>
        <p className="text-muted">{offer.province.label}</p>
      </header>
      <dl className="grid grid-cols-2 gap-4 rounded border border-border p-gutter sm:grid-cols-3 print:break-inside-avoid">
        {offer.salary && (
          <Fact label="Salario" highlight>
            {offer.salary}
          </Fact>
        )}
        <Fact label="Contrato" highlight>
          {offer.contractType.label}
        </Fact>
        <Fact label="Teletrabajo" highlight>
          {offer.teleworking}
        </Fact>
        <Fact label="Jornada">{offer.workday}</Fact>
        <Fact label="Vacantes">{offer.vacancies}</Fact>
      </dl>
      <section className="space-y-2 print:break-inside-avoid">
        <h2 className="text-section font-semibold">Descripción</h2>
        <p>{offer.description}</p>
      </section>
      <ListSection title="Requisitos" items={offer.requirements} />
      <ListSection title="Beneficios" items={offer.benefits} />
    </Page>
  )
}
