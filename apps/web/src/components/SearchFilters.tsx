import Form from 'next/form'
import type {OfferFilters} from '@/lib/searchParams'

interface SearchFiltersProps {
  values: OfferFilters
}

export function SearchFilters({values}: SearchFiltersProps) {
  return (
    <Form action="/" className="flex flex-wrap items-end gap-4">
      <label className="flex flex-col gap-1 text-sm">
        Texto
        <input
          type="search"
          name="q"
          defaultValue={values.q ?? ''}
          placeholder="Título o empresa"
          className="rounded border px-2 py-1"
        />
      </label>
      <button type="submit" className="rounded bg-gray-900 px-4 py-1 text-white">
        Buscar
      </button>
    </Form>
  )
}
