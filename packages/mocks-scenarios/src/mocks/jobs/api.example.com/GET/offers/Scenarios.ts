import {BaseScenario, type ScenarioContext} from '../../../../../MockHandler'
import {register} from '../../../../../scenarios'
import type {ApiErrorDTO, PaginatedOffersDTO} from '../../../../../domain/types'
import {OFFERS} from '../../../../../fixtures/offers'
import {searchOffers} from '../../../../../fixtures/searchOffers'

/**
 * GET /offers?q=&province=&contractType=&page=&pageSize=
 * - q: free text over title and company
 * - province / contractType: ids from /catalogs/provinces and /catalogs/contract-types
 * - page: 1-based (default 1). pageSize: default 10, max 50
 */
abstract class OffersScenario extends BaseScenario<never, PaginatedOffersDTO | ApiErrorDTO> {
  static baseScenario = {responseHeaders: new Map([['Content-Type', 'application/json; charset=utf-8']])}
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

function toNumber(value: string | undefined): number | undefined {
  return value === undefined ? undefined : Number(value)
}

class Success extends OffersScenario {
  scenario({query}: ScenarioContext) {
    return {
      statusCode: 200,
      response: searchOffers(OFFERS, {
        q: first(query.q),
        province: first(query.province),
        contractType: first(query.contractType),
        page: toNumber(first(query.page)),
        pageSize: toNumber(first(query.pageSize))
      }),
      ...OffersScenario.baseScenario
    }
  }
}

class Empty extends OffersScenario {
  scenario({query}: ScenarioContext) {
    return {
      statusCode: 200,
      response: {items: [], page: Number(first(query.page) ?? 1), pageSize: 10, total: 0, totalPages: 0},
      ...OffersScenario.baseScenario
    }
  }
}

class ServerError extends OffersScenario {
  scenario() {
    return {
      statusCode: 500,
      response: {code: 'UnexpectedError' as const, message: 'Unexpected error searching offers'},
      ...OffersScenario.baseScenario
    }
  }
}

register('default', new Success())
register('empty', new Empty())
register('error', new ServerError())
