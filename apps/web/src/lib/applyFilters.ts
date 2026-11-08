'use server'

import type {Route} from 'next'
import {redirect} from 'next/navigation'
import {toQueryString} from './queryString'
import {parseSearchParams} from './searchParams'

function textField(formData: FormData, name: string) {
  const value = formData.get(name)
  return typeof value === 'string' ? value : undefined
}

export async function applyFilters(formData: FormData) {
  const filters = parseSearchParams({
    q: textField(formData, 'q'),
    province: textField(formData, 'province'),
    contractType: textField(formData, 'contractType')
  })

  redirect(`/${toQueryString(filters)}` as Route)
}
