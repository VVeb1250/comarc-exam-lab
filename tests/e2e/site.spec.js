import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';

const baseline = JSON.parse(readFileSync(new URL('../fixtures/current-site-baseline.json', import.meta.url), 'utf8'));
const siteData = JSON.parse(readFileSync(new URL('../../src/data/site-data.json', import.meta.url), 'utf8'));
const digest = (text) => createHash('sha256').update(text.replace(/\s+/g, ' ').trim()).digest('hex');

async function open(page, route) {
  await page.goto(route);
  await page.waitForFunction(() => document.documentElement.dataset.comarcHydrated === 'true');
}

for (const chapter of baseline.chapters) {
  test(`chapter ${chapter.id} keeps its original lesson copy`, async ({ page }) => {
    await open(page, `legacy/study/${chapter.id}/`);
    await expect(page.locator('#page .hero-title')).toHaveText(chapter.title);
    await expect(page.locator('#page .lesson-section')).toHaveCount(chapter.sections.length);
    await expect(page.locator('#page .lesson-section h2')).toHaveText(chapter.sections.map((section) => section.title));
    await expect(page.locator('#page svg.diagram-svg')).toHaveCount(chapter.svg_sha256.length);
    await expect(page.locator('#sidebar .brand')).toHaveAttribute('href', '/comarc-exam-lab/study/1/');
    await expect(page.locator('#page .chapter-toolbar .btn-subtle')).toHaveAttribute('href', `/comarc-exam-lab/practice/${chapter.id}/`);
    const text = await page.locator('#page').innerText();
    expect(digest(text)).toBe(chapter.text_sha256);
  });
}

test('all six approved study chapters render their headings and source figures', async ({ page }) => {
  for (const chapter of siteData.chapters) {
    await open(page, `study/${chapter.id}/`);
    await expect(page.locator('#page .hero-title')).toHaveText(chapter.title);
    await expect(page.locator('#page .lesson-section')).not.toHaveCount(0);
  }
  for (const [chapter, imageAlt, imageName] of [
    [2, 'รูปที่ 1: ALU Internal Structure จากข้อสอบ B', 'fe2019b_q2_alu.png'],
    [3, 'รูปที่ 2 Multicycle Machine', 'q3_datapath.png'],
    [4, 'เฉลยข้อ 4 SRL Datapath พร้อมสายสี', 'fe2019b_q4_srl_wired.png'],
    [6, 'Pipeline Machine จากรูปที่ 5 ของข้อสอบ', 'fe2019b_q6_figure5.png'],
  ]) {
    await open(page, `study/${chapter}/`);
    const figure = page.locator('.source-figure').filter({ has: page.locator(`img[alt="${imageAlt}"]`) });
    await expect(figure).toHaveCount(1);
    await expect(figure).toHaveClass(/loaded/);
    const image = figure.locator('img');
    await expect(image).toHaveAttribute('src', new RegExp(`/comarc-exam-lab/images/${imageName}$`));
    await expect.poll(() => image.evaluate((element) => element.complete && element.naturalWidth > 0)).toBe(true);
  }
  await open(page, 'study/2/');
  await page.getByRole('button', { name: 'ขยายภาพ รูปที่ 1: ALU Internal Structure จากข้อสอบ B' }).click();
  await expect(page.getByRole('dialog', { name: 'ขยายภาพ' })).toBeVisible();
  await expect(page.locator('#figure-modal img')).toHaveAttribute('src', /fe2019b_q2_alu\.png$/);
  await page.getByRole('button', { name: 'ปิดภาพ' }).click();
  await expect(page.getByRole('dialog', { name: 'ขยายภาพ' })).toHaveCount(0);
});

