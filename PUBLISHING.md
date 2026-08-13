# Publishing & listing guide

Everything needed to get `premium-web-motion-skill` public and listed. Work top to bottom — the
directories all want a public repo with stars, so ordering matters.

---

## Step 1 — Push the repo

The repo is already a valid Claude Code plugin marketplace (`claude plugin validate .` passes).

```bash
cd C:/Users/Admin/Documents/Work/motionsites_skill
git init
git add .
git commit -m "premium-web-motion-skill: award-tier web motion skill for Claude Code"
gh repo create premium-web-motion-skill --public --source=. --push
```

**Name the repo `premium-web-motion-skill`**, not `motionsites_skill`. The repo name is what people see
in the install command, and it must not imply affiliation with motionsites.ai.

`.gitignore` already excludes `corpus/` and `motionsites_free_prompts.json` — verify before the
first push:

```bash
git status --porcelain | Select-String corpus     # must return nothing
```

Then fill in the two `YOUR_GITHUB_USER` placeholders in `README.md`.

### Repo setup checklist

- [ ] Description: *"Award-tier web motion design skill for Claude Code — cinematic heroes, scroll storytelling, kinetic typography, and the spec-prompt method behind them."*
- [ ] Topics: `claude-code`, `claude-skills`, `claude-plugin`, `web-animation`, `motion-design`, `css-animation`, `scroll-animation`, `framer-motion`, `gsap`, `frontend`
- [ ] Social preview image —  use `assets/preview/demo-hero.png`
- [ ] Releases —  tag `v1.0.0` (several directories read the latest tag)
- [ ] Verify the install flow yourself in a clean folder:
      `/plugin marketplace add YOUR_USER/premium-web-motion-skill` then `/plugin install`

---

## Step 2 — Where to list it

Ordered by effort-to-reach ratio. Do the first three the day you publish.

### Tier 1 — do these first

| Target | How | Notes |
|---|---|---|
| **[ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills)** | Fork —  add one line —  PR | No star minimum. Wants a real use case, no duplicates, tested across platforms. Best first PR. |
| **[karanb192/awesome-claude-skills](https://github.com/karanb192/awesome-claude-skills)** | Fork —  PR | "50+ verified skills", actively maintained, community-driven. |
| **[BehiSecc/awesome-claude-skills](https://github.com/BehiSecc/awesome-claude-skills)** | Fork —  PR | Curated list, low friction. |
| **[GetBindu/awesome-claude-code-and-skills](https://github.com/GetBindu/awesome-claude-code-and-skills)** | Fork —  PR | Covers both skills and plugins. |

Entry format all four use:

```markdown
- **[premium-web-motion-skill](https://github.com/YOUR_USER/premium-web-motion-skill)** — Build award-tier animated websites: cinematic heroes, scroll storytelling, kinetic typography, liquid-glass surfaces. Ships a zero-dependency runtime and a spec-prompt method for other AI builders.
```

PR rules that all of them share: **one skill per PR**, descriptive title, explain what it adds and
why it's valuable, check for duplicates first, verify every link.

### Tier 2 — after you have ~10 stars

| Target | How | Gate |
|---|---|---|
| **[travisvn/awesome-claude-skills](https://github.com/travisvn/awesome-claude-skills)** | Fork —  PR | **Minimum 10 GitHub stars.** Also requires: substantial docs beyond one file —S&, license —S&, tested code —S&, non-commercial —S&, not AI-submitted. |

Read their `CONTRIBUTING.md` before submitting — they reject SaaS wrappers, teaser content, and
anything promotional. This skill qualifies (MIT, self-contained, no paid dependency), but the
star gate is hard.

### Tier 3 — aggregators (mostly auto-index)

| Site | Mechanism |
|---|---|
| **[claudemarketplaces.com](https://claudemarketplaces.com/skills)** | Largest directory (23k+ skills). No public submit form — it crawls GitHub. Topics + a valid `marketplace.json` are what get you found. Use their `/feedback` link to nudge. |
| **[awesomeclaude.ai](https://awesomeclaude.ai/awesome-claude-skills)** | Directory of agent skills; check for a submit link in the footer. |
| **[claudehasskills.com/directory](https://claudehasskills.com/directory/)** | Skills directory. |
| **[awesomeskill.ai](https://awesomeskill.ai)** | Marketplace for Claude / Codex / ChatGPT skills. |
| **[developersdigest.tech](https://www.developersdigest.tech/blog/best-claude-code-skills-2026)** | Curated blog directory — reach out to the author. |
| **[designrevision.com](https://designrevision.com/blog/awesome-claude-code-skills)** | Curated list with a GitHub link per skill. Design-focused, so this one is a strong topical fit. |

Because the big aggregators crawl rather than accept submissions, **GitHub topics and a valid
`marketplace.json` are your listing strategy** — both are already in place.

### Tier 4 — upstream

| Target | Reality |
|---|---|
| **[anthropics/skills](https://github.com/anthropics/skills)** | Anthropic's own repo. It has a `/template` folder and heavy PR traffic, but no published community-contribution policy. Read `CONTRIBUTING.md` on the repo before spending effort — treat acceptance as unlikely, not as the plan. |

---

## Step 3 — Announce

The design angle is the differentiator; lead with the artifact, not the skill.

| Channel | Angle |
|---|---|
| **X / Twitter** | Post the demo screenshot + the `fill-mode`/`backdrop-filter` trap. That trap is a genuinely useful, surprising fact — it travels. |
| **r/ClaudeAI, r/webdev, r/Frontend** | "I analysed 144 production motion specs — here's the timing system that came out." Lead with the data table, not the install command. |
| **Hacker News (Show HN)** | *"Show HN: I distilled 144 production motion specs into a timing system"* — the research framing does far better than "I made a Claude skill". |
| **Dev.to / Hashnode** | Long-form: the two-easing finding, the 800ms median, the five zero-motion cases. Link the repo at the end. |
| **Claude Developers Discord** | `#showcase`. |

The three things worth leading with, in order:

1. **The `fill-mode` trap** — `forwards`/`both` strands a transform that silently kills
   `backdrop-filter` on every descendant. Nearly everyone has hit this without knowing why.
2. **Two easing curves carry the entire category** — `cubic-bezier(0.16,1,0.3,1)` and
   `cubic-bezier(0.22,1,0.36,1)`, with bounce essentially absent.
3. **Five references forbid animation outright** — the counterintuitive one, and the most
   defensible design position in the whole skill.

---

## Step 4 — Maintenance

- Keep `version` in sync across `marketplace.json`, `plugin.json`, and the git tag. Users get
  updates via `/plugin marketplace update`.
- The skill in `plugins/` is the single source of truth. Your global copy at
  `~/.claude/skills/premium-web-motion-skill/` is a convenience copy — re-copy after edits, or it drifts.
- If you regenerate the corpus analysis, `tools/build_index.mjs` writes straight into
  `references/component-index.md`; check the path still resolves after the plugin restructure.

---

## Attribution — read before publishing

The motion patterns were derived by analysing publicly available prompt specs, including the free
tier of motionsites.ai. The published repo contains **no copied prompt text** — `corpus/` and the
raw scrape are gitignored, and the references are original analysis: tokens, frequency data,
mechanisms and method.

Keep it that way:

- Don't add corpus files to the repo, and don't quote prompts at length in the references.
- Keep the credit line in the README.
- Don't name the repo, plugin, or marketplace after motionsites, and don't imply endorsement.

Aggregate factual findings ("41 uses of this easing curve") and independently-written technique
documentation are your own work. Verbatim prompt text is not.
