# Entrance choreography

The page-load cascade — the single highest-leverage piece of motion on any site. Three
implementations, the arming problem, and the traps.

---

## The arming problem (solve this first)

Naive entrance animations flash: the browser paints the finished page, *then* the JS runs and
snaps everything to its `from` state, *then* animates. The fix is a pre-paint guard.

```html
<head>
  <script>
    // BEFORE the stylesheet. If JS is off this class is never added,
    // so the complete page renders statically — that is the entire no-JS story.
    // Do not add a <noscript> block.
    (function () {
      var ok = !matchMedia('(prefers-reduced-motion: reduce)').matches
               && typeof Element.prototype.animate === 'function';
      if (!ok) return;
      document.documentElement.classList.add('entrance-pending');
      window.__entranceFallback = setTimeout(function () {
        document.documentElement.classList.remove('entrance-pending');
      }, 3500);
    })();
  </script>
  <link rel="stylesheet" href="styles.css">
</head>
```

```css
/* First-frame states — only while armed */
.entrance-pending .brand,
.entrance-pending .nav a,
.entrance-pending .sub,
.entrance-pending .cta { opacity: 0; will-change: transform, opacity; }

.entrance-pending .headline .line { transform: translate3d(0, 110%, 0) skewY(2deg); }
.entrance-pending .card         { opacity: 0; transform: translateY(12px) scale(.988); }

@media (prefers-reduced-motion: reduce) {
  .entrance-pending * {
    opacity: 1 !important; transform: none !important;
    clip-path: none !important; will-change: auto;
  }
}
```

Release on the **last** element's `animationend` (or `finished` promise), and clear the fallback:

```js
lastEl.addEventListener('animationend', function release() {
  document.documentElement.classList.remove('entrance-pending');
  clearTimeout(window.__entranceFallback);
}, { once: true });
```

The 3500ms fallback matters: if the last element is offscreen, display:none at that breakpoint,
or its font never loads, `animationend` never fires and the page stays invisible forever.

---

## Implementation A — CSS keyframes + delay classes

Simplest, no JS beyond the guard. Best for single-file HTML builds.

```css
@keyframes rise {
  from { opacity: 0; transform: translateY(var(--rise, 16px)); }
  to   { opacity: 1; transform: none; }
}
@keyframes rise-blur {
  from { opacity: 0; transform: translateY(24px) scale(.98); filter: blur(6px); }
  to   { opacity: 1; transform: none;                        filter: blur(0);   }
}
@keyframes line-reveal {              /* parent needs overflow: hidden */
  from { transform: translate3d(0, 110%, 0) skewY(2deg); }
  to   { transform: translate3d(0, 0, 0)    skewY(0);    }
}
@keyframes fade { from { opacity: 0; } to { opacity: 1; } }

.anim        { animation-duration: 800ms;
               animation-timing-function: var(--ease-out-expo);
               animation-fill-mode: backwards;          /* see the trap below */
               animation-delay: var(--d, 0ms); }
.anim-rise   { animation-name: rise; }
.anim-blur   { animation-name: rise-blur; }
.anim-line   { animation-name: line-reveal;
               animation-timing-function: var(--ease-out-quint); }
.anim-fade   { animation-name: fade; }

@media (prefers-reduced-motion: reduce) { .anim { animation: none; opacity: 1; } }
```

```html
<span class="brand anim anim-rise" style="--d:60ms;  --rise:7px"></span>
<a    class="nav   anim anim-rise" style="--d:130ms; --rise:6px"></a>
<h1><span class="line anim anim-line" style="--d:300ms">The Next Layer</span></h1>
<p    class="sub   anim anim-rise" style="--d:740ms; --rise:10px"></p>
<a    class="cta   anim anim-rise" style="--d:960ms; --rise:8px"></a>
```

### The `fill-mode` trap

`forwards` and `both` leave the final `transform` applied to the element **permanently**. A
non-`none` transform creates a containing block, which **silently disables `backdrop-filter` on
every descendant** — your liquid glass goes flat and opaque and you will not find out why.

- Entrance whose subtree contains glass → `animation-fill-mode: backwards`
  (applies the `from` state before start, releases everything on completion).
- No glass anywhere below → `both` is fine.

