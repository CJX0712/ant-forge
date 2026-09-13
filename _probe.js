// ant-forge probe — ASCII render of the ant grid + black-count sequence + highway check.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const m = html.match(/<script id="engine">([\s\S]*?)<\/script>/);
const ctx = {};
vm.createContext(ctx);
const Ant = vm.runInContext(m[1] + '\nAnt;', ctx);

function ascii(s, cols, rows){
  const grid = Array.from({ length: rows }, () => Array(cols).fill(' '));
  const ox = Math.floor(cols / 2), oy = Math.floor(rows / 2);
  s.blacks.forEach(k => {
    const p = k.split(',');
    const gx = +p[0] + ox, gy = +p[1] + oy;
    if (gx >= 0 && gx < cols && gy >= 0 && gy < rows) grid[gy][gx] = '#';
  });
  const ax = s.x + ox, ay = s.y + oy;
  if (ax >= 0 && ax < cols && ay >= 0 && ay < rows) grid[ay][ax] = '@';
  return grid.map(r => r.join('')).join('\n');
}

console.log('=== probe: empty start, 100 steps (chaotic blob) ===');
{
  const s = Ant.makeState();
  Ant.run(s, 100);
  console.log(ascii(s, 41, 26));
  console.log('blackCount=' + s.blacks.size + ' ant=(' + s.x + ',' + s.y + ') dir=' + s.dir);
}

console.log('\n=== probe: empty start, 500 steps ===');
{
  const s = Ant.makeState();
  Ant.run(s, 500);
  console.log(ascii(s, 61, 34));
  console.log('blackCount=' + s.blacks.size + ' ant=(' + s.x + ',' + s.y + ') dir=' + s.dir);
}

console.log('\n=== probe: black-count sequence (steps 0..14) ===');
{
  const s = Ant.makeState();
  const seq = [];
  for (let i = 0; i <= 14; i++){ seq.push(s.blacks.size); Ant.step(s); }
  console.log(seq.join(','));
}

console.log('\n=== probe: highway after 11000 steps ===');
{
  const s = Ant.makeState();
  Ant.run(s, 11000);
  console.log('blackCount=' + s.blacks.size + ' ant=(' + s.x + ',' + s.y + ') dir=' + s.dir);
  const p = (n) => { const q = Ant.clone(s); Ant.run(q, n); return [q.x, q.y]; };
  const a = p(0), b = p(104), c = p(208), d = p(312);
  console.log('p(0)=' + a + ' p(104)=' + b + ' p(208)=' + c + ' p(312)=' + d);
  console.log('v1=' + [b[0]-a[0], b[1]-a[1]] + ' v2=' + [c[0]-b[0], c[1]-b[1]] + ' v3=' + [d[0]-c[0], d[1]-c[1]]);
}

console.log('\nPROBE OK');
