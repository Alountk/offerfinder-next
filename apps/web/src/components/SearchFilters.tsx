import type {CatalogItem} from '@live-coding/mocks-scenarios'
import type {OfferFilters} from '@/lib/searchParams'
import {Button} from './Button'
import {Field, Input, Select} from './Field'

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
    <Field label={label}>
      <Select name={name} defaultValue={value ?? ''}>
        <option value="">{emptyLabel}</option>
        {items.map(item => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
      </Select>
    </Field>
  )
}

export function SearchFilters({provinces, contractTypes, values, action}: SearchFiltersProps) {
  return (
    <form action={action} className="flex flex-wrap items-end gap-4">
      <Field label="Texto">
        <Input type="search" name="q" defaultValue={values.q ?? ''} placeholder="Título o empresa" />
      </Field>
      <CatalogSelect label="Provincia" name="province" emptyLabel="Todas" items={provinces} value={values.province} />
      <CatalogSelect
        label="Tipo de contrato"
        name="contractType"
        emptyLabel="Todos"
        items={contractTypes}
        value={values.contractType}
      />
      <Button type="submit">Buscar</Button>
    </form>
  )
}
