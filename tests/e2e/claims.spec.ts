import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import path from 'node:path';

const checkoutUrl = 'https://api.sociobot.in/api/v1/products/workload-reschedule-receipts/checkout';

test('@claim:reschedule-receipt turns a missed block into a revised plan and receipt', async ({ page }) => {
  await page.goto('/?demo=1');
  await expect(page.getByRole('heading', { name: 'What this miss changes' })).toBeVisible();
  const receipt = page.locator('article.receipt');
  const beforeReceiptId = await receipt.getAttribute('data-receipt-id');
  const beforeMiss = await receipt.locator('.receipt-section').first().locator('p').first().textContent();
  const beforeSchedule = await page.locator('.plan-block').evaluateAll((blocks) => blocks.map((block) => ({
    start: block.getAttribute('data-block-start'),
    end: block.getAttribute('data-block-end'),
    text: block.textContent?.replace(/\s+/g, ' ').trim(),
  })));
  const deadlineRisk = receipt.locator('.receipt-section', { has: page.getByRole('heading', { name: 'Deadline risk' }) });
  const beforeRisk = await deadlineRisk.getByRole('listitem').allTextContents();
  expect(beforeReceiptId).toBeTruthy();
  expect(beforeSchedule.length).toBeGreaterThan(0);
  expect(beforeRisk.length).toBeGreaterThan(0);
  const firstMissed = page.getByRole('button', { name: /^Mark .* missed$/ }).first();
  await firstMissed.click();
  await expect(page.getByText('The plan changed. Read the receipt first.')).toBeVisible();
  const afterReceiptId = await receipt.getAttribute('data-receipt-id');
  const afterMiss = await receipt.locator('.receipt-section').first().locator('p').first().textContent();
  const afterSchedule = await page.locator('.plan-block').evaluateAll((blocks) => blocks.map((block) => ({
    start: block.getAttribute('data-block-start'),
    end: block.getAttribute('data-block-end'),
    text: block.textContent?.replace(/\s+/g, ' ').trim(),
  })));
  const afterRisk = await deadlineRisk.getByRole('listitem').allTextContents();
  expect(afterReceiptId).not.toBe(beforeReceiptId);
  expect(afterMiss).not.toBe(beforeMiss);
  expect(afterSchedule).not.toEqual(beforeSchedule);
  expect(afterRisk.length).toBeGreaterThan(0);
  expect(afterRisk).toEqual(beforeRisk);
  await expect(receipt.locator('.status-risk')).toHaveText(`${afterRisk.length} deadline at risk`);
});

test('@claim:receipt-copy copies the current receipt to the clipboard', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/?demo=1');
  await page.getByRole('button', { name: 'Copy receipt' }).click();
  await expect(page.getByText('Receipt copied.')).toBeVisible();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toMatch(/DEADLINE REALITY CHECK/);
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toMatch(/Missed: 1 hr of Draft biology lab discussion/);
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toMatch(/Risk:/);
});

test('@claim:receipt-download downloads the current receipt as a text file', async ({ page }) => {
  await page.goto('/?demo=1');
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download receipt' }).click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe('deadline-reality-check.txt');
  const stream = await download.createReadStream();
  let body = '';
  for await (const chunk of stream) body += chunk.toString();
  expect(body).toMatch(/DEADLINE REALITY CHECK/);
  expect(body).toMatch(/Missed: 1 hr of Draft biology lab discussion/);
  expect(body).toMatch(/Risk:/);
});

