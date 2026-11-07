import {firstParamValue, parseSearchParams} from './searchParams'

describe('firstParamValue', () => {
  it('returns undefined when the param is absent', () => {
    expect(firstParamValue(undefined)).toBeUndefined()
  })

  it('returns the value trimmed', () => {
    expect(firstParamValue('  react  ')).toBe('react')
  })

  it('returns undefined for empty or blank values', () => {
    expect(firstParamValue('')).toBeUndefined()
    expect(firstParamValue('   ')).toBeUndefined()
  })

  it('uses the first value when the param is repeated', () => {
    expect(firstParamValue(['28', '08'])).toBe('28')
  })

  it('uses only the first value, even when it is blank', () => {
    expect(firstParamValue(['', '28'])).toBeUndefined()
  })

  it('returns undefined for an empty list', () => {
    expect(firstParamValue([])).toBeUndefined()
  })
})

describe('parseSearchParams', () => {
  it('maps q, province and contractType', () => {
    expect(parseSearchParams({q: 'react', province: '28', contractType: 'indefinido'})).toEqual({
      q: 'react',
      province: '28',
      contractType: 'indefinido'
    })
  })

  it('returns no filters when the URL has none', () => {
    expect(parseSearchParams({})).toEqual({})
  })

  it('cleans every filter and drops the ones left empty', () => {
    expect(parseSearchParams({q: '  react  ', province: ['28', '08'], contractType: '   '})).toEqual({
      q: 'react',
      province: '28'
    })
  })

  it('ignores params that are not filters', () => {
    expect(parseSearchParams({utm_source: 'mail', country: '2'})).toEqual({})
  })

  it('maps page to a number', () => {
    expect(parseSearchParams({page: '2'})).toEqual({page: 2})
  })

  it('uses the first page when it is repeated', () => {
    expect(parseSearchParams({page: ['3', '5']})).toEqual({page: 3})
  })

  it.each(['0', '-1', '1.5', 'abc', '2x', '', '#'])('ignores the invalid page %j', page => {
    expect(parseSearchParams({page})).toEqual({})
  })
})
