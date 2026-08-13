// Builds the skill's component index: every free MotionSites prompt tagged with the
// motion techniques it actually demonstrates, so the skill can route to a reference case.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.argv[2] || '.');
const DIR = path.join(ROOT, 'corpus', 'prompts');
const OUT = path.join(ROOT, 'plugins', 'premium-web-motion-skill', 'skills', 'premium-web-motion-skill', 'references', 'component-index.md');

// technique -> regexes that reliably indicate the prompt teaches it
const TECHNIQUES = {
  'video-bg': [/autoplay[^.]{0,40}loop|muted[,\s]+loop|looping (?:cloudfront|background) video|plate-video/i],
  'scroll-scrub-video': [/scroll.{0,20}scrub|scrub.{0,20}video|scroll.{0,15}(?:maps|→).{0,15}video timeline/i],
  'sticky-cinema': [/position: ?sticky[\s\S]{0,200}100vh|cinema-scroll|sticky stage|pinned stage/i],
  'parallax': [/parallax|useTransform\(scrollYProgress|different speed than the background/i],
  'scroll-reveal': [/IntersectionObserver|whileInView|useInView|scroll-triggered|enters? (?:the )?viewport/i],
  'char-scrub-text': [/char(?:acter)?[- ]by[- ]char(?:acter)?|AnimatedLetter|per-character opacity/i],
  'word-stagger': [/word[- ]by[- ]word|WordsPullUp|splits? .{0,20}by spaces/i],
  'line-clip-reveal': [/clip-path: ?inset\(100%|translate3d\(0, ?110%|line-reveal|overflow hidden[\s\S]{0,80}translateY\(1[01]0%/i],
  'blur-fade': [/blur\(\d+px\)[\s\S]{0,80}(?:opacity|translateY)|blurFadeUp|blur-in|filter.{0,30}blur\(10px\).{0,40}blur\(0/i],
  'scramble': [/scramble|random chars/i],
  'typewriter': [/typewriter|@keyframes blink/i],
  'marquee': [/marquee|translateX\(-50%\)[\s\S]{0,60}linear infinite|infinite scrolling/i],
  'counter': [/count[- ]up|animates? from 0 to|CountUp|odometer/i],
  'spotlight-mask': [/spotlight|maskImage|mask-image[\s\S]{0,120}cursor|reveal layer/i],
  'custom-cursor': [/custom cursor|follows? `?mousemove|cursor.{0,20}(?:trail|glyph)/i],
  'magnetic-hover': [/magnetic|lerp[\s\S]{0,80}mouse|inertia damping/i],
  'tilt-3d': [/3D (?:parallax )?tilt|perspective|preserve-3d|rotateX|rotateY/i],
  'waapi-entrance': [/Element\.prototype\.animate|Web Animations API|el\.animate\(\[/i],
  'css-entrance': [/@keyframes (?:fade|rise|reveal|hero|slide|scale)/i],
  'framer-motion': [/framer-motion|motion\/react|motion\.div|AnimatePresence/i],
  'gsap': [/GSAP|ScrollTrigger|power3\.out|xPercent/i],
  'canvas-raf': [/requestAnimationFrame[\s\S]{0,200}canvas|getContext\('2d'\)|<canvas/i],
  'state-machine-loop': [/state machine|phases?.{0,30}(?:p1|idle)|infinite.{0,20}cycle/i],
  'animated-gradient': [/animated gradient|gradient-shift|c5-blob|conic-gradient|aurora/i],
  'liquid-glass': [/liquid[- ]glass|glassmorphism|backdrop-(?:filter|blur)/i],
  'mobile-drawer': [/burger|hamburger[\s\S]{0,200}(?:overlay|drawer|sheet)|menu-open/i],
  'reduced-motion': [/prefers-reduced-motion/i],
  'locked-unit-system': [/calc\(100vh ?\/ ?\d{3,4}\)|--u:|height-locked/i],
  'infinite-carousel': [/carousel|infinite slider|clone[\s\S]{0,60}seamless|3 identical sets/i],
  'svg-draw': [/stroke-dashoffset|beam|animate.{0,20}path.{0,20}d=|gradient.{0,20}x1/i],
};

const files = fs.readdirSync(DIR).filter(f => f.endsWith('.md')).sort();
const rows = [];
const techCount = new Map();

for (const f of files) {
  const raw = fs.readFileSync(path.join(DIR, f), 'utf8');
  const meta = Object.fromEntries(
    [...raw.matchAll(/^(id|title|category|type|page_type|chars): (.*)$/gm)].map(m => [m[1], m[2].replace(/^"|"$/g, '')])
  );
  const tags = Object.entries(TECHNIQUES)
    .filter(([, res]) => res.some(re => re.test(raw)))
    .map(([t]) => t);
  tags.forEach(t => techCount.set(t, (techCount.get(t) || 0) + 1));
  rows.push({ ...meta, tags });
}

// group by technique for the reverse lookup
const byTech = new Map();
for (const r of rows) for (const t of r.tags) {
  if (!byTech.has(t)) byTech.set(t, []);
  byTech.get(t).push(r);
}

const md = [];
md.push('# Component index — 144 free MotionSites prompts');
md.push('');
md.push('Every free prompt on motionsites.ai, tagged with the motion techniques its spec actually');
md.push('demonstrates. Use this two ways:');
md.push('');
md.push('1. **"Which reference case teaches X?"** → jump to the reverse lookup below.');
md.push('2. **"What does prompt Y contain?"** → find it in the full table.');
md.push('');
md.push('Each row corresponds to `https://motionsites.ai` → the card with that title → *Copy prompt*.');
md.push('');
md.push('## Reverse lookup — technique → best reference cases');
md.push('');
md.push('| Technique | Count | Reference cases (richest first) |');
md.push('| --- | --- | --- |');
for (const [t, list] of [...byTech.entries()].sort((a, b) => b[1].length - a[1].length)) {
  const best = list.slice().sort((a, b) => Number(b.chars) - Number(a.chars)).slice(0, 6).map(r => r.id);
  md.push(`| \`${t}\` | ${list.length} | ${best.join(', ')} |`);
}
md.push('');
md.push('## Full catalog');
md.push('');
md.push('| Prompt id | Title | Category | Archetype | Size | Techniques |');
md.push('| --- | --- | --- | --- | --- | --- |');
for (const r of rows.sort((a, b) => (a.type || '').localeCompare(b.type || '') || a.id.localeCompare(b.id))) {
  md.push(`| ${r.id} | ${r.title} | ${r.category} | ${r.type} | ${r.chars} | ${r.tags.join(', ') || '—'} |`);
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, md.join('\n'), 'utf8');
console.log(`indexed ${rows.length} prompts across ${byTech.size} techniques`);
console.log([...techCount.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${v}\t${k}`).join('\n'));
