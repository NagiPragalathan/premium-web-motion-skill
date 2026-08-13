// Pulls every motion-bearing block out of the corpus so the choreography language
// can be studied without loading 1.1M chars of layout spec.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.argv[2] || '.');
const DIR = path.join(ROOT, 'corpus', 'prompts');
const MAX_BLOCK = 2600;

const HEAD = /(ANIMATION|ANIMATIONS|MOTION|CHOREOGRAPH|INTERACTION|MICRO-?INTERACTION|SCROLL|HOVER|TRANSITION|ENTRANCE|REVEAL|LOOP|PARALLAX|CURSOR|MARQUEE|REDUCED MOTION|BEHAVIOR|BEHAVIOUR|STATES)/i;
// A heading is a short line that is ALL CAPS, or markdown-bolded, or ends in a colon.
const isHeading = (l) => {
  const t = l.trim();
  if (!t || t.length > 90) return false;
  if (/^[═─━=_-]{4,}$/.test(t)) return false;
  const capsish = t === t.toUpperCase() && /[A-Z]{3}/.test(t);
  const bold = /^\*\*.+\*\*:?$/.test(t);
  const numbered = /^(\d+[.)]|#{1,4})\s+\S/.test(t);
  const colon = /:$/.test(t);
  return capsish || bold || numbered || colon;
};

let out = [];
const files = fs.readdirSync(DIR).filter(f => f.endsWith('.md')).sort();

for (const f of files) {
  const raw = fs.readFileSync(path.join(DIR, f), 'utf8');
  const lines = raw.split('\n');
  const blocks = [];
  for (let i = 0; i < lines.length; i++) {
    if (!isHeading(lines[i]) || !HEAD.test(lines[i])) continue;
    const buf = [lines[i]];
    let len = lines[i].length;
    for (let j = i + 1; j < lines.length; j++) {
      const l = lines[j];
      // stop at the next unrelated heading
      if (isHeading(l) && !HEAD.test(l) && buf.length > 2) break;
      if (/^[═]{5,}$/.test(l)) { if (buf.length > 2) break; else continue; }
      buf.push(l);
      len += l.length;
      if (len > MAX_BLOCK) break;
    }
    blocks.push(buf.join('\n').replace(/\n{3,}/g, '\n\n').trim());
  }
  if (!blocks.length) continue;
  const title = (raw.match(/^title: "(.*)"$/m) || [, f])[1];
  const cat = (raw.match(/^category: "(.*)"$/m) || [, ''])[1];
  out.push(`\n\n<!-- ============ ${f.replace('.md', '')} — ${title} (${cat}) ============ -->\n` + blocks.join('\n\n···\n\n'));
}

const text = out.join('\n');
fs.writeFileSync(path.join(ROOT, 'corpus', 'MOTION_EXCERPTS.md'), text, 'utf8');
console.log(`docs with motion blocks: ${out.length}, chars: ${text.length}`);
