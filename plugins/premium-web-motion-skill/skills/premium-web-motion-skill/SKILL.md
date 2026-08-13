---
name: premium-web-motion-skill
description: Build award-tier animated websites — cinematic hero sections, scroll-driven storytelling, kinetic typography, entrance choreography, liquid-glass surfaces, ambient loops, cursor spotlight reveals, marquees and parallax — or write the measured spec-prompt that makes another AI build them. Use for any request about premium/modern/"agency-grade" web animation, motion design, scroll animations, hero sections, landing-page polish, micro-interactions, page transitions, or turning a design/video reference into an exact buildable spec. Also use when the user pastes a detailed design/motion spec to implement — the skill reproduces a supplied spec verbatim rather than imposing its own defaults. Builds React + Tailwind + Framer Motion in TypeScript, split across files, choosing from ten distinct visual directions. Distilled from all 144 free MotionSites.ai component prompts.
---

# Premium Web Motion

A complete motion system for websites that look like they cost $5,000 a section: the timing
tokens, the choreography patterns, the scroll rigs, and — most importantly — **the spec-prompt
format** that turns "make it premium" into a build that lands on the first try.

Distilled from the full corpus of 144 free MotionSites.ai prompts (1.1M characters of measured
production specs). Every number in this skill is one that shipped, not one that was invented.

---

## Rule zero — a supplied spec outranks everything in this skill

**If the user hands you a prompt, spec, reference or exact values, build THAT. Verbatim.**

This skill is a *fallback*, not a filter. Its tokens, palette, cascade and composition rules exist
for one situation only: the user described what they want in a sentence and left every number to
you. The moment a real spec arrives, this skill's defaults stop applying and the spec becomes the
single source of truth.

| The user supplies | What you do |
|---|---|
| A full prompt (e.g. a MotionSites-style spec) | Implement every stated value exactly. Colours, fonts, sizes, durations, easings, delays, copy, DOM order, class names. Do not round, retype or "improve" a single one. |
| Specific values (`#0871E7`, `Anton`, `2.4s`, `ease-in-out`) | Use them. Even where they contradict this skill's tokens. `ease-in-out` at `0.3s` is correct if that is what the spec says. |
| A reference image, site or video | Decompose it (Mode C) and match *it*, not the house style. |
| A design system or existing codebase | Match its tokens. Yours are irrelevant. |
| Only a sentence of intent | **Now** use this skill's defaults, and pick a direction from `references/design-directions.md`. |

### What this forbids

- Substituting `cubic-bezier(0.16,1,0.3,1)` for the easing the spec named.
- Recolouring to `#050505` / `#fafafa` when the spec gave a palette. **Most of the corpus is
  light** — 92 of 144 specs are light-dominant, only 24 dark.
- Replacing the spec's font with Inter or Manrope because they are the frequent ones.
- Imposing the five-beat cascade over a spec that describes its own choreography.
- Cutting elements to hit "5—8 in the first viewport" when the spec lists twelve.
- Adding glass, grain, a gradient plate, a marquee or an ambient loop the spec never mentioned.
- Reducing an ornate spec to a minimal one because minimal reads as "premium" here.

Only three things may be added on top of a supplied spec, because they are correctness rather than
taste: a `prefers-reduced-motion` branch, the `fill-mode` fix where glass would break, and effect
cleanup. **Add** them; never trade away a stated value to get them.

### Source cases — read the real thing when it is installed

Check for `references/source-cases/`. **If it exists, it holds the full verbatim text of all 144
reference cases**, and it is the highest-fidelity material available to you — better than any
summary in this skill.

### The selection protocol — follow it exactly

**Do not "pick the closest match".** That is the single behaviour that collapses 144 references
into one house style: the closest match to "build me a hero" is the same file every time. Select
mechanically instead.

`INDEX.md` organises every case into **disjoint numbered pools** — one direction pool and one
section pool per case — precisely so selection can be computed.

For **each section** you are building:

