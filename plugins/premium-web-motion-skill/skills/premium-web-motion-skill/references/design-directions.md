# Design directions — pick one before you write a line of code

**Read this file on every Mode A and Mode C build.** It exists to stop the single most common
failure of this skill: every output looking like the same dark cinematic hero.

## The correction

The corpus is **not** one aesthetic. Measured across all 144 reference specs:

| Axis | What the corpus actually does |
|---|---|
| Tone | **92 light-dominant · 24 dark-dominant · 28 mixed.** Light is the majority, not the exception |
| Accent hue | blue 30 · orange/amber 25 · green 22 · red 17 · violet 15 · cyan/teal 13 · yellow/lime 9 · magenta/pink 8 · rose 6 |
| Display type | Inter 231 · **Instrument Serif 89** · Geist 31 · DM Sans 21 · Helvetica Neue 19 · **Anton 18** · Manrope 17 · **JetBrains Mono 16** · Sora 12 |
| Composition | centered 106 · full-bleed media 70 · two-column split 28 · card grid 17 · carousel 21 · bento 4 |
| Depth | sticky/scroll-driven 91 · 3D perspective 54 · layered overlap 47 |

If your last three builds were all near-black with Manrope and a video plate, you have been
sampling one corner of a 144-case space. **Near-black is a direction, not a default.**

**These are not a quality ladder.** No direction here is more "premium" than another — D9 Warm
Organic is not a lesser D1. They are ten different answers, and the brief decides which is correct.
A direction chosen because it looks expensive is a direction chosen wrongly.

## Selection rule (mandatory)

1. **The brief picks the direction.** Industry, audience and mood decide it — a wellness brand and
   a cybersecurity brand do not get the same page. Match the direction to the content. If the user
   stated a theme, that is the answer; this table is only for when they did not.
2. **When the brief is silent, do not fall to Direction 1.** Choose by the sector table below. If
   the sector is unclear, choose the direction whose *content shape* fits (long copy → editorial;
   a product with states → interface; a single claim → statement).
3. **Never repeat the previous direction in the same session** unless the user asks for a matching
   section. If you have just built a dark cinematic hero and they ask for a features section,
   build it in the same direction *as a system* — same tokens, same type — but do not restart the
   dark-hero recipe for an unrelated new project.
4. **State the direction in one line** when you deliver: *"Built in the Editorial Light direction
   (D3) — warm off-white, Instrument Serif display, asymmetric two-column."* One line, so a
   redirect costs nothing.
5. **Mix mechanisms across families.** A direction fixes the *look*; it does not fix the motion
   inventory. Pull from at least three different `pattern-catalog.md` families in any build of
   section size or larger — an entrance (A), a scroll behaviour (B), and one of pointer (D) /
   type (C) / surface (F). A page that only does fade-up reveals is under-built regardless of
   which direction it wears.

### Sector → direction

| Sector in the brief | Start here |
|---|---|
| SaaS, dev tools, API, infrastructure | D6 Technical Interface, D2 Product Clarity |
| AI / agents / automation | D2 Product Clarity, D6 Technical Interface, D8 Aurora Gradient |
| Agency, studio, portfolio | D1 Cinematic Dark, D4 Brutalist Statement |
| Fashion, beauty, lifestyle | D3 Editorial Light, D9 Warm Organic |
| Travel, hospitality, real estate | D5 Photographic Full-bleed, D3 Editorial Light |
| Wellness, health, medicine, church | D9 Warm Organic, D2 Product Clarity |
| Finance, analytics, dashboards | D2 Product Clarity, D6 Technical Interface |
| Crypto, NFT, gaming, 3D | D7 Neon Night, D10 Dimensional 3D |
| Education, community, non-profit | D3 Editorial Light, D9 Warm Organic |
| Cybersecurity, enterprise | D6 Technical Interface, D1 Cinematic Dark |

---

## D1 — Cinematic Dark

The one this skill over-uses. Genuinely correct for agencies, studios, portfolios and product
launches where footage carries the page. Wrong for most other briefs.

- **Palette** — stage `#050505`, ink `#fafafa`, muted `#a7a6a6`, hairline `rgba(255,255,255,.10)`,
  one accent only. Never `#000`, never pure `#fff` for body copy.
- **Type** — one grotesk at 400—500 (Manrope, Geist, Helvetica Neue), display tracking `-0.04em`
  to `-0.06em`. Optional italic serif accent word (Instrument Serif) inside the headline.
- **Layout** — full-bleed media, content held left or centred over it, nine-stop bottom fade,
  trust strip at the base.
- **Motion** — five-beat entrance cascade, one ambient loop (slow gradient drift or the video
  itself), scroll reveals below the fold, magnetic primary CTA.
- **Cases** — `bold-studio`, `celestial-renewal`, `max-reed-portfolio`, `digitwist-hero`,
  `aethera-hero`, `codenest-hero`.

## D2 — Product Clarity (light)

The workhorse of the corpus and the correct default for most SaaS and AI briefs.

