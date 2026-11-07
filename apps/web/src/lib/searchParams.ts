import {SearchOffersParams} from '@live-coding/mocks-scenarios/searchOffers'

export type RawSearchParams = Record<string, string | string[] | undefined>

export type OfferFilters = Pick<SearchOffersParams, 'q'>

export function firstParamValue(value: string | string[] | undefined): string | undefined {
    const first = Array.isArray(value) ? value[0] : value;
    const trimmed = first?.trim();
    return trimmed ? trimmed : undefined;
}

export function parseSearchParams(raw: RawSearchParams): OfferFilters {
    const filters: OfferFilters = {};
    const q = firstParamValue(raw.q);

    if (q) filters.q = q;

    return filters;
}