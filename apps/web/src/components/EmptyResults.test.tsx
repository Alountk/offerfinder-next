import {render, screen} from '@testing-library/react'
import {EmptyResults} from './EmptyResults'

describe('EmptyResults', () => {
  it('says that nothing matches the search', () => {
    render(<EmptyResults filters={{}} />)

    expect(screen.getByText('No hay ofertas que coincidan con tu búsqueda.')).toBeInTheDocument()
  })

  it('suggests trying other words or filters', () => {
    render(<EmptyResults filters={{}} />)

    expect(screen.getByText(/prueba con otras palabras/i)).toBeInTheDocument()
  })

  it.each([
    ['text', {q: 'react'}],
    ['province', {province: '28'}],
    ['contract type', {contractType: 'indefinido'}]
  ])('offers to clear the filters when a %s filter is active', (_name, filters) => {
    render(<EmptyResults filters={filters} />)

    expect(screen.getByRole('link', {name: 'Quitar filtros'})).toHaveAttribute('href', '/')
  })

  it('does not offer to clear filters when none is active', () => {
    render(<EmptyResults filters={{page: 2}} />)

    expect(screen.queryByRole('link', {name: 'Quitar filtros'})).not.toBeInTheDocument()
  })
})
