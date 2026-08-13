# Pattern catalog

Every distinct motion mechanism found across all 144 free MotionSites prompts, with the source
case that demonstrates it best. This is the **completeness index**: if a technique exists in the
corpus, it is listed here, and it points at the reference file that documents it in full.

Prompt ids are the card titles on motionsites.ai — find the card, hit *Copy prompt*.

---

## A. Entrance & page load

| # | Pattern | Mechanism | Source cases | Docs |
|---|---|---|---|---|
| A1 | Staggered fade-up cascade | CSS keyframes + per-element `animation-delay` | bold-studio, cozypaws, innovation-lab, velorah-hero, saas-value | entrance |
| A2 | Blur-fade-up | `blur(20px)→0` + `translateY(40px)→0`, 1s | portal-hero, sentinel-ai-hero, vision-reveal, saas-value | entrance |
| A3 | Line clip reveal | `translate3d(0,110%,0) skewY(2deg)` inside `overflow:hidden` | data-signal, forecast-center, deepthink | text |
| A4 | WAAPI timeline | `Element.animate()` with an absolute delay table | real-time-alerts, cyber-layer, deepthink, autonomous-ops, task-engine | entrance |
| A5 | Pre-paint arming guard | `<head>` class + fallback timeout, released on `animationend` | data-signal, real-time-alerts, autonomous-ops, cyber-layer | entrance |
| A6 | Clip-path wipe entrance | `inset(0 100% 0 0)` → `inset(0)` | cyber-layer, task-engine, forecast-center | entrance |
| A7 | Splash curtain | two panel rows part ±100%, then `splashHide` | vision-reveal, health-portal | entrance |
| A8 | Counter preloader | RAF 000→100 over 2700ms + `scaleX` progress bar | portfolio-cosmic-hero | entrance |
| A9 | Asset-gated start | `.is-ready` on `loadeddata` + `fonts.ready`, 5s timeout | place-saver, real-time-alerts | entrance |
| A10 | Framer variants cascade | shared `fadeUp` variant with `custom={i}` index delay | portal, vaultshield, rocket-cta, cognitra-feature | entrance |
| A11 | Container stagger | `staggerChildren` + `delayChildren` on a parent | arceage-stats, neo-museum, prisma-landing | entrance |
| A12 | Letter-block cascade | per-SVG-polygon `y:120→0`, 1.2s, stagger 0.06 | neo-museum | text |
| A13 | Delayed media mount | `showVideo` flips true after 2800ms | neo-museum | entrance |
| A14 | Sheen finish | skewed light streak sweeps once at the end of the cascade | forecast-center | surfaces |

## B. Scroll systems

| # | Pattern | Mechanism | Source cases | Docs |
|---|---|---|---|---|
| B1 | Reveal on enter | IntersectionObserver `threshold .15`, fires once | intelligent-operations, adhd-planner, beauty-categories, health-portal | scroll |
| B2 | Two-threshold observer | `0.6` sets active nav, `0.15` fires the reveal | adhd-planner | scroll |
| B3 | Lerp-smoothed scroll | `smooth += (target-smooth) * 0.12`, RAF, idle-stop | intelligent-operations, mostar-guide, celestial-renewal | scroll |
| B4 | Layer parallax | far ±160px / mid ±80px / near ±30px | celestial-renewal, haul-footer, rocket-cta, neuralyn-hero | scroll |
| B5 | Spring parallax | `useSpring({stiffness:40, damping:20})` on the transform | pixel-grid-hover, neon-logic | scroll |
| B6 | Sticky cinema rig | `height: 100vh + 3700px` + sticky stage + phase machine | mostar-guide | scroll |
| B7 | `segmentInOut` phases | `smoothstep` in/out pairs → `active` weight per phase | mostar-guide | scroll |
| B8 | Counter-scale UI | `scale: 1/backScale` keeps foreground screen-true | mostar-guide | scroll |
| B9 | Scroll-scrubbed video | `scrollY` → `currentTime`, lerped, poster→video→canvas | intelligent-operations, neon-logic | video |
| B10 | RAF scroll phases | phase 1 slide / phase 2 pin / outro, no scroll events | prompt-hero | scroll |
| B11 | Sticky card stack | sticky cards scale down as later ones arrive | 3d-jack-portfolio-hero | scroll |
| B12 | Scroll-linked marquee | `(scrollY - top + vh) * 0.3`, rows in opposite directions | 3d-jack-portfolio-hero | scroll |
| B13 | Scroll word-spread | items converge from `±(60 + i*40)px` as progress → 1 | sparkform | scroll |
| B14 | 3D scroll rotate | `rotateX(24deg) translateZ(15px)` + spring + `useMotionTemplate` | neon-logic | scroll |
| B15 | Hero fade-out on scroll | `y:[0,-200]`, `opacity:[1,0]` over the first 50% | neuralyn-hero | scroll |
| B16 | Section progress math | `(vh - rect.top) / (vh + rect.height)` clamped | celestial-renewal | scroll |