test('@claim:ics-import imports calendar events and schedules outside both busy ranges', async ({ page }) => {
  await page.clock.install({ time: new Date('2029-12-31T20:00:00.000Z') });
  await page.goto('/planner');
  await page.getByText('Study limits and data').click();
  await page.getByLabel('Daily study limit').selectOption('360');
  await page.getByRole('button', { name: 'Save limits and rebuild' }).click();
  await page.getByRole('textbox', { name: 'Assignment' }).fill('Calendar collision check');
  await page.getByLabel('Course').fill('STAT 210');
  await page.getByLabel('Deadline').fill('2030-01-02T18:00');
  await page.getByLabel('Time estimate').selectOption('360');
  await page.getByRole('button', { name: 'Add assignment and plan it' }).click();
  await page.locator('[data-ics-input]').setInputFiles(path.join(import.meta.dirname, '../fixtures/campus-week.ics'));
  await expect(page.getByText(/campus-week\.ics · 2 timed events/)).toBeVisible();
  await expect(page.getByText('2 calendar events now protect busy time.')).toBeVisible();
  const blocks = await page.locator('.plan-block').evaluateAll((items) => items.map((item) => ({
    start: item.getAttribute('data-block-start') ?? '',
    end: item.getAttribute('data-block-end') ?? '',
  })));
  const busy = [
    { start: new Date('2030-01-01T09:00:00.000Z'), end: new Date('2030-01-01T10:30:00.000Z') },
    { start: new Date('2030-01-01T13:00:00.000Z'), end: new Date('2030-01-01T16:00:00.000Z') },
  ];
  expect(blocks.length).toBeGreaterThan(3);
  for (const block of blocks) {
    const start = new Date(block.start);
    const end = new Date(block.end);
    expect(busy.every((event) => end <= event.start || start >= event.end), `${block.start}–${block.end} must avoid imported events`).toBe(true);
  }
  expect(blocks.some((block) => block.start === '2030-01-01T10:30:00.000Z')).toBe(true);
  expect(blocks.some((block) => block.start === '2030-01-01T16:00:00.000Z')).toBe(true);
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

test('@claim:data-import restores distinctive assignments, calendar data, settings, and a receipt into an empty real plan', async ({ page }) => {
  await page.goto('/?demo=1');
  await page.getByText('Study limits and data').click();
  await page.getByLabel('Start hour').fill('9');
  await page.getByLabel('Daily study limit').selectOption('360');
  await page.getByLabel('Longest work block').selectOption('90');
  await page.getByRole('button', { name: 'Save limits and rebuild' }).click();
  await page.getByRole('button', { name: /^Mark .* missed$/ }).first().click();
  await expect(page.getByRole('heading', { name: 'What this miss changes' })).toBeVisible();
  await page.getByText('Study limits and data').click();
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export my data' }).click();
  const download = await downloadEvent;
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(chunk as Buffer);
  const backup = Buffer.concat(chunks);
  const saved = JSON.parse(backup.toString());
  expect(saved.tasks.some((assignment: { title?: string }) => assignment.title === 'Draft biology lab discussion')).toBe(true);
  expect(saved.calendarName).toBe('Campus week.ics');
  expect(saved.busyEvents).toHaveLength(2);
  expect(saved.settings).toMatchObject({ dayStartHour: 9, maxDailyMinutes: 360, blockMinutes: 90 });
  expect(saved.receipts).toHaveLength(1);
  await page.getByRole('link', { name: 'Start for real' }).click();
  await expect(page.getByText('No assignments yet')).toBeVisible();
  await page.getByText('Study limits and data').click();
  await page.locator('[data-import-input]').setInputFiles({ name: 'deadline-reality-check-backup.json', mimeType: 'application/json', buffer: Buffer.concat(chunks) });
  await expect(page.getByText('Backup imported. Review the rebuilt plan.')).toBeVisible();
  await expect(page.getByText('Draft biology lab discussion').first()).toBeVisible();
  await expect(page.getByText('Campus week.ics · 2 timed events')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'What this miss changes' })).toBeVisible();
  await expect(page.getByText(/Missed:.*Draft biology lab discussion/)).toBeVisible();
  await page.getByText('Study limits and data').click();
  await expect(page.getByLabel('Start hour')).toHaveValue('9');
  await expect(page.getByLabel('Daily study limit')).toHaveValue('360');
  await expect(page.getByLabel('Longest work block')).toHaveValue('90');
});

test('@claim:demo-isolation never writes sample assignments into a real plan', async ({ page }) => {
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
  await expect(page.getByText('0 / 4 free assignments')).toBeVisible();
  await expect(page.getByText('No assignments yet')).toBeVisible();
});

