# Responsive, accessibility & performance

The unglamorous half. It is also the half that decides whether the motion survives contact with
real devices.

---

## 1. The height-locked unit system

For a **locked single-viewport composition** — a hero that must never scroll and must fill the
screen exactly, on any display. This is how the corpus reproduces a Figma comp to the pixel.

```css
:root {
  --u:  calc(100vh / 1058);          /* one design px, locked to HEIGHT */
  --uw: calc(100vw / 1487);          /* one design px, locked to width  */
  --h:  clamp(var(--u),
              calc(var(--u) * .65 + var(--uw) * .35),
              calc(var(--u) * 1.16));   /* type unit: grows ≤16% on ultrawide, never shrinks */
}
@supports (height: 100dvh) { :root { --u: calc(100dvh / 1058); } }
```

Reference canvas `1487 × 1058`. Then **every** value is expressed in those units:

```css
.brand    { left: calc(75 * var(--u));    top: calc(27 * var(--u));
            width: calc(31.5 * var(--u)); height: calc(48.5 * var(--u)); }
.headline { left: calc(75.5 * var(--u));  top: calc(230.5 * var(--u));
            font-size: calc(71.6 * var(--h)); line-height: calc(80.5 * var(--h)); }
.logos    { top: calc(994.7 * var(--u)); }
```

**Why height-locked and not width-locked:** the composition's job is to fill the viewport
vertically without scrolling. Lock to height and the vertical rhythm always resolves; the `--h`
blend then lets type grow a little on wide screens so it doesn't look lost.

`100dvh` matters on mobile: `100vh` includes the collapsing browser chrome, so a `vh`-locked
layout jumps when the URL bar hides.

### Portrait switch

Below a certain aspect ratio, abandon absolute positioning entirely and flow:

```css
@media (max-aspect-ratio: 11/10) {
  :root { --m: min(100vw / 430, 1.34px); --u: var(--m); }
  .stage { display: flex; flex-direction: column; }   /* absolute → flow */
}
@media (min-width: 600px) and (max-aspect-ratio: 11/10) {
  :root { --m: min(100vw / 860, 100vh / 760, 1.25px); }   /* tablet band */
}
```

Aspect-ratio queries beat width queries here: a 1024px-wide tablet in portrait needs the phone
layout, and a 700px landscape phone needs the desktop one.

### Container queries — scale a component, not a page

When a component must scale as a unit regardless of where it's placed (a phone mockup, a demo
card, a chart panel), size it against its own container instead of the viewport:

```css
.scene      { container-type: size; }          /* both axes — needs a fixed height */
.demo-card  { container-type: inline-size;     /* width only — the common case */
              aspect-ratio: 201 / 265; }

.scene .title { font-size: 4.2cqw; }           /* 1cqw = 1% of the container's width */
.scene .icon  { filter: drop-shadow(0 0 .075cqw #fff); }
```

`cqw` / `cqh` / `cqi` behave like `vw`/`vh` but resolve against the nearest container. Three
corpus prompts size an entire composition this way — the same markup then renders correctly at
360px and at 1440px with no breakpoints at all.

`container-type: size` requires a determinate height (give it one, or `aspect-ratio`), and it
creates containment — children can no longer influence the container's size.

### When NOT to use this

Any page that scrolls. For normal pages use `clamp()`:

```css
font-size: clamp(44px, 13vw, 64px);     /* min, preferred (viewport-relative), max */
padding:   clamp(24px, 5vw, 80px);
gap:       clamp(24px, 2.2vw, 44px);
```

One `clamp()` beats four breakpoint overrides — it's fluid between the bounds instead of
stepping, and there's one number to change.

---

## 2. Breakpoints

The corpus is Tailwind-shaped:

| Name | Width | Typical change |
|---|---|---|
| base | 0 | single column, drawer nav, half the motion |
| `sm` | 640px | two columns, larger type |
| `md` | 768px | desktop nav appears, drawer retires |
| `lg` | 1024px | full layout, custom cursor enabled |
| `xl` | 1280px | wider gutters, larger media |

