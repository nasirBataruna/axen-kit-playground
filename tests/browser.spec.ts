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
  await expect(page.getByText('Real Kit demo', { exact: true })).toBeVisible();
  await expect(page.locator('[data-axen-kit-shell]')).toBeVisible();
  await page.getByRole('button', { name: 'Source' }).click();
  await expect(page.locator('.code-panel pre')).toContainText('Real Kit-only package');
  await page.getByRole('button', { name: 'Config' }).click();
  await expect(page.locator('.code-panel pre')).toContainText('"status": "live-kit"');
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
  await expect(page.locator('[data-submit-state="invalid"]')).toContainText('Please correct the highlighted fields');
  await expect(page.locator('.event-log')).toHaveCount(0);
  await name.fill('Example Tester');
  await email.fill('tester@example.invalid');
  await submit.click();
  const log = page.locator('.event-log');
  await expect(log).toContainText('form.submit');
  await expect(log).toContainText('Example Tester');
  await expect(log).toContainText('tester@example.invalid');
  await expect(page.locator('[data-submit-state="success"]')).toContainText('Submission successful');
  await page.getByRole('button', { name: /reset/i }).click();
  await expect(name).toHaveValue('');
  await expect(email).toHaveValue('');
  await expect(log).not.toContainText('Example Tester');
  await expect(log).toContainText('Reset requested');
  await expect(page.locator('[data-submit-state="idle"]')).toBeVisible();
});

test('real Kit AppShell wraps real AxenForm and submits values', async ({ page }) => {
  await page.goto('/scenario/I01');
  await expect(page.locator('[data-axen-kit-shell="kit-form-playground"]')).toBeVisible();
  await expect(page.locator('[data-axen-kit-slot="main"]')).toBeVisible();
  await page.locator('input[name="fullName"]').fill('Integrated Person');
  await page.locator('input[name="email"]').fill('integrated@example.invalid');
  await page.getByRole('button', { name: 'Submit Kit + Form' }).click();
  await expect(page.locator('[data-submit-state="success"]')).toContainText('Submission successful');
  await expect(page.locator('.event-log')).toContainText('Integrated Person');
  await page.getByRole('button', { name: /reset/i }).click();
  await expect(page.locator('input[name="fullName"]')).toHaveValue('');
  await expect(page.locator('[data-submit-state="idle"]')).toBeVisible();
});
test('Kit theme toggle preserves live Form values until reset', async ({ page }) => {
  await page.goto('/scenario/I02');
  const shell = page.locator('[data-axen-kit-shell="kit-form-playground"]');
  const name = page.locator('input[name="fullName"]');
  await name.fill('Persistent Draft');
  const before = await shell.evaluate(el => getComputedStyle(el).getPropertyValue('--axen-color-primary').trim());
  await page.getByRole('button', { name: 'Switch Kit theme' }).click();
  await expect(name).toHaveValue('Persistent Draft');
  const after = await shell.evaluate(el => getComputedStyle(el).getPropertyValue('--axen-color-primary').trim());
  expect(after).not.toBe(before);
  await page.getByRole('button', { name: /reset/i }).click();
  await expect(name).toHaveValue('');
});

test('I01 invalid submit gives immediate inline accessible feedback without an event', async ({ page }) => {
  await page.goto('/scenario/I01');
  await page.getByRole('button', { name: 'Submit Kit + Form' }).click();
  await expect(page.getByRole('alert')).toContainText('Please correct the highlighted fields');
  await expect(page.locator('[data-submit-state="invalid"]')).toBeVisible();
  await expect(page.locator('.event-log')).toHaveCount(0);
  await page.locator('input[name="fullName"]').fill('Nashir');
  await page.locator('input[name="email"]').fill('not-an-email');
  await page.getByRole('button', { name: 'Submit Kit + Form' }).click();
  await expect(page.locator('[data-submit-state="invalid"]')).toBeVisible();
  await page.locator('input[name="email"]').fill('nashir@example.com');
  await page.getByRole('button', { name: 'Submit Kit + Form' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Submission successful' })).toBeVisible();
  await expect(page.locator('.event-log')).toContainText('nashir@example.com');
});

test('I02 inline success remains visible and theme switch preserves submitted values', async ({ page }) => {
  await page.goto('/scenario/I02');
  await page.locator('input[name="fullName"]').fill('Theme Tester');
  await page.locator('input[name="email"]').fill('theme@example.invalid');
  await page.getByRole('button', { name: 'Switch Kit theme' }).click();
  await page.getByRole('button', { name: 'Submit Kit + Form' }).click();
  await expect(page.locator('[data-submit-state="success"]')).toContainText('Submission successful');
  await expect(page.locator('input[name="fullName"]')).toHaveValue('Theme Tester');
  await page.getByRole('button', { name: /reset/i }).click();
  await expect(page.locator('[data-submit-state="idle"]')).toBeVisible();
});
