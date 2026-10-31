# Computer Architecture: Visual Textbook ฉบับสมบูรณ์

ข้อสอบ FE2019b · ข้อ 1–6 · พื้นฐาน → กลไก → ตัวอย่าง → เฉลย

บทเรียนนี้เรียงตามข้อสอบจริง แต่เพิ่มภาพประกอบและ UI ในจุดที่ต้องมองเห็นการทำงานของฮาร์ดแวร์ โดยยังคงเหตุผลและรายละเอียดของแต่ละข้อไว้ ไม่ลดเป็น Cheat Sheet

แผนการเรียนทั้ง 6 ข้อ

# ข้อ 1: Binary Arithmetic &amp; Overflow

10 คะแนน · ข้อ 1.1–1.8

## 1.1 ทำไม 4-bit ถึงเก็บจำนวนลบได้?

โจทย์กำหนดระบบ 4-bit หมายความว่าเรามีพื้นที่เก็บตัวเลขเพียง 4 บิต เช่น `0110` หรือ `1111`

ถ้าเป็น **Unsigned** ทุกบิตมีน้ำหนักเป็นบวก แต่ถ้าเป็น **Signed Two's Complement** บิตซ้ายสุดมีน้ำหนักเป็นลบ

**ตัวอย่าง `1011`**

- Signed
- Unsigned
現在の選択内容は利用できません。

นี่คือเหตุผลว่าทำไม Binary ชุดเดียวกันจึงอ่านออกมาได้ต่างกัน

| ชนิดข้อมูล | ต่ำสุด | สูงสุด |
|--------|--------|--------|
| Unsigned 4-bit | 0 | 15 |
| Signed 4-bit | \-8 | 7 |

### วิธีหา Two's Complement

ถ้าเห็น `1011` แล้วอยากรู้ว่ามันเป็นลบเท่าไร ให้กลับทุกบิตแล้วบวกหนึ่ง

เลขเดิม **1011**

Invert bits **0100**

บวก 1 **0101 = 5**

---

ดังนั้น 1011 แทนค่า -5

อีกวิธีที่เร็วมากสำหรับ 4-bit คือใช้น้ำหนัก `-8, 4, 2, 1` แล้วบวกรวมกันโดยตรง

## 1.2 Binary Addition คิดอย่างไร?

การบวกฐานสองใช้กฎเดียวกับฐานสิบ เพียงแต่เลขฐานสองมีค่าได้แค่ 0 กับ 1

| บิตที่บวก | ผล | Carry |
|--------|--------|--------|
| 0 + 0 | 0 | 0 |
| 0 + 1 | 1 | 0 |
| 1 + 1 | 0 | 1 |
| 1 + 1 + Carry 1 | 1 | 1 |

ตัวอย่างข้อ 1.3\:

```text
   0101   = 5
 + 0110   = 6
 --------
   1011
```

ผลลัพธ์ 4-bit คือ `1011` แต่ 5+6 = 11 ซึ่งเกินช่วง Signed (-8 ถึง 7) จึงเกิด Overflow

## 1.3 Overflow ไม่ใช่ Carry เสมอไป

**Overflow** หมายถึงผลจริงเกินช่วงที่ชนิดข้อมูลแทนได้

สำหรับ Signed Addition ให้ตรวจเครื่องหมาย

สำหรับ Unsigned Addition ให้ดู Carry out จากบิตที่ 4 ส่วน Signed ต้องพิจารณาเครื่องหมายของ Operand และ Result

ตัวอย่างสำคัญคือข้อ 1.6

```text
   1001   = -7
 + 1011   = -5
 --------
  10100
```

ฮาร์ดแวร์เก็บแค่ 4-bit จึงเหลือ `0100` ซึ่งเป็น +4

แต่คำตอบจริงคือ -12 ต่ำกว่าค่าต่ำสุด -8 จึงเกิด Signed Overflow แม้ผลการบวกบิตของวงจรจะเป็นไปตามปกติ

## 1.4 ทดลองโจทย์ทุกข้อ

4-bit Addition Explorer

**Addition** 4-bit

Operand 1

Operand 2

\+ (\) =

---

Result (4-bit)

Overflow

## 1.5 เฉลยข้อ 1 ครบทุกข้อ

| ข้อ | ค่าที่บวกจริง | Result | Overflow |
|--------|--------|--------|--------|
| 1.1 Signed | 2+4=6 | `0110` | False |
| 1.2 Unsigned | 2+4=6 | `0110` | False |
| 1.3 Signed | 5+6=11 | `1011` | **True** |
| 1.4 Unsigned | 5+6=11 | `1011` | False |
| 1.5 Signed | \-1+(-5)=-6 | `1010` | False |
| 1.6 Signed | \-7+(-5)=-12 | `0100` | **True** |
| 1.7 Signed | \-7+3=-4 | `1100` | False |
| 1.8 Signed | 7+(-8)=-1 | `1111` | False |

**Mental Model\:** บวกบิตให้ถูกก่อน แล้วตรวจว่าผลจริงอยู่ในช่วง Signed หรือ Unsigned ที่โจทย์กำหนดหรือไม่

---

# ข้อ 2: ALU Control

10 คะแนน · ข้อ 2.1–2.8 · รูปที่ 1

## 2.1 ALU เป็นเครื่องคำนวณที่เลือกโหมดได้

ALU (Arithmetic Logic Unit) รับ Operand A และ B แล้วคำนวณผลตาม Control Signals เช่น ADD, SUB, AND, OR, NOR และ SLT

ในรูปที่ 1 ของข้อสอบ เป็น ALU แบบ 32-bit ที่ประกอบจาก 1-bit ALU จำนวน 32 ตัวต่อกัน

![รูปที่ 1: ALU Internal Structure จากข้อสอบ B](public/images/fe2019b_q2_alu.png)

**Ainv กับ Binv เป็นตัวปรับอินพุต** ส่วน Operation เป็นตัวเลือกว่าจะนำผลของวงจรไหนออกมา

สำหรับวงจรในโจทย์

| Operation | ผลที่เลือก |
|--------|--------|
| `00` | AND |
| `01` | OR |
| `10` | ADD |
| `11` | LESS |

## 2.2 ทำไมไม่มี SUB อยู่ใน Operation?

เพราะวงจรบวกสามารถทำการลบได้ด้วย Two's Complement

\[
\boxed{A-B=A+\overline B+1}
\]

ตัวอย่าง 5−3 แบบ 4-bit

A **0101 (5)**

B **0011 (3)**

Binv = 1 ทำให้ B กลายเป็น **1100**

CarryIn **0001**

---

**0101 + 1100 + 1**

## 0010 = 2

จึงเลือก

`Ainv=0`, `Binv=1`, `CarryIn=1`, `Operation=10`

## 2.3 แล้ว NOR และ SLT ทำอย่างไร?

**NOR** ใช้กฎ De Morgan

\[
\overline{A\lor B}=\overline A\land\overline B
\]

ดังนั้นให้ Invert ทั้ง A และ B แล้วเลือก AND

`Ainv=1`, `Binv=1`, `Operation=00`

