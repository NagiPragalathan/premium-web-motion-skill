---
name: premium-web-motion-skill
description: Build award-tier animated websites — cinematic hero sections, scroll-driven storytelling, kinetic typography, entrance choreography, liquid-glass surfaces, ambient loops, cursor spotlight reveals, marquees and parallax — or write the measured spec-prompt that makes another AI build them. Use for any request about premium/modern/"agency-grade" web animation, motion design, scroll animations, hero sections, landing-page polish, micro-interactions, page transitions, or turning a design/video reference into an exact buildable spec. Distilled from all 144 free MotionSites.ai component prompts.
---

# Premium Web Motion

A complete motion system for websites that look like they cost $5,000 a section: the timing
tokens, the choreography patterns, the scroll rigs, and — most importantly — **the spec-prompt
format** that turns "make it premium" into a build that lands on the first try.

Distilled from the full corpus of 144 free MotionSites.ai prompts (1.1M characters of measured
production specs). Every number in this skill is one that shipped, not one that was invented.

---

## The one idea

**Premium motion is not more animation. It is fewer moves, measured exactly, in one direction.**

Amateur output animates twelve things with default `ease` at `0.3s`. Premium output moves six
things along one decelerating curve, each 60—120ms behind the last, with a blur that resolves
as they arrive — and then stops. The corpus is unanimous on this: 34 prompts use
`cubic-bezier(0.16, 1, 0.3, 1)`, 30 use `cubic-bezier(0.22, 1, 0.36, 1)`, and essentially
nothing uses a bounce.

Two failure modes to actively design against:

- **Motion soup** — everything moving at once, no hierarchy, no rest state. Fix: one entrance
  cascade, then stillness except for a single ambient loop.
- **Cheap motion** — 300ms `ease-in-out`, uniform delays, opacity-only fades, a spinning gradient
  blob. Fix: the token table below, plus a `blur()` or `scale()` companion on every fade.

---

## Choose your mode

**Mode A — Build it.** The user wants a page/section/component. Read `references/motion-tokens.md`,
then the one or two recipe files you need, then write the code. Ship `assets/motion.css` +
`assets/motion.js` if it's vanilla, or the Framer Motion variants in the recipes if it's React.

**Mode B — Spec it.** The user wants a *prompt* — a brief for another AI (v0, Lovable, Bolt,
Figma Make, Claude) to build from. Read `references/prompt-blueprint.md` and follow the template
exactly. This is the MotionSites product, reverse-engineered.

**Mode C — Match a reference.** The user points at a site, video, or screenshot and says "like
this". Run the *reference decomposition* below, then Mode A or B.

If the user's ask is ambiguous between A and B, build it (Mode A) and note that you can also emit
the reusable spec-prompt.

---

## Motion tokens — memorize these

The whole system, at a glance. Full derivation, per-property distance scales and the ranked
frequency data are in `references/motion-tokens.md`.

### Easing — you need exactly four

