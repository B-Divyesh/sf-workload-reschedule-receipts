import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import path from 'node:path';

const checkoutUrl = 'https://api.sociobot.in/api/v1/products/workload-reschedule-receipts/checkout';

test('@claim:reschedule-receipt turns a missed block into a revised plan and receipt', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByRole('heading', { name: 'What this miss changes' })).toBeVisible();
  await expect(page.getByText(/Replacement:/)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Revised study blocks' })).toBeVisible();
  const firstMissed = page.getByRole('button', { name: /^Mark .* missed$/ }).first();
  await firstMissed.click();
  await expect(page.getByText('The plan changed. Read the receipt first.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'What this miss changes' })).toBeVisible();
});

test('@claim:ics-import imports local ICS busy time', async ({ page }) => {
  await page.goto('/planner');
  await page.locator('[data-ics-input]').setInputFiles(path.join(import.meta.dirname, '../fixtures/campus-week.ics'));
  await expect(page.getByText(/campus-week\.ics · 2 timed events/)).toBeVisible();
  await expect(page.getByText('2 calendar events now protect busy time.')).toBeVisible();
});

test('@claim:data-export exports a readable JSON backup', async ({ page }) => {
  await page.goto('/planner');
  await page.getByText('Study limits and data').click();
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export my data' }).click();
  const download = await downloadEvent;
  const stream = await download.createReadStream();
  let body = '';
  for await (const chunk of stream) body += chunk.toString();
  expect(JSON.parse(body)).toMatchObject({ tasks: [], busyEvents: [], receipts: [] });
});

test('@claim:demo-isolation never writes sample tasks into a real plan', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByText('Draft biology lab discussion').first()).toBeVisible();
  await page.getByRole('link', { name: 'Start for real' }).click();
  await expect(page.getByText('0 / 4 free tasks')).toBeVisible();
  await expect(page.getByText('No assignments yet')).toBeVisible();
});

test('@claim:local-only makes no cross-origin request in the demo', async ({ page }) => {
  const outside: string[] = [];
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.origin !== 'http://127.0.0.1:4173') outside.push(request.url());
  });
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await page.getByRole('button', { name: /^Mark .* missed$/ }).first().click();
  expect(outside).toEqual([]);
});

test('@claim:free-core allows four tasks and explains the fifth', async ({ page }) => {
  await page.goto('/planner');
  for (let index = 1; index <= 4; index += 1) {
    await page.getByRole('textbox', { name: 'Task' }).fill(`Assignment ${index}`);
    await page.getByLabel('Course').fill('STUDY 101');
    await page.getByRole('button', { name: 'Add assignment and plan it' }).click();
  }
  await expect(page.getByText('4 / 4 free tasks')).toBeVisible();
  await page.getByRole('textbox', { name: 'Task' }).fill('Assignment 5');
  await page.getByLabel('Course').fill('STUDY 101');
  await page.getByRole('button', { name: 'Add assignment and plan it' }).click();
  await expect(page.getByText('The free plan holds four active tasks. Remove one or buy the one-time license.')).toBeVisible();
  await expect(page.locator('.task-item')).toHaveCount(4);
});

test('@claim:paid-checkout shows the exact price, reaches hosted checkout, and enables paid receipt history', async ({ page, request }) => {
  await page.goto('/');
  await expect(page.getByText('$9 once', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Buy the one-time license' })).toHaveAttribute('href', checkoutUrl);
  const response = await request.get(checkoutUrl, { maxRedirects: 0 });
  expect(response.status(), 'checkout must redirect to Sociobot’s hosted checkout').toBeGreaterThanOrEqual(300);
  expect(response.status()).toBeLessThan(400);
  expect(response.headers().location, 'checkout must provide its hosted destination').toBeTruthy();
  await page.route('https://api.sociobot.in/**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ valid: true, reason: 'ok' }) }));
  await page.goto('/demo?license=test-license');
  await expect(page.getByText('Unlimited license active')).toBeVisible();
  await page.getByRole('button', { name: /^Mark .* missed$/ }).first().click();
  await expect(page.getByRole('heading', { name: 'Past receipts' })).toBeVisible();
});

test('@claim:offline-reload reloads the demo without a network', async ({ page, context }) => {
  await page.goto('/demo');
  await page.waitForFunction(async () => {
    if (!navigator.serviceWorker.controller) {
      await new Promise<void>((resolve) => navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), { once: true }));
    }
    return Boolean(navigator.serviceWorker.controller);
  });
  await page.waitForFunction(async () => {
    const names = await caches.keys();
    const cache = await caches.open(names.find((name) => name.startsWith('drc-')) ?? 'missing');
    const keys = await cache.keys();
    return keys.some((request) => request.url.endsWith('.js')) && keys.some((request) => request.url.endsWith('.css'));
  });
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Rebuild the plan you have' })).toBeVisible();
  await expect(page.getByText('Offline — your saved plan still works.')).toBeVisible();
});

test('landing and planner have no serious accessibility issues or console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  for (const route of ['/', '/demo', '/privacy', '/terms']) {
    await page.goto(route);
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
  }
  expect(errors).toEqual([]);
});

test('dark routes keep footer text and links readable', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  for (const route of ['/', '/demo', '/planner', '/privacy', '/terms']) {
    await page.goto(route);
    await expect(page.locator('.site-footer')).toHaveCSS('background-color', 'rgb(5, 10, 8)');
    await expect(page.locator('.site-footer')).toHaveCSS('color', 'rgb(244, 240, 230)');
    await expect(page.locator('.site-footer a').first()).toHaveCSS('color', 'rgb(244, 240, 230)');
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
  }
});

test('390px core controls retain 44px touch targets', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/demo');
  const controls = page.locator('.site-header a, .demo-banner button, .demo-banner a, .plan-actions button');
  for (let index = 0; index < await controls.count(); index += 1) {
    const box = await controls.nth(index).boundingBox();
    expect(box, `control ${index} should be visible`).not.toBeNull();
    expect(box!.width, `control ${index} width`).toBeGreaterThanOrEqual(44);
    expect(box!.height, `control ${index} height`).toBeGreaterThanOrEqual(44);
  }
});