Plus two special queries used constantly:

```css
@media (hover: hover) and (pointer: fine) { /* real pointer only */ }
@media (max-height: 700px) { /* short laptop — tighten hero vertical spacing */ }
```

The `max-height` one is routinely forgotten and is why heroes overflow on 13" laptops.

---

## 3. Mobile drawer choreography

A drawer is five coordinated animations, not one. Spec all five.

```
Burger → X:      each bar rotates ±45° with translateY ±6.5px, 300ms
                 (or: menu icon rotate-90 scale-0 opacity-0, X icon reverse — 300ms crossfade)
Backdrop:        fixed inset-0, rgba(0,0,0,0.62) + blur(6px), fade 280–300ms
Panel:           translateX(100%) → 0, 450–500ms cubic-bezier(0.22, 1, 0.36, 1)
                 (or a centered sheet: radius 28px, shadow 0 20px 60px rgba(0,0,0,.45), 380ms)
Links:           staggered opacity + translateX(32px) → 0, 500ms, delay 150 + i*70ms
                 (closing: all delays → 0ms, so it shuts as one piece)
Footer/CTA:      same, delay 400ms
```

**Behavior**

```
Open:  document.body.style.overflow = 'hidden'   (scroll lock)
       aria-expanded="true", focus the first link
Close: click backdrop · Escape · any link click · resize past the breakpoint
       set `inert` (or aria-hidden) on the panel when closed
Exit:  faster than enter — 350ms vs 450ms, easing cubic-bezier(0.55, 0, 1, 0.45)
```

The asymmetric close (`delay: 0` on every item) is what makes it feel decisive. Staggering the
close makes the drawer feel reluctant to leave.

---

## 4. Reduced motion

Mandatory. 21 corpus prompts specify it explicitly, and the correct interpretation is narrow:

