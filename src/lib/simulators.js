import siteData from '../data/site-data.json';

export const { additionCases, aluCases, signalA, signalB, stateRows, hazardData, pipeIns } = siteData;

export function decodeBits(bits, signed) {
  const value = Number.parseInt(bits, 2);
  return signed && value >= 8 ? value - 16 : value;
}

export function calculateAddition(index) {
  const row = additionCases[index];
  const a = decodeBits(row[2], row[4]);
  const b = decodeBits(row[3], row[4]);
  const sum = a + b;
  const result = ((Number.parseInt(row[2], 2) + Number.parseInt(row[3], 2)) & 15)
    .toString(2)
    .padStart(4, '0');
  const overflow = row[4] ? sum > 7 || sum < -8 : sum > 15;
  return { row, a, b, sum, result, overflow, min: row[4] ? -8 : 0, max: row[4] ? 7 : 15 };
}

export function getControlState(command, state) {
  return stateRows.find((row) => row.s === state && (state === 0 || row.cmd === command));
}

export function calculateShiftStages(data, amount) {
  let current = data;
  return [1, 2, 4, 8, 16].map((weight, index) => {
    const on = Boolean(amount & weight);
    const before = current;
    current = on ? Math.floor(current / 2 ** weight) : current;
    return { name: `s${index}`, weight, on, before, after: current };
  });
}

export function calculatePipelineStage(clock, focus) {
  const index = clock - focus - 1;
  const stage = index >= 0 && index < 5 ? ['IF', 'ID', 'EX', 'MEM', 'WB'][index] : null;
  const instruction = pipeIns[focus];
  const values = stage === 'ID'
    ? [...instruction.ex, ...instruction.m, ...instruction.wb]
    : stage === 'EX'
      ? instruction.ex
      : stage === 'MEM'
        ? instruction.m
        : stage === 'WB'
          ? instruction.wb
          : [];
  return { index, stage, instruction, values };
}

export function calculatePipelineTimeline(clock) {
  return Array.from({ length: 5 }, (_, instruction) =>
    Array.from({ length: 5 }, (_, stage) => clock === instruction + stage + 1),
  );
}
