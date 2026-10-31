import { useState } from 'react';
import {
  additionCases,
  aluCases,
  calculateAddition,
  calculatePipelineStage,
  calculatePipelineTimeline,
  calculateShiftStages,
  getControlState,
  hazardData,
  pipeIns,
  signalA,
  signalB,
} from '../lib/simulators.js';

function FlowDiagram({ nodes, colors = ['var(--blue)', 'var(--teal)', 'var(--teal)'] }) {
  const centers = [91, 330, 569];
  const rectWidth = 174;
  return (
    <svg className="diagram-svg" viewBox="0 0 660 150" role="img" aria-label={nodes.join(' ไปยัง ')}>
      {nodes.flatMap((node, index) => {
        const center = centers[index];
        const arrowX = centers[index + 1] - rectWidth / 2;
        const lines = node.split(' · ');
        const elements = [
          <rect key={`${index}-rect`} x={center - rectWidth / 2} y="28" width={rectWidth} height="89" rx="12" fill="var(--surface)" stroke={colors[index]} strokeWidth={index === 1 ? 2.2 : 1.4} />,
          <text key={`${index}-text`} textAnchor="middle" x={center} y="66" fontSize="14" fontWeight="600" fill="var(--ink)">
            {lines.map((line, lineIndex) => <tspan key={lineIndex} x={center} dy={lineIndex ? 21 : 0}>{line}</tspan>)}
          </text>,
        ];
        if (index < 2) {
          elements.push(
            <path key={`${index}-line`} d={`M${center + rectWidth / 2 + 9} 73 H${arrowX - 17}`} stroke="var(--blue)" strokeWidth="2.3" />,
            <path key={`${index}-arrow`} d={`M${arrowX - 25} 67 L${arrowX - 16} 73 L${arrowX - 25} 79`} fill="none" stroke="var(--blue)" strokeWidth="2" />,
          );
        }
        return elements;
      })}
    </svg>
  );
}

function SimulatorTitle({ children, detail }) {
  return <div className="simulator-title"><b>{children}</b>{detail && <span>{detail}</span>}</div>;
}

export function SignedInterpretation() {
  const [signed, setSigned] = useState(true);
  const bits = '1011';
  const weights = signed ? [-8, 4, 2, 1] : [8, 4, 2, 1];
  const value = bits.split('').reduce((total, bit, index) => total + (bit === '1' ? weights[index] : 0), 0);
  return (
    <div className="simulator signed-interpretation" aria-label="Signed and unsigned interpretation of 1011">
      <div className="seg" role="group" aria-label="Interpretation">
        {['Signed', 'Unsigned'].map((label) => (
          <button key={label} type="button" className={signed === (label === 'Signed') ? 'selected' : ''} aria-pressed={signed === (label === 'Signed')} onClick={() => setSigned(label === 'Signed')}>{label}</button>
        ))}
      </div>
      <div className="signed-bits" aria-label={`Bit weights ${weights.join(', ')}`}>
        {bits.split('').map((bit, index) => <div className="signed-bit" key={index}><small>{weights[index]}</small><b>{bit}</b></div>)}
      </div>
      <div className="signed-result"><span>{signed ? 'Signed Two’s Complement' : 'Unsigned'}</span><strong>1011 = {value}</strong></div>
    </div>
  );
}

function Chip({ active = false, disabled = false, onClick, children }) {
  return <button type="button" className={`chip ${active ? 'active' : ''}`} disabled={disabled} onClick={onClick}>{children}</button>;
}

function DataTable({ head, rows, compact = false }) {
  return (
    <div className="table-scroll">
      <table className={`data-table ${compact ? 'compact' : ''}`}>
        <thead><tr>{head.map((item, index) => <th key={`${item}-${index}`}>{item}</th>)}</tr></thead>
        <tbody>{rows.map((row, rowIndex) => (
          <tr key={rowIndex}>{row.map((value, columnIndex) => (
            <td key={columnIndex}>{columnIndex === 0 ? <strong>{value}</strong> : value}</td>
          ))}</tr>
        ))}</tbody>
      </table>
    </div>
  );
}