test('@claim:local-only keeps landing, demo, and real planning traffic on an exact local asset allowlist with no beacons', async ({ page, request }) => {
  const rootResponse = await request.get('/');
  expect(rootResponse.ok()).toBe(true);
  const appOrigin = new URL(rootResponse.url()).origin;
  const html = await rootResponse.text();
  const builtAssets = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
    .map((match) => new URL(match[1], appOrigin).pathname)
    .filter((pathname) => pathname.startsWith('/assets/'));
  const allowedPaths = new Set([
    '/', '/index.html', '/planner', '/demo', '/privacy', '/terms',
    '/service-worker.js', '/manifest.webmanifest', '/favicon.svg',
    '/assets/hero-plan-720.webp', '/assets/hero-plan-1200.webp', '/assets/social-card.webp',
    '/icons/apple-touch-icon.png', '/icons/icon-192.png', '/icons/icon-512.png', '/icons/icon-maskable-512.png',
    ...builtAssets,
  ]);
  const observed: Array<{ origin: string; pathname: string; url: string }> = [];
  page.on('request', (request) => {
    const url = new URL(request.url());
    observed.push({ origin: url.origin, pathname: url.pathname, url: request.url() });
  });
  await page.addInitScript(() => {
    const target = window as Window & { __drcBeaconCalls?: string[] };
    target.__drcBeaconCalls = [];
    const original = navigator.sendBeacon?.bind(navigator);
    navigator.sendBeacon = (url, data) => {
      target.__drcBeaconCalls?.push(String(url));
      return original ? original(url, data) : false;
    };
  });
  await page.goto('/');
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL(/\?demo=1$/);
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await page.getByRole('button', { name: /^Mark .* missed$/ }).first().click();
  await page.getByRole('link', { name: 'Start for real' }).click();
  await page.getByRole('textbox', { name: 'Assignment' }).fill('Private planning check');
  await page.getByLabel('Course').fill('PRIV 101');
  await page.getByRole('button', { name: 'Add assignment and plan it' }).click();
  await page.locator('[data-ics-input]').setInputFiles(path.join(import.meta.dirname, '../fixtures/campus-week.ics'));
  await page.getByText('Study limits and data').click();
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export my data' }).click();
  const download = await downloadEvent;
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(chunk as Buffer);
  await page.locator('[data-import-input]').setInputFiles({ name: 'privacy-flow-backup.json', mimeType: 'application/json', buffer: Buffer.concat(chunks) });
  await expect(page.getByText('Backup imported. Review the rebuilt plan.')).toBeVisible();
  const beaconCalls = await page.evaluate(() => (window as Window & { __drcBeaconCalls?: string[] }).__drcBeaconCalls ?? []);
  expect(beaconCalls).toEqual([]);
  expect(observed.filter((entry) => entry.origin !== appOrigin)).toEqual([]);
  expect(observed.filter((entry) => !allowedPaths.has(entry.pathname))).toEqual([]);
  expect(observed.filter((entry) => /analytics|beacon|collect|telemetry/i.test(entry.pathname))).toEqual([]);
});

test('@claim:manual-estimate-trims changes an estimate only after an explicit trim', async ({ page }) => {
  await page.goto('/?demo=1');
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
  await page.goto('/?demo=1');
  await expect(page.locator('.task-item', { hasText: 'Check history essay citations' })).toContainText('rough estimate');
  await expect(page.getByText('Rough estimates are marked below for review.')).toBeVisible();
  await expect(page.getByText(/has a rough estimate/).first()).toBeVisible();
});

