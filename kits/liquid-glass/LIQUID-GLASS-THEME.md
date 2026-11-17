# Liquid Glass Theme — complete specification

A portable, Apple-style **Liquid Glass** theme (iOS 26 / macOS Tahoe look) for any web app — React, Vue, Svelte, plain HTML, Capacitor, Tauri. It was built and refined in the Expense Tracker project through many rounds of feedback; this document captures the final result and every decision behind it, so another project (e.g. **Oruinwan**) can apply the exact same theme in one session.

Everything needed is in this one file: the rules, the tokens, the components, the full CSS and the full JavaScript (sections 11 and 12).

---

## 0. Brief to paste into a new session

> Apply the Liquid Glass theme described in `LIQUID-GLASS-THEME.md` to this project. Follow its rules exactly — they come from many rounds of owner feedback:
> 1. Create `liquid-glass.css` and `liquid-glass.js` from sections 11–12 of the document, unchanged, and load them after the project's own CSS.
> 2. Add the pre-paint theme script (section 3) to `<head>`; call `LiquidGlass.init()` once after the app mounts; add `lg-root` to `<body>`.
> 3. Map the project's components to the classes in section 6: cards → `lg-tile`; top bar / bottom tab bar / toolbars / toasts → `lg-bar`; modals and bottom sheets → `lg-sheet`; buttons → `lg-btn` (`is-primary` for the main action); icon-only buttons → `lg-icon-btn`; tabs → `lg-segmented`; inputs → `lg-field`; tappable cards → `lg-pressable` (+ `data-lg-nav` if they open a page).
> 4. Remove every hard-coded brand colour (blue, indigo, violet, purple gradients, black filled buttons) from the UI. The glass is colourless; colour only for meaning (money in green, money out red, category icons).
> 5. Light theme by default on every device; Dark and Auto only when the user picks them.
> 6. Page headers and the bottom bar float over the content and content scrolls under them; cards get no live blur.
> 7. No visible scrollbars; every tappable thing reacts to hover (mouse) and to touch (sink, then spring back).
> 8. Verify in a browser at phone (390×844) and desktop (1440×900) sizes, light and dark, and scroll so content passes under the glass. Keep scrolling at 60 fps.

---

## 1. What the owner wants (the non-negotiables)

These came from direct feedback. Breaking any of them was rejected.

| Rule | Why / what was rejected |
|---|---|
| **The glass has no colour.** It frosts, brightens and saturates what is behind it. | "Apple doesn't use any colour" — a blue-tinted theme (blue hero, blue + button, blue active tab) was rejected as "messy". |
| **Light theme by default** on every device, even when the phone/computer is in dark mode. Dark and Auto only by explicit choice. | "I need white or light theme by default." |
| **No black slabs in light mode.** Primary / selected buttons are **white glass with a dark label**, like the active circles in Control Center. | Black filled buttons and a black selected tab were called "deep black, not matching". |
| **Authentic transparency.** Compare with macOS Control Center and the volume HUD: you can see content through the glass, the edge is lit like thick glass. | Milky, near-opaque white panels were "not the authentic liquid glass". |
| **Content scrolls under the glass.** Headers and the bottom bar float. | "Observe the volume HUD when I scroll." |
| **Light and dark look like the same material.** Dark is the same glass over dark content (smoked), not a different design. | "Not much difference between light and dark on the system." |
| **Colour only where it means something**: money in (green), money out (red), soft pastel category icons. | The pastel category icons were the one colour the owner liked. |
| **Everything reacts.** Hover lifts (mouse); touch sinks and springs back (phone). One tap sound per tap. | "When I tap I can't feel it" / "double tap sounds". |
| **No visible scrollbars** anywhere. | "Remove those lines." |
| **Never laggy.** | "I don't want the app laggy." Scrolling must stay at 60 fps on a mid-range phone. |

---

## 2. How Liquid Glass is built (the physics)

1. **Fill**: almost none — white at 16–34 % in light, white at 5–10 % in dark. The colour you see comes from what is behind.
2. **Frost**: `backdrop-filter: blur(9px) saturate(190%) brightness(1.05)` on floating bars only. Saturation makes colour behind glow through; brightness lifts it.
3. **Bevel** (the thickness — this is what makes it read as glass): a bright 1.5 px light catch on the top and left edges, a softer glow on the bottom and right, a 1 px rim, a soft glow inside the edge, a 0.5 px outer hairline. All `box-shadow`, no borders, no images.
4. **Refraction** (Chromium only — Chrome, Edge, Android WebView): the backdrop bends at the rim through an SVG displacement map (`#lg-refract`). Safari / WebKit (iPhone, Mac Tauri apps) keep the frost and bevel without bending.
5. **Wallpaper**: a soft colour field (sky, peach, lavender, mint over `#EEF0F6`; deep blue, plum, indigo, teal over `#06070B` in dark) fixed behind everything, so even clear tiles pick up colour.
6. **Layering**: floating layer = real lens (frost + bevel + refraction); content layer = clear tiles (fill + bevel, **no blur** — over a static wallpaper a blur is invisible and only costs frames).

---

## 3. Theme switching

- `<html data-theme="light">` (default) or `<html data-theme="dark">`.
- Stored per device in `localStorage['lg-theme']` = `'light' | 'dark' | 'system'`; **missing means light**. Never treat "the last theme shown" as a choice.
- Pre-paint script in `<head>` (prevents a dark flash):

```html
<script>try{var p=localStorage.getItem('lg-theme');var d=p==='dark'||(p==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.setAttribute('data-theme',d?'dark':'light')}catch(e){}</script>
```

- Also keep the browser bar light: `<meta name="theme-color" content="#EEF0F6">` (dark: `#06070B`).
- Native shells: make the launch/splash background light (`#EEF0F6`) even in system dark mode (Android `values-night/colors.xml` and night splash images, Tauri `backgroundColor`, Capacitor `backgroundColor`).

---

## 4. Tokens (all values)

### Light (default)

