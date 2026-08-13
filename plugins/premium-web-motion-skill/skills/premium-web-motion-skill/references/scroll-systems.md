# Scroll systems

Everything driven by scroll position: reveals, parallax, pinned stages, scrubbed video, and the
cinematic multi-phase rig. Ordered from "use this on every project" to "use this once a year".

---

## The two scroll models

**Trigger model** — an element crosses a threshold, an animation plays to completion on its own
clock. Reveals, counters, in-view fades. Cheap, robust, works everywhere. **Default to this.**

**Scrub model** — scroll position *is* the animation timeline; scrolling back rewinds. Parallax,
pinned stages, scrubbed video. Expensive, needs smoothing, needs a reduced-motion path.

Mixing them on one element is the most common source of scroll jank. Pick one per element.

---

## 1. Reveal on enter (use on every project)

The single most reused pattern in the corpus — 28 of 144 prompts.

```js
const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    e.target.classList.add('is-visible');
    io.unobserve(e.target);            // fires ONCE — never re-animate on scroll-back
  }
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));
```

```css
[data-reveal] {
  opacity: 0; transform: translateY(28px);
  transition: opacity 700ms var(--ease-out-expo) var(--d, 0ms),
              transform 700ms var(--ease-out-expo) var(--d, 0ms);
  will-change: transform, opacity;
}
[data-reveal].is-visible { opacity: 1; transform: none; }
@media (prefers-reduced-motion: reduce) {
  [data-reveal] { opacity: 1; transform: none; transition: none; }
}
```

```html
<div data-reveal style="--d:0ms">…</div>
<div data-reveal style="--d:120ms">…</div>
<div data-reveal style="--d:240ms">…</div>
```

**Calibration**

| Knob | Value | Why |
|---|---|---|
| `threshold` | `0.15` | fires when the element is meaningfully on screen, not at 1px |
| `rootMargin` bottom | `-40px` to `-100px` | delays the trigger so it doesn't fire mid-scroll-into-view |
| Duration | 700ms | corpus standard for reveals (shorter than the 800ms entrance) |
| Stagger | `150 + i * 120`ms | content blocks |
| Fires | once | `unobserve`, or Framer `viewport={{ once: true }}` |

Framer equivalent: `whileInView={{...}} viewport={{ once: true, margin: '0px 0px -60px 0px' }}`
or `useInView(ref, { once: true, margin: '-50px' })`.

**Two thresholds, two jobs** — a common corpus pattern is observing the same element twice:
`threshold: 0.6` to mark the active nav item, `threshold: 0.15` to fire the reveal.

---

## 2. Smoothed scroll progress (the foundation for everything scrubbed)

Never read `scrollY` and write styles in the scroll handler. Read in the handler, write in RAF,
and lerp between them. This is what separates smooth parallax from stuttering parallax.

```js
let target = 0, smooth = 0, raf = null;
const reduce = matchMedia('(prefers-reduced-motion: reduce)');

function onScroll() {
  target = window.scrollY;
  if (!raf) raf = requestAnimationFrame(tick);
}
window.addEventListener('scroll', onScroll, { passive: true });   // passive is mandatory

function tick() {
  raf = null;
  smooth = reduce.matches ? target : smooth + (target - smooth) * 0.12;
  if (Math.abs(smooth - target) < 0.08) smooth = target;          // settle, then stop
  render(smooth);
  if (smooth !== target) raf = requestAnimationFrame(tick);       // stop the loop when idle
}
```

**Lerp factors, measured**

| Factor | Feel | Use |
|---|---|---|
| `0.04` | very heavy, floaty | distant parallax clouds |
| `0.06` | heavy | background layers |
| `0.10–0.12` | balanced | pointer tracking, general |
| `0.14` | responsive | scroll position in a cinema rig |
| `0.20` | tight | cursor head of a trail |
| `0.35` | near-instant | trailing cursor segments |

The idle-stop matters: an unconditional `requestAnimationFrame` loop burns battery and keeps the
compositor awake for the life of the page.

### Section progress math

```js
// 0 → 1 as the section travels through the viewport
const r = section.getBoundingClientRect();
const progress = clamp((window.innerHeight - r.top) / (window.innerHeight + r.height), 0, 1);

// 0 → 1 across a pinned/sticky rig of known height
const scrolled = clamp(-section.getBoundingClientRect().top, 0,
                        section.offsetHeight - window.innerHeight);

// whole-page progress
const pageProgress = clamp(scrollY / (document.body.scrollHeight - innerHeight), 0, 1);
```

### The three shaping functions

```js
const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const lerp  = (a, b, t) => a + (b - a) * t;
const smoothstep = (e0, e1, v) => { const x = clamp((v - e0) / (e1 - e0)); return x * x * (3 - 2 * x); };

// A phase that fades in over [a,b] and out over [c,d] — the workhorse of multi-phase rigs
const segmentInOut = (s, a, b, c, d) => {
  const enter = smoothstep(a, b, s), exit = smoothstep(c, d, s);
  return { enter, exit, active: enter * (1 - exit) };
};
```