1. **Form the candidate pool.** Intersect the direction pool (from `design-directions.md`) with the
   section pool (hero / features / pricing / footer / cta / about / mobile / …). If the
   intersection is empty or has fewer than three entries, fall back to the section pool alone.
2. **Compute an offset, don't choose one.** Take the project's brand or product name, sum its
   character codes, and take that modulo the pool size. Add the section's position on the page
   (hero 0, second section 1, …). That index is your **primary case**.
   *This exists so two different projects with the same brief land on different cases. A name is
   the one input that always differs.*
3. **Take two more**, at offset `+7` and `+13` within the same pool, wrapping around. These are
   your **secondary** and **tertiary** cases.
4. **Skip any case already used** anywhere in this page or earlier in this session; advance by one
   until you reach an unused case.

   **When a pool runs out, borrow — never duplicate.** Several section pools are genuinely small:
   `pricing` and `blog` hold 2 cases, and `404`, `stats`, `testimonials`, `carousel` hold 1. If the
   pool cannot supply three distinct cases, take what it has for the primary, then fill the
   remaining roles from the **adjacent pool** below. The same case must never occupy two roles.

   | Thin pool | Borrow motion and detail from |
   |---|---|
   | `pricing` | `features`, then `cta` |
   | `cta` | `features`, then `hero` |
   | `testimonials`, `stats` | `features` |
   | `blog`, `carousel` | `features`, then `hero` |
   | `404` | `hero` |
   | `about` | `hero`, then `features` |
   | `footer` | `cta`, then `features` |

   This is the correct behaviour rather than a workaround: a pricing table's *motion* has more in
   common with a features grid than with the other pricing case, and borrowing is what stops the two
   pricing references from appearing in every pricing block you ever build.
5. **Read all three** — `references/source-cases/<id>.md` — then blend them by role:

| Role | Take from it |
|---|---|
| **Primary** | Composition and layout: DOM order, geometry, element count, responsive rule |
| **Secondary** | Motion: which mechanisms, their durations, easings, delays, stagger |
| **Tertiary** | One detail only: a surface treatment, a border, a hover state, a text effect |

Never take all three layers from one case. The blend is what makes the output new — two projects
that happen to share a primary case still diverge, because their motion and detail come from
different places.

6. **Log the picks in your delivery message**, one line:
   *"Sources — hero: `nexora-hero` + `vision-reveal` + `signal-id`; features: `glow-features` +
   `task-engine` + `nike-hover`."* This is what lets you and the user see the rotation working, and
   it is what makes step 4 possible later in the session.

### What this guarantees

A four-section page draws on **twelve** case readings, three per section, from pools selected by
direction. With 144 cases the combination space is effectively unbounded — the practical guarantee
is narrower and more useful:

- Two different brand names produce different primary cases for the same brief.
- No case repeats inside a page.
- No case repeats inside a session.
- Even a repeated primary yields different motion, because the secondary differs.

**What it does not guarantee:** perfect coverage of all 144 across your whole history. Sessions do
not share memory, so a case used last week may come up again. If you want deliberate coverage, name
cases in the brief — *"use `orbis-hello` as the primary"* — and Rule zero makes that binding.

### Two limits

- **Never read the whole directory.** It is 1.1MB. Open `INDEX.md`, then only the three files you
  computed.
- **These are reference material, not a clipboard.** Take the mechanisms, the timings, the
  structural decisions. Do not reproduce someone's brand copy, their asset URLs, or their company
  name into a user's project — replace all of it with the user's own content.

If `references/source-cases/` is **absent** — which is the case for anyone who installed the
published plugin — say nothing about it and work from the distilled references
(`pattern-catalog.md`, `design-directions.md`, `component-index.md`) as normal. They are complete
on their own; the source cases are an enrichment, not a dependency.

### Combine, don't converge

The corpus is 144 *different* designs. When you are inventing rather than implementing, compose —
a palette from one direction, a scroll rig from another, a signature mechanism from a third. Read
`references/design-directions.md` before deciding anything visual, and `references/pattern-catalog.md`
for the mechanism menu. **Ten builds should look like ten sites, not one site ten times.**

