import { useState } from 'react';

const formats = [
  {
    id: 'R',
    label: 'R-type',
    example: 'add $t0, $t1, $t2',
    description: 'rs และ rt เป็น Register ต้นทาง, rd เป็นปลายทาง, shamt ใช้ระบุจำนวนบิตที่เลื่อน และ funct ระบุ Operation ของ R-type',
    fields: [
      { name: 'op', range: '31:26', width: 6, value: '000000', tone: 'control' },
      { name: 'rs', range: '25:21', width: 5, value: '01001', tone: 'register' },
      { name: 'rt', range: '20:16', width: 5, value: '01010', tone: 'register' },
      { name: 'rd', range: '15:11', width: 5, value: '01000', tone: 'register' },
      { name: 'shamt', range: '10:6', width: 5, value: '00000', tone: 'value' },
      { name: 'funct', range: '5:0', width: 6, value: '100000', tone: 'control' },
    ],
  },
  {
    id: 'I',
    label: 'I-type',
    example: 'lw $t0, 12($s1)',
    description: 'rs คือ Base Register, rt คือ Register ปลายทางของ lw และ Immediate 16-bit คือ Offset ที่ต้อง Sign-extend ก่อนบวก',
    fields: [
      { name: 'op', range: '31:26', width: 6, value: '100011', tone: 'control' },
      { name: 'rs', range: '25:21', width: 5, value: '10001', tone: 'register' },
      { name: 'rt', range: '20:16', width: 5, value: '01000', tone: 'register' },
      { name: 'immediate', range: '15:0', width: 16, value: '0000000000001100', tone: 'value' },
    ],
  },
  {
    id: 'J',
    label: 'J-type',
    example: 'j Target',
    description: 'Target มี 26-bit; CPU ต่อ (PC+4)[31:28] ไว้ด้านหน้าและเติม 00 ด้านท้าย เพื่อสร้าง Jump Address 32-bit',
    fields: [
      { name: 'op', range: '31:26', width: 6, value: '000010', tone: 'control' },
      { name: 'target', range: '25:0', width: 26, value: 'Target address index', tone: 'value' },
    ],
  },
];

export default function InstructionFormatExplorer() {
  const [formatId, setFormatId] = useState('I');
  const format = formats.find((item) => item.id === formatId);

  return (
    <div className="simulator instruction-format-explorer">
      <div className="simulator-title">
        <b>Instruction Format Explorer</b>
        <span>MIPS · 32-bit</span>
      </div>
      <div className="step-buttons wrap" role="group" aria-label="เลือกรูปแบบ MIPS Instruction">
        {formats.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`chip${formatId === item.id ? ' active' : ''}`}
            aria-pressed={formatId === item.id}
            onClick={() => setFormatId(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="instruction-example">
        <span>ตัวอย่าง</span>
        <code>{format.example}</code>
      </div>
      <div
        className="instruction-fields"
        style={{ gridTemplateColumns: format.fields.map((field) => `${field.width}fr`).join(' ') }}
        role="group"
        aria-label={`${format.label} fields`}
      >
        {format.fields.map((field) => (
          <div className={`instruction-field field-${field.tone}`} key={field.name}>
            <small>[{field.range}] · {field.width}b</small>
            <b>{field.name}</b>
            <code>{field.value}</code>
          </div>
        ))}
      </div>
      <p className="sim-explanation">{format.description}</p>
    </div>
  );
}
