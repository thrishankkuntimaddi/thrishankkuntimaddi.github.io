# Pixel theme — specification

8-bit arcade: square corners, thick ink borders, hard drop shadows and pixel fonts.

One of the 27 universes of [Thrishank Kuntimaddi's portfolio](https://thrishankkuntimaddi.github.io). Free to use in your own projects (MIT-style: keep, change, ship). Files in this kit:

| File | What it is |
|---|---|
| `pixel.css` | Drop-in stylesheet: tokens, components and the Pixel signature |
| `pixel.csv` | Every token with its exact value and use (for Figma, spreadsheets or your own build) |
| `PIXEL-THEME.md` | This document |
| `prompt.txt` | Section 0 on its own, to paste into an AI coding tool |

---

## 0. Prompt to paste into a new session

```
Apply the "Pixel" theme to this project. 8-bit arcade: square corners, thick ink borders, hard drop shadows and pixel fonts.

Use the files pixel.css, pixel.csv and PIXEL-THEME.md (from https://thrishankkuntimaddi.github.io/universes.html#kits). Follow them exactly:
1. Add pixel.css after the project's own CSS and the Google Fonts link at the top of it. Put class "t-page" on <body>.
2. Map components to the theme classes: page width → t-wrap; top bar → t-nav; cards/panels → t-card; app/screens previews → t-window; buttons → t-btn (the one main action per view → t-btn t-btn--primary; quiet actions → t-btn--ghost); text fields → t-input; tags/filters → t-chip; small labels → t-eyebrow; page title → t-title; section titles → t-h2; intro paragraph → t-lede; modals → t-dialog; notifications → t-toast.
3. Use only the --t-* tokens for colour, type, radius and shadow. Remove hard-coded colours, fonts and radii that fight the theme.
4. Theme rules:
   - Zero border radius everywhere.
   - Borders are 3px solid ink; shadows are hard 4–7px offsets in ink, never blurred.
   - Headings in Press Start 2P at small sizes (13–30px) with generous line-height (1.5–1.7).
   - Body text in VT323 at 20px; it is a pixel font, so go bigger than usual.
   - Images: image-rendering: pixelated.
5. Light theme: keep everything light; no dark sections.
6. Keep it accessible: text contrast AA, visible focus rings, prefers-reduced-motion turns animation off (already in the CSS).
7. Check it at 390px (phone) and 1440px (desktop) wide and fix anything that overflows.
Sample voice for headings: "I build interfaces worth pressing START for."
```

---

## 1. The look in one line

8-bit arcade: square corners, thick ink borders, hard drop shadows and pixel fonts.

**Sample voice:** “I build interfaces worth pressing START for.”

## 2. Rules

- Zero border radius everywhere.
- Borders are 3px solid ink; shadows are hard 4–7px offsets in ink, never blurred.
- Headings in Press Start 2P at small sizes (13–30px) with generous line-height (1.5–1.7).
- Body text in VT323 at 20px; it is a pixel font, so go bigger than usual.
- Images: image-rendering: pixelated.
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
| `--t-display` | `"Press Start 2P", monospace` | Headings |
| `--t-sans` | `"VT323", monospace` | Body text |
| `--t-mono` | `"VT323", monospace` | Labels, numbers, code |
| `--t-hand` | `"VT323", monospace` | Hand-written notes |
| `--t-r` | `0px` | Cards and windows |
| `--t-r-sm` | `0px` | Buttons, inputs, chips |
| `--t-base-size` | `20px` | Body size |
| `--t-base-lh` | `1.3` | Body line height |
| `--t-page-bg` | `#fbf8f2` | Full page background (gradient / pattern) |
| `--t-card-shadow` | `7px 7px 0 var(--t-ink)` | Cards, windows, dialogs |
| `--t-border` | `3px solid var(--t-ink)` | Cards, buttons, inputs |

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
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap">
```

Display: `"Press Start 2P", monospace` · Body: `"VT323", monospace` · Labels: `"VT323", monospace`

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
    <p class="t-lede">worth pressing START for.</p>
    <a class="t-btn t-btn--primary" href="#">Main action</a>
    <div class="t-card"><h2 class="t-h2">A card</h2><p class="t-muted">Body text.</p><span class="t-chip">Tag</span></div>
  </main>
</body>
```

## 6. Signature CSS (what makes it Pixel)

```css
.t-btn { font-family: var(--t-display); font-size: 10px; box-shadow: 4px 4px 0 var(--t-ink); }
.t-btn:active { transform: translate(4px, 4px); box-shadow: none; }
.t-title, .t-h2 { letter-spacing: 0; line-height: 1.6; font-weight: 400; }
.t-title { font-size: clamp(17px, 2.2vw, 30px); } .t-h2 { font-size: clamp(14px, 1.8vw, 22px); }
img { image-rendering: pixelated; }
```

## 7. Accessibility

- Contrast: body text and card text meet WCAG AA on their backgrounds.
- Focus: 3px accent outline on every focusable element.
- Motion: `prefers-reduced-motion: reduce` turns every animation and transition off.
- Forced colours (Windows high contrast): borders fall back to `CanvasText`.

## 8. Swap universes

All 27 universe kits use the same `t-*` classes and `--t-*` tokens. Replace `pixel.css` with another universe's file to change the whole look without touching markup.
