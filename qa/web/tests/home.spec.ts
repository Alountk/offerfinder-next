import {test, expect, type Page} from '@playwright/test'

test('searching with every filter updates the URL and the list', async ({page}) => {
  await page.goto('/')

  await page.getByRole('searchbox', {name: /texto/i}).fill('desarrollador')
  await page.getByRole('combobox', {name: 'Provincia'}).selectOption({label: 'Madrid'})
  await page.getByRole('combobox', {name: 'Tipo de contrato'}).selectOption({label: 'Autónomo'})
  await page.getByRole('button', {name: 'Buscar'}).click()

  await expect(page).toHaveURL('/?q=desarrollador&province=madrid&contractType=autonomo')
  const offers = page.getByRole('listitem')
  await expect(offers).not.toHaveCount(0)
  await expect(offers.filter({hasNotText: /desarrollador/i})).toHaveCount(0)
  await expect(offers.filter({hasNotText: 'Madrid · Autónomo'})).toHaveCount(0)
})

test('opens the first offer from the list and goes back to the list', async ({page}) => {
  await page.goto('/')

  const firstOffer = page.getByRole('listitem').first()
  const title = (await firstOffer.getByRole('heading').textContent()) ?? ''
  const company = (await firstOffer.locator('p').nth(0).textContent()) ?? ''
  const [province = '', contract = ''] = ((await firstOffer.locator('p').nth(1).textContent()) ?? '').split(' · ')
  await firstOffer.getByRole('link').click()

  await expect(page).toHaveURL(/\/offers\/of-\d+$/)
  await expect(page.locator('header')).toHaveText(title + company + province)
  await expect(page.locator('dl')).toContainText(contract)

  await page.getByRole('link', {name: 'Volver a las ofertas'}).click()

  await expect(page).toHaveURL('/')
  await expect(page.getByRole('heading', {level: 1, name: /ofertas de empleo/i})).toBeVisible()
})

test('paginating moves between pages through the URL and changes the offers', async ({page}) => {
  await page.goto('/')
  const firstOfferLink = page.getByRole('listitem').first().getByRole('link')
  const firstPageOffer = await firstOfferLink.getAttribute('href')

  await page.getByRole('link', {name: 'Siguiente'}).click()

  await expect(page).toHaveURL('/?page=2')
  await expect(page.getByRole('navigation', {name: 'Paginación'})).toContainText(/Página 2 de \d+/)
  await expect(firstOfferLink).not.toHaveAttribute('href', firstPageOffer ?? '')

  await page.getByRole('link', {name: 'Anterior'}).click()

  await expect(page).toHaveURL('/?page=1')
  await expect(firstOfferLink).toHaveAttribute('href', firstPageOffer ?? '')
})

test('the offer page sets the browser tab title to the offer title and company', async ({page}) => {
  await page.goto('/')

  const firstOffer = page.getByRole('listitem').first()
  const title = await firstOffer.getByRole('link').innerText()
  const company = await firstOffer.locator('p').first().innerText()
  await firstOffer.getByRole('link').click()

  await expect(page).toHaveTitle(`${title} · ${company}`)
})

test('a search without matches shows the empty message instead of offers', async ({page}) => {
  await page.goto('/')

  await page.getByRole('searchbox', {name: /texto/i}).fill('zzzz')
  await page.getByRole('button', {name: 'Buscar'}).click()

  await expect(page.getByText('No hay ofertas que coincidan con tu búsqueda.')).toBeVisible()
  await expect(page.getByRole('listitem')).toHaveCount(0)
})

test('an offer that does not exist shows the offer not found page', async ({page}) => {
  await page.goto('/offers/of-9999')

  await expect(page.getByRole('heading', {level: 1, name: 'Oferta no encontrada'})).toBeVisible()
})

test('the search can be done with the keyboard alone', async ({page}) => {
  await page.goto('/')
  await expect(page.getByRole('searchbox', {name: /texto/i})).toBeVisible()

  await page.keyboard.press('Tab')
  await page.keyboard.type('desarrollador')
  await page.keyboard.press('Enter')

  await expect(page).toHaveURL('/?q=desarrollador')
})

test('the control focused with the keyboard shows a visible outline', async ({page}) => {
  await page.goto('/')
  const search = page.getByRole('searchbox', {name: /texto/i})
  await expect(search).toBeVisible()

  await page.keyboard.press('Tab')

  await expect(search).toBeFocused()
  await expect(search).toHaveCSS('outline-style', 'solid')
  await expect(search).toHaveCSS('outline-width', '2px')
})

test.describe('on a phone', () => {
  test.use({viewport: {width: 390, height: 800}})

  test('the filters start collapsed and open from the Filtros summary', async ({page}) => {
    await page.goto('/')
    const search = page.getByRole('searchbox', {name: /texto/i})
    await expect(search).toBeHidden()

    await page.getByText('Filtros', {exact: true}).click()

    await expect(search).toBeVisible()
  })

  test('searching collapses the filters again so the results are visible', async ({page}) => {
    await page.goto('/')
    await page.getByText('Filtros', {exact: true}).click()
    await page.getByRole('searchbox', {name: /texto/i}).fill('desarrollador')
    await page.getByRole('button', {name: 'Buscar'}).click()

    await expect(page).toHaveURL('/?q=desarrollador')
    await expect(page.getByRole('searchbox', {name: /texto/i})).toBeHidden()
    await expect(page.getByRole('listitem').first()).toBeVisible()
  })
})

