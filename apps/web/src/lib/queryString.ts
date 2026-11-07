type QueryParams = Record<string, string | number | undefined>

/** Builds `?a=1&b=2` from the given params, skipping `undefined` and empty values. Returns `''` when none remain. */
export function toQueryString(params: QueryParams): string {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') query.set(key, String(value))
  }
  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}
