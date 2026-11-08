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
  const summary = (await firstOffer.textContent()) ?? ''
  await firstOffer.getByRole('link').click()

  await expect(page).toHaveURL(/\/offers\/of-\d+$/)
  await expect(page.locator('header')).toHaveText(summary)

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