---

## The one idea (applies only when *you* are choosing the numbers)

**Premium motion is not more animation. It is fewer moves, measured exactly, in one direction.**

Amateur output animates twelve things with default `ease` at `0.3s`. Premium output moves six
things along one decelerating curve, each 60–120ms behind the last, with a blur that resolves
as they arrive — and then stops. The corpus is unanimous on this: 34 prompts use
`cubic-bezier(0.16, 1, 0.3, 1)`, 30 use `cubic-bezier(0.22, 1, 0.36, 1)`, and essentially
nothing uses a bounce.

Two failure modes to actively design against:

- **Motion soup** — everything moving at once, no hierarchy, no rest state. Fix: one entrance
  cascade, then stillness except for a single ambient loop.
- **Cheap motion** — 300ms `ease-in-out`, uniform delays, opacity-only fades, a spinning gradient
  blob. Fix: the token table below, plus a `blur()` or `scale()` companion on every fade.

---

## Choose your mode

**Mode A — Build it.** The user wants a page/section/component.

1. **Is there a spec?** If the user pasted one, or pointed at a file, implement it verbatim
   (Rule zero) and skip to step 5.
2. **Choose a direction** — `references/design-directions.md`. Do this before any code, and do not
   default to the dark cinematic look.
3. **Run the selection protocol per section** if `references/source-cases/` is installed — pool,
   computed offset, three cases blended by role. Never "closest match".
4. Read `references/motion-tokens.md`, then the one or two recipe files the direction needs.
5. Read `references/project-structure.md` and write the code **split across files**.

### The stack is fixed

**React + Tailwind CSS + Framer Motion (`motion/react`), in TypeScript.** Always. This matches the
corpus — 123 of 144 specs are React, 116 Tailwind, 86 TypeScript, 41 Framer Motion.

Three exceptions, all explicit:

- The **spec or user names a different stack** — follow it (Rule zero).
- The user says **"one file" / "no build step" / "no dependencies"**, or it is a CMS paste or an
  emailable demo — then single-file HTML with `assets/motion.css` + `assets/motion.js`.
- You are **adding to an existing project** — match that project's stack and conventions.

### The structure is not optional

**Never dump a build into one file.** Split by responsibility — sections, sub-components, variants,
hooks, tokens and content each in their own file and folder. Full tree, size ceilings and the
per-file rules are in `references/project-structure.md`; read it before writing multi-file output.

The short version: `components/sections/<section>/` holds the section shell plus its parts and its
`*.variants.ts`; `components/ui/` holds anything reusable; `lib/motion.ts` is the only place an
easing is ever typed; `content/*.ts` holds every string. A page file is composition only. Any file
over **250 lines is a defect** — split it.

**Mode B — Spec it.** The user wants a *prompt* — a brief for another AI (v0, Lovable, Bolt,
Figma Make, Claude) to build from. Read `references/prompt-blueprint.md` and follow the template
exactly. This is the MotionSites product, reverse-engineered.

**Mode C — Match a reference.** The user points at a site, video, or screenshot and says "like
this". Run the *reference decomposition* below, then Mode A or B.

If the user's ask is ambiguous between A and B, build it (Mode A) and note that you can also emit
the reusable spec-prompt.

---

## Motion tokens — the fallback set

**Scope: use these when nobody gave you numbers.** A supplied spec's easings and durations always
win, even when they are values this table would not have chosen (Rule zero). These are the corpus
*mode*, not the corpus *range* — the range is much wider, and other directions draw from other
parts of it.

Full derivation, per-property distance scales and the ranked frequency data are in
`references/motion-tokens.md`.

### Easing — four that cover most cases