- **Palette** — canvas `#ffffff` or `#fbfbfa`, ink `#0a0a0a`, muted `#6b7280`, border `#e8e8e6`,
  one saturated accent (blue `#0871E7`, violet `#7c3aed`, or green `#16a34a`). Surfaces are white
  cards on a faintly warm ground, never grey-on-grey.
- **Type** — Inter or Geist throughout, 400/500/600. Display tracking `-0.03em`. Eyebrow labels
  uppercase `0.14em`, muted.
- **Layout** — centred headline block, product screenshot or UI mock below on a soft plinth
  (`shadow`, subtle border, slight `rotateX` if 3D), logo strip, then a three-card feature grid.
- **Motion** — restrained. Entrance cascade at reduced distances (6—10px, not 24px), reveal-once
  on the grid with a 90ms stagger, hover lift `translateY(-4px)` + border brighten. **No ambient
  loop in the hero** — clarity is the product.
- **Cases** — `autonomous-ops`, `data-signal`, `intelligent-operations`, `ai-workflow-agents`,
  `convix-software-hero`, `asme-hero`.

## D3 — Editorial Light

Magazine logic: a serif that carries the voice, generous measure, asymmetry instead of centring.

- **Palette** — warm off-white ground `#F3F4ED` / `#faf8f4`, ink near-black `#1a1a1a`, a deep
  natural secondary (olive `#2A3616`, ink-blue `#16324f`, oxblood `#5b1f1f`), one pale tint block
  (`#DEF0FC`) used as a field, not an accent.
- **Type** — **Instrument Serif** (or Playfair / Cormorant) display at 400 + italic, paired with
  Inter at 400/500 for everything else. Display tracking near `-0.02em` — serifs need less
  negative tracking than grotesks. Large measure: 60—70ch body.
- **Layout** — asymmetric two-column, off-centre headline, images breaking the grid, captions in
  small italic. Whitespace is the material.
- **Motion** — slow and few. Line-clip reveal on the headline (800—900ms), image reveals with a
  `clip-path` wipe rather than a fade, per-word stagger on the pull quote, zero hover theatre.
- **Cases** — `dot-hero`, `aetheris-voyage-hero`, `build-with-us`, `blog-showcase`, `axion-about`.

## D4 — Brutalist Statement

One claim, enormous, nothing else. High risk, high reward — correct when the brand *is* the
attitude.

- **Palette** — two colours and a hairline. Black on acid (`#050505` / `#d8ff3e`), black on white,
  or white on a single saturated field. No gradients, no glass, no shadows.
- **Type** — condensed display at extreme scale: **Anton**, Bebas Neue, or a grotesk at 900 with
  `-0.06em` tracking, uppercase, `line-height: 0.86`. Body in the same family, tiny.
- **Layout** — headline fills the viewport edge to edge (`clamp(56px, 13vw, 220px)`). Marquee
  strip. Hard-edged blocks, `border: 1px solid` everywhere, radius `0`.
- **Motion** — cut, don't ease. `steps()` transitions, instant colour inversions on hover,
  a marquee at `linear` 20—30s, per-character scramble on the headline. Deliberately mechanical.
- **Cases** — `orbis-hello`, `neon-logic`, `cross-border`, `3d-collectible-hero`.

## D5 — Photographic Full-bleed

Travel, hospitality, property, food. The photograph is the design; the type serves it.

- **Palette** — derived from the image. Ink is always `#fff` with a scrim, never a colour. One
  warm accent pulled from the photo for the CTA.
- **Type** — light-weight grotesk (300/400) at large size, generous positive tracking on the
  eyebrow (`0.2em`), so the type never competes with the image.
- **Layout** — edge-to-edge image or video, content anchored bottom-left or centred low, a scrim
  that is a *multi-stop* gradient (never a flat `rgba(0,0,0,.4)` — that is the tell of a template).
  Horizontal card rail below the fold.
- **Motion** — a 1.06 → 1.0 slow scale settle on the image over 1.4s, parallax on the plate at
  `-80px`, crossfade switcher if there are multiple images, drag-scroll on the card rail.
- **Cases** — `mostar-guide`, `daisy-wild`, `coffee-rewards`, `celestial-renewal`.

## D6 — Technical Interface

For developer tools, security, infrastructure. Legibility as aesthetic.

- **Palette** — either near-black `#0b0d0e` with a terminal-green or cyan accent, or light
  `#fcfcfc` with graphite ink. Semantic colour is functional here (pass/fail/warn), not decorative.
- **Type** — **JetBrains Mono** or IBM Plex Mono for labels, code, metrics and eyebrows; Inter or
  Geist for prose. Monospace is the signature — use it on data, never on paragraphs.
- **Layout** — dense. Bordered panels, a real code block, terminal output, a log/table, spec rows
  with dotted leaders. Grid lines are visible on purpose.
- **Motion** — typewriter or scramble on the terminal line, counters on metrics, `stroke-dasharray`
  line-draw on connector diagrams, tab crossfades. Nothing bounces; everything is quick (200—400ms).
- **Cases** — `ai-runtime`, `cyber-layer`, `digital-director`, `halo-usd-landing`, `dot-hero`.

## D7 — Neon Night

Crypto, gaming, NFT, nightlife. Saturated light on deep colour — this is *not* D1 with a colour.

