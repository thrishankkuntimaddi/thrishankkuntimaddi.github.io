# The glitch theme — specification

Corrupted signal: RGB split text, scanlines, flickers. Used sparingly.

One of the 27 universes of [Thrishank Kuntimaddi's portfolio](https://thrishankkuntimaddi.github.io). Free to use in your own projects (MIT-style: keep, change, ship). Files in this kit:

| File | What it is |
|---|---|
| `glitch.css` | Drop-in stylesheet: tokens, components and the The glitch signature |
| `glitch.csv` | Every token with its exact value and use (for Figma, spreadsheets or your own build) |
| `GLITCH-THEME.md` | This document |
| `prompt.txt` | Section 0 on its own, to paste into an AI coding tool |

---

## 0. Prompt to paste into a new session

```
Apply the "The glitch" theme to this project. Corrupted signal: RGB split text, scanlines, flickers. Used sparingly.

Use the files glitch.css, glitch.csv and GLITCH-THEME.md (from https://thrishankkuntimaddi.github.io/universes.html#kits). Follow them exactly:
1. Add glitch.css after the project's own CSS and the Google Fonts link at the top of it. Put class "t-page" on <body>.
2. Map components to the theme classes: page width → t-wrap; top bar → t-nav; cards/panels → t-card; app/screens previews → t-window; buttons → t-btn (the one main action per view → t-btn t-btn--primary; quiet actions → t-btn--ghost); text fields → t-input; tags/filters → t-chip; small labels → t-eyebrow; page title → t-title; section titles → t-h2; intro paragraph → t-lede; modals → t-dialog; notifications → t-toast.
3. Use only the --t-* tokens for colour, type, radius and shadow. Remove hard-coded colours, fonts and radii that fight the theme.
4. Theme rules:
   - RGB-split text shadow on headings (pink left, cyan right).
   - Scanlines over the page.
   - Short flicker on hover only; respect reduced motion.
5. Dark page, light cards: page text uses --t-ink on the dark background; anything inside a card uses --t-surface-ink.
6. Keep it accessible: text contrast AA, visible focus rings, prefers-reduced-motion turns animation off (already in the CSS).
7. Check it at 390px (phone) and 1440px (desktop) wide and fix anything that overflows.
Sample voice for headings: "I build interf@ces that never cr̷ash."
```

---

## 1. The look in one line

Corrupted signal: RGB split text, scanlines, flickers. Used sparingly.

**Sample voice:** “I build interf@ces that never cr̷ash.”

## 2. Rules

- RGB-split text shadow on headings (pink left, cyan right).
- Scanlines over the page.
- Short flicker on hover only; respect reduced motion.
- Dark page with light paper cards: cards, windows and dialogs stay light so long text is easy to read.

## 3. Tokens

| Token | Value | Use |
|---|---|---|
| `--t-bg` | `#05050a` | Page background colour |
| `--t-tint` | `#e6fff9` | Soft fill for hovers, chips and highlights |
| `--t-ink` | `#f0fff9` | Main text on the page |
| `--t-muted` | `color-mix(in srgb, #f0fff9 72%, #05050a)` | Secondary text |
| `--t-faint` | `color-mix(in srgb, #f0fff9 48%, #05050a)` | Hints, captions, disabled |
| `--t-line` | `color-mix(in srgb, #f0fff9 16%, transparent)` | Hairlines and dividers |
| `--t-line-2` | `color-mix(in srgb, #f0fff9 30%, transparent)` | Stronger borders on cards and controls |
| `--t-surface` | `var(--t-bg)` | Cards, windows, dialogs |
| `--t-surface-ink` | `#f0fff9` | Text inside cards |
| `--t-accent` | `#00ffd5` | Primary action, key highlights (one per view) |
| `--t-accent-2` | `#ff2a6d` | Secondary highlight |
| `--t-accent-3` | `#f5f500` | Third highlight: stickers, marks, selection |
| `--t-display` | `"JetBrains Mono", ui-monospace, monospace` | Headings |
| `--t-sans` | `"Space Grotesk", system-ui, sans-serif` | Body text |
| `--t-mono` | `"JetBrains Mono", ui-monospace, monospace` | Labels, numbers, code |
| `--t-hand` | `"Caveat", cursive` | Hand-written notes |
| `--t-r` | `0` | Cards and windows |
| `--t-r-sm` | `0` | Buttons, inputs, chips |
| `--t-base-size` | `16px` | Body size |
| `--t-base-lh` | `1.6` | Body line height |
| `--t-page-bg` | `repeating-linear-gradient(0deg, #05050a 0 3px, #0b0b14 3px 4px)` | Full page background (gradient / pattern) |
| `--t-card-shadow` | `0 18px 50px -18px rgba(0, 0, 0, .7)` | Cards, windows, dialogs |
| `--t-border` | `1.5px solid var(--t-line-2)` | Cards, buttons, inputs |

## 4. Fonts

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Space+Grotesk:wght@400;500;700&family=Caveat:wght@500;700&display=swap">
```

Display: `"JetBrains Mono", ui-monospace, monospace` · Body: `"Space Grotesk", system-ui, sans-serif` · Labels: `"JetBrains Mono", ui-monospace, monospace`

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
    <h1 class="t-title">I build <em>interf@ces</em></h1>
    <p class="t-lede">that never cr̷ash.</p>
    <a class="t-btn t-btn--primary" href="#">Main action</a>
    <div class="t-card"><h2 class="t-h2">A card</h2><p class="t-muted">Body text.</p><span class="t-chip">Tag</span></div>
  </main>
</body>
```

## 6. Signature CSS (what makes it The glitch)

```css
.t-title { text-shadow: -2px 0 var(--t-accent-2), 2px 0 var(--t-accent); }
.t-card:hover { animation: t-flicker .25s steps(2) 2; }
@keyframes t-flicker { 50% { opacity: .82; translate: 2px 0; } }
```

## 7. Accessibility

- Contrast: body text and card text meet WCAG AA on their backgrounds.
- Focus: 3px accent outline on every focusable element.
- Motion: `prefers-reduced-motion: reduce` turns every animation and transition off.
- Forced colours (Windows high contrast): borders fall back to `CanvasText`.

## 8. Swap universes

All 27 universe kits use the same `t-*` classes and `--t-*` tokens. Replace `glitch.css` with another universe's file to change the whole look without touching markup.