**SLT (Set on Less Than)** ให้ผลเป็น 1 เมื่อ A น้อยกว่า B แบบ Signed และเป็น 0 มิฉะนั้น

วงจรคำนวณ A−B เพื่อเปรียบเทียบ แต่จะดู Sign bit ของผลลบอย่างเดียวไม่ได้ เพราะอาจเกิด Signed Overflow

ใน 1-bit ALU ตัว MSB ของรูปที่ 1 จึงมี Overflow Detection และสร้างสัญญาณ Set ที่แก้ผลของ Overflow แล้ว

\[
Set=Sign(A-B)\oplus Overflow
\]

Set จะถูกส่งกลับไปยัง Less input ของ ALU บิตต่ำสุด เพื่อสร้างผลลัพธ์ 32-bit ที่มีค่า 0 หรือ 1

## 2.4 ทดลองเลือก Operation

**ALU Control Explorer**

## 2.5 ALUOp กับ Funct ต่างจาก Operation อย่างไร?

ในตารางที่ 1 โจทย์ให้ `ALUOp` และ `Funct` เป็น Input ของวงจร ALU Control

อย่าสับสน\:

- **ALUOp\:** บอกวิธีเลือกการทำงานระดับสูง
- **Funct\:** ระบุว่าคำสั่ง R-type ต้องการคำนวณอะไร
- **Operation\:** สัญญาณสุดท้ายที่เลือกวงจรย่อยของ ALU

**ALUOp + Funct**

**ALU Control**

Decode ว่าต้องการ ADD / SUB / ...

**Ainv + Binv + CarryIn + Operation**

ควบคุมวงจร ALU จริง

กรณี `ALUOp=00` สั่ง ADD โดยตรง, `ALUOp=01` สั่ง SUB โดยตรง และ `ALUOp=10` ใช้ Funct เลือกการทำงาน R-type

จึงทำให้ข้อ 2.1 กับ 2.3 ได้ Control เหมือนกัน แม้ Input ของ ALU Control ต่างกัน

## 2.6 เฉลยตารางที่ 1 ครบทุกข้อ

| ข้อ | Goal | Ainv | Binv | CarryIn | Operation |
|--------|--------|--------|--------|--------|--------|
| 2.1 | ADD | 0 | 0 | 0 | `10` |
| 2.2 | SUB | 0 | 1 | 1 | `10` |
| 2.3 | ADD | 0 | 0 | 0 | `10` |
| 2.4 | SUB | 0 | 1 | 1 | `10` |
| 2.5 | AND | 0 | 0 | x | `00` |
| 2.6 | OR | 0 | 0 | x | `01` |
| 2.7 | NOR | 1 | 1 | x | `00` |
| 2.8 | SLT | 0 | 1 | 1 | `11` |

`x` คือ Don't Care เพราะ CarryIn ไม่ส่งผลต่อผลลัพธ์ Logic ที่ถูกเลือก

**Mental Model\:** เริ่มจาก Goal → เลือกวงจรที่ใช้ → ถ้าจำเป็นให้ Invert อินพุตหรือเพิ่ม CarryIn เพื่อสร้าง Operation ที่ต้องการ

---

# ข้อ 3: Multicycle Datapath

10 คะแนน · รูปที่ 2 · ตารางที่ 3 และ 4

ข้อ 3 เป็นการนำ ALU จากข้อ 2 มาใช้งานร่วมกับอุปกรณ์อื่นของ CPU

สิ่งที่เราต้องทำไม่ใช่แค่หาว่าควร ADD หรือ SUB แต่ต้องรู้ว่า **ในแต่ละ State CPU จะใช้ข้อมูลจากไหน เปิดอุปกรณ์ใด และส่งผลไปที่ไหน**

## 3.1 ทำความรู้จักอุปกรณ์

| อุปกรณ์ | หน้าที่ |
|--------|--------|
| PC | เก็บ Address ของ Instruction ที่จะอ่าน |
| IR | เก็บ Instruction ที่อ่านจาก Memory |
| Register File | เก็บค่าของ Register เช่น `$s1`, `$t0` |
| ALU | คำนวณและเปรียบเทียบ |
| ALUOut | พักผล ALU ระหว่าง Clock |
| Memory | เก็บ Instruction และข้อมูล |
| MUX | เลือกแหล่งข้อมูล |
| Main Control | สร้างสัญญาณควบคุมทั้งหมด |

ตัวอย่าง

```mips
lw $t0, 12($s1)
```

สมมติ `$s1=1000` และ `Memory[1012]=77`

เป้าหมายคือทำให้ `$t0=77`

**State 0: Instruction Fetch**

`IR ← Memory[PC]`

`PC ← PC+4`

**State 1: Address Calculation**

`ALUOut ← 1000+12 = 1012`

**State 2: Load + Write Back**

`$t0 ← Memory[1012] = 77`

**ทำไมต้องมี ALUOut?** เพราะ State 1 คำนวณ Address 1012 แล้ว State 2 จึงนำ Address นั้นไปใช้ ถ้าไม่มีที่พักผลข้าม Clock เราอาจรักษาค่าที่ต้องการไว้ไม่ได้

เครื่องในข้อสอบนี้เป็น 3-state Multicycle Machine ซึ่งเป็นรูปแบบเฉพาะตามรูปที่ 2 ไม่ใช่จำนวน State ที่ใช้เหมือนกันใน CPU ทุกแบบ

## 3.2 ก่อนเติมตาราง ต้องอ่าน MUX ให้ออก

MUX คือสวิตช์เลือกข้อมูลจากหลายแหล่ง

ตัวอย่าง `ALUSrcA=1` หมายถึงเลือก Read data 1 จาก Register File แทน PC

```svg
<svg viewBox="0 0 336 163" width="100%" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="10" width="115" height="38" rx="7" fill="#5285db" fill-opacity=".12" stroke="#5285db" /><text x="65" y="26" font-size="12" fill="currentColor" text-anchor="middle">PC</text><text x="65" y="41" font-size="12" fill="currentColor" text-anchor="middle">104</text><rect x="8" y="103" width="115" height="42" rx="7" fill="#0d9488" fill-opacity=".12" stroke="#0d9488" /><text x="65" y="120" font-size="12" fill="currentColor" text-anchor="middle">Register rs</text><text x="65" y="136" font-size="12" fill="currentColor" text-anchor="middle">1000</text><path d="M123 29 H150 V52 H179" stroke="#64748b" stroke-width="1.8" fill="none" /><path d="M123 124 H150 V100 H179" stroke="#0d9488" stroke-width="3" fill="none" /><path d="M179 42 L224 58 L224 94 L179 110 Z" stroke="#64748b" stroke-width="1.5" fill="#64748b" fill-opacity=".14" /><text x="201" y="81" font-size="12" fill="currentColor" text-anchor="middle" font-weight="700">MUX</text><path d="M224 76 H314" stroke="#0d9488" stroke-width="3" /><path d="M306 70 L314 76 L306 82" stroke="#0d9488" stroke-width="2" fill="none" /><text x="270" y="64" font-size="12" fill="currentColor" text-anchor="middle">ALU Input A</text><text x="270" y="98" font-size="18" font-weight="700" fill="#0d9488" text-anchor="middle">1000</text><text x="190" y="141" font-size="12" fill="currentColor">Select = 1</text></svg>
```

