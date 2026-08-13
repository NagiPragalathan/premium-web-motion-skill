# Motion tokens

The complete timing system, with the corpus frequency data it was derived from. Every value here
appeared in shipped MotionSites prompts; counts are occurrences across the 144-prompt corpus.

---

## Easing

### Measured frequency

| Curve | Count | Name |
|---|---|---|
| `cubic-bezier(0.16, 1, 0.3, 1)` | 41 | **expo-out** — the house curve |
| `cubic-bezier(0.22, 1, 0.36, 1)` | 30 | **quint-out** — the soft arrival |
| `cubic-bezier(0.76, 0, 0.24, 1)` | 7 | **quart-in-out** — symmetric |
| `cubic-bezier(0.4, 0, 0.2, 1)` | 8 | **standard** — Material, small UI only |
| `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | 6 | **quad-out** — gentle, secondary reveals |
| `cubic-bezier(0.34, 1.56, 0.64, 1)` | 2 | **back-out** — the only sanctioned overshoot |
| `cubic-bezier(0.33, 1, 0.68, 1)` | 1 | **cubic-out** — image hover scale |
| `linear` | 233 | ambient loops **only** (marquees, ring sweeps, drift) |
| `ease-out` | 37 | acceptable shorthand for simple opacity fades |
| `ease-in-out` | 18 | ambient float loops only — never an entrance |

### The rules

1. **Everything that arrives uses expo-out or quint-out.** Larger/heavier → quint-out.
2. **`linear` is exclusively for infinite loops.** A marquee on any easing curve visibly stutters
   at the loop seam. A gradient drift on `ease-in-out` breathes correctly; a marquee does not.
3. **Exits are faster and use a different curve.** In → `[0.22, 1, 0.36, 1]` at 450ms;
   out → `[0.55, 0, 1, 0.45]` at 350ms. Exits should feel decisive, not reluctant.
4. **GSAP equivalent:** `power3.out` ≈ expo-out. `ease: "none"` for marquees.
5. **Framer Motion:** pass the array — `ease: [0.16, 1, 0.3, 1]`. Named constants:
   `const EXPO_OUT = [0.16, 1, 0.3, 1]; const EASE_OUT = [0.25, 0.46, 0.45, 0.94];`

---

## Duration

### Measured frequency (top values)

```
300ms ×60   500ms ×53   400ms ×53   800ms ×53   200ms ×43   700ms ×43
600ms ×37   100ms ×36  1000ms ×35   900ms ×25   150ms ×20   250ms ×17
1200ms ×13  450ms ×12   850ms ×9     80ms ×9    650ms ×8    550ms ×8
```

Loop durations cluster separately: `18s` ×9 (marquee), `5s`/`3s`/`3.5s`/`4s` (gradient blobs),
`10s` (ring sweep), `20s`/`28s`/`30s`/`40s` (marquee tracks).

### The ladder

Snap every duration to: **100 · 150 · 200 · 300 · 400 · 500 · 600 · 700 · 800 · 900 · 1000 · 1100 · 1200**

Off-ladder values only when a table of siblings needs deliberate variation
(580 / 620 / 850 / 920ms in a hero cascade is correct — it makes the beats feel composed
rather than metronomic).

### By purpose

| Purpose | Duration | Notes |
|---|---|---|
| Color / opacity hover | 140–200ms | `transition: color 180ms` |
| `filter: brightness()` hover | 140ms | on buttons |
| `active` press | 100–150ms | `scale(.95)` or `translateY(1px)` |
| Icon morph (menu ↔ X) | 300ms | rotate ±90° + scale + opacity together |
| Overlay / backdrop fade | 300–420ms | |
| Drawer slide | 450–500ms | `translateX(100%)` → `0` |
| Card / panel reveal | 600–700ms | |
| **Standard entrance element** | **800ms** | the median; use when unsure |
| Text line clip reveal | 800–850ms | |
| Hero headline / image | 1000–1400ms | |
| Photo settle (scale 1.03→1) | 1100–1900ms | slowest thing on the page |
| Ambient float | 2500–3300ms | `ease-in-out` alternate |
| Gradient blob drift | 3000–6500ms | multiple layers at prime-ish periods |
| Ring / sweep loop | 10000ms | `linear` |
| Marquee track | 18000–40000ms | `linear`; scale with track width |

---

## Stagger

| Context | Step | Ladder |
|---|---|---|
| Nav links | 45ms | 130 / 175 / 220 / 265 |
| Sidebar nav items | 50ms | 360 / 410 / 460 / 510 / 560 |
| Drawer menu items | 60ms | `100 + i * 60` → 100…400 |
| Mobile nav (slide-in) | 70ms | `150 + i * 70` |
| Feature cards | 100–150ms | `150 + i * 120` |
| Hero cascade beats | 150–250ms | 0 / 0.2 / 0.4 / 0.6s |
| Framer `staggerChildren` | 0.06–0.12 | `0.06` chars, `0.1` blocks, `0.12` list items |
| Word-by-word | 80–100ms | |
| Character-by-character | 15–25ms | `speed = 0.015` default |
| Scramble reveal | 25ms interval | 0.5 chars/frame entrance, 4 frames/char hover |

**Cap total cascade runtime at ~1.6s.** Past that the user has started reading and the late
arrivals become distracting. If you have 12 elements, group them into 5 beats — don't ladder 12.

---

## Distance & scale

| Element class | translateY | Companion |
|---|---|---|
| Nav link, chip, dot | 6–8px | — |
| Label, eyebrow | 8–12px | — |
| Body copy | 10–16px | `blur(6px)` optional |
| Button / CTA | 8–14px | `scale(0.985)` |
| Card / panel | 20–30px | `scale(0.968)`, custom `transform-origin` |
| Section block | 24–40px | `blur(6px)` |
| Hero headline (free) | 40–64px | `blur(10–12px)` |
| Hero headline (clipped) | `110%` of line box | `skewY(2deg)` |
| Hero image / video card | 64–80px | `scale(1.02–1.03)` settling to 1 |
| Horizontal slide-in | 40–100px | direction-dependent |
| Drawer | `100%` (`translateX`) | — |

Scale values, all of them:

```
0.90  0.92  0.94  0.968  0.97  0.98  0.985  0.99   →  1   (entrances, arriving)
1.01  1.02  1.03  1.05   1.08  1.12  1.2         ←  1   (settles and hovers)
```

Blur companions: `4px` (whisper) · `6px` (standard) · `8px` (word pop) · `10px` (signature
blur-in) · `12px` (hero) · `20px` (dramatic portal reveal).

---

## Opacity levels

The corpus builds hierarchy with a small opacity scale rather than a color scale:

```
1.00  primary text
0.80  secondary text / nav links
0.70  hover-dimmed link, subcopy
0.60  hover state for a de-emphasized link
0.55  aggressive hover dim on buttons
0.45  tertiary / captions
0.40  disabled, watermark
0.20  scroll-scrub text resting state
0.15  scroll-scrub text resting state (dimmer variant)
```

Glass surfaces: `rgba(255,255,255,0.06)` fill, `rgba(255,255,255,0.14)` border. Hover fill
lifts to `0.10–0.12`.

---

## The token block

Drop this into any project (also in `assets/motion.css`):

```css
:root {
  /* easing */
  --ease-out-expo:      cubic-bezier(0.16, 1, 0.30, 1);
  --ease-out-quint:     cubic-bezier(0.22, 1, 0.36, 1);
  --ease-out-quad:      cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --ease-in-out-quart:  cubic-bezier(0.76, 0, 0.24, 1);
  --ease-standard:      cubic-bezier(0.40, 0, 0.20, 1);
  --ease-back:          cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-exit:          cubic-bezier(0.55, 0, 1.00, 0.45);

  /* duration */
  --dur-micro: 160ms;  --dur-fast: 300ms;  --dur-ui: 450ms;
  --dur-base: 800ms;   --dur-slow: 1100ms; --dur-hero: 1400ms;

  /* stagger */
  --stagger-tight: 60ms; --stagger-base: 120ms; --stagger-wide: 200ms;

  /* distance */
  --rise-sm: 8px; --rise-md: 16px; --rise-lg: 28px; --rise-xl: 64px;
  --blur-in: 10px;
}
```

---

## Composition rules

**Motion budget per viewport**

| Category | Allowance |
|---|---|
| Entrance cascade | 1, on load, once |
| Scroll-driven reveals | 1 pattern reused with per-element delays |
| Parallax layers | ≤3, and only if depth is the point |
| Ambient loops | **1** (video plate, marquee, or gradient — pick one) |
| Hover microstates | unlimited, but each ≤200ms |

**The hierarchy rule.** In any cascade, the element the user came for moves the most and arrives
in the middle — not first, not last. Chrome arrives before it (fast, small moves), supporting
elements after it (medium moves). A headline that arrives last feels like a loading failure;
a headline that arrives first has nothing to land against.

**The rest rule.** After the entrance completes, the page must look finished with everything
motionless. If it looks empty or unresolved when the loop is paused, the motion is compensating
for a weak composition. Fix the composition.