- **Palette** — deep chromatic ground (navy `#010828`, aubergine `#12061f`) rather than neutral
  black, plus **two** electric accents (acid lime `#6FFF00`, magenta `#b724ff`, violet `#7c3aed`).
  Glow is a colour, not a shadow.
- **Type** — Anton or a wide grotesk, uppercase, heavy. Optional monospace for ticker data.
- **Layout** — layered stacks, orbital rings, badge chips, oversized numerals, a 3D object or card
  carousel at the centre.
- **Motion** — the busiest direction and the only one allowed two ambient loops: a slow ring sweep
  plus a gradient drift. `drop-shadow` glow pulses (2.4—3.4s), conic-gradient border rotation,
  hover states that raise saturation rather than brightness.
- **Cases** — `orbis-nft-landing`, `neon-logic`, `arceage-stats`, `cyber-layer`.

## D8 — Aurora Gradient

Soft chromatic bloom on light or near-white. The current default look of AI products — use it
knowingly, because it dates fastest.

- **Palette** — white or `#fafaff` ground, two or three low-opacity radial blooms (violet, cyan,
  rose) at 12—20% alpha, ink `#0a0a0a`. The blooms must be *behind* content, never under text
  without a scrim.
- **Type** — Inter / Plus Jakarta / Sora at 400—600, `-0.035em`. Gradient text on **one** phrase
  maximum, via `background-clip: text`.
- **Layout** — centred, generous, a glass card or input as the focal object, pill nav floating.
- **Motion** — the blooms drift on mismatched periods (17s / 19s / 23s so the composite never
  repeats), `@property` interpolated positions, glass surfaces with the mask-composite gradient
  border, gentle 8px entrance rises.
- **Cases** — `agent-grove`, `aurora-onboard`, `ai-image-generator-ui`, `mindloop-landing`.

## D9 — Warm Organic

Wellness, health, food, community, church. Human-scale, rounded, tactile.

- **Palette** — warm neutrals (`#f7f2ea`, `#efe6d9`), clay / terracotta / sage accents
  (`#c96f4a`, `#7d8f69`), deep brown ink `#2b2118` instead of black. Never a cool grey.
- **Type** — a humanist or soft-geometric sans (DM Sans, Outfit, Figtree) at 400/500, or a serif
  display with generous line-height (1.15 on display, 1.7 on body). Tracking near `0` — tight
  tracking reads corporate.
- **Layout** — rounded everything (`radius: 24—32px`), overlapping photo cards, hand-drawn or
  organic blob shapes, asymmetric collage.
- **Motion** — the gentlest set. 600—800ms rises of 8—12px, a slow float loop (2.5—3.3s) on one
  decorative element, hover scale `1.02`. No blur, no clip wipes, no scramble.
- **Cases** — `church-community`, `cozypaws`, `celestial-renewal`, `beauty-categories`.

## D10 — Dimensional 3D

When the product *is* an object: hardware, collectibles, cards, devices.

- **Palette** — a neutral studio ground (light `#f4f4f2` or dark `#0c0c0d`) so the object owns all
  the colour. One rim-light accent.
- **Type** — minimal and small. The object is the headline; type is a caption around it.
- **Layout** — object centred, `perspective: 1200px` on the container, spec rows or a thumbnail
  rail beneath, generous margin around the object.
- **Motion** — the heaviest rig: `rotateY` carousel on a cylinder, pointer-driven tilt with lerp
  0.12, scroll-scrubbed rotation, counter-scaled labels so text stays legible while the parent
  scales. Ambient: a 20—30s idle rotation that pauses on interaction.
- **Cases** — `3d-collectible-hero`, `3d-jack-portfolio-hero`, `animated-cards`,
  `ai-image-generator-ui`.

---

## Combining without going generic

A build is not "direction + fade-ups". Compose it:

| Slot | Pull from | Rule |
|---|---|---|
| Entrance | catalog family **A** | One cascade, five beats, per-element delay |
| Scroll | family **B** | At least one: reveal, parallax, sticky rig, or scrub |
| A signature | family **C**, **D**, **E** or **F** | The one thing a visitor would describe afterwards |
| Surface | family **F** | Glass, grain, gradient field, or nothing — a deliberate choice |
| Exit / state | family **I** | Only if the page has states (tabs, modal, route change) |

**The signature is what makes it memorable and it must differ between builds.** Rotate it: a
cursor spotlight mask, a scramble headline, a boomerang video, a mask-composite glass border, a
3D tilt rail, a scroll-scrubbed counter, a clip-path wipe between sections, a magnetic CTA, a
conic border sweep, a per-character scroll scrub. Ten builds should have ten different signatures.

## Direction fidelity check

Before delivering, confirm the direction actually landed:

- [ ] Could someone name the direction from a screenshot with the logo removed?
- [ ] Is the tone (light/dark) a decision that matches the sector, not a habit?
- [ ] Is the display face doing work, or is it Inter-by-default in a brief that wanted voice?
- [ ] Does the motion inventory span **three** catalog families, not one?
- [ ] Is there exactly one signature, and is it different from the last build?
- [ ] Would the palette survive being described in five words to a client?
