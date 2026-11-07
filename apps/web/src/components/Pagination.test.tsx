import {render, screen} from '@testing-library/react'
import {Pagination} from './Pagination'

describe('Pagination', () => {
  it('renders nothing when there is a single page', () => {
    render(<Pagination page={1} totalPages={1} filters={{}} />)

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  it('renders nothing when there are no pages', () => {
    render(<Pagination page={1} totalPages={0} filters={{}} />)

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  it('shows the current page out of the total', () => {
    render(<Pagination page={2} totalPages={5} filters={{}} />)

    expect(screen.getByRole('navigation', {name: /paginación/i})).toHaveTextContent('Página 2 de 5')
  })

  it('only links to the next page on the first page', () => {
    render(<Pagination page={1} totalPages={3} filters={{}} />)

    expect(screen.getByRole('link', {name: /siguiente/i})).toHaveAttribute('href', '/?page=2')
    expect(screen.queryByRole('link', {name: /anterior/i})).not.toBeInTheDocument()
  })

  it('links to both neighbours on a middle page', () => {
    render(<Pagination page={2} totalPages={3} filters={{}} />)

    expect(screen.getByRole('link', {name: /anterior/i})).toHaveAttribute('href', '/?page=1')
    expect(screen.getByRole('link', {name: /siguiente/i})).toHaveAttribute('href', '/?page=3')
  })

  it('only links to the previous page on the last page', () => {
    render(<Pagination page={3} totalPages={3} filters={{}} />)

    expect(screen.getByRole('link', {name: /anterior/i})).toHaveAttribute('href', '/?page=2')
    expect(screen.queryByRole('link', {name: /siguiente/i})).not.toBeInTheDocument()
  })

  it('keeps the active filters in the links', () => {
    render(<Pagination page={2} totalPages={3} filters={{q: 'react dev', province: 'madrid', page: 2}} />)

    expect(screen.getByRole('link', {name: /siguiente/i})).toHaveAttribute(
      'href',
      '/?q=react+dev&province=madrid&page=3'
    )
  })

  it('handles out-of-bounds page numbers', () => {
    render(<Pagination page={999} totalPages={3} filters={{q: 'react dev', province: 'madrid', page: 2}} />)
    
    expect(screen.getByRole('link', {name: /anterior/i})).toHaveAttribute(
      'href',
      '/?q=react+dev&province=madrid&page=998'
    )
  })
})
