import {render, screen} from '@testing-library/react'
import OfferNotFound from './not-found'

describe('OfferNotFound', () => {
  it('tells the user the offer does not exist', () => {
    render(<OfferNotFound />)

    expect(screen.getByRole('heading', {level: 1, name: /oferta no encontrada/i})).toBeInTheDocument()
    expect(screen.getByText(/haya caducado/i)).toBeInTheDocument()
  })

  it('links back to the offers list', () => {
    render(<OfferNotFound />)

    expect(screen.getByRole('link', {name: /volver a las ofertas/i})).toHaveAttribute('href', '/')
  })
})
