# Sketch theme — specification

A pencil sketchbook: hand-lettered headings, wobbly lines and hatching.

One of the 27 universes of [Thrishank Kuntimaddi's portfolio](https://thrishankkuntimaddi.github.io). Free to use in your own projects (MIT-style: keep, change, ship). Files in this kit:

| File | What it is |
|---|---|
| `sketch.css` | Drop-in stylesheet: tokens, components and the Sketch signature |
| `sketch.csv` | Every token with its exact value and use (for Figma, spreadsheets or your own build) |
| `SKETCH-THEME.md` | This document |
| `prompt.txt` | Section 0 on its own, to paste into an AI coding tool |

---

## 0. Prompt to paste into a new session

```
Apply the "Sketch" theme to this project. A pencil sketchbook: hand-lettered headings, wobbly lines and hatching.

Use the files sketch.css, sketch.csv and SKETCH-THEME.md (from https://thrishankkuntimaddi.github.io/universes.html#kits). Follow them exactly:
1. Add sketch.css after the project's own CSS and the Google Fonts link at the top of it. Put class "t-page" on <body>.
2. Map components to the theme classes: page width → t-wrap; top bar → t-nav; cards/panels → t-card; app/screens previews → t-window; buttons → t-btn (the one main action per view → t-btn t-btn--primary; quiet actions → t-btn--ghost); text fields → t-input; tags/filters → t-chip; small labels → t-eyebrow; page title → t-title; section titles → t-h2; intro paragraph → t-lede; modals → t-dialog; notifications → t-toast.
3. Use only the --t-* tokens for colour, type, radius and shadow. Remove hard-coded colours, fonts and radii that fight the theme.
4. Theme rules:
   - Headings in Caveat 700, large (44–78px), tight line-height.
   - Borders look hand-drawn: uneven border-radius on every box.
   - Shadows are pencil-grey offsets, never coloured blurs.
   - Background has faint diagonal hatching.
   - Keep body text in Inter for readability; only display type is hand-written.
5. Light theme: keep everything light; no dark sections.
6. Keep it accessible: text contrast AA, visible focus rings, prefers-reduced-motion turns animation off (already in the CSS).
7. Check it at 390px (phone) and 1440px (desktop) wide and fix anything that overflows.
Sample voice for headings: "I sketch interfaces, then build every line."
```

---

## 1. The look in one line

A pencil sketchbook: hand-lettered headings, wobbly lines and hatching.

**Sample voice:** “I sketch interfaces, then build every line.”

## 2. Rules

- Headings in Caveat 700, large (44–78px), tight line-height.
- Borders look hand-drawn: uneven border-radius on every box.
- Shadows are pencil-grey offsets, never coloured blurs.
- Background has faint diagonal hatching.
- Keep body text in Inter for readability; only display type is hand-written.
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
| `--t-display` | `"Caveat", cursive` | Headings |
| `--t-sans` | `"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` | Body text |
| `--t-mono` | `"Space Mono", ui-monospace, Menlo, monospace` | Labels, numbers, code |
| `--t-hand` | `"Caveat", cursive` | Hand-written notes |
| `--t-r` | `20px` | Cards and windows |
| `--t-r-sm` | `12px` | Buttons, inputs, chips |
| `--t-base-size` | `16px` | Body size |
| `--t-base-lh` | `1.6` | Body line height |
| `--t-page-bg` | `#fbf8f2` | Full page background (gradient / pattern) |
| `--t-card-shadow` | `4px 5px 0 var(--t-line-2)` | Cards, windows, dialogs |
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
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Inter:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap">
```

Display: `"Caveat", cursive` · Body: `"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` · Labels: `"Space Mono", ui-monospace, Menlo, monospace`

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
    <h1 class="t-title">I sketch <em>interfaces,</em></h1>
    <p class="t-lede">then build every line.</p>
    <a class="t-btn t-btn--primary" href="#">Main action</a>
    <div class="t-card"><h2 class="t-h2">A card</h2><p class="t-muted">Body text.</p><span class="t-chip">Tag</span></div>
  </main>
</body>
```

## 6. Signature CSS (what makes it Sketch)

```css
.t-card, .t-btn, .t-input, .t-window { border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px; }
.t-card { border-width: 2px; }
.t-title { font-size: clamp(42px, 5.4vw, 78px); line-height: .98; font-weight: 700; letter-spacing: 0; }
.t-h2 { font-size: clamp(36px, 4.6vw, 60px); font-weight: 700; }
.t-underline { background: linear-gradient(transparent 62%, var(--t-accent-3) 62% 88%, transparent 88%); }
```

## 7. Accessibility

- Contrast: body text and card text meet WCAG AA on their backgrounds.
- Focus: 3px accent outline on every focusable element.
- Motion: `prefers-reduced-motion: reduce` turns every animation and transition off.
- Forced colours (Windows high contrast): borders fall back to `CanvasText`.

## 8. Swap universes

All 27 universe kits use the same `t-*` classes and `--t-*` tokens. Replace `sketch.css` with another universe's file to change the whole look without touching markup.
