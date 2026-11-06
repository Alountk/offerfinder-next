import {BaseScenario} from '../../../../../../MockHandler'
import {register} from '../../../../../../scenarios'
import type {ApiErrorDTO, CatalogItem} from '../../../../../../domain/types'
import {PROVINCES} from '../../../../../../fixtures/catalogs'

abstract class ProvincesScenario extends BaseScenario<never, CatalogItem[] | ApiErrorDTO> {
  static baseScenario = {responseHeaders: new Map([['Content-Type', 'application/json; charset=utf-8']])}
}

class Success extends ProvincesScenario {
  scenario() {
    return {statusCode: 200, response: PROVINCES, ...ProvincesScenario.baseScenario}
  }
}

class ServerError extends ProvincesScenario {
  scenario() {
    return {
      statusCode: 500,
      response: {code: 'UnexpectedError' as const, message: 'Unexpected error loading the catalog'},
      ...ProvincesScenario.baseScenario
    }
  }
}

register('default', new Success())
register('error', new ServerError())
