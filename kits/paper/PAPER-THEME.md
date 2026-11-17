# Paper theme — specification

Soft pastel paper with ink, offset colour shadows and a touch of hand-written charm.

One of the 27 universes of [Thrishank Kuntimaddi's portfolio](https://thrishankkuntimaddi.github.io). Free to use in your own projects (MIT-style: keep, change, ship). Files in this kit:

| File | What it is |
|---|---|
| `paper.css` | Drop-in stylesheet: tokens, components and the Paper signature |
| `paper.csv` | Every token with its exact value and use (for Figma, spreadsheets or your own build) |
| `PAPER-THEME.md` | This document |
| `prompt.txt` | Section 0 on its own, to paste into an AI coding tool |

---

## 0. Prompt to paste into a new session

```
Apply the "Paper" theme to this project. Soft pastel paper with ink, offset colour shadows and a touch of hand-written charm.

Use the files paper.css, paper.csv and PAPER-THEME.md (from https://thrishankkuntimaddi.github.io/universes.html#kits). Follow them exactly:
1. Add paper.css after the project's own CSS and the Google Fonts link at the top of it. Put class "t-page" on <body>.
2. Map components to the theme classes: page width → t-wrap; top bar → t-nav; cards/panels → t-card; app/screens previews → t-window; buttons → t-btn (the one main action per view → t-btn t-btn--primary; quiet actions → t-btn--ghost); text fields → t-input; tags/filters → t-chip; small labels → t-eyebrow; page title → t-title; section titles → t-h2; intro paragraph → t-lede; modals → t-dialog; notifications → t-toast.
3. Use only the --t-* tokens for colour, type, radius and shadow. Remove hard-coded colours, fonts and radii that fight the theme.
4. Theme rules:
   - Light and pastel only; ink is soft slate, never pure black.
   - Cards get a solid offset shadow in the accent colour, not a blur.
   - Display type is Fraunces with italic emphasis; small labels are Space Mono uppercase.
   - One hand-written accent (Caveat) per screen at most: a note, a sticker, a scribble.
   - Colour editions: morning, noon, dusk, night. Pick one by local time or let the user choose.
5. Light theme: keep everything light; no dark sections.
6. Keep it accessible: text contrast AA, visible focus rings, prefers-reduced-motion turns animation off (already in the CSS).
7. Check it at 390px (phone) and 1440px (desktop) wide and fix anything that overflows.
Sample voice for headings: "I design and build interfaces people enjoy using."
```

---

## 1. The look in one line

Soft pastel paper with ink, offset colour shadows and a touch of hand-written charm.

**Sample voice:** “I design and build interfaces people enjoy using.”

## 2. Rules

- Light and pastel only; ink is soft slate, never pure black.
- Cards get a solid offset shadow in the accent colour, not a blur.
- Display type is Fraunces with italic emphasis; small labels are Space Mono uppercase.
- One hand-written accent (Caveat) per screen at most: a note, a sticker, a scribble.
- Colour editions: morning, noon, dusk, night. Pick one by local time or let the user choose.
- Light theme only.

## 3. Tokens

| Token | Value | Use |
|---|---|---|
| `--t-bg` | `#fbf8f2` | Page background colour |
| `--t-tint` | `#ffe9df` | Soft fill for hovers, chips and highlights |
| `--t-ink` | `#2c3046` | Main text on the page |
| `--t-muted` | `#646a85` | Secondary text |
| `--t-faint` | `#9096ad` | Hints, captions, disabled |
| `--t-line` | `rgba(44, 48, 70, .14)` | Hairlines and dividers |
| `--t-line-2` | `rgba(44, 48, 70, .26)` | Stronger borders on cards and controls |
| `--t-surface` | `rgba(255, 255, 255, .86)` | Cards, windows, dialogs |
| `--t-surface-ink` | `#2c3046` | Text inside cards |
| `--t-accent` | `#ff8a65` | Primary action, key highlights (one per view) |
| `--t-accent-2` | `#6bb6ff` | Secondary highlight |
| `--t-accent-3` | `#ffd166` | Third highlight: stickers, marks, selection |
| `--t-display` | `"Fraunces", Georgia, serif` | Headings |
| `--t-sans` | `"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` | Body text |
| `--t-mono` | `"Space Mono", ui-monospace, Menlo, monospace` | Labels, numbers, code |
| `--t-hand` | `"Caveat", cursive` | Hand-written notes |
| `--t-r` | `20px` | Cards and windows |
| `--t-r-sm` | `12px` | Buttons, inputs, chips |
| `--t-base-size` | `16px` | Body size |
| `--t-base-lh` | `1.6` | Body line height |
| `--t-page-bg` | `#fbf8f2` | Full page background (gradient / pattern) |
| `--t-card-shadow` | `7px 7px 0 var(--t-shadow)` | Cards, windows, dialogs |
| `--t-border` | `1.5px solid var(--t-line-2)` | Cards, buttons, inputs |

### Colour editions

Set `<html data-edition="…">`. The site picks one from the visitor's local time (5–11 morning, 11–17 noon, 17–21 dusk, otherwise night).

| Edition | Background | Tint | Accent | Accent 2 | Accent 3 |
|---|---|---|---|---|---|
| morning | `#fbf8f2` | `#ffe9df` | `#ff8a65` | `#6bb6ff` | `#ffd166` |
| noon | `#f6fafe` | `#dff0ff` | `#5aa9ff` | `#ff9b85` | `#7fe0c3` |
| dusk | `#fbf7fd` | `#efe3ff` | `#a78bfa` | `#ff8fb8` | `#ffcf8a` |
| night | `#f5fbf9` | `#dbf5ec` | `#4fd1b0` | `#8fa8ff` | `#ffc2d6` |

## 4. Fonts

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..800;1,9..144,400..700&family=Inter:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&family=Caveat:wght@500;700&display=swap">
```

Display: `"Fraunces", Georgia, serif` · Body: `"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` · Labels: `"Space Mono", ui-monospace, Menlo, monospace`

## 5. Components

| Class | Use |
|---|---|
| `t-page` | On `<body>`: background, text colour, fonts |
| `t-wrap` | Centred content column, 1160px max |
| `t-nav` | Sticky top bar, lightly frosted |
| `t-card` | Cards and panels |
| `t-window` + `t-window-bar` | A window frame for screenshots or app previews |
| `t-btn`, `t-btn--primary`, `t-btn--ghost` | Buttons. One primary per view |
| `t-input` | Text fields and textareas |
| `t-chip` | Tags and filters |
| `t-eyebrow`, `t-title`, `t-h2`, `t-lede`, `t-muted` | Type |
| `t-dialog` | On `<dialog>` |
| `t-toast` | Notifications |

```html
<body class="t-page">
  <nav class="t-nav"><b>Brand</b><a class="t-btn t-btn--ghost" href="#">Menu</a></nav>
  <main class="t-wrap">
    <p class="t-eyebrow">Section label</p>
    <h1 class="t-title">I design and build <em>interfaces</em></h1>
    <p class="t-lede">people enjoy using.</p>
    <a class="t-btn t-btn--primary" href="#">Main action</a>
    <div class="t-card"><h2 class="t-h2">A card</h2><p class="t-muted">Body text.</p><span class="t-chip">Tag</span></div>
  </main>
</body>
```

## 6. Signature CSS (what makes it Paper)

```css
.t-card { transform: rotate(var(--t-tilt, 0deg)); }
.t-card:nth-child(3n+1) { --t-tilt: -.4deg; } .t-card:nth-child(3n+2) { --t-tilt: .3deg; }
.t-note { font-family: var(--t-hand); font-size: 1.6em; color: var(--t-accent-deep); line-height: 1; }
.t-sticker { display: inline-block; padding: 4px 10px; background: var(--t-accent-3); border: 1.5px solid var(--t-line-2); border-radius: 6px; transform: rotate(-3deg); font-family: var(--t-mono); font-size: 11px; text-transform: uppercase; letter-spacing: .08em; }
```

## 7. Accessibility

- Contrast: body text and card text meet WCAG AA on their backgrounds.
- Focus: 3px accent outline on every focusable element.
- Motion: `prefers-reduced-motion: reduce` turns every animation and transition off.
- Forced colours (Windows high contrast): borders fall back to `CanvasText`.

## 8. Swap universes

All 27 universe kits use the same `t-*` classes and `--t-*` tokens. Replace `paper.css` with another universe's file to change the whole look without touching markup.