ทั้ง PC และ Register มีค่าอยู่ แต่ MUX เลือกส่งผ่านเพียงทางเดียว

ค่า MUX ที่ใช้ในข้อสอบมีดังนี้

| Control | ค่า | เลือกข้อมูล |
|--------|--------|--------|
| ALUSrcA | `0` | PC |
| ALUSrcA | `1` | Read data 1 (rs) |
| ALUSrcB | `00` | Read data 2 (rt) |
| ALUSrcB | `01` | ค่าคงที่ 4 |
| ALUSrcB | `10` | Sign-extended Immediate |
| ALUSrcB | `11` | Sign-extended Immediate Shift Left 2 |
| ALUOp | `00` | ADD |
| ALUOp | `01` | SUB |
| ALUOp | `10` | ใช้ Funct ของ R-type |

สำหรับ Output ยังมี MUX อีกชุด

| Control | ค่า 0 | ค่า 1 |
|--------|--------|--------|
| IorD | Memory Address จาก PC | จาก ALUOut |
| MemToReg | Write data จาก ALUOut | จาก Memory |
| RegDst | เขียน rt | เขียน rd |

`PCSource` มี 3 ทางเลือก คือ `00` ผล ALU ปัจจุบัน, `01` ผลจาก ALUOut และ `10` Jump Address

## 3.3 แยก Control Signals เป็นสองโซน

นี่คือวิธีหลักที่ใช้แก้ข้อ 3

**โซน A**

เปิด / ปิดการทำงาน

---

PCWrite

PCWriteCond

MemWrite

MemRead

IRWrite

RegWrite

**โซน B**

เลือกเส้นทางข้อมูล

---

PCSource

IorD

MemToReg

RegDst

ALUOp

ALUSrcA

ALUSrcB

Next State

โซน A ถามว่า *ต้องอ่านหรือเขียนอะไรใน State นี้?* ถ้าไม่ได้ใช้งาน ให้ใส่ 0

โซน B ถามว่า *ข้อมูลต้องมาจากไหนและไปไหน?* จึงเลือกค่าของ MUX ให้ตรง

โจทย์กำหนดให้ Don't Care ใน Main Control ใส่ `0` เพื่อความสะดวกในการตรวจ แต่ `opcode` ที่ไม่สนใจใช้ `xxxxxx`

## 3.4 พาทำ State 0 ให้ครบก่อน

State 0 เหมือนกันทุกคำสั่ง

\[
IR\leftarrow Memory[PC]
\]

\[
PC\leftarrow PC+4
\]

เพราะ Instruction ใน MIPS มีความยาว 32-bit หรือ 4 bytes และ PC ชี้ Address แบบ Byte-addressed

**โซน A\:** ต้องอ่าน Memory, เก็บ Instruction ลง IR และเขียน PC ใหม่

| Signal | ค่า |
|--------|--------|
| PCWrite | 1 |
| PCWriteCond | 0 |
| MemWrite | 0 |
| MemRead | 1 |
| IRWrite | 1 |
| RegWrite | 0 |

**โซน B\:** ต้องให้ Memory ใช้ PC เป็น Address และให้ ALU คำนวณ PC+4

| Signal | ค่า | ทำไม |
|--------|--------|--------|
| IorD | 0 | Memory ใช้ PC |
| ALUSrcA | 0 | เลือก PC |
| ALUSrcB | 01 | เลือกเลข 4 |
| ALUOp | 00 | ADD |
| PCSource | 00 | เลือกผล ALU เป็น PC ใหม่ |
| Next State | 1 | ไป Decode/Execute |

`MemToReg=0`, `RegDst=0` เพราะยังไม่มีการเขียน Register File

## 3.5 ตัวอย่างเต็ม: State 1 ของ `lw`

```mips
lw $t0, 12($s1)
```

สมมติ `$s1=1000`

CPU ต้องคำนวณ

\[
ALUOut=1000+12=1012
\]

```svg
<svg viewBox="0 0 330 148" width="100%" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="8" width="108" height="45" rx="8" stroke="#5285db" fill="#5285db" fill-opacity=".12" /><text x="59" y="25" font-size="12" fill="currentColor" text-anchor="middle">Register rs</text><text x="59" y="43" font-size="15" font-weight="700" fill="currentColor" text-anchor="middle">1000</text><rect x="5" y="95" width="108" height="45" rx="8" stroke="#d97706" fill="#d97706" fill-opacity=".12" /><text x="59" y="112" font-size="12" fill="currentColor" text-anchor="middle">Immediate</text><text x="59" y="130" font-size="15" font-weight="700" fill="currentColor" text-anchor="middle">12</text><path d="M113 30 H135 V54 H152 M113 117 H135 V92 H152" fill="none" stroke="#5285db" stroke-width="2" /><rect x="152" y="50" width="72" height="46" rx="8" stroke="#0d9488" fill="#0d9488" fill-opacity=".1" /><text x="188" y="68" font-size="13" text-anchor="middle" fill="currentColor" font-weight="700">ALU</text><text x="188" y="83" font-size="12" text-anchor="middle" fill="currentColor">ADD</text><path d="M224 72 H243" stroke="#0d9488" stroke-width="2.5" /><rect x="243" y="50" width="83" height="46" rx="8" stroke="#0d9488" fill="#0d9488" fill-opacity=".1" /><text x="284" y="67" font-size="12" text-anchor="middle" fill="currentColor">ALUOut</text><text x="284" y="85" font-size="16" text-anchor="middle" fill="currentColor" font-weight="700">1012</text><text x="188" y="132" font-size="11" text-anchor="middle" fill="currentColor">ALUOp = 00</text></svg>
```

ALUSrcA = 1 ALUSrcB = 10 Next = 2

ใน State นี้ยังไม่ต้องเปิด MemRead หรือ RegWrite เพราะเพียงคำนวณ Address

ดังนั้นโซน A ทั้งหมดเป็น 0

ส่วนโซน B ใช้

- `ALUSrcA=1` เพื่ออ่านค่า Base Register
- `ALUSrcB=10` เพื่อเลือก Offset
- `ALUOp=00` เพื่อบวก
- `Next=2` เพื่อไปทำ Memory Access

พอ State 2 จึงนำ ALUOut ไปอ่าน Memory

## 3.6 State 2 ของ `lw`\: ทำไม Control เป็นชุดนี้?

\[
Reg[rt]\leftarrow Memory[ALUOut]
\]

Data Flow

| Signal | ค่า | เพราะอะไร |
|--------|--------|--------|
| IorD | 1 | Address มาจาก ALUOut |
| MemRead | 1 | ต้องอ่าน Memory |
| MemToReg | 1 | Write data มาจาก Memory |
| RegDst | 0 | เขียน rt |
| RegWrite | 1 | ต้องบันทึกลง Register File |
| Next | 0 | กลับไป Fetch |

