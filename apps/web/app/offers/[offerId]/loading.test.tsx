import {render, screen} from '@testing-library/react'
import Loading from './loading'

describe('Offer Loading', () => {
  it('announces that the offer is loading', () => {
    render(<Loading />)

    expect(screen.getByRole('status')).toHaveTextContent(/^cargando oferta…$/i)
  })
})
