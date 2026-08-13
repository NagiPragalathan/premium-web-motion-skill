# The spec-prompt blueprint

How to write a prompt that makes an AI build the page you actually want **on the first try**.

This is the MotionSites format, reverse-engineered from all 144 free prompts. It is not a
"creative brief". It is a **measured reconstruction spec** — the difference between "make a
premium hero with a video background" (which produces slop) and a document that pins every
number down so hard that two different models produce nearly the same page.

---

## The governing principle

> **Every value is a measurement, not a suggestion.**

The corpus says this out loud, repeatedly:

- *"Reproduce all values verbatim; they are not approximations."*
- *"Pixel-faithful to a measured Figma-style comp."*
- *"Build it so a 1487×1058 desktop screenshot matches this layout to the pixel."*
- *"Recreate this exactly as specified — same URLs, copy, spacing, z-order, timings, and font."*

Three consequences that shape everything below:

1. **Specify, don't describe.** Not "a subtle fade-up" → `opacity 0→1, translateY(24px)→0, 800ms cubic-bezier(0.16,1,0.3,1), delay 740ms`.
2. **Write the negative space.** A `DO NOT` section is mandatory. Models pad; the constraint list
   is what stops them. Without it you get stat strips, badge chips, and three extra sections.
3. **Name the exact asset.** A real URL, not "a suitable background video". Assets are the single
   biggest quality gap between a spec build and an improvised one.

---

## The 14-section template

Use every section that applies. Order matters — it is roughly the order the model builds in.
Separate top-level sections with a full-width rule so the model can't blur them together:

```
════════════════════════════════════════
SECTION NAME
════════════════════════════════════════
```

### 1. Opening directive

One paragraph. Deliverable, stack, fidelity bar, and the headline "no"s — before anything else.

```
Recreate a single-file dark cinematic AI-infrastructure landing page EXACTLY as specified.
Deliver one self-contained index.html (inline CSS + JS, no build step). Pixel-faithful to a
measured Figma-style comp. No cards, no purple, no glow orbs, no decorative abstract gradients
as the main visual — the hero visual is a full-bleed looping video.
```

The pattern: `Recreate a [tone] [category] [artifact] EXACTLY as specified. Deliver [exact
deliverable]. [Fidelity bar]. No [X], no [Y], no [Z] — the [key element] is [the one true thing].`

### 2. PAGE META / IDENTITY

Document title, brand mark description, product vibe in one line, viewport behavior
(`overflow: hidden` vs scrolling), base background, font smoothing.

### 3. FONTS (REQUIRED)

Family names **and** how to load them, with the weights actually used. Give a named fallback
strategy for custom faces — and forbid the lazy substitution explicitly:

```
Primary UI: Manrope (variable 200–800). https://fonts.google.com/specimen/Manrope
  body font-family: 'Manrope', system-ui, -apple-system, 'Segoe UI', sans-serif
Display: "IpsumMark" 700 — used ONLY on the four bottom wordmarks.
  If unavailable, approximate with a bold geometric sans (keep the family stack) —
  do NOT fall back to Inter/Roboto/Arial as the primary.
```

Corpus favorites: Inter (UI, 25 prompts), Instrument Serif (display italic), Geist, PP Neue
Montreal, Manrope, DM Sans, Playfair Display, Geist Mono / JetBrains Mono (numerics).

### 4. COLOR TOKENS (CSS VARIABLES)

5–7 tokens, as variables, each with a role comment. Not a palette dump.

```css
--ink:      #fafafa;  /* headline / primary text */
--muted:    #a7a6a6;  /* subcopy */
--nav:      #b6b5b5;  /* header links */
--strip:    #8b8a8a;  /* partner logos */
--pill:     #ffffff;  /* CTA fill */
--pill-ink: #050505;  /* CTA text */
/* stage: #050505 */
```

### 5. RESPONSIVE UNIT SYSTEM

