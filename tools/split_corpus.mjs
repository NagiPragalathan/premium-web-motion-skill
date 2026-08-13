// Splits the scraped MotionSites free-prompt corpus into per-prompt markdown files
// and emits a catalog index. Input: motionsites_free_prompts.json (scraped via Playwright).
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.argv[2] || '.');
const RAW = path.join(ROOT, 'corpus', 'prompts');
fs.mkdirSync(RAW, { recursive: true });

// The Playwright dump is double-encoded (a JSON string containing JSON), so unwrap until it's an object.
let store = JSON.parse(fs.readFileSync(path.join(ROOT, 'motionsites_free_prompts.json'), 'utf8'));
while (typeof store === 'string') store = JSON.parse(store);
const rows = [];

for (const [id, v] of Object.entries(store)) {
  const m = v.meta || {};
  const text = v.text || '';
  const fm = [
    '---',
    `id: ${id}`,
    `title: ${JSON.stringify(m.title || '')}`,
    `category: ${JSON.stringify(m.category || '')}`,
    `type: ${JSON.stringify(m.type || '')}`,
    `page_type: ${JSON.stringify(m.page_type || '')}`,
    `chars: ${text.length}`,
    '---',
    '',
  ].join('\n');
  fs.writeFileSync(path.join(RAW, `${id}.md`), fm + text, 'utf8');
  rows.push({ id, title: m.title, category: m.category, type: m.type, page_type: m.page_type, chars: text.length });
}

rows.sort((a, b) => (a.type || '').localeCompare(b.type || '') || (a.title || '').localeCompare(b.title || ''));
const md = ['| id | title | category | type | chars |', '| --- | --- | --- | --- | --- |',
  ...rows.map(r => `| ${r.id} | ${r.title} | ${r.category} | ${r.type} | ${r.chars} |`)].join('\n');
fs.writeFileSync(path.join(ROOT, 'corpus', 'CATALOG.md'), md, 'utf8');
console.log(`wrote ${rows.length} prompts, total ${rows.reduce((a, r) => a + r.chars, 0)} chars`);
