import {test, expect} from '@playwright/test'

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
  const summary = await firstOffer.innerText()
  await firstOffer.getByRole('link').click()

  await expect(page).toHaveURL(/\/offers\/of-\d+$/)
  await expect(page.locator('header')).toHaveText(summary)

  await page.getByRole('link', {name: 'Volver a las ofertas'}).click()

  await expect(page).toHaveURL('/')
  await expect(page.getByRole('heading', {level: 1, name: /ofertas de empleo/i})).toBeVisible()
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
