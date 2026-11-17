# Monolith Gloss theme — specification

A calm, premium app theme: **monolith** (solid near-black or warm-ivory slabs, sharp 3px corners, hairlines, heavy titles) + **gloss** (a gold accent with a specular top light on the one primary action) + **liquid glass** only on layers that float. Built for the Oruinwan workspace app (chat, calls, tasks, notes and AI in one place) by Thrishank Kuntimaddi, and shared free from [thrishankkuntimaddi.github.io](https://thrishankkuntimaddi.github.io/universes.html#kits).

| File | What it is |
|---|---|
| `monolith-gloss.css` | The complete stylesheet: base tokens (dark + light) and every `gl-*` component |
| `monolith-gloss.csv` | Every token with its exact dark and light value and what it is for |
| `MONOLITH-GLOSS-THEME.md` | This document |
| `prompt.txt` | Section 0 on its own, to paste into an AI coding tool |

---

## 0. Prompt to paste into a new session

See `prompt.txt` (the same text). In short: load Inter and `monolith-gloss.css`, `gl-root` on `<body>`, solid monolith base, liquid glass only on floating layers, one gold primary button per view, tokens only (no colour literals), warm light mode, calm motion.

---

## 1. The three materials

| Material | Where | How it looks |
|---|---|---|
| **Monolith** | Page, side panels, lists, cards, tables, inputs | Solid `--bg-base` / `--bg-surface`, 3px corners, 1px hairlines, no blur |
| **Gloss** | The one primary button per view, active states | Gold gradient (`--gl-accent-grad`) with a white specular band on top (`--gl-gloss`) and a warm glow |
| **Liquid glass** | Menus, popovers, dialogs, toasts, command palette, docks | Frosted (`blur(22px) saturate(170%)`), top sheen, lit rim, deep soft shadow; 7–10px corners |

App chrome (top bar, icon rail, panel headers) uses **gl-glass-bar**: the glass tint and sheen *without* blur, so scrolling stays fast.

## 2. Rules

- Dark by default. Light is a warm ivory canvas (`#f8f5f0`), white cards, warm shadows. Switch with `<html class="light">` or `data-theme="light"`.
- **Never write a colour literal** in a screen. Tokens only (table below).
- One primary action per view, top right of the page head. Everything else is a default or ghost button.
- In light mode the accent is a deeper gold (`#876434`, 4.8:1) so it reads as text. For gold *fills* use `--gl-accent-grad` + `--gl-on-accent`.
- Shadows in light mode are warm (`rgba(60,44,20,…)`), never neutral grey or black.
- `backdrop-filter` only on overlays, never on long scrolling lists. Without blur support every glass layer falls back to `--lg-solid`.
- Motion is calm: 150 / 190 / 220ms with `cubic-bezier(0.16, 1, 0.3, 1)`. Hover lift only on interactive cards and the primary button; buttons press in by 1px.
- Sentence case, plain words. Icons 14–18px; no emoji as UI icons.

## 3. Base tokens

| Token | Dark | Light | Use |
|---|---|---|---|
| `--bg-base` | `#0c0c0c` | `#f8f5f0` | Page |
| `--bg-surface` | `#111111` | `#ffffff` | Cards, panels |
| `--bg-hover` | `#161616` | `#efebe4` | Hover |
| `--bg-active` | `#1c1c1c` | `#e8e2d8` | Pressed, selected, default button |
| `--bg-input` | `#141414` | `#fbf9f6` | Inputs |
| `--border-subtle` | `#191919` | `#e9e4dc` | Dividers |
| `--border-default` | `#222222` | `#ddd6cb` | Cards, controls |
| `--border-accent` | `#383838` | `#c6bdaf` | Hover border |
| `--text-primary` | `#e4e4e4` | `#1a1916` | Text |
| `--text-secondary` | `#7a7a7a` | `#57524b` | Supporting |
| `--text-muted` | `#555555` | `#736d64` | Hints |
| `--accent` | `#b8956a` | `#876434` | Gold |
| `--state-success` | `#5aba8a` | `#3a8f6a` | Success |
| `--state-danger` | `#e05252` | `#c94040` | Danger |

The full list (gloss, glass, motion, radius) with exact values is in `monolith-gloss.csv`.

## 4. Shape

| Token | Value | For |
|---|---|---|
| `--gl-radius-sm` | 3px | Rows, inputs, buttons, cards |
| `--gl-radius-md` | 7px | Popovers, menus, toasts |
| `--gl-radius-lg` | 10px | Dialogs, sheets, command palette |
| `--gl-radius-pill` | 999px | Counts, chips on glass |

## 5. Components

| Class | Use |
|---|---|
| `gl-root` | On `<body>`: background with a warm ambient light, text, font |
| `gl-page-head`, `gl-eyebrow`, `gl-page-title`, `gl-page-lead` | Page header: where you are, the page noun, one sentence |
| `gl-card`, `gl-card--interactive` | Monolith cards; interactive ones lift on hover |
| `gl-panel`, `gl-panel-head`, `gl-panel-title`, `gl-panel-body`, `gl-panel-foot` | Side panels (272px) |
| `gl-section-label`, `gl-item` | Grouped list rows |
| `gl-btn`, `--sm`, `--lg`, `--block`, `--primary`, `--ghost` | Buttons |
| `gl-icon-btn` | Icon-only button (`aria-pressed="true"` for on) |
| `gl-input`, `gl-search` | Text fields, search with a leading icon |
| `gl-tabs`, `gl-tab`, `gl-count` | Segmented tabs with counts |
| `gl-liquid`, `--strong`, `--chrome` | Floating glass layers |
| `gl-scrim` + `gl-dialog` (+ `gl-dialog-head`, `gl-dialog-foot`) | Dialogs |
| `gl-toast` | Notifications |
| `gl-glass-bar` | Top bar and icon rail |
| `gl-empty` (+ `-mark`, `-title`, `-text`) | Empty states, inside the section where content would be |
| `gl-display`, `gl-sheen` | Heavy display type; metallic gold text |
| `gl-ambient` | Grid + aurora behind big empty areas |

```html
<body class="gl-root">
  <header class="gl-glass-bar" style="padding:10px 16px">Workspace</header>
  <main style="padding:24px">
    <div class="gl-page-head">
      <span class="gl-eyebrow">Agents &amp; tools</span>
      <h1 class="gl-page-title">Workflows</h1>
      <p class="gl-page-lead">Automate the busywork your team repeats every week.</p>
    </div>
    <button class="gl-btn gl-btn--primary">New workflow</button>
    <button class="gl-btn">Import</button>
    <button class="gl-btn gl-btn--ghost">Help</button>
    <div class="gl-card gl-card--interactive" style="padding:16px;margin-top:16px">A card</div>
  </main>
</body>
```

## 6. Page layout

```
Page head      eyebrow · title · lead          [primary action]
Toolbar        search + filters (only when there is a list to filter)
KPIs           3–4 key numbers (only when they help a decision)
Sections       cards in a grid, rows in a flush panel, tables
```

- Empty state: title says what's missing ("No workflows yet"), text says why it's useful, action is the primary action.
- Lists: the whole row is the click target; row actions on the right, revealed on hover on desktop, always visible on touch.
- Must work at 390px, 834/1024px and 1280–1440px, in light and dark.

## 7. Accessibility

- Light accent passes AA as text; focus rings are 2px gold with offset.
- `prefers-reduced-motion` removes dialog/toast animation; forced colours drop the glass.
- Every glass layer has a solid fallback when `backdrop-filter` is unsupported.
