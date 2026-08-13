# Video techniques

82 of the 144 corpus prompts build on a video plate. Most people ship one of them (autoplay +
loop) and stop. The corpus uses **eight distinct video mechanisms**, and the choice between them
is most of what separates a cinematic hero from a stock-footage hero.

| # | Technique | When | Cost |
|---|---|---|---|
| 1 | Autoplay loop | ambient background, the default | free |
| 2 | JS fade-loop | the loop point isn't clean | low |
| 3 | Boomerang canvas | short clip, must never visibly restart | medium |
| 4 | Crossfade switcher | 2–8 clips, user or timer picks | low |
| 5 | Scroll scrub | the video *is* the scroll narrative | high |
| 6 | Mouse scrub | pointer drives the frame | medium |
| 7 | Multi-video sync | several clips must stay frame-aligned | low |
| 8 | Masked / clipped video | video shows only inside a shape | low |

---

## 1. Autoplay loop (the default)

```html
<video autoplay muted loop playsinline preload="auto" poster="hero-poster.jpg" aria-hidden="true">
  <source src="hero.mp4" type="video/mp4">
</video>
```

All four of `autoplay muted loop playsinline` are required — `muted` + `playsinline` are
specifically what let iOS autoplay at all. Some corpus prompts add
`disablepictureinpicture disableremoteplayback webkit-playsinline="true" x5-playsinline="true"`
for stubborn mobile browsers.

`aria-hidden="true"` on decorative video, always. `poster` covers the buffering window.

---

## 2. JS fade-loop (hide a dirty loop point)

Most stock loops don't actually loop cleanly. Crossfade the seam to black:

```
On canplay:    play(), then fade opacity 0 → 1 over 500ms via requestAnimationFrame
On timeupdate: when (duration - currentTime) <= 0.55s, fade 1 → 0 over 550ms
On ended:      opacity = 0, wait 100ms, currentTime = 0, play(), fade back in over 500ms
```

Do the fade in JS, not with a CSS transition — a CSS transition fights the `timeupdate` cadence
and stutters at the wrap. Cancel the previous RAF before starting a new fade, and read the
element's current opacity so a new fade resumes from wherever the last one stopped.

Variant: 250ms fade-in for short clips; 500ms is the corpus standard.

---

## 3. Boomerang canvas (ping-pong)

The most sophisticated loop treatment in the corpus, used by four prompts. Play the clip once
while capturing every frame, then play the captured frames forward → backward forever. There is
no seam because the motion reverses instead of restarting.

```
1. Play the video once (muted, playsInline, crossOrigin="anonymous").
2. Capture every frame into offscreen canvases:
   - prefer video.requestVideoFrameCallback(), fall back to requestAnimationFrame
   - cap capture width at 960px, scale height proportionally
   - bail if readyState < 2, or if currentTime === lastTime (dedupe)
3. On `ended`: stop capturing, hide the <video> (display:none), show a display <canvas>.
4. Render loop: every 1000/30 ms draw frames[index], then index += direction.
   When index >= frames.length - 1 → clamp, direction = -1
   When index <= 0                 → clamp, direction = +1
5. Keep the <video> mounted (just hidden) so the canvas keeps a valid source.
```

**Do not** implement the reverse by setting `video.currentTime` backwards — seeking per frame is
far too slow. The captured `frames[]` array is the whole point.

Costs: memory ≈ `frames × 960 × height × 4` bytes. A 5s/30fps clip at 960×540 is ~310MB
uncompressed — keep clips at 3–5s, and prefer this only for the hero.

---

## 4. Crossfade switcher

Stack N videos absolutely; only the active one has `opacity: 1`.

```html
<video class="layer" data-i="0" autoplay muted loop playsinline></video>
<video class="layer" data-i="1" autoplay muted loop playsinline></video>
```
```css
.layer { position: absolute; inset: 0; object-fit: cover; opacity: 0;
         transition: opacity 1000ms ease-in-out; }
.layer.is-active { opacity: 1; }
```

All layers render simultaneously — that's what makes the crossfade instant instead of showing a
black gap while the next clip buffers. Corpus durations: 700ms (`ease-out`) for background image
sets, 1000ms (`ease-in-out`) for video sets.

Driven either by a row of text buttons (active gets a solid color + bottom border, inactive sit
at 50% opacity and hover to 80%) or by a timer. Give the container a black background so nothing
flashes before the first clip loads.

The same pattern works for background *images*: render all 8 as `inset-0 bg-cover` layers,
`transition-opacity duration-700 ease-out`.

---

## 5. Scroll scrub

See `scroll-systems.md` §5 for the full treatment. Summary:

```js
progress = clamp(scrollY / (scrollHeight - innerHeight), 0, 1);
smoothed += (progress * duration - smoothed) * 0.12;   // per RAF
video.currentTime = smoothed;
```

Requires: a densely-keyframed encode (`ffmpeg -g 1`), a `h-[80vh]` spacer div so scroll progress
has room to scrub, and a `poster → video → canvas` crossfade at 500ms as each becomes ready.
**Never also autoplay-loop it.** The highest-fidelity version decodes frames to `ImageBitmap`s
up front and draws them to a canvas by index — no seeking at all.

---

## 6. Mouse scrub

Horizontal pointer movement drives the timeline. Distinctive, and cheaper than scroll scrub
because the user expects it to feel loose.

```
- Video starts paused at currentTime 0. NOT autoplay.
- Track pointer X; scrub delta-based (from movement), not absolute position —
  absolute position makes the video jump when the pointer re-enters the window.
- Sensitivity factor 0.8.
- Chain seeks through the `seeked` event: only issue the next seek once the last one
  resolved, or the decoder drops frames and the scrub visibly stutters.
- Mobile: scrubbing is disabled below 1024px — set video.autoplay = true and play().
```