## C. Typography in motion

| # | Pattern | Mechanism | Source cases | Docs |
|---|---|---|---|---|
| C1 | Word-by-word stagger | split on spaces, `inline-block`, 80–100ms step | prisma-landing, digital-experiences, cognitra-feature | text |
| C2 | Word blur-in | `blur(10px)→0` + `y:50→0` per word | aetheris-voyage-hero, digital-experiences | text |
| C3 | Per-char scroll scrub | `[i/n - .1, i/n + .05]` → opacity `[0.2, 1]` | portfolio-about, prisma-landing | text |
| C4 | Per-word scroll scrub | word index range → opacity `[0.15, 1]` + color | mindloop-landing, neuralyn-hero | text |
| C5 | Scramble decode | 25ms tick, 0.5 char/frame, 3-char noise window | neon-logic | text |
| C6 | Hover scramble | scramble all, reveal at 4 frames/char; snap back on exit | neon-logic | text |
| C7 | Typewriter + caret | `blink 1s step-end infinite` | contact-cybernetic, retro-futurist, dot-hero | text |
| C8 | Count-up | `easeOutCubic`, 1500–2200ms, once, tabular figures | arceage-stats, f1-racing-hub, ai-runtime | text |
| C9 | Staggered count-up | `duration 1500 + i*80`, `delay 480 + i*90` | ai-runtime | text |
| C10 | Marquee | duplicate ×2, `translateX(-50%)`, linear, edge mask | personal-showcase, max-reed-portfolio, halo-usd-landing, digital-epoch-hero | text |
| C11 | Dual-direction marquee | two rows, 22s and 26s, opposite directions | max-reed-portfolio | text |
| C12 | Gradient sweep text | `background-position` 0%→100%, 6s, `bg-clip-text` | designpro-hero, portfolio-cosmic-hero | text |
| C13 | Word pop | overshoot `cubic-bezier(0.34,1.56,0.64,1)` | cozypaws | text |
| C14 | Mask-fade heading | `linear-gradient(white, rgba(255,255,255,.4) 50%, transparent 85%)` clip | f1-racing-hub | text |
| C15 | Speed reveal | `translateX(-100%) skewX(-8deg) blur(8px)` → overshoot → settle | f1-racing-hub | text |

## D. Pointer & cursor