test('lesson illustrations keep the reference layouts across all six chapters', async ({ page }) => {
  await open(page, 'study/1/');
  const overflow = page.locator('#ch1-section-3 .overflow-patterns');
  await expect(overflow.locator('.overflow-pattern-grid > div')).toHaveCount(3);
  await expect(overflow).toHaveCSS('border-top-width', '1px');
  await expect(overflow.locator('> p')).toContainText('Signed ต้องพิจารณาเครื่องหมาย');
  await expect(page.locator('#ch1-section-4 .addition-explorer .sim-stage')).toHaveCount(0);
  await expect(page.locator('#ch1-section-4 .addition-explorer .result-bar')).toHaveCSS('border-top-width', '1px');

  await open(page, 'study/2/');
  await expect(page.locator('#ch2-section-2 .alu-subtraction-example .alu-example-result strong')).toHaveCount(2);
  await expect(page.locator('#ch2-section-3 h2')).toHaveText('2.3 แล้ว NOR และ SLT ทำอย่างไร?');
  await expect(page.locator('#ch2-section-4 .alu-explorer .step-buttons button')).toHaveText(['ADD', 'SUB', 'AND', 'OR', 'NOR', 'SLT']);
  await expect(page.locator('#ch2-section-4 .alu-explorer .sim-stage')).toHaveCount(0);

  await open(page, 'study/3/');
  await expect(page.locator('.multicycle-state-flow .multicycle-state-step')).toHaveCount(3);
  await expect(page.locator('.multicycle-state-flow .address-step')).toHaveCSS('border-top-width', '1px');
  const zones = page.locator('#ch3-section-3 .control-zone-wrap .zone');
  await expect(zones).toHaveCount(2);
  await expect(zones.first()).toHaveCSS('border-top-width', '1px');
  await expect(zones.first().locator('.zone-title svg')).toHaveCSS('width', '18px');
  await expect(zones.first().locator('.zone-signal code').first()).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(zones.first().locator('.zone-description')).toHaveCSS('border-bottom-width', '1px');

  await open(page, 'study/4/');
  await expect(page.locator('#page .source-figure.loaded')).toHaveCount(1);
  await expect(page.locator('#ch4-section-3 .simulator')).toHaveCount(1);

  await open(page, 'study/5/');
  await expect(page.locator('.ready-comparison-grid > div')).toHaveCount(2);
  await expect(page.locator('.ready-comparison-grid > div hr')).toHaveCount(2);

  await open(page, 'study/6/');
  const flow = page.locator('#ch6-section-3 .control-pipeline-flow');
  const signalsTable = page.locator('#ch6-section-3 .table-scroll');
  await expect(signalsTable).toHaveCSS('border-top-width', '0px');
  await expect(signalsTable.locator('th').first()).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(flow.locator('.control-register')).toHaveCount(3);
  await expect(flow.locator('.control-use')).toHaveCount(3);
  await expect(flow.locator('.control-register-bits').nth(0).locator('span')).toHaveCount(3);
  await expect(flow.locator('.control-register-bits').nth(1).locator('span')).toHaveCount(2);
  await expect(flow.locator('.control-register-bits').nth(2).locator('span')).toHaveCount(1);
  const registerColors = await flow.locator('.control-register').evaluateAll((registers) => registers.map((register) => [...new Set([...register.querySelectorAll('.control-register-bits span')].map((chip) => getComputedStyle(chip).backgroundColor))]));
  expect(registerColors.map((colors) => colors.length)).toEqual([1, 1, 1]);
  expect(new Set(registerColors.map((colors) => colors[0])).size).toBe(3);
  const useColors = await flow.locator('.control-use').evaluateAll((stages) => stages.map((stage) => getComputedStyle(stage).backgroundColor));
  expect(useColors).toEqual(registerColors.map((colors) => colors[0]));
});

test('multicycle controls and lesson tables have breathing room on desktop and mobile', async ({ page }) => {
  await open(page, 'study/3/');
  const zones = page.locator('#ch3-section-3 .control-zone-wrap');
  await expect(zones.locator('.zone-a .zone-signal')).toHaveCount(6);
  await expect(zones.locator('.zone-b .zone-signal')).toHaveCount(8);
  const zoneSpacing = await zones.locator('.zone-signal-list').first().evaluate((element) => getComputedStyle(element).gap);
  expect(zoneSpacing).toBe('3px');

  const table = page.locator('.table-scroll').first();
  const desktopSpacing = await table.evaluate((element) => {
    const style = getComputedStyle(element);
    const cell = getComputedStyle(element.querySelector('td'));
    return { top: parseFloat(style.marginTop), bottom: parseFloat(style.marginBottom), cell: parseFloat(cell.paddingTop) };
  });
  expect(desktopSpacing).toEqual({ top: 24, bottom: 30, cell: 14 });

  await page.setViewportSize({ width: 390, height: 844 });
  const mobileZoneGap = await zones.locator('.zone-signal-list').first().evaluate((element) => getComputedStyle(element).gap);
  expect(mobileZoneGap).toBe('3px');
  const mobileSpacing = await table.evaluate((element) => {
    const style = getComputedStyle(element);
    const cell = getComputedStyle(element.querySelector('td'));
    return { top: parseFloat(style.marginTop), bottom: parseFloat(style.marginBottom), cell: parseFloat(cell.paddingTop) };
  });
  expect(mobileSpacing).toEqual({ top: 20, bottom: 26, cell: 12 });
  const widths = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, page: document.documentElement.scrollWidth }));
  expect(widths.page).toBeLessThanOrEqual(widths.viewport);
});

