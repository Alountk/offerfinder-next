import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type {CatalogItem} from '@live-coding/mocks-scenarios'
import {SearchFilters} from './SearchFilters'

const provinces: CatalogItem[] = [
  {id: '28', label: 'Madrid'},
  {id: '08', label: 'Barcelona'}
]
const contractTypes: CatalogItem[] = [
  {id: 'indefinido', label: 'Indefinido'},
  {id: 'temporal', label: 'Temporal'}
]

const action = vi.fn()

function renderFilters(values: Parameters<typeof SearchFilters>[0]['values'] = {}) {
  return render(<SearchFilters provinces={provinces} contractTypes={contractTypes} values={values} action={action} />)
}

describe('SearchFilters', () => {
  it('calls the action when searching', async () => {
    renderFilters()

    await userEvent.click(screen.getByRole('button', {name: /buscar/i}))

    expect(action).toHaveBeenCalledOnce()
  })

  it('offers an empty option plus every catalog item', () => {
    renderFilters()

    const options = screen.getAllByRole('option').map(option => option.textContent)
    expect(options).toEqual(['Todas', 'Madrid', 'Barcelona', 'Todos', 'Indefinido', 'Temporal'])
  })

  it('shows the current filters from the URL as selected values', () => {
    renderFilters({q: 'react', province: '08', contractType: 'temporal'})

    expect(screen.getByRole('searchbox', {name: /texto/i})).toHaveValue('react')
    expect(screen.getByRole('combobox', {name: /provincia/i})).toHaveValue('08')
    expect(screen.getByRole('combobox', {name: /contrato/i})).toHaveValue('temporal')
  })
})
