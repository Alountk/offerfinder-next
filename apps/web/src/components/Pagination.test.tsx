import { render, screen } from "@testing-library/react"
import { Pagination } from "./Pagination"

describe('Pagination', () => {
  it('renders nothing when there is a single page', () => {
    render(<Pagination page={1} totalPages={1} filters={{}} />)

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })
})
