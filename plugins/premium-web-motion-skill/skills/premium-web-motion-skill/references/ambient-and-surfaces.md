# Ambient motion & surfaces

The background layer: video plates, glass, gradients, grain, and the one continuous loop a page
is allowed. 82 of the 144 corpus prompts build on a video plate and 82 use a glass surface —
this is the visual signature of the whole category.

**The budget rule: one ambient loop per viewport.** A looping video plate *and* a drifting
gradient *and* a marquee is a screensaver. Pick one; make it good.

---

## 1. The video plate — the default premium stage

### Markup

```html
<div class="plate">
  <video class="plate-video" autoplay muted loop playsinline preload="auto"
         poster="/hero-poster.jpg" aria-hidden="true">
    <source src="https://cdn.example.com/hero-loop.mp4" type="video/mp4">
  </video>
</div>
```

Every attribute is load-bearing: `muted` is required for autoplay, `playsinline` stops iOS
fullscreening it, `aria-hidden` keeps decorative motion out of the a11y tree, `poster` covers
the buffering window.

### Geometry

```css
.plate       { position: absolute; inset: 0; overflow: hidden; z-index: 0; }
.plate-video { position: absolute; inset: 0; width: 100%; height: 100%;
               object-fit: cover; pointer-events: none; }
```

Locked-composition variant, where the video is sized in design units and centered against the
same grid as the type:

```css
.plate-video {
  left: 50%; top: calc(1 * var(--u));
  width: calc(1492 * var(--u)); height: calc(1054 * var(--u));
  transform: translateX(calc(-50% - 0.5 * var(--u)));
}
```

Portrait override: `inset: 0; transform: none; object-position: 43% center` — shifting
`object-position` keeps the subject in frame when the crop goes tall.

### The fade overlays (this is the actual craft)

Raw video behind text is unreadable and looks unfinished. The corpus always applies two
gradients on `.plate::after`, with hand-tuned stops:

```css
.plate::after {
  content: ''; position: absolute; inset: 0; pointer-events: none;
  background:
    /* bottom fade — video dissolves into the page floor */
    linear-gradient(to bottom,
      rgba(5,5,5,0)    78.8%, rgba(5,5,5,.23) 79.6%, rgba(5,5,5,.45) 81.4%,
      rgba(5,5,5,.75)  83.3%, rgba(5,5,5,.84) 85.2%, rgba(5,5,5,.888) 88%,
      rgba(5,5,5,.905) 91%,   rgba(5,5,5,.96) 95%,   #050505 100%),
    /* side letterbox — hides the crop edges on ultrawide */
    linear-gradient(to right,
      #050505 calc(50% - 746 * var(--u)), transparent calc(50% - 676 * var(--u)),
      transparent calc(50% + 676 * var(--u)), #050505 calc(50% + 746 * var(--u)));
}
```

Nine stops on the bottom fade, not three. A three-stop gradient has a visible band where the
curve changes; the extra stops approximate a perceptual ease. This one detail separates a
premium video hero from a template.

Portrait needs its own, lighter set — a heavy bottom fade on a tall screen eats the whole video:

```
to-right:  rgba(5,5,5,.86) → .66 @42% → .20 @78% → .10 @100%
to-bottom: .72 @0% → .34 @24% → .34 @56% → .80 @82% → .97 @94% → #050505
```

### Seamless-loop crossfade

Most stock loops don't actually loop cleanly. Hide the seam:

```
On canplay:    play, then fade opacity 0 → 1 over 500ms via requestAnimationFrame
On timeupdate: when (duration - currentTime) <= 0.55s, fade 1 → 0 over 550ms
On ended:      opacity = 0, wait 100ms, currentTime = 0, play(), fade back in over 500ms
```

Do the fade in JS, not with a CSS transition — a CSS transition fights the `timeupdate` cadence
and produces a visible stutter at the wrap.

### Sourcing

Corpus video/image CDN patterns, useful as a shape to imitate:

- `https://d8j0ntlcm91z4.cloudfront.net/user_<id>/hf_<date>_<uuid>.mp4` — generated loops
- `https://images.higgs.ai/?default=1&output=webp&url=<encoded>&w=1920&q=85` — an image proxy
  that re-encodes to WebP at a chosen width/quality. The `w=` / `q=` pattern is worth copying
  for any remote image: request the size you'll actually display.