| # | Pattern | Mechanism | Source cases | Docs |
|---|---|---|---|---|
| D1 | Canvas spotlight mask | radial gradient → `toDataURL()` → `mask-image`, lerp 0.1 | interactive-discovery, wellness-device, synth-mode | hover |
| D2 | SVG trail spotlight | 6 chained circles, lerp 0.2 head / 0.35 followers | nike-hover | hover |
| D3 | Morph blob reveal | organic blob trail punches holes in the front layer | orbit-flora | hover |
| D4 | Custom cursor | direct DOM writes + `mix-blend-mode: exclusion` | prompt-hero, network-hero | hover |
| D5 | Magnetic pull | `delta * 0.35`, lerped at 0.15, eases back on leave | — (composed) | hover |
| D6 | 3D tilt + inertia | `rotateX/Y` ≤14°, lerp 0.12 so the card lags the pointer | animated-cards | hover |
| D7 | Pointer parallax | `clientX/innerWidth - 0.5`, near layers travel more | mostar-guide, wanderful-hero, synth-mode, wellness-device | scroll |
| D8 | Mouse-scrubbed video | delta-based scrub, `seeked` chaining, ±50px dead zone | neon-logic, retro-futurist, prompt-hero | video |
| D9 | Cursor-follow border | gradient stroke lights up where the pointer is | rocket-pricing | hover |
| D10 | Hover trigger zones | invisible divs toggle video play/pause | nike-hover | video |
| D11 | Group hover | one parent event, 3+ coordinated child responses | digital-epoch-hero, daisy-wild, neo-museum | hover |
| D12 | Sliding panel hover | background slides `-101%` → `0`, 700ms | neo-museum | hover |
| D13 | Asymmetric burger hover | one bar shrinks, the other grows | neo-museum | hover |
| D14 | Pixel grid ripple | per-cell `transition-delay: i*12ms` | pixel-grid-hover | hover |

## E. Video

| # | Pattern | Mechanism | Source cases | Docs |
|---|---|---|---|---|
| E1 | Autoplay loop plate | `autoplay muted loop playsinline` + `poster` | 82 prompts | video |
| E2 | JS fade-loop | fade out at `duration - 0.55s`, restart, fade in | innovation-landing, transform-data-hero, power-ai-hero, aethera-hero | video |
| E3 | Boomerang canvas | capture frames → ping-pong at 30fps on canvas | ai-workflow, audio-showcase, trustflow, visual-hero | video |
| E4 | Crossfade switcher | N stacked videos, only active at `opacity: 1` | stillmind, creative-portfolio, talent-collective | video |
| E5 | Multi-video sync | master clock, correct drift > 0.12s | cyber-layer | video |
| E6 | Logo-masked video | SVG data-URI `mask-image`, `mask-size: contain` | arceage-stats | video |
| E7 | Clipped video | `clip-path: inset(40% 0 0 0)` — bottom 60% only | wellness-device | video |
| E8 | Progressive blur over video | masked `backdrop-blur` band, no scrim | portal-hero, subscription-agency | surfaces |
| E9 | HLS streaming | `hls.js` + native Safari path | liquid-glass-cta, mindloop-landing, no-code-waitlist, nexacore-control | video |
| E10 | Train bob | `translateY 0→-6px`, 3s, with constant `scale(1.03)` | stillmind | video |
| E11 | Video pointer parallax | GSAP `set` from lerped pointer, wrapper `scale(1.08)` | wanderful-hero | video |
| E12 | SVG color-grade filter | `feColorMatrix` applied to the video container | cyber-layer | video |
| E13 | No-overlay constraint | video plays raw; dimming explicitly forbidden | vex-ventures-hero, aurora-onboard, skybridge-404, halo-use-case | video |
| E14 | Nine-stop bottom fade | perceptual gradient ramp into the page floor | intelligence-layer | surfaces |

## F. Surfaces & ambience