| Token | Curve | Use for |
|---|---|---|
| `--ease-out-expo` | `cubic-bezier(0.16, 1, 0.3, 1)` | **The default.** Entrances, reveals, anything arriving. |
| `--ease-out-quint` | `cubic-bezier(0.22, 1, 0.36, 1)` | Slightly softer arrival — large elements, drawers, cards. |
| `--ease-in-out-quart` | `cubic-bezier(0.76, 0, 0.24, 1)` | Symmetric moves: line draws, panel swaps, exits. |
| `--ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | Small UI state changes only (color, opacity —0—200ms). |

Never `ease`, never `ease-in-out` on an entrance, never a spring overshoot unless the brand is
explicitly playful (`cubic-bezier(0.34, 1.56, 0.64, 1)` is the only sanctioned overshoot).

### Duration — snap to this ladder

`100 · 150 · 200 · 300 · 400 · 500 · 600 · 700 · 800 · 900 · 1000 · 1100 · 1200ms`

| Band | Range | What lives here |
|---|---|---|
| Microstate | 140—200ms | hover color, opacity, `brightness(1.08)`, `active: scale(.95)` |
| UI transition | 300—500ms | menu overlay fade, icon morph, tab swap, drawer 450—500ms |
| Entrance element | 600—900ms | fade-up, blur-in, scale-in — **800ms is the corpus median** |
| Hero / stage | 1000—1400ms | headline reveal, hero image rise, big card settle |
| Ambient loop | 3—30s | marquee 20—30s, gradient drift 4—6s, float 2.5—3.3s, ring sweep 10s |

### Stagger — the signature

| Context | Step | Example ladder |
|---|---|---|
| Nav links / chips | 45—60ms | 130 / 175 / 220 / 265ms |
| Menu drawer items | 60—70ms | `100 + i * 60` |
| Content blocks | 100—150ms | `150 + i * 120` |
| Hero cascade beats | 150—250ms | 0 / 0.2 / 0.4 / 0.6s |
| Per-word text | 80—100ms | word index — 100ms |
| Per-character text | 15—25ms | char index — 0.015s |

**Never a uniform stagger across the whole page.** Chrome (nav/brand) is fast and tight;
the hero cascade is slow and wide.

### Distance — motion travels less than you think

| Element | Travel |
|---|---|
| Nav link, chip, small label | 6—8px |
| Body copy, button | 10—16px |
| Card, panel | 20—30px |
| Hero headline | 40—64px, or `110%` of its own line box when clipped |
| Scale companion | `0.94 —  1` (small) · `0.968 —  1` (card) · `1.03 —  1` (image settle) |
| Blur companion | `blur(6px)` subtle · `blur(10—12px)` signature · `blur(20px)` dramatic |

### The premium fade (use this, not `opacity`)

```css
from { opacity: 0; transform: translateY(24px); filter: blur(6px); }
to   { opacity: 1; transform: translateY(0);    filter: blur(0);   }
/* 800ms cubic-bezier(0.16, 1, 0.3, 1) both */
```

An opacity-only fade reads as a loading state. Opacity + translate reads as intentional.
Opacity + translate + blur reads as expensive.

---

## The five-beat page-load cascade

Every strong hero in the corpus follows the same score. Total runtime —0— 1.2—1.6s.

| Beat | Elements | Delay | Duration | Move |
|---|---|---|---|---|
| 1 | brand mark | 60ms | 580ms | fade + up 7px + scale .94— 1 |
| 2 | nav links, header CTA | 130—265ms (45ms step) | 480—520ms | fade + up 6—8px |
| 3 | headline line 1 —  line 2 | 300ms —  440ms | 800 / 850ms | clip reveal: `translateY(110%) skewY(2deg)` —  0 |
| 4 | subcopy, then CTA pair | 740ms —  960ms | 620 / 560ms | fade + up 10—14px |
| 5 | hero media / card / logo strip | 1040ms | 920—1100ms | fade + up 12px + scale .968— 1 |

Two hard rules from the corpus:

1. **The background never animates in.** The video/photo plate is the stage — it is already there
   when the content arrives. Fading the whole page in is the tell of a cheap build.
2. **The cascade runs once.** Never on resize, never on route re-entry, never replayed on scroll-back.

Implementation options (all three in `references/entrance-choreography.md`): pre-paint CSS class
with `animation-delay` (simplest), WAAPI timeline (most controllable), Framer Motion variants
(React). All three need the pre-paint guard so the finished page never flashes before the
animation arms:

```html
<script>
  // In <head>, BEFORE the stylesheet. No class is added if JS is off,
  // so the complete page renders statically — that is the whole no-JS story.
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches && Element.prototype.animate) {
    document.documentElement.classList.add('entrance-pending');
    window.__entranceFallback = setTimeout(
      () => document.documentElement.classList.remove('entrance-pending'), 3500);
  }
</script>
```

---

## Reference decomposition (Mode C)

When handed a "make it like this" reference, extract in this order — this is the order the corpus
prompts are written in, and it is the order that makes a build reproducible:

1. **Stage** — what fills the first viewport? Video plate / photo / flat color / canvas. Full-bleed
   or inset? What are the fade overlays at its edges?
2. **Composition** — count the elements. Premium heroes have 5—8 total. Write down what is *not*
   there (no cards, no badges, no stat strip) — the negative list matters as much as the positive.
3. **Type** — display family + UI family, the two of them. Sizes in `clamp()`. Tracking on the
   headline (almost always negative: `-0.02em` to `-0.08em`).
4. **Palette** — 5—7 tokens max, as CSS variables. Near-black is `#050505`, not `#000`.
5. **Motion inventory** — list every moving thing and classify each as: entrance / scroll-driven /
   hover / ambient loop. If a category is empty, say so explicitly.
6. **Timing** — for each move: trigger, delay, duration, easing, distance.
7. **Responsive rule** — what collapses, what hides, what reflows, at which breakpoint.
8. **Constraints** — the "do not" list.

---

## Reference library

Read the file that matches the work. Each is self-contained; don't read them all.