export function AdditionExplorer({ referenceLayout = false }) {
  const [index, setIndex] = useState(5);
  const { row, a, b, sum, result, overflow, min, max } = calculateAddition(index);
  return (
    <div className={`simulator${referenceLayout ? ' addition-explorer' : ''}`}>
      <SimulatorTitle detail={referenceLayout ? undefined : 'Addition 4-bit'}>4-bit Addition Explorer</SimulatorTitle>
      <div className="step-buttons wrap">
        {additionCases.map((item, itemIndex) => (
          <Chip key={item[0]} active={index === itemIndex} onClick={() => setIndex(itemIndex)}>{item[0]}</Chip>
        ))}
      </div>
      <div className={referenceLayout ? 'addition-stage' : 'sim-stage'}>
        {referenceLayout
          ? <div className="addition-mode"><b>{row[1]} Addition</b><span>4-bit</span></div>
          : <div className="sim-hint"><b>Addition</b> 4-bit · {row[1]} · Range: {min} ถึง {max}</div>}
        <div className="operand-grid">
          <div><small>Operand 1</small><b>{row[2]}</b><span>= {a}</span></div>
          <div><small>Operand 2</small><b>{row[3]}</b><span>= {b}</span></div>
        </div>
        <div className="equation">{a} + {b} = {sum}</div>
        <div className="result-bar">
          <span><small>Result (4-bit)</small><strong>{result}</strong></span>
          <span><small>Overflow</small><strong className={overflow ? 'bad' : 'good'}>{overflow ? 'True' : 'False'}</strong></span>
        </div>
      </div>
      <p className="sim-explanation">{overflow
        ? `ผลจริง ${sum} เกินช่วง ${min} ถึง ${max} จึงเกิด Overflow แม้ฮาร์ดแวร์ยังได้ผล 4 บิต ${result}`
        : `ผลจริง ${sum} อยู่ในช่วงของ ${row[1]} จึงไม่มี Overflow`}</p>
    </div>
  );
}

export function AluExplorer({ referenceLayout = false }) {
  const operations = ['ADD', 'SUB', 'AND', 'OR', 'NOR', 'SLT'];
  const [index, setIndex] = useState(7);
  const [operation, setOperation] = useState('SLT');
  const row = referenceLayout ? aluCases.find((item) => item[3] === operation) : aluCases[index];
  const explanations = {
    ADD: 'Adder รับ A และ B ตามเดิม ไม่ต้องกลับบิต',
    SUB: 'ใช้ A + NOT(B) + 1 จึงเปิด Binv และ CarryIn',
    AND: 'Operation=00 เลือก AND จากวงจรย่อย',
    OR: 'Operation=01 เลือก OR จากวงจรย่อย',
    NOR: 'ใช้กฎ De Morgan: NOT(A OR B) = NOT(A) AND NOT(B)',
    SLT: 'ใช้การลบ A−B และส่ง Set ที่แก้ signed overflow แล้วไปยัง LESS ของบิตต่ำสุด',
  };
  return (
    <div className={`simulator${referenceLayout ? ' alu-explorer' : ''}`}>
      <SimulatorTitle detail={referenceLayout ? undefined : 'ตารางที่ 1'}>ALU Control Explorer</SimulatorTitle>
      <div className="step-buttons wrap">
        {referenceLayout
          ? operations.map((item) => <Chip key={item} active={operation === item} onClick={() => setOperation(item)}>{item}</Chip>)
          : aluCases.map((item, itemIndex) => <Chip key={item[0]} active={index === itemIndex} onClick={() => setIndex(itemIndex)}>{item[3]}</Chip>)}
      </div>
      <div className={referenceLayout ? 'alu-stage' : 'sim-stage'}>
        {!referenceLayout && <div className="mini-label">ALUOp {row[1]} · Funct {row[2]} · Goal {row[3]}</div>}
        <div className="signal-grid" role={referenceLayout ? 'group' : undefined} aria-label={referenceLayout ? `ALUOp ${row[1]}, Funct ${row[2]}, Operation ${row[7]}` : undefined}>
          {['Ainv', 'Binv', 'CarryIn', 'Operation'].map((field, fieldIndex) => (
            <div className={`signal-card ${row[fieldIndex + 4] === '1' ? 'on' : ''}${referenceLayout && field === 'Operation' ? ' operation-value' : ''}${referenceLayout && String(row[fieldIndex + 4]).toLowerCase() === 'x' ? ' dont-care' : ''}`} key={field}>
              <small>{field}</small><b>{row[fieldIndex + 4]}</b>
            </div>
          ))}
        </div>
      </div>
      <p className="sim-explanation">{explanations[row[3]]}</p>
      {referenceLayout && row.slice(4, 8).some((value) => String(value).toLowerCase() === 'x') && <p className="alu-dont-care">X = ไม่สนใจค่า</p>}
    </div>
  );
}

function ZonePanel({ fields, values, name, color }) {
  return (
    <div className={`zone zone-${color}`}>
      <div className="zone-title"><span className="dot" />{name}</div>
      {fields.map((field, index) => (
        <div className="zone-row" key={field}><code>{field}</code><b className={values[index] !== '0' ? 'on' : ''}>{values[index]}</b></div>
      ))}
    </div>
  );
}

