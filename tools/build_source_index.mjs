/**
 * Builds the lookup table for the local source-case library.
 *
 * The library itself (references/source-cases/) is gitignored — it holds verbatim reference
 * prompts and is never published. This script regenerates its INDEX.md.
 *
 * The index is organised for *selection*, not browsing. A flat list of 144 makes a model pick the
 * first plausible match every time, which is how 144 references collapse into one house style. So
 * every case is assigned to exactly one direction pool and one section pool, and each pool is
 * numbered — the skill picks by computed offset into a pool rather than by "closest match".
 *
 *   node tools/build_source_index.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const HERE = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1');
const ROOT = path.resolve(HERE, '..');
const DIR = path.join(ROOT, 'plugins', 'premium-web-motion-skill', 'skills',
  'premium-web-motion-skill', 'references', 'source-cases');

if (!fs.existsSync(DIR)) {
  console.error(`No source-case library at ${DIR}\n` +
    `Copy corpus/prompts/*.md there first — it is a local-only install step.`);
  process.exit(1);
}

/** Pull a single scalar out of the YAML-ish frontmatter block. */
function field(text, key) {
  const m = text.match(new RegExp(`^${key}:\\s*(.*)$`, 'm'));
  return m ? m[1].trim().replace(/^["']|["']$/g, '') : '';
}

const PROBES = {
  video: /<video|\.mp4|autoPlay|autoplay/i,
  glass: /backdrop-blur|backdrop-filter/i,
  threeD: /perspective|rotateY|transform-style|preserve-3d/i,
  canvas: /<canvas|getContext\(|requestAnimationFrame/i,
  sticky: /position:\s*sticky|sticky top-|useScroll|scrollYProgress/i,
  carousel: /carousel|slider|marquee|infinite scroll/i,
  framer: /framer-motion|motion\/react/i,
  form: /<input|<form|placeholder=/i,
  grid: /grid-cols-3|grid-cols-4|auto-fit|masonry|bento/i,
  mono: /JetBrains Mono|font-mono|monospace/i,
  serif: /Instrument Serif|Playfair|Cormorant|Georgia/i,
  condensed: /\bAnton\b|Bebas|font-grotesk|uppercase tracking/i,
  neon: /#6FFF00|#b724ff|neon|glow|acid|electric/i,
  warm: /#f7f2ea|#efe6d9|terracotta|sage|clay|cream|warm/i,
};

/**
 * Assign one direction per case. Order is priority: the first match wins, so pools stay disjoint
 * and no case is available from two places.
 */
function classify(s, darkScore, lightScore) {
  const dark = darkScore > lightScore;
  if (s.mono) return 'D6 Technical Interface';
  if (s.threeD || (s.canvas && s.carousel)) return 'D10 Dimensional 3D';
  if (s.condensed && !s.video) return 'D4 Brutalist Statement';
  if (dark && s.neon) return 'D7 Neon Night';
  if (s.serif && !dark) return 'D3 Editorial Light';
  if (dark && s.video) return 'D1 Cinematic Dark';
  if (!dark && s.video) return 'D5 Photographic Full-bleed';
  if (!dark && s.glass) return 'D8 Aurora Gradient';
  if (!dark && s.warm) return 'D9 Warm Organic';
  if (!dark && (s.grid || s.form)) return 'D2 Product Clarity';
  return dark ? 'D1 Cinematic Dark' : 'D2 Product Clarity';
}

const rows = [];
for (const file of fs.readdirSync(DIR).filter(f => f.endsWith('.md') && f !== 'INDEX.md')) {
  let text;
  try {
    text = fs.readFileSync(path.join(DIR, file), 'utf8');
  } catch (err) {
    console.error(`skip ${file}: ${err.message}`);
    continue;
  }
  const s = Object.fromEntries(Object.entries(PROBES).map(([k, re]) => [k, re.test(text)]));
  const darkScore = (text.match(/#0[0-9a-f]{5}|bg-black|bg-neutral-9|bg-zinc-9|dark mode/gi) || []).length;
  const lightScore = (text.match(/#f[0-9a-f]{5}|bg-white|#fff\b|cream|ivory/gi) || []).length;

  rows.push({
    id: file.replace(/\.md$/, ''),
    title: field(text, 'title') || file.replace(/\.md$/, ''),
    category: field(text, 'category') || '-',
    type: (field(text, 'type') || 'other').toLowerCase(),
    chars: field(text, 'chars') || String(text.length),
    tone: darkScore > lightScore * 1.3 ? 'dark' : lightScore > darkScore * 1.3 ? 'light' : 'mixed',
    direction: classify(s, darkScore, lightScore),
    tags: Object.entries(s).filter(([, v]) => v).map(([k]) => k),
  });
}

rows.sort((a, b) => a.id.localeCompare(b.id));

const group = (key) => rows.reduce((acc, r) => ((acc[r[key]] ||= []).push(r), acc), {});
const byDirection = group('direction');
const byType = group('type');

const poolBlock = (title, groups, note) => [
  `## ${title}`,
  '',
  note,
  '',
  ...Object.entries(groups)
    .sort((a, b) => b[1].length - a[1].length)
    .flatMap(([name, list]) => [
      `### ${name} — ${list.length} cases`,
      '',
      list.map((r, i) => `${i}. \`${r.id}\``).join(' · '),
      '',
    ]),
];

const out = [
  '# Source cases — selection index',
  '',
  `${rows.length} verbatim reference cases. The full text of each sits beside this file as`,
  '`<id>.md`. **Open the pool you need, pick by the protocol in SKILL.md, then read only the two or',
  'three files you picked.** Never read the directory wholesale.',
  '',
  'Pools are disjoint: every case appears in exactly one direction pool and one section pool, and',
  'is numbered within it so selection can be computed rather than guessed.',
  '',
  `Regenerate with \`node tools/build_source_index.mjs\`.`,
  '',
  '---',
  '',
  ...poolBlock('Direction pools', byDirection,
    'Pick the pool that matches the direction you chose in `design-directions.md`.'),
  '---',
  '',
  ...poolBlock('Section pools', byType,
    'Pick the pool that matches the section you are building right now.'),
  '---',
  '',
  '## Full table',
  '',
  '| # | id | Title | Section | Direction | Tone | Signals | Size |',
  '| --- | --- | --- | --- | --- | --- | --- | --- |',
  ...rows.map((r, i) =>
    `| ${i} | \`${r.id}\` | ${r.title} | ${r.type} | ${r.direction} | ${r.tone} | ${r.tags.join(' ') || '-'} | ${r.chars} |`),
  '',
].join('\n');

fs.writeFileSync(path.join(DIR, 'INDEX.md'), out, 'utf8');

console.log(`wrote INDEX.md — ${rows.length} cases`);
console.log(`  ${Object.keys(byDirection).length} direction pools, ${Object.keys(byType).length} section pools`);
const sizes = Object.entries(byDirection).sort((a, b) => b[1].length - a[1].length);
for (const [name, list] of sizes) console.log(`    ${String(list.length).padStart(3)}  ${name}`);