นี่คือวิธีทำที่ต้องใช้กับคำสั่งอื่น ๆ เช่นกัน เริ่มจาก Data Flow แล้วจึงแปลงเป็น Control

## 3.7 เปรียบเทียบคำสั่งที่เหลือ

### `sw`\: เหมือน `lw` ตรงไหน?

State 1 ของ `sw` เหมือน `lw` เพราะต้องคำนวณ Address ด้วย Base Register + Offset

\[
ALUOut=Reg[rs]+SignExt(Immediate)
\]

แต่ State 2 ไม่ได้อ่าน Memory มาลง Register แต่ทำตรงข้าม

\[
Memory[ALUOut]\leftarrow Reg[rt]
\]

ดังนั้นเปิด `MemWrite=1`, `IorD=1` และไม่เปิด RegWrite

### R-type: ทำไมต้องใช้ Funct?

เช่น

```mips
add $t0,$t1,$t2
```

State 1 เลือกค่าจาก Register สองตัวเข้ามาคำนวณ แล้วเก็บผลใน ALUOut

\[
ALUOut=Reg[rs]\ op\ Reg[rt]
\]

จึงตั้ง `ALUSrcA=1`, `ALUSrcB=00`, `ALUOp=10` เพื่อให้ Funct เลือก Operation จริง

State 2 จึงเขียนผลลง `rd`

`RegWrite=1`, `RegDst=1`, `MemToReg=0`

### `beq`\: ทำไมใช้ ALU สองครั้ง?

State 1 ใช้ ALU คำนวณ Branch Target

\[
ALUOut=PC+(SignExt(offset)\ll2)
\]

เลือก `ALUSrcA=0`, `ALUSrcB=11`, `ALUOp=00`

State 2 ใช้ ALU ลบ Register สองตัวเพื่อเปรียบเทียบ

\[
Reg[rs]-Reg[rt]
\]

ถ้าผลเป็นศูนย์ ALU จะให้ `Zero=1` และอนุญาตให้อัปเดต PC ไป Target ที่เก็บอยู่ใน ALUOut

จึงใช้ `PCWriteCond=1` กับ `PCSource=01`

**State 1**

คำนวณ Branch Target → ALUOut

**State 2**

rs − rt → Zero?

**Zero = 1**

PC ← ALUOut

**Zero = 0**

ใช้ PC+4 เดิม

### `j`\: ทำไมไม่มี State 2?

Jump ไม่ต้องอ่านหรือเขียนข้อมูลจาก Register File

หลังจาก State 0 Fetch คำสั่งแล้ว State 1 สามารถประกอบ Jump Address และเขียน PC ใหม่ได้เลย

\[
PC\leftarrow\{PC[31:28],IR[25:0],00\}
\]

ดังนั้น `PCWrite=1`, `PCSource=10`, `Next=0`

## 3.8 ทดลองครบทั้งห้าคำสั่ง

**Multicycle Control Explorer** ตารางที่ 4

สิ่งที่ CPU ทำใน State นี้

**โซน A: เปิด/ปิด**

---

**โซน B: เลือกเส้นทาง**

ช่องที่ไม่ใช้งานใส่ 0 ตามคำสั่งโจทย์

[Next State =]

## 3.9 เฉลยตารางที่ 3–4 ครบ

ตารางที่ 3 ให้เติมขั้นตอนทำงาน ส่วนตารางที่ 4 ให้แปลงขั้นตอนเหล่านั้นเป็น Main Control

| คำสั่ง | State 1 | State 2 |
|--------|--------|--------|
| j | Jump ไป Target | ไม่มี |
| beq | คำนวณ Branch Target | SUB ตรวจ Zero และอาจเปลี่ยน PC |
| R-type | ALU คำนวณ | เขียนผลลง rd |
| lw | คำนวณ Address | อ่าน Memory แล้วเขียน rt |
| sw | คำนวณ Address | เขียน rt ลง Memory |

คำอธิบายที่หายไปสำหรับ `sw` State 2 คือ

\[
\boxed{Mem[ALUOut]\leftarrow Reg[IR[20:16]]}
\]

**ตารางที่ 4 โซน A**

| State / คำสั่ง | PCWrite | PCWriteCond | MemWrite | MemRead | IRWrite | RegWrite |
|--------|--------|--------|--------|--------|--------|--------|
| 0 ทุกคำสั่ง | 1 | 0 | 0 | 1 | 1 | 0 |
| 1 j | 1 | 0 | 0 | 0 | 0 | 0 |
| 1 beq | 0 | 0 | 0 | 0 | 0 | 0 |
| 1 R-type | 0 | 0 | 0 | 0 | 0 | 0 |
| 1 lw | 0 | 0 | 0 | 0 | 0 | 0 |
| 1 sw | 0 | 0 | 0 | 0 | 0 | 0 |
| 2 beq | 0 | 1 | 0 | 0 | 0 | 0 |
| 2 R-type | 0 | 0 | 0 | 0 | 0 | 1 |
| 2 lw | 0 | 0 | 0 | 1 | 0 | 1 |
| 2 sw | 0 | 0 | 1 | 0 | 0 | 0 |

**ตารางที่ 4 โซน B**

| State / คำสั่ง | PCSource | IorD | MemToReg | RegDst | ALUOp | ALUSrcA | ALUSrcB | Next |
|--------|--------|--------|--------|--------|--------|--------|--------|--------|
| 0 ทุกคำสั่ง | 00 | 0 | 0 | 0 | 00 | 0 | 01 | 1 |
| 1 j | 10 | 0 | 0 | 0 | 00 | 0 | 00 | 0 |
| 1 beq | 00 | 0 | 0 | 0 | 00 | 0 | 11 | 2 |
| 1 R-type | 00 | 0 | 0 | 0 | 10 | 1 | 00 | 2 |
| 1 lw | 00 | 0 | 0 | 0 | 00 | 1 | 10 | 2 |
| 1 sw | 00 | 0 | 0 | 0 | 00 | 1 | 10 | 2 |
| 2 beq | 01 | 0 | 0 | 0 | 01 | 1 | 00 | 0 |
| 2 R-type | 00 | 0 | 0 | 1 | 00 | 0 | 00 | 0 |
| 2 lw | 00 | 1 | 1 | 0 | 00 | 0 | 00 | 0 |
| 2 sw | 00 | 1 | 0 | 0 | 00 | 0 | 00 | 0 |

Opcode ที่ใช้คือ R-type=`000000`, j=`000010`, beq=`000100`, lw=`100011`, sw=`101011` ส่วน State 0 ใช้ `xxxxxx`

## 3.10 กลับมาดู Datapath ของโจทย์จริง

![รูปที่ 2 Multicycle Machine](sandbox:/mnt/data/_exam_review/q3_datapath.png)

[เปิดรูปที่ 2 ขนาดเต็ม](sandbox:/mnt/data/_exam_review/q3_datapath.png)

ในภาพ เส้นสีส้มเป็นสาย Control ส่วนเส้นสีดำเป็น Data Paths ลองไล่จาก PC → Memory → IR แล้วค่อยตาม Register File → ALU → ALUOut และเส้นทางกลับไป Memory หรือ Register File