export function StateExplorer({ referenceLayout = false }) {
  const [command, setCommand] = useState('beq');
  const [state, setState] = useState(2);
  const current = getControlState(command, state);
  const commands = [['j', 'j'], ['beq', 'beq'], ['rtype', 'R-type'], ['lw', 'lw'], ['sw', 'sw']];
  return (
    <div className={`simulator${referenceLayout ? ' state-explorer' : ''}`}>
      <SimulatorTitle detail="ตารางที่ 4">Multicycle Control Explorer</SimulatorTitle>
      <div className="step-buttons wrap">
        {commands.map(([id, label]) => <Chip key={id} active={command === id} onClick={() => {
          setCommand(id);
          if (id === 'j' && state === 2) setState(1);
        }}>{label}</Chip>)}
      </div>
      <div className="step-buttons">
        {[0, 1, 2].map((value) => (
          <Chip key={value} active={state === value} disabled={command === 'j' && value === 2} onClick={() => setState(value)}>State {value}</Chip>
        ))}
      </div>
      <div className="state-explorer-content">
      <div className="sim-stage">
        <div className="sim-hint">สิ่งที่ CPU ทำใน State นี้ · STATE {current.s} · {current.act}</div>
        {referenceLayout ? <div className="state-flow" role="img" aria-label={current.flow.join(' ไปยัง ')}>{current.flow.map((node, index) => <div key={index}><span>{node}</span>{index < current.flow.length - 1 && <i aria-hidden="true">↓</i>}</div>)}</div> : <FlowDiagram nodes={current.flow} />}
        <div className="mini-label">{current.why}</div>
      </div>
      <div className="zone-wrap">
        <ZonePanel fields={signalA} values={current.a} name="โซน A: เปิด/ปิด" color="a" />
        <ZonePanel fields={signalB} values={current.b} name="โซน B: เลือกเส้นทาง" color="b" />
      </div>
      </div>
      <p className="sim-explanation">ช่องที่ไม่ใช้งานใส่ 0 ตามคำสั่งโจทย์</p>
      <button type="button" className="primary-btn" onClick={() => setState(Number(current.b[7]))}>Next State = {current.b[7]}</button>
    </div>
  );
}

export function ShifterExplorer({ referenceLayout = false }) {
  const [data, setData] = useState(40);
  const [amount, setAmount] = useState(3);
  const stages = calculateShiftStages(data, amount);
  const result = <div className="result-bar"><span><small>Data in</small><strong>{data}</strong></span><span><small>Data out</small><strong className="good">{stages[4].after}</strong></span></div>;
  return (
    <div className={`simulator${referenceLayout ? ' shifter-explorer' : ''}`}>
      <SimulatorTitle detail="32-bit logical shift">Barrel Shifter Simulator</SimulatorTitle>
      <div className="control-row">
        <label>Data in</label>
        <div className="step-buttons wrap">
          {[40, 160, 1024, 65536].map((value) => (
            <Chip key={value} active={data === value} onClick={() => setData(value)}>{value}</Chip>
          ))}
        </div>
      </div>
      <div className="slider-row"><label htmlFor="shamt">Shift Amount</label><output>{amount} bits</output></div>
      <input id="shamt" type="range" min="0" max="31" value={amount} step="1" onChange={(event) => setAmount(Number(event.target.value))} />
      {referenceLayout && result}
      <div className="sim-stage">
        <div className="sim-hint">shamt (s4 ถึง s0) · {amount.toString(2).padStart(5, '0')}</div>
        <div className="signal-grid five">
          {[...stages].reverse().map((stage) => (
            <div className={`signal-card ${stage.on ? 'on teal' : ''}`} key={stage.name}>
              <small>{stage.name}</small><b>{stage.on ? '1' : '0'}</b><small>Shift {stage.weight}</small>
            </div>
          ))}
        </div>
      </div>
      <DataTable head={['ขั้น', 'การทำงาน', 'ผล']} rows={stages.map((stage) => [
        stage.name,
        stage.on ? <code>{`${stage.before} >> ${stage.weight}`}</code> : 'ผ่านค่าเดิม',
        <strong>{stage.after}</strong>,
      ])} />
      {!referenceLayout && result}
    </div>
  );
}

