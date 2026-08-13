# Kinetic typography

Type is usually the loudest thing on a page, so it repays careful motion. Nine
patterns, ranked by how often they earn their place.

**The governing rule:** animate the largest unit that still communicates. Line for headlines,
word for a lead paragraph, character only for a short wordmark or a scroll-scrubbed body
paragraph. Per-character animation on a full sentence is the most reliable tell of an amateur build.

---

## 1. Line clip reveal — the signature headline move

Text rises from behind its own baseline. This is the most-used headline animation in the corpus.

```html
<h1 class="headline">
  <span class="line-mask"><span class="line">The Next Layer</span></span>
  <span class="line-mask"><span class="line">of Intelligence</span></span>
</h1>
```

```css
.line-mask { display: block; overflow: hidden; }   /* the mask does the work */
.line      { display: block; will-change: transform; }

@keyframes line-reveal {
  from { transform: translate3d(0, 110%, 0) skewY(2deg); }
  to   { transform: translate3d(0, 0, 0)    skewY(0deg); }
}
.entrance-pending .line { transform: translate3d(0, 110%, 0) skewY(2deg); }
.line-mask:nth-child(1) .line { animation: line-reveal 800ms var(--ease-out-quint) 300ms both; }
.line-mask:nth-child(2) .line { animation: line-reveal 850ms var(--ease-out-quint) 440ms both; }
```

**Details that make it read right**

- `110%`, not `100%` — descenders (g, y, p) peek below the mask at exactly 100%.
- `skewY(2deg)` is the whole trick. It gives the line a sense of physical hinge. Above 3° it
  becomes a gimmick.
- Second line is **140ms behind and 50ms slower**. Equal timing reads mechanical.
- `line-height` must be tight enough that the mask doesn't clip the ascenders of the line above.
- Clip-path alternative when overflow is impossible: `clip-path: inset(100% 0 0 0)` → `inset(0)`.

---

## 2. Blur fade-up — the everywhere move

```css
@keyframes blurFadeUp {
  from { opacity: 0; filter: blur(20px); transform: translateY(40px); }
  to   { opacity: 1; filter: blur(0);    transform: translateY(0);    }
}
.animate-blur-fade-up { opacity: 0; animation: blurFadeUp 1s ease-out forwards; }
```

Blur scale by importance: `6px` body · `10px` standard signature · `12px` hero · `20px` dramatic.
Every element gets an inline `animation-delay`; ladder 0 / 100 / 200 / 300ms.

Framer:
```tsx
initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }}
animate={{ filter: 'blur(0px)',  opacity: 1, y: 0 }}
transition={{ duration: 0.8, ease: 'easeOut' }}
```

**Cost warning.** Animated `filter: blur()` on large text is GPU-expensive. Keep it to headline-sized elements,
never a paragraph grid.

---

## 3. Word-by-word stagger

For a lead paragraph or a 6–12 word headline.

```tsx
// Split on spaces; each word is an inline-block span
{text.split(' ').map((word, i) => (
  <motion.span key={i}
    style={{ display: 'inline-block', marginRight: '0.28em' }}
    initial={{ filter: 'blur(10px)', opacity: 0, y: 50 }}
    whileInView={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.1 }}
    transition={{ duration: 0.7, delay: i * 0.1, ease: EXPO_OUT }}
  >{word}</motion.span>
))}
```

Container: `display: flex; flex-wrap: wrap; justify-content: center; row-gap: 0.1em`.
Use `marginRight: 0.28em` rather than a real space — inline-block collapses whitespace
unpredictably across browsers.

**Stagger:** 80–100ms per word. Beyond ~12 words the tail arrives after the reader has finished
the head — switch to a line reveal.

---

## 4. Per-character scroll scrub — the "reading light" effect

Characters brighten from 0.2 to 1 as the section scrolls past. Excellent for a manifesto
paragraph; the reader's eye is pulled along at the pace you choose.

