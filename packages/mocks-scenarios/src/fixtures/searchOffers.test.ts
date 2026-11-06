import {describe, expect, it} from 'vitest'
import {OFFERS} from './offers'
import {searchOffers} from './searchOffers'

describe('searchOffers', () => {
  it('paginates with 10 items per page by default', () => {
    const result = searchOffers(OFFERS, {})

    expect(result.items).toHaveLength(10)
    expect(result).toMatchObject({page: 1, pageSize: 10, total: OFFERS.length, totalPages: 6})
  })

  it('combines the three filters', () => {
    const result = searchOffers(OFFERS, {q: 'react', province: 'barcelona', contractType: 'indefinido'})

    expect(result.items.length).toBeGreaterThan(0)
    expect(result.items.every(item => item.province.id === 'barcelona' && item.contractType.id === 'indefinido')).toBe(
      true
    )
  })

  it('returns an empty page when nothing matches', () => {
    expect(searchOffers(OFFERS, {q: 'zzz-no-match'})).toMatchObject({items: [], total: 0, totalPages: 0})
  })
})
