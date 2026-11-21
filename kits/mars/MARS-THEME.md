# Planet fall theme — specification

Landing on Mars: rust dunes, a dusty horizon, mission typography.

One of the 27 universes of [Thrishank Kuntimaddi's portfolio](https://thrishankkuntimaddi.github.io). Free to use in your own projects (MIT-style: keep, change, ship). Files in this kit:

| File | What it is |
|---|---|
| `mars.css` | Drop-in stylesheet: tokens, components and the Planet fall signature |
| `mars.csv` | Every token with its exact value and use (for Figma, spreadsheets or your own build) |
| `MARS-THEME.md` | This document |
| `prompt.txt` | Section 0 on its own, to paste into an AI coding tool |

---

## 0. Prompt to paste into a new session

```
Apply the "Planet fall" theme to this project. Landing on Mars: rust dunes, a dusty horizon, mission typography.

Use the files mars.css, mars.csv and MARS-THEME.md (from https://thrishankkuntimaddi.github.io/universes.html#kits). Follow them exactly:
1. Add mars.css after the project's own CSS and the Google Fonts link at the top of it. Put class "t-page" on <body>.
2. Map components to the theme classes: page width → t-wrap; top bar → t-nav; cards/panels → t-card; app/screens previews → t-window; buttons → t-btn (the one main action per view → t-btn t-btn--primary; quiet actions → t-btn--ghost); text fields → t-input; tags/filters → t-chip; small labels → t-eyebrow; page title → t-title; section titles → t-h2; intro paragraph → t-lede; modals → t-dialog; notifications → t-toast.
3. Use only the --t-* tokens for colour, type, radius and shadow. Remove hard-coded colours, fonts and radii that fight the theme.
4. Theme rules:
   - Space Mono display type; rust orange accent, sky blue secondary.
   - Horizon line across the background.
   - Mission wording: "Samples", "Base camp".
5. Dark page, light cards: page text uses --t-ink on the dark background; anything inside a card uses --t-surface-ink.
6. Keep it accessible: text contrast AA, visible focus rings, prefers-reduced-motion turns animation off (already in the CSS).
7. Check it at 390px (phone) and 1440px (desktop) wide and fix anything that overflows.
Sample voice for headings: "Interfaces built for new worlds and the first footprints."
```

---

## 1. The look in one line

Landing on Mars: rust dunes, a dusty horizon, mission typography.

**Sample voice:** “Interfaces built for new worlds and the first footprints.”

## 2. Rules

- Space Mono display type; rust orange accent, sky blue secondary.
- Horizon line across the background.
- Mission wording: "Samples", "Base camp".
- Dark page with light paper cards: cards, windows and dialogs stay light so long text is easy to read.

## 3. Tokens

| Token | Value | Use |
|---|---|---|
| `--t-bg` | `#1a0805` | Page background colour |
| `--t-tint` | `#ffe7dc` | Soft fill for hovers, chips and highlights |
| `--t-ink` | `#fff2ea` | Main text on the page |
| `--t-muted` | `color-mix(in srgb, #fff2ea 72%, #1a0805)` | Secondary text |
| `--t-faint` | `color-mix(in srgb, #fff2ea 48%, #1a0805)` | Hints, captions, disabled |
| `--t-line` | `color-mix(in srgb, #fff2ea 16%, transparent)` | Hairlines and dividers |
| `--t-line-2` | `color-mix(in srgb, #fff2ea 30%, transparent)` | Stronger borders on cards and controls |
| `--t-surface` | `color-mix(in srgb, var(--t-accent) 6%, var(--t-bg))` | Cards, windows, dialogs |
| `--t-surface-ink` | `#fff2ea` | Text inside cards |
| `--t-accent` | `#ff7a4d` | Primary action, key highlights (one per view) |
| `--t-accent-2` | `#6bb6ff` | Secondary highlight |
| `--t-accent-3` | `#ffd166` | Third highlight: stickers, marks, selection |
| `--t-display` | `"Space Grotesk", system-ui, sans-serif` | Headings |
| `--t-sans` | `"Space Grotesk", system-ui, sans-serif` | Body text |
| `--t-mono` | `"DM Mono", ui-monospace, monospace` | Labels, numbers, code |
| `--t-hand` | `"Caveat", cursive` | Hand-written notes |
| `--t-r` | `10px` | Cards and windows |
| `--t-r-sm` | `10px` | Buttons, inputs, chips |
| `--t-base-size` | `16px` | Body size |
| `--t-base-lh` | `1.6` | Body line height |
| `--t-page-bg` | `linear-gradient(#1a0805, #6b2414 55%, #a8442a 56%, #4a160a)` | Full page background (gradient / pattern) |
| `--t-card-shadow` | `0 18px 50px -18px rgba(0, 0, 0, .7)` | Cards, windows, dialogs |
| `--t-border` | `1.5px solid var(--t-line-2)` | Cards, buttons, inputs |

## 4. Fonts

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=DM+Mono:wght@400;500&family=Caveat:wght@500;700&display=swap">
```

Display: `"Space Grotesk", system-ui, sans-serif` · Body: `"Space Grotesk", system-ui, sans-serif` · Labels: `"DM Mono", ui-monospace, monospace`

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
    <h1 class="t-title"><em>Interfaces</em> built for new worlds</h1>
    <p class="t-lede">and the first footprints.</p>
    <a class="t-btn t-btn--primary" href="#">Main action</a>
    <div class="t-card"><h2 class="t-h2">A card</h2><p class="t-muted">Body text.</p><span class="t-chip">Tag</span></div>
  </main>
</body>
```

## 6. Signature CSS (what makes it Planet fall)

```css
/* tokens and background only */
```

## 7. Accessibility

- Contrast: body text and card text meet WCAG AA on their backgrounds.
- Focus: 3px accent outline on every focusable element.
- Motion: `prefers-reduced-motion: reduce` turns every animation and transition off.
- Forced colours (Windows high contrast): borders fall back to `CanvasText`.

## 8. Swap universes

All 27 universe kits use the same `t-*` classes and `--t-*` tokens. Replace `mars.css` with another universe's file to change the whole look without touching markup.
