import { test, expect } from '@playwright/test';

const routes = [
  '',
  ...Array.from({ length: 6 }, (_, index) => `study/${index + 1}/`),
  ...Array.from({ length: 6 }, (_, index) => `practice/${index + 1}/`),
  ...Array.from({ length: 6 }, (_, index) => `legacy/study/${index + 1}/`),
  'review/',
];

for (const route of routes) {
  test(`page ${route || 'library'} works on desktop and mobile`, async ({ page }) => {
    const pageErrors = [];
    const failedResponses = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    page.on('response', (response) => {
      if (response.status() >= 400) failedResponses.push(`${response.status()} ${response.url()}`);
    });

    await page.goto(route);
    await page.waitForFunction(() => document.documentElement.dataset.comarcHydrated === 'true');
    await expect(page.locator('#page .hero-title')).toBeVisible();
    await expect(page).toHaveTitle(/ComArc Exam Lab/);
    await expect.poll(() => page.locator('body').evaluate((body) => Number.parseFloat(getComputedStyle(body).fontSize))).toBe(17);

    const brokenImages = await page.locator('#page img').evaluateAll((images) =>
      images.filter((image) => !image.complete || image.naturalWidth === 0).map((image) => image.src));
    expect(brokenImages).toEqual([]);
    const tableIssues = await page.locator('#page table').evaluateAll((tables) => tables.flatMap((table, index) => {
      const wrapper = table.closest('.table-scroll');
      const cell = table.querySelector('th, td');
      const problems = [];
      if (!wrapper) problems.push(`table ${index + 1} has no scroll frame`);
      if (wrapper) {
        const wrapperStyle = getComputedStyle(wrapper);
        if (wrapperStyle.overflowX !== 'auto') problems.push(`table ${index + 1} has no independent horizontal scroll`);
        if (parseFloat(wrapperStyle.marginTop) < 20 || parseFloat(wrapperStyle.marginBottom) < 20) problems.push(`table ${index + 1} has no vertical breathing room`);
      }
      const minimumCellPadding = table.classList.contains('compact') ? 8 : 12;
      if (cell && parseFloat(getComputedStyle(cell).paddingTop) < minimumCellPadding) problems.push(`table ${index + 1} cells are compressed`);
      return problems;
    }));
    expect(tableIssues).toEqual([]);
    expect(pageErrors).toEqual([]);
    expect(failedResponses).toEqual([]);

    await page.setViewportSize({ width: 390, height: 844 });
    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }));
    expect(dimensions.content, 'page should not scroll horizontally on mobile').toBeLessThanOrEqual(dimensions.viewport);
    const mobileTableIssues = await page.locator('#page table').evaluateAll((tables) => tables.flatMap((table, index) => {
      const wrapper = table.closest('.table-scroll');
      const cell = table.querySelector('th, td');
      const problems = [];
      if (!wrapper) problems.push(`table ${index + 1} has no scroll frame`);
      if (wrapper) {
        const wrapperStyle = getComputedStyle(wrapper);
        if (wrapperStyle.overflowX !== 'auto') problems.push(`table ${index + 1} has no independent horizontal scroll`);
        if (parseFloat(wrapperStyle.marginTop) < 18 || parseFloat(wrapperStyle.marginBottom) < 20) problems.push(`table ${index + 1} has no vertical breathing room`);
      }
      const minimumCellPadding = table.classList.contains('compact') ? 8 : 12;
      if (cell && parseFloat(getComputedStyle(cell).paddingTop) < minimumCellPadding) problems.push(`table ${index + 1} cells are compressed`);
      return problems;
    }));
    expect(mobileTableIssues).toEqual([]);
    await expect(page.locator('#page .hero-title')).toBeVisible();
    await expect.poll(() => page.locator('body').evaluate((body) => Number.parseFloat(getComputedStyle(body).fontSize))).toBe(16);
    expect(pageErrors).toEqual([]);
  });
}
