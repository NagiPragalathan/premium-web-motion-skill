// Coverage diff: for every CSS feature / technique token, count how often the corpus uses it
// and whether the skill already documents it. Anything the corpus uses a lot and the skill
// never mentions is a gap.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.argv[2] || '.');
const CORPUS = path.join(ROOT, 'corpus', 'prompts');
const SKILL = path.join(ROOT, 'plugins', 'premium-web-motion-skill', 'skills', 'premium-web-motion-skill');

const corpusDocs = fs.readdirSync(CORPUS).filter(f => f.endsWith('.md'))
  .map(f => fs.readFileSync(path.join(CORPUS, f), 'utf8'));

function readAll(dir) {
  let out = '';
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out += readAll(p);
    else if (/\.(md|css|js|html)$/.test(e.name)) out += fs.readFileSync(p, 'utf8');
  }
  return out;
}
const skillText = readAll(SKILL);

// Everything worth checking: motion, layout, type, colour, effects, interaction, structure.
const FEATURES = [
  // motion mechanics
  'animation-fill-mode', 'animation-play-state', 'animation-direction', 'animation-delay',
  'steps\\(', 'infinite', 'alternate', 'forwards', 'backwards', 'will-change',
  'transition-delay', 'transform-origin', 'transform-style', 'perspective', 'backface-visibility',
  'translate3d', 'rotate3d', 'skewX', 'skewY', 'matrix\\(',
  // scroll
  'scroll-snap', 'scroll-behavior', 'overscroll', 'position: ?sticky', 'scrollIntoView',
  'IntersectionObserver', 'ResizeObserver', 'MutationObserver', 'requestVideoFrameCallback',
  'requestIdleCallback', 'getBoundingClientRect', 'offsetHeight', 'scrollYProgress',
  'useSpring', 'useMotionValue', 'useMotionTemplate', 'useVelocity', 'AnimatePresence',
  'layoutId', 'whileHover', 'whileTap', 'whileInView', 'variants', 'staggerChildren',
  // filters & compositing
  'backdrop-filter', 'mix-blend-mode', 'isolation', 'filter: ?blur', 'drop-shadow',
  'saturate\\(', 'brightness\\(', 'contrast\\(', 'grayscale\\(', 'sepia\\(', 'hue-rotate',
  'invert\\(', 'opacity\\(', 'feTurbulence', 'feDisplacementMap', 'feColorMatrix',
  'feGaussianBlur', 'feComposite', 'feMerge', 'feOffset', 'feBlend',
  // masking & shapes
  'mask-image', 'mask-composite', 'mask-size', 'mask-position', 'mask-repeat', 'clip-path',
  'polygon\\(', 'circle\\(', 'ellipse\\(', 'inset\\(', 'shape-outside', 'path\\(',
  'stroke-dasharray', 'stroke-dashoffset', 'pathLength', 'vector-effect',
  // gradients
  'linear-gradient', 'radial-gradient', 'conic-gradient', 'repeating-linear',
  'background-clip', 'bg-clip-text', 'background-blend-mode', 'background-attachment',
  'background-position', 'background-size',
  // layout
  'display: ?grid', 'grid-template', 'grid-area', 'subgrid', 'place-items', 'place-content',
  'aspect-ratio', 'object-fit', 'object-position', 'container-type', 'cqw', 'cqi', 'dvh', 'svh',
  'flex-col-reverse', 'order:', 'columns:', 'column-gap', 'gap:', 'inset:', 'z-index',
  'writing-mode', 'text-orientation', 'direction: ?rtl',
  // typography
  'letter-spacing', 'word-spacing', 'line-height', 'font-variation-settings', 'font-feature-settings',
  'font-variant-numeric', 'tabular-nums', 'text-wrap', 'text-balance', 'hyphens',
  'text-shadow', 'paint-order', '-webkit-text-stroke', 'font-display', 'text-transform',
  'white-space: ?nowrap', 'text-rendering', 'font-smoothing', 'clamp\\(',
  // colour & surface
  'box-shadow', 'inset 0', 'outline-offset', 'border-radius: ?999', 'accent-color',
  'color-mix', 'oklch', 'currentColor', 'rgba\\(255, ?255, ?255, ?0\\.0',
  // interaction / a11y
  'focus-visible', 'focus-within', ':has\\(', 'pointer-events', 'user-select', 'touch-action',
  'cursor: ?none', 'caret-color', 'aria-expanded', 'aria-hidden', 'aria-live', 'aria-current',
  'inert', 'tabindex', 'role=', 'prefers-reduced-motion', 'prefers-color-scheme',
  'hover: ?hover', 'pointer: ?coarse', 'max-aspect-ratio', 'orientation: ?portrait',
  // media
  'playsInline', 'preload=', 'poster=', 'crossOrigin', 'disablepictureinpicture',
  'disableRemotePlayback', 'canplay', 'loadeddata', 'timeupdate', 'currentTime', 'hls',
  'loading="lazy"', 'decoding=', 'srcset', 'picture>',
  // libs
  'gsap', 'ScrollTrigger', 'framer-motion', 'motion/react', 'lenis', 'three', 'spline',
  'lottie', 'rive', 'shaders', 'react-player', 'swiper', 'embla', 'canvas-confetti',
  // js patterns
  'requestAnimationFrame', 'cancelAnimationFrame', 'setProperty', 'matchMedia',
  'Element.animate', 'getAnimations', 'animationend', 'transitionend', 'passive: ?true',
  'toDataURL', 'createImageBitmap', 'OffscreenCanvas', 'createRadialGradient', 'globalCompositeOperation',
  'Web Animations', 'document.fonts', 'visibilitychange', 'DeviceOrientation',
];

const rows = [];
for (const f of FEATURES) {
  const re = new RegExp(f, 'i');
  const corpusHits = corpusDocs.filter(d => re.test(d)).length;
  const inSkill = re.test(skillText);
  if (corpusHits > 0) rows.push({ f: f.replace(/\\/g, ''), corpusHits, inSkill });
}

const gaps = rows.filter(r => !r.inSkill).sort((a, b) => b.corpusHits - a.corpusHits);
const covered = rows.filter(r => r.inSkill).length;

console.log(`checked ${FEATURES.length} features · ${rows.length} present in corpus · ${covered} documented · ${gaps.length} GAPS\n`);
console.log('=== GAPS (corpus uses it, skill never mentions it) ===');
for (const g of gaps) console.log(`${String(g.corpusHits).padStart(3)}  ${g.f}`);
