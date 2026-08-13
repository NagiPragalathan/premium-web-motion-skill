# Hover, pointer & cursor

Pointer interaction is where a page proves it was built rather than generated. All of it lives
inside `@media (hover: hover)` and all of it has a `:focus-visible` counterpart.

---

## 0. The two wrappers

```css
@media (hover: hover) and (pointer: fine) {
  .btn:hover { filter: brightness(1.08); }
}
:focus-visible { outline: 2px solid #fff; outline-offset: 3px; }
```

Without the hover query, touch devices get sticky hover states that latch after a tap and stay
until the user taps elsewhere. Without `:focus-visible`, the page is unusable by keyboard.

---

## 1. Microstates — the baseline vocabulary

The complete corpus hover vocabulary. Pick 2–3 per project and apply them consistently; a page
where each element hovers differently reads as assembled from templates.

| Element | Hover | Active | Duration |
|---|---|---|---|
| Nav link | `opacity: 1` from `.7`, or `color: #f2f2f2` | — | 180ms |
| Nav link (lift) | `translateY(-1px)` + opacity | — | 140ms |
| Primary button | `filter: brightness(1.08)` | `scale(.95)` | 140ms / 100ms |
| Secondary button | `background: rgba(255,255,255,.10)` from `.06` | `translateY(1px)` | 200ms |
| Solid CTA | fill + text + border swap together | `scale(.97)` | 200ms |
| Card | `translateY(-4px)` + shadow deepen | — | 300ms |
| Icon chevron | `translateX(2px)` (`group-hover:translate-x-0.5`) | — | 200ms |
| Image / video tile | `scale(1.03–1.08)` | — | 500–700ms |
| Social icon | `scale(1.15)` + `translateY(-3px)` | — | 300ms |
| Input field | bg `rgba(255,255,255,.08)` → `.14`, `scale(1.01)` | — | 200ms |
| Menu icon ↔ X | `rotate(±90deg) scale(0→1)` + opacity crossfade | — | 300ms |

**Two rules.** Hover durations are **always** shorter than entrance durations — 140–200ms vs
800ms. And an element that lifts on hover must have somewhere to land: give it a shadow or a
background change, never a bare `translateY`.

### Image tile hover, the full treatment

```
Video/image scales 1 → 1.08 over 500ms cubic-bezier(0.33, 1, 0.68, 1)
Dark overlay rgba(0,0,0,0.25) fades in over 400ms
Centered "+" in a 70px circle (rgba(255,255,255,0.2)) scales 0.7 → 1 over 300ms
White L-shaped corner brackets (12px arms, 1.5px border) in all four corners, 15px inset
```

Wrapper needs `overflow: hidden` + a fixed `aspect-ratio`, or the scale reflows the grid.

---

## 2. Magnetic hover

The element leans toward the cursor. Reserve it for one primary CTA — a page of magnetic
elements feels like the layout is sliding around.

```js
function magnetic(el, strength = 0.35, radius = 120) {
  let raf = null, tx = 0, ty = 0, cx = 0, cy = 0;

  el.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    if (Math.hypot(dx, dy) > radius + Math.max(r.width, r.height) / 2) return;
    tx = dx * strength; ty = dy * strength;
    if (!raf) raf = requestAnimationFrame(tick);
  });

  el.addEventListener('pointerleave', () => {
    tx = 0; ty = 0;
    if (!raf) raf = requestAnimationFrame(tick);
  });

  function tick() {
    raf = null;
    cx += (tx - cx) * 0.15;                        // lerp — never write the raw target
    cy += (ty - cy) * 0.15;
    el.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0)`;
    if (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1) raf = requestAnimationFrame(tick);
  }
}
```

Strength `0.25–0.4`. Above `0.5` the element outruns the cursor and looks buggy. Skip entirely
under `pointer: coarse` and `prefers-reduced-motion`.

---

## 3. Cursor spotlight reveal

A hidden layer (usually a video or second image) is visible only inside a soft circle that
trails the cursor. The single most impressive interaction in the corpus, in two implementations.

### Canvas-mask version (soft, organic falloff)

```js
const SPOTLIGHT_R = 260;
// lerp the pointer: smooth.x += (mouse.x - smooth.x) * 0.1

// each frame:
ctx.clearRect(0, 0, canvas.width, canvas.height);
const g = ctx.createRadialGradient(x, y, 0, x, y, SPOTLIGHT_R);
g.addColorStop(0,    'rgba(255,255,255,1)');
g.addColorStop(0.4,  'rgba(255,255,255,1)');
g.addColorStop(0.6,  'rgba(255,255,255,0.75)');
g.addColorStop(0.75, 'rgba(255,255,255,0.4)');
g.addColorStop(0.88, 'rgba(255,255,255,0.12)');
g.addColorStop(1,    'rgba(255,255,255,0)');
ctx.fillStyle = g;
ctx.beginPath(); ctx.arc(x, y, SPOTLIGHT_R, 0, Math.PI * 2); ctx.fill();