```tsx
const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.8', 'end 0.2'] });

// per character i of n
const charProgress = i / n;
const start = Math.max(0, charProgress - 0.1);
const end   = Math.min(1, charProgress + 0.05);
const opacity = useTransform(scrollYProgress, [start, end], [0.2, 1]);
```

Implementation notes from the corpus:

- Each character is a `<span style="position: relative; display: inline-block">`.
- An **invisible duplicate holds the layout space**; the visible character is absolutely
  positioned on top. Without this, per-char opacity causes subpixel reflow shimmer.
- Spaces render as ` `, not a plain space.
- The `-0.1 / +0.05` window makes each character's ramp overlap its neighbors — that overlap is
  what makes it read as a sweep rather than a sequence of blinks.
- Word-level variant: opacity `0.15 → 1` per word, same scroll mapping. Cheaper, nearly as good,
  and the right choice above ~200 characters.

---

## 5. Scramble / decode

Cyber, technical, and AI-product brands. Two modes.

**Entrance decode**
```
Charset: ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~|}{[]:;?><
On trigger (after `delay`): interval every 25ms, reveal cursor advances 0.5 chars/frame
Not-yet-revealed positions show random chars, but only up to 3 ahead of the cursor;
  beyond that, render empty
Spaces always render as spaces
Before triggering: render &nbsp; (reserves the line box, prevents layout shift)
```

**Hover scramble**
```
On hover:   scramble all chars, then reveal left-to-right at 4 frames/char, 25ms interval
On unhover: snap immediately back to the original text (no reverse animation)
```

The "3 chars ahead" window is what stops it looking like TV static — the noise stays a thin
leading edge on the reveal.

---

## 6. Typewriter

```css
@keyframes blink { 0%, 100% { opacity: 1 } 50% { opacity: 0 } }
.cursor { animation: blink 1s step-end infinite; }
```

`step-end` — a smooth-fading cursor looks broken. Characters append at 30–60ms each; reserve the
final line height up front (`min-height` on the container) so the layout never jumps.

Use for terminal/CLI/AI-chat framing. Do not use for a marketing headline.

---

## 7. Marquee (infinite ticker)

```css
@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
.marquee-track {
  display: flex; width: max-content; white-space: nowrap;
  animation: marquee 30s linear infinite;
}
.marquee-track:hover { animation-play-state: paused; }
.marquee-mask {
  overflow: hidden;
  -webkit-mask-image: linear-gradient(to right, transparent, #000 8%, #000 92%, transparent);
          mask-image: linear-gradient(to right, transparent, #000 8%, #000 92%, transparent);
}
```

**Non-negotiables**

1. **Duplicate the content exactly once** and translate to exactly `-50%`. Any other combination
   produces a visible jump at the seam. (For scroll-linked rows, triple it instead.)
2. **`linear` only.** Any easing curve makes the seam visible.
3. **Edge mask.** Content that hard-cuts at the container edge looks unfinished.
4. Pause on hover if the items are interactive; don't if they're decorative.

**Speeds:** logos 20–30s · giant display type 30s · project names 28s · GSAP `xPercent: -50,
duration: 40, ease: 'none', repeat: -1`.

Two rows moving in opposite directions at slightly different speeds is the standard "wall of
logos" treatment.

---

## 8. Count-up numbers

```tsx
const ref = useRef<HTMLSpanElement>(null);
const inView = useInView(ref, { once: true, margin: '-50px' });

useEffect(() => {
  if (!inView) return;
  animate(0, value, {
    duration: 1.5, ease: 'easeOut',
    onUpdate: (v) => { ref.current.textContent = prefix + v.toFixed(decimals) + suffix; },
  });
}, [inView]);
```

- Duration 1.5s, `easeOut`. Linear counting looks like a progress bar.
- Render the initial DOM as `prefix + "0" + suffix`, never empty — prevents layout shift.
- Use a **tabular / monospace numeric** face (`font-variant-numeric: tabular-nums`, or Geist Mono
  / JetBrains Mono). Proportional digits make the number visibly jitter in width as it counts.
- Fires once.

---