| # | Pattern | Mechanism | Source cases | Docs |
|---|---|---|---|---|
| F1 | Liquid glass | `backdrop-filter: blur() saturate()` + inset highlight | 82 prompts | surfaces |
| F2 | Mask-composite border | `xor`/`exclude` leaves only the padding ring | ~30 prompts (equilibrium, asme-hero, codenest-hero, portal-hero) | surfaces |
| F3 | SVG refraction glass | `backdrop-filter: url(#displace) blur(.3px) saturate(1.3)` | coffee-rewards | surfaces |
| F4 | Animated gradient blobs | `@property` vars + mismatched periods | faq-cta | surfaces |
| F5 | Grain / noise | inline `feTurbulence` SVG, `mix-blend-mode: overlay` | prisma-landing, email-landing-page | surfaces |
| F6 | Texture wash | tiling PNG, `mix-blend-mode: lighten`, opacity .6 | orbis-nft-landing | surfaces |
| F7 | Halftone screen | 4×4px radial-gradient dots, `mix-blend-mode: multiply` | portfolio-cosmic-hero | surfaces |
| F8 | Blend-mode type | `mix-blend-mode: exclusion` accent word over video | orbis-hello, orbis-nft-landing | surfaces |
| F9 | Ring sweep | `conic-gradient` + `rotate(1turn)`, 10s linear, post-entrance | deepthink | surfaces |
| F10 | Float loop | `ease-in-out`, staggered 2.5–3.3s durations | 404, cross-border | surfaces |
| F11 | Dot pulse | `opacity 1→.45`, `scale 1→1.45` | creative-portfolio | surfaces |
| F12 | Chamfered clip-path | octagonal / notched polygon corners instead of radius | launchex-about, innovation-lab | surfaces |
| F13 | Zig-zag mask | multi-point polygon over a solid, animated | stark-minimal-footer | surfaces |
| F14 | Line pulse | 5s `ease-in-out`, fade to .9 opacity then out with slight scale | subscription-agency | surfaces |
| F15 | Edge fade mask | `linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)` | subscription-agency, network-hero | surfaces |
| F16 | Spline / shader hero | `@splinetool/react-spline`; `shaders` npm package | sentinel-ai-hero, modern-agency | — |

## G. Diagrams & data

| # | Pattern | Mechanism | Source cases | Docs |
|---|---|---|---|---|
| G1 | SVG beam state machine | `p1 → splash → p2 → idle`, 3.4s cycle, gradient window | cybersecurity-hero | surfaces |
| G2 | Path draw | `pathLength` 0→1, staggered | cross-border | surfaces |
| G3 | Chart unmask | `clip-path: inset(100% 0 0 0)` per column | task-engine, autonomous-ops | entrance |
| G4 | Radial diagram | labels at a computed radius, shared hover with SVG lines | radial-diagram | — |
| G5 | Canvas sparkline | live-drawn chart in `<canvas>` | autonomous-ops | — |
| G6 | Dissolve transition | `feDisplacementMap` scale→150 + `feColorMatrix` fade, 900ms | neo-museum | — |

## I. Exits & state changes

| # | Pattern | Mechanism | Source cases | Docs |
|---|---|---|---|---|
| I1 | AnimatePresence exit | mount/unmount animation, exit faster than enter | portal, vaultshield, cross-border, organic-odyssey, intelligentx | entrance |
| I2 | `mode="wait"` swap | outgoing finishes before incoming starts; `key` drives it | portfolio-cosmic-hero, no-code-waitlist, neo-museum, contact-cybernetic | entrance |
| I3 | Rotating words | 900ms cycle, `y: 20 → 0 → -20` | portfolio-cosmic-hero | entrance |
| I4 | Media-gated mount | content mounts on `onCanPlay`, then fades | cross-border | entrance |
| I5 | `whileHover` / `whileTap` | declarative scale 1.02–1.05 / 0.9–0.98 | innovation-landing, mindloop-landing, neuralyn-hero, rivr-hero, portal | entrance |
| I6 | CSS-only exit | `visibility` transition delayed by the fade duration | signal-id, ai-runtime | entrance |

## J. Type & colour treatments

| # | Pattern | Mechanism | Source cases | Docs |
|---|---|---|---|---|
| J1 | Gradient text | `background-clip: text` + transparent fill | 13 prompts (stellar-ai-hero, power-ai-hero, cybersecurity-hero, orbit-flora) | text |
| J2 | Vertical fade-out heading | gradient to `transparent 85%` — dissolves, no mask | f1-racing-hub | text |
| J3 | Radial watermark word | `radial-gradient` clipped to text at `opacity .10` | neon-logic | text |
| J4 | Animated gradient sweep | `background-size: 200%` + `background-position` loop | designpro-hero, portfolio-cosmic-hero | text |
| J5 | Sub-pixel text stroke | `-webkit-text-stroke: .12px currentColor` as a weight nudge | data-signal | text |
| J6 | Outlined type | `0.6px` stroke + `paint-order: stroke fill` | place-saver | text |
| J7 | drop-shadow on alpha | follows cutouts, SVG and clipped text (not `box-shadow`) | autonomous-ops, place-saver, 404 | surfaces |
| J8 | Stacked glow shadows | two identical small blurs beat one wide one | autonomous-ops | surfaces |
| J9 | SVG glow filter | `feGaussianBlur` + `feComposite operator="over"` | cybersecurity-hero, nike-hover | surfaces |
| J10 | Contained noise filter | `feTurbulence` + `feComposite operator="in"` | email-landing-page | surfaces |

