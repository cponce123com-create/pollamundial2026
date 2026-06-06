import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const p = join(__dirname, '../db/squads.json');
const raw = JSON.parse(readFileSync(p, 'utf-8'));

const m = JSON.parse(readFileSync(join(__dirname, 'meta.json'), 'utf-8'));
const pd = JSON.parse(readFileSync(join(__dirname, 'players.json'), 'utf-8'));

const out = raw.map(s => {
  const meta = m[s.team];
  if (!meta) throw new Error('No meta: ' + s.team);
  const d = pd[s.team];
  if (!d) throw new Error('No data: ' + s.team);
  const existing = s.players.map((pl, i) => {
    const e = d.existing[i] || {club:'?',age:25,caps:0};
    return {...pl, club:e.club, age:e.age, caps:e.caps};
  });
  return {...s, ...meta, players:[...existing, ...d.extra]};
});

writeFileSync(p, JSON.stringify(out, null, 2));
console.log('Done:', out.length, 'teams');
