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
    expect(parseSearchParams({q: 'react'})).toEqual({
      q: 'react'
    })
  })

  it('returns no filters when the URL has none', () => {
    expect(parseSearchParams({})).toEqual({})
  })

  it('cleans every filter and drops the ones left empty', () => {
    expect(parseSearchParams({q: '  react  '})).toEqual({
      q: 'react'
    })
  })

  it('ignores params that are not filters', () => {
    expect(parseSearchParams({utm_source: 'mail', country: '2'})).toEqual({})
  })
})
