# Project structure — React + Tailwind + Framer Motion + TypeScript

**The stack is fixed.** Every build in this skill is React + Tailwind CSS + Framer Motion
(`motion/react`) in TypeScript, unless the user explicitly asks for something else. This is not a
preference — it is what the corpus is: of 144 reference specs, 123 are React, 116 Tailwind, 86
TypeScript, 41 Framer Motion, and only 6 ask for a single HTML file.

The vanilla `assets/motion.css` + `assets/motion.js` runtime exists for one case: the user says
"one file", "no build step", "no dependencies", or is pasting into a CMS. Otherwise, React.

---

## The one rule that matters

**Never dump a build into a single file.** A 900-line `page.tsx` with every section, every
variant object and every hook inlined is the signature of generated code, and it is unmaintainable
the moment the user wants to change one section.

Split by responsibility, always, even for a single section. A hero is not one file — it is a
section component, its sub-parts, its motion variants, and its content data.

### Size ceilings

| File | Ceiling | Split when it exceeds |
|---|---|---|
| A component `.tsx` | ~150 lines | Extract sub-components into a `components/` folder beside it |
| A page / route | ~80 lines | It should be composition only: imports and `<Section />` calls |
| A variants file | ~120 lines | Split per component |
| A hook | ~80 lines | One hook, one concern |
| Any file at all | **250 lines** | Hard stop. Split it. |

---

## Layout

### Next.js App Router (default for a full page or site)

```
src/
  app/
    layout.tsx                  fonts, metadata, <html>/<body>, providers
    page.tsx                    composition only — imports sections, renders them in order
    globals.css                 @tailwind directives, @font-face, CSS custom properties
  components/
    sections/                   one folder per page section
      hero/
        Hero.tsx                the section shell — layout and composition
        HeroHeadline.tsx        the parts, each independently readable
        HeroMedia.tsx
        HeroTrustStrip.tsx
        hero.variants.ts        Framer variants for this section only
        index.ts               `export { Hero } from './Hero'`
      features/
        Features.tsx
        FeatureCard.tsx
        features.variants.ts
        index.ts
      footer/
        Footer.tsx
        index.ts
    ui/                         design-system primitives, section-agnostic
      Button.tsx
      Pill.tsx
      Eyebrow.tsx
      GlassCard.tsx
      Marquee.tsx
      Counter.tsx
      index.ts
    motion/                     reusable motion wrappers
      Reveal.tsx                IntersectionObserver reveal wrapper
      Stagger.tsx               parent that staggers its children
      MagneticButton.tsx
      ParallaxLayer.tsx
      index.ts
  hooks/
    useScrollProgress.ts
    usePointerParallax.ts
    usePrefersReducedMotion.ts
    useMediaQuery.ts
  lib/
    motion.ts                   easing + duration tokens (the single source of truth)
    variants.ts                 shared variants built from those tokens
    cn.ts                       className merge helper
  content/
    hero.ts                     copy, links, stat values — never hardcoded in JSX
    features.ts
  types/
    index.ts
tailwind.config.ts              tokens registered as Tailwind theme values
```

### Vite / CRA (no App Router)

Same tree, with `src/App.tsx` in place of `app/page.tsx` and `src/main.tsx` as the entry. Nothing
else changes.

### A single component in someone's existing project

Do not impose the tree. Follow their conventions, but still split:

```
components/PricingSection/
  PricingSection.tsx
  PricingCard.tsx
  pricing.variants.ts
  index.ts
```

---

## What goes where

**`lib/motion.ts` — tokens, defined once, imported everywhere.** No component may retype a
cubic-bezier.

```ts
export const EASE = {
  out:     [0.16, 1, 0.3, 1],      // the primary — 41 corpus uses
  outAlt:  [0.22, 1, 0.36, 1],     // secondary — 30 uses
  inOut:   [0.65, 0, 0.35, 1],     // symmetric moves only
  linear:  'linear',               // loops and drifts, nothing else
} as const

export const DUR = {
  micro: 0.14, quick: 0.3, base: 0.5, slow: 0.8, cinematic: 1.2,
} as const

export const STAGGER = { tight: 0.045, base: 0.09, loose: 0.14 } as const
```

**`*.variants.ts` — Framer variants, never inline in JSX.** Inline `initial`/`animate` objects
scattered through a component are how timing drifts out of sync.

```ts
import { EASE, DUR, STAGGER } from '@/lib/motion'
import type { Variants } from 'motion/react'

export const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: STAGGER.base, delayChildren: 0.06 } },
}

export const rise: Variants = {
  hidden: { opacity: 0, y: 10, filter: 'blur(6px)' },
  show:   { opacity: 1, y: 0, filter: 'blur(0px)',
            transition: { duration: DUR.slow, ease: EASE.out } },
}
```

**`content/*.ts` — every string, number and URL.** Copy in `content/hero.ts`, not in JSX. It makes
the copy reviewable and the component readable, and it is what lets the user change wording
without touching motion code.

**`tailwind.config.ts` — the palette and the easings as theme tokens**, so utility classes read
`ease-brand-out duration-slow` rather than arbitrary values repeated across twelve files.

**`components/ui/` vs `components/sections/`** — if it could appear on a second page, it is `ui/`.
If it only makes sense in one place, it lives in that section's folder.

---

## Non-negotiables for generated React

- **`'use client'` only where needed.** Framer Motion, IntersectionObserver, and any pointer
  handler require it. A static section must stay a server component.
- **One default export per component file**, named the same as the file.
- **`index.ts` barrels** in each section folder so page composition reads cleanly.
- **Typed props on every component.** `interface HeroProps { ... }` — no implicit `any`, no
  `props: any`.
- **`useReducedMotion()` from `motion/react`** at the top of any animated component, and it
  short-circuits to the final state — never to a faster animation.
- **Cleanup every effect**: `cancelAnimationFrame`, `observer.disconnect()`,
  `removeEventListener`, `resizeObserver.disconnect()`. A missing cleanup is a defect, not a nit.
- **No inline `style` for anything Tailwind can express.** `style` is for dynamic values only:
  CSS custom properties, computed transforms, per-index delays.
- **Per-index delay comes from the parent's `staggerChildren`**, not from
  `style={{ animationDelay: i * 100 }}` on each child.
- **Images through `next/image`** in Next projects, with explicit `sizes`. Video always gets
  `muted playsInline loop` and a `poster`.

## Delivery format

When you hand over a multi-file build, give the tree first, then the files in dependency order
(tokens → variants → primitives → sections → page), each in its own fenced block with its path as
the first line:

````
```tsx
// src/components/sections/hero/Hero.tsx
```
````

If the user is in an environment where you can write files, write them — do not paste a tree of
twelve files into chat when you have a Write tool.