| Token | Curve | Use for |
|---|---|---|
| `--ease-out-expo` | `cubic-bezier(0.16, 1, 0.3, 1)` | **The default.** Entrances, reveals, anything arriving. |
| `--ease-out-quint` | `cubic-bezier(0.22, 1, 0.36, 1)` | Slightly softer arrival — large elements, drawers, cards. |
| `--ease-in-out-quart` | `cubic-bezier(0.76, 0, 0.24, 1)` | Symmetric moves: line draws, panel swaps, exits. |
| `--ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | Small UI state changes only (color, opacity — under 200ms). |

Never `ease`, never `ease-in-out` on an entrance, never a spring overshoot unless the brand is
explicitly playful (`cubic-bezier(0.34, 1.56, 0.64, 1)` is the only sanctioned overshoot).

### Duration — snap to this ladder

`100 · 150 · 200 · 300 · 400 · 500 · 600 · 700 · 800 · 900 · 1000 · 1100 · 1200ms`

| Band | Range | What lives here |
|---|---|---|
| Microstate | 140–200ms | hover color, opacity, `brightness(1.08)`, `active: scale(.95)` |
| UI transition | 300–500ms | menu overlay fade, icon morph, tab swap, drawer 450–500ms |
| Entrance element | 600–900ms | fade-up, blur-in, scale-in — **800ms is the corpus median** |
| Hero / stage | 1000–1400ms | headline reveal, hero image rise, big card settle |
| Ambient loop | 3–30s | marquee 20–30s, gradient drift 4–6s, float 2.5–3.3s, ring sweep 10s |

### Stagger — the signature

| Context | Step | Example ladder |
|---|---|---|
| Nav links / chips | 45–60ms | 130 / 175 / 220 / 265ms |
| Menu drawer items | 60–70ms | `100 + i * 60` |
| Content blocks | 100–150ms | `150 + i * 120` |
| Hero cascade beats | 150–250ms | 0 / 0.2 / 0.4 / 0.6s |
| Per-word text | 80–100ms | word index × 100ms |
| Per-character text | 15–25ms | char index × 0.015s |

**Never a uniform stagger across the whole page.** Chrome (nav/brand) is fast and tight;
the hero cascade is slow and wide.

### Distance — motion travels less than you think

| Element | Travel |
|---|---|
| Nav link, chip, small label | 6–8px |
| Body copy, button | 10–16px |
| Card, panel | 20–30px |
| Hero headline | 40–64px, or `110%` of its own line box when clipped |
| Scale companion | `0.94 → 1` (small) · `0.968 → 1` (card) · `1.03 → 1` (image settle) |
| Blur companion | `blur(6px)` subtle · `blur(10–12px)` signature · `blur(20px)` dramatic |

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

Total runtime 1.2–1.6s.

**This is a fallback score, not a law.** It is what a strong dark cinematic hero does when nobody
specified otherwise. A supplied spec's own choreography replaces it entirely, and other directions
choreograph differently — D2 Product Clarity uses shorter distances and three beats, D4 Brutalist
cuts rather than cascades, D9 Warm Organic runs slower with no blur.

| Beat | Elements | Delay | Duration | Move |
|---|---|---|---|---|
| 1 | brand mark | 60ms | 580ms | fade + up 7px + scale .94→1 |
| 2 | nav links, header CTA | 130–265ms (45ms step) | 480–520ms | fade + up 6–8px |
| 3 | headline line 1 → line 2 | 300ms → 440ms | 800 / 850ms | clip reveal: `translateY(110%) skewY(2deg)` → 0 |
| 4 | subcopy, then CTA pair | 740ms → 960ms | 620 / 560ms | fade + up 10–14px |
| 5 | hero media / card / logo strip | 1040ms | 920–1100ms | fade + up 12px + scale .968→1 |

Two hard rules from the corpus:

1. **The background never animates in.** The video/photo plate is the stage — it is already there
   when the content arrives. Fading the whole page in is the tell of a cheap build.
2. **The cascade runs once.** Never on resize, never on route re-entry, never replayed on scroll-back.

Implementation options (all three in `references/entrance-choreography.md`): pre-paint CSS class
with `animation-delay` (simplest), WAAPI timeline (most controllable), Framer Motion variants
(React). All three need the pre-paint guard so the finished page never flashes before the
animation arms:

```html
<script>
  // In <head>, BEFORE the stylesheet. No class is added if JS is off,
  // so the complete page renders statically — that is the whole no-JS story.
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches && Element.prototype.animate) {
    document.documentElement.classList.add('entrance-pending');
    window.__entranceFallback = setTimeout(
      () => document.documentElement.classList.remove('entrance-pending'), 3500);
  }