Either the height-locked `--u` system (for locked single-viewport compositions — see
`responsive-and-a11y.md`) or an explicit `clamp()` scale. State the reference canvas dimensions.

### 6. EXTERNAL ASSETS (ONLY THESE)

A table of every remote URL with its layer role. Mark it as the *exclusive* allowed source set.
Then describe what each asset depicts — so the build still reads correctly if a URL 404s:

```
Video subject (for art-direction fidelity): dark cinematic scene — silhouetted figure walking
toward a tall glowing white vertical portal on misty ground, smoke at base, pure black
surroundings. Loop seamlessly.
```

### 7. STRUCTURE (DOM ORDER)

An indented tree. State that **source order is paint order at equal z-index**, so it must be kept.

```
.stage
  .plate > video.plate-video
  header.topbar
    a.brand > brand SVG
    nav.links: About | Features | FAQ | Contact
    a.pill.pill-nav > span "Get Started"
    button.burger#burger (two <i> bars)
  main.hero
    h1.headline: <span>The Next Layer</span> <span>of Intelligence</span>
    p.sub: <span>…</span><span>…</span>
    .actions: a.pill.pill-cta + a.ghost
  .logos: .lg1 … .lg4
```

### 8. LAYOUT — exact geometry

Per element: position anchor, size, font-size / line-height / weight / letter-spacing, color
token, and the literal copy. In the chosen unit system.

```
Headline (.headline):
- left 75.5u, top 230.5u
- font-size 71.6h, line-height 80.5h, weight 400, letter-spacing 0.3h
- color --ink; white-space nowrap; each span display:block
  Line 1: "The Next Layer"
  Line 2: "of Intelligence"
```

### 9. BACKGROUND / STAGE

The plate: exact URL, exact markup with attributes, exact geometry, and — the detail nobody
remembers — **the fade overlays with literal gradient stops**:

```css
/* .plate::after — keep BOTH gradients */
linear-gradient(to bottom,
  rgba(5,5,5,0) 78.8%, rgba(5,5,5,.23) 79.6%, rgba(5,5,5,.45) 81.4%,
  rgba(5,5,5,.75) 83.3%, rgba(5,5,5,.888) 88%, rgba(5,5,5,.96) 95%, #050505 100%)
```

### 10. ANIMATIONS — EXACT CHOREOGRAPHY

The heart of the document. Always: (a) the runtime rule, (b) the keyframes, (c) a timing table.

```
NO animation libraries. Use Web Animations API (Element.animate) + CSS.
Easing: ease = cubic-bezier(.16,1,.3,1); softEase = cubic-bezier(.22,1,.36,1)

| Element      | Keyframes                                   | Duration | Easing   | Delay  |
|--------------|---------------------------------------------|----------|----------|--------|
| brand        | fade + up 7px + scale .94→1                 | 580ms    | ease     | 60ms   |
| nav links    | fade + up 6px                               | 480ms    | ease     | 130/175/220/265ms |
| title line 1 | translateY(110%) skewY(2deg) → 0            | 800ms    | softEase | 300ms  |
| title line 2 | same                                        | 850ms    | softEase | 440ms  |
| hero copy    | fade + up 10px                              | 620ms    | ease     | 740ms  |
| primary CTA  | fade + up 8px + scale .985                  | 560ms    | ease     | 960ms  |
| demo card    | up 12px + scale .968, origin 82% 50%        | 920ms    | softEase | 1040ms |
```

Then the arming/release mechanism, and the reduced-motion branch. Every table row must carry
all four of: **what moves, how far, how long, when**.

### 11. INTERACTIONS / MICROSTATES

Hover, focus, active, and drawer behavior — as a flat list of concrete state changes.

```
.nav a:hover        → opacity 1 + translateY(-1px), 140ms
button:hover        → filter: brightness(1.08)
button:active       → transform: scale(.95)
:focus-visible      → outline 2px solid #fff, offset 3px
Hover rules live inside @media (hover: hover) only.
```

