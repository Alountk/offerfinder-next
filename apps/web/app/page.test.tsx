import {render, screen} from '@testing-library/react'
import type {CatalogItem} from '@live-coding/mocks-scenarios'
import {getContractTypes, getProvinces} from '@/lib/api'
import HomePage from './page'

vi.mock('@/lib/api', () => ({getProvinces: vi.fn(), getContractTypes: vi.fn()}))
vi.mock('@/components/OffersResults', () => ({
  OffersResults: ({filters}: {filters: unknown}) => <p>{`results for ${JSON.stringify(filters)}`}</p>
}))

const provinces: CatalogItem[] = [{id: '28', label: 'Madrid'}]
const contractTypes: CatalogItem[] = [{id: 'indefinido', label: 'Indefinido'}]

async function renderPage(searchParams: Record<string, string | string[] | undefined> = {}) {
  render(await HomePage({searchParams: Promise.resolve(searchParams)}))
}

describe('HomePage', () => {
  beforeEach(() => {
    vi.mocked(getProvinces).mockResolvedValue(provinces)
    vi.mocked(getContractTypes).mockResolvedValue(contractTypes)
  })

  it('gives the results the filters and the page found in the URL', async () => {
    await renderPage({q: 'react', page: '2'})

    expect(screen.getByText('results for {"q":"react","page":2}')).toBeInTheDocument()
  })

  it('shows the filters populated from the URL and the catalogs', async () => {
    await renderPage({q: 'react', province: '28'})

    expect(screen.getByRole('searchbox', {name: /texto/i})).toHaveValue('react')
    expect(screen.getByRole('combobox', {name: /provincia/i})).toHaveValue('28')
    expect(screen.getByRole('option', {name: 'Indefinido'})).toBeInTheDocument()
  })
})
