import type {OfferDetailDTO} from '../domain/types'
import {CONTRACT_TYPES, PROVINCES} from './catalogs'

const TITLES = [
  'Desarrollador/a Frontend React',
  'Desarrollador/a Backend Node.js',
  'Full Stack Engineer',
  'QA Automation Engineer',
  'Product Designer',
  'DevOps Engineer',
  'Data Analyst',
  'Tech Lead',
  'Scrum Master',
  'Desarrollador/a Java Senior'
]

const COMPANIES = ['Acme Tech', 'Globex', 'Initech', 'Umbrella Labs', 'Hooli', 'Soylent Systems']

const SALARIES = [null, '30.000 - 36.000 € bruto/año', '40.000 - 48.000 € bruto/año', '55.000 € bruto/año']

const TOTAL_OFFERS = 60

function buildOffer(index: number): OfferDetailDTO {
  const title = TITLES[index % TITLES.length] as string
  const province = PROVINCES[index % PROVINCES.length] as (typeof PROVINCES)[number]
  const contractType = CONTRACT_TYPES[(index * 3) % CONTRACT_TYPES.length] as (typeof CONTRACT_TYPES)[number]
  const companyName = COMPANIES[index % COMPANIES.length] as string
  const publishedAt = new Date(Date.UTC(2026, 9, 31) - index * 36 * 60 * 60 * 1000).toISOString()

  return {
    id: `of-${String(index + 1).padStart(4, '0')}`,
    title,
    companyName,
    province,
    contractType,
    salary: SALARIES[index % SALARIES.length] ?? null,
    publishedAt,
    description: `${companyName} busca incorporar un/a ${title} en ${province.label}. Formarás parte de un equipo multidisciplinar trabajando en productos de alto impacto con un stack moderno.`,
    requirements: [
      'Al menos 2 años de experiencia en un puesto similar',
      'Inglés intermedio',
      'Experiencia trabajando en equipos ágiles'
    ],
    benefits: ['Horario flexible', 'Seguro médico', 'Formación continua'],
    workday: index % 4 === 0 ? 'Parcial' : 'Completa',
    teleworking: ['Presencial', 'Híbrido', 'Solo teletrabajo'][index % 3] as string,
    vacancies: (index % 3) + 1
  }
}

export const OFFERS: OfferDetailDTO[] = Array.from({length: TOTAL_OFFERS}, (_, index) => buildOffer(index))
