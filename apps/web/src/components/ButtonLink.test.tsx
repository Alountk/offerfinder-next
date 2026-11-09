import {render, screen} from '@testing-library/react'
import {ButtonLink} from './ButtonLink'

describe('ButtonLink', () => {
  it('renders a link to the given destination', () => {
    render(<ButtonLink href="/?page=2">Siguiente</ButtonLink>)

    expect(screen.getByRole('link', {name: 'Siguiente'})).toHaveAttribute('href', '/?page=2')
  })
})