**Mental Model\:** State บอกเวลาที่ต้องทำงาน, โซน A เปิดอุปกรณ์ และโซน B เลือกเส้นทางข้อมูล อย่าท่องตาราง เริ่มจาก Data Flow แล้วหา Control

---

# ข้อ 4: Barrel Shifter และ SRL Datapath

10 คะแนน · รูปที่ 3 · วาดสายเชื่อมต่อ

ข้อ 3 ใช้ Control เลือกทางเดินของข้อมูลในวงจรที่กำหนดไว้ ส่วนข้อ 4 ต้อง **วาดสายเชื่อมต่ออุปกรณ์เอง** เพื่อให้ CPU ทำคำสั่ง `srl` ได้

## 4.1 เริ่มจากโจทย์ต้องการอะไร

```mips
srl $t0, $t1, 3
```

คำสั่ง SRL (Shift Right Logical) หมายถึงนำค่าจาก `$t1` เลื่อนบิตไปทางขวา 3 ตำแหน่ง แล้วเก็บผลใน `$t0`

สมมติ `$t1 = 40`

ดูการ Shift ด้วยตัวเลข 8-bit ก่อน

ก่อน Shift: 40

เลื่อนขวา 3 บิต เติม 0 ทางซ้าย

หลัง Shift: 5

สำหรับเลขไม่ติดลบ การ Shift Right n บิตเทียบได้กับหารด้วย \(2^n\) แล้วปัดเศษลง แต่ SRL เป็นการเลื่อนบิต ไม่ใช่คำสั่งหาร

## 4.2 Barrel Shifter ทำไมมี 5 MUX?

โจทย์ให้ Barrel Shifter ที่ประกอบด้วย MUX ห้าระดับ แต่ละระดับเลือกว่าใช้ค่าเดิมหรือค่าที่เลื่อนแล้ว

| MUX | Control=1 ทำอะไร |
|--------|--------|
| s0 | Shift ขวา 1 bit |
| s1 | Shift ขวา 2 bits |
| s2 | Shift ขวา 4 bits |
| s3 | Shift ขวา 8 bits |
| s4 | Shift ขวา 16 bits |

เหตุผลที่ใช้ 1, 2, 4, 8, 16 เพราะรวมกันให้เป็นค่าใดก็ได้ระหว่าง 0–31

เช่น ต้องการ Shift 13 บิต

\[
13=8+4+1=01101_2
\]

จึงเปิด s3, s2, s0 ส่วน s1, s4 ปล่อยค่าเดิมผ่านไป

## 4.3 Interactive: ดูการทำงานแต่ละ MUX

**Barrel Shifter Simulator** 32-bit logical shift

Data in

- 40
- 160
- 1024
- 65536
現在の選択内容は利用できません。

Shift Amount

## bits

> **スライダー**
>
> 現在の値を取得できません。
>
> **範囲：** 0～31
>
> **刻み幅：** 1

shamt (s4 ถึง s0)

| ขั้น | การทำงาน | ผล |
|--------|--------|--------|

Data out

ลองตั้ง 40 และ Shift 3 จะได้ `40 → 20 → 5` จากการเปิด s0 และ s1 ส่วนระดับอื่นส่งค่าเดิมผ่าน

## 4.4 ทำไม IR ต้องต่อไปยัง Register File?

Instruction แบบ MIPS R-format แบ่งเป็นช่องดังนี้

เช่น `srl $t0,$t1,3`

- `rt` ระบุ Register `$t1` หมายเลข 9
- `rd` ระบุ Register `$t0` หมายเลข 8
- `shamt` เก็บ 3 ในรูป `00011`

**อย่าสับสนเลข Register กับข้อมูลใน Register**

IR ส่งหมายเลข Register 9 ไปยัง Register File เพื่ออ่านค่าที่อยู่ข้างใน ซึ่งสมมติว่าเป็น 40

หมายความว่าสายจาก IR เป็น 5-bit แต่สายที่ส่งข้อมูลจริงจาก Register File เป็น 32-bit

## 4.5 วาดสายทีละเส้น

ต้องให้ Data เดินทางดังนี้

**IR\[20:16\] = rt**

เลือก Register ต้นทาง

**Register File: Read register 2**

อ่าน Data จริงออกทาง Read data 2

**Barrel Shifter**

Data in → เลื่อนตาม shamt → Data out

**Register File: Write data**

เก็บลง rd เมื่อ RegWrite=1

ต้องมีสายควบคุมเพิ่มเติมจาก `IR[6:10]` ไปยัง s0–s4 ตาม Bit Position จริง คือ IR\[6\] ไป s0, IR\[7\] ไป s1 ต่อไปจนถึง IR\[10\] ไป s4

## 4.6 ภาพเฉลยต่อสายบนข้อสอบจริง

![เฉลยข้อ 4 SRL Datapath พร้อมสายสี](sandbox:/mnt/data/fe2019b_q4_srl_wired.png)

[เปิดภาพขนาดเต็ม](sandbox:/mnt/data/fe2019b_q4_srl_wired.png)

ตารางนี้ช่วยเทียบสีบนภาพกับความหมายของสาย

| สาย | จำนวนบิต | หน้าที่ |
|--------|--------|--------|
| IR\[20:16\] → Read register 2 | 5 | เลือก rt |
| Read data 2 → Data in | 32 | ส่งข้อมูลเข้า Shifter |
| IR\[6\] ถึง IR\[10\] → s0 ถึง s4 | 1 ต่อเส้น | ควบคุมระยะ Shift |
| Data out → Write data | 32 | ส่งผลกลับ Register File |
| IR\[15:11\] → Write register | 5 | เลือก rd |
| RegWrite = 1 | 1 | อนุญาตให้เขียนผล |

สำหรับ `srl` ไม่ต้องใช้ค่า Read data 1 เพราะ rs ไม่ใช่ Operand ต้นทาง

**Mental Model\:** IR บอกว่าต้องอ่าน Register ไหน, เลื่อนเท่าไร และเขียน Register ไหน ส่วน Data จริงไหลจาก Register File ผ่าน Barrel Shifter แล้วกลับมาเก็บใน Register File

---

# ข้อ 5: Pipeline และ Hazards

10 คะแนน · ข้อ 5.1–5.10 · รูปที่ 4

## 5.1 Pipeline ต่างจาก Multicycle อย่างไร?

Multicycle Machine ในข้อ 3 ทำ Instruction หนึ่งตัวให้เสร็จก่อน แล้วจึงเริ่มตัวต่อไป

แต่ Pipeline พยายามให้หลาย Instruction ทำงานพร้อมกัน โดยแต่ละตัวอยู่คนละขั้นตอน

เครื่องในข้อสอบมี 5 Stages

สมมติ CPU กำลังทำ Instruction 3 ตัว

Clock 3 อาจมี I1 อยู่ EX, I2 อยู่ ID และ I3 อยู่ IF

ดังนั้น **คำสั่งหนึ่งไม่ได้จบเร็วขึ้นโดยอัตโนมัติ แต่จำนวนคำสั่งที่ทำเสร็จต่อเวลาเพิ่มขึ้น**