Two-video variant with a dead zone (from the fashion-archive prompt):

```
- Left half of the viewport scrubs the RIGHT video; right half scrubs the LEFT video.
- Dead zone: within ±50px of center, hold both at currentTime = 0 and keep showing
  whichever was last active. Without the dead zone, crossing the midpoint snaps
  both videos to 0 and reads as a glitch.
```

---

## 7. Multi-video sync

When several clips must stay frame-aligned (a split-screen or a repeated texture layer):

```
master = the first video
On master `timeupdate`: for each other video, if |other.currentTime - master.currentTime| > 0.12s,
  set other.currentTime = master.currentTime
Under prefers-reduced-motion: pause all and remove the autoplay attribute
```

The 0.12s threshold matters — correcting on every tick causes constant micro-seeking, which looks
worse than the drift.

---

## 8. Masked and clipped video

The video only shows inside a shape. Cheap, and reads as expensive.

**Logo-shaped mask** — an inline SVG path as a data URI:
```css
-webkit-mask-image: url("data:image/svg+xml,...");
        mask-image: url("data:image/svg+xml,...");
mask-size: contain; mask-repeat: no-repeat; mask-position: center;
```

**Partial-viewport clip** — video revealed only in the bottom 60%:
```css
clip-path: inset(40% 0 0 0);
```

**Directional fade masks** (the most common):
```css
/* bottom half only */
mask-image: linear-gradient(to bottom, transparent 0%, black 50%);
/* fade into the page below */
mask-image: linear-gradient(180deg, #000 0 40%, transparent 64%);
/* radial vignette */
mask-image: radial-gradient(circle at 50% -70%, transparent 60%, black 78%);
```

**Progressive blur over video** — a full-screen `backdrop-blur-xl` layer masked so the blur only
exists at the bottom:
```css
mask-image: linear-gradient(to top, black 0%, transparent 45%);
```
This is how you keep bottom-anchored text legible without a dark scrim washing out the footage.

---

## Overlay strategy — the decision the corpus is loudest about

Prompts split hard into two camps, and both state their choice as a hard constraint:

**Scrim camp** — dual gradients over the video for legibility:
```css
linear-gradient(to bottom, rgba(0,0,0,.6), transparent 40%, transparent 70%, rgba(0,0,0,.85))
```
plus a directional wash if the copy is single-sided:
```css
linear-gradient(90deg, #070b0a, transparent)
```

**No-overlay camp** — repeatedly, emphatically:
> *"NO dark overlay, NO gradient overlay, NO semi-transparent layer on top of the video. The video plays raw with no dimming whatsoever."*
> *"CRITICAL: Do NOT add any dark overlay, gradient, or tint mask over the video."*
> *"Do not use any layer between the video and the page content."*

Pick one and state it. What you must not do is add a scrim by reflex — a well-chosen dark clip
needs none, and a scrim over an already-dark video just makes the page look muddy. If the video
is bright and the copy sits on it, use the scrim and specify its exact stops.

Edge blends into the surrounding page are a separate thing and are almost always needed:
```css
/* video → page floor */
.fade-bottom { background: linear-gradient(to bottom, transparent, var(--page)); height: 8rem; }
/* video → page ceiling, when the nav sits over it */
.fade-top    { background: linear-gradient(to bottom, var(--page), transparent); height: 6rem; }
```

---

## Ambient video motion

Two idle treatments that make a static-ish clip feel alive:

**Train bob** — the video plate oscillates gently:
```css
transform: translateY(0) scale(1.03);   /* the 1.03 hides the edges during travel */
animation: bob 3s ease-in-out infinite; /* translateY 0 → -6px → 0 */
```
The constant `scale(1.03)` is essential — without it the plate's edges enter frame at the extremes.

**Pointer parallax on the plate** — GSAP or plain lerp:
```js
targetX = ((clientX - cx) / cx) * 20;         // ±20px
currentX += (targetX - currentX) * 0.06;      // heavy damping
gsap.set(videoBg, { x: currentX, y: currentY });
```
Wrapper scaled `1.08` with `origin-center` so the travel never exposes an edge.

---

## HLS streaming

Several corpus prompts serve `.m3u8` instead of MP4 for longer/higher-quality backgrounds:

```js
import Hls from 'hls.js';
if (video.canPlayType('application/vnd.apple.mpegurl')) {
  video.src = src;                       // Safari plays HLS natively
} else if (Hls.isSupported()) {
  const hls = new Hls();
  hls.loadSource(src);
  hls.attachMedia(video);
}
```

Worth it above ~10MB or when you want adaptive quality. Not worth the dependency for a 3MB loop.

---

## Checklist

- [ ] `autoplay muted loop playsinline` all present (or the clip is deliberately scrubbed)
- [ ] `poster` set, and it matches the first frame
- [ ] `aria-hidden="true"` if decorative
- [ ] The plate does **not** animate in with the entrance — it is the stage
- [ ] Edge fades into the surrounding page are specified with real gradient stops
- [ ] Overlay decision is explicit: scrim with stops, or "no overlay" stated as a constraint
- [ ] `prefers-reduced-motion`: pause, drop autoplay, show the poster
- [ ] One video plate per viewport — a second competing loop is motion soup
- [ ] Scrubbed video is never also looping
- [ ] Encode: ≤5MB, 1920×1080, H.264, 5–15s (dense keyframes only if scrubbed)
