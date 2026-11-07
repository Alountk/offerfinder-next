import {render, screen} from '@testing-library/react'
import {SearchFilters} from './SearchFilters'

function renderFilters(values: Parameters<typeof SearchFilters>[0]['values'] = {}) {
  return render(<SearchFilters values={values} />)
}

describe('SearchFilters', () => {
  it('submits q as GET params to the home page', () => {
    renderFilters()

    expect(screen.getByRole('searchbox', {name: /texto/i})).toHaveAttribute('name', 'q')
    expect(screen.getByRole('button', {name: /buscar/i})).toHaveAttribute('type', 'submit')
  })

  it('shows the current filters from the URL as selected values', () => {
    renderFilters({q: 'react'})

    expect(screen.getByRole('searchbox', {name: /texto/i})).toHaveValue('react')
  })
})
