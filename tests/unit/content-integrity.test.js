import { createHash } from 'node:crypto';
import { readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const baseline = JSON.parse(readFileSync(new URL('../fixtures/current-site-baseline.json', import.meta.url), 'utf8'));
const reference = readFileSync(new URL('../fixtures/approved-shared-textbook.md', import.meta.url), 'utf8');
const chapterPath = (id, directory = 'content/chapters') => fileURLToPath(new URL(`../../src/${directory}/${String(id).padStart(2, '0')}.mdx`, import.meta.url));
const hash = (value) => createHash('sha256').update(value).digest('hex');
const normalized = (value) => value
  .replaceAll('&amp;', '&')
  .replaceAll('\\:', ':')
  .replaceAll('\\-', '-')
  .replaceAll('`', '')
  .trim();
const referenceChapter = (id) => reference.split(/(?=^# ข้อ \d+:)/m).find((part) => part.startsWith(`# ข้อ ${id}:`));
const chapterInfo = (mdx) => JSON.parse(mdx.match(/export const chapterInfo = (\{[\s\S]*?\n\});/)[1]);

describe('preserved lesson editions', () => {
  for (const chapter of baseline.chapters) {
    it(`keeps the previous chapter ${chapter.id} intact at its legacy route`, () => {
      const mdx = readFileSync(chapterPath(chapter.id, 'legacy/chapters'), 'utf8');
      const sectionIds = [...mdx.matchAll(/<section class="lesson-section" id="([^"]+)">/g)].map((match) => match[1]);
      expect(sectionIds).toEqual(chapter.sections.map((section) => section.id));

      const headings = [...mdx.matchAll(/<h2>(.*?)<\/h2>/g)].map((match) => match[1]);
      expect(headings).toEqual(chapter.sections.map((section) => section.title));

      const svgMarkup = [...mdx.matchAll(/<svg\b[\s\S]*?<\/svg>/g)].map((match) => match[0]);
      expect(svgMarkup.map(hash)).toEqual(chapter.static_svg_sha256);
    });
  }

  for (let id = 1; id <= 6; id += 1) {
    it(`keeps approved source headings and SVG artwork for chapter ${id}`, () => {
      const mdx = readFileSync(chapterPath(id), 'utf8');
      const source = referenceChapter(id);
      const sourceHeadings = [...source.matchAll(/^## (.*)$/gm)].map((match) => normalized(match[1])).filter((heading) => heading !== 'bits');
      const mdxInfo = chapterInfo(mdx);
      expect(normalized(mdxInfo.title)).toBe(normalized(source.match(/^# (.*)$/m)[1]));
      expect(mdxInfo.sections.map((section) => normalized(section.title))).toEqual(sourceHeadings);

      const sourceSvgs = [...source.matchAll(/```svg\s*\n([\s\S]*?)\n```/g)].map((match) => match[1].trim());
      const mdxSvgs = [...mdx.matchAll(/<SvgBlock source={("(?:[^"\\]|\\.)*")}\s*\/>/g)].map((match) => JSON.parse(match[1]));
      expect(mdxSvgs.map(hash)).toEqual(sourceSvgs.map(hash));
    });
  }

  it('wires the three source figures to their original image names', () => {
    const expected = [
      ['03', 'q3_datapath.png'],
      ['04', 'fe2019b_q4_srl_wired.png'],
      ['06', 'fe2019b_q6_figure5.png'],
    ];
    for (const [chapter, name] of expected) {
      const mdx = readFileSync(chapterPath(Number(chapter)), 'utf8');
      expect(mdx).toContain(`/images/${name}`);
      expect(mdx).toContain('SourceFigure client:load');
      expect(statSync(fileURLToPath(new URL(`../../public/images/${name}`, import.meta.url))).size).toBeGreaterThan(1_000);
    }
  });

  it('keeps the reference interactive controls in the React islands', () => {
    const islands = readFileSync(fileURLToPath(new URL('../../src/components/SimulatorIslands.jsx', import.meta.url)), 'utf8');
    for (const label of [
      'Signed', 'Unsigned', '4-bit Addition Explorer', 'Addition 4-bit', 'Operand 1', 'Operand 2', 'Result (4-bit)',
      'ALU Control Explorer', 'Multicycle Control Explorer', 'ตารางที่ 4', 'สิ่งที่ CPU ทำใน State นี้',
      'โซน A: เปิด/ปิด', 'โซน B: เลือกเส้นทาง', 'Barrel Shifter Simulator', 'Shift Amount', 'Data out',
      '5-Stage Pipeline', 'Pipeline Control Explorer',
    ]) expect(islands).toContain(label);
  });
});