</script>
```

---

## Reference decomposition (Mode C)

When handed a "make it like this" reference, extract in this order — this is the order the corpus
prompts are written in, and it is the order that makes a build reproducible:

1. **Stage** — what fills the first viewport? Video plate / photo / flat color / canvas. Full-bleed
   or inset? What are the fade overlays at its edges?
2. **Composition** — count the elements. Premium heroes have 5–8 total. Write down what is *not*
   there (no cards, no badges, no stat strip) — the negative list matters as much as the positive.
3. **Type** — display family + UI family, the two of them. Sizes in `clamp()`. Tracking on the
   headline (almost always negative: `-0.02em` to `-0.08em`).
4. **Palette** — 5–7 tokens max, as CSS variables. Near-black is `#050505`, not `#000`.
5. **Motion inventory** — list every moving thing and classify each as: entrance / scroll-driven /
   hover / ambient loop. If a category is empty, say so explicitly.
6. **Timing** — for each move: trigger, delay, duration, easing, distance.
7. **Responsive rule** — what collapses, what hides, what reflows, at which breakpoint.
8. **Constraints** — the "do not" list.

---

## Reference library

Read the file that matches the work. Each is self-contained; don't read them all.

| File | Read it when |
|---|---|
| `references/design-directions.md` | **Read on every build you design yourself.** Ten distinct visual directions with palettes, type pairings and motion signatures, the sector table, and the anti-monotony rules. |
| `references/project-structure.md` | **Read before writing multi-file output.** The React/Tailwind/Framer/TS tree, file-size ceilings, where tokens, variants, hooks and content live. |
| `references/prompt-blueprint.md` | **Mode B.** Writing a spec-prompt. The full 14-section template + language rules + pre-flight check. |
| `references/example-prompts.md` | **Mode B.** Four complete copy-ready prompts at four scales, to adapt rather than start blank. |
| `references/pattern-catalog.md` | **Start here when unsure.** All 108 mechanisms across the corpus in 10 families, each pointing at its source case and its docs file. |
| `references/motion-tokens.md` | Any build. Full token tables, corpus frequency data, per-property scales, the token CSS block. |
| `references/entrance-choreography.md` | Page-load animation. CSS / WAAPI / Framer, the pre-paint guard, clip-path wipes, splash gates, the fill-mode trap. |
| `references/scroll-systems.md` | Anything scroll-driven. Reveal observer, lerp smoothing, parallax, sticky cinema rig, phase math, pinned panels. |
| `references/video-techniques.md` | Any video plate. All eight mechanisms — fade-loop, boomerang canvas, crossfade switcher, scroll/mouse scrub, sync, masking, overlay strategy. |
| `references/text-effects.md` | Kinetic typography. Line clip reveal, word stagger, per-char scroll scrub, scramble, typewriter, marquee, counters. |
| `references/hover-and-cursor.md` | Pointer interaction. Microstates, magnetic pull, cursor spotlight mask reveal, 3D tilt, group hover. |
| `references/ambient-and-surfaces.md` | Backgrounds and materials. Liquid glass + the mask-composite gradient border, gradient blobs, grain, texture, progressive blur, sheen, beams. |
| `references/responsive-and-a11y.md` | Layout + correctness. The height-locked `--u` unit system, portrait switch, drawers, reduced motion, performance. |
| `references/component-index.md` | Finding a worked example by name. All 144 prompts tagged by technique, with a reverse lookup. |
| `references/source-cases/INDEX.md` | **Only if the directory exists.** Lookup table for the verbatim reference cases: id, title, category, section type, signal tags. Open the index, then the one or two cases you need — never the whole directory. |