| File | Read it when |
|---|---|
| `references/prompt-blueprint.md` | **Mode B.** Writing a spec-prompt. The full 14-section template + language rules + pre-flight check. |
| `references/example-prompts.md` | **Mode B.** Four complete copy-ready prompts at four scales, to adapt rather than start blank. |
| `references/pattern-catalog.md` | **Start here when unsure.** All 88 mechanisms across the corpus in 8 families, each pointing at its source case and its docs file. |
| `references/motion-tokens.md` | Any build. Full token tables, corpus frequency data, per-property scales, the token CSS block. |
| `references/entrance-choreography.md` | Page-load animation. CSS / WAAPI / Framer, the pre-paint guard, clip-path wipes, splash gates, the fill-mode trap. |
| `references/scroll-systems.md` | Anything scroll-driven. Reveal observer, lerp smoothing, parallax, sticky cinema rig, phase math, pinned panels. |
| `references/video-techniques.md` | Any video plate. All eight mechanisms — fade-loop, boomerang canvas, crossfade switcher, scroll/mouse scrub, sync, masking, overlay strategy. |
| `references/text-effects.md` | Kinetic typography. Line clip reveal, word stagger, per-char scroll scrub, scramble, typewriter, marquee, counters. |
| `references/hover-and-cursor.md` | Pointer interaction. Microstates, magnetic pull, cursor spotlight mask reveal, 3D tilt, group hover. |
| `references/ambient-and-surfaces.md` | Backgrounds and materials. Liquid glass + the mask-composite gradient border, gradient blobs, grain, texture, progressive blur, sheen, beams. |
| `references/responsive-and-a11y.md` | Layout + correctness. The height-locked `--u` unit system, portrait switch, drawers, reduced motion, performance. |
| `references/component-index.md` | Finding a worked example by name. All 144 prompts tagged by technique, with a reverse lookup. |

Drop-in code:

| File | What it is |
|---|---|
| `assets/motion.css` | Token block + every keyframe in this skill + utility classes + reduced-motion handling. Paste into any project. |
| `assets/motion.js` | Zero-dependency runtime: reveal observer, smoothed scroll progress, parallax, video scrub, magnetic, spotlight mask, scramble, counter, marquee, drawer. |

---

## Non-negotiables

Violating any of these is what makes a build read as amateur. They come straight out of the
corpus's "DO NOT" sections.

**Motion**
- One ambient loop per viewport, maximum. Two competing loops read as a screensaver.
- Nothing animates on scroll-back. Reveals fire once (`once: true`, or unobserve after firing).
- The hero media is the stage — it does not fade in with the content.
- No animation on a `backdrop-filter` element's ancestors. See the fill-mode trap below.
- Loops must be seamless: marquee tracks are duplicated and translate to exactly `-50%`.
- **Zero motion is a valid answer.** Five corpus prompts forbid animation outright — when the
  composition and the footage carry it, added motion subtracts. If you can't say what an
  animation is *for*, cut it.

**The `fill-mode` trap** — this one bites everyone: an entrance animation with `forwards` or `both`
leaves a `transform` on the element forever, which creates a containing block and **silently kills
`backdrop-filter` on every descendant**. Your liquid glass turns opaque. Use
`animation-fill-mode: backwards` on any entrance whose subtree contains glass.

**Craft**
- Near-black `#050505`, never `#000`. Near-white `#fafafa`, never `#fff` for body text.
- Headline tracking is negative. Eyebrow/label tracking is positive and uppercase.
- Type scales with `clamp()`, never with a stack of breakpoint overrides.
- Radius is either `999px` (pills) or one consistent value. Never a mix of 8/12/16.
- Every hover has `@media (hover: hover)` around it, and every interactive has `:focus-visible`
  (`outline: 2px solid #fff; outline-offset: 3px`).

**Accessibility**
- `prefers-reduced-motion: reduce` is mandatory, and it means *show the final state instantly* —
  not "run it faster". Kill entrances, kill parallax, kill the ambient loop, keep the layout.
- Background video: `muted playsinline loop` + a `poster` for the buffering window.
- Scroll listeners are `{ passive: true }`. Scroll work happens in `requestAnimationFrame`, never
  in the scroll handler.

---

## Delivery checklist

Before calling a motion build done:

- [ ] Every easing is one of the four tokens
- [ ] Every duration is on the ladder
- [ ] The entrance is a cascade with a per-element delay, not a single group fade
- [ ] Every fade carries a `translate` and (on the hero) a `blur`
- [ ] The entrance runs once and cannot replay
- [ ] `prefers-reduced-motion` shows the finished page with zero movement
- [ ] Exactly one ambient loop, and it loops seamlessly
- [ ] `:focus-visible` on every interactive element
- [ ] Mobile: drawer choreography specified, hover states not stranded on touch
- [ ] Nothing with `backdrop-filter` sits under a `forwards`/`both` entrance
- [ ] It looks finished when nothing is moving