## H. Layout & structure

| # | Pattern | Mechanism | Source cases | Docs |
|---|---|---|---|---|
| H1 | Height-locked `--u` units | `calc(100dvh / 1058)` against a reference canvas | intelligence-layer, forecast-center | responsive |
| H2 | Container query units | `cqw`/`cqh` against a size container | autonomous-ops | responsive |
| H3 | Aspect-ratio portrait switch | `@media (max-aspect-ratio: 11/10)` → flow layout | intelligence-layer | responsive |
| H4 | Mobile drawer choreography | 5 coordinated animations, asymmetric close | ai-workflow, digital-director, cyber-layer | responsive |
| H5 | Circular clip-path menu | `circle(3%)` → `circle(150%)`, 0.7s | signal-id | responsive |
| H6 | Sheet menu | centered white sheet, radius 28px, `menuIn 0.38s` | ai-runtime | responsive |
| H7 | Phone-frame mockup | device chrome + JS auto-scale to viewport | place-saver, travel-journal, cross-border, coffee-rewards | — |
| H8 | `flex-col-reverse` swap | DOM order preserved, visual order flipped on mobile | daisy-wild | responsive |
| H9 | Infinite slider | 3 cloned sets, instant-jump normalization at the seam | mostar-guide, vortex-studio-hero | scroll |
| H10 | Deliberate stillness | "no animations, no hover states, no scroll effects" | nexacore-control, nexacore-results, orbis-hello, guardnet-benefits, skybridge-404 | — |
| H11 | Container-query sizing | `container-type` + `cqw`/`cqi` — scales a component, not a page | autonomous-ops, cross-border, data-signal | responsive |
| H12 | Undraggable scene layers | `user-select: none; -webkit-user-drag: none; pointer-events: none` | mostar-guide, data-signal, prompt-hero | responsive |
| H13 | Observer cleanup | `cancelAnimationFrame` + `disconnect()` on teardown | nike-hover, interactive-discovery, cybersecurity-hero | responsive |
| H14 | ResizeObserver geometry | recompute SVG paths / slider offsets on element resize | cybersecurity-hero, mostar-guide | responsive |

---

## The stillness cases

H10 deserves its own note. Five corpus prompts specify **zero motion** as a hard constraint:

> *"No animations, no hover states, no scroll effects."*
> *"There are no animations, transitions, hover effects, scroll effects, or JavaScript
> interactions in this section. The only 'motion' comes from the autoplaying video itself."*
> *"All motion comes from the looping background video in Card 2."*
> *"Do not add any interface functionality, transition, fade-in, hover state, mouse-following
> effect, or extra content."*

These are not unfinished prompts. They are the strongest evidence for the budget rule: when the
composition and the footage are doing the work, added motion subtracts. If you cannot name what
an animation is *for*, the corpus's own answer is to delete it.

---

## Coverage

144 prompts · 10 technique families · 108 distinct mechanisms. Every prompt in the corpus maps to
at least one row above; the largest (`animated-cards`, 36k chars) maps to D6, and the most
mechanically dense (`mostar-guide`, 28k) maps to B3, B6, B7, B8, D7, H9, H12 and H14 together.

Coverage was verified mechanically: `tools/gap_analysis.mjs` checks 211 CSS/JS/library features
against both the corpus and this skill, and reports anything the corpus uses that the skill never
mentions. Re-run it after any corpus change.