### 12. RESPONSIVE / PORTRAIT BEHAVIOR

Per breakpoint: what hides, what reflows, what re-anchors. Then the mobile drawer choreography
in full (burger→X morph geometry, overlay blur, staggered link reveal delays, close triggers).

### 13. REDUCED MOTION + A11Y

```
prefers-reduced-motion: reduce → do not arm entrance classes; disable all transitions;
force final visible state; no ambient loops. Layout is unchanged.
aria: nav[aria-label], burger[aria-expanded], decorative media[aria-hidden="true"], img[alt=""]
```

### 14. COMPOSITION RULES (DO NOT VIOLATE)

The negative list. Non-optional. This is what stops the model padding.

```
- First viewport = ONE composition: brand + nav + one headline + one sub + CTA pair +
  full-bleed video + bottom partner strip. No stats, cards, badge chips, or secondary blocks.
- Video is an edge-to-edge background plane, not an inset media card.
- No overlays or stickers on the video except the measured edge fades.
- White fully-rounded pills for primary CTAs only; ghost text for secondary.
- NO emoji anywhere: not in copy, headings, buttons, alt text, title, or code comments.
  Icons are inline SVG at stroke-width 1.5 in currentColor. Never a pictograph as an icon.
- No exclamation marks in UI copy. No hype words (revolutionary, supercharge, effortlessly, 10x).
- Single HTML file; works on desktop and mobile.
```

The two emoji lines are **mandatory in every prompt this skill writes**, at every scale. Downstream
builders (v0, Lovable, Bolt, Figma Make) default to emoji icons and exclamation-mark copy unless
told otherwise, and a single sparkle in a feature card undoes the rest of the spec.

Close with the acceptance sentence:

```
Build it so a 1487×1058 desktop screenshot matches this layout to the pixel, with the MP4
looping behind the left typography column and the four gray marks in the bottom fade.
```

---

## Language rules

**Do**

- Imperative, present tense: *"Set"*, *"Use"*, *"Position"*, *"Animate"* — never *"you could"*.
- Literal copy in quotes. Every headline, label, and button string, verbatim.
- Units on everything: `24px`, `0.85s`, `-0.04em`, `67.2vw`, `clamp(44px, 13vw, 64px)`.
- Tables for anything with ≥3 parallel items. Models parse tables far more reliably than prose.
- Fenced code for keyframes, gradients, SVG paths, and JS math — never paraphrase these.
- `EXACTLY`, `MANDATORY`, `CRITICAL`, `verbatim`, `do NOT` — reserved for genuine constraints.
  Used on everything, they stop meaning anything.

**Don't**

- Adjectives without numbers: *"smooth"*, *"subtle"*, *"modern"*, *"clean"*, *"elegant"*.
- Options or alternatives: *"or you could use GSAP"*. Pick one. State it.
- Deferred decisions: *"choose an appropriate delay"*. You choose. Now.
- Explanations of why a technique works — the model doesn't need convincing, it needs values.
- Emoji, in the prompt or in the copy it specifies. The prompt is a spec document; write it like
  one. Section markers are plain headings and dashes, not pictographs.

---

## Sizing the prompt

| Target | Length | Sections |
|---|---|---|
| Single component (card, button, footer) | 1.5–3k chars | 1, 4, 8, 10, 11 |
| Hero section | 5–9k chars | 1–4, 6–11, 14 |
| Full landing page | 10–16k chars | all 14 |
| Cinematic scroll experience | 20–30k chars | all 14 + a per-phase choreography table + acceptance criteria |

Corpus median is ~7.7k characters. The longest free prompt (`animated-cards`, 36k) specifies a
3D carousel down to the per-layer div stacking that fakes card thickness.

---

## Worked micro-example

Same section, three ways.

**Slop**
> Create a modern hero section with a video background and smooth animations.

**Better but still unbuildable**
> Full-screen hero, dark, looping background video, headline fades up with a stagger, two CTA
> buttons, minimal nav. Make it feel premium.

