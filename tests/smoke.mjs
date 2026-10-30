// Run: node tests/smoke.mjs
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8').replace(/\ninit\(\);\s*$/, '');
const context=vm.createContext({localStorage:{getItem:()=>null,setItem:()=>{}},document:{},console});
vm.runInContext(source,context);
const run=code=>vm.runInContext(code,context);
for(let chapter=1;chapter<=6;chapter++){
 const html=run(`lesson${chapter}()`);
 assert(html.includes('class="hero-title"'),`Chapter ${chapter}: missing title`);
 assert(html.includes('MENTAL MODEL'),`Chapter ${chapter}: missing mental model`);
 assert(html.includes('lesson-section'),`Chapter ${chapter}: missing sections`);
 assert(!html.includes('undefined'),`Chapter ${chapter}: undefined value`);
 const quiz=run(`practice(${chapter})`);
 assert(quiz.includes('QUESTION 1 / 2'),`Chapter ${chapter}: missing practice`);
}
assert.equal(run('additionCases.length'),8);
assert.equal(run('aluCases.length'),8);
assert.equal(run('stateRows.length'),10);
assert.equal(run('quizzes[5].length'),2);
assert.equal(run('stateRows.find(r=>r.cmd==="beq"&&r.s===2).a[1]'), '1');
assert.equal(run('stateRows.find(r=>r.cmd==="sw"&&r.s===2).a[2]'), '1');
assert.equal(run('stateRows.find(r=>r.cmd==="lw"&&r.s===2).b[1]'), '1');
assert.equal(run('additionCases.map(r=>{const a=decodeBits(r[2],r[4]),b=decodeBits(r[3],r[4]);return r[4]?a+b>7||a+b < -8:a+b>15}).join(",")'),'false,false,true,false,false,true,false,false');
run('model.shifterData=40;model.shamt=3');
assert.equal(run('shiftStageRows().at(-1).after'),5);
run('model.shamt=13');
assert.equal(run('shiftStageRows().filter(s=>s.on).map(s=>s.name).join(",")'),'s0,s2,s3');
console.log('PASS: six full lessons, 12 practice items, all ALU/control/addition cases, and barrel shifter logic.');