| Token | Value | Use |
|---|---|---|
| `--lg-tile` | `rgba(255,255,255,.24)` | cards — nearly clear |
| `--lg-bar` | `rgba(255,255,255,.16)` | floating bars over moving content |
| `--lg-ctl` | `rgba(255,255,255,.34)` | buttons, circles |
| `--lg-dense` | `rgba(255,255,255,.66)` | sheets / dialogs over a dimmed page |
| `--lg-hover` / `--lg-press` | `.42` / `.50` white | tile hover / press |
| `--lg-selected` | `rgba(255,255,255,.92)` | primary / selected = white glass |
| `--lg-frost` | `blur(9px) saturate(190%) brightness(1.05)` | live backdrop on bars |
| `--lg-frost-dense` | `blur(30px) saturate(180%) brightness(1.06)` | sheets |
| `--lg-hi` / `--lg-hi2` | white `.95` / `.55` | top-left light catch / bottom-right glow |
| `--lg-line` / `--lg-glow` / `--lg-out` | white `.30` / white `.22` / black `.05` | rim / inner glow / outer hairline |
| `--lg-drop` | `0 10px 28px -12px rgba(0,0,0,.24)` | floating shadow |
| `--lg-wall` | `#EEF0F6` | wallpaper base |
| `--lg-text` / `-2` / `-3` | `#0A0A0C` / `.65` / `.45` | text |
| `--lg-well` | `rgba(120,120,128,.12)` | recessed tracks, wells |
| `--lg-hairline` | `rgba(60,60,67,.13)` | separators |

### Dark (`[data-theme="dark"]`, smoked glass)

tile white `.055` · bar `rgba(28,28,32,.22)` · ctl white `.10` · dense `rgba(34,34,38,.66)` · frost `blur(9px) saturate(180%) brightness(.94)` · hi `.55` · hi2 `.26` · line `.12` · glow `.07` · out black `.35` · wall `#06070B` · text `#F5F5F7` / `.68` / `.45`. Selected stays white glass with a dark label (as in Control Center).

### Meaning colours (Apple system)

| | Light | Dark |
|---|---|---|
| green (money in) | `#1E9E4A` | `#30D158` |
| red (money out) | `#FF3B30` | `#FF453A` |
| blue | `#007AFF` | `#0A84FF` |
| orange | `#D97A00` | `#FF9F0A` |
| purple | `#AF52DE` | `#BF5AF2` |
| teal | `#0E93AD` | `#40C8E0` |
| switch on | `#34C759` | `#34C759` |

Use them for **meaning only** (amounts, category icon tiles, status chips) — never as an accent for bars, buttons or tabs.

### Shape, type, motion

- Radii: panels **28px**, tiles **22px**, bars **32px**, sheets **32px** (bottom sheet **34px** top corners), fields **14px**, buttons and chips **capsules** (`999px`), icon buttons **circles**.
- Type: `-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", Inter, "Segoe UI", Roboto, system-ui, sans-serif`; letter-spacing `-0.01em` (headings `-0.03em`). For Indic scripts set letter-spacing to normal and avoid forced uppercase.
- Spring: `cubic-bezier(.3,1.45,.45,1)` (slight overshoot) for every interactive change; release after a press `cubic-bezier(.3,1.6,.45,1)`.

### The bevel (the look in one variable)

```css
--lg-bevel:
  inset 1.5px 1.5px 0 -0.5px var(--lg-hi),     /* top-left light catch */
  inset -1.5px -1.5px 0 -0.5px var(--lg-hi2),  /* bottom-right glow */
  inset 0 0 0 1px var(--lg-line),              /* the rim */
  inset 0 0 22px 0 var(--lg-glow),             /* light scattered inside */
  0 0 0 0.5px var(--lg-out);                   /* outer hairline */
```

---

## 5. Layer map — what gets which material

| Element | Class | Material |
|---|---|---|
| App background | `lg-root` on `<body>` | wallpaper colour field |
| Card, panel, list group, hero card | `lg-tile` | clear fill + bevel + drop, **no blur** |
| Top bar / page header | `lg-header lg-bar` | live frost + bevel (+ refraction); floats over content |
| Bottom tab bar | `lg-dock lg-bar` | floating capsule, sliding `lg-dock-pill`, `lg-dock-action` white orb |
| Desktop sidebar | `lg-sidebar` | clear pane inset 10px, 26px radius; `lg-nav-item.is-active` = glass pill |
| Modal / bottom sheet | `lg-sheet` (`is-bottom`) + `lg-scrim` | dense fill + heavy frost; page behind dims |
| Toast | `lg-toast` | dark clear glass (light in dark mode) |
| Button | `lg-btn` | glass capsule |
| Main action | `lg-btn is-primary` | **white glass, dark label** |
| Meaning action (e.g. "Add expense") | `lg-btn is-tint` + `--lg-tint` | tinted glass |
| Icon-only button (back, close, help) | `lg-icon-btn` | glass circle |
| Tabs / filters | `lg-segmented` | recessed track, raised white pill |
| Input | `lg-field` (`is-inline` inside a tile) | recessed well / no edge |
| Switch | `lg-switch` (`aria-checked`) | Apple green |
| Status | `lg-chip` (`is-green` / `is-red`) | tinted capsule |
| Category icon | `lg-icon-tile` + `--lg-tint` | pastel tint + coloured glyph |
| Tappable card | `lg-pressable` (+ `data-lg-nav` if it opens a page) | hover lift, press sink, spring back |

---

## 6. Motion and feel

- **Mouse**: tiles and buttons lift 2–3 px and scale to 1.025 on hover; tiles brighten, a soft light sweeps across, their icon tile scales to 1.1 and tilts −3°. Pressing sinks to 0.96.
- **Touch** (`LiquidGlass.press()`): the control sinks to 0.95 the moment the finger lands (`.lg-press`), stays down while held (≥110 ms so a quick tap is visible), springs back with an overshoot on lift (`.lg-release`). Elements with `data-lg-nav` wait 130 ms before their click runs so the spring is seen before the page changes. The replayed click carries `event.lgReplay = true` — **tap-sound or analytics handlers must skip it** (otherwise a double tap sound).
- **Dock pill**: slides between tabs with the spring, moved by `transform` only.
- Only `transform`, `opacity`, `box-shadow`, `background-color` animate.

---

## 7. Performance rules (keep it at 60 fps)

