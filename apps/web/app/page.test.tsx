import {render, screen} from '@testing-library/react'
import type {OfferSummaryDTO, PaginatedOffersDTO} from '@live-coding/mocks-scenarios'
import {searchOffers} from '@/lib/api'
import HomePage from './page'

vi.mock('@/lib/api', () => ({searchOffers: vi.fn()}))

const offer: OfferSummaryDTO = {
  id: 'of-0001',
  title: 'Desarrollador/a Frontend React',
  companyName: 'Acme Tech',
  province: {
    id: 'barcelona',
    label: 'Barcelona'
  },
  contractType: {
    id: 'indefinido',
    label: 'Indefinido'
  },
  salary: null,
  publishedAt: '2026-10-31T00:00:00.000Z'
}

const result: PaginatedOffersDTO = {items: [offer], page: 1, pageSize: 10, total: 1, totalPages: 1}

async function renderPage(searchParams: Record<string, string | string[] | undefined> = {}) {
  render(await HomePage({searchParams: Promise.resolve(searchParams)}))
}

describe('HomePage', () => {
  beforeEach(() => {
    vi.mocked(searchOffers).mockResolvedValue(result)
  })

  it('searches offers without filters when the URL has none', async () => {
    await renderPage()

    expect(searchOffers).toHaveBeenCalledWith({})
  })

  it('shows the filters populated from the URL and the catalogs', async () => {
    await renderPage({q: 'react'})

    expect(screen.getByRole('searchbox', {name: /texto/i})).toHaveValue('react')
  })

  it('lists title, company, province and contract type of each offer', async () => {
    await renderPage()

    const item = screen.getByRole('listitem')
    expect(item).toHaveTextContent('Desarrollador/a Frontend React')
    expect(item).toHaveTextContent('Acme Tech')
    expect(item).toHaveTextContent('Barcelona')
    expect(item).toHaveTextContent('Indefinido')
  })
})