async function searchWithoutMatches(page: Page) {
  await page.goto('/')
  await page.getByRole('searchbox', {name: /texto/i}).fill('zzzz')
  await page.getByRole('combobox', {name: 'Provincia'}).selectOption({label: 'Madrid'})
  await page.getByRole('combobox', {name: 'Tipo de contrato'}).selectOption({label: 'Autónomo'})
  await page.getByRole('button', {name: 'Buscar'}).click()
  await expect(page.getByText('No hay ofertas que coincidan con tu búsqueda.')).toBeVisible()
}

test('clearing the filters from the empty message also empties the text field', async ({page}) => {
  await searchWithoutMatches(page)

  await page.getByRole('link', {name: 'Quitar filtros'}).click()

  await expect(page).toHaveURL('/')
  await expect(page.getByRole('searchbox', {name: /texto/i})).toHaveValue('')
})

test('clearing the filters from the empty message also resets the selects', async ({page}) => {
  await searchWithoutMatches(page)

  await page.getByRole('link', {name: 'Quitar filtros'}).click()

  await expect(page).toHaveURL('/')
  await expect(page.getByRole('combobox', {name: 'Provincia'})).toHaveValue('')
  await expect(page.getByRole('combobox', {name: 'Tipo de contrato'})).toHaveValue('')
})

test('going back to a previous search restores its text in the field', async ({page}) => {
  await page.goto('/')
  await page.getByRole('searchbox', {name: /texto/i}).fill('desarrollador')
  await page.getByRole('button', {name: 'Buscar'}).click()
  await expect(page).toHaveURL(/[?&]q=desarrollador(&|$)/)
  await page.getByRole('searchbox', {name: /texto/i}).fill('zzzz')
  await page.getByRole('button', {name: 'Buscar'}).click()
  await expect(page).toHaveURL(/[?&]q=zzzz(&|$)/)

  await page.goBack()

  await expect(page).toHaveURL(/[?&]q=desarrollador(&|$)/)
  await expect(page.getByRole('searchbox', {name: /texto/i})).toHaveValue('desarrollador')
})

for (const [field, param, first, second] of [
  ['Provincia', 'province', {label: 'Madrid', id: 'madrid'}, {label: 'Sevilla', id: 'sevilla'}],
  ['Tipo de contrato', 'contractType', {label: 'Indefinido', id: 'indefinido'}, {label: 'Temporal', id: 'temporal'}]
] as const) {
  test(`going back to a previous search restores its ${field.toLowerCase()} in the field`, async ({page}) => {
    await page.goto('/')
    const select = page.getByRole('combobox', {name: field})
    await select.selectOption({label: first.label})
    await page.getByRole('button', {name: 'Buscar'}).click()
    await expect(page).toHaveURL(new RegExp(`[?&]${param}=${first.id}(&|$)`))
    await select.selectOption({label: second.label})
    await page.getByRole('button', {name: 'Buscar'}).click()
    await expect(page).toHaveURL(new RegExp(`[?&]${param}=${second.id}(&|$)`))

    await page.goBack()

    await expect(page).toHaveURL(new RegExp(`[?&]${param}=${first.id}(&|$)`))
    await expect(select).toHaveValue(first.id)
  })
}

test('paginating keeps the text typed in the field but not searched yet', async ({page}) => {
  await page.goto('/')
  await page.getByRole('searchbox', {name: /texto/i}).fill('pendiente')

  await page.getByRole('link', {name: 'Siguiente'}).click()

  await expect(page).toHaveURL('/?page=2')
  await expect(page.getByRole('searchbox', {name: /texto/i})).toHaveValue('pendiente')
})

test('devtools lists the mocked endpoints', async ({page}) => {
  await page.goto('/')

  await page.getByRole('button', {name: /devtools/i}).click()

  const devtools = page.getByRole('dialog', {name: 'DevTools'})
  await expect(devtools.getByText('/offers/:offerId')).toBeVisible()
  await expect(devtools.getByText('/catalogs/provinces')).toBeVisible()
})

test('devtools shows the response of the configured scenario', async ({page}) => {
  await page.goto('/')
  await page.getByRole('button', {name: /devtools/i}).click()

  const devtools = page.getByRole('dialog', {name: 'DevTools'})
  // Endpoints are sorted by path, so the first one is GET /catalogs/contract-types
  await devtools
    .getByRole('button', {name: /response/i})
    .first()
    .click()

  await expect(devtools.getByText('default · status 200')).toBeVisible()
  await expect(devtools.getByText('"Indefinido"').first()).toBeVisible()
})