export function PipelineTimeline() {
  const [clock, setClock] = useState(4);
  const timeline = calculatePipelineTimeline(clock);
  return (
    <div className="simulator">
      <SimulatorTitle detail="No stalls">5-Stage Pipeline</SimulatorTitle>
      <div className="slider-row"><label htmlFor="pclock">Clock</label><output>{clock}</output></div>
      <input id="pclock" type="range" min="1" max="9" step="1" value={clock} onChange={(event) => setClock(Number(event.target.value))} />
      <div className="timeline">
        <div className="stage-head">Inst.</div>
        {['IF', 'ID', 'EX', 'MEM', 'WB'].map((stage) => <div className="stage-head" key={stage}>{stage}</div>)}
        {timeline.map((row, instruction) => (
          <FragmentRow key={instruction} instruction={instruction} row={row} />
        ))}
      </div>
      <div className="legend"><span><i />Instruction ที่กำลังทำงาน</span><span><i className="muted" />Stage อื่น</span></div>
      <div className="step-buttons">
        <Chip disabled={clock === 1} onClick={() => setClock(Math.max(1, clock - 1))}>ก่อนหน้า</Chip>
        <Chip disabled={clock === 9} onClick={() => setClock(Math.min(9, clock + 1))}>ถัดไป</Chip>
      </div>
    </div>
  );
}

function FragmentRow({ instruction, row }) {
  return (
    <>
      <div className="rowlabel">I{instruction + 1}</div>
      {row.map((active, stage) => <div className={`stage-slot ${active ? 'active' : ''}`} key={stage}>{active ? '●' : '·'}</div>)}
    </>
  );
}

export function HazardExplorer() {
  const [id, setId] = useState('load');
  const hazard = hazardData.find((item) => item.id === id);
  return (
    <div className="simulator">
      <SimulatorTitle detail="ข้อ 5.2–5.9">HAZARD EXPLORER</SimulatorTitle>
      <div className="step-buttons wrap">
        {hazardData.map((item) => (
          <Chip key={item.id} active={id === item.id} onClick={() => setId(item.id)}>{item.title.replace(' Hazard', '')}</Chip>
        ))}
      </div>
      <div className="sim-stage">
        <div className="sim-hint">{hazard.title} · {hazard.type}</div>
        <FlowDiagram nodes={hazard.flow} />
      </div>
      <p>{hazard.text}</p>
      <div className="learning-note"><strong>แนวทางแก้</strong><div>{hazard.sol}</div></div>
    </div>
  );
}

export function PipelineControlExplorer() {
  const [clock, setClock] = useState(4);
  const [focus, setFocus] = useState(0);
  const { index, stage, instruction, values } = calculatePipelineStage(clock, focus);
  const stageHelp = {
    ID: 'Main Control สร้าง EX, M และ WB Controls',
    EX: 'ใช้ EX Controls จาก ID/EX แล้วส่ง M และ WB ต่อ',
    MEM: 'ใช้ M Controls จาก EX/MEM แล้วส่ง WB ต่อ',
    WB: 'ใช้ WB Controls จาก MEM/WB',
    IF: 'Fetch Instruction ผ่าน IF/ID',
  };
  return (
    <div className="simulator">
      <SimulatorTitle detail={`Clock ${clock}`}>Pipeline Control Explorer</SimulatorTitle>
      <div className="sim-hint">Clock</div>
      <div className="step-buttons">
        <Chip disabled={clock === 1} onClick={() => setClock(Math.max(1, clock - 1))}>← ก่อนหน้า</Chip>
        <Chip onClick={() => { setClock(1); setFocus(0); }}>Reset</Chip>
        <Chip disabled={clock === 7} onClick={() => setClock(Math.min(7, clock + 1))}>ถัดไป →</Chip>
      </div>
      <div className="pipeline-live">
        {['IF', 'ID', 'EX', 'MEM', 'WB'].map((name, stageIndex) => {
          const rowIndex = clock - stageIndex - 1;
          const liveInstruction = rowIndex >= 0 && rowIndex < 3 ? pipeIns[rowIndex] : null;
          return (
            <div key={name}>
              <b>{name}</b>
              {liveInstruction
                ? <button type="button" className={`chip ${focus === rowIndex ? 'active' : ''}`} onClick={() => setFocus(rowIndex)}><strong>{liveInstruction.id}</strong><small>{liveInstruction.op}</small></button>
                : <span>ว่าง</span>}
            </div>
          );
        })}
      </div>
      <div className="step-buttons wrap">
        {pipeIns.map((item, itemIndex) => (
          <Chip key={item.id} active={focus === itemIndex} onClick={() => setFocus(itemIndex)}>{item.id}: {item.op}</Chip>
        ))}
      </div>
      <div className="sim-stage">
        <div className="sim-hint">{instruction.asm} · {stage || 'นอก Pipeline'}</div>
        {stage ? stageHelp[stage] : index < 0 ? 'ยังไม่เข้าสู่ Pipeline' : 'ทำงานเสร็จแล้ว'}
        {values.length > 0 && (
          <div className="signal-grid">
            {values.map((control) => {
              const [name, value] = control.split(' = ');
              return <div className="signal-card" key={name}><small>{name}</small><b>{value}</b></div>;
            })}
          </div>
        )}
      </div>
    </div>
  );
}