นี่คือความแตกต่างระหว่าง

- **Latency\:** หนึ่ง Instruction ใช้เวลาตั้งแต่เริ่มจนจบเท่าไร
- **Throughput\:** ทำ Instruction เสร็จได้กี่ตัวต่อหน่วยเวลา

## 5.2 ทดลอง Pipeline ทีละ Clock

**5-Stage Pipeline**

Clock

> **スライダー**
>
> 現在の値を取得できません。
>
> **範囲：** 1～9
>
> **刻み幅：** 1

Inst.

จุดที่ไฮไลต์แสดง Stage ที่ Instruction กำลังทำงานใน Clock ที่เลือก สมมติว่าไม่มี Stall หรือ Flush

[ก่อนหน้า] [ถัดไป]

ลองเลือก Clock 4 จะเห็นว่า I1 อยู่ MEM, I2 อยู่ EX, I3 อยู่ ID และ I4 อยู่ IF

นี่คือข้อดีและปัญหาของ Pipeline พร้อมกัน เพราะหลาย Instruction อาจต้องการทรัพยากรหรือข้อมูลที่เกี่ยวข้องกันในเวลาเดียวกัน

## 5.3 ข้อ 5.1 คำนวณเวลา Pipeline

ถ้ามี N Instructions และ Pipeline 5 Stages ที่ทำงานสมบูรณ์ ไม่มี Stall

\[
\boxed{Cycles=N+(5-1)=N+4}
\]

ทำไมต้องบวก 4?

เพราะ Instruction แรกต้องใช้ 5 Clock กว่าจะเสร็จ หลังจากนั้นเมื่อ Pipeline เต็มแล้ว จะมี Instruction เสร็จได้หนึ่งตัวต่อ Clock ภายใต้สมมติฐานนี้

ตัวอย่าง 10 Instructions

- I1 เสร็จ Clock 5
- I2 เสร็จ Clock 6
- I3 เสร็จ Clock 7
- \...
- I10 เสร็จ Clock 14

โจทย์กำหนด Clock Rate = 1 GHz แต่ใส่วงเล็บว่า Clock Period = 1 µs ซึ่งขัดกัน

ตามการคำนวณความถี่

\[
1\ GHz\implies T=1\ ns
\]

ดังนั้นผลจะเป็นดังนี้

| Instructions | Cycles | เวลาใช้ 1 GHz | เวลาใช้ 1 µs |
|--------|--------|--------|--------|
| 1 | 5 | 5 ns | 5 µs |
| 10 | 14 | 14 ns | 14 µs |
| 1,000,000 | 1,000,004 | 1.000004 ms | 1.000004 s |

คอลัมน์ 1 GHz เป็นค่าที่ถูกตามความสัมพันธ์ระหว่าง Frequency กับ Period ส่วนอีกคอลัมน์แสดงผลตาม Period ที่โจทย์ระบุไว้โดยตรง

## 5.4 ทำความเข้าใจ Hazard ทั้งสามชนิด

Hazard คือสถานการณ์ที่การทำงานซ้อนกันของ Pipeline อาจทำให้ดำเนินการต่อไม่ได้ตามปกติหรือเสี่ยงได้ผลลัพธ์ผิด

**Structural Hazard**

แย่งอุปกรณ์ เช่น IF กับ MEM ต้องใช้ Memory เดียวกันพร้อมกัน แต่ Memory รองรับไม่พอ

---

**Data Hazard**

ต้องใช้ค่าจาก Instruction ก่อนหน้า แต่ข้อมูลล่าสุดยังไม่พร้อม เช่น RAW

---

**Control Hazard**

ยังไม่รู้ว่าควร Fetch Instruction จาก Address ไหน เช่น Branch ยังตัดสินไม่เสร็จ

### ข้อ 5.2: Structural Hazard

ที่ Clock 4 คำสั่ง I1 อยู่ MEM และ I4 อยู่ IF

ทั้งคู่ต้องการอ่าน Memory แต่ถ้า Instruction กับ Data ใช้ Memory อุปกรณ์เดียวกันที่รองรับ Access ได้ทีละรายการ จะเกิดการแย่งกัน

**เฉลย: Structural Hazard**

วิธีแก้เช่นแยก Instruction Memory กับ Data Memory หรือเพิ่มความสามารถของ Memory ให้รองรับการเข้าถึงพร้อมกัน

### ข้อ 5.3: Control Hazard

โจทย์ยกตัวอย่าง

```mips
beq $s0, $s1, 0x1200
```

ต้องเปรียบเทียบ `$s0` กับ `$s1` ก่อนจึงรู้ว่าจะ Branch หรือไปต่อที่ PC+4

แต่ I2 ถูก Fetch มาแล้วใน Clock 2 ขณะที่การเปรียบเทียบของ I1 เพิ่งทำใน EX Stage ที่ Clock 3

ถ้า Branch Taken คำสั่งที่ Fetch มาตามทางเดิมอาจผิด

**I1: beq**

EX: เปรียบเทียบ Register

**Taken**

ไป Branch Target

**Not Taken**

ไป PC+4

ก่อนรู้ผลจริง CPU อาจ Fetch จากเส้นทางที่ผิดไว้แล้ว

**เฉลย: Control Hazard**

Branch Prediction เป็นวิธีช่วยลดผลกระทบของ Hazard แบบนี้ โดยคาดการณ์ทิศทางล่วงหน้า และต้อง Flush คำสั่งที่ผิดเส้นทางหากทำนายผิด

หมายเหตุ: โจทย์ยก Branch Target เป็น PC+4+0x1200 ส่วนการตีความ Immediate ของ MIPS Branch ตามปกติใช้ Sign-extended Offset ที่ Shift Left 2 ประเด็นที่ข้อ 5.3 ทดสอบคือการรอผล Branch

## 5.5 ข้อ 5.4–5.7: ทำไม Forwarding บางครั้งช่วยได้ บางครั้งไม่ได้?

กลุ่มนี้ควรเรียนต่อเนื่องกัน เพราะกำลังอธิบาย Hazard ที่คล้ายกันสองกรณี

### กรณี A: ALU Result พร้อม แต่ยังไม่เขียน Register

โจทย์ใช้

```mips
I1: addi $s0, $zero, 0x1200
I2: ori  $s1, $s0, 0x0A00
```

I2 ต้องการค่าล่าสุดของ `$s0` จาก I1

แต่ I1 จะ Write Back ใน Clock 5 ขณะที่ I2 ต้องใช้ `$s0` ใน EX ของ Clock 4

นี่คือ **RAW Data Hazard** เพราะ I2 ต้องอ่านค่าที่ I1 กำลังเขียน

อย่างไรก็ตาม I1 คำนวณผลจาก ALU เสร็จตั้งแต่ Clock 3 แล้ว

ดังนั้น Clock 4 สามารถส่งผล ALU จาก Pipeline Register ของ I1 ไปยัง Input ALU ของ I2 ได้โดยตรง

**Clock 3: I1 อยู่ EX**

