// Mines the MotionSites corpus for motion-design signal: prompt section schema,
// animation vocabulary, easing curves, timing values and library usage.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.argv[2] || '.');
const DIR = path.join(ROOT, 'corpus', 'prompts');
const files = fs.readdirSync(DIR).filter(f => f.endsWith('.md'));
const docs = files.map(f => ({ id: f.replace(/\.md$/, ''), text: fs.readFileSync(path.join(DIR, f), 'utf8') }));
const all = docs.map(d => d.text).join('\n');

const countDocs = (re) => docs.filter(d => re.test(d.text)).length;
const tally = (re, norm = s => s) => {
  const map = new Map();
  for (const m of all.matchAll(re)) {
    const k = norm(m[1] ?? m[0]);
    if (!k) continue;
    map.set(k, (map.get(k) || 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
};

const out = [];
const push = (title, lines) => out.push(`\n## ${title}\n` + lines.join('\n'));

// 1. Prompt section headings (ALL-CAPS banner lines above box-drawing rules)
const headings = tally(/\n([A-Z][A-Z0-9 &/()\-—,.'’+:]{5,60})\n[═─=]{5,}/g, s => s.trim());
push('Prompt section headings (top 60)', headings.slice(0, 60).map(([k, v]) => `${v}\t${k}`));

// 2. Library / runtime usage
const libs = ['GSAP', 'ScrollTrigger', 'ScrollSmoother', 'SplitText', 'Lenis', 'Three\\.js', 'THREE', 'Framer Motion',
  'anime\\.js', 'Lottie', 'Motion One', 'Locomotive', 'Swiper', 'Barba', 'p5\\.js', 'matter\\.js', 'Rive',
  'IntersectionObserver', 'requestAnimationFrame', 'Web Animations API', 'WebGL', 'canvas', 'SVG filter',
  'View Transition', 'scroll-timeline', 'animation-timeline', 'view-timeline', 'position: ?sticky', 'will-change',
  'backdrop-filter', 'mix-blend-mode', 'clip-path', 'mask-image', 'conic-gradient', 'text-shadow', 'perspective',
  'preserve-3d', 'prefers-reduced-motion', 'font-variation-settings', 'matchMedia', 'aspect-ratio', 'clamp\\('];
push('Feature / library presence (docs out of 144)', libs.map(l => {
  const re = new RegExp(l, 'i');
  return [countDocs(re), l.replace(/\\/g, '')];
}).sort((a, b) => b[0] - a[0]).map(([c, l]) => `${c}\t${l}`));

// 3. Easing curves
const eases = tally(/cubic-bezier\(([^)]{3,60})\)/gi, s => s.replace(/\s+/g, ''));
push('cubic-bezier curves (top 40)', eases.slice(0, 40).map(([k, v]) => `${v}\tcubic-bezier(${k})`));
const namedEase = tally(/\b(ease-in-out|ease-out|ease-in|linear|steps\([^)]+\)|power[1-4]\.(?:in|out|inOut)|expo\.(?:in|out|inOut)|elastic\.(?:in|out|inOut)|back\.(?:in|out|inOut)|circ\.(?:in|out|inOut)|sine\.(?:in|out|inOut))\b/gi);
push('Named eases (top 30)', namedEase.slice(0, 30).map(([k, v]) => `${v}\t${k}`));

// 4. Durations
const durMap = new Map();
for (const m of all.matchAll(/\b(\d+(?:\.\d+)?)\s?(ms|s)\b/g)) {
  const ms = m[2] === 's' ? parseFloat(m[1]) * 1000 : parseFloat(m[1]);
  if (ms <= 0 || ms > 20000) continue;
  durMap.set(ms, (durMap.get(ms) || 0) + 1);
}
push('Durations in ms (top 40 by frequency)', [...durMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 40).map(([k, v]) => `${v}\t${k}ms`));

// 5. Keyframe names
const kf = tally(/@keyframes\s+([A-Za-z0-9_-]+)/g);
push('@keyframes names (top 60)', kf.slice(0, 60).map(([k, v]) => `${v}\t${k}`));

// 6. Motion vocabulary
const vocab = ['parallax', 'scrub', 'stagger', 'marquee', 'ticker', 'magnetic', 'custom cursor', 'reveal', 'wipe',
  'mask reveal', 'blur', 'fade-up', 'count-up', 'counter', 'odometer', 'tilt', 'sticky', 'pin', 'scroll-driven',
  'infinite loop', 'aurora', 'grain', 'noise', 'shimmer', 'glow', 'orbit', 'ripple', 'morph', 'liquid', 'gooey',
  'glassmorphism', 'kinetic typography', 'letter-by-letter', 'word-by-word', 'typewriter', 'scramble', 'draw',
  'stroke-dashoffset', 'spring', 'inertia', 'lerp', 'horizontal scroll', 'snap', 'accordion', 'carousel',
  'hover', 'focus-visible', 'skeleton', 'confetti', 'particles', 'starfield', 'gradient mesh', 'displacement',
  'marquee', 'bento', 'spotlight', 'radial gradient', 'vignette', 'letter-spacing', 'entrance', 'idle', 'loop'];
push('Motion vocabulary (docs containing)', [...new Set(vocab)].map(v => {
  const re = new RegExp(v.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i');
  return [countDocs(re), v];
}).sort((a, b) => b[0] - a[0]).map(([c, v]) => `${c}\t${v}`));

// 7. Fonts
const fonts = tally(/font-family:\s*['"]?([A-Za-z0-9 _-]{2,30})['"]?/gi, s => s.trim());
push('Fonts (top 40)', fonts.slice(0, 40).map(([k, v]) => `${v}\t${k}`));

// 8. Docs with the richest ANIMATION sections
const animBlocks = docs.map(d => {
  const idx = [...d.text.matchAll(/\n([A-Z][A-Z0-9 &/()\-—,.'’+:]*(?:ANIMATION|MOTION|INTERACTION|SCROLL)[A-Z0-9 &/()\-—,.'’+:]*)\n/g)];
  return { id: d.id, hits: idx.length, names: idx.map(m => m[1].trim()) };
}).filter(x => x.hits).sort((a, b) => b.hits - a.hits);
push('Docs with explicit ANIMATION/MOTION/SCROLL sections', animBlocks.map(x => `${x.hits}\t${x.id}\t${[...new Set(x.names)].join(' | ')}`));

fs.writeFileSync(path.join(ROOT, 'corpus', 'ANALYSIS.txt'), out.join('\n'), 'utf8');
console.log('wrote corpus/ANALYSIS.txt', out.join('\n').length, 'chars');
