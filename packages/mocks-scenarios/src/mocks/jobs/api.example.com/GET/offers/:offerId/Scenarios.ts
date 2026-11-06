import {BaseScenario, type ScenarioContext} from '../../../../../../MockHandler'
import {register} from '../../../../../../scenarios'
import type {ApiErrorDTO, OfferDetailDTO} from '../../../../../../domain/types'
import {OFFERS} from '../../../../../../fixtures/offers'

/** GET /offers/:offerId — offer ids look like "of-0001" ... "of-0060". */
abstract class OfferDetailScenario extends BaseScenario<never, OfferDetailDTO | ApiErrorDTO> {
  static baseScenario = {responseHeaders: new Map([['Content-Type', 'application/json; charset=utf-8']])}
}

class Success extends OfferDetailScenario {
  scenario({params}: ScenarioContext) {
    // The mock server calls scenario() without params at startup (to log the endpoint), hence the fallback.
    const offer = params.offerId === undefined ? OFFERS[0] : OFFERS.find(candidate => candidate.id === params.offerId)
    if (!offer) {
      return {
        statusCode: 404,
        response: {code: 'OfferNotFound' as const, message: 'Offer not found'},
        ...OfferDetailScenario.baseScenario
      }
    }
    return {statusCode: 200, response: offer, ...OfferDetailScenario.baseScenario}
  }
}

class NotFound extends OfferDetailScenario {
  scenario() {
    return {
      statusCode: 404,
      response: {code: 'OfferNotFound' as const, message: 'Offer not found'},
      ...OfferDetailScenario.baseScenario
    }
  }
}

class ServerError extends OfferDetailScenario {
  scenario() {
    return {
      statusCode: 500,
      response: {code: 'UnexpectedError' as const, message: 'Unexpected error loading the offer'},
      ...OfferDetailScenario.baseScenario
    }
  }
}

register('default', new Success())
register('notFound', new NotFound())
register('error', new ServerError())
