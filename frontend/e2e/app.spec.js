import { test, expect } from '@playwright/test'

const PW = 'Password123!'

async function login(page, { email }) {
  await page.goto('/login')
  await page.getByLabel('Email address').fill(email)
  await page.getByLabel('Password', { exact: true }).fill(PW)
  await page.getByRole('button', { name: /^log in$/i }).click()
}

test('landing page renders', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /Compassionate care/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /Enroll a Child/i }).first()).toBeVisible()
})

test('admin can log in and sees real dashboard data', async ({ page }) => {
  await login(page, { roleTab: 'Admin', email: 'admin@clearmind.ph' })
  await expect(page).toHaveURL(/\/admin/)
  await expect(page.getByText('Total Active Students')).toBeVisible()
  // navigate via the sidebar (SPA, no reload)
  await page.getByRole('link', { name: 'PATIENTS' }).click()
  await expect(page.getByText('Leo Cruz')).toBeVisible()
  await expect(page.getByText('CMPS-2026-001')).toBeVisible()
})

test('client can log in and sees their child profile', async ({ page }) => {
  await login(page, { email: 'client@clearmind.ph' })
  await expect(page).toHaveURL(/\/client\/home/)
  await expect(page.getByText(/Good Day, Leo/i)).toBeVisible()
  await page.getByRole('link', { name: /Leo Cruz/ }).click()
  await expect(page).toHaveURL(/\/client\/profile/)
  await expect(page.getByText('Autism Spectrum Disorder')).toBeVisible()
})

test('client can edit and save their profile (CRUD)', async ({ page }) => {
  await login(page, { email: 'client@clearmind.ph' })
  await page.getByRole('link', { name: /Leo Cruz/ }).click()
  await expect(page).toHaveURL(/\/client\/profile/)
  await expect(page.getByText('Autism Spectrum Disorder')).toBeVisible()

  await page.getByRole('button', { name: 'Edit' }).click()
  const blood = page.getByLabel('Blood Type')
  await blood.fill('B+')
  await page.getByRole('button', { name: 'Save' }).click()
  // after save it reloads and shows the new value (edit mode closed -> Edit button back)
  await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible()
  await expect(page.getByText('B+')).toBeVisible()

  // revert so the test is idempotent
  await page.getByRole('button', { name: 'Edit' }).click()
  await page.getByLabel('Blood Type').fill('O+')
  await page.getByRole('button', { name: 'Save' }).click()
  await expect(page.getByText('O+')).toBeVisible()
})

test('psychologist portal loads with real roster data', async ({ page }) => {
  await login(page, { roleTab: 'Clinician', email: 'psych@clearmind.ph' })
  await expect(page).toHaveURL(/\/psychologist/)
  await page.getByRole('link', { name: 'ROSTER OVERVIEW' }).click()
  await expect(page.getByText('Client Roster Overview')).toBeVisible()
  await expect(page.getByText('Alex Johnson')).toBeVisible()
})

test('psychometrician portal loads with real data', async ({ page }) => {
  await login(page, { roleTab: 'RPm', email: 'rpm@clearmind.ph' })
  await expect(page).toHaveURL(/\/psychometrician/)
  await page.getByRole('link', { name: 'DATA REVIEW' }).click()
  await expect(page.getByText('Submitted Checklists')).toBeVisible()
})

test('universal login routes by account role (admin -> /admin)', async ({ page }) => {
  await login(page, { email: 'admin@clearmind.ph' })
  await expect(page).toHaveURL(/\/admin/)
})

test('mobile: sidebar is a drawer opened by the hamburger', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await login(page, { roleTab: 'Admin', email: 'admin@clearmind.ph' })
  await expect(page).toHaveURL(/\/admin/)
  const menu = page.getByRole('button', { name: 'Open menu' })
  await expect(menu).toBeVisible() // hamburger only shows on small screens
  await menu.click()
  await page.getByRole('link', { name: 'PATIENTS' }).click() // nav link lives in the drawer
  await expect(page.getByText('Leo Cruz')).toBeVisible()
})

test('therapist mockup portals are reachable', async ({ page }) => {
  await page.goto('/speech')
  await expect(page.getByText(/Speech Therapy — Caseload/i)).toBeVisible()
  await page.getByRole('link', { name: 'ROUTED REPORTS' }).click()
  await expect(page.getByText(/Routed Reports/i).first()).toBeVisible()

  await page.goto('/occupational')
  await expect(page.getByText(/Occupational Therapy — Caseload/i)).toBeVisible()
})