**Spec-prompt**

```
════════════════════════════════════════
HERO — STAGE
════════════════════════════════════════
Full-bleed <video autoplay muted loop playsinline preload="auto" aria-hidden="true">
src: https://cdn.example.com/portal-loop.mp4
Geometry: position absolute; inset 0; object-fit cover; pointer-events none.
Subject: silhouetted figure walking toward a tall white portal of light, fog at base, black
surround. Seamless loop.

Bottom fade on .plate::after (verbatim):
linear-gradient(to bottom, rgba(5,5,5,0) 78.8%, rgba(5,5,5,.45) 81.4%,
  rgba(5,5,5,.888) 88%, #050505 100%)

════════════════════════════════════════
HERO — TYPE
════════════════════════════════════════
h1: two <span> blocks, display:block, white-space:nowrap
  "The Next Layer" / "of Intelligence"
  clamp(40px, 4.8vw, 71.6px) / line-height 1.12 / weight 400 / letter-spacing -0.02em
  color #fafafa
p.sub: two nowrap spans, clamp(16px, 1.4vw, 20.7px) / lh 1.14 / #a7a6a6
Buttons: .pill (white fill #fff, ink #050505, radius 999px, 175×50px, 20.6px/500) +
  .ghost ("View Architecture", #fff, 20.6px/500, no underline)

════════════════════════════════════════
HERO — ENTRANCE (runs once)
════════════════════════════════════════
Easing: E = cubic-bezier(0.16, 1, 0.3, 1); S = cubic-bezier(0.22, 1, 0.36, 1)
The video NEVER animates in — it is the stage.

| Element   | From                                    | Dur   | Ease | Delay |
|-----------|-----------------------------------------|-------|------|-------|
| brand     | opacity 0, translateY(7px), scale .94   | 580ms | E    | 60ms  |
| nav links | opacity 0, translateY(6px)              | 480ms | E    | 130/175/220/265ms |
| h1 line 1 | translateY(110%) skewY(2deg), clipped   | 800ms | S    | 300ms |
| h1 line 2 | same                                    | 850ms | S    | 440ms |
| p.sub     | opacity 0, translateY(10px)             | 620ms | E    | 740ms |
| .pill     | opacity 0, translateY(8px), scale .985  | 560ms | E    | 960ms |
| .ghost    | same                                    | 560ms | E    | 1020ms|

Arm with an `entrance-pending` class added in <head> before the stylesheet, with a 3500ms
fallback timeout that removes it. Release on the last element's animationend.
fill-mode: backwards (NOT both — `both` strands a transform and kills backdrop-filter).

════════════════════════════════════════
DO NOT
════════════════════════════════════════
- No cards, badge chips, stat strip, or scroll indicator in the first viewport
- No gradient or glow on the headline — solid #fafafa
- No overlay on the video except the measured bottom fade
- No entrance animation on the video plate
- prefers-reduced-motion: reduce → skip the entrance entirely, show the final state
```

That is ~40 lines and it fully determines the build.

---

## Pre-flight check

Before handing over a spec-prompt:

- [ ] Opening directive names the deliverable and the fidelity bar
- [ ] Every font is named with weights and a load method
- [ ] Colors are tokens with role comments, near-black is `#050505`
- [ ] Every asset is a real URL **and** has a described subject
- [ ] DOM tree present, with source-order-is-paint-order stated
- [ ] Every animated element has: what moves, how far, how long, when
- [ ] Easings are named constants used by reference, not retyped per row
- [ ] Hover/focus/active states are enumerated
- [ ] Responsive: what hides, what reflows, at which breakpoint
- [ ] Reduced motion branch present
- [ ] `DO NOT` section present and specific to this design
- [ ] Acceptance sentence at the end
- [ ] Zero instances of "smooth", "subtle", "modern", or "appropriate"
- [ ] The `DO NOT` section carries the no-emoji and no-emoji-as-icon lines
- [ ] Zero emoji in the prompt itself
