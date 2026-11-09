import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {Button} from './Button'

describe('Button', () => {
  it('does not submit the surrounding form by default', async () => {
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault())
    render(
      <form onSubmit={onSubmit}>
        <Button>Guardar</Button>
      </form>
    )

    await userEvent.click(screen.getByRole('button', {name: 'Guardar'}))

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits the surrounding form when it is a submit button', async () => {
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault())
    render(
      <form onSubmit={onSubmit}>
        <Button type="submit">Buscar</Button>
      </form>
    )

    await userEvent.click(screen.getByRole('button', {name: 'Buscar'}))

    expect(onSubmit).toHaveBeenCalledOnce()
  })
})
