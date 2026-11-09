import {render, screen} from '@testing-library/react'
import {Page} from './Page'

describe('Page', () => {
  it('wraps its content in the main landmark', () => {
    render(<Page>Contenido</Page>)

    expect(screen.getByRole('main')).toHaveTextContent('Contenido')
  })
})