1. Live `backdrop-filter` only on the floating layer (bars, sheets, toasts) — never on cards.
2. Every glass element gets its own layer (`transform: translateZ(0)`) — also prevents "ghost" repaints in Android WebView.
3. Touch devices: lighter frost; low-resolution phones (`max-resolution: 1.5dppx`): no refraction and denser bars.
4. No full-screen blur under a dialog on touch devices (dim only; the sheet has its own frost).
5. Animate transform/opacity only; no layout properties.
6. Measured result in Expense Tracker (4× CPU throttle, 390×844): scrolling under the glass and opening sheets at 60 fps, zero dropped frames.

---

## 8. Accessibility

- `prefers-reduced-transparency`: solid surfaces, no blur, no wallpaper.
- `prefers-contrast: more`: denser glass, stronger rims and secondary text.
- `prefers-reduced-motion`: no lift, press zoom or spring.
- No `backdrop-filter` support: denser bars.
- Focus ring: soft grey `2.5px` outline — visible but not coloured.
- Keep text contrast: primary text `#0A0A0C` on light glass, `#F5F5F7` on dark.

---

## 9. Setup checklist for a new project

1. Copy `liquid-glass.css` (section 11) and `liquid-glass.js` (section 12) into the project unchanged.
2. Load the CSS **after** the project's own styles.
3. Add the pre-paint script and `theme-color` meta to `<head>` (section 3).
4. `<body class="lg-root">` and call `LiquidGlass.init()` once after mount (`import { LiquidGlass } from './liquid-glass.js'`).
5. Page structure for floating headers: `<section><header class="lg-header lg-bar">…</header><div style="overflow:auto">…</div></section>` — the header must be directly followed by the scrolling element.
6. Bottom bar: `<nav class="lg-dock lg-bar">` with `.lg-dock-tab` buttons; toggle `.is-active` on the current tab (the pill follows). Give the scrolling content `padding-bottom: ~110px` so the last item clears the dock.
7. Map components (section 5). Remove brand colours, black filled buttons and any coloured active-tab styling.
8. Theme picker: Light / Dark / Auto buttons calling `LiquidGlass.theme.set('light'|'dark'|'system')`.
9. If the project plays a tap sound on click, skip events with `event.lgReplay`.
10. Native shells: light splash/launch background; app icon as a clear glass tile with one crisp glyph (no overlapping translucent layers — they read as muddy at small sizes).
11. Verify: phone + desktop, light + dark, scrolled; hover and touch feedback; no scrollbars; 60 fps scroll.

---

## 10. Lessons (mistakes not to repeat)

- A tinted (blue / indigo / violet) accent fights the material. Keep the accent graphite in light and near-white in dark, and render primary/selected as white glass.
- Milky 45–60 % white panels read as plastic, not glass. Clarity + bevel is what reads as glass.
- Blur on every card makes phones lag and looks the same as no blur over a smooth wallpaper.
- `.lg-tile`-style rules that pin `transform` for a GPU layer swallow hover/press transforms — give pressable tiles their own transform rules (the kit does).
- Inline inputs inside a tile must not get a recessed well (a "sharp box" around a placeholder was rejected).
- Android home-screen widgets (RemoteViews) only allow certain view classes — a plain `<View>` spacer makes the widget "Can't load widget"; use `FrameLayout`. Widgets can't blur: use a translucent fill + top sheen + lit 1dp rim.
- Emails can't do glass: use a white rounded card on `#F2F2F7`, the app icon, system font, black capsule buttons.
- Explicit theme choice only — never auto-copy "the last theme shown" into the preference.

---

## 11. `liquid-glass.css` (complete)