Prefer 1920×1080, H.264, ≤5MB, 5–15s. Mirror to a local `/hero.mp4` + `/hero-poster.jpg` for
offline dev.

---

## 2. Liquid glass

The other half of the signature, and the most-copied class in the corpus — it appears in 82 of
144 prompts, usually named `.liquid-glass` verbatim. Real glass is four properties, not one.

```css
.liquid-glass {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(20px) saturate(1.4);
  -webkit-backdrop-filter: blur(20px) saturate(1.4);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.10),   /* top light catch */
              0 20px 60px rgba(0, 0, 0, 0.35);           /* cast shadow */
  border-radius: 20px;
}
```

| Ingredient | Why it matters |
|---|---|
| `saturate(1.4)` | pure blur looks grey and dead; saturation is what makes it read as glass |
| inset top highlight | a 1px light catch on the top edge — the single biggest realism win |
| cast shadow | glass floats; without a shadow it reads as a flat translucent rectangle |
| fill ≤ `0.08` | above that it stops being glass and becomes a tinted panel |

Blur values: `4px` (the corpus's own near-invisible default) · `14px` small chips ·
`20px` cards · `22–28px` panels · `50px` heavy overlays · `80px` extreme.
Hover: fill `0.06 → 0.10`, border `0.14 → 0.20`, 200ms.

### 2a. The mask-composite gradient border — the actual signature

A flat 1px border is the giveaway of a copied glass class. The corpus's real technique renders a
**gradient stroke that fades along each edge**, using a pseudo-element whose fill is masked away
so only its padding ring survives. This appears in ~30 prompts, near-verbatim:

```css
.liquid-glass {
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.01);
  background-blend-mode: luminosity;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border: none;                                   /* the border is drawn below */
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1);
}
.liquid-glass::before {
  content: '';
  position: absolute;
  inset: 0;
  padding: 1.4px;                                 /* = the border thickness */
  border-radius: inherit;
  background: linear-gradient(180deg,
              rgba(255,255,255,.45), rgba(255,255,255,.15) 20%,
              rgba(255,255,255,0) 40%, rgba(255,255,255,0) 60%,
              rgba(255,255,255,.15) 80%, rgba(255,255,255,.45));
  /* Two identical masks; one clipped to the content box. XOR leaves ONLY the padding ring. */
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
          mask-composite: exclude;
  pointer-events: none;
}
```

**How it works:** mask A covers the whole element, mask B covers only the content box.
`xor`/`exclude` keeps what's in exactly one of them — the `padding` ring. So the gradient shows
only as a border, and because it's a gradient it can fade out mid-edge, which a real `border`
can never do.

Two properties are unprefixed vs prefixed on purpose: WebKit uses `-webkit-mask-composite: xor`,
the standard is `mask-composite: exclude`. Ship both.

The corpus's stop pattern — bright at top and bottom, transparent through the middle — reads as a
light source above and a reflection below. A 180° white ramp (`rgba(255,255,255,.45)` → `0`) is
the simpler variant used on buttons.

**Variants seen:**
- `padding: 1px` for chips, `1.4px` for cards, `2px` for feature panels
- `background-blend-mode: luminosity` on the fill — desaturates what's behind so the glass reads
  cooler than the video under it
- **cursor-following border**: animate the gradient's angle or position from pointer coordinates
  and the stroke lights up where the cursor is
- **fallback**: keep a plain `border: 1px solid rgba(255,255,255,.14)` for browsers without
  `mask-composite`, overridden inside `@supports (mask-composite: exclude)`

### 2b. Real refraction (SVG displacement)

The most advanced glass in the corpus routes `backdrop-filter` through an SVG filter, so the
background is actually *distorted* at the glass edge rather than merely blurred:

```html
<svg width="0" height="0" aria-hidden="true"><filter id="glass-refract">
  <feTurbulence type="fractalNoise" baseFrequency="0.008" numOctaves="2" result="noise"/>
  <feDisplacementMap in="SourceGraphic" in2="noise" scale="18"/>
</filter></svg>
```
```css
.glass-refract { backdrop-filter: url(#glass-refract) blur(0.3px) saturate(1.3); }
```

Expensive and Chromium-leaning. Use on one hero element, never on a list.

### 2c. Why glass breaks

1. **An ancestor has a `transform`.** This creates a containing block and disables
   `backdrop-filter` entirely. The usual culprit is an entrance animation with
   `fill-mode: forwards`/`both`. Use `backwards`.
2. **Nothing behind it.** Glass over a flat color is invisible work. It needs a video, photo, or
   gradient to refract.
3. **Missing `-webkit-` prefix.** Safari still wants it, on both `backdrop-filter` and `mask`.
4. **No `overflow: hidden` with the `::before` ring.** The gradient ring bleeds past rounded
   corners without it.

**Cost:** `backdrop-filter` is genuinely expensive. Keep it under ~6 elements per viewport, and
never on something that moves every frame.

---

## 3. Animated gradient blobs

Ambient background motion with no video. The corpus technique is to animate **CSS variables**
that feed `radial-gradient` positions — not to animate the gradient itself (which can't be
interpolated) and not to move blurred divs (which is far more expensive).

```css
.animated-gradient {
  background:
    radial-gradient(circle at var(--x1) var(--y1), #6b3df5 0%, transparent var(--s1)),
    radial-gradient(circle at var(--x2) var(--y2), #f53d8a 0%, transparent var(--s2)),
    radial-gradient(circle at var(--x3) var(--y3), #3df5d0 0%, transparent var(--s3));
  animation:
    blob1 5s ease-in-out infinite, blob2 6s   ease-in-out infinite,
    blob3 5.5s ease-in-out infinite,
    size1 3.5s ease-in-out infinite, size2 4.2s ease-in-out infinite;
}
@keyframes blob1 {
  0%, 100% { --x1: 5%;  --y1: 5%;  }
  25%      { --x1: 45%; --y1: 20%; }
  50%      { --x1: 30%; --y1: 55%; }
  75%      { --x1: 0%;  --y1: 30%; }
}
@keyframes size1 { 0%, 100% { --s1: 45%; } 50% { --s1: 80%; } }
@media (prefers-reduced-motion: reduce) { .animated-gradient { animation: none; } }
```

**Why it works:** position and size run on *different, deliberately mismatched* periods
(5s / 6s / 5.5s against 3.5s / 4.2s / 3.8s), so the composite never visibly repeats. Matched
periods produce an obvious 5-second loop.

Requires `@property` registration for the variables to interpolate smoothly in some engines:

```css
@property --x1 { syntax: '<percentage>'; initial-value: 5%; inherits: false; }
```

Without it, browsers step between keyframes instead of tweening.

---

## 4. Grain / noise

Kills gradient banding and adds a film quality that reads as expensive.

```css
.grain::after {
  content: ''; position: absolute; inset: 0; pointer-events: none;
  opacity: 0.035; mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
```

Opacity `0.02–0.05`. Above `0.06` it looks like a dirty screen. Animating the grain (jittering
`background-position` on a 0.4s step loop) adds real film feel but costs a repaint every frame —
worth it only on a hero, never page-wide.

---

## 4b. Full-page overlay layers

Beyond grain, the corpus uses three more full-bleed treatment layers. All are
`position: fixed; inset: 0; pointer-events: none;` and sit above the content.

**Texture wash** — a tiling PNG at high z-index, lightening the whole page:
```css
.texture { z-index: 50; background: url(/texture.png) center / cover;
           mix-blend-mode: lighten; opacity: .6; }
```

**Halftone / dot screen** — a printed-matter feel over photography:
```css
.halftone { background-image: radial-gradient(circle, #000 1px, transparent 1px);
            background-size: 4px 4px; opacity: .2; mix-blend-mode: multiply; }
```

**Progressive blur** — a band where the page *gradually* goes out of focus, rather than a hard
scrim. This is the premium way to seat text over a busy plate:
```css
.progressive-blur {
  position: absolute; inset-inline: 0; bottom: 0; height: 178px;
  backdrop-filter: blur(14px);
  -webkit-mask-image: linear-gradient(to top, #000 0%, transparent 100%);
          mask-image: linear-gradient(to top, #000 0%, transparent 100%);
}
```
Stack two or three of these with increasing blur and shorter masks for a true depth-of-field ramp.

Put `isolation: isolate` on the stage whenever any of these use `mix-blend-mode`, or the blend
escapes to the page background.

**Blend-mode type** — `mix-blend-mode: exclusion` on an accent word over video inverts against
whatever is behind it, so it stays legible on every frame with no scrim. `mix-blend-darken` and
`mix-blend-lighten` are used to knock the black or white out of a logo clip.

---

## 4c. Specular sheen

A light streak that sweeps across a glass panel once, or on an interval. Small, and it's what
makes a static card look manufactured rather than drawn.

```css
@keyframes sheen {
  from { transform: translate3d(-150%, 0, 0) skewX(-18deg); }
  to   { transform: translate3d( 250%, 0, 0) skewX(-18deg); }
}
.sheen::after {
  content: ''; position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.18), transparent);
  width: 40%;
  animation: sheen 1.1s var(--ease-out-quint) 1 both;   /* once, at the end of the entrance */
}
```

The `skewX(-18deg)` is what makes it read as a reflection rather than a moving rectangle. Fire it
once as the last beat of the entrance; looping it is a "shiny button" cliché.

---

## 5. Float & drift loops

The gentlest ambient motion. For icons, badges, and small decorative objects.

```css
@keyframes floatSlow {
  0%, 100% { transform: translateY(0)     rotate(0deg); }
  50%      { transform: translateY(-10px) rotate(3deg); }
}
.float { animation: floatSlow 3s ease-in-out infinite; }
```

`ease-in-out` + `alternate` behavior is correct here (unlike marquees, which must be `linear`).
Give each floating element a **different duration in the 2.5–3.3s range** so the group never
pulses in unison — synchronized floating instantly reads as machine-generated.

Pulse variant for status dots:
```css
@keyframes dotPulse { 0%, 100% { opacity: 1; transform: scale(1); }
                      50%      { opacity: .45; transform: scale(1.45); } }
```

---

## 6. Ring sweep

A gradient light traveling around a circular button — one ambient accent that doesn't move the
element itself.

```css
.send::before {
  content: ''; position: absolute; inset: 0; border-radius: 50%;
  background: conic-gradient(from 0deg, transparent, #fff, transparent);
  animation: ring-sweep 10s linear infinite;
}
@keyframes ring-sweep { from { transform: rotate(0turn); } to { transform: rotate(1turn); } }
```

Start it **after** the entrance completes (gate on an `html.hero-ready` class), so the loop
doesn't compete with the cascade. The button body never moves — only the light does. This is
the corpus's "one continuous ambient motion" pattern in its purest form.

---

## 7. SVG beam state machine

For "data flows through the system" diagrams. A state machine drives a gradient window along an
SVG path.

```
Recompute the path on mount and on resize from element bounding boxes:
  d = `M ${startX},${startY} L ${midX},${midY} L ${endX},${endY}`   (set on BOTH beam paths)
Animate by mutating x1/x2 of the linearGradient (gradientUnits="userSpaceOnUse"):
  halfWidth = 5 (percent), center = percentage * 100
  x1 = (center - 5) + '%';  x2 = (center + 5) + '%';  y1 = y2 = '0%'

| State  | Duration | Behavior |
|--------|----------|----------|
| p1     | 800ms    | percentage 0 → 0.5; while p < 0.4 add .active to node-stack. |
|        |          | At end: → splash, hide both beams, add .animate to splash. |
| splash | 800ms    | wait; then → p2, remove .animate, restore beam opacity. |
| p2     | 800ms    | percentage 0.5 → 1.0; while p > 0.6 add .active to node-shield. |
| idle   | 1000ms   | wait, then loop to p1. |

Total cycle ≈ 3.4s, infinite.
```

The `idle` state is the important one — a diagram that pulses continuously with no rest is
exhausting to sit next to.

---

## 7a. Chamfered corners (polygon clip-path)

Angular, technical brands use notched corners instead of `border-radius`. Four corpus prompts do
this, and it instantly reads as "engineered" rather than "rounded SaaS".

```css
/* one chamfer, bottom-right */
.chip { clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px),
                           calc(100% - 8px) 100%, 0 100%, 0 8px); }

/* octagonal — all four corners cut */
.btn-cut { clip-path: polygon(10px 0, calc(100% - 10px) 0, 100% 10px,
                              100% calc(100% - 10px), calc(100% - 10px) 100%,
                              10px 100%, 0 calc(100% - 10px), 0 10px); }
```

Two corpus details worth copying:

- **Vary the polygon per card.** A grid where each card has a slightly different cut pattern
  reads as designed; identical cuts read as a CSS utility.
- **Fake the border** by nesting: outer div gets 1.5px padding and the border colour, inner div
  gets the same `clip-path`. A real `border` follows the box, not the clip, so it would show
  through the cut corners.

Remember `clip-path` also clips `box-shadow` — put the shadow on a parent wrapper.

## 7b. SVG line draw

```css
.path { stroke-dasharray: 400; stroke-dashoffset: 400;
        animation: draw 1.4s var(--ease-in-out-quart) forwards; }
@keyframes draw { to { stroke-dashoffset: 0; } }
```

Set both values to the path's own length — read it once at runtime with
`path.getTotalLength()` and write it into a CSS variable, rather than hardcoding a guess that
breaks when the viewBox changes.

The Framer equivalent is `pathLength`, animated `0 → 1`, which normalises the length for you and
staggers cleanly across several paths:

```tsx
<motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
             transition={{ duration: 1.4, delay: i * 0.12, ease: [0.76, 0, 0.24, 1] }} />
```

## 7c. drop-shadow vs box-shadow

`box-shadow` shadows the element's *box*. `filter: drop-shadow()` shadows its *alpha* — so it
follows a cutout PNG, an SVG icon, or gradient-clipped text. Using the wrong one is an instant
tell.

```css
/* rectangle → box-shadow */
.card { box-shadow: 0 20px 60px rgba(0,0,0,.35); }

/* cutout PNG, SVG mark, clipped text → drop-shadow */
.logo { filter: drop-shadow(0 4px 14px rgba(0,0,0,.16)); }
```

Stacked drop-shadows build a glow that follows the shape — a white halo plus a grounding shadow:
```css
filter: drop-shadow(0 0 1px #fff) drop-shadow(0 0 1px #fff)
        drop-shadow(1px 2px 1px rgba(0,0,0,.48));
```
Two identical passes rather than one at double the radius — repeating the small blur produces a
tighter, brighter edge than one wide one.

Corpus values: `drop-shadow(0 0 7px rgba(190,215,255,.28))` for a soft cyan glow on a pin;
`0 2px 16px rgba(0,0,0,.2)` as `text-shadow` on nav links over video.

**Remember**: `background-clip: text` disables `text-shadow`. Gradient headlines get their shadow
from `filter: drop-shadow()` on the element.

## 7d. SVG filter effects

The corpus builds three effects from filter primitives. All go in a zero-size inline `<svg>`.

**Glow** — blur the source, then composite the original back on top:
```html
<filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
  <feGaussianBlur stdDeviation="2" result="blur"/>
  <feComposite in="SourceGraphic" in2="blur" operator="over"/>
</filter>
```
The oversized filter region matters — the default `-10%` clips the glow at the element's edge.

**Contained noise** — turbulence clipped to the shape it decorates:
```html
<filter id="noise">
  <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4"/>
  <feComposite in2="SourceGraphic" operator="in"/>   <!-- keeps noise INSIDE the source alpha -->
</filter>
```

**Dissolve transition** — the corpus's "sand" image swap, driven per frame over 900ms:
```
feDisplacementMap: scale 0 → 150 as progress rises
feGaussianBlur:    0 → 6px
feColorMatrix:     alpha fades (1 - progress * 1.2)
Easing: entering = quartic out (1 - (1-t)^4);  exiting = cubic in (t^3)
```
Animate the filter's attribute values from a RAF loop — SVG filter primitives aren't animatable
by CSS transitions.

---

## 8. Surface craft

| Detail | Value |
|---|---|
| Page black | `#050505` (never `#000` — it kills the shadow gradient) |
| Card on black | `#111111`, footer `#080808` |
| Border on dark | `rgba(255,255,255,0.08–0.14)` |
| Divider | 1px at `rgba(255,255,255,0.08)` |
| Shadow (float) | `0 20px 60px rgba(0,0,0,0.35)` |
| Shadow (rest) | `0 4px 14px rgba(0,0,0,0.16)` |
| Radius | `999px` pills, or one consistent value (`14px` / `20px` / `28px`) |
| Vignette | `radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,.5) 100%)` |
| Edge mask | `mask-image: linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)` |
| Spotlight | `radial-gradient(600px circle at var(--mx) var(--my), rgba(255,255,255,.06), transparent 40%)` |

**Isolation:** put `isolation: isolate` on any stage that uses `mix-blend-mode` inside it, or the
blend escapes to the page background and you get inexplicable color shifts.
