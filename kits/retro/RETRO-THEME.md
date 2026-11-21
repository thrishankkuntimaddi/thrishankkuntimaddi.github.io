# Retro 1986 theme — specification

Arcade sunset: hot pink to purple, chrome text, square pixels and neon.

One of the 27 universes of [Thrishank Kuntimaddi's portfolio](https://thrishankkuntimaddi.github.io). Free to use in your own projects (MIT-style: keep, change, ship). Files in this kit:

| File | What it is |
|---|---|
| `retro.css` | Drop-in stylesheet: tokens, components and the Retro 1986 signature |
| `retro.csv` | Every token with its exact value and use (for Figma, spreadsheets or your own build) |
| `RETRO-THEME.md` | This document |
| `prompt.txt` | Section 0 on its own, to paste into an AI coding tool |

---

## 0. Prompt to paste into a new session

```
Apply the "Retro 1986" theme to this project. Arcade sunset: hot pink to purple, chrome text, square pixels and neon.

Use the files retro.css, retro.csv and RETRO-THEME.md (from https://thrishankkuntimaddi.github.io/universes.html#kits). Follow them exactly:
1. Add retro.css after the project's own CSS and the Google Fonts link at the top of it. Put class "t-page" on <body>.
2. Map components to the theme classes: page width → t-wrap; top bar → t-nav; cards/panels → t-card; app/screens previews → t-window; buttons → t-btn (the one main action per view → t-btn t-btn--primary; quiet actions → t-btn--ghost); text fields → t-input; tags/filters → t-chip; small labels → t-eyebrow; page title → t-title; section titles → t-h2; intro paragraph → t-lede; modals → t-dialog; notifications → t-toast.
3. Use only the --t-* tokens for colour, type, radius and shadow. Remove hard-coded colours, fonts and radii that fight the theme.
4. Theme rules:
   - Square corners. Press Start 2P headings, VT323 labels.
   - Sunset gradient background with a striped sun.
   - Neon pink glow; cyan and yellow as highlights.
5. Dark page, light cards: page text uses --t-ink on the dark background; anything inside a card uses --t-surface-ink.
6. Keep it accessible: text contrast AA, visible focus rings, prefers-reduced-motion turns animation off (already in the CSS).
7. Check it at 390px (phone) and 1440px (desktop) wide and fix anything that overflows.
Sample voice for headings: "Radical interfaces, totally tubular since ’86."
```

---

## 1. The look in one line

Arcade sunset: hot pink to purple, chrome text, square pixels and neon.

**Sample voice:** “Radical interfaces, totally tubular since ’86.”

## 2. Rules

- Square corners. Press Start 2P headings, VT323 labels.
- Sunset gradient background with a striped sun.
- Neon pink glow; cyan and yellow as highlights.
- Dark page with light paper cards: cards, windows and dialogs stay light so long text is easy to read.

## 3. Tokens

| Token | Value | Use |
|---|---|---|
| `--t-bg` | `#12002b` | Page background colour |
| `--t-tint` | `#ffe3f3` | Soft fill for hovers, chips and highlights |
| `--t-ink` | `#fff0fa` | Main text on the page |
| `--t-muted` | `color-mix(in srgb, #fff0fa 72%, #12002b)` | Secondary text |
| `--t-faint` | `color-mix(in srgb, #fff0fa 48%, #12002b)` | Hints, captions, disabled |
| `--t-line` | `color-mix(in srgb, #fff0fa 16%, transparent)` | Hairlines and dividers |
| `--t-line-2` | `color-mix(in srgb, #fff0fa 30%, transparent)` | Stronger borders on cards and controls |
| `--t-surface` | `var(--t-bg)` | Cards, windows, dialogs |
| `--t-surface-ink` | `#fff0fa` | Text inside cards |
| `--t-accent` | `#ff3d81` | Primary action, key highlights (one per view) |
| `--t-accent-2` | `#3df5ff` | Secondary highlight |
| `--t-accent-3` | `#ffe66b` | Third highlight: stickers, marks, selection |
| `--t-display` | `"Press Start 2P", monospace` | Headings |
| `--t-sans` | `"Inter", system-ui, sans-serif` | Body text |
| `--t-mono` | `"VT323", monospace` | Labels, numbers, code |
| `--t-hand` | `"Caveat", cursive` | Hand-written notes |
| `--t-r` | `0` | Cards and windows |
| `--t-r-sm` | `0` | Buttons, inputs, chips |
| `--t-base-size` | `16px` | Body size |
| `--t-base-lh` | `1.6` | Body line height |
| `--t-page-bg` | `linear-gradient(#12002b, #5a0a5e 60%, #ff3d81)` | Full page background (gradient / pattern) |
| `--t-card-shadow` | `0 18px 50px -18px rgba(0, 0, 0, .7)` | Cards, windows, dialogs |
| `--t-border` | `1.5px solid var(--t-line-2)` | Cards, buttons, inputs |

## 4. Fonts

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Inter:wght@400;500;600;700;800&family=VT323&family=Caveat:wght@500;700&display=swap">
```

Display: `"Press Start 2P", monospace` · Body: `"Inter", system-ui, sans-serif` · Labels: `"VT323", monospace`

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
    <h1 class="t-title">Radical <em>interfaces,</em></h1>
    <p class="t-lede">totally tubular since ’86.</p>
    <a class="t-btn t-btn--primary" href="#">Main action</a>
    <div class="t-card"><h2 class="t-h2">A card</h2><p class="t-muted">Body text.</p><span class="t-chip">Tag</span></div>
  </main>
</body>
```

## 6. Signature CSS (what makes it Retro 1986)

```css
.t-title { font-size: clamp(17px, 2.4vw, 32px); line-height: 1.6; background: linear-gradient(#fff 0 45%, var(--t-accent-3) 55%, var(--t-accent)); -webkit-background-clip: text; background-clip: text; color: transparent; }
.t-btn--primary { box-shadow: 0 0 18px var(--t-accent); }
```

## 7. Accessibility

- Contrast: body text and card text meet WCAG AA on their backgrounds.
- Focus: 3px accent outline on every focusable element.
- Motion: `prefers-reduced-motion: reduce` turns every animation and transition off.
- Forced colours (Windows high contrast): borders fall back to `CanvasText`.

## 8. Swap universes

All 27 universe kits use the same `t-*` classes and `--t-*` tokens. Replace `retro.css` with another universe's file to change the whole look without touching markup.