คำนวณค่าใหม่ของ \$s0 เสร็จ

Forwarding

**Clock 4: I2 อยู่ EX**

รับค่าล่าสุดไปใช้ ไม่รอ WB

คำตอบข้อ 5.5 คือ **Forwarding หรือ Bypassing**

### กรณี B: Load-Use Hazard

โจทย์เปลี่ยนเป็น

```mips
I1: lw   $s0, 0($s5)
I2: addi $s1, $s0, 1
```

I2 ยังต้องการ `$s0` เช่นเดิม แต่ตอนนี้ I1 เป็น `lw`

ค่าที่ต้องการไม่ได้ออกจาก ALU ทันที เพราะ ALU เพียงคำนวณ Address ส่วนข้อมูลจริงต้องอ่านจาก Memory ใน MEM Stage

เปรียบเทียบเวลาที่ข้อมูลพร้อม

**ALU → ALU**

I1 คำนวณ EX ที่ Clock 3

---

I2 ใช้ค่าใน EX ที่ Clock 4

Forward ได้ทัน

**Load → ALU**

I1 ได้ Data หลัง MEM Clock 4

---

I2 ต้องการค่าใน EX Clock 4

Forward ไม่ทัน

นี่คือ **Load-Use Hazard** ซึ่งเป็น Data Hazard แบบ RAW ชนิดหนึ่ง

แม้เพิ่มเส้นทาง Forwarding ข้อมูลก็ยังมาไม่ทันใน Clock 4 จึงต้องเลื่อน I2 ออกไปก่อน

### ข้อ 5.7: Pipeline Stall

Stall คือการหยุดคำสั่งที่ต้องรอไว้ชั่วคราว เพื่อให้ข้อมูลพร้อมก่อนใช้งาน

ตัวอย่าง Timeline ของ Load-Use

| Clock | I1: lw | I2: addi |
|--------|--------|--------|
| 1 | IF |  |
| 2 | ID | IF |
| 3 | EX | ID |
| 4 | MEM | Stall ที่ ID |
| 5 | WB | EX |
| 6 |  | MEM |
| 7 |  | WB |

ใน Clock 4 คำสั่ง I2 ถูกพักไว้ และ Pipeline แทรก Bubble ใน EX แทน จากนั้นจึงไป EX ใน Clock 5 เมื่อสามารถรับข้อมูลจาก I1 ได้ทัน

**เฉลย: Pipeline Stall**

ข้อเสียคือเสียเวลาเพิ่มหนึ่ง Clock และ Throughput ลดลง

## 5.6 ข้อ 5.8: Instruction Scheduling

Compiler อาจช่วยลด Stall ได้โดยนำคำสั่งที่ไม่ขึ้นต่อกันมาแทรก

ก่อนจัดเรียง

```mips
lw   $t0, 0($s0)
addi $t1, $t0, 1
add  $t2, $t3, $t4
```

คำสั่ง `addi` ต้องรอผล `lw` แต่ `add $t2,$t3,$t4` ไม่ขึ้นกับผลของ `lw`

จึงจัดใหม่เป็น

```mips
lw   $t0, 0($s0)
add  $t2, $t3, $t4
addi $t1, $t0, 1
```

**ก่อน**

lw

addi: รอ lw

add

**หลัง**

lw

add: งานอิสระ

addi: ใช้ผล lw

ต้องจัดเรียงโดยไม่เปลี่ยนความหมายและผลลัพธ์ของโปรแกรม

**เฉลย: Instruction Scheduling**

## 5.7 ข้อ 5.9–5.10

**Branch Prediction** ช่วยลดผลกระทบของ Control Hazard โดยคาดการณ์ว่า Branch จะ Taken หรือ Not Taken เพื่อให้ CPU Fetch คำสั่งต่อไปโดยไม่ต้องหยุดรอทุกครั้ง

**Memory Hierarchy** เช่น Cache ช่วยลดเวลารอเข้าถึงหน่วยความจำเมื่อเกิด Cache Hit จึงช่วยลด Memory Stalls ได้ และการแยก Instruction Cache กับ Data Cache ยังช่วยบรรเทา Structural Hazard จากการใช้ Memory ร่วมกันได้ด้วย

ไม่ได้หมายความว่า Cache แก้ Hazard ได้ทุกชนิด เพราะ Cache Miss ยังทำให้ต้องรอ Memory ได้

## 5.8 เฉลยข้อ 5 ครบ

| ข้อ | คำตอบ | เหตุผล |
|--------|--------|--------|
| 5.1 | N+4 Cycles | 5 Stages, ไม่มี Stall |
| 5.2 | Structural Hazard | แย่ง Memory |
| 5.3 | Control Hazard | ยังไม่รู้ผล Branch |
| 5.4 | Data Hazard (RAW) | ต้องใช้ค่าใหม่ก่อน WB |
| 5.5 | Forwarding / Bypassing | ส่งค่าลัดไป EX |
| 5.6 | Load-Use Hazard | Data จาก lw ยังไม่พร้อม |
| 5.7 | Pipeline Stall | พัก Instruction เพื่อรอ |
| 5.8 | Instruction Scheduling | จัดลำดับคำสั่งลด Stall |
| 5.9 | Control Hazard | Branch Prediction ช่วย |
| 5.10 | Memory Stalls และ Structural Hazard บางกรณี | Cache / Memory Hierarchy |

**Mental Model\:** Pipeline ทำหลาย Instruction พร้อมกัน จึงต้องตรวจว่าแย่งอุปกรณ์หรือไม่ รอข้อมูลหรือไม่ และรู้เส้นทาง Instruction ถัดไปแล้วหรือยัง

---

# ข้อ 6: Pipeline Registers และ Control Signals

10 คะแนน · รูปที่ 5 · อธิบายกลไกการส่งต่อ Control

ข้อ 6 เชื่อมสิ่งที่เรียนในข้อ 3 กับข้อ 5 เข้าด้วยกัน

ข้อ 3 เราใช้ Main Control เลือกว่าใน State นี้ต้องเปิดอุปกรณ์และเลือกทางเดินข้อมูลอย่างไร

ข้อ 5 เราพบว่า Pipeline สามารถทำหลาย Instruction พร้อมกันในคนละ Stage

**ปัญหาคือ Main Control มีเพียงชุดเดียวใน ID Stage แล้ว EX, MEM และ WB รู้ได้อย่างไรว่าต้องใช้ Control ของ Instruction ตัวไหน?**

## 6.1 ทำไมใช้ Control จาก ID ตรง ๆ ไม่ได้?

สมมติ Instruction สามตัวเป็น

```mips
I1: lw  $t0, 0($s1)
I2: add $t2, $t3, $t4
I3: sw  $t5, 4($s1)
```

ใน Clock 4

ตอนนี้ Main Control กำลัง Decode `sw` แต่ `lw` ที่อยู่ MEM ต้องอ่าน Memory

ถ้าส่ง Control ของ `sw` ไปยัง MEM โดยตรง จะเกิดความผิดพลาด เพราะ `sw` ต้องการ MemWrite แต่ `lw` ต้องการ MemRead

