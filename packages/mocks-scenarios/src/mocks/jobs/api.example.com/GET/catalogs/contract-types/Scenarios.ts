import {BaseScenario} from '../../../../../../MockHandler'
import {register} from '../../../../../../scenarios'
import type {ApiErrorDTO, CatalogItem} from '../../../../../../domain/types'
import {CONTRACT_TYPES} from '../../../../../../fixtures/catalogs'

abstract class ContractTypesScenario extends BaseScenario<never, CatalogItem[] | ApiErrorDTO> {
  static baseScenario = {responseHeaders: new Map([['Content-Type', 'application/json; charset=utf-8']])}
}

class Success extends ContractTypesScenario {
  scenario() {
    return {statusCode: 200, response: CONTRACT_TYPES, ...ContractTypesScenario.baseScenario}
  }
}

class ServerError extends ContractTypesScenario {
  scenario() {
    return {
      statusCode: 500,
      response: {code: 'UnexpectedError' as const, message: 'Unexpected error loading the catalog'},
      ...ContractTypesScenario.baseScenario
    }
  }
}

register('default', new Success())
register('error', new ServerError())