for (const chapter of siteData.chapters) {
  test(`practice chapter ${chapter.id} evaluates its original questions`, async ({ page }) => {
    await open(page, `practice/${chapter.id}/`);
    const questions = siteData.quizzes[String(chapter.id)];
    await expect(page.locator('.quiz-card')).toHaveCount(questions.length);
    for (const [index, question] of questions.entries()) {
      await page.locator('.quiz-card').nth(index).getByRole('button').nth(question.correct).click();
      await expect(page.locator('.quiz-card').nth(index).locator('.quiz-feedback')).toContainText('✓ ถูกต้อง');
    }
  });
}

test('reader controls and surrounding UI retain their labels', async ({ page }) => {
  await open(page, 'study/1/');
  await expect(page.locator('.brand')).toHaveAttribute('aria-label', 'ComArc Exam Lab home');
  await expect(page.locator('.top-path')).toHaveText('EXAM LAB');
  await expect(page.locator('#header-label')).toHaveText(siteData.chapters[0].title);
  await expect(page.locator('#font-less')).toHaveAttribute('aria-label', 'ลดขนาดตัวอักษร');
  await expect(page.locator('#font-more')).toHaveAttribute('aria-label', 'เพิ่มขนาดตัวอักษร');
  await expect(page.locator('#theme-toggle')).toHaveAttribute('aria-label', 'เปลี่ยนธีม');
  await expect(page.locator('.sidebar-bottom p')).toHaveText('อ่านให้เข้าใจ ทดลอง แล้วค่อยฝึกทำ');
  await expect(page.locator('.rail-tip p')).toHaveText('เน้นเข้าใจ Data Flow ก่อนจำ Control Signals');
  await expect(page.locator('.site-footer')).toContainText('Study edition · FE2019b');
});