The corpus flags this explicitly: *"Using `both` or `forwards` leaves a transform on the element
after the animation ends, which breaks `backdrop-filter` on any child using `.liquid-glass`."*

---

## Implementation B — WAAPI timeline

Most controllable. Timing lives in one readable table, no CSS class explosion, and you get real
promises for sequencing.

```js
(function entrance() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !Element.prototype.animate) {
    return release();
  }
  const E = 'cubic-bezier(.16,1,.3,1)';       // expo-out
  const S = 'cubic-bezier(.22,1,.36,1)';      // quint-out
  const compact = matchMedia('(max-width: 699px)').matches;

  const steps = [
    ['.brand',    40,  820, E, { opacity: 0, transform: `translateY(${compact ? 14 : 12}px) scale(.988)` }],
    ['.badge',    120, 480, S, { opacity: 0, transform: 'translateY(8px)' }],
    ['#hl1',      240, 760, E, { opacity: 0, transform: `translateY(${compact ? 12 : 16}px)`, clipPath: 'inset(100% 0 0 0)' }],
    ['#hl2',      330, 760, E, { opacity: 0, transform: `translateY(${compact ? 12 : 16}px)`, clipPath: 'inset(100% 0 0 0)' }],
    ['#sub',      570, 560, E, { opacity: 0, transform: 'translateY(10px)' }],
    ['.cta',      930, 560, E, { opacity: 0, transform: 'translateY(8px)' }],
    ['.card',    1040, 920, S, { opacity: 0, transform: 'translateY(12px) scale(.968)' }],
  ];

  let last;
  for (const [sel, delay, duration, easing, from] of steps) {
    const el = document.querySelector(sel);
    if (!el) continue;
    const to = { opacity: 1, transform: 'none' };
    if (from.clipPath) to.clipPath = 'inset(0 0 0 0)';
    last = el.animate([from, to], { delay, duration, easing, fill: 'both' });
  }
  if (last) last.finished.then(release); else release();

  function release() {
    document.documentElement.classList.remove('entrance-pending');
    clearTimeout(window.__entranceFallback);
  }
})();
```

Note `fill: 'both'` is safe here **only** because WAAPI's fill lives on the animation object, not
as an inline style — but the composited transform still applies while filling. If glass sits
below, cancel the animation in `release()` after committing styles, or use `backwards`.

---

## Implementation C — Framer Motion / `motion/react`

React. Note the corpus increasingly imports from `motion/react` (Motion v11+), not `framer-motion`.

```tsx
const EXPO_OUT = [0.16, 1, 0.3, 1] as const;

// Shared variant — index-driven delay keeps the cascade in one place
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: EXPO_OUT },
  }),
};

<motion.h1 custom={0} variants={fadeUp} initial="hidden" animate="visible">…</motion.h1>
<motion.p  custom={1} variants={fadeUp} initial="hidden" animate="visible">…</motion.p>
<motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">…</motion.div>
```

Reusable in-view wrapper (fires once, the corpus default):

```tsx
export function FadeUp({
  children, delay = 0, duration = 0.7, y = 24, as = 'div', once = true, className, style,
}: FadeUpProps) {
  const Tag = motion[as];
  return (
    <Tag className={className} style={style}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: 0.2 }}
      transition={{ duration, delay, ease: EXPO_OUT }}
    >{children}</Tag>
  );
}
```

Container-level stagger (preferred over per-child delays for lists):

```tsx
const container = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
```

The blur-in variant that reads as expensive:

```tsx
initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }}
animate={{ filter: 'blur(0px)',  opacity: 1, y: 0 }}
transition={{ duration: 0.8, ease: 'easeOut' }}
```

---

## Cascade patterns

### Standard hero (the default — use this)

| Beat | Element | Delay | Duration | Move |
|---|---|---|---|---|
| 1 | brand | 60ms | 580ms | fade + up 7px + scale .94→1 |
| 2 | nav links | 130/175/220/265ms | 480ms | fade + up 6px |
| 2 | header CTA | 220ms | 520ms | fade + up 8px + scale .985 |
| 3 | headline line 1 | 300ms | 800ms | clip: `translateY(110%) skewY(2deg)` → 0 |
| 3 | headline line 2 | 440ms | 850ms | same |
| 4 | subcopy | 740ms | 620ms | fade + up 10px |
| 4 | primary CTA | 960ms | 560ms | fade + up 8px + scale .985 |
| 5 | hero card / media | 1040ms | 920ms | fade + up 12px + scale .968, origin `82% 50%` |
| 5 | logo strip | 340ms* | 1100ms | fade only |