Drop-in code:

| File | What it is |
|---|---|
| `assets/motion.css` | Token block + every keyframe in this skill + utility classes + reduced-motion handling. Paste into any project. |
| `assets/motion.js` | Zero-dependency runtime: reveal observer, smoothed scroll progress, parallax, video scrub, magnetic, spotlight mask, scramble, counter, marquee, drawer. |

---

## Two tiers of rule — know which you are applying

Everything below is split by authority. Getting this backwards is what turns the skill into a
template stamper.

### Tier 1 — always true (correctness)

These hold even against a supplied spec, because they are bugs rather than opinions. Add them; do
not trade a stated value away to get them.

- `prefers-reduced-motion: reduce` is handled, and it means *show the final state instantly* — not
  "run it faster". Kill entrances, parallax and the ambient loop; keep the layout.
- Reveals fire **once**. Nothing re-animates on scroll-back (`once: true`, or unobserve).
- Loops are seamless: marquee tracks duplicated, translating to exactly `-50%`.
- `:focus-visible` on every interactive element; hover effects wrapped in `@media (hover: hover)`
  so they are not stranded on touch.
- Scroll listeners `{ passive: true }`; scroll work inside `requestAnimationFrame`, never in the
  handler. Every effect cleans up (`cancelAnimationFrame`, `disconnect()`, `removeEventListener`).
- Background video: `muted playsInline loop` + a `poster`.
- **The `fill-mode` trap** — an entrance with `forwards` or `both` leaves a `transform` on the
  element forever, which creates a containing block and **silently kills `backdrop-filter` on every
  descendant**. Your glass turns opaque with nothing in DevTools to explain it. Use
  `animation-fill-mode: backwards` on any entrance whose subtree contains glass.
- No emoji (see below) — a house rule, but absolute.

### Tier 2 — defaults, and they yield to the brief

Apply these **only where the spec, reference or user is silent**. Each is a good bet in a vacuum
and wrong the instant someone specifies otherwise.

- One ambient loop per viewport. *(D7 Neon Night runs two by design. A spec that asks for three
  gets three.)*
- The hero media is the stage — it does not fade in with the content.
- Near-black `#050505` over `#000`, near-white `#fafafa` over `#fff` for body text. **This is a
  dark-direction rule and dark is the minority** — 92 of 144 corpus specs are light-dominant. On a
  light build the equivalent is a warm ground (`#fbfbfa`, `#F3F4ED`) and ink at `#0a0a0a`, and on a
  chromatic ground (D7) it is neither.
- Headline tracking negative, eyebrow tracking positive and uppercase. *(Serif display wants far
  less negative tracking than a grotesk — roughly `-0.02em` against `-0.05em`.)*
- Type scales with `clamp()` rather than a stack of breakpoint overrides.
- Radius is `999px` for pills plus one consistent value elsewhere. *(D4 Brutalist uses `0`
  throughout — that is the direction, not a violation.)*
- Five to eight elements in the first viewport. *(An editorial or interface-dense direction
  legitimately carries more. Count what the spec lists and build that.)*
- **Zero motion is a valid answer.** Five corpus prompts forbid animation outright — when the
  composition and the footage carry it, added motion subtracts. If you can't say what an animation
  is *for*, cut it.

When a Tier 2 default and the brief disagree, **the brief wins and you say nothing about it.** Do
not append a note explaining that you would have done it differently.

**Characters, copy and tone — no emoji, ever**

This is a hard constraint, not a preference. Emoji are the single fastest way to make an expensive
page read as a hobby project, and no premium reference in the corpus contains one.

- **Never emit an emoji or pictograph.** Not in headings, body copy, buttons, nav labels, badges,
  eyebrows, form placeholders, empty states, toasts, error messages, `alt` text, `<title>`,
  meta descriptions, code comments, `console.log`, commit messages, file names, or the chat
  reply that delivers the work. There is no context in this skill where one is correct.
