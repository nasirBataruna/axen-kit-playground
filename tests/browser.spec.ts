import { test, expect } from '@playwright/test';

const scenarioIds = ['K01', 'K02', 'K03', 'F01', 'F02', 'F03', 'I01', 'I02', 'I03'] as const;

test('nine deep links render and survive direct browser reload', async ({ page }) => {
  for (const id of scenarioIds) {
    await page.goto(`/scenario/${id}`);
    await expect(page.locator('.eyebrow')).toContainText(id);
    await expect(page.getByRole('region', { name: 'Live scenario' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Config' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Source' })).toBeVisible();
    await page.reload();
    await expect(page.locator('.eyebrow')).toContainText(id);
  }
});

test('landing, navigation, source/config and pending provenance are honest', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Explore the boundaries');
  await page.getByRole('navigation', { name: 'Scenarios' }).getByRole('link', { name: /K01.*Theme/i }).click();
  await expect(page).toHaveURL(/\/scenario\/K01$/);
  await expect(page.getByText('Kit artifact pending', { exact: true })).toBeVisible();
  await expect(page.getByText('Kit runtime is not shipped here yet')).toBeVisible();
  await page.getByRole('button', { name: 'Source' }).click();
  await expect(page.locator('.code-panel pre')).toContainText('ILLUSTRATIVE ONLY');
  await page.getByRole('button', { name: 'Config' }).click();
  await expect(page.locator('.code-panel pre')).toContainText('"status": "kit-pending"');
  await page.getByRole('link', { name: /F01.*Basic submission/i }).click();
  await expect(page).toHaveURL(/\/scenario\/F01$/);
  await expect(page.getByText('Real Form demo', { exact: true })).toBeVisible();
});

test('real public Axen Form F01 emits payload and reset clears state', async ({ page }) => {
  await page.goto('/scenario/F01');
  await expect(page.getByText('Live · Axen Form v0.1.19')).toBeVisible();
  const name = page.locator('input[name="fullName"]');
  const email = page.locator('input[name="email"]');
  await expect(name).toBeVisible();
  await expect(email).toBeVisible();
  const submit = page.getByRole('button', { name: /submit/i });
  await submit.click();
  await expect(page.locator('.event-log')).toHaveCount(0);
  await name.fill('Example Tester');
  await email.fill('tester@example.invalid');
  await submit.click();
  const log = page.locator('.event-log');
  await expect(log).toContainText('form.submit');
  await expect(log).toContainText('Example Tester');
  await expect(log).toContainText('tester@example.invalid');
  await page.getByRole('button', { name: /reset/i }).click();
  await expect(name).toHaveValue('');
  await expect(email).toHaveValue('');
  await expect(log).not.toContainText('Example Tester');
  await expect(log).toContainText('Reset requested');
});
