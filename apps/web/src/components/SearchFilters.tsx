import type {OfferFilters} from '@/lib/searchParams'
import {CatalogItem} from '@live-coding/mocks-scenarios'

interface SearchFiltersProps {
  provinces: CatalogItem[]
  contractTypes: CatalogItem[]
  values: OfferFilters
  action: (formData: FormData) => void | Promise<void>
}

interface CatalogSelectProps {
  label: string
  name: string
  emptyLabel: string
  items: CatalogItem[]
  value: string | undefined
}

function CatalogSelect({label, name, emptyLabel, items, value}: CatalogSelectProps) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      {label}
      <select name={name} defaultValue={value ?? ''} className="rounded border border-border px-2 py-1">
        <option value="">{emptyLabel}</option>
        {items.map(item => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export function SearchFilters({provinces, contractTypes, values, action}: SearchFiltersProps) {
  return (
    <form action={action} className="flex flex-wrap items-end gap-4">
      <label className="flex flex-col gap-1 text-sm">
        Texto
        <input
          type="search"
          name="q"
          defaultValue={values.q ?? ''}
          placeholder="Título o empresa"
          className="rounded border border-border px-2 py-1"
        />
      </label>
      <CatalogSelect label="Provincia" name="province" emptyLabel="Todas" items={provinces} value={values.province} />
      <CatalogSelect
        label="Tipo de contrato"
        name="contractType"
        emptyLabel="Todos"
        items={contractTypes}
        value={values.contractType}
      />
      <button type="submit" className="rounded bg-brand px-4 py-1 text-brand-foreground">
        Buscar
      </button>
    </form>
  )
}