\* the logo strip is the one exception — it fades early and slowly so it's settled by the time
the eye leaves the headline.

### Blur-fade-up (a simpler alternative, one keyframe for everything)

```css
@keyframes blurFadeUp {
  from { opacity: 0; filter: blur(20px); transform: translateY(40px); }
  to   { opacity: 1; filter: blur(0);    transform: translateY(0);    }
}
.animate-blur-fade-up { opacity: 0; animation: blurFadeUp 1s ease-out forwards; }
```

Every element gets an inline `animation-delay`, laddered 0 / 100 / 200 / 300ms. Lower ceiling
than the standard cascade, but very hard to get wrong.

### Splash gate (media-dependent pages)

Hold the entrance until the assets are actually ready, so the cascade never plays against a
grey box:

```
All entrance animations paused until `.is-ready` is added to the viewport element.
`.is-ready` fires when: both videos emit `loadeddata` AND document.fonts.ready resolves,
or a 5000ms timeout elapses — whichever comes first.
```

### Clip-path wipe (instead of a fade)

A wipe reads as *drawn* where a fade reads as *loaded*. The corpus uses it for headlines,
buttons and charts — anywhere a fade would feel generic.

```css
@keyframes wipe-right { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }
@keyframes wipe-up    { from { clip-path: inset(100% 0 0 0); } to { clip-path: inset(0 0 0 0); } }
@keyframes type-unmask{ from { opacity: 0; transform: translateY(16px);
                               clip-path: inset(0 0 96% 0); }
                        to   { opacity: 1; transform: none; clip-path: inset(0 0 0 0); } }
```

Corpus usages: CTA buttons wipe in from the left (`inset(0 100% 0 0)`), chart columns unmask
upward (`inset(100% 0 0 0)`), panels settle with a rounded inset
(`clip-path: inset(3% round 22px)` → none), and headlines combine a wipe with a translate.

`clip-path` is compositor-friendly, so this is as cheap as a transform. Note the corpus warning:
**don't put `clip-path` on a card that has a box-shadow** — it clips the shadow off.

### Splash / preloader gate

For media-heavy pages, hold the entrance until the assets are actually ready, so the cascade
never plays against a grey box.

```
All entrance animations are paused until `.is-ready` is added to the stage.
`.is-ready` fires when BOTH videos emit `loadeddata` AND document.fonts.ready resolves,
or a 5000ms timeout elapses — whichever comes first.
```

Three splash treatments from the corpus:

**Curtain split** — two rows of panels part vertically, then the splash hides:
```css
@keyframes splashTop    { from { transform: translateY(0); }  to { transform: translateY(-100%); } }
@keyframes splashBottom { from { transform: translateY(0); }  to { transform: translateY(100%); } }
@keyframes splashHide   { to { opacity: 0; visibility: hidden; } }
/* 1s cubic-bezier(0.96, -0.02, 0.38, 1.01) forwards — note the slight negative overshoot */
```

**Counter preloader** — a full-screen overlay counting `000 → 100` over 2700ms via
`requestAnimationFrame`, with a 3px progress bar underneath driven by `scaleX(count/100)` and a
soft glow. Then the overlay wipes away.

**Delayed reveal** — the simplest: a `showVideo` flag flips true after 2800ms, and the hero media
mounts then. Use only when you control the asset weight.

### Font-gated start

If the headline animation depends on final text metrics (a line mask, a clip reveal), a late font
swap will clip the wrong height. Gate on fonts, but never let a slow font stall the page:

```js
Promise.race([
  document.fonts.ready,
  new Promise(r => setTimeout(r, 650)),           // hard ceiling
]).then(() => requestAnimationFrame(() =>         // double RAF: let layout settle first
       requestAnimationFrame(startEntrance)));
```

### Word/letter cascade (editorial, portfolio)

```tsx
const letterBlock = {
  initial: { y: 120, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } },
};
// parent: staggerChildren 0.06, delayChildren 0.1
```

