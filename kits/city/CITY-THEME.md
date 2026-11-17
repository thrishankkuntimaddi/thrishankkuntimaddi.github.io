# Night city theme — specification

Downtown after dark: lit windows, sodium lights, clean sans type.

One of the 27 universes of [Thrishank Kuntimaddi's portfolio](https://thrishankkuntimaddi.github.io). Free to use in your own projects (MIT-style: keep, change, ship). Files in this kit:

| File | What it is |
|---|---|
| `city.css` | Drop-in stylesheet: tokens, components and the Night city signature |
| `city.csv` | Every token with its exact value and use (for Figma, spreadsheets or your own build) |
| `CITY-THEME.md` | This document |
| `prompt.txt` | Section 0 on its own, to paste into an AI coding tool |

---

## 0. Prompt to paste into a new session

```
Apply the "Night city" theme to this project. Downtown after dark: lit windows, sodium lights, clean sans type.

Use the files city.css, city.csv and CITY-THEME.md (from https://thrishankkuntimaddi.github.io/universes.html#kits). Follow them exactly:
1. Add city.css after the project's own CSS and the Google Fonts link at the top of it. Put class "t-page" on <body>.
2. Map components to the theme classes: page width → t-wrap; top bar → t-nav; cards/panels → t-card; app/screens previews → t-window; buttons → t-btn (the one main action per view → t-btn t-btn--primary; quiet actions → t-btn--ghost); text fields → t-input; tags/filters → t-chip; small labels → t-eyebrow; page title → t-title; section titles → t-h2; intro paragraph → t-lede; modals → t-dialog; notifications → t-toast.
3. Use only the --t-* tokens for colour, type, radius and shadow. Remove hard-coded colours, fonts and radii that fight the theme.
4. Theme rules:
   - Inter for everything, bold headings.
   - Lit-window pattern in the background.
   - Warm yellow accent, pink neon secondary.
5. Dark page, light cards: page text uses --t-ink on the dark background; anything inside a card uses --t-surface-ink.
6. Keep it accessible: text contrast AA, visible focus rings, prefers-reduced-motion turns animation off (already in the CSS).
7. Check it at 390px (phone) and 1440px (desktop) wide and fix anything that overflows.
Sample voice for headings: "I build interfaces for a city that never sleeps."
```

---

## 1. The look in one line

Downtown after dark: lit windows, sodium lights, clean sans type.

**Sample voice:** “I build interfaces for a city that never sleeps.”

## 2. Rules

- Inter for everything, bold headings.
- Lit-window pattern in the background.
- Warm yellow accent, pink neon secondary.
- Dark page with light paper cards: cards, windows and dialogs stay light so long text is easy to read.

## 3. Tokens

| Token | Value | Use |
|---|---|---|
| `--t-bg` | `#050814` | Page background colour |
| `--t-tint` | `#fff3d9` | Soft fill for hovers, chips and highlights |
| `--t-ink` | `#f3f6ff` | Main text on the page |
| `--t-muted` | `color-mix(in srgb, #f3f6ff 72%, #050814)` | Secondary text |
| `--t-faint` | `color-mix(in srgb, #f3f6ff 48%, #050814)` | Hints, captions, disabled |
| `--t-line` | `color-mix(in srgb, #f3f6ff 16%, transparent)` | Hairlines and dividers |
| `--t-line-2` | `color-mix(in srgb, #f3f6ff 30%, transparent)` | Stronger borders on cards and controls |
| `--t-surface` | `rgba(255, 255, 255, .9)` | Cards, windows, dialogs |
| `--t-surface-ink` | `#2c3046` | Text inside cards |
| `--t-accent` | `#ffd27a` | Primary action, key highlights (one per view) |
| `--t-accent-2` | `#8ec5ff` | Secondary highlight |
| `--t-accent-3` | `#ff6b8b` | Third highlight: stickers, marks, selection |
| `--t-display` | `"Inter", system-ui, sans-serif` | Headings |
| `--t-sans` | `"Inter", system-ui, sans-serif` | Body text |
| `--t-mono` | `"Space Mono", ui-monospace, monospace` | Labels, numbers, code |
| `--t-hand` | `"Caveat", cursive` | Hand-written notes |
| `--t-r` | `12px` | Cards and windows |
| `--t-r-sm` | `6px` | Buttons, inputs, chips |
| `--t-base-size` | `16px` | Body size |
| `--t-base-lh` | `1.6` | Body line height |
| `--t-page-bg` | `linear-gradient(#050814, #141c38)` | Full page background (gradient / pattern) |
| `--t-card-shadow` | `0 18px 50px -18px rgba(0, 0, 0, .7)` | Cards, windows, dialogs |
| `--t-border` | `1.5px solid var(--t-line-2)` | Cards, buttons, inputs |

## 4. Fonts

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&family=Caveat:wght@500;700&display=swap">
```

Display: `"Inter", system-ui, sans-serif` · Body: `"Inter", system-ui, sans-serif` · Labels: `"Space Mono", ui-monospace, monospace`

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
    <p class="t-lede">for a city that never sleeps.</p>
    <a class="t-btn t-btn--primary" href="#">Main action</a>
    <div class="t-card"><h2 class="t-h2">A card</h2><p class="t-muted">Body text.</p><span class="t-chip">Tag</span></div>
  </main>
</body>
```

## 6. Signature CSS (what makes it Night city)

```css
.t-title { font-weight: 800; letter-spacing: -.03em; }
```

## 7. Accessibility

- Contrast: body text and card text meet WCAG AA on their backgrounds.
- Focus: 3px accent outline on every focusable element.
- Motion: `prefers-reduced-motion: reduce` turns every animation and transition off.
- Forced colours (Windows high contrast): borders fall back to `CanvasText`.

## 8. Swap universes

All 27 universe kits use the same `t-*` classes and `--t-*` tokens. Replace `city.css` with another universe's file to change the whole look without touching markup.
