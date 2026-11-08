import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ErrorPage from './error'

const retry = vi.fn()

describe('ErrorPage', () => {
  it('tells the user the offers could not be loaded', () => {
    render(<ErrorPage retry={retry} />)

    expect(screen.getByRole('alert')).toHaveTextContent(/no se han podido cargar las ofertas/i)
  })

  it('asks Next to retry when the user clicks the button', async () => {
    render(<ErrorPage retry={retry} />)

    await userEvent.click(screen.getByRole('button', {name: /reintentar/i}))

    expect(retry).toHaveBeenCalledTimes(1)
  })
})
