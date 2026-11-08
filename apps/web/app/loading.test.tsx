import {render, screen} from '@testing-library/react'
import Loading from './loading'

describe('Loading', () => {
  it('announces that the offers are loading', () => {
    render(<Loading />)

    expect(screen.getByRole('status')).toHaveTextContent(/cargando ofertas/i)
  })
})
