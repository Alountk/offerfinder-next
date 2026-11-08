import {render, screen} from '@testing-library/react'
import NotFound from './not-found'

describe('NotFound', () => {
  it('tells the user the page does not exist', () => {
    render(<NotFound />)

    expect(screen.getByRole('heading', {level: 1, name: /no encontrada/i})).toBeInTheDocument()
    expect(screen.getByText('La página que buscas no existe.')).toBeInTheDocument()
  })

  it('links back to the offers list', () => {
    render(<NotFound />)

    expect(screen.getByRole('link', {name: /volver a las ofertas/i})).toHaveAttribute('href', '/')
  })
})