Reserve this for a single wordmark or a 2–4 word headline. Per-letter animation on a full
sentence looks like a toy.

---

## Exits — the half everyone forgets

An element that animates in and then vanishes instantly on removal breaks the illusion harder
than never animating at all. Nine corpus prompts use `AnimatePresence` specifically for this.

### The asymmetry rule

**Exits are faster than entrances and use a different curve.** In: `[0.22, 1, 0.36, 1]` at 450ms.
Out: `[0.55, 0, 1, 0.45]` at 350ms. An entrance decelerates into place; an exit should accelerate
away. A symmetric exit reads as reluctant.

```tsx
<AnimatePresence>
  {open && (
    <motion.div
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0,      transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }}
      exit=   {{ opacity: 0, x: '100%', transition: { duration: 0.35, ease: [0.55, 0, 1, 0.45] } }}
    />
  )}
</AnimatePresence>
```

Also: on exit, **collapse every stagger delay to 0**. Items should leave as one piece.

### `mode="wait"` — swapping content in place

The corpus's rotating-word pattern. The outgoing element finishes before the incoming one starts,
so they never overlap:

```tsx
<AnimatePresence mode="wait">
  <motion.span
    key={words[i]}                                  /* key change is what triggers the swap */
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0,  opacity: 1 }}
    exit=   {{ y: -20, opacity: 0 }}                /* leaves upward — continues the motion */
    transition={{ duration: 0.35, ease: EXPO_OUT }}
  >{words[i]}</motion.span>
</AnimatePresence>
```

Cycle every 900ms. The `key` is mandatory — without it React reuses the node and nothing animates.
Note the direction: in from below, out through the top. Reversing the exit makes it bounce.

Same pattern for a CTA that toggles between form and success state, and for a status banner that
tracks a changing value.

### Gating content on media

```tsx
{canPlay && <motion.div initial={{opacity:0}} animate={{opacity:1}}>…</motion.div>}
// onCanPlay={() => setCanPlay(true)} on the <video>
```

Hero content mounts only once the video can play, so the composition never appears against a
black rectangle. Pair with the asset-gated start above.

### `whileHover` / `whileTap`

The declarative interaction props, used in 11 corpus prompts. Measured values:

| Prop | Corpus values | Note |
|---|---|---|
| `whileHover` | `scale: 1.02` · `1.03` · `1.05` | 1.05 only on small pills; 1.02 on anything large |
| `whileTap` | `scale: 0.9` · `0.95` · `0.97` · `0.98` | tighter than the hover delta, always |

```tsx
<motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} />
```

These are the right default in React — they handle pointer capture, interruption and reduced
motion better than hand-rolled CSS state. But they do **not** respect `@media (hover: hover)`,
so on touch devices `whileHover` can latch; gate it yourself if the component ships to mobile.

### CSS-only exits

Without a framework, an element must stay mounted to animate out. Toggle a class and drive
`visibility` alongside opacity so it leaves the a11y tree at the end:

```css
.overlay { opacity: 0; visibility: hidden;
           transition: opacity 350ms var(--ease-exit), visibility 0s linear 350ms; }
.overlay.is-open { opacity: 1; visibility: visible;
                   transition: opacity 450ms var(--ease-out-quint), visibility 0s; }
```

The `visibility` transition delay is the trick: on the way in it applies immediately, on the way
out it waits for the fade to finish.

---

## Traps

| Trap | Symptom | Fix |
|---|---|---|
| `fill-mode: forwards/both` above glass | `backdrop-filter` renders opaque | use `backwards` |
| No pre-paint guard | finished page flashes then snaps | arm in `<head>` before CSS |
| Release tied to an element that may not render | page stays invisible | 3500ms fallback timeout |
| Cascade replays on resize | jarring re-animation | run once, guard with a flag |
| Background media in the cascade | reads as a slow page load | the stage never animates in |
| Uniform delay across 12 elements | metronomic, cheap | group into ≤5 beats |
| `will-change` left on permanently | memory bloat, blurry text on some GPUs | clear it in `release()` |
| Animating `top`/`left`/`width` | jank | only `transform`, `opacity`, `filter`, `clip-path` |