test('adder, ALU, multicycle control, shifter, hazards, and pipeline controls respond', async ({ page }) => {
  await open(page, 'study/1/');
  await expect(page.getByRole('button', { name: 'Signed', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.signed-result strong')).toHaveText('1011 = -5');
  await page.getByRole('button', { name: 'Unsigned', exact: true }).click();
  await expect(page.locator('.signed-result strong')).toHaveText('1011 = 11');
  await page.getByRole('button', { name: 'Signed', exact: true }).click();
  const adder = page.locator('.simulator').nth(1);
  await expect(adder.getByRole('button', { name: '1.6', exact: true })).toHaveClass(/active/);
  await expect(adder.locator('.result-bar strong').first()).toHaveText('0100');
  for (const row of siteData.additionCases) {
    await adder.getByRole('button', { name: row[0], exact: true }).click();
    const rawSum = (Number.parseInt(row[2], 2) + Number.parseInt(row[3], 2)) & 15;
    const expectedBits = rawSum.toString(2).padStart(4, '0');
    const signedA = Number.parseInt(row[2], 2) - (row[4] && row[2][0] === '1' ? 16 : 0);
    const signedB = Number.parseInt(row[3], 2) - (row[4] && row[3][0] === '1' ? 16 : 0);
    const total = signedA + signedB;
    const overflow = row[4] ? total < -8 || total > 7 : total > 15;
    await expect(adder.locator('.result-bar strong').first()).toHaveText(expectedBits);
    await expect(adder.locator('.result-bar strong').last()).toHaveText(overflow ? 'True' : 'False');
  }

  await open(page, 'study/2/');
  const alu = page.locator('.simulator').first();
  await expect(alu.getByRole('button', { name: 'SLT', exact: true })).toHaveClass(/active/);
  for (const operation of ['ADD', 'SUB', 'AND', 'OR', 'NOR', 'SLT']) {
    const row = siteData.aluCases.find((item) => item[3] === operation);
    await alu.getByRole('button', { name: operation, exact: true }).click();
    await expect(alu.getByRole('button', { name: operation, exact: true })).toHaveClass(/active/);
    await expect(alu.locator('.signal-card').nth(0).locator('b')).toHaveText(row[4]);
    await expect(alu.locator('.signal-card').nth(1).locator('b')).toHaveText(row[5]);
    await expect(alu.locator('.signal-card').nth(2).locator('b')).toHaveText(row[6]);
    await expect(alu.locator('.signal-card').nth(3).locator('b')).toHaveText(row[7]);
  }

  await open(page, 'study/3/');
  const multicycle = page.locator('.simulator').first();
  await expect(multicycle.getByRole('button', { name: 'beq', exact: true })).toHaveClass(/active/);
  await expect(multicycle.getByRole('button', { name: 'State 2', exact: true })).toHaveClass(/active/);
  await expect(multicycle.locator('.zone-a .zone-row').filter({ hasText: 'PCWriteCond' }).locator('b')).toHaveText('1');
  const commands = ['j', 'beq', 'R-type', 'lw', 'sw'];
  for (const [index, command] of commands.entries()) {
    await multicycle.locator('.step-buttons').first().locator('button').nth(index).click();
    await multicycle.locator('.step-buttons').nth(1).getByRole('button', { name: 'State 0', exact: true }).click();
    await expect(multicycle.locator('.sim-hint')).toContainText('STATE 0');
    await multicycle.locator('.step-buttons').nth(1).getByRole('button', { name: 'State 1', exact: true }).click();
    await expect(multicycle.locator('.sim-hint')).toContainText('STATE 1');
    if (command !== 'j') {
      await multicycle.locator('.step-buttons').nth(1).getByRole('button', { name: 'State 2', exact: true }).click();
      await expect(multicycle.locator('.sim-hint')).toContainText('STATE 2');
    }
  }

  await open(page, 'study/4/');
  const shifter = page.locator('.simulator').first();
  await expect(shifter.locator('.result-bar strong.good')).toHaveText('5');
  const shamt = page.locator('#shamt');
  await shamt.focus();
  for (let step = 0; step < 10; step += 1) await shamt.press('ArrowRight');
  await expect(page.locator('.sim-hint')).toContainText('01101');
  await expect(page.locator('.result-bar strong.good')).toHaveText('0');

  await open(page, 'study/5/');
  await expect(page.locator('#pclock').locator('..').locator('output')).toHaveText('4');
  await page.locator('.simulator').nth(1).getByRole('button', { name: 'Control' }).click();
  await expect(page.locator('.simulator').nth(1).locator('.sim-hint')).toContainText('Control Hazard');
  await page.locator('#pclock').focus();
  await page.locator('#pclock').press('ArrowRight');
  await expect(page.locator('.simulator').first().locator('.slider-row output')).toHaveText('5');

  await open(page, 'study/6/');
  await expect(page.locator('.simulator .simulator-title').first()).toContainText('Clock 4');
  await page.getByRole('button', { name: 'ถัดไป →' }).click();
  await expect(page.locator('.simulator .simulator-title')).toContainText('Clock 5');
  await expect(page.locator('.sim-hint').last()).toContainText('WB');
});

test('practice answers persist, progress updates, theme changes, and diagrams zoom', async ({ page }) => {
  await open(page, 'practice/1/');
  await expect(page.locator('.quiz-card')).toHaveCount(2);
  await page.getByRole('button', { name: /1011, True/ }).click();
  await expect(page.locator('.quiz-feedback').first()).toContainText('✓ ถูกต้อง');
  await page.reload();
  await page.waitForFunction(() => document.documentElement.dataset.comarcHydrated === 'true');
  await expect(page.locator('.quiz-feedback').first()).toBeVisible();

  await open(page, 'legacy/study/1/');
  await page.getByRole('button', { name: '○ ทำเครื่องหมายว่าเรียนแล้ว' }).click();
  await expect(page.locator('#completed-short')).toHaveText('1/6');
  await page.getByRole('button', { name: 'เปลี่ยนธีม' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('#theme-text')).toHaveText('Dark');
  await expect.poll(() => page.locator('html').evaluate((element) => getComputedStyle(element).getPropertyValue('--bg').trim())).toBe('#000');
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#000');
  await page.getByRole('button', { name: 'เพิ่มขนาดตัวอักษร' }).click();
  await expect.poll(() => page.locator('html').evaluate((element) => getComputedStyle(element).getPropertyValue('--font-scale').trim())).toBe('1.05');

  await open(page, 'study/3/');
  await page.getByRole('button', { name: /ขยายภาพ/ }).first().click();
  await expect(page.getByRole('dialog', { name: 'ขยายภาพ' })).toBeVisible();
  await page.getByRole('button', { name: 'ปิดภาพ' }).click();
  await expect(page.getByRole('dialog', { name: 'ขยายภาพ' })).toHaveCount(0);

  await open(page, 'review/');
  await expect(page.locator('.review-stats')).toContainText('1 / 6');
});

test('mobile chapter drawer opens and closes without changing lesson content', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, 'study/1/');
  await page.getByRole('button', { name: 'เปิดสารบัญ' }).click();
  await expect(page.locator('#sidebar')).toHaveClass(/open/);
  await expect(page.locator('#overlay')).toBeVisible();
  await page.locator('#overlay').click({ position: { x: 320, y: 100 } });
  await expect(page.locator('#sidebar')).not.toHaveClass(/open/);
  await expect(page.locator('#page .hero-title')).toHaveText(siteData.chapters[0].title);
});
