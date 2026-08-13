# Example spec-prompts

Four complete, copy-ready prompts at four scales. These are the format from
`prompt-blueprint.md` at full size — use them as templates: swap the copy, the palette, the
asset URLs, and the choreography values, keep the structure.

Every one of these is written to be pasted into a builder (v0, Lovable, Bolt, Figma Make,
Claude) and produce a finished page without follow-up questions.

---

## 1. Cinematic video hero (single-file HTML) — ~4.5k chars

````
Recreate a single-file dark cinematic AI-infrastructure hero EXACTLY as specified. Deliver one
self-contained index.html (inline CSS + JS, no build step, no frameworks). Pixel-faithful to a
measured comp. No cards, no purple, no glow orbs, no decorative gradients as the main visual —
the hero visual is a full-bleed looping video.

════════════════════════════════════════
PAGE META
════════════════════════════════════════
Title: "The Next Layer of Intelligence"
Stage: fixed full-screen; html/body height 100%; overflow hidden; background #050505.
Antialiased type; text-rendering: geometricPrecision.

════════════════════════════════════════
FONTS
════════════════════════════════════════
Manrope, variable 200–800 (https://fonts.google.com/specimen/Manrope), weights 400/500/700.
body font-family: 'Manrope', system-ui, -apple-system, 'Segoe UI', sans-serif
Do NOT substitute Inter/Roboto/Arial.

════════════════════════════════════════
COLOR TOKENS
════════════════════════════════════════
--ink:      #fafafa   /* headline / primary text */
--muted:    #a7a6a6   /* subcopy */
--nav:      #b6b5b5   /* header links */
--pill:     #ffffff   /* CTA fill */
--pill-ink: #050505   /* CTA text */
Stage black: #050505 (never #000)

════════════════════════════════════════
BACKGROUND — VIDEO PLATE (MANDATORY)
════════════════════════════════════════
<video class="plate-video" autoplay muted loop playsinline preload="auto" aria-hidden="true"
       poster="hero-poster.jpg">
  <source src="https://cdn.example.com/portal-loop.mp4" type="video/mp4">
</video>
Geometry: position absolute; inset 0; width/height 100%; object-fit cover; pointer-events none.
Portrait: object-position 43% center.
Subject (for art-direction fidelity): dark cinematic scene — silhouetted figure walking toward a
tall glowing white vertical portal of light on misty ground, smoke at the base, pure black
surroundings. Seamless loop.

Fade overlay on .plate::after — reproduce ALL NINE stops verbatim:
linear-gradient(to bottom,
  rgba(5,5,5,0)    78.8%, rgba(5,5,5,.23) 79.6%, rgba(5,5,5,.45) 81.4%,
  rgba(5,5,5,.75)  83.3%, rgba(5,5,5,.84) 85.2%, rgba(5,5,5,.888) 88%,
  rgba(5,5,5,.905) 91%,   rgba(5,5,5,.96) 95%,   #050505 100%)

════════════════════════════════════════
STRUCTURE (DOM ORDER = PAINT ORDER)
════════════════════════════════════════
.stage
  .plate > video.plate-video
  header.topbar
    a.brand[aria-label="Home"] > inline SVG mark
    nav.links[aria-label="Primary"]: About | Features | FAQ | Contact
    a.pill.pill-nav > span "Get Started"
    button.burger#burger (two <i> bars, portrait only)
  nav.menu#menu (mobile overlay)
  main.hero
    h1.headline > span.line-mask > span.line ×2
    p.sub > span ×2
    .actions > a.pill.pill-cta + a.ghost

════════════════════════════════════════
LAYOUT
════════════════════════════════════════
Header: 32px gutters; brand 32×48px left; nav centered, 19px/400, color --nav, gap 24px;
  header pill right, 175×49px, radius 999px, bg --pill, color --pill-ink, 20.6px/500.
Hero: left gutter 75px, block starts 230px from the top.
h1: two <span class="line"> blocks, display:block, white-space:nowrap
  "The Next Layer" / "of Intelligence"
  clamp(40px, 4.8vw, 71.6px) / line-height 1.12 / weight 400 / letter-spacing -0.02em / --ink
p.sub: two nowrap spans, clamp(16px, 1.4vw, 20.7px) / lh 1.14 / --muted
  "A unified infrastructure platform to help teams build,"
  "ship, and scale AI systems with confidence."
.pill-cta "Get Started" (175×50px) + .ghost "View Architecture" (20.6px/500, #fff, no underline),
  gap 46px, 264px below the headline top.

════════════════════════════════════════
ENTRANCE — EXACT CHOREOGRAPHY (RUNS ONCE)
════════════════════════════════════════
No animation libraries. CSS keyframes only.
E = cubic-bezier(0.16, 1, 0.30, 1)    S = cubic-bezier(0.22, 1, 0.36, 1)
THE VIDEO NEVER ANIMATES IN — it is the stage, already present when content arrives.

Arm in <head>, BEFORE the stylesheet:
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches && Element.prototype.animate) {
    document.documentElement.classList.add('entrance-pending');
    window.__entranceFallback = setTimeout(function(){
      document.documentElement.classList.remove('entrance-pending'); }, 3500);
  }
With JS disabled the class is never added, so the complete page renders statically. Do not add
a <noscript> block. Release on the last element's animationend and clear the timeout.

| Element     | From                                        | Dur   | Ease | Delay |
|-------------|---------------------------------------------|-------|------|-------|
| .brand      | opacity 0, translateY(7px), scale(.94)      | 580ms | E    | 60ms  |
| nav links   | opacity 0, translateY(6px)                  | 480ms | E    | 130 / 175 / 220 / 265ms |
| .pill-nav   | opacity 0, translateY(8px), scale(.985)     | 520ms | E    | 220ms |
| .line (1)   | translateY(110%) skewY(2deg)  [mask clipped]| 800ms | S    | 300ms |
| .line (2)   | same                                        | 850ms | S    | 440ms |
| p.sub       | opacity 0, translateY(10px)                 | 620ms | E    | 740ms |
| .pill-cta   | opacity 0, translateY(8px), scale(.985)     | 560ms | E    | 960ms |
| .ghost      | same                                        | 560ms | E    | 1020ms|

animation-fill-mode: backwards — NOT `both`. `both` strands a transform on the element, which
creates a containing block and silently disables backdrop-filter on any descendant.
.line-mask { display:block; overflow:hidden } — the mask is what clips the rise.
Use 110%, not 100%: descenders peek below the mask at exactly 100%.

════════════════════════════════════════
INTERACTIONS
════════════════════════════════════════
Inside @media (hover: hover) and (pointer: fine) only:
  nav a:hover        → color #f2f2f2, 180ms
  .pill:hover        → filter brightness(1.08), 140ms
  .ghost:hover       → opacity .7, 180ms
.pill:active, .ghost:active → scale(.95), 100ms
:focus-visible → outline 2px solid #fff, outline-offset 3px

════════════════════════════════════════
PORTRAIT / MOBILE
════════════════════════════════════════
Hide .links and .pill-nav; show a frosted burger (rgba(255,255,255,.06) fill,
rgba(255,255,255,.14) border, backdrop-filter blur(14px), 46×46, radius 11px).
Burger → X: bars rotate ±45° with translateY ±4.3px, 300ms.
Overlay .menu: full-screen dark gradient + blur, opacity/visibility 420ms.
Menu items stagger in at 60 / 100 / 160 / 220 / 280 / 340ms; on close all delays are 0ms.
Body scroll lock while open. Close on: Escape, backdrop click, link click, resize to landscape.
Headline wraps inline on phone; returns to two-line spans above 600px.
Safe-area padding on .stage. Use 100dvh, not 100vh.

════════════════════════════════════════
REDUCED MOTION
════════════════════════════════════════
prefers-reduced-motion: reduce → do not arm the entrance; all animations and transitions off;
final state visible immediately. Layout unchanged. This means "show the finished page", not
"run it faster".

════════════════════════════════════════
DO NOT
════════════════════════════════════════
- No cards, badge chips, stat strip, testimonial row, or scroll indicator in the first viewport
- No gradient, glow, or animated fill on the headline — solid #fafafa
- No overlay or sticker on the video except the measured bottom fade
- No entrance animation on the video plate
- No second section — the first viewport IS the deliverable
- Single HTML file; works on desktop and mobile

Build it so a 1487×1058 desktop screenshot matches this layout to the pixel, with the MP4
looping behind the left typography column.
````

---

## 2. Scroll-driven feature section (React + Framer Motion) — ~2.5k chars

````
Build a scroll-driven feature section as a single React component (TypeScript, Tailwind v4,
motion/react — NOT framer-motion). No other dependencies. Reproduce every value verbatim.

LAYOUT
Section: py-20 md:py-40 lg:py-48, px-5 md:px-10 lg:px-16, bg #08090B.
lg+ : CSS grid, 400px (xl:460px) left column / 1fr right column, gap-24 xl:gap-48.
Below lg: single column, left column above right.
Fixed background image behind content at -z-10, object-cover, opacity .35:
  https://images.example.com/mesh.webp?w=1920&q=85

LEFT COLUMN (sticky)
sticky top-32, self-start.
Eyebrow: "CAPABILITIES" — uppercase, 11px, weight 600, letter-spacing .2em, text-white/40.
h2: "Everything runs on one surface." — clamp(32px, 4vw, 56px), weight 400,
    letter-spacing -0.03em, line-height 1.05, text-[#fafafa].
p: 16px/1.6, text-white/60, max-w-[46ch].
Nav list: 3 buttons, one per card, 14px, text-white/40; the active one is text-white with a
  2px left border in #DCFF00 and pl-4. Active state is driven by IntersectionObserver at
  threshold 0.6 on the corresponding card.

RIGHT COLUMN (3 cards)
Each card: rounded-[20px], p-8, bg rgba(255,255,255,0.04),
  border 1px rgba(255,255,255,0.10), backdrop-blur-[20px] saturate-[1.4],
  box-shadow inset 0 1px 0 rgba(255,255,255,.10), 0 20px 60px rgba(0,0,0,.35).
Card content: 40px lucide icon (Zap / Layers / GitBranch), h3 20px/500 text-white,
  p 15px/1.6 text-white/55, and a 16:10 looping muted video with rounded-[14px] overflow-hidden.
Cards: "Instant deploys" / "Composable layers" / "Branch previews".
Spacing between cards: space-y-6 md:space-y-10.

MOTION
const EXPO_OUT = [0.16, 1, 0.3, 1] as const;

1. Card reveal — IntersectionObserver at threshold 0.15, rootMargin '0px 0px -40px 0px'.
   Hidden: opacity 0, translateX(64px). Visible: opacity 1, translateX(0).
   Transition: 700ms EXPO_OUT. Per-card delay: 0 / 120 / 240ms.
   FIRES ONCE — unobserve after firing. Never re-animate on scroll-back.
2. Heading — <motion.h2> whileInView, initial { opacity: 0, y: 28, filter: 'blur(10px)' },
   animate { opacity: 1, y: 0, filter: 'blur(0px)' },
   viewport { once: true, amount: 0.2 }, transition { duration: 0.8, ease: EXPO_OUT }.
3. Card hover (@media hover:hover only) — the inner video scales 1 → 1.03 over 500ms
   cubic-bezier(0.33, 1, 0.68, 1); the card border goes rgba(255,255,255,.10) → .20 over 200ms.
   No lift, no shadow change.
4. Nothing else moves. No parallax, no ambient loop in this section.

ACCESSIBILITY
prefers-reduced-motion: reduce → all cards visible at rest, no transitions, no video autoplay
(show the poster frame). Nav buttons keep their active highlight.
Every nav button is a real <button> with aria-current on the active one.
:focus-visible → outline 2px solid #fff, outline-offset 3px.

DO NOT
- No stagger longer than 240ms total; no card enters after the user has scrolled past it
- No gradient text, no emoji icons, no drop shadows on text
- No `framer-motion` import — use `motion/react`
- Do not animate width/height/top/left. transform, opacity and filter only.
````

---

## 3. Cinematic sticky-scroll story — the choreography table

For the rare full-screen scroll experience. The distinguishing section is a **phase table** —
without it, no model can reproduce the timing.

````
SCROLL RIG
.cinema-scroll { position: relative; height: calc(100vh + 3700px); }
.stage { position: sticky; top: 0; height: 100vh; min-height: 620px;
         overflow: hidden; isolation: isolate; background: #7fb4d4; }
All layers inside .stage are position:absolute and driven ONLY by CSS custom properties.

ENGINE (exact math — do not approximate)
clamp(v, lo=0, hi=1)        = Math.min(hi, Math.max(lo, v))
lerp(a, b, t)               = a + (b - a) * t
smoothstep(e0, e1, v)       = { x = clamp((v-e0)/(e1-e0)); return x*x*(3-2*x) }
segmentInOut(s, a, b, c, d) = { enter = smoothstep(a,b,s), exit = smoothstep(c,d,s),
                                active = enter * (1-exit) }
scrollDistance = clamp(-section.getBoundingClientRect().top, 0,
                        section.offsetHeight - window.innerHeight)

Per frame: smoothScroll = lerp(smoothScroll, target, 0.14); snap when |diff| < 0.08.
Pointer:   mouseX = lerp(mouseX, clientX/innerWidth - 0.5, 0.12)   (same for Y)
Under reduced motion: smoothScroll = target (no lerp), mouseX = mouseY = 0.

const frame2   = segmentInOut(s,  560,  900, 1300, 1620);
const frame3   = segmentInOut(s, 1760, 2140, 2540, 2700);
const progress = clamp(s / 2700);
const introExit  = smoothstep(90, 650, s);
const sightsIn   = Math.pow(smoothstep(2760, 3560, s), 1.55);
const blurActive = clamp(frame2.active + frame3.active);
const backScale  = 0.76 + progress*0.2 + frame2.enter*0.18 + frame3.enter*0.16;

VARIABLE WRITES (batch on :root, one setProperty pass per frame)
--back-scale       = backScale
--back-x           = `${mouseX * -12}px`        /* far layer, small pointer travel */
--blur-px          = `${blurActive * 14}px`
--back-brightness  = 1 - blurActive * 0.255
--title-y          = `${introExit * -210}px`
--title-scale      = 1 - introExit * 0.08
--title-opacity    = 1 - introExit
--bridge-width     = `${67.2 + frame2.enter * 37.8}vw`
--bridge-y         = `${mouseY*8 + progress*-74 - frame2.exit*760}px`
--split-left-x     = `calc(-50% + ${-Math.pow(frame2.enter,1.5) * 46}vw + ${mouseX*22}px)`
--sights-enter-x   = `${(1 - sightsIn) * 420}vw`
--sights-scale     = 1 / backScale              /* counter-scale: keeps UI screen-true */

ACCEPTANCE CRITERIA — scrubbing 3700px must produce, in order:
1.    0–650px : title rises -210px, scales to 0.92, fades out; intro copy sinks +90px and fades.
                All layers drift subtly with the pointer throughout.
2.  560–1620px: bridge widens 67.2vw → 105vw, bottom lifts 5vh → -8vh, then launches -760px and
                scales +0.46 on exit. Splitframe halves part symmetrically to ∓46vw (eased
                enter^1.5), rise -180px, scale +0.74. Global blur ramps to 14px, brightness
                drops 25.5%, the blue shade gradient rises to alphas .465/.42/.51.
                Story panel fades in at top:60%, sliding +58px → -86px.
3. 1760–2700px: bazaar layer gains +0.18 saturation as the bridge panel exits; the second story
                panel fades in at top:29% with the same slide.
4. 2760–3560px: the card slider flies in from 420vw on X (enter^1.55), visible past 0.01,
                counter-scaled by 1/backScale.
5. 3360–3660px: nav buttons fade in and become clickable only past 0.98.

Under prefers-reduced-motion: values snap instead of lerping and layer transitions are disabled.
The composition still scrubs — it just loses inertia. Do NOT disable the rig entirely.
````

---

## 4. Micro-component — a single animated CTA button (~600 chars)

Small components need the same rigor, just less of it.

````
Build one CTA button component. No dependencies.

Base: 175×50px, border-radius 999px, background #ffffff, color #050505,
      font 20.6px / weight 500 / letter-spacing 0. Inner <span> translateY(1px) for optical
      centering (the cap-height of the face sits high in the box).

States (@media (hover:hover) and (pointer:fine) only):
  hover  → filter: brightness(1.08); transition: filter 140ms ease
  active → transform: scale(.95);    transition: transform 100ms cubic-bezier(.4,0,.2,1)
  focus-visible → outline: 2px solid #fff; outline-offset: 3px

Magnetic pull (desktop, fine pointer, motion allowed):
  On pointermove within 120px of center: target = delta * 0.35
  Per frame: current = lerp(current, target, 0.15);
             transform = translate3d(currentX, currentY, 0)
  On pointerleave: target = 0,0 (it eases back, it does not snap)
  Strength above 0.5 makes the button outrun the cursor and read as buggy.

Entrance: opacity 0 → 1, translateY(8px) → 0, scale(.985) → 1,
          560ms cubic-bezier(0.16,1,0.3,1), fill-mode backwards, delay set by the parent.

prefers-reduced-motion: reduce → no magnetic, no entrance, hover is a plain
background-color change. Everything else unchanged.
````

---

## Choosing the scale

| The user wants | Use | Length |
|---|---|---|
| A button, card, footer, nav | example 4 | 0.6–3k |
| A hero section | example 1 | 4–9k |
| A section with scroll behavior | example 2 | 2–5k |
| A full landing page | example 1 structure, repeated per section | 10–16k |
| A scroll experience / interactive story | example 3 | 20–30k |

**The section that is always worth its length is the timing table.** Everything else can be
compressed; the moment you compress "what moves, how far, how long, when" into prose, the build
stops being reproducible.