`smoothstep` instead of raw linear progress is most of what makes a scrub feel authored rather
than mechanical. Raise it to a power for acceleration: `Math.pow(enter, 1.5)` for a layer that
should hold still then commit.

---

## 3. Parallax

### CSS-variable parallax (vanilla)

```js
function render(scroll) {
  const p = clamp((innerHeight - el.getBoundingClientRect().top) / (innerHeight + el.offsetHeight));
  root.style.setProperty('--pl-back',  `${lerp(120, -160, p)}px`);   // far layer, big travel
  root.style.setProperty('--pl-mid',   `${lerp(60,   -80, p)}px`);
  root.style.setProperty('--pl-front', `${lerp(20,   -30, p)}px`);   // near layer, small travel
}
```

```css
.layer-back  { transform: translate3d(0, var(--pl-back), 0); will-change: transform; }
```

### Framer Motion parallax

```tsx
const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
const y      = useTransform(scrollYProgress, [0, 1], ['120px', '-120px']);
const grassY = useTransform(scrollYProgress, [0, 1], isMobile ? ['80px', '-40px'] : ['200px', '-200px']);
```

### Rules

- **Three layers maximum.** Beyond that nobody perceives the depth, and you're paying for it.
- **Far moves more.** Back `±160px`, mid `±80px`, front `±30px`. Inverting this reads as broken.
- **Halve the travel on mobile.** `200px` desktop → `80px` mobile is the corpus ratio.
- **`translate3d`, always.** Plus `will-change: transform` on the moving layer only.
- Pointer parallax stacks on scroll parallax additively and is stronger on near layers:
  `--back-x: ${mouseX * -12}px` for the far plate, `${mouseX * 22}px` for the foreground.

### Pointer parallax

```js
window.addEventListener('pointermove', (e) => {
  targetMouseX = e.clientX / innerWidth  - 0.5;   // -0.5 … 0.5
  targetMouseY = e.clientY / innerHeight - 0.5;
  requestTick();
}, { passive: true });
// then per frame: mouseX = lerp(mouseX, targetMouseX, 0.12)
// reduced motion: force both to 0
```

---

## 4. Scroll-linked marquee

Horizontal image rows that move with scroll direction rather than on a timer — reads as a
deliberate mechanism instead of an ambient loop.

```js
const offset = (window.scrollY - sectionTop + window.innerHeight) * 0.3;
row1.style.transform = `translateX(${ offset - 200}px)`;   // moves right
row2.style.transform = `translateX(${-(offset - 200)}px)`; // moves left
```

Triple the tile array so the row never runs out. Tiles `420×270`, `gap-3`, `object-cover`,
`loading="lazy"`, `will-change: transform`, scroll listener `{ passive: true }`.

---

## 5. Scroll-scrubbed video

Scroll position drives `video.currentTime`. Cinematic, expensive, needs care.

```js
const dur = video.duration;
let targetT = 0, smoothT = 0;

function onScroll() {
  const p = clamp(scrollY / (document.body.scrollHeight - innerHeight));
  targetT = p * dur;
  requestTick();
}
function render() {
  smoothT += (targetT - smoothT) * 0.12;
  video.currentTime = smoothT;
}
```

**Requirements**

- The video must be encoded with a **dense keyframe interval** (`-g 1` or every ~5 frames).
  Seeking a normally-encoded MP4 is unusably slow.
- Keep it short and small: 5–10s, ≤1920px wide, ideally <5MB.
- Provide a `poster` and crossfade `poster → video` over 500ms once `loadeddata` fires.
- **Do not also autoplay-loop it.** Scrubbed and looping are mutually exclusive.
- iOS Safari needs `playsinline muted preload="auto"`, and a user-gesture unlock before
  `currentTime` writes are honored — fall back to a static poster if the unlock never happens.
- Higher-fidelity variant: draw each frame into a `<canvas>` with object-cover math
  (scale to max, center crop) and crossfade `poster → video → canvas` over 500ms.

### Seamless-loop video (much more common, much cheaper)

Most "cinematic video hero" work is just a fading loop:

```
On canplay:   play, then fade opacity 0 → 1 over 500ms via requestAnimationFrame
On timeupdate: when (duration - currentTime) <= 0.55s, fade 1 → 0 over 550ms
On ended:      opacity 0, wait 100ms, currentTime = 0, play(), fade back to 1
```

This hides an imperfect loop point behind a crossfade to black. Do the fade in JS, not with a
CSS transition — CSS transitions fight the `timeupdate` cadence.

---

## 6. Sticky cinema rig (the multi-phase scroll story)

