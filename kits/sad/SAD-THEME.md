# The rain theme — specification

A rainy evening: soft blues, falling streaks, slow and gentle motion.

One of the 27 universes of [Thrishank Kuntimaddi's portfolio](https://thrishankkuntimaddi.github.io). Free to use in your own projects (MIT-style: keep, change, ship). Files in this kit:

| File | What it is |
|---|---|
| `sad.css` | Drop-in stylesheet: tokens, components and the The rain signature |
| `sad.csv` | Every token with its exact value and use (for Figma, spreadsheets or your own build) |
| `SAD-THEME.md` | This document |
| `prompt.txt` | Section 0 on its own, to paste into an AI coding tool |

---

## 0. Prompt to paste into a new session

```
Apply the "The rain" theme to this project. A rainy evening: soft blues, falling streaks, slow and gentle motion.

Use the files sad.css, sad.csv and SAD-THEME.md (from https://thrishankkuntimaddi.github.io/universes.html#kits). Follow them exactly:
1. Add sad.css after the project's own CSS and the Google Fonts link at the top of it. Put class "t-page" on <body>.
2. Map components to the theme classes: page width → t-wrap; top bar → t-nav; cards/panels → t-card; app/screens previews → t-window; buttons → t-btn (the one main action per view → t-btn t-btn--primary; quiet actions → t-btn--ghost); text fields → t-input; tags/filters → t-chip; small labels → t-eyebrow; page title → t-title; section titles → t-h2; intro paragraph → t-lede; modals → t-dialog; notifications → t-toast.
3. Use only the --t-* tokens for colour, type, radius and shadow. Remove hard-coded colours, fonts and radii that fight the theme.
4. Theme rules:
   - Slow transitions (400–600ms), no bounce.
   - Thin diagonal rain streaks in the background.
   - Gentle wording; warm amber only for the one light in the dark.
5. Dark page, light cards: page text uses --t-ink on the dark background; anything inside a card uses --t-surface-ink.
6. Keep it accessible: text contrast AA, visible focus rings, prefers-reduced-motion turns animation off (already in the CSS).
7. Check it at 390px (phone) and 1440px (desktop) wide and fix anything that overflows.
Sample voice for headings: "I build interfaces that hold you on rainy days."
```

---

## 1. The look in one line

A rainy evening: soft blues, falling streaks, slow and gentle motion.

**Sample voice:** “I build interfaces that hold you on rainy days.”

## 2. Rules

- Slow transitions (400–600ms), no bounce.
- Thin diagonal rain streaks in the background.
- Gentle wording; warm amber only for the one light in the dark.
- Dark page with light paper cards: cards, windows and dialogs stay light so long text is easy to read.

## 3. Tokens

| Token | Value | Use |
|---|---|---|
| `--t-bg` | `#0b1220` | Page background colour |
| `--t-tint` | `#e3ecff` | Soft fill for hovers, chips and highlights |
| `--t-ink` | `#e9f0ff` | Main text on the page |
| `--t-muted` | `color-mix(in srgb, #e9f0ff 72%, #0b1220)` | Secondary text |
| `--t-faint` | `color-mix(in srgb, #e9f0ff 48%, #0b1220)` | Hints, captions, disabled |
| `--t-line` | `color-mix(in srgb, #e9f0ff 16%, transparent)` | Hairlines and dividers |
| `--t-line-2` | `color-mix(in srgb, #e9f0ff 30%, transparent)` | Stronger borders on cards and controls |
| `--t-surface` | `rgba(255, 255, 255, .025)` | Cards, windows, dialogs |
| `--t-surface-ink` | `#e9f0ff` | Text inside cards |
| `--t-accent` | `#6b8cff` | Primary action, key highlights (one per view) |
| `--t-accent-2` | `#9fb8ff` | Secondary highlight |
| `--t-accent-3` | `#ffd28a` | Third highlight: stickers, marks, selection |
| `--t-display` | `"Newsreader", Georgia, serif` | Headings |
| `--t-sans` | `"Figtree", system-ui, sans-serif` | Body text |
| `--t-mono` | `"DM Mono", ui-monospace, monospace` | Labels, numbers, code |
| `--t-hand` | `"Caveat", cursive` | Hand-written notes |
| `--t-r` | `14px` | Cards and windows |
| `--t-r-sm` | `999px` | Buttons, inputs, chips |
| `--t-base-size` | `16px` | Body size |
| `--t-base-lh` | `1.6` | Body line height |
| `--t-page-bg` | `linear-gradient(#0b1220, #1b2a42)` | Full page background (gradient / pattern) |
| `--t-card-shadow` | `0 18px 50px -18px rgba(0, 0, 0, .7)` | Cards, windows, dialogs |
| `--t-border` | `1.5px solid var(--t-line-2)` | Cards, buttons, inputs |

## 4. Fonts

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&family=Figtree:wght@300;400;600&family=DM+Mono:wght@400;500&family=Caveat:wght@500;700&display=swap">
```

Display: `"Newsreader", Georgia, serif` · Body: `"Figtree", system-ui, sans-serif` · Labels: `"DM Mono", ui-monospace, monospace`

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
    <h1 class="t-title">I build <em>interfaces</em></h1>
    <p class="t-lede">that hold you on rainy days.</p>
    <a class="t-btn t-btn--primary" href="#">Main action</a>
    <div class="t-card"><h2 class="t-h2">A card</h2><p class="t-muted">Body text.</p><span class="t-chip">Tag</span></div>
  </main>
</body>
```

## 6. Signature CSS (what makes it The rain)

```css
.t-card, .t-btn { transition-duration: .55s; }
```

## 7. Accessibility

- Contrast: body text and card text meet WCAG AA on their backgrounds.
- Focus: 3px accent outline on every focusable element.
- Motion: `prefers-reduced-motion: reduce` turns every animation and transition off.
- Forced colours (Windows high contrast): borders fall back to `CanvasText`.

## 8. Swap universes

All 27 universe kits use the same `t-*` classes and `--t-*` tokens. Replace `sad.css` with another universe's file to change the whole look without touching markup.
