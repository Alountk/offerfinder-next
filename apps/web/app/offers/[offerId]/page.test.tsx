import {render, screen} from '@testing-library/react'
import type {OfferDetailDTO} from '@live-coding/mocks-scenarios'
import {notFound} from 'next/navigation'
import {ApiError, getOffer} from '@/lib/api'
import OfferPage, {generateMetadata} from './page'

vi.mock('@/lib/api', async importOriginal => ({
  ...(await importOriginal<typeof import('@/lib/api')>()),
  getOffer: vi.fn()
}))
vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND')
  })
}))

const offer: OfferDetailDTO = {
  id: 'of-0001',
  title: 'Frontend Developer',
  companyName: 'Acme',
  province: {id: 'madrid', label: 'Madrid'},
  contractType: {id: 'indefinido', label: 'Indefinido'},
  salary: '40.000 €',
  publishedAt: '2026-01-01',
  description: 'Build great interfaces',
  requirements: ['React', 'TypeScript'],
  benefits: ['Remote'],
  workday: 'Completa',
  teleworking: 'Híbrido',
  vacancies: 2
}

function pageProps(offerId = 'of-0001') {
  return {params: Promise.resolve({offerId})}
}

async function renderPage(offerId?: string) {
  render(await OfferPage(pageProps(offerId)))
}

describe('OfferPage', () => {
  beforeEach(() => {
    vi.mocked(notFound).mockClear()
    vi.mocked(getOffer).mockReset()
    vi.mocked(getOffer).mockResolvedValue(offer)
  })

  it('requests the offer with the id found in the URL', async () => {
    await renderPage('of-0007')

    expect(getOffer).toHaveBeenCalledWith('of-0007')
  })

  it('shows the title, company, province and contract type', async () => {
    await renderPage()

    expect(screen.getByRole('heading', {level: 1, name: 'Frontend Developer'})).toBeInTheDocument()
    expect(screen.getByText('Acme')).toBeInTheDocument()
    expect(screen.getByText('Madrid · Indefinido')).toBeInTheDocument()
  })

  it('shows the description, workday, teleworking, vacancies and salary', async () => {
    await renderPage()

    expect(screen.getByText('Build great interfaces')).toBeInTheDocument()
    expect(screen.getByText('Completa')).toBeInTheDocument()
    expect(screen.getByText('Híbrido')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('40.000 €')).toBeInTheDocument()
  })

  it('omits the salary when the offer does not state it', async () => {
    vi.mocked(getOffer).mockResolvedValue({...offer, salary: null})

    await renderPage()

    expect(screen.queryByText(/salario/i)).not.toBeInTheDocument()
  })

  it('lists the requirements and the benefits', async () => {
    await renderPage()

    expect(screen.getAllByRole('listitem').map(item => item.textContent)).toEqual(['React', 'TypeScript', 'Remote'])
  })

  it('links back to the offers list', async () => {
    await renderPage()

    expect(screen.getByRole('link', {name: /volver/i})).toHaveAttribute('href', '/')
  })

  it('renders the not found page when the API answers 404', async () => {
    vi.mocked(getOffer).mockRejectedValue(new ApiError(404, 'Request failed with status 404'))

    await expect(OfferPage(pageProps('of-9999'))).rejects.toThrow('NEXT_NOT_FOUND')

    expect(notFound).toHaveBeenCalledTimes(1)
  })

  it('lets any other API error reach the error boundary', async () => {
    const failure = new ApiError(500, 'Request failed with status 500')
    vi.mocked(getOffer).mockRejectedValue(failure)

    await expect(OfferPage(pageProps())).rejects.toBe(failure)

    expect(notFound).not.toHaveBeenCalled()
  })
})

describe('generateMetadata', () => {
  beforeEach(() => {
    vi.mocked(notFound).mockClear()
    vi.mocked(getOffer).mockReset()
    vi.mocked(getOffer).mockResolvedValue(offer)
  })

  it('uses the offer title and company as the page title and its description as the description', async () => {
    await expect(generateMetadata(pageProps('of-0007'))).resolves.toEqual({
      title: 'Frontend Developer · Acme',
      description: 'Build great interfaces'
    })

    expect(getOffer).toHaveBeenCalledWith('of-0007')
  })

  it('renders the not found page when the API answers 404', async () => {
    vi.mocked(getOffer).mockRejectedValue(new ApiError(404, 'Request failed with status 404'))

    await expect(generateMetadata(pageProps('of-9999'))).rejects.toThrow('NEXT_NOT_FOUND')

    expect(notFound).toHaveBeenCalledTimes(1)
  })
})
