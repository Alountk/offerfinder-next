import {toQueryString} from './queryString'

function parse(queryString: string): Record<string, string> {
  return Object.fromEntries(new URLSearchParams(queryString))
}

describe('toQueryString', () => {
  it('returns an empty string when there is nothing to send', () => {
    expect(toQueryString({})).toBe('')
    expect(toQueryString({q: undefined, province: ''})).toBe('')
  })

  it('prefixes the params with "?" and keeps their order', () => {
    expect(toQueryString({q: 'react', page: 2})).toBe('?q=react&page=2')
  })

  it('omits params that are undefined or empty', () => {
    expect(toQueryString({q: '', province: undefined, page: 3})).toBe('?page=3')
  })

  it('encodes values so they cannot add or alter other params', () => {
    const queryString = toQueryString({q: 'c&a=1 #ñ+'})

    expect(parse(queryString)).toEqual({q: 'c&a=1 #ñ+'})
  })
})
