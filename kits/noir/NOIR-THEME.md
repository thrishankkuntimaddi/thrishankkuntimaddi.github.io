# Noir theme — specification

A 1940s detective film: black and white, venetian-blind light, serif type.

One of the 27 universes of [Thrishank Kuntimaddi's portfolio](https://thrishankkuntimaddi.github.io). Free to use in your own projects (MIT-style: keep, change, ship). Files in this kit:

| File | What it is |
|---|---|
| `noir.css` | Drop-in stylesheet: tokens, components and the Noir signature |
| `noir.csv` | Every token with its exact value and use (for Figma, spreadsheets or your own build) |
| `NOIR-THEME.md` | This document |
| `prompt.txt` | Section 0 on its own, to paste into an AI coding tool |

---

## 0. Prompt to paste into a new session

```
Apply the "Noir" theme to this project. A 1940s detective film: black and white, venetian-blind light, serif type.

Use the files noir.css, noir.csv and NOIR-THEME.md (from https://thrishankkuntimaddi.github.io/universes.html#kits). Follow them exactly:
1. Add noir.css after the project's own CSS and the Google Fonts link at the top of it. Put class "t-page" on <body>.
2. Map components to the theme classes: page width → t-wrap; top bar → t-nav; cards/panels → t-card; app/screens previews → t-window; buttons → t-btn (the one main action per view → t-btn t-btn--primary; quiet actions → t-btn--ghost); text fields → t-input; tags/filters → t-chip; small labels → t-eyebrow; page title → t-title; section titles → t-h2; intro paragraph → t-lede; modals → t-dialog; notifications → t-toast.
3. Use only the --t-* tokens for colour, type, radius and shadow. Remove hard-coded colours, fonts and radii that fight the theme.
4. Theme rules:
   - Greyscale only. Georgia for everything.
   - Hard, long shadows; film grain.
   - Wording: "Case files", "The detective".
5. Dark page, light cards: page text uses --t-ink on the dark background; anything inside a card uses --t-surface-ink.
6. Keep it accessible: text contrast AA, visible focus rings, prefers-reduced-motion turns animation off (already in the CSS).
7. Check it at 390px (phone) and 1440px (desktop) wide and fix anything that overflows.
Sample voice for headings: "Every interface has a story. Mine end well."
```

---

## 1. The look in one line

A 1940s detective film: black and white, venetian-blind light, serif type.

**Sample voice:** “Every interface has a story. Mine end well.”

## 2. Rules

- Greyscale only. Georgia for everything.
- Hard, long shadows; film grain.
- Wording: "Case files", "The detective".
- Dark page with light paper cards: cards, windows and dialogs stay light so long text is easy to read.

## 3. Tokens

| Token | Value | Use |
|---|---|---|
| `--t-bg` | `#0b0b0b` | Page background colour |
| `--t-tint` | `#eeeeee` | Soft fill for hovers, chips and highlights |
| `--t-ink` | `#f2f2f2` | Main text on the page |
| `--t-muted` | `color-mix(in srgb, #f2f2f2 72%, #0b0b0b)` | Secondary text |
| `--t-faint` | `color-mix(in srgb, #f2f2f2 48%, #0b0b0b)` | Hints, captions, disabled |
| `--t-line` | `color-mix(in srgb, #f2f2f2 16%, transparent)` | Hairlines and dividers |
| `--t-line-2` | `color-mix(in srgb, #f2f2f2 30%, transparent)` | Stronger borders on cards and controls |
| `--t-surface` | `transparent` | Cards, windows, dialogs |
| `--t-surface-ink` | `#f2f2f2` | Text inside cards |
| `--t-accent` | `#d9d9d9` | Primary action, key highlights (one per view) |
| `--t-accent-2` | `#9a9a9a` | Secondary highlight |
| `--t-accent-3` | `#ffffff` | Third highlight: stickers, marks, selection |
| `--t-display` | `"Cormorant Garamond", Georgia, serif` | Headings |
| `--t-sans` | `"IBM Plex Mono", ui-monospace, monospace` | Body text |
| `--t-mono` | `"IBM Plex Mono", ui-monospace, monospace` | Labels, numbers, code |
| `--t-hand` | `"Caveat", cursive` | Hand-written notes |
| `--t-r` | `0` | Cards and windows |
| `--t-r-sm` | `0` | Buttons, inputs, chips |
| `--t-base-size` | `16px` | Body size |
| `--t-base-lh` | `1.6` | Body line height |
| `--t-page-bg` | `linear-gradient(#141414, #050505)` | Full page background (gradient / pattern) |
| `--t-card-shadow` | `0 18px 50px -18px rgba(0, 0, 0, .7)` | Cards, windows, dialogs |
| `--t-border` | `1.5px solid var(--t-line-2)` | Cards, buttons, inputs |

## 4. Fonts

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=IBM+Plex+Mono:wght@400;600&family=Caveat:wght@500;700&display=swap">
```

Display: `"Cormorant Garamond", Georgia, serif` · Body: `"IBM Plex Mono", ui-monospace, monospace` · Labels: `"IBM Plex Mono", ui-monospace, monospace`

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
    <h1 class="t-title">Every <em>interface</em> has a story.</h1>
    <p class="t-lede">Mine end well.</p>
    <a class="t-btn t-btn--primary" href="#">Main action</a>
    <div class="t-card"><h2 class="t-h2">A card</h2><p class="t-muted">Body text.</p><span class="t-chip">Tag</span></div>
  </main>
</body>
```

## 6. Signature CSS (what makes it Noir)

```css
.t-card { box-shadow: 14px 14px 0 rgba(0,0,0,.6); }
img { filter: grayscale(1) contrast(1.2); }
```

## 7. Accessibility

- Contrast: body text and card text meet WCAG AA on their backgrounds.
- Focus: 3px accent outline on every focusable element.
- Motion: `prefers-reduced-motion: reduce` turns every animation and transition off.
- Forced colours (Windows high contrast): borders fall back to `CanvasText`.

## 8. Swap universes

All 27 universe kits use the same `t-*` classes and `--t-*` tokens. Replace `noir.css` with another universe's file to change the whole look without touching markup.
