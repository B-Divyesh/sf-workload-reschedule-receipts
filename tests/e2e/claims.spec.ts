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

test('@claim:data-import imports a valid JSON backup without leaving the current plan', async ({ page }) => {
  await page.goto('/planner');
  await page.getByRole('textbox', { name: 'Task' }).fill('Backup practice essay');
  await page.getByLabel('Course').fill('WRIT 201');
  await page.getByRole('button', { name: 'Add assignment and plan it' }).click();
  await page.getByText('Study limits and data').click();
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export my data' }).click();
  const download = await downloadEvent;
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(chunk as Buffer);
  await page.locator('[data-import-input]').setInputFiles({ name: 'deadline-reality-check-backup.json', mimeType: 'application/json', buffer: Buffer.concat(chunks) });
  await expect(page.getByText('Backup imported. Review the rebuilt plan.')).toBeVisible();
  await expect(page.getByText('Backup practice essay').first()).toBeVisible();
});

test('@claim:demo-isolation never writes sample tasks into a real plan', async ({ page }) => {
  await page.goto('/?demo=1');
  await expect(page).toHaveTitle('Demo — Deadline Reality Check');
  await expect(page.getByLabel('Demo mode')).toBeVisible();
  await expect(page.getByText('Draft biology lab discussion').first()).toBeVisible();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await page.getByRole('button', { name: /^Mark .* missed$/ }).first().click();
  const databases = await page.evaluate(async () => (await indexedDB.databases()).map((database) => database.name));
  expect(databases).not.toContain('deadline-reality-check:real');
  expect(databases).not.toContain('deadline-reality-check:demo');
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

test('@claim:manual-estimate-trims changes an estimate only after an explicit trim', async ({ page }) => {
  await page.goto('/demo');
  const history = page.locator('.task-item', { hasText: 'Check history essay citations' });
  await expect(history).toContainText('HIST 118 · 2 hr');
  await expect(page.getByText('No estimate was cut without your choice.')).toBeVisible();
  await page.getByRole('button', { name: /^Mark .* missed$/ }).first().click();
  await expect(history).toContainText('HIST 118 · 2 hr');
  const trim = page.locator('.data-row', { hasText: 'Check history essay citations' }).getByRole('button', { name: 'Trim 30 min' });
  await trim.click();
  await expect(history).toContainText('HIST 118 · 1 hr 30 min');
});

test('@claim:uncertainty-visible keeps rough estimates visible in the receipt', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.locator('.task-item', { hasText: 'Check history essay citations' })).toContainText('rough estimate');
  await expect(page.getByText('Rough estimates are marked below for review.')).toBeVisible();
  await expect(page.getByText(/has a rough estimate/).first()).toBeVisible();
});

test('@claim:indexeddb-storage saves a real plan in its own IndexedDB database', async ({ page }) => {
  await page.goto('/planner');
  await page.getByRole('textbox', { name: 'Task' }).fill('IndexedDB practice');
  await page.getByLabel('Course').fill('DATA 101');
  await page.getByRole('button', { name: 'Add assignment and plan it' }).click();
  await expect(page.getByText('IndexedDB practice').first()).toBeVisible();
  await page.reload();
  await expect(page.getByText('IndexedDB practice').first()).toBeVisible();
  const databases = await page.evaluate(async () => (await indexedDB.databases()).map((database) => database.name));
  expect(databases).toContain('deadline-reality-check:real');
});

test('@claim:license-token-privacy sends only the license token to Sociobot verification', async ({ page }) => {
  const requests: Array<{ url: string; method: string; body: string | null }> = [];
  await page.route('https://api.sociobot.in/**', async (route) => {
    const request = route.request();
    requests.push({ url: request.url(), method: request.method(), body: request.postData() });
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ valid: true, reason: 'ok' }) });
  });
  await page.goto('/planner?license=private-test-token');
  await expect(page.getByText('Unlimited license active')).toBeVisible();
  expect(requests).toHaveLength(1);
  const request = requests[0];
  const url = new URL(request.url);
  expect(url.origin).toBe('https://api.sociobot.in');
  expect(url.pathname).toBe('/api/v1/products/workload-reschedule-receipts/verify');
  expect(url.searchParams.get('license')).toBe('private-test-token');
  expect(request.method).toBe('GET');
  expect(request.body).toBeNull();
});

test('@claim:billing-terms names the merchant and points to Sociobot checkout', async ({ page }) => {
  await page.goto('/terms');
  await expect(page.getByText('Sociobot and Dodo are the merchant of record.')).toBeVisible();
  await expect(page.getByText('Their checkout handles payment and refunds.')).toBeVisible();
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Buy the one-time license' })).toHaveAttribute('href', checkoutUrl);
});