```css
/* ══════════════════════════════════════════════════════════════════
   LIQUID GLASS KIT — a portable Apple-style Liquid Glass theme
   Plain CSS, no framework. Light by default; dark with
   <html data-theme="dark">. Pair with liquid-glass.js for edge
   refraction, touch press feedback, floating headers and the dock pill.

   Principles (see README.md):
   • Glass is nearly clear — it frosts, brightens and saturates what is
     behind it; it has almost no colour of its own.
   • Thickness comes from the edge: a lit bevel (top-left bright,
     bottom-right glow), an inner glow and a hairline.
   • Glass is the FLOATING layer (bars, docks, sheets, toasts) — content
     scrolls under it. Cards are clear tiles WITHOUT live blur.
   • Colourless: primary / selected controls are white glass with a dark
     label. Colour only where it means something (money, categories).
   • Motion: one spring; only transform / opacity / shadow animate.
══════════════════════════════════════════════════════════════════ */

/* ── 1. Tokens: light (default) ─────────────────────────────────── */
:root, [data-theme="light"] {
  /* glass fills (white, mostly transparent) */
  --lg-tile:  rgba(255, 255, 255, 0.24);   /* cards: nearly clear */
  --lg-bar:   rgba(255, 255, 255, 0.16);   /* floating bars over moving content */
  --lg-ctl:   rgba(255, 255, 255, 0.34);   /* buttons, circles */
  --lg-dense: rgba(255, 255, 255, 0.66);   /* sheets / dialogs over a dimmed page */
  --lg-hover: rgba(255, 255, 255, 0.42);
  --lg-press: rgba(255, 255, 255, 0.50);
  --lg-selected: rgba(255, 255, 255, 0.92); /* selected / primary: white glass */

  /* lens optics */
  --lg-frost: blur(9px) saturate(190%) brightness(1.05);
  --lg-frost-dense: blur(30px) saturate(180%) brightness(1.06);
  --lg-hi:   rgba(255, 255, 255, 0.95);    /* top-left light catch */
  --lg-hi2:  rgba(255, 255, 255, 0.55);    /* bottom-right caustic */
  --lg-line: rgba(255, 255, 255, 0.30);    /* the rim */
  --lg-glow: rgba(255, 255, 255, 0.22);    /* light scattered inside the edge */
  --lg-out:  rgba(0, 0, 0, 0.05);          /* hairline against light backdrops */
  --lg-drop: 0 10px 28px -12px rgba(0, 0, 0, 0.24);
  --lg-drop-lift: 0 18px 36px -16px rgba(0, 0, 0, 0.32);

  /* wallpaper the glass sits on */
  --lg-wall: #EEF0F6;
  --lg-wall-1: rgba(122, 178, 255, 0.55);  /* sky */
  --lg-wall-2: rgba(255, 184, 150, 0.50);  /* peach */
  --lg-wall-3: rgba(186, 164, 255, 0.45);  /* lavender */
  --lg-wall-4: rgba(132, 226, 196, 0.42);  /* mint */

  /* text */
  --lg-text:   #0A0A0C;
  --lg-text-2: rgba(10, 10, 12, 0.65);
  --lg-text-3: rgba(10, 10, 12, 0.45);
  --lg-hairline: rgba(60, 60, 67, 0.13);
  --lg-well: rgba(120, 120, 128, 0.12);    /* recessed tracks, wells */

  /* meaning colours (Apple system) */
  --lg-green: #1E9E4A;  --lg-red: #FF3B30;  --lg-blue: #007AFF;
  --lg-orange: #D97A00; --lg-purple: #AF52DE; --lg-teal: #0E93AD;

  /* shape & motion */
  --lg-r-panel: 28px; --lg-r-tile: 22px; --lg-r-bar: 32px; --lg-r-pill: 999px;
  --lg-spring: cubic-bezier(.3, 1.45, .45, 1);     /* slight overshoot */
  --lg-spring-out: cubic-bezier(.3, 1.6, .45, 1);  /* release after a press */
  --lg-ease: cubic-bezier(.22, 1, .36, 1);

  --lg-font: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", Inter, "Segoe UI", Roboto, system-ui, sans-serif;
  color-scheme: light;
}

/* ── 1b. Tokens: dark (smoked glass) ────────────────────────────── */
[data-theme="dark"] {
  --lg-tile:  rgba(255, 255, 255, 0.055);
  --lg-bar:   rgba(28, 28, 32, 0.22);
  --lg-ctl:   rgba(255, 255, 255, 0.10);
  --lg-dense: rgba(34, 34, 38, 0.66);
  --lg-hover: rgba(255, 255, 255, 0.10);
  --lg-press: rgba(255, 255, 255, 0.14);
  --lg-selected: rgba(255, 255, 255, 0.92);
  --lg-frost: blur(9px) saturate(180%) brightness(0.94);
  --lg-frost-dense: blur(30px) saturate(170%);
  --lg-hi:   rgba(255, 255, 255, 0.55);
  --lg-hi2:  rgba(255, 255, 255, 0.26);
  --lg-line: rgba(255, 255, 255, 0.12);
  --lg-glow: rgba(255, 255, 255, 0.07);
  --lg-out:  rgba(0, 0, 0, 0.35);
  --lg-drop: 0 12px 32px -12px rgba(0, 0, 0, 0.7);
  --lg-drop-lift: 0 18px 40px -16px rgba(0, 0, 0, 0.8);
  --lg-wall: #06070B;
  --lg-wall-1: rgba(38, 92, 210, 0.38);
  --lg-wall-2: rgba(150, 58, 140, 0.30);
  --lg-wall-3: rgba(84, 70, 210, 0.30);
  --lg-wall-4: rgba(18, 128, 116, 0.26);
  --lg-text:   #F5F5F7;
  --lg-text-2: rgba(245, 245, 247, 0.68);
  --lg-text-3: rgba(245, 245, 247, 0.45);
  --lg-hairline: rgba(255, 255, 255, 0.10);
  --lg-well: rgba(118, 118, 128, 0.24);
  --lg-green: #30D158;  --lg-red: #FF453A;  --lg-blue: #0A84FF;
  --lg-orange: #FF9F0A; --lg-purple: #BF5AF2; --lg-teal: #40C8E0;
  color-scheme: dark;
}

/* the bevel — the whole look in one variable */
:root {
  --lg-bevel:
    inset 1.5px 1.5px 0 -0.5px var(--lg-hi),
    inset -1.5px -1.5px 0 -0.5px var(--lg-hi2),
    inset 0 0 0 1px var(--lg-line),
    inset 0 0 22px 0 var(--lg-glow),
    0 0 0 0.5px var(--lg-out);
  --lg-bevel-sm:
    inset 1px 1px 0 -0.25px var(--lg-hi),
    inset -1px -1px 0 -0.25px var(--lg-hi2),
    inset 0 0 0 1px var(--lg-line),
    inset 0 0 10px 0 var(--lg-glow),
    0 0 0 0.5px var(--lg-out);
}

/* ── 2. Base: type + wallpaper ──────────────────────────────────── */
.lg-root, body.lg-root {
  margin: 0; color: var(--lg-text); font-family: var(--lg-font); letter-spacing: -0.01em;
  -webkit-font-smoothing: antialiased; background: var(--lg-wall);
  -webkit-tap-highlight-color: transparent;
}
/* the colour field the glass bends (fixed, behind everything) */
.lg-root::before {
  content: ''; position: fixed; inset: 0; z-index: -1; pointer-events: none;
  background:
    radial-gradient(55vmax 42vmax at 8% 0%,    var(--lg-wall-1), transparent 64%),
    radial-gradient(50vmax 40vmax at 100% 18%, var(--lg-wall-2), transparent 64%),
    radial-gradient(60vmax 48vmax at 70% 108%, var(--lg-wall-3), transparent 66%),
    radial-gradient(48vmax 42vmax at -6% 82%,  var(--lg-wall-4), transparent 66%);
}
.lg-text-2 { color: var(--lg-text-2); }
.lg-text-3 { color: var(--lg-text-3); }
.lg-label { font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--lg-text-3); }

/* ── 3. Materials ───────────────────────────────────────────────── */
/* Content tile: clear glass, NO live blur (over a static wallpaper a
   blur is invisible and only costs frames). Own GPU layer. */
.lg-tile {
  background: var(--lg-tile); border-radius: var(--lg-r-panel);
  box-shadow: var(--lg-bevel), var(--lg-drop);
  transform: translateZ(0);
}
/* Floating bar: real lens — live frost (+ edge refraction via JS). */
.lg-bar {
  background: var(--lg-bar); border-radius: var(--lg-r-bar);
  -webkit-backdrop-filter: var(--lg-frost); backdrop-filter: var(--lg-frost);
  box-shadow: var(--lg-bevel), var(--lg-drop);
  transform: translateZ(0);
}
html.lg-refract .lg-bar { backdrop-filter: var(--lg-frost) url(#lg-refract); }
/* Sheet / dialog over a dimmed page: denser, heavier frost. */
.lg-sheet {
  background: var(--lg-dense); border-radius: 32px;
  -webkit-backdrop-filter: var(--lg-frost-dense); backdrop-filter: var(--lg-frost-dense);
  box-shadow: var(--lg-bevel), 0 30px 70px -20px rgba(0, 0, 0, .45);
}
.lg-sheet.is-bottom { border-radius: 34px 34px 0 0; }
.lg-scrim { position: fixed; inset: 0; background: rgba(0, 0, 0, .32); }
/* Toast: dark clear glass in light mode, light in dark mode */
.lg-toast {
  display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px; border-radius: var(--lg-r-pill);
  background: rgba(28, 28, 30, .72); color: #F5F5F7; font-size: 13px; font-weight: 600;
  -webkit-backdrop-filter: var(--lg-frost); backdrop-filter: var(--lg-frost);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.2), 0 14px 36px -10px rgba(0,0,0,.45);
}
[data-theme="dark"] .lg-toast { background: rgba(242, 242, 247, .78); color: #0A0A0C; }
/* Nested surfaces inside a tile never get a second pane */
.lg-tile .lg-tile { background: transparent; box-shadow: none; }

/* ── 4. Controls ────────────────────────────────────────────────── */
.lg-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  padding: 11px 20px; border: 0; border-radius: var(--lg-r-pill);
  font: 600 15px/1 var(--lg-font); letter-spacing: -0.01em; color: var(--lg-text); cursor: pointer;
  background: var(--lg-ctl); box-shadow: var(--lg-bevel-sm), 0 2px 8px -4px rgba(0, 0, 0, .18);
  transition: transform .45s var(--lg-spring), background-color .25s ease, box-shadow .3s ease;
  user-select: none; -webkit-user-select: none;
}
/* primary / selected: white glass, dark label — never a black or blue slab */
.lg-btn.is-primary, .lg-btn[aria-pressed="true"], .lg-btn.is-selected {
  background: var(--lg-selected); color: #0A0A0C; font-weight: 700;
  background-image: linear-gradient(180deg, rgba(255,255,255,.6), rgba(255,255,255,0) 60%);
  box-shadow: inset 0 1px 0 #fff, inset -1px -1px 0 -.25px rgba(255,255,255,.6), 0 0 0 .5px rgba(0,0,0,.07), 0 6px 16px -8px rgba(0,0,0,.3);
}
/* meaning-coloured action (e.g. "Add expense"): tinted glass */
.lg-btn.is-tint { color: #fff; background: var(--lg-tint, var(--lg-red)); background-image: linear-gradient(180deg, rgba(255,255,255,.28), rgba(255,255,255,0) 52%); box-shadow: inset 0 1.5px 0 rgba(255,255,255,.55), 0 8px 20px -8px rgba(0,0,0,.35); }
.lg-btn:disabled { opacity: .45; cursor: not-allowed; }
/* circular icon button */
.lg-icon-btn {
  width: 40px; height: 40px; padding: 0; border: 0; border-radius: 50%; display: inline-grid; place-items: center;
  color: var(--lg-text); cursor: pointer; background: var(--lg-ctl);
  box-shadow: var(--lg-bevel-sm), 0 2px 8px -4px rgba(0, 0, 0, .18);
  transition: transform .45s var(--lg-spring), background-color .25s ease;
}
.lg-icon-btn svg { width: 20px; height: 20px; stroke: currentColor; stroke-width: 1.75; fill: none; stroke-linecap: round; stroke-linejoin: round; }
/* segmented control: recessed track, raised white pill on the choice */
.lg-segmented { display: inline-flex; gap: 2px; padding: 3px; border-radius: var(--lg-r-pill); background: var(--lg-well); box-shadow: inset 0 1px 2px rgba(0,0,0,.06); }
.lg-segmented > button { border: 0; background: transparent; padding: 7px 14px; border-radius: var(--lg-r-pill); font: 600 13px var(--lg-font); color: var(--lg-text-2); cursor: pointer; transition: background-color .25s ease, color .2s ease; }
.lg-segmented > button[aria-pressed="true"], .lg-segmented > button.is-selected { background: var(--lg-selected); color: #0A0A0C; box-shadow: inset 0 1px 0 #fff, 0 3px 10px -4px rgba(0,0,0,.22); }
/* field: soft recessed well; an inline field inside a tile gets no well */
.lg-field {
  width: 100%; box-sizing: border-box; padding: 12px 14px; border-radius: 14px; border: 1px solid var(--lg-hairline);
  background: rgba(255, 255, 255, .55); color: var(--lg-text); font: 15px var(--lg-font);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, .06); outline: none;
  transition: border-color .2s ease, box-shadow .25s ease;
}
[data-theme="dark"] .lg-field { background: rgba(118, 118, 128, .18); box-shadow: inset 0 1px 2px rgba(0, 0, 0, .35); }
.lg-field:focus { border-color: rgba(60, 60, 67, .3); box-shadow: 0 0 0 3px rgba(120, 120, 128, .16); }
.lg-field.is-inline { border: 0; background: transparent; box-shadow: none; padding-inline: 0; }
/* switch (Apple green) */
.lg-switch { position: relative; width: 51px; height: 31px; border: 0; border-radius: 99px; background: rgba(120,120,128,.22); cursor: pointer; transition: background-color .25s ease; }
.lg-switch::after { content: ''; position: absolute; top: 2px; left: 2px; width: 27px; height: 27px; border-radius: 50%; background: #fff; box-shadow: 0 3px 8px rgba(0,0,0,.15), 0 3px 1px rgba(0,0,0,.06); transition: transform .35s var(--lg-ease); }
.lg-switch[aria-checked="true"] { background: #34C759; }
.lg-switch[aria-checked="true"]::after { transform: translateX(20px); }
/* chip / badge: tinted capsule */
.lg-chip { display: inline-flex; align-items: center; gap: 5px; padding: 5px 11px; border-radius: var(--lg-r-pill); font: 600 12px var(--lg-font); background: var(--lg-ctl); box-shadow: var(--lg-bevel-sm); color: var(--lg-text); }
.lg-chip.is-green { color: var(--lg-green); background: rgba(52, 199, 89, .14); box-shadow: none; }
.lg-chip.is-red { color: var(--lg-red); background: rgba(255, 59, 48, .12); box-shadow: none; }
/* small app-icon tile (pastel tint + coloured glyph) */
.lg-icon-tile { width: 44px; height: 44px; border-radius: 14px; display: inline-grid; place-items: center; background: color-mix(in srgb, var(--lg-tint, var(--lg-blue)) 14%, transparent); color: var(--lg-tint, var(--lg-blue)); box-shadow: inset 0 1px 0 rgba(255,255,255,.6), inset 0 0 0 .5px rgba(255,255,255,.4); transition: transform .5s var(--lg-spring); }

/* ── 5. Floating bars: dock, header, sidebar ────────────────────── */
.lg-dock {
  position: fixed; left: 16px; right: 16px; bottom: calc(12px + env(safe-area-inset-bottom, 0px)); z-index: 50;
  height: 64px; padding: 6px; display: flex; align-items: center; gap: 2px; isolation: isolate;
  max-width: 560px; margin-inline: auto;
}
.lg-dock > .lg-dock-tab {
  position: relative; z-index: 1; flex: 1; height: 52px; border: 0; background: transparent; border-radius: var(--lg-r-pill);
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px;
  font: 500 10px var(--lg-font); color: var(--lg-text-2); cursor: pointer;
}
.lg-dock > .lg-dock-tab.is-active { color: var(--lg-text); font-weight: 700; }
.lg-dock > .lg-dock-tab.is-active svg { transform: translateY(-1px) scale(1.08); }
.lg-dock svg { width: 20px; height: 20px; stroke: currentColor; stroke-width: 1.8; fill: none; stroke-linecap: round; stroke-linejoin: round; transition: transform .35s var(--lg-ease); }
/* the sliding lens behind the active tab (moved by liquid-glass.js) */
.lg-dock-pill {
  position: absolute; left: 0; top: 0; z-index: 0; border-radius: var(--lg-r-pill); pointer-events: none; opacity: 0;
  background: rgba(255, 255, 255, .5); box-shadow: var(--lg-bevel-sm), 0 4px 12px -6px rgba(0, 0, 0, .25); will-change: transform;
}
[data-theme="dark"] .lg-dock-pill { background: rgba(255, 255, 255, .14); }
.lg-dock-pill.is-ready { transition: transform .45s cubic-bezier(.3, 1.3, .5, 1), width .3s ease, opacity .25s ease; }
/* the dock's primary action: a solid white glass orb */
.lg-dock-action {
  position: relative; z-index: 1; width: 52px; height: 52px; flex: 0 0 auto; border: 0; border-radius: 50%; display: grid; place-items: center; cursor: pointer; color: #0A0A0C;
  background: linear-gradient(180deg, rgba(255,255,255,.96), rgba(255,255,255,.8));
  box-shadow: inset 0 1.5px 0 #fff, 0 0 0 .5px rgba(0,0,0,.08), 0 8px 20px -8px rgba(0,0,0,.35);
}
/* a page header floating over its scrolling body (see liquid-glass.js) */
.lg-float-root { position: relative; }
.lg-float-root > .lg-header { position: absolute; top: 0; left: 0; right: 0; z-index: 30; margin: 8px 10px 0; border-radius: 26px; }
.lg-float-root > .lg-under { padding-top: calc(var(--lg-hdr-h, 76px) + 12px); scroll-padding-top: calc(var(--lg-hdr-h, 76px) + 12px); }
/* desktop sidebar: a clear pane inset from the window */
.lg-sidebar { margin: 10px 0 10px 10px; height: calc(100% - 20px); border-radius: 26px; background: var(--lg-tile); box-shadow: var(--lg-bevel), var(--lg-drop); }
.lg-nav-item { display: flex; align-items: center; gap: 11px; width: 100%; padding: 8px 10px; border: 0; border-radius: 12px; background: transparent; font: 600 13.5px var(--lg-font); color: var(--lg-text-2); cursor: pointer; text-align: left; }
.lg-nav-item:hover { background: var(--lg-well); color: var(--lg-text); }
.lg-nav-item.is-active { background: rgba(255,255,255,.5); color: var(--lg-text); box-shadow: var(--lg-bevel-sm); }
[data-theme="dark"] .lg-nav-item.is-active { background: rgba(255,255,255,.12); }

/* ── 6. Motion: hover lift, press sink, release spring ──────────── */
.lg-pressable { position: relative; transition: transform .5s var(--lg-spring), box-shadow .35s ease, background-color .3s ease; will-change: transform; }
/* a soft light that sweeps across the glass on hover */
.lg-pressable.lg-tile::after { content: ''; position: absolute; inset: 0; border-radius: inherit; pointer-events: none; opacity: 0; transition: opacity .35s ease;
  background: radial-gradient(120% 140% at 0% 0%, rgba(255,255,255,.55), rgba(255,255,255,0) 55%); }
[data-theme="dark"] .lg-pressable.lg-tile::after { background: radial-gradient(120% 140% at 0% 0%, rgba(255,255,255,.14), rgba(255,255,255,0) 55%); }
@media (hover: hover) and (pointer: fine) {
  .lg-pressable:hover, .lg-btn:hover, .lg-icon-btn:hover { transform: translate3d(0, -2px, 0) scale(1.025); }
  .lg-pressable.lg-tile:hover { background: var(--lg-hover); box-shadow: var(--lg-bevel), var(--lg-drop-lift); }
  .lg-pressable.lg-tile:hover::after { opacity: 1; }
  .lg-pressable:hover .lg-icon-tile { transform: scale(1.1) rotate(-3deg); }
}
.lg-pressable:active, .lg-btn:active, .lg-icon-btn:active { transform: scale(.96); transition-duration: .14s; }
/* touch (liquid-glass.js adds these): sink on touch, spring back on lift */
.lg-press { transform: scale(.95) !important; filter: brightness(1.04); transition: transform .12s cubic-bezier(.2, .8, .3, 1), filter .12s ease !important; }
.lg-tile.lg-press { background: var(--lg-press); }
.lg-press .lg-icon-tile { transform: scale(.9); }
.lg-dock .lg-press { transform: scale(.88) !important; }
.lg-release { transition: transform .5s var(--lg-spring-out), filter .3s ease, background-color .3s ease !important; }

/* ── 7. Scrollbars: none drawn (everything still scrolls) ───────── */
.lg-root, .lg-root * { scrollbar-width: none; }
.lg-root ::-webkit-scrollbar, .lg-root::-webkit-scrollbar { width: 0; height: 0; display: none; }

/* ── 8. Performance guards ──────────────────────────────────────── */
@media (pointer: coarse) {
  :root { --lg-frost: blur(9px) saturate(180%) brightness(1.05); --lg-frost-dense: blur(18px) saturate(170%); }
  [data-theme="dark"] { --lg-frost: blur(9px) saturate(170%) brightness(.94); }
}
@media (pointer: coarse) and (max-resolution: 1.5dppx) {   /* low-end phones: no refraction, denser bars */
  html.lg-refract .lg-bar { backdrop-filter: var(--lg-frost); }
  :root { --lg-bar: rgba(250, 250, 252, .9); } [data-theme="dark"] { --lg-bar: rgba(30, 30, 34, .92); }
}

/* ── 9. Accessibility ───────────────────────────────────────────── */
@media (prefers-reduced-transparency: reduce) {
  :root { --lg-tile: #FFFFFF; --lg-bar: #F2F2F7; --lg-ctl: #E5E5EA; --lg-dense: #F2F2F7; }
  [data-theme="dark"] { --lg-tile: #1C1C1E; --lg-bar: #1C1C1E; --lg-ctl: #2C2C2E; --lg-dense: #1C1C1E; }
  .lg-bar, .lg-sheet, .lg-toast { -webkit-backdrop-filter: none !important; backdrop-filter: none !important; }
  .lg-root::before { display: none; }
}
@media (prefers-contrast: more) {
  :root { --lg-tile: rgba(255,255,255,.85); --lg-bar: rgba(255,255,255,.88); --lg-out: rgba(0,0,0,.35); --lg-text-2: rgba(10,10,12,.8); }
  [data-theme="dark"] { --lg-tile: rgba(28,28,30,.9); --lg-bar: rgba(28,28,30,.92); --lg-out: rgba(255,255,255,.4); --lg-text-2: rgba(245,245,247,.85); }
}
@media (prefers-reduced-motion: reduce) {
  .lg-pressable, .lg-btn, .lg-icon-btn, .lg-dock-pill.is-ready, .lg-icon-tile { transition: background-color .2s ease, box-shadow .2s ease, opacity .2s ease !important; }
  .lg-pressable:hover, .lg-pressable:active, .lg-btn:hover, .lg-btn:active, .lg-icon-btn:hover, .lg-icon-btn:active { transform: none !important; }
}
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  :root { --lg-bar: rgba(255,255,255,.9); } [data-theme="dark"] { --lg-bar: rgba(28,28,30,.92); }
}
:focus-visible { outline: 2.5px solid rgba(120, 120, 128, .55); outline-offset: 2px; }
```

