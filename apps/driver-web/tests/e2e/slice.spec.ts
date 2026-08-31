import { test, expect } from '@playwright/test';

/**
 * Full vertical slice against the in-memory fixture (E2E_STUB_API=1, see
 * ../../src/server/e2e-fixture.ts). Driver "Alex Rivera" / PIN 1234.
 */
test('driver signs in, opens a stop, and records a drop', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Driver').selectOption({ label: 'Alex Rivera' });
  await page.getByLabel('PIN').fill('1234');
  await page.getByRole('button', { name: 'Sign in' }).click();

  // Dashboard
  await expect(page).toHaveURL(/\/route/);
  await expect(page.getByText('START ROUTE')).toBeVisible();

  // Manifest
  await page.getByRole('link', { name: /START ROUTE/ }).click();
  await expect(page).toHaveURL(/\/manifest/);
  await expect(page.getByText('Fit Profits')).toBeVisible();
  await expect(page.getByText('MORNING TEA')).toBeVisible();

  // Stop detail
  await page.getByRole('link', { name: /House Business Group/ }).click();
  await expect(page).toHaveURL(/\/stops\//);
  await expect(page.getByRole('heading', { name: 'House Business Group' })).toBeVisible();
  await expect(page.getByText(/Stop #3 of 3/)).toBeVisible();

  // Record a drop of 3 × 240L
  await page.getByLabel('Drop off box / bin type').selectOption('240L');
  await page.getByLabel('Drop off quantity', { exact: true }).fill('3');
  await page.getByRole('button', { name: /Confirm and save/i }).click();

  await expect(page.getByText(/Saved — dropped 3 × 240L/)).toBeVisible();
  await expect(page).toHaveURL(/\/manifest/);
});

test('unauthenticated access to the manifest redirects to login', async ({ page }) => {
  await page.goto('/manifest');
  await expect(page).toHaveURL(/\/login/);
});
