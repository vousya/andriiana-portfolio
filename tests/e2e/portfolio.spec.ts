import { test, expect } from '@playwright/test';

// End-to-end checks run against the actual built Docker image (Nginx),
// so they validate the production artifact, not the dev server.

test('homepage loads with the correct title', async ({ page }) => {
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(/Андріяна/);
});

test('navigation brand and links are present', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('banner')).toBeVisible();
  for (const label of ['Про мене', 'Досвід', 'Проєкти', 'Контакти']) {
    await expect(page.getByRole('link', { name: label })).toBeVisible();
  }
});

test('projects section renders', async ({ page }) => {
  await page.goto('/');
  const projects = page.locator('#projects');
  await expect(projects).toBeAttached();
  await expect(
    projects.getByRole('heading', { name: 'ПРОЄКТИ' })
  ).toBeVisible();
});

test('hero portrait image loads successfully', async ({ page }) => {
  await page.goto('/');
  const img = page.locator('img').first();
  await expect(img).toBeVisible();
  // naturalWidth > 0 confirms the asset actually decoded (not a broken link).
  const decoded = await img.evaluate(
    (el) => (el as HTMLImageElement).naturalWidth > 0
  );
  expect(decoded).toBe(true);
});

test('no critical console errors on load', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  await page.goto('/', { waitUntil: 'networkidle' });
  expect(errors).toEqual([]);
});

test('health endpoint responds for probes', async ({ request }) => {
  const res = await request.get('/healthz');
  expect(res.status()).toBe(200);
  expect((await res.text()).trim()).toBe('ok');
});

test('security headers are present', async ({ request }) => {
  const res = await request.get('/');
  const headers = res.headers();
  expect(headers['x-content-type-options']).toBe('nosniff');
  expect(headers['x-frame-options']).toBe('DENY');
  expect(headers['content-security-policy']).toContain("default-src 'self'");
});
