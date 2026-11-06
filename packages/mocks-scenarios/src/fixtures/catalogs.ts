import type {CatalogItem} from '../domain/types'

export const PROVINCES: CatalogItem[] = [
  {id: 'barcelona', label: 'Barcelona'},
  {id: 'madrid', label: 'Madrid'},
  {id: 'valencia', label: 'Valencia'},
  {id: 'sevilla', label: 'Sevilla'},
  {id: 'bilbao', label: 'Bizkaia'},
  {id: 'zaragoza', label: 'Zaragoza'},
  {id: 'malaga', label: 'Málaga'}
]

export const CONTRACT_TYPES: CatalogItem[] = [
  {id: 'indefinido', label: 'Indefinido'},
  {id: 'temporal', label: 'Temporal'},
  {id: 'formativo', label: 'Prácticas / Formativo'},
  {id: 'autonomo', label: 'Autónomo'}
]