- **No emoji-as-icon.** A feature card gets a real inline `<svg>` (`stroke-width: 1.5`,
  `currentColor`, 20—24px) or a licensed icon set — never a rocket, sparkle, checkmark, fire or
  lightbulb glyph standing in for artwork. If no icon is available, use a number, a rule, or
  nothing. Nothing is a legitimate design choice; a pictograph is not.
- **No decorative ASCII or symbol art** in shipped output: no `~~~` / `***` / `>>>` rules, no
  stars, sparkles, triangles or bullets-as-ornament, no box-drawing borders in UI copy, no ASCII
  dividers between sections. A divider is a `1px` rule at `rgba(255,255,255,.08)`.
- **Typographic characters are not decoration and stay allowed:** em dash, en dash, curly quotes
  and apostrophes, `×` for dimensions, `·` as a separator, `≤` `≥` `≈` in specs, `→` in a real
  directional label. Use these correctly — a straight `'` in display copy is a typo at this tier.
- **Copy tone is understated.** No exclamation marks in UI copy (an error message never shouts).
  No hype vocabulary: *revolutionary, game-changing, unleash, supercharge, effortlessly, insanely,
  10x, next-level, mind-blowing*. No ALL-CAPS for emphasis outside a tracked eyebrow label. Write
  the way the reference brands write: short, concrete, declarative, slightly cold.
- **This applies to Mode B output too.** A spec-prompt is a professional document. Structure it
  with plain headings and dashes, and carry a `no emoji, no emoji-as-icon` line into its DO NOT
  section so the downstream builder inherits the rule.

If the user explicitly asks for emoji, that overrides this section. Nothing else does — not a
playful brief, not a consumer product, not a "fun" landing page.

---

## Delivery checklist

**If a spec was supplied, run this one first:**

- [ ] Every colour, font, size, duration, easing, delay and string matches the spec exactly
- [ ] Nothing was added that the spec did not ask for (no stray glass, grain, marquee, loop)
- [ ] Nothing was cut to satisfy a Tier 2 default
- [ ] Element count and DOM order match what the spec listed

**Every build:**

- [ ] Files are split by responsibility — no section dumped into one file, nothing over 250 lines
- [ ] Easings and durations live in `lib/motion.ts`; no cubic-bezier is retyped in a component
- [ ] The entrance is a cascade with per-element delay, not a single group fade
- [ ] The entrance runs once and cannot replay
- [ ] `prefers-reduced-motion` shows the finished page with zero movement
- [ ] Ambient loops are seamless, and the count is deliberate
- [ ] `:focus-visible` on every interactive element
- [ ] Mobile: drawer choreography specified, hover states not stranded on touch
- [ ] Nothing with `backdrop-filter` sits under a `forwards`/`both` entrance
- [ ] **Zero emoji** in markup, copy, `alt` text, comments or the delivery message; icons are real SVG
- [ ] Copy has no exclamation marks and no hype vocabulary; quotes and dashes are typographically correct
- [ ] It looks finished when nothing is moving

**Variety check — only when you chose the design yourself:**

- [ ] A named direction from `references/design-directions.md` was chosen deliberately
- [ ] The tone (light / dark / chromatic) suits the sector rather than reflexively going dark
- [ ] The motion inventory spans **three** different catalog families, not one repeated reveal
- [ ] There is exactly one signature mechanism, and it differs from the last build
- [ ] The direction is stated in one line on delivery

**Source-case check — only when `references/source-cases/` is installed:**

- [ ] Three cases per section, selected by computed offset — not by "closest match"
- [ ] Composition, motion and detail came from **different** cases, not all from the primary
- [ ] No case was reused across sections or earlier in the session
- [ ] The picks are listed in the delivery message so the rotation is visible
- [ ] No source case's brand name, copy or asset URL survived into the output
