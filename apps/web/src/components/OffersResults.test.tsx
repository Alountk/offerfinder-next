import {render, screen} from '@testing-library/react'
import type {OfferSummaryDTO, PaginatedOffersDTO} from '@live-coding/mocks-scenarios'
import {redirect} from 'next/navigation'
import {searchOffers} from '@/lib/api'
import type {OfferFilters} from '@/lib/searchParams'
import {OffersResults} from './OffersResults'

vi.mock('@/lib/api', () => ({searchOffers: vi.fn()}))
vi.mock('next/navigation', () => ({redirect: vi.fn()}))

const offer: OfferSummaryDTO = {
  id: 'of-0001',
  title: 'Frontend Developer',
  companyName: 'Acme',
  province: {id: '28', label: 'Madrid'},
  contractType: {id: 'indefinido', label: 'Indefinido'},
  salary: null,
  publishedAt: '2026-01-01'
}

const result: PaginatedOffersDTO = {items: [offer], page: 1, pageSize: 10, total: 1, totalPages: 1}

async function renderResults(filters: OfferFilters = {}) {
  render(await OffersResults({filters}))
}

describe('OffersResults', () => {
  beforeEach(() => {
    vi.mocked(redirect).mockClear()
    vi.mocked(searchOffers).mockResolvedValue(result)
  })

  it('searches offers with the given filters, page included', async () => {
    await renderResults({q: 'react', province: '28', contractType: 'indefinido', page: 2})

    expect(searchOffers).toHaveBeenCalledWith({q: 'react', province: '28', contractType: 'indefinido', page: 2})
  })

  it('links each offer to its detail page', async () => {
    await renderResults()

    expect(screen.getByRole('link', {name: 'Frontend Developer'})).toHaveAttribute('href', '/offers/of-0001')
  })

  it('lists title, company, province and contract type of each offer', async () => {
    await renderResults()

    const item = screen.getByRole('listitem')
    expect(item).toHaveTextContent('Frontend Developer')
    expect(item).toHaveTextContent('Acme')
    expect(item).toHaveTextContent('Madrid')
    expect(item).toHaveTextContent('Indefinido')
  })

  it('links to the neighbouring pages keeping the filters', async () => {
    vi.mocked(searchOffers).mockResolvedValue({...result, page: 2, totalPages: 3})

    await renderResults({q: 'react', page: 2})

    expect(screen.getByRole('link', {name: /anterior/i})).toHaveAttribute('href', '/?q=react&page=1')
    expect(screen.getByRole('link', {name: /siguiente/i})).toHaveAttribute('href', '/?q=react&page=3')
  })

  it('redirects to the last page when the requested page is out of range', async () => {
    vi.mocked(searchOffers).mockResolvedValue({...result, items: [], page: 999, total: 60, totalPages: 6})

    await renderResults({q: 'react', page: 999})

    expect(redirect).toHaveBeenCalledWith('/?q=react&page=6')
  })

  it('does not redirect when the requested page exists', async () => {
    vi.mocked(searchOffers).mockResolvedValue({...result, page: 6, total: 60, totalPages: 6})

    await renderResults({page: 6})

    expect(redirect).not.toHaveBeenCalled()
  })

  it('does not redirect when the search has no results', async () => {
    vi.mocked(searchOffers).mockResolvedValue({...result, items: [], page: 3, total: 0, totalPages: 0})

    await renderResults({q: 'nothing', page: 3})

    expect(redirect).not.toHaveBeenCalled()
  })

  it('shows a message instead of the list when there are no results', async () => {
    vi.mocked(searchOffers).mockResolvedValue({...result, items: [], total: 0, totalPages: 0})

    await renderResults({q: 'nothing'})

    expect(screen.getByText(/no hay ofertas/i)).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })
})
