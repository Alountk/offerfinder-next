import {test, expect} from '@playwright/test'

test('home explains the technical exercise', async ({page}) => {
  await page.goto('/')

  await expect(page.getByRole('heading', {level: 1, name: /buscador de ofertas/i})).toBeVisible()
  await expect(page.getByText(/arquitectura testeable y mantenible/i)).toBeVisible()
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