test('@claim:indexeddb-storage saves a real plan in its own IndexedDB database', async ({ page }) => {
  await page.goto('/planner');
  await page.getByRole('textbox', { name: 'Assignment' }).fill('IndexedDB practice');
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

test('@claim:billing-terms proves Sociobot checkout redirects to Dodo', async ({ page, request }) => {
  await page.goto('/terms');
  await expect(page.getByText('Checkout opens on Dodo through Sociobot.')).toBeVisible();
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Buy the one-time license' })).toHaveAttribute('href', checkoutUrl);
  const response = await request.get(checkoutUrl, { maxRedirects: 0 });
  expect(response.status()).toBeGreaterThanOrEqual(300);
  expect(response.status()).toBeLessThan(400);
  const location = response.headers().location;
  expect(location).toBeTruthy();
  expect(new URL(location!, checkoutUrl).hostname).toBe('checkout.dodopayments.com');
});

test('@claim:free-core allows four active assignments, releases completed assignments, and explains a fifth active assignment', async ({ page }) => {
  await page.goto('/planner');
  for (let index = 1; index <= 4; index += 1) {
    await page.getByRole('textbox', { name: 'Assignment' }).fill(`Assignment ${index}`);
    await page.getByLabel('Course').fill('STUDY 101');
    await page.getByLabel('Time estimate').selectOption('30');
    await page.getByRole('button', { name: 'Add assignment and plan it' }).click();
  }
  await expect(page.getByText('4 / 4 free assignments')).toBeVisible();
  await page.getByRole('textbox', { name: 'Assignment' }).fill('Assignment 5');
  await page.getByLabel('Course').fill('STUDY 101');
  await page.getByRole('button', { name: 'Add assignment and plan it' }).click();
  await expect(page.getByText('The free plan holds four active assignments. Finish one or buy the one-time license.')).toBeVisible();
  await expect(page.locator('.task-item')).toHaveCount(4);
  const doneButtons = page.getByRole('button', { name: /^Mark .* done$/ });
  while (await doneButtons.count()) {
    const before = await doneButtons.count();
    await doneButtons.first().click();
    await expect(doneButtons).toHaveCount(before - 1);
  }
  await expect(page.getByText('0 / 4 free assignments')).toBeVisible();
  await page.getByRole('textbox', { name: 'Assignment' }).fill('Assignment 5');
  await page.getByLabel('Course').fill('STUDY 101');
  await page.getByRole('button', { name: 'Add assignment and plan it' }).click();
  await expect(page.getByText('Assignment 5').first()).toBeVisible();
});

test('@claim:paid-checkout shows the exact price, plans five active assignments, and keeps paid receipt history', async ({ page, request }) => {
  await page.goto('/');
  await expect(page.getByText('$9 once', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Buy the one-time license' })).toHaveAttribute('href', checkoutUrl);
  const response = await request.get(checkoutUrl, { maxRedirects: 0 });
  expect(response.status(), 'checkout must redirect to Sociobot’s hosted checkout').toBeGreaterThanOrEqual(300);
  expect(response.status()).toBeLessThan(400);
  expect(response.headers().location, 'checkout must provide its hosted destination').toBeTruthy();
  await page.route('https://api.sociobot.in/**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ valid: true, reason: 'ok' }) }));
  await page.goto('/planner?license=test-license');
  await expect(page.getByText('Unlimited license active')).toBeVisible();
  for (let index = 1; index <= 5; index += 1) {
    await page.getByRole('textbox', { name: 'Assignment' }).fill(`Licensed assignment ${index}`);
    await page.getByLabel('Course').fill('PAID 101');
    await page.getByLabel('Time estimate').selectOption('30');
    await page.getByRole('button', { name: 'Add assignment and plan it' }).click();
  }
  await expect(page.locator('.task-item')).toHaveCount(5);
  await expect(page.locator('.plan-block')).toHaveCount(5);
  for (let index = 1; index <= 5; index += 1) {
    await expect(page.locator('.plan-block', { hasText: `Licensed assignment ${index}` })).toHaveCount(1);
  }
  await expect(page.getByText(/free plan holds four active assignments/i)).toHaveCount(0);
  await page.getByRole('button', { name: /^Mark .* missed$/ }).first().click();
  await page.getByRole('button', { name: /^Mark .* missed$/ }).first().click();
  await expect(page.getByRole('heading', { name: 'Past receipts' })).toBeVisible();
});

test('@claim:offline-reload reloads the demo without a network', async ({ page, context }) => {
  await page.goto('/?demo=1');
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
  await expect(page.getByRole('heading', { name: 'Reschedule your study plan' })).toBeVisible();
  await expect(page.getByText('Offline — your saved plan still works.')).toBeVisible();
});

test('rejected backups leave the running planner valid', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/planner');
  await page.getByText('Study limits and data').click();
  await page.locator('[data-import-input]').setInputFiles({ name: 'incomplete.json', mimeType: 'application/json', buffer: Buffer.from('{"tasks":[],"settings":{}}') });
  await expect(page.getByText('This backup could not be read. Your current plan was not changed. Choose a JSON export from this app.')).toBeVisible();
  await page.getByRole('textbox', { name: 'Assignment' }).fill('Still planning');
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

test('@claim:assignment-deletion deletes an assignment while preserving its existing receipt name', async ({ page }) => {
  await page.goto('/demo');
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Delete Draft biology lab discussion' }).click();
  await expect(page.getByRole('button', { name: 'Delete Draft biology lab discussion' })).toHaveCount(0);
  await expect(page.locator('.task-item', { hasText: 'Draft biology lab discussion' })).toHaveCount(0);
  await expect(page.getByText(/Missed:.*Draft biology lab discussion/)).toBeVisible();
});

test('a cached invalid license keeps its inactive notice after reload', async ({ page }) => {
  await page.route('https://api.sociobot.in/**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ valid: false, reason: 'invalid' }) }));
  await page.goto('/demo?license=invalid-license');
  await expect(page.getByText('This license is no longer active.')).toBeVisible();
  await page.reload();
  await expect(page.getByText('This license is no longer active.')).toBeVisible();
});

test('all supported routes have no Axe violations or console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  for (const route of ['/', '/demo', '/planner', '/privacy', '/terms', '/404.html']) {
    await page.goto(route);
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  }
  expect(errors).toEqual([]);
});

test('direct routes set their own title, description, canonical URL, focused heading, and route announcement', async ({ page }) => {
  const routes = [
    ['/planner', 'Planner — Deadline Reality Check', 'https://workload-reschedule-receipts.sociobot.in/planner'],
    ['/demo', 'Demo — Deadline Reality Check', 'https://workload-reschedule-receipts.sociobot.in/demo'],
    ['/?demo=1', 'Demo — Deadline Reality Check', 'https://workload-reschedule-receipts.sociobot.in/demo'],
    ['/privacy', 'Privacy — Deadline Reality Check', 'https://workload-reschedule-receipts.sociobot.in/privacy'],
    ['/terms', 'Terms — Deadline Reality Check', 'https://workload-reschedule-receipts.sociobot.in/terms'],
  ] as const;
  for (const [route, title, canonical] of routes) {
    await page.goto(route);
    await expect(page).toHaveTitle(title);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonical);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', title);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', canonical);
    await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute('content', title);
    await expect(page.locator('h1')).toHaveCount(1);
  }
  await page.getByLabel('Main navigation').getByRole('link', { name: 'Privacy' }).click();
  await expect(page.locator('h1')).toBeFocused();
  await expect(page.locator('#route-status')).toHaveText('Privacy for Deadline Reality Check');
  await page.goBack();
  await expect(page.locator('h1')).toBeFocused();
  await expect(page.locator('#route-status')).toHaveText('Terms for Deadline Reality Check');
  await page.goForward();
  await expect(page.locator('h1')).toBeFocused();
  await expect(page.locator('#route-status')).toHaveText('Privacy for Deadline Reality Check');
});

test('the first screen uses plain action, calendar, and pricing language', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('A missed block, revised plan, and deadlines at risk load next.')).toBeVisible();
  await expect(page.getByText('Plan up to four active assignments for free. Add unlimited active assignments for $9 once.')).toBeVisible();
  await expect(page.getByText('Import a calendar (.ics) file. Class, work, and appointments stay blocked.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Reschedule missed work in three steps' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Add each assignment' })).toBeVisible();
  await expect(page.getByText('See a new plan that fits your study hours and lists deadlines at risk.')).toBeVisible();
  await expect(page.getByText('Stored in this browser')).toBeVisible();
  await expect(page.getByText('Free and paid limits')).toBeVisible();
  await expect(page.getByText('risk receipt', { exact: false })).toHaveCount(0);
});

test('the first-screen sample action opens the isolated query demo with reset and a clean exit', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL(/\/?\?demo=1$/);
  await expect(page.getByLabel('Demo mode')).toContainText('Demo — sample data, nothing is saved');
  await expect(page.getByText('Draft biology lab discussion').first()).toBeVisible();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByText('Demo reset to its starting plan.')).toBeVisible();
  await page.getByRole('link', { name: 'Start for real' }).click();
  await expect(page).toHaveURL('/planner');
  await expect(page.getByText('No assignments yet')).toBeVisible();
  await expect(page.getByLabel('Demo mode')).toHaveCount(0);
});

test('dark routes keep footer text and links readable', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  for (const route of ['/', '/demo', '/planner', '/privacy', '/terms']) {
    await page.goto(route);
    await expect(page.locator('.site-footer')).toHaveCSS('background-color', 'rgb(5, 10, 8)');
    await expect(page.locator('.site-footer')).toHaveCSS('color', 'rgb(244, 240, 230)');
    await expect(page.locator('.site-footer a').first()).toHaveCSS('color', 'rgb(244, 240, 230)');
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
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
  await expect(page.getByRole('heading', { name: 'This page was not found' })).toBeVisible();
  const home = page.getByRole('link', { name: 'Return home' });
  const box = await home.boundingBox();
  expect(box?.height).toBeGreaterThanOrEqual(44);
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(17, 24, 21)');
});

test('the static 404 footer links are 44px touch targets in light and dark mode at 390px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const colorScheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme });
    await page.goto('/404.html');
    const footerLinks = page.locator('.site-footer a');
    expect(await footerLinks.count()).toBe(3);
    for (let index = 0; index < await footerLinks.count(); index += 1) {
      const box = await footerLinks.nth(index).boundingBox();
      expect(box, `${colorScheme} footer link ${index} should be visible`).not.toBeNull();
      expect(box!.width, `${colorScheme} footer link ${index} width`).toBeGreaterThanOrEqual(44);
      expect(box!.height, `${colorScheme} footer link ${index} height`).toBeGreaterThanOrEqual(44);
    }
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  }
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

test('legal links open real routes with route titles and page-naming headings', async ({ page }) => {
  for (const route of ['/', '/demo', '/planner']) {
    await page.goto(route);
    const footer = page.locator('.site-footer');
    await expect(footer.getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', '/privacy');
    await expect(footer.getByRole('link', { name: 'Terms' })).toHaveAttribute('href', '/terms');
  }
  await page.goto('/privacy');
  await expect(page).toHaveTitle('Privacy — Deadline Reality Check');
  await expect(page.getByRole('heading', { level: 1, name: 'Privacy for Deadline Reality Check' })).toBeVisible();
  await page.goto('/terms');
  await expect(page).toHaveTitle('Terms — Deadline Reality Check');
  await expect(page.getByRole('heading', { level: 1, name: 'Terms for Deadline Reality Check' })).toBeVisible();
});

test('390px routes avoid horizontal overflow and keep the demo controls usable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ['/', '/?demo=1', '/planner', '/privacy', '/terms', '/404.html']) {
    await page.goto(route);
    const dimensions = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
    expect(dimensions.content, `${route} must fit the mobile viewport`).toBeLessThanOrEqual(dimensions.viewport);
    if (route === '/') {
      const sampleAction = await page.getByRole('link', { name: 'Try it with sample data' }).boundingBox();
      expect(sampleAction).not.toBeNull();
      expect(sampleAction!.y + sampleAction!.height).toBeLessThanOrEqual(844);
    }
  }
  await page.goto('/?demo=1');
  const demoReceipt = await page.getByRole('heading', { name: 'What this miss changes' }).boundingBox();
  const demoForm = await page.getByRole('heading', { name: 'Add an assignment' }).boundingBox();
  expect(demoReceipt).not.toBeNull();
  expect(demoForm).not.toBeNull();
  expect(demoReceipt!.y).toBeLessThan(demoForm!.y);
  for (const control of [page.getByRole('button', { name: 'Reset demo' }), page.getByRole('link', { name: 'Start for real' })]) {
    const box = await control.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
  }
  await page.goto('/planner');
  const realForm = await page.getByRole('heading', { name: 'Add an assignment' }).boundingBox();
  const realPlan = await page.getByRole('heading', { name: 'Your next study blocks' }).boundingBox();
  expect(realForm).not.toBeNull();
  expect(realPlan).not.toBeNull();
  expect(realForm!.y).toBeLessThan(realPlan!.y);
});
