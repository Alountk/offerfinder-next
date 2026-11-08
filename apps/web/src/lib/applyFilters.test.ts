import {redirect} from 'next/navigation'
import {applyFilters} from './applyFilters'

vi.mock('next/navigation', () => ({redirect: vi.fn()}))

function formWith(fields: Record<string, string>) {
  const formData = new FormData()
  Object.entries(fields).forEach(([name, value]) => formData.append(name, value))
  return formData
}

describe('applyFilters', () => {
  beforeEach(() => {
    vi.mocked(redirect).mockClear()
  })

  it('redirects to the home with the submitted filters in the URL', async () => {
    await applyFilters(formWith({q: 'react dev', province: '28', contractType: 'indefinido'}))

    expect(redirect).toHaveBeenCalledWith('/?q=react+dev&province=28&contractType=indefinido')
  })

  it('leaves out the filters that were left empty', async () => {
    await applyFilters(formWith({q: '   ', province: '', contractType: 'temporal'}))

    expect(redirect).toHaveBeenCalledWith('/?contractType=temporal')
  })

  it('ignores every field that is not a filter, page included', async () => {
    await applyFilters(formWith({q: 'react', page: '5', $ACTION_ID_abc: ''}))

    expect(redirect).toHaveBeenCalledWith('/?q=react')
  })
})