CPU จึงต้องเก็บ Control Signals ของแต่ละ Instruction เอาไว้แล้วส่งต่อผ่าน **Pipeline Registers**

## 6.2 Pipeline Register ต่างจาก Register File อย่างไร?

| Register File | Pipeline Register |
|--------|--------|
| เก็บค่าของโปรแกรม เช่น `$t0` | เก็บข้อมูลที่เดินทางข้าม Stage |
| มีหมายเลข Register | อยู่ระหว่าง Pipeline Stages |
| อ่านและเขียนตามคำสั่ง | รับและส่ง Data/Control ตาม Clock |
| ค่ายังคงอยู่จนถูกเขียนใหม่ | เปลี่ยนไปตาม Instruction ที่ไหลผ่าน |

Pipeline Register เก็บทั้ง Operand, ผลคำนวณ, หมายเลข Register ปลายทาง และ Control Signals ที่จำเป็นสำหรับ Stage ถัดไป

## 6.3 Control เดินทางผ่าน Pipeline อย่างไร?

Main Control สร้าง Control ใน ID แล้วแบ่งเป็นสามกลุ่ม

| กลุ่ม | ตัวอย่าง | ใช้ที่ |
|--------|--------|--------|
| EX | ALUSrc, ALUOp, RegDst | EX |
| M | MemRead, MemWrite, Branch | MEM |
| WB | RegWrite, MemToReg | WB |

**ID: Main Control**

สร้าง EX, M, WB Controls

**ID/EX Register**

**EX ใช้ EX Controls**

**EX/MEM Register**

**MEM ใช้ M Controls**

**MEM/WB Register**

**WB**

**WB ใช้ WB Controls**

ทำไมสัญญาณจึงค่อย ๆ ลดลง?

เพราะเมื่อ EX ใช้ EX Controls ไปแล้ว ก็ไม่จำเป็นต้องส่ง EX Controls ไปถึง MEM และ WB

แต่ M และ WB ยังต้องถูกเก็บต่อเพื่อให้ Instruction เดียวกันทำงานในอนาคตได้ถูกต้อง

## 6.4 ติดตาม `lw` ผ่าน Pipeline ทีละ Clock

สมมติ `lw` เป็น I1

**Clock 2: ID**

Main Control สร้าง Control สำหรับ `lw` เช่น

- EX: ALUSrc=1, ALUOp=00
- M: MemRead=1, MemWrite=0
- WB: RegWrite=1, MemToReg=1

สัญญาณทั้งหมดถูกบันทึกใน ID/EX Register

**Clock 3: EX**

`lw` คำนวณ Memory Address โดยใช้ EX Controls

แล้วส่ง M และ WB Controls ผ่าน EX/MEM Register

**Clock 4: MEM**

ตอนนี้ `lw` ใช้ `MemRead=1` จาก EX/MEM Register เพื่ออ่าน Memory

แม้ Main Control ใน ID จะกำลัง Decode `sw` อยู่ก็ตาม

**Clock 5: WB**

`lw` ใช้ RegWrite และ MemToReg จาก MEM/WB Register เพื่อเขียนค่าที่อ่านได้ลง Register ปลายทาง

## 6.5 Interactive: ตาม Control ของ Instruction แต่ละตัว

**Pipeline Control Explorer**

# Clock

[ก่อนหน้า] [ถัดไป]

เลือก Clock 4 และ I1 จะเห็น `lw` อยู่ MEM และใช้ MemRead=1 ขณะที่ I3 อยู่ ID

นี่แสดงให้เห็นว่าการทำงานของ Main Control ใน Clock ปัจจุบันไม่ได้ทับ Control ของ Instruction เก่าที่เดินทางไปยัง Stage ถัดไปแล้ว

## 6.6 ดูรูปที่ 5 ของข้อสอบจริง

![Pipeline Machine จากรูปที่ 5 ของข้อสอบ](sandbox:/mnt/data/fe2019b_q6_figure5.png)

[เปิดรูปที่ 5 ขนาดเต็ม](sandbox:/mnt/data/fe2019b_q6_figure5.png)

สังเกตสี่ส่วนนี้ในรูป

| จุด | สิ่งที่เก็บหรือทำ |
|--------|--------|
| Main Control ที่ ID | สร้าง Control จาก Instruction |
| ID/EX | Data และ EX, M, WB Controls |
| EX/MEM | ผล ALU, Data ที่ต้องใช้ต่อ และ M, WB Controls |
| MEM/WB | ผลจาก Memory/ALU และ WB Controls |

**แล้ว Hazard Detection กับ Forwarding Unit ล่ะ?**

สองวงจรนี้ไม่ได้สร้าง Main Control ของทุก Instruction ใหม่

Hazard Detection ช่วยควบคุม Stall และ Flush เช่นระงับการเคลื่อนข้อมูลหรือทำให้ Control ของ Bubble เป็นค่าที่ไม่ก่อให้เกิดการเขียนผิด

Forwarding Unit ช่วยเลือกข้อมูลที่พร้อมแล้วจาก Stage ที่อยู่ข้างหน้า ส่งกลับไปให้ Instruction ที่ต้องใช้ข้อมูลนั้น

## 6.7 ตัวอย่างคำตอบข้อสอบ

> Main Control สร้าง Control Signals ของ Instruction ใน ID Stage แล้วเก็บส่งต่อพร้อมข้อมูลผ่าน Pipeline Registers โดย ID/EX เก็บ EX, M และ WB Controls เมื่อ Instruction เข้าสู่ EX จะใช้ EX Controls และส่ง M, WB ต่อผ่าน EX/MEM จากนั้น MEM ใช้ M Controls และส่ง WB ต่อผ่าน MEM/WB จนถึง WB Stage ทำให้แต่ละ Stage ได้รับสัญญาณที่ตรงกับ Instruction ของตัวเอง แม้มีหลาย Instruction ทำงานพร้อมกัน

**Mental Model\:** Main Control สร้าง Control หนึ่งครั้งต่อ Instruction ใน ID แล้ว Pipeline Registers เก็บและส่ง Control ไปกับ Instruction นั้นจนเสร็จงาน

---

# เชื่อมทั้ง 6 ข้อเข้าด้วยกัน

แกนหลักที่ใช้ทวนก่อนสอบคือการแยก **Data, Operation, Control และ Time** ให้ออก

Data คือค่าที่เดินทางในวงจร, Operation คือสิ่งที่ ALU หรืออุปกรณ์ต้องทำ, Control คือสัญญาณที่เลือกการทำงาน และ Time คือ State หรือ Pipeline Stage ที่กำลังเกิดขึ้น

เมื่อแยกสี่อย่างนี้ได้ ข้อ 2–6 จะไม่ใช่การจำตารางและสายจำนวนมาก แต่เป็นการติดตามว่าคำสั่งหนึ่งต้องทำอะไรให้สำเร็จ และ CPU ต้องจัดการอย่างไรเพื่อให้ได้ผลนั้น

---

If you want, I can:

- Explore detailed examples of overflow detection
- Analyze ALU control signals for various operations
- Walk through ALU subtraction using two's complement