revealDiv.style.maskImage = revealDiv.style.webkitMaskImage = `url(${canvas.toDataURL()})`;
revealDiv.style.maskSize = '100% 100%';
```

The multi-stop falloff is what sells it — a hard-edged circle looks like a bug. Calling
`toDataURL()` every frame is expensive; for full-viewport use, prefer the SVG version below.

### SVG-trail version (cheaper, has weight)

Six circles chained by lerp, used as an SVG mask. The trail gives the light physical inertia.

```js
const NUM_TRAILS = 6;
points[0].x += (targetX - points[0].x) * 0.2;                  // head follows cursor
for (let i = 1; i < points.length; i++) {
  points[i].x += (points[i - 1].x - points[i].x) * 0.35;        // each follows the one before
  points[i].y += (points[i - 1].y - points[i].y) * 0.35;
}
points.forEach((p, i) => {
  const c = document.getElementById(`trail-${i}`);
  c.setAttribute('cx', p.x); c.setAttribute('cy', p.y);
});
```

Mask: white circles on a black `<rect>`, applied via `mask="url(#spot)"` to the image layer that
sits **above** the video. Base radius 420–520px; taper each trail circle slightly.

**Both versions need**: a touch fallback (track `touchmove`, or just autoplay the hidden layer
on coarse pointers) and a reduced-motion fallback (show one layer, statically).

---

## 4. Custom cursor

```
fixed, pointer-events: none, z-index: 50
Position by direct DOM write: style.left/top = clientX/clientY (never React state — one frame late)
transform: translate(-50%, -50%)
mix-blend-mode: exclusion       ← inverts against whatever is under it; works on any background
Contents: 48×48 SVG — a stroked circle (r 22.75, stroke-width 2.5) with a glyph inside
Hidden below 1024px
```

`mix-blend-mode: exclusion` is the detail that makes a custom cursor work over both a dark video
and a white section without any per-section logic. **Never hide the native cursor without a
replacement that is equally legible** — and always keep the native cursor over form fields.

---

## 5. 3D tilt

```js
const r = card.getBoundingClientRect();
const px = (e.clientX - r.left) / r.width  - 0.5;   // -0.5 … 0.5
const py = (e.clientY - r.top)  / r.height - 0.5;
targetRX = -py * 12;    // degrees
targetRY =  px * 12;
// per frame, lerped at 0.12:
card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
```

- Parent: `perspective: 900–1200px`. Card: `transform-style: preserve-3d`.
- Max rotation **10–14°**. Beyond that it stops reading as depth and starts reading as a glitch.
- Lerp with `0.10–0.12` so the card lags the cursor — that lag *is* the sense of mass.
- Return to rest over 500ms on `pointerleave`.
- Real volumetric thickness: stack 3–5 near-identical divs 1–2px apart on Z rather than faking
  it with a box-shadow.

---

## 6. Pixel / cell grid hover

An overlay grid of cells; hovering lights the cell under the cursor and its neighbors fade back
out over a stagger. Give each cell `transition-delay: calc(var(--i) * 12ms)` so the extinguish
ripples outward rather than snapping off in unison.

---

## 7. Group hover (Tailwind idiom)

The corpus leans on this heavily — the parent is the trigger, several children respond:

```html
<a class="group relative overflow-hidden rounded-full border transition-all hover:border-slate-300">
  <div class="absolute inset-0 scale-150 opacity-0 transition-all duration-500
              group-hover:scale-100 group-hover:opacity-100" style="background:var(--brand-grad)"></div>
  <img class="transition group-hover:brightness-0 group-hover:invert" src="…">
  <span class="transition-transform group-hover:translate-x-0.5">→</span>
</a>
```

One pointer event, three coordinated responses. That coordination is what separates a designed
hover from a styled one.

---

## Touch & accessibility

| Concern | Handling |
|---|---|
| Sticky hover on touch | wrap every hover rule in `@media (hover: hover)` |
| Hover-only content | must also be reachable by tap/focus — never hide information behind hover |
| Cursor effects on touch | detect `pointer: coarse`, skip entirely or autoplay the reveal |
| Reduced motion | no magnetic, no tilt, no trail; spotlight becomes a static layer |
| Keyboard | every hover state has a `:focus-visible` equivalent |
| Tap targets | 44×44px minimum |
| `active` feedback | `scale(.95)` at 100ms — touch has no hover, so the press must confirm |
