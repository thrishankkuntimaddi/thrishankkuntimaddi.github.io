# Blueprint theme — specification

Engineering drawings: navy ink, dashed outlines, grid paper and monospaced labels.

One of the 27 universes of [Thrishank Kuntimaddi's portfolio](https://thrishankkuntimaddi.github.io). Free to use in your own projects (MIT-style: keep, change, ship). Files in this kit:

| File | What it is |
|---|---|
| `blueprint.css` | Drop-in stylesheet: tokens, components and the Blueprint signature |
| `blueprint.csv` | Every token with its exact value and use (for Figma, spreadsheets or your own build) |
| `BLUEPRINT-THEME.md` | This document |
| `prompt.txt` | Section 0 on its own, to paste into an AI coding tool |

---

## 0. Prompt to paste into a new session

```
Apply the "Blueprint" theme to this project. Engineering drawings: navy ink, dashed outlines, grid paper and monospaced labels.

Use the files blueprint.css, blueprint.csv and BLUEPRINT-THEME.md (from https://thrishankkuntimaddi.github.io/universes.html#kits). Follow them exactly:
1. Add blueprint.css after the project's own CSS and the Google Fonts link at the top of it. Put class "t-page" on <body>.
2. Map components to the theme classes: page width → t-wrap; top bar → t-nav; cards/panels → t-card; app/screens previews → t-window; buttons → t-btn (the one main action per view → t-btn t-btn--primary; quiet actions → t-btn--ghost); text fields → t-input; tags/filters → t-chip; small labels → t-eyebrow; page title → t-title; section titles → t-h2; intro paragraph → t-lede; modals → t-dialog; notifications → t-toast.
3. Use only the --t-* tokens for colour, type, radius and shadow. Remove hard-coded colours, fonts and radii that fight the theme.
4. Theme rules:
   - Every box has a dashed ink border plus a thin outline 6px outside it, like a dimension line.
   - Headings: Space Mono 700, UPPERCASE, tight letter-spacing; no italics.
   - Label things like figures: "Fig. 01", "Spec sheet".
   - No shadows. Accent colour only as translucent fills.
   - Grid paper background: 24px minor and 120px major lines.
5. Light theme: keep everything light; no dark sections.
6. Keep it accessible: text contrast AA, visible focus rings, prefers-reduced-motion turns animation off (already in the CSS).
7. Check it at 390px (phone) and 1440px (desktop) wide and fix anything that overflows.
Sample voice for headings: "I engineer interfaces to spec, then make them human."
```

---

## 1. The look in one line

Engineering drawings: navy ink, dashed outlines, grid paper and monospaced labels.

**Sample voice:** “I engineer interfaces to spec, then make them human.”

## 2. Rules

- Every box has a dashed ink border plus a thin outline 6px outside it, like a dimension line.
- Headings: Space Mono 700, UPPERCASE, tight letter-spacing; no italics.
- Label things like figures: "Fig. 01", "Spec sheet".
- No shadows. Accent colour only as translucent fills.
- Grid paper background: 24px minor and 120px major lines.
- Light theme only.

## 3. Tokens

| Token | Value | Use |
|---|---|---|
| `--t-bg` | `#fbf8f2` | Page background colour |
| `--t-tint` | `#ffe9df` | Soft fill for hovers, chips and highlights |
| `--t-ink` | `#27437e` | Main text on the page |
| `--t-muted` | `#4c6497` | Secondary text |
| `--t-faint` | `#7e93bd` | Hints, captions, disabled |
| `--t-line` | `rgba(39, 67, 126, .18)` | Hairlines and dividers |
| `--t-line-2` | `rgba(39, 67, 126, .4)` | Stronger borders on cards and controls |
| `--t-surface` | `rgba(255, 255, 255, .5)` | Cards, windows, dialogs |
| `--t-surface-ink` | `#27437e` | Text inside cards |
| `--t-accent` | `#ff8a65` | Primary action, key highlights (one per view) |
| `--t-accent-2` | `#6bb6ff` | Secondary highlight |
| `--t-accent-3` | `#ffd166` | Third highlight: stickers, marks, selection |
| `--t-display` | `"Space Mono", monospace` | Headings |
| `--t-sans` | `"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` | Body text |
| `--t-mono` | `"Space Mono", ui-monospace, Menlo, monospace` | Labels, numbers, code |
| `--t-hand` | `"Caveat", cursive` | Hand-written notes |
| `--t-r` | `3px` | Cards and windows |
| `--t-r-sm` | `2px` | Buttons, inputs, chips |
| `--t-base-size` | `16px` | Body size |
| `--t-base-lh` | `1.6` | Body line height |
| `--t-page-bg` | `#fbf8f2` | Full page background (gradient / pattern) |
| `--t-card-shadow` | `none` | Cards, windows, dialogs |
| `--t-border` | `1.5px dashed var(--t-ink)` | Cards, buttons, inputs |

## 4. Fonts

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Inter:wght@400;500;600;700;800&family=Caveat:wght@500;700&display=swap">
```

Display: `"Space Mono", monospace` · Body: `"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` · Labels: `"Space Mono", ui-monospace, Menlo, monospace`

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
    <h1 class="t-title">I engineer <em>interfaces</em></h1>
    <p class="t-lede">to spec, then make them human.</p>
    <a class="t-btn t-btn--primary" href="#">Main action</a>
    <div class="t-card"><h2 class="t-h2">A card</h2><p class="t-muted">Body text.</p><span class="t-chip">Tag</span></div>
  </main>
</body>
```

## 6. Signature CSS (what makes it Blueprint)

```css
.t-card, .t-window { outline: 1px solid var(--t-line-2); outline-offset: 6px; }
.t-title, .t-h2 { text-transform: uppercase; letter-spacing: -.02em; font-style: normal; }
.t-title em, .t-h2 em { font-style: normal; }
.t-btn { text-transform: uppercase; font-family: var(--t-mono); font-size: 12.5px; letter-spacing: .06em; background: transparent; }
.t-btn--primary { background: color-mix(in srgb, var(--t-accent) 40%, transparent); }
```

## 7. Accessibility

- Contrast: body text and card text meet WCAG AA on their backgrounds.
- Focus: 3px accent outline on every focusable element.
- Motion: `prefers-reduced-motion: reduce` turns every animation and transition off.
- Forced colours (Windows high contrast): borders fall back to `CanvasText`.

## 8. Swap universes

All 27 universe kits use the same `t-*` classes and `--t-*` tokens. Replace `blueprint.css` with another universe's file to change the whole look without touching markup.