## 9. Word pop (playful brands only)

```
translateY(60px) scale(0.7) rotate(-4deg) blur(8px) → bounce overshoot → settle
0.9s cubic-bezier(0.34, 1.56, 0.64, 1), starts at opacity: 0
```

The only sanctioned overshoot in the system. One element per page, maximum — a headline where
every word pops is a novelty effect, not typography. Use it when the brief asks for exuberance,
never as a default.

---

## 10. Gradient text

13 corpus prompts use this — it is the most common *non-motion* type treatment in the set, and
it's what makes a flat headline look designed.

```css
.gradient-text {
  background: linear-gradient(180deg, #646973 0%, #bbccd7 100%);
  -webkit-background-clip: text;
          background-clip: text;          /* ship BOTH */
  -webkit-text-fill-color: transparent;
  color: transparent;                     /* and BOTH of these */
}
```

Four variants worth knowing:

| Variant | Gradient | Effect |
|---|---|---|
| Metal | `linear-gradient(180deg, #646973, #bbccd7)` | dark-to-light vertical, reads as brushed steel |
| **Vertical fade-out** | `linear-gradient(to bottom, #fff 0%, rgba(255,255,255,.4) 50%, transparent 85%)` | the headline dissolves into the page — no mask needed |
| Accent word | `linear-gradient(to right, #6366f1, #a855f7, #fcd34d)` on one `<span>` | the rest of the line stays solid |
| Radial watermark | `radial-gradient(circle, rgba(142,127,148,0) 0%, #8e7f94 70%)` at `opacity: .10` | giant background word that fades from its own center |

Animate it by moving the background, never the text:
```css
@keyframes gradient-shift { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
.gradient-text { background-size: 200% auto; animation: gradient-shift 6s ease infinite; }
```

**Gotchas**: `background-clip: text` kills `text-shadow` (there's no text to shadow) — use
`filter: drop-shadow()` on the element instead. And an element with clipped text can't also carry
a visible background, so the gradient element must be the text node itself.

## 11. Text stroke & optical weight

```css
-webkit-text-stroke: 0.12px currentColor;   /* optical correction: thickens hairline type */
-webkit-text-stroke: 0.6px #1a1a1a;         /* real outline on light type over photos */
```

The sub-pixel value is the interesting one. At `0.12px` it isn't an outline — it's a weight
nudge, used when a 300-weight face renders too thin over video. Cheaper and more precise than
jumping to the next weight.

For genuinely outlined ("ghost") display type, pair a transparent fill with a 1–2px stroke, and
set `paint-order: stroke fill` so the stroke sits behind the glyph rather than eating into it.

## Type craft (the static half)

Motion cannot rescue bad typesetting.

| Property | Corpus value |
|---|---|
| Headline tracking | `-0.02em` to `-0.08em` — always negative, tighter as size grows |
| Headline line-height | `0.95`–`1.12` |
| Eyebrow / label | uppercase, `+0.2em` tracking, 10–12px, 500–600 weight |
| Body line-height | `1.5`–`1.6` |
| Sizing | `clamp(44px, 13vw, 64px)` — never a breakpoint stack |
| Headline weight | 400–500 at large sizes. 700+ at 72px reads as a discount banner. |
| Text color | `#fafafa` on dark, `#0a0a0a` on light. Never pure `#fff`/`#000`. |
| Secondary text | opacity 0.6–0.8 of primary, not a separate grey |
| Max measure | 60–70ch for body, ~20 words per headline line |

**Font pairing that carries the corpus:** one geometric/neo-grotesque UI face (Inter, Geist,
Manrope, PP Neue Montreal, DM Sans) + one display face used *only* for the headline
(Instrument Serif italic, Playfair Display, or a heavy condensed like Barlow Condensed 800).
Monospace (Geist Mono, JetBrains Mono) for numerics, timestamps, and labels.

**Load with `font-display: swap`**, and gate the entrance on `document.fonts.ready` when the
headline animation depends on final metrics — otherwise the line mask clips the wrong height.
