// ant-forge smoke test — extracts the inline Ant engine and verifies invariants.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const m = html.match(/<script id="engine">([\s\S]*?)<\/script>/);
if (!m) { console.error('FAIL: engine script not found'); process.exit(1); }
const ctx = {};
vm.createContext(ctx);
const Ant = vm.runInContext(m[1] + '\nAnt;', ctx);

let pass = 0, fail = 0;
const T = (name, cond) => {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ ' + name); }
};

console.log('AntForge smoke test');

// 1) single step from empty grid: white -> right turn, flip black, move right
{
  const s = Ant.makeState();
  Ant.step(s);
  T('white cell: flip black + turn right + move right', s.blacks.has('0,0') && s.dir === 1 && s.x === 1 && s.y === 0);
}
// 2) single step on a black cell: black -> left turn, flip white, move left
{
  const s = Ant.makeState();
  s.blacks.add('0,0');
  Ant.step(s);
  T('black cell: flip white + turn left + move left', !s.blacks.has('0,0') && s.dir === 3 && s.x === -1 && s.y === 0);
}
// 3) black-cell count over first 5 steps from empty: 1,2,3,4,3
{
  const seq = [1, 2, 3, 4, 3];
  const s = Ant.makeState();
  let ok = true;
  for (let i = 0; i < seq.length; i++){ Ant.step(s); if (s.blacks.size !== seq[i]) ok = false; }
  T('first 5 black counts = 1,2,3,4,3', ok);
}
// 4) determinism: identical runs produce identical states
{
  const a = Ant.makeState(), b = Ant.makeState();
  Ant.run(a, 500); Ant.run(b, 500);
  T('determinism: 500 steps identical', Ant.hash(a) === Ant.hash(b));
}
// 5) reversibility: forward K then stepBack K == original (random init states)
{
  let ok = true;
  for (let seed = 1; seed <= 8; seed++){
    let r = seed * 2654435761 >>> 0;
    const rnd = () => { r = (r * 1664525 + 1013904223) >>> 0; return r / 4294967296; };
    const s0 = Ant.makeState();
    for (let i = 0; i < 40; i++) s0.blacks.add((Math.floor(rnd() * 21) - 10) + ',' + (Math.floor(rnd() * 21) - 10));
    s0.x = Math.floor(rnd() * 11) - 5; s0.y = Math.floor(rnd() * 11) - 5; s0.dir = Math.floor(rnd() * 4);
    const before = Ant.hash(s0);
    const s = Ant.clone(s0);
    Ant.run(s, 300);
    for (let i = 0; i < 300; i++) Ant.stepBack(s);
    if (Ant.hash(s) !== before) ok = false;
  }
  T('reversible CA: forward 300 + back 300 == original (8 seeds)', ok);
}
// 6) irregular phase: bounded growth (no explosion), ant stays in ~±100
{
  const s = Ant.makeState();
  Ant.run(s, 5000);
  T('5000 steps: ant bounded (|x|,|y| < 100)', Math.abs(s.x) < 100 && Math.abs(s.y) < 100);
}
// 7) highway: after 11000 steps, period-104 constant diagonal displacement
{
  const s = Ant.makeState();
  Ant.run(s, 11000);
  const p = (n) => { const q = Ant.clone(s); Ant.run(q, n); return [q.x, q.y]; };
  const a = p(0), b = p(104), c = p(208), d = p(312);
  const v1 = [b[0] - a[0], b[1] - a[1]];
  const v2 = [c[0] - b[0], c[1] - b[1]];
  const v3 = [d[0] - c[0], d[1] - c[1]];
  const sameVec = v1[0] === v2[0] && v1[1] === v2[1] && v2[0] === v3[0] && v2[1] === v3[1];
  const diagonal = Math.abs(v1[0]) === Math.abs(v1[1]) && v1[0] !== 0;
  const far = Math.hypot(s.x, s.y) > 20;
  T('highway: period-104 constant diagonal displacement', sameVec && diagonal);
  T('highway: ant far from origin (>20)', far);
}

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