> **`reduce` means: show the finished state immediately. It does not mean "faster".**

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  .entrance-pending * { opacity: 1 !important; transform: none !important; clip-path: none !important; }
}
```

And in JS:

```js
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
if (reduce.matches) {
  releaseEntrance();       // skip the cascade, don't run it fast
  smooth = target;         // scroll values snap, no lerp
  mouseX = mouseY = 0;     // no pointer parallax
  return;
}
reduce.addEventListener('change', handleChange);   // users toggle this mid-session
```

**Checklist**

| Keep | Remove |
|---|---|
| Layout, colors, all content | Entrance cascades |
| Instant state changes (menu opens) | Parallax, lerp smoothing |
| Video with controls, if it's content | Autoplaying ambient loops |
| Focus indicators | Marquees, gradient drift, float |
| Scroll position → composition, unstuck | Scroll *inertia* and pointer drift |

A cinematic scroll page shouldn't be disabled wholesale under `reduce` — it has no other content.
Snap the values instead of lerping: the story still scrubs, it just loses the inertia.

---

## 5. Accessibility beyond motion

```html
<nav aria-label="Primary">
<button aria-expanded="false" aria-controls="menu" aria-label="Open menu">
<video aria-hidden="true">           <!-- decorative -->
<img alt="">                          <!-- decorative -->
<section aria-label="Mostar cinematic scroll story">
```

```css
:focus-visible { outline: 2px solid #fff; outline-offset: 3px; }
```

- **Never** `outline: none` without a replacement.
- Contrast: 4.5:1 body, 3:1 large text — over video this means the fade overlay is an
  accessibility feature, not decoration. Check contrast against the *brightest* video frame.
- Hover-only information must also be reachable by focus or tap.
- Tap targets 44×44px minimum.
- Respect `prefers-color-scheme` if you offer both themes; define light tokens on bare `:root`.

---

## 6. Performance

### The property rule

Animate **only** `transform`, `opacity`, `filter`, and `clip-path`. Everything else
(`top`, `left`, `width`, `height`, `margin`, `background-position`) triggers layout or paint on
every frame.

### Cleanup — the leak nobody catches

Every RAF loop, observer and listener must be torn down, or a client-side route change leaves
them running forever against detached nodes:

```js
// React
useEffect(() => {
  let raf = requestAnimationFrame(tick);
  const ro = new ResizeObserver(onResize);
  ro.observe(el);
  window.addEventListener('pointermove', onMove, { passive: true });
  return () => {
    cancelAnimationFrame(raf);          // ← the one that gets forgotten
    ro.disconnect();
    io.disconnect();
    window.removeEventListener('pointermove', onMove);
  };
}, []);
```

`ResizeObserver` over a `resize` listener whenever you're measuring an *element* — it fires when
the element changes for any reason (a sibling reflows, a font lands), which a window listener
never sees. Corpus rigs recompute SVG path geometry and slider offsets this way.

### Don't animate what shouldn't be grabbed

Moving imagery invites accidental text-selection and drag-ghosts. Every corpus scene layer sets:

```css
.scene-img { user-select: none; -webkit-user-drag: none; pointer-events: none; }
```

`pointer-events: none` on decorative layers also stops them from stealing hover from the UI above.
Scroll spacers get `user-select: none` for the same reason.

### `will-change`

```css
.moving { will-change: transform, opacity; }
```

On elements that are *about to* move, removed once they stop. Each one costs a compositor layer;
a page with `will-change` on 40 elements is slower than one with none.

### Scroll

```js
window.addEventListener('scroll', onScroll, { passive: true });
// read in the handler → write in requestAnimationFrame → stop the loop at rest
```

### Media

| Asset | Rule |
|---|---|
| Hero video | ≤5MB, 1920×1080, H.264, 5–15s, `preload="auto"`, always a `poster` |
| Scrubbed video | dense keyframes (`-g 1`), ≤10s, smaller resolution |
| Offscreen media | `loading="lazy"` |
| Images | serve at display size — `?w=1920&q=85` proxy pattern |
| Fonts | `font-display: swap`, subset, preload the display face only |

### Budget

| Metric | Target |
|---|---|
| Frame time | <16ms (60fps) |
| Concurrent animated elements | <20 |
| `backdrop-filter` elements per viewport | <6 |
| Ambient loops per viewport | 1 |
| Hero LCP | <2.5s |

### Debug

```
Chrome DevTools → Rendering → Paint flashing / Layer borders / Frame rendering stats
Performance panel → look for purple (layout) and green (paint) bars during scroll.
A healthy scroll animation shows only compositor work.
```

---

## 7. Cross-browser

| Issue | Fix |
|---|---|
| `backdrop-filter` in Safari | always ship `-webkit-backdrop-filter` |
| iOS video autoplay | `muted playsinline` — both, or it silently fails |
| iOS `100vh` | use `100dvh`, with a `@supports` fallback |
| `mask-image` in Safari | ship `-webkit-mask-image` |
| CSS variables in `@keyframes` | needs `@property` registration to interpolate |
| Safari `currentTime` scrubbing | needs a user gesture; fall back to a poster |
| Firefox `backdrop-filter` | enabled since v103; still verify |
| Transform kills `backdrop-filter` | see the `fill-mode` trap in `entrance-choreography.md` |

---

## 8. Progressive enhancement

The corpus stance, and it is the right one:

```
The entrance is armed by a class added in <head> by JS. With JS disabled, the class is
never added, so the complete page renders statically. That is the entire no-JS story —
do not add a <noscript> block.
```

Same shape for every layer: the page is complete without motion; motion is added on top when the
environment supports it.

- Video fails to load → `poster` is already there
- JS disabled → page renders finished
- `prefers-reduced-motion` → page renders finished
- Slow connection → poster, then a crossfade in when the video is ready
- No `IntersectionObserver` → elements start visible (feature-detect, default to visible)