The most advanced pattern in the corpus. A tall scroll container holds a `sticky` stage; scroll
distance inside it drives a phase machine across layered images.

### Structure

```css
.cinema-scroll { position: relative; height: calc(100vh + 3700px); }
.stage {
  position: sticky; top: 0; height: 100vh; min-height: 620px;
  overflow: hidden; isolation: isolate;
}
/* every layer inside .stage is position: absolute, driven by CSS variables */
.back-stack {
  transform: translate3d(var(--back-x), var(--back-y), 0) scale(var(--back-scale));
  transform-origin: 50% 100%;
  will-change: transform, filter, opacity;
}
```

The `3700px` is the choreography budget: how much scroll the story consumes. Divide it into
phases with `segmentInOut` and give each phase ~600–1000px.

### Per-frame engine

```js
const s = smoothScroll;                                    // lerped, factor 0.14
const frame2   = segmentInOut(s,  560,  900, 1300, 1620);
const frame3   = segmentInOut(s, 1760, 2140, 2540, 2700);
const progress = clamp(s / 2700);
const introExit = smoothstep(90, 650, s);
const enter    = Math.pow(smoothstep(2760, 3560, s), 1.55); // eased late entrance

// compose the shared camera move, then add per-layer offsets
const backScale    = 0.76 + progress * 0.2 + frame2.enter * 0.18 + frame3.enter * 0.16;
const sharedHeroY  = progress * -74;
const blurActive   = clamp(frame2.active + frame3.active);

root.style.setProperty('--back-scale',  backScale);
root.style.setProperty('--blur-px',     `${blurActive * 14}px`);
root.style.setProperty('--back-brightness', 1 - blurActive * 0.255);
root.style.setProperty('--title-y',     `${introExit * -210}px`);
root.style.setProperty('--title-opacity', 1 - introExit);
root.style.setProperty('--bridge-width', `${67.2 + frame2.enter * 37.8}vw`);
```

### Design rules

- **One shared camera, many local offsets.** Compute `progress`-driven scale/Y once; every layer
  adds its own delta. Layers that each compute their own camera drift apart and look broken.
- **Depth cues are more than position**: as a phase engages, ramp global `blur` to ~14px, drop
  `brightness` ~25%, and raise a color shade gradient. Motion alone reads flat.
- **Write CSS variables, not styles.** One `setProperty` batch per frame; CSS owns composition.
- **Counter-scale foreground UI**: `--sights-scale: calc(1 / var(--back-scale))` keeps cards
  screen-true while the stage keeps zooming.
- **Reduced motion**: bypass the lerp (values snap), force pointer offsets to 0, disable layer
  transitions. The composition still scrubs — it just loses inertia. Don't disable it entirely;
  the page has no other content.
- Write the acceptance criteria as a phase table (`0–650px: title rises -210px while scaling to
  0.92 and fading`) — that's what makes it reproducible.

---

## 7. Phase-based pinned panel (RAF, not scroll events)

For a panel that slides up, pins, then releases:

```
Phase 1 (scrollY 0 → vh):        panel slides up; children computed with panelOffset = vh - scrollY
Phase 2 (scrollY > vh):          panel fixed at top; inner wrapper translateY(-(scrollY - vh))
Outro   (scrollY > vh + maxScroll): white overlay fades in, product info slides up,
                                 button scales 0 → 1, footer fades in.
                                 progress = (scrollY - vh - maxScroll) / (vh - 100)
```

Cards use `transform: scale(0)` initially with `transform-origin` set by grid half — left-half
cards `right bottom`, right-half cards `left bottom` — so they bloom outward from the center.

---

## 8. Scroll-driven text (see also `text-effects.md`)

```tsx
const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.8', 'end 0.2'] });
// per character i of n:
const charProgress = i / n;
const start = Math.max(0, charProgress - 0.1);
const end   = Math.min(1, charProgress + 0.05);
const opacity = useTransform(scrollYProgress, [start, end], [0.2, 1]);
```

The `offset: ['start 0.8', 'end 0.2']` is the corpus standard: begins when the block's top hits
80% down the viewport, completes when its bottom reaches 20%.

---

## Performance rules

| Rule | Why |
|---|---|
| Scroll listeners `{ passive: true }` | non-passive blocks the compositor thread |
| Read in the handler, write in RAF | avoids layout thrash |
| Guard RAF with a `rafPending` flag | one frame request per frame, not per event |
| Stop the loop at rest | `if (smooth !== target) requestAnimationFrame(tick)` |
| `transform`/`opacity`/`filter` only | anything else triggers layout |
| `will-change` on moving layers only, removed after | each one costs a compositor layer |
| Batch `setProperty` calls on `:root` | one style recalc per frame |
| `IntersectionObserver` over scroll math for triggers | runs off the main thread |
| `loading="lazy"` on offscreen media | |