---

## 12. `liquid-glass.js` (complete)

```js
/* ══════════════════════════════════════════════════════════════════
   LIQUID GLASS KIT — behaviour (vanilla JS, no dependencies)
   Pairs with liquid-glass.css.

     import { LiquidGlass } from './liquid-glass.js'
     LiquidGlass.init()                 // everything below, once

   or one by one:
     LiquidGlass.lens()                 // SVG edge-refraction filter + html.lg-refract (Chromium)
     LiquidGlass.press()                // touch: sink on touch, spring back on lift
     LiquidGlass.floatHeaders()         // .lg-header floats over its scrolling body
     LiquidGlass.dockPill(dockEl)       // the glass pill under .lg-dock-tab.is-active
     LiquidGlass.theme.set('light' | 'dark' | 'system')

   Works with any framework: call init() once after the app mounts.
   Everything is idempotent and safe to call again.
══════════════════════════════════════════════════════════════════ */

const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

/* ── Theme: light by default; only an explicit choice changes it ── */
const THEME_KEY = 'lg-theme';             // 'light' | 'dark' | 'system'
const theme = {
  get() {
    try { const v = localStorage.getItem(THEME_KEY); if (v === 'light' || v === 'dark' || v === 'system') return v; } catch { /* storage off */ }
    return 'light';
  },
  resolve(pref = theme.get()) {
    if (pref === 'dark') return 'dark';
    if (pref === 'system') return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    return 'light';
  },
  apply(pref = theme.get()) {
    const t = theme.resolve(pref);
    document.documentElement.setAttribute('data-theme', t);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', t === 'dark' ? '#06070B' : '#EEF0F6');
    return t;
  },
  set(pref) {
    try { localStorage.setItem(THEME_KEY, pref); } catch { /* storage off */ }
    return theme.apply(pref);
  },
  /** Put this (minified) in <head> to set the theme before first paint:
      <script>try{var p=localStorage.getItem('lg-theme');var d=p==='dark'||(p==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.setAttribute('data-theme',d?'dark':'light')}catch(e){}</script> */
};

/* ── Edge refraction (Chromium): bend the backdrop at the rim ─────
   An SVG displacement map — neutral grey in the middle, ramps at the
   edges — used by backdrop-filter on .lg-bar. Safari/WebKit ignore it
   and keep the frosted blur. */
function lens() {
  if (!isBrowser || document.getElementById('lg-refract')) return;
  const map = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'>"
    + "<defs><linearGradient id='x' x1='0' x2='1'><stop offset='0' stop-color='#f00'/><stop offset='1' stop-color='#000'/></linearGradient>"
    + "<linearGradient id='y' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#0f0'/><stop offset='1' stop-color='#000'/></linearGradient>"
    + "<filter id='s'><feGaussianBlur stdDeviation='3.5'/></filter></defs>"
    + "<rect width='100' height='100' fill='url(#x)'/><rect width='100' height='100' fill='url(#y)' style='mix-blend-mode:screen'/>"
    + "<rect x='9' y='9' width='82' height='82' rx='16' fill='rgb(128,128,0)' filter='url(#s)'/></svg>";
  const wrap = document.createElement('div');
  wrap.setAttribute('aria-hidden', 'true');
  wrap.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
  wrap.innerHTML = `<svg width="0" height="0"><filter id="lg-refract" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
    <feImage href="data:image/svg+xml,${encodeURIComponent(map)}" preserveAspectRatio="none" result="map"/>
    <feDisplacementMap in="SourceGraphic" in2="map" scale="38" xChannelSelector="R" yChannelSelector="G"/></filter></svg>`;
  document.body.appendChild(wrap);
  const brands = navigator.userAgentData?.brands || [];
  const chromium = brands.some((b) => /Chromium|Google Chrome|Microsoft Edge/.test(b.brand));
  const reduce = window.matchMedia?.('(prefers-reduced-transparency: reduce)').matches;
  if (chromium && !reduce) document.documentElement.classList.add('lg-refract');
}

/* ── Touch press: a finger has no hover, and a quick tap ends before
   :active shows. The control sinks the moment the finger lands, stays
   down while held (≥ MIN_DOWN), springs back with an overshoot on lift.
   Elements matching NAV wait NAV_DELAY ms before their click runs, so
   the spring is seen before the page changes (the replayed click has
   event.lgReplay = true — skip it in tap-sound / analytics handlers). */
const PRESSABLE = 'button, a[href], [role="button"], .lg-pressable, .lg-btn, .lg-icon-btn, .lg-dock-tab, .lg-dock-action, .lg-nav-item';
const NAV = '[data-lg-nav]';
const MIN_DOWN = 110;
const NAV_DELAY = 130;
let pressWired = false;
function press() {
  if (!isBrowser || pressWired) return;
  pressWired = true;
  document.addEventListener('touchstart', () => {}, { passive: true });   // iOS: enables :active
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  let pressed = null, downAt = 0, lastTouch = 0;
  const release = () => {
    const el = pressed; if (!el) return; pressed = null;
    setTimeout(() => {
      el.classList.remove('lg-press'); el.classList.add('lg-release');
      setTimeout(() => el.classList.remove('lg-release'), 520);
    }, Math.max(0, MIN_DOWN - (performance.now() - downAt)));
  };
  document.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' || reduce) return;           // mouse: CSS hover + :active
    const el = e.target.closest?.(PRESSABLE);
    if (!el || el.disabled || el.getAttribute('aria-disabled') === 'true') return;
    pressed = el; downAt = lastTouch = performance.now();
    el.classList.remove('lg-release'); el.classList.add('lg-press');
  }, { passive: true, capture: true });
  for (const t of ['pointerup', 'pointercancel']) document.addEventListener(t, release, { passive: true, capture: true });
  document.addEventListener('scroll', release, { passive: true, capture: true });   // became a scroll
  document.addEventListener('click', (e) => {
    if (reduce || e.lgReplay || performance.now() - lastTouch > 800) return;
    const el = e.target.closest?.(NAV); if (!el) return;
    e.preventDefault(); e.stopPropagation();
    setTimeout(() => { const again = new MouseEvent('click', { bubbles: true, cancelable: true, view: window }); again.lgReplay = true; el.dispatchEvent(again); }, NAV_DELAY);
  }, true);
}

/* ── Floating headers: content scrolls UNDER the glass ────────────
   Markup: <section> <header class="lg-header lg-bar">…</header>
                     <div class="lg-scroll" style="overflow:auto">…</div> </section>
   The header is lifted over its scrolling sibling and the body is padded
   by the header's measured height (--lg-hdr-h). The scroll container is
   never changed, so code that reads scrollTop keeps working. */
let headersWired = false;
function floatHeaders(root = document.body) {
  if (!isBrowser || headersWired || typeof ResizeObserver === 'undefined') return;
  headersWired = true;
  const scrolls = (el) => el && /(auto|scroll)/.test(getComputedStyle(el).overflowY);
  const measure = (h) => {
    const mt = parseFloat(getComputedStyle(h).marginTop) || 0;
    h.parentElement?.style.setProperty('--lg-hdr-h', `${Math.round(h.offsetHeight + mt)}px`);
  };
  const ro = new ResizeObserver((es) => es.forEach((e) => measure(e.target)));
  const seen = new WeakSet();
  const scan = () => document.querySelectorAll('.lg-header').forEach((h) => {
    if (seen.has(h)) return; seen.add(h);
    const body = h.nextElementSibling;
    if (!h.parentElement || !scrolls(body)) return;               // not a header-over-scroller: leave it
    h.parentElement.classList.add('lg-float-root'); body.classList.add('lg-under');
    measure(h); ro.observe(h);
  });
  let queued = false;
  new MutationObserver(() => { if (!queued) { queued = true; queueMicrotask(() => { queued = false; scan(); }); } })
    .observe(root, { childList: true, subtree: true });
  scan();
}

/* ── Dock pill: the glass lens that slides under the active tab ─────
   Markup: <nav class="lg-dock lg-bar"><span class="lg-dock-pill"></span>
             <button class="lg-dock-tab is-active">…</button> … </nav>
   Call again (or let the observer do it) when .is-active moves. */
function dockPill(dock) {
  if (!isBrowser || !dock) return () => {};
  let pill = dock.querySelector('.lg-dock-pill');
  if (!pill) { pill = document.createElement('span'); pill.className = 'lg-dock-pill'; pill.setAttribute('aria-hidden', 'true'); dock.prepend(pill); }
  const place = () => {
    const tab = dock.querySelector('.lg-dock-tab.is-active');
    if (!tab) { pill.style.opacity = '0'; return; }
    pill.style.width = `${tab.offsetWidth}px`; pill.style.height = `${tab.offsetHeight}px`;
    pill.style.transform = `translate3d(${tab.offsetLeft}px, ${tab.offsetTop}px, 0)`;
    pill.style.opacity = '1';
  };
  place();
  requestAnimationFrame(() => pill.classList.add('is-ready'));     // first placement snaps, later ones glide
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(place) : null; ro?.observe(dock);
  const mo = new MutationObserver(place); mo.observe(dock, { subtree: true, attributes: true, attributeFilter: ['class'] });
  return () => { ro?.disconnect(); mo.disconnect(); };
}

function init({ root = document.body } = {}) {
  if (!isBrowser) return;
  theme.apply();
  root.classList?.add('lg-root');
  lens(); press(); floatHeaders(root);
  document.querySelectorAll('.lg-dock').forEach((d) => dockPill(d));
}

export const LiquidGlass = { init, theme, lens, press, floatHeaders, dockPill };
if (isBrowser) window.LiquidGlass = LiquidGlass;      // also usable from a plain <script type="module">
```

---

## 13. Reference demo

`demo.html` in the same folder uses every class above (floating header over a scrolling list, tiles, buttons, segmented control, field, switch, chips, icon tiles, dock with sliding pill and white orb, bottom sheet, toast, Light / Dark / Auto). Open it through any static server (`npx vite .` or `npx serve .`) — ES modules do not load from `file://`.

Source: built in the Expense Tracker project (versions 4.0–4.2.4, November 2026).
