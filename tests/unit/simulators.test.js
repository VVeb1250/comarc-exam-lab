import { describe, expect, it } from 'vitest';
import siteData from '../../src/data/site-data.json';
import {
  calculateAddition,
  calculatePipelineStage,
  calculatePipelineTimeline,
  calculateShiftStages,
  getControlState,
} from '../../src/lib/simulators.js';

describe('ComArc simulator calculations', () => {
  it('keeps all eight signed and unsigned adder cases', () => {
    const cases = siteData.additionCases.map((_, index) => calculateAddition(index));
    expect(cases.map((item) => item.overflow)).toEqual([false, false, true, false, false, true, false, false]);
    expect(cases[2]).toMatchObject({ a: 5, b: 6, sum: 11, result: '1011', overflow: true });
  });

  it('selects the correct two-zone control signals for beq state 2', () => {
    const row = getControlState('beq', 2);
    expect(row.a).toEqual(['0', '1', '0', '0', '0', '0']);
    expect(row.b).toEqual(['01', '0', '0', '0', '01', '1', '00', '0']);
  });

  it('applies barrel shifter stages for 3-bit and 13-bit shifts', () => {
    expect(calculateShiftStages(40, 3).at(-1).after).toBe(5);
    const stages = calculateShiftStages(40, 13);
    expect(stages.filter((stage) => stage.on).map((stage) => stage.name)).toEqual(['s0', 's2', 's3']);
    expect(stages.at(-1).after).toBe(0);
  });

  it('tracks pipeline controls with each instruction and timeline clock', () => {
    expect(calculatePipelineStage(4, 0)).toMatchObject({ stage: 'MEM', instruction: { op: 'lw' }, values: ['MemRead = 1', 'MemWrite = 0'] });
    expect(calculatePipelineStage(4, 1)).toMatchObject({ stage: 'EX', instruction: { op: 'add' }, values: ['ALUSrc = 0', 'ALUOp = 10'] });
    expect(calculatePipelineTimeline(4)[0]).toEqual([false, false, false, true, false]);
  });

  it('contains two practice questions in each chapter', () => {
    expect(siteData.aluCases).toHaveLength(8);
    expect(siteData.stateRows).toHaveLength(10);
    expect(Object.values(siteData.quizzes).flat()).toHaveLength(12);
    for (const questions of Object.values(siteData.quizzes)) expect(questions).toHaveLength(2);
    expect(siteData.stateRows.find((row) => row.cmd === 'sw' && row.s === 2).a[2]).toBe('1');
    expect(siteData.stateRows.find((row) => row.cmd === 'lw' && row.s === 2).b[1]).toBe('1');
  });
});
