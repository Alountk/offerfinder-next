import {render, screen} from '@testing-library/react'
import {SearchFilters} from './SearchFilters'
import { CatalogItem } from '@live-coding/mocks-scenarios'

const provinces: CatalogItem[] = [
  {id: '28', label: 'Madrid'},
  {id: '08', label: 'Barcelona'}
]
const contractTypes: CatalogItem[] = [
  {id: 'indefinido', label: 'Indefinido'},
  {id: 'temporal', label: 'Temporal'}
]

function renderFilters(values: Parameters<typeof SearchFilters>[0]['values'] = {}) {
  return render(<SearchFilters provinces={provinces} contractTypes={contractTypes} values={values} />)
}

describe('SearchFilters', () => {
  it('submits q, province and contractType as GET params to the home page', () => {
    renderFilters()

    expect(screen.getByRole('searchbox', {name: /texto/i})).toHaveAttribute('name', 'q')
    expect(screen.getByRole('combobox', {name: /provincia/i})).toHaveAttribute('name', 'province')
    expect(screen.getByRole('combobox', {name: /contrato/i})).toHaveAttribute('name', 'contractType')
    expect(screen.getByRole('button', {name: /buscar/i})).toHaveAttribute('type', 'submit')
  })

  it('shows the current filters from the URL as selected values', () => {
    renderFilters({q: 'react'})

    expect(screen.getByRole('searchbox', {name: /texto/i})).toHaveValue('react')
  })
})