test('@claim:free-core allows four active tasks, releases completed tasks, and explains a fifth active task', async ({ page }) => {
  await page.goto('/planner');
  for (let index = 1; index <= 4; index += 1) {
    await page.getByRole('textbox', { name: 'Task' }).fill(`Assignment ${index}`);
    await page.getByLabel('Course').fill('STUDY 101');
    await page.getByLabel('Time estimate').selectOption('30');
    await page.getByRole('button', { name: 'Add assignment and plan it' }).click();
  }
  await expect(page.getByText('4 / 4 free tasks')).toBeVisible();
  await page.getByRole('textbox', { name: 'Task' }).fill('Assignment 5');
  await page.getByLabel('Course').fill('STUDY 101');
  await page.getByRole('button', { name: 'Add assignment and plan it' }).click();
  await expect(page.getByText('The free plan holds four active tasks. Finish one or buy the one-time license.')).toBeVisible();
  await expect(page.locator('.task-item')).toHaveCount(4);
  const doneButtons = page.getByRole('button', { name: /^Mark .* done$/ });
  while (await doneButtons.count()) {
    const before = await doneButtons.count();
    await doneButtons.first().click();
    await expect(doneButtons).toHaveCount(before - 1);
  }
  await expect(page.getByText('0 / 4 free tasks')).toBeVisible();
  await page.getByRole('textbox', { name: 'Task' }).fill('Assignment 5');
  await page.getByLabel('Course').fill('STUDY 101');
  await page.getByRole('button', { name: 'Add assignment and plan it' }).click();
  await expect(page.getByText('Assignment 5').first()).toBeVisible();
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

test('rejected backups leave the running planner valid', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/planner');
  await page.getByText('Study limits and data').click();
  await page.locator('[data-import-input]').setInputFiles({ name: 'incomplete.json', mimeType: 'application/json', buffer: Buffer.from('{"tasks":[],"settings":{}}') });
  await expect(page.getByText('This backup could not be read. Your current plan was not changed. Choose a JSON export from this app.')).toBeVisible();
  await page.getByRole('textbox', { name: 'Task' }).fill('Still planning');
  await page.getByLabel('Course').fill('BIO 204');
  await page.getByRole('button', { name: 'Add assignment and plan it' }).click();
  await expect(page.getByText('Still planning').first()).toBeVisible();
  expect(errors).toEqual([]);
});

test('trims stop before an estimate becomes negative', async ({ page }) => {
  await page.goto('/demo');
  const row = page.locator('.data-row', { hasText: 'Check history essay citations' });
  for (let index = 0; index < 3; index += 1) await row.getByRole('button', { name: 'Trim 30 min' }).click();
  await expect(page.getByText(/HIST 118 · 30 min/).first()).toBeVisible();
  await expect(row.getByRole('button', { name: 'Trim 30 min' })).toHaveCount(0);
  await expect(page.getByText(/-1 hr/)).toHaveCount(0);
});

test('deleting an assignment preserves the names in its existing receipts', async ({ page }) => {
  await page.goto('/demo');
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Delete Draft biology lab discussion' }).click();
  await expect(page.getByText(/Missed:.*Draft biology lab discussion/)).toBeVisible();
});

test('a cached invalid license keeps its inactive notice after reload', async ({ page }) => {
  await page.route('https://api.sociobot.in/**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ valid: false, reason: 'invalid' }) }));
  await page.goto('/demo?license=invalid-license');
  await expect(page.getByText('This license is no longer active.')).toBeVisible();
  await page.reload();
  await expect(page.getByText('This license is no longer active.')).toBeVisible();
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

test('direct routes set their own title, description, canonical URL, and focused heading', async ({ page }) => {
  const routes = [
    ['/planner', 'Planner — Deadline Reality Check', 'https://workload-reschedule-receipts.sociobot.in/planner'],
    ['/demo', 'Demo — Deadline Reality Check', 'https://workload-reschedule-receipts.sociobot.in/demo'],
    ['/privacy', 'Privacy — Deadline Reality Check', 'https://workload-reschedule-receipts.sociobot.in/privacy'],
    ['/terms', 'Terms — Deadline Reality Check', 'https://workload-reschedule-receipts.sociobot.in/terms'],
  ] as const;
  for (const [route, title, canonical] of routes) {
    await page.goto(route);
    await expect(page).toHaveTitle(title);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonical);
    await expect(page.locator('h1')).toHaveCount(1);
  }
  await page.getByLabel('Main navigation').getByRole('link', { name: 'Privacy' }).click();
  await expect(page.locator('h1')).toBeFocused();
  await page.goBack();
  await expect(page.locator('h1')).toBeFocused();
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

test('the static 404 keeps the product shell, dark treatment, and a 44px return action', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/404.html');
  await expect(page.locator('header')).toHaveCount(1);
  await expect(page.locator('footer')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'This page is not in the plan' })).toBeVisible();
  const home = page.getByRole('link', { name: 'Return home' });
  const box = await home.boundingBox();
  expect(box?.height).toBeGreaterThanOrEqual(44);
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(17, 24, 21)');
});

test('the static 404 includes complete route metadata', async ({ page }) => {
  await page.goto('/404.html');
  await expect(page).toHaveTitle('Page not found — Deadline Reality Check');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/404\.html$/);
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href', '/icons/apple-touch-icon.png');
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', '/manifest.webmanifest');
  for (const property of ['og:title', 'og:description', 'og:image']) {
    await expect(page.locator(`meta[property="${property}"]`)).toHaveCount(1);
  }
  for (const name of ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']) {
    await expect(page.locator(`meta[name="${name}"]`)).toHaveCount(1);
  }
});
