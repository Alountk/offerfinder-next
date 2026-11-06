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

describe('HomePage', () => {
  beforeEach(() => {
    vi.mocked(searchOffers).mockResolvedValue(result)
  })

  it('searches offers without filters', async () => {
    render(await HomePage())

    expect(searchOffers).toHaveBeenCalledWith()
  })

  it('lists title, company, province and contract type of each offer', async () => {
    render(await HomePage())

    const item = screen.getByRole('listitem')
    expect(item).toHaveTextContent('Desarrollador/a Frontend React')
    expect(item).toHaveTextContent('Acme Tech')
    expect(item).toHaveTextContent('Barcelona')
    expect(item).toHaveTextContent('Indefinido')
  })
})
