#!/usr/bin/env node
/* =========================================================
   Builds the free theme kits in kits/ from this site's own
   styles. Every kit gets four files:
     <id>.css   drop-in stylesheet (tokens + components)
     <id>.csv   every token with its value and use
     <id>.md    the full spec, with a prompt at the top
     prompt.txt the prompt alone, to paste into an AI tool
   plus kits/kits.json (the list the Studio page reads).

   All 27 universes share one class vocabulary (t-card,
   t-btn, t-input …), so a project can switch universes by
   swapping one stylesheet. Monolith Gloss and Liquid Glass
   are hand-made kits copied from kits/_src.

   Run:  node tools/build-kits.mjs
   ========================================================= */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, copyFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'kits');
const css = readFileSync(join(ROOT, 'style.css'), 'utf8');
const SITE = 'https://thrishankkuntimaddi.github.io';

/* ---------------- Fonts ---------------- */
const GF = {
  Fraunces: 'family=Fraunces:ital,opsz,wght@0,9..144,400..800;1,9..144,400..700',
  Inter: 'family=Inter:wght@400;500;600;700;800',
  'Space Mono': 'family=Space+Mono:wght@400;700',
  Caveat: 'family=Caveat:wght@500;700',
  VT323: 'family=VT323',
  'Press Start 2P': 'family=Press+Start+2P',
  // the design engine's families (design.css)
  Unbounded: 'family=Unbounded:wght@400;600;700', Sora: 'family=Sora:wght@300;400;600', 'Space Grotesk': 'family=Space+Grotesk:wght@400;500;700',
  'JetBrains Mono': 'family=JetBrains+Mono:wght@400;700', Syne: 'family=Syne:wght@700', 'IBM Plex Mono': 'family=IBM+Plex+Mono:wght@400;600',
  'Archivo Black': 'family=Archivo+Black', 'Bricolage Grotesque': 'family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,700;12..96,800',
  Figtree: 'family=Figtree:wght@300;400;600', Newsreader: 'family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400',
  'Bebas Neue': 'family=Bebas+Neue', 'DM Sans': 'family=DM+Sans:wght@400;500;700', 'DM Mono': 'family=DM+Mono:wght@400;500',
  'Playfair Display': 'family=Playfair+Display:ital,wght@0,600;1,600', 'Cormorant Garamond': 'family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500',
  'Instrument Sans': 'family=Instrument+Sans:wght@400;500;600', 'Instrument Serif': 'family=Instrument+Serif:ital@0;1',
};
const famOf = (stack) => (stack.match(/"([^"]+)"/) || [])[1];
const fontsURL = (stacks) => {
  const fams = [...new Set(stacks.map(famOf).filter((f) => GF[f]))];
  return fams.length ? `https://fonts.googleapis.com/css2?${fams.map((f) => GF[f]).join('&')}&display=swap` : '';
};

/* ---------------- The 22 dark universes: tokens straight from style.css ---------------- */
function tokensOf(id) {
  const m = css.match(new RegExp(`^\\[data-world="${id}"\\] \\{ (--paper[^\\n]*?) \\}$`, 'm'));
  if (!m) throw new Error(`No tokens for ${id}`);
  const t = {};
  m[1].split(/;\s*(?=--)/).forEach((d) => {
    const i = d.indexOf(':');
    t[d.slice(0, i).trim().slice(2)] = d.slice(i + 1).trim().replace(/;$/, '');
  });
  return t;
}

/* ---------------- The design engine's recipes (design.css) ----------------
   Each designed universe is a block of tokens in design.css. The kit takes the same
   fonts, card surface, border, shadow, radii, title style and buttons, with the
   site's token names mapped onto the kit's --t-* names. */
const design = readFileSync(join(ROOT, 'design.css'), 'utf8');
const VMAP = { paper: 'bg', 'pg-paper': 'bg', ink: 'ink', 'pg-ink': 'ink', muted: 'muted', faint: 'faint', line: 'line', 'pg-line': 'line',
  'line-2': 'line-2', 'pg-line-2': 'line-2', tint: 'tint', accent: 'accent', 'accent-2': 'accent-2', 'accent-3': 'accent-3', surface: 'surface',
  display: 'display', sans: 'sans', mono: 'mono', 'on-accent': 'on-accent', r: 'r', 'r-sm': 'r-sm' };
const kitVar = (v) => v && v.replace(/var\(--([a-z0-9-]+)/g, (_, n) => `var(--t-${VMAP[n] || n}`);
function recipeOf(id) {
  const m = design.match(new RegExp(`^\\[data-world="${id}"\\] \\{([\\s\\S]*?)^\\}`, 'm'));
  if (!m) return null;
  const r = {};
  m[1].replace(/\/\*[\s\S]*?\*\//g, '').split(/;(?![^(]*\))/).forEach((d) => {
    const i = d.indexOf(':'); if (i < 0) return;
    const k = d.slice(0, i).trim(); if (!k.startsWith('--')) return;
    r[k.slice(2)] = d.slice(i + 1).trim().replace(/\s*!important$/, '');
  });
  return r;
}

/* ---------------- Universe definitions ---------------- */
// Shared light-paper defaults (the site's :root and Paper universe).
const PAPER = {
  display: '"Fraunces", Georgia, serif', sans: '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif', mono: '"Space Mono", ui-monospace, Menlo, monospace', hand: '"Caveat", cursive',
  ink: '#2c3046', muted: '#646a85', faint: '#9096ad', line: 'rgba(44, 48, 70, .14)', 'line-2': 'rgba(44, 48, 70, .26)', card: 'rgba(255, 255, 255, .86)', r: '20px', 'r-sm': '12px',
};
const EDITIONS = {
  morning: { paper: '#fbf8f2', tint: '#ffe9df', accent: '#ff8a65', 'accent-2': '#6bb6ff', 'accent-3': '#ffd166' },
  noon: { paper: '#f6fafe', tint: '#dff0ff', accent: '#5aa9ff', 'accent-2': '#ff9b85', 'accent-3': '#7fe0c3' },
  dusk: { paper: '#fbf7fd', tint: '#efe3ff', accent: '#a78bfa', 'accent-2': '#ff8fb8', 'accent-3': '#ffcf8a' },
  night: { paper: '#f5fbf9', tint: '#dbf5ec', accent: '#4fd1b0', 'accent-2': '#8fa8ff', 'accent-3': '#ffc2d6' },
};

/* Each universe: name, mood (one line), voice (sample copy), rules (do / don't),
   the signature CSS that makes it itself, and light/dark. */
const U = {
  paper: { name: 'Paper', light: true, mood: 'Soft pastel paper with ink, offset colour shadows and a touch of hand-written charm.', voice: ['I design and build interfaces', 'people enjoy using.'],
    tokens: {}, shadow: '7px 7px 0 var(--t-shadow)', bg: 'radial-gradient(color-mix(in srgb, var(--t-ink) 12%, transparent) 1px, transparent 1.4px) 0 0 / 26px 26px, var(--t-bg)',
    rules: ['Light and pastel only; ink is soft slate, never pure black.', 'Cards get a solid offset shadow in the accent colour, not a blur.', 'Display type is Fraunces with italic emphasis; small labels are Space Mono uppercase.', 'One hand-written accent (Caveat) per screen at most: a note, a sticker, a scribble.', 'Colour editions: morning, noon, dusk, night. Pick one by local time or let the user choose.'],
    sig: `.t-card { transform: rotate(var(--t-tilt, 0deg)); }
.t-card:nth-child(3n+1) { --t-tilt: -.4deg; } .t-card:nth-child(3n+2) { --t-tilt: .3deg; }
.t-note { font-family: var(--t-hand); font-size: 1.6em; color: var(--t-accent-deep); line-height: 1; }
.t-sticker { display: inline-block; padding: 4px 10px; background: var(--t-accent-3); border: 1.5px solid var(--t-line-2); border-radius: 6px; transform: rotate(-3deg); font-family: var(--t-mono); font-size: 11px; text-transform: uppercase; letter-spacing: .08em; }` },
  pixel: { name: 'Pixel', light: true, mood: '8-bit arcade: square corners, thick ink borders, hard drop shadows and pixel fonts.', voice: ['I build interfaces', 'worth pressing START for.'],
    tokens: { display: '"Press Start 2P", monospace', sans: '"VT323", monospace', mono: '"VT323", monospace', hand: '"VT323", monospace', r: '0px', 'r-sm': '0px', 'base-size': '20px', 'base-lh': '1.3' },
    shadow: '7px 7px 0 var(--t-ink)', border: '3px solid var(--t-ink)', bg: 'linear-gradient(color-mix(in srgb, var(--t-ink) 7%, transparent) 1px, transparent 1px) 0 0 / 8px 8px, linear-gradient(90deg, color-mix(in srgb, var(--t-ink) 7%, transparent) 1px, transparent 1px) 0 0 / 8px 8px, var(--t-bg)',
    rules: ['Zero border radius everywhere.', 'Borders are 3px solid ink; shadows are hard 4–7px offsets in ink, never blurred.', 'Headings in Press Start 2P at small sizes (13–30px) with generous line-height (1.5–1.7).', 'Body text in VT323 at 20px; it is a pixel font, so go bigger than usual.', 'Images: image-rendering: pixelated.'],
    sig: `.t-btn { font-family: var(--t-display); font-size: 10px; box-shadow: 4px 4px 0 var(--t-ink); }
.t-btn:active { transform: translate(4px, 4px); box-shadow: none; }
.t-title, .t-h2 { letter-spacing: 0; line-height: 1.6; font-weight: 400; }
.t-title { font-size: clamp(17px, 2.2vw, 30px); } .t-h2 { font-size: clamp(14px, 1.8vw, 22px); }
img { image-rendering: pixelated; }` },
  sketch: { name: 'Sketch', light: true, mood: 'A pencil sketchbook: hand-lettered headings, wobbly lines and hatching.', voice: ['I sketch interfaces,', 'then build every line.'],
    tokens: { display: '"Caveat", cursive' },
    shadow: '4px 5px 0 var(--t-line-2)', bg: 'repeating-linear-gradient(-38deg, transparent 0 13px, color-mix(in srgb, var(--t-ink) 6%, transparent) 13px 14px), var(--t-bg)',
    rules: ['Headings in Caveat 700, large (44–78px), tight line-height.', 'Borders look hand-drawn: uneven border-radius on every box.', 'Shadows are pencil-grey offsets, never coloured blurs.', 'Background has faint diagonal hatching.', 'Keep body text in Inter for readability; only display type is hand-written.'],
    sig: `.t-card, .t-btn, .t-input, .t-window { border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px; }
.t-card { border-width: 2px; }
.t-title { font-size: clamp(42px, 5.4vw, 78px); line-height: .98; font-weight: 700; letter-spacing: 0; }
.t-h2 { font-size: clamp(36px, 4.6vw, 60px); font-weight: 700; }
.t-underline { background: linear-gradient(transparent 62%, var(--t-accent-3) 62% 88%, transparent 88%); }` },
  blueprint: { name: 'Blueprint', light: true, mood: 'Engineering drawings: navy ink, dashed outlines, grid paper and monospaced labels.', voice: ['I engineer interfaces', 'to spec, then make them human.'],
    tokens: { display: '"Space Mono", monospace', ink: '#27437e', muted: '#4c6497', faint: '#7e93bd', line: 'rgba(39, 67, 126, .18)', 'line-2': 'rgba(39, 67, 126, .4)', card: 'rgba(255, 255, 255, .5)', r: '3px', 'r-sm': '2px' },
    shadow: 'none', border: '1.5px dashed var(--t-ink)', bg: 'linear-gradient(var(--t-line) 1px, transparent 1px) 0 0 / 120px 120px, linear-gradient(90deg, var(--t-line) 1px, transparent 1px) 0 0 / 120px 120px, linear-gradient(color-mix(in srgb, var(--t-ink) 7%, transparent) 1px, transparent 1px) 0 0 / 24px 24px, linear-gradient(90deg, color-mix(in srgb, var(--t-ink) 7%, transparent) 1px, transparent 1px) 0 0 / 24px 24px, var(--t-bg)',
    rules: ['Every box has a dashed ink border plus a thin outline 6px outside it, like a dimension line.', 'Headings: Space Mono 700, UPPERCASE, tight letter-spacing; no italics.', 'Label things like figures: "Fig. 01", "Spec sheet".', 'No shadows. Accent colour only as translucent fills.', 'Grid paper background: 24px minor and 120px major lines.'],
    sig: `.t-card, .t-window { outline: 1px solid var(--t-line-2); outline-offset: 6px; }
.t-title, .t-h2 { text-transform: uppercase; letter-spacing: -.02em; font-style: normal; }
.t-title em, .t-h2 em { font-style: normal; }
.t-btn { text-transform: uppercase; font-family: var(--t-mono); font-size: 12.5px; letter-spacing: .06em; background: transparent; }
.t-btn--primary { background: color-mix(in srgb, var(--t-accent) 40%, transparent); }` },
  news: { name: 'Newsprint', light: true, mood: 'A broadsheet front page: serif type, double rules, drop caps and halftone dots.', voice: ['Developer builds interfaces', 'people actually enjoy using.'],
    tokens: { sans: 'Georgia, "Times New Roman", serif', r: '0px', 'r-sm': '0px', card: 'transparent' },
    shadow: 'none', bg: 'radial-gradient(color-mix(in srgb, var(--t-ink) 10%, transparent) 1px, transparent 1.5px) 0 0 / 11px 11px, var(--t-bg)',
    rules: ['No radius. Cards are columns ruled with a 4px double line on top and a 1px line below.', 'Headings: Fraunces 800, tight (-0.03em). Body: Georgia.', 'First paragraph gets a drop cap.', 'Primary button is solid ink with white uppercase mono text.', 'Images in greyscale.', 'Write headlines like a newspaper: "Developer ships…", "In other news".'],
    sig: `.t-card { border: 0; border-top: 4px double var(--t-ink); border-bottom: 1px solid var(--t-ink); padding-inline: 4px; background: transparent; }
.t-title, .t-h2 { font-weight: 800; letter-spacing: -.03em; }
.t-lede::first-letter { float: left; font-family: var(--t-display); font-weight: 800; font-size: 3.1em; line-height: .8; padding: 4px 8px 0 0; }
.t-btn { text-transform: uppercase; font-family: var(--t-mono); font-size: 12px; letter-spacing: .08em; background: #fff; }
.t-btn--primary { background: var(--t-ink); color: #fff; }
.t-masthead { padding: 6px 0; border-block: 3px double var(--t-ink); font-family: var(--t-mono); font-size: 11px; letter-spacing: .14em; text-transform: uppercase; }
img { filter: grayscale(1) contrast(1.1); }` },

  core: { name: 'The Core', mood: 'The centre of everything: a glowing particle network, golden light and glass panels.', voice: ['I build the inside', 'of interfaces people love.'],
    rules: ['Deep teal-black page with a golden radial light in the middle.', 'Panels are bright glass cards with a soft golden edge glow.', 'Accent gold for one call to action; cyan for secondary detail.'],
    sig: `.t-card { box-shadow: 0 0 0 1px color-mix(in srgb, var(--t-accent) 40%, transparent), 0 0 40px -8px color-mix(in srgb, var(--t-accent) 55%, transparent); }
.t-title em { color: var(--t-accent); text-shadow: 0 0 24px color-mix(in srgb, var(--t-accent) 70%, transparent); }` },
  space: { name: 'Deep space', mood: 'Night sky and stars, violet nebula light, calm and vast.', voice: ['I launch interfaces', 'into orbit.'],
    rules: ['Star field: tiny white dots at two sizes over near-black.', 'Violet accent glows; cyan for secondary.', 'Mission-control wording: "Mission log", "Open a channel".'],
    bgExtra: 'radial-gradient(1px 1px at 20% 30%, #fff, transparent), radial-gradient(1px 1px at 70% 60%, #fff, transparent), radial-gradient(1.5px 1.5px at 40% 80%, #fff, transparent), radial-gradient(1px 1px at 85% 15%, #fff, transparent)',
    sig: `.t-title em { color: var(--t-accent); }` },
  future: { name: 'Year 3000', mood: 'Synthwave future: neon magenta and cyan, a glowing grid horizon, monospaced type.', voice: ['Interfaces from the year 3000,', 'shipped today.'],
    rules: ['Neon outlines: 1px accent border plus an outer glow of the same colour.', 'Space Mono display type, 4px or square corners.', 'Grid floor in the background fading to the horizon.'],
    sig: `.t-card, .t-btn--primary { box-shadow: 0 0 0 1px var(--t-accent), 0 0 24px -4px var(--t-accent); }
.t-title { text-shadow: 0 0 18px color-mix(in srgb, var(--t-accent) 70%, transparent), 2px 0 0 var(--t-accent-2); }` },
  robots: { name: 'Robot republic', mood: 'A friendly machine terminal: mint phosphor, scanlines and VT323 type.', voice: ['Human-made interfaces,', 'robot-approved.'],
    rules: ['Terminal headings in VT323 with a blinking block cursor.', 'Subtle horizontal scanlines over the page.', 'Wording like commands: "Run program", "whoami".'],
    bgExtra: 'repeating-linear-gradient(0deg, rgba(255,255,255,.03) 0 1px, transparent 1px 3px)',
    sig: `.t-title::after { content: "▌"; margin-left: .1em; color: var(--t-accent); animation: t-blink 1s steps(1) infinite; }
@keyframes t-blink { 50% { opacity: 0; } }` },
  rage: { name: 'Rage', mood: 'Hot red, heavy type, everything at full volume (but still readable).', voice: ['I build interfaces', 'with ferocious care.'],
    rules: ['Display type 800 weight, slightly skewed.', 'Red glow on primary actions; a small shake on hover.', 'Short, loud headings. Body copy stays calm and readable.'],
    sig: `.t-title { font-weight: 800; transform: skewX(-6deg); text-shadow: 0 0 22px color-mix(in srgb, var(--t-accent) 70%, transparent); }
.t-btn--primary:hover { animation: t-shake .3s; }
@keyframes t-shake { 25% { translate: -2px 0; } 75% { translate: 2px 0; } }` },
  joy: { name: 'Pure joy', mood: 'Confetti and sunshine: round corners, bouncy motion, hand-written headings.', voice: ['I make interfaces', 'that make people smile.'],
    rules: ['Big radius (18–24px), springy hover (scale up a little).', 'Caveat headings, warm yellow and pink accents.', 'Confetti dots in the background.'],
    bgExtra: 'radial-gradient(4px 4px at 15% 20%, #ffd166, transparent), radial-gradient(4px 4px at 80% 30%, #ff5fa2, transparent), radial-gradient(4px 4px at 40% 70%, #4fd1b0, transparent), radial-gradient(4px 4px at 70% 85%, #6bb6ff, transparent)',
    sig: `.t-btn:hover, .t-card:hover { transform: translateY(-3px) scale(1.02); }
.t-title { font-size: clamp(48px, 6vw, 88px); line-height: .95; }` },
  sad: { name: 'The rain', mood: 'A rainy evening: soft blues, falling streaks, slow and gentle motion.', voice: ['I build interfaces', 'that hold you on rainy days.'],
    rules: ['Slow transitions (400–600ms), no bounce.', 'Thin diagonal rain streaks in the background.', 'Gentle wording; warm amber only for the one light in the dark.'],
    bgExtra: 'repeating-linear-gradient(100deg, transparent 0 22px, rgba(160,190,255,.07) 22px 23px)',
    sig: `.t-card, .t-btn { transition-duration: .55s; }` },
  retro: { name: 'Retro 1986', mood: 'Arcade sunset: hot pink to purple, chrome text, square pixels and neon.', voice: ['Radical interfaces,', 'totally tubular since ’86.'],
    rules: ['Square corners. Press Start 2P headings, VT323 labels.', 'Sunset gradient background with a striped sun.', 'Neon pink glow; cyan and yellow as highlights.'],
    sig: `.t-title { font-size: clamp(17px, 2.4vw, 32px); line-height: 1.6; background: linear-gradient(#fff 0 45%, var(--t-accent-3) 55%, var(--t-accent)); -webkit-background-clip: text; background-clip: text; color: transparent; }
.t-btn--primary { box-shadow: 0 0 18px var(--t-accent); }` },
  music: { name: 'The beat', mood: 'A dark stage with equalizer bars pulsing in violet and pink.', voice: ['I compose interfaces', 'that move in rhythm.'],
    rules: ['Music wording: "Tracklist", "B-sides", "Liner notes".', 'A row of equalizer bars as a decoration (animated, off for reduced motion).', 'Violet accent, pink secondary.'],
    sig: `.t-eq { display: inline-flex; gap: 3px; align-items: flex-end; height: 18px; }
.t-eq i { width: 4px; background: var(--t-accent); animation: t-eq .8s ease-in-out infinite alternate; }
.t-eq i:nth-child(2) { animation-delay: -.3s; } .t-eq i:nth-child(3) { animation-delay: -.6s; }
@keyframes t-eq { from { height: 20%; } to { height: 100%; } }` },
  paint: { name: 'Paint', mood: 'An artist’s studio at night: bold strokes, splatters and hand lettering.', voice: ['I paint interfaces', 'one bold stroke at a time.'],
    rules: ['Caveat headings with a brush-stroke underline.', 'Paint splatter blobs in the background in all three accents.', 'Rounded, slightly irregular corners.'],
    bgExtra: 'radial-gradient(120px 90px at 12% 18%, rgba(255,138,101,.18), transparent), radial-gradient(140px 100px at 88% 70%, rgba(107,182,255,.16), transparent), radial-gradient(90px 70px at 60% 30%, rgba(255,209,102,.14), transparent)',
    sig: `.t-title em { background: linear-gradient(transparent 60%, color-mix(in srgb, var(--t-accent) 70%, transparent) 60% 90%, transparent 90%); }` },
  box: { name: 'Box world', mood: 'Everything is a block: square corners and stacked isometric shadows.', voice: ['I build interfaces', 'block by perfect block.'],
    rules: ['Zero radius. Shadows are stacked 1px steps that read as a 3D box.', 'Space Mono headings; label things "Box 01".'],
    sig: `.t-card, .t-btn { box-shadow: 1px 1px 0 var(--t-accent), 2px 2px 0 var(--t-accent), 3px 3px 0 var(--t-accent), 4px 4px 0 var(--t-accent), 5px 5px 0 var(--t-accent), 6px 6px 0 var(--t-accent); }` },
  village: { name: 'The village', mood: 'A lantern-lit village at night: warm gold, crafted serif type, cosy.', voice: ['I craft interfaces', 'like a village craftsman.'],
    rules: ['Warm lantern gold accent; soft rounded corners.', 'Crafted, friendly wording: "The workshop", "Drop by for tea".'],
    sig: `.t-card { box-shadow: 0 10px 40px -12px color-mix(in srgb, var(--t-accent) 50%, transparent); }` },
  city: { name: 'Night city', mood: 'Downtown after dark: lit windows, sodium lights, clean sans type.', voice: ['I build interfaces', 'for a city that never sleeps.'],
    rules: ['Inter for everything, bold headings.', 'Lit-window pattern in the background.', 'Warm yellow accent, pink neon secondary.'],
    bgExtra: 'linear-gradient(90deg, rgba(255,210,122,.06) 0 6px, transparent 6px 22px) 0 60% / 22px 30px',
    sig: `.t-title { font-weight: 800; letter-spacing: -.03em; }` },
  sky: { name: 'Open sky', mood: 'Sunset over the clouds: peach, pink and violet, soft and airy.', voice: ['I design interfaces', 'light enough to float.'],
    rules: ['Big soft radius (24px) and floaty hover (lift 4px).', 'Sunset gradient page; cards like clouds.'],
    sig: `.t-card:hover { transform: translateY(-4px); }` },
  water: { name: 'The deep', mood: 'Under the sea: deep teal, rising bubbles, calm wave motion.', voice: ['I dive deep into interfaces', 'and surface with calm.'],
    rules: ['Rounded corners (16–22px). Slow, wave-like motion.', 'Bubble dots in the background.'],
    bgExtra: 'radial-gradient(6px 6px at 20% 80%, rgba(255,255,255,.12), transparent), radial-gradient(4px 4px at 60% 40%, rgba(255,255,255,.1), transparent), radial-gradient(8px 8px at 85% 70%, rgba(255,255,255,.08), transparent)',
    sig: `` },
  fire: { name: 'Fire', mood: 'The forge: embers rising from below, orange glow, tempered metal.', voice: ['I forge interfaces', 'in fire, tempered for years.'],
    rules: ['Orange glow from the bottom of the page.', 'Primary action glows like a hot ember.', 'Short edges (4–10px radius).'],
    sig: `.t-btn--primary { box-shadow: 0 0 0 1px var(--t-accent-3), 0 6px 30px -6px var(--t-accent); }
.t-title em { color: var(--t-accent-3); text-shadow: 0 0 20px var(--t-accent); }` },
  ice: { name: 'Ice', mood: 'Polished ice: crisp edges, frosted glass, cool blue light.', voice: ['Crystal-clear interfaces,', 'polished like ice.'],
    rules: ['Frosted glass cards (backdrop blur) with a bright top edge.', 'Crisp Inter type; cool cyan accent.'],
    sig: `.t-card { background: rgba(255,255,255,.82); backdrop-filter: blur(12px) saturate(140%); -webkit-backdrop-filter: blur(12px) saturate(140%); box-shadow: inset 0 1px 0 #fff, 0 10px 40px -12px color-mix(in srgb, var(--t-accent) 60%, transparent); }` },
  brick: { name: 'Brick world', mood: 'Toy bricks: studs, primary colours and chunky shapes.', voice: ['I build interfaces', 'brick by brick.'],
    rules: ['Chunky 6px radius, hard 4px shadows.', 'A row of studs on top of cards.', 'Yellow, red and blue; labels like "Set 01".'],
    sig: `.t-card { box-shadow: 0 6px 0 color-mix(in srgb, var(--t-accent) 70%, #000); }
.t-card::before { content: ""; position: absolute; left: 18px; right: 18px; top: -7px; height: 7px; background: radial-gradient(circle at 50% 100%, var(--t-accent) 6px, transparent 6.5px) 0 0 / 28px 7px; }` },
  racer: { name: 'Toy racer', mood: 'Race day: checkered flags, speed stripes and italic numbers.', voice: ['I build interfaces', 'at full speed.'],
    rules: ['Italic display type, speed stripes on primary buttons.', 'Checkered pattern accents.'],
    sig: `.t-title { font-style: italic; }
.t-btn--primary { background: repeating-linear-gradient(-60deg, var(--t-accent) 0 14px, color-mix(in srgb, var(--t-accent) 80%, #000) 14px 18px); color: #fff; }
.t-checker { height: 12px; background: conic-gradient(var(--t-ink) 25%, transparent 0 50%, var(--t-ink) 0 75%, transparent 0) 0 0 / 12px 12px; }` },
  noir: { name: 'Noir', mood: 'A 1940s detective film: black and white, venetian-blind light, serif type.', voice: ['Every interface has a story.', 'Mine end well.'],
    rules: ['Greyscale only. Georgia for everything.', 'Hard, long shadows; film grain.', 'Wording: "Case files", "The detective".'],
    bgExtra: 'repeating-linear-gradient(-20deg, rgba(255,255,255,.05) 0 18px, transparent 18px 46px)',
    sig: `.t-card { box-shadow: 14px 14px 0 rgba(0,0,0,.6); }
img { filter: grayscale(1) contrast(1.2); }` },
  glitch: { name: 'The glitch', mood: 'Corrupted signal: RGB split text, scanlines, flickers. Used sparingly.', voice: ['I build interf@ces', 'that never cr̷ash.'],
    rules: ['RGB-split text shadow on headings (pink left, cyan right).', 'Scanlines over the page.', 'Short flicker on hover only; respect reduced motion.'],
    sig: `.t-title { text-shadow: -2px 0 var(--t-accent-2), 2px 0 var(--t-accent); }
.t-card:hover { animation: t-flicker .25s steps(2) 2; }
@keyframes t-flicker { 50% { opacity: .82; translate: 2px 0; } }` },
  mars: { name: 'Planet fall', mood: 'Landing on Mars: rust dunes, a dusty horizon, mission typography.', voice: ['Interfaces built for new worlds', 'and the first footprints.'],
    rules: ['Space Mono display type; rust orange accent, sky blue secondary.', 'Horizon line across the background.', 'Mission wording: "Samples", "Base camp".'],
    sig: `` },
};
const LIGHT = ['paper', 'pixel', 'sketch', 'blueprint', 'news'];
const DARK = ['core', 'space', 'future', 'robots', 'rage', 'joy', 'sad', 'retro', 'music', 'paint', 'box', 'village', 'city', 'sky', 'water', 'fire', 'ice', 'brick', 'racer', 'noir', 'glitch', 'mars'];

/* ---------------- Token sets ---------------- */
function tokenSet(id) {
  const u = U[id];
  if (u.light) {
    const t = { ...PAPER, ...EDITIONS.morning, ...u.tokens };
    return {
      bg: t.paper, tint: t.tint, ink: t.ink, muted: t.muted, faint: t.faint, line: t.line, 'line-2': t['line-2'],
      surface: t.card === 'transparent' ? 'transparent' : t.card, 'surface-ink': t.ink, accent: t.accent, 'accent-2': t['accent-2'], 'accent-3': t['accent-3'],
      display: t.display, sans: t.sans, mono: t.mono, hand: t.hand, r: t.r, 'r-sm': t['r-sm'],
      'base-size': t['base-size'] || '16px', 'base-lh': t['base-lh'] || '1.6', 'page-bg': t.paper,
    };
  }
  const t = tokensOf(id), d = recipeOf(id) || {};
  return {
    bg: t.paper, tint: t.tint, ink: t.ink, muted: t.muted, faint: t.faint, line: t.line, 'line-2': t['line-2'],
    // designed universes keep their cards dark, in the universe's own ink
    surface: kitVar(d['c-bg']) || 'color-mix(in srgb, var(--t-bg) 86%, var(--t-ink) 8%)', 'surface-ink': t.ink,
    accent: t.accent, 'accent-2': t['accent-2'], 'accent-3': t['accent-3'],
    display: d.display || t.display, sans: d.sans || t.sans, mono: d.mono || t.mono, hand: t.hand,
    r: d['c-r'] || t.r, 'r-sm': d['b-r'] || t['r-sm'],
    'base-size': '16px', 'base-lh': '1.6', 'page-bg': t['world-bg'],
  };
}
const TOKEN_DOC = {
  bg: ['Theme_Surface', 'background-color', 'Page background colour'],
  'page-bg': ['Theme_Surface', 'background', 'Full page background (gradient / pattern)'],
  tint: ['Theme_Surface', 'background', 'Soft fill for hovers, chips and highlights'],
  ink: ['Typography', 'color', 'Main text on the page'],
  muted: ['Typography', 'color', 'Secondary text'],
  faint: ['Typography', 'color', 'Hints, captions, disabled'],
  line: ['Lines', 'border-color', 'Hairlines and dividers'],
  'line-2': ['Lines', 'border-color', 'Stronger borders on cards and controls'],
  surface: ['Component_Card', 'background', 'Cards, windows, dialogs'],
  'surface-ink': ['Component_Card', 'color', 'Text inside cards'],
  accent: ['Colour', 'color / background', 'Primary action, key highlights (one per view)'],
  'accent-2': ['Colour', 'color / background', 'Secondary highlight'],
  'accent-3': ['Colour', 'color / background', 'Third highlight: stickers, marks, selection'],
  'accent-deep': ['Colour', 'color', 'Accent mixed with ink; accent as readable text'],
  shadow: ['Elevation', 'box-shadow colour', 'Accent at 38%: offset shadows'],
  display: ['Typography', 'font-family', 'Headings'],
  sans: ['Typography', 'font-family', 'Body text'],
  mono: ['Typography', 'font-family', 'Labels, numbers, code'],
  hand: ['Typography', 'font-family', 'Hand-written notes'],
  r: ['Shape', 'border-radius', 'Cards and windows'],
  'r-sm': ['Shape', 'border-radius', 'Buttons, inputs, chips'],
  'base-size': ['Typography', 'font-size', 'Body size'],
  'base-lh': ['Typography', 'line-height', 'Body line height'],
};

/* ---------------- Stylesheet ---------------- */
function stylesheet(id) {
  const u = U[id], t = tokenSet(id), d = u.light ? {} : (recipeOf(id) || {});
  const shadow = kitVar(d['c-shadow']) || u.shadow || (u.light ? '7px 7px 0 var(--t-shadow)' : '0 18px 50px -18px rgba(0, 0, 0, .7)');
  const border = kitVar(d['c-border']) || u.border || '1.5px solid var(--t-line-2)';
  // title and buttons from the recipe (design.css); the template falls back to its defaults
  const extra = Object.entries({
    'title-w': d['t-w'], 'title-case': d['t-case'], 'title-track': d['t-track'], 'title-style': d['em-style'],
    'btn-r': d['b-r'], 'btn-bg': kitVar(d['b-bg']) || (Object.keys(d).length ? 'var(--t-accent)' : ''), 'btn-ink': kitVar(d['b-ink']) || (Object.keys(d).length ? '#0b0b0b' : ''),
    'btn-shadow': kitVar(d['b-shadow']), 'btn-case': d['b-case'], 'btn2-bg': kitVar(d['b2-bg']) || (Object.keys(d).length ? 'transparent' : ''),
    'btn2-ink': Object.keys(d).length ? 'var(--t-ink)' : '', 'btn2-border': kitVar(d['b2-border']) || (Object.keys(d).length ? '1px solid var(--t-line-2)' : ''),
    'chip-bg': Object.keys(d).length ? 'transparent' : '', 'chip-ink': Object.keys(d).length ? 'var(--t-ink)' : '',
    'input-bg': Object.keys(d).length ? 'color-mix(in srgb, var(--t-bg) 70%, var(--t-ink) 6%)' : '', 'input-ink': Object.keys(d).length ? 'var(--t-ink)' : '',
    'window-bg': Object.keys(d).length ? 'var(--t-surface)' : '',
  }).filter(([, v]) => v).map(([k, v]) => `  --t-${k}: ${v};`).join('\n');
  const pageBg = u.bg || (u.bgExtra ? `${u.bgExtra}, ${t['page-bg']}` : t['page-bg']);
  const fonts = fontsURL([t.display, t.sans, t.mono, t.hand]);
  const editions = u.light && !u.tokens.ink ? Object.entries(EDITIONS).map(([e, v]) => `[data-edition="${e}"] { --t-bg: ${v.paper}; --t-tint: ${v.tint}; --t-accent: ${v.accent}; --t-accent-2: ${v['accent-2']}; --t-accent-3: ${v['accent-3']}; }`).join('\n') : '';
  return `/* ==========================================================================
   ${u.name.toUpperCase()} THEME — from Thrishank Kuntimaddi's portfolio (${SITE})
   ${u.mood}
   Free to use in any project. Load after your own CSS:
     <link rel="stylesheet" href="${fonts || '(system fonts)'}">
     <link rel="stylesheet" href="${id}.css">
   Classes (same in all 27 universe kits, so you can swap the file):
     t-page t-wrap t-nav t-card t-window t-btn t-btn--primary t-btn--ghost
     t-input t-chip t-eyebrow t-title t-h2 t-lede t-muted t-dialog t-toast
   ========================================================================== */

:root {
${Object.entries(t).map(([k, v]) => `  --t-${k}: ${v};`).join('\n')}
  --t-accent-deep: color-mix(in oklab, var(--t-accent) 62%, var(--t-ink));
  --t-shadow: color-mix(in srgb, var(--t-accent) 38%, transparent);
  --t-card-shadow: ${shadow};
  --t-border: ${border};
  --t-ease: cubic-bezier(.2, .7, .2, 1);
  --t-spring: cubic-bezier(.34, 1.56, .64, 1);
  --t-wrap: 1160px;
${extra}
  color-scheme: ${u.light ? 'light' : 'dark'};
}
${editions ? `\n/* Colour editions: <html data-edition="morning|noon|dusk|night"> */\n${editions}\n` : ''}
/* ---------- Base ---------- */
.t-page, body.t-page {
  margin: 0; min-height: 100vh; background: ${pageBg}; background-attachment: fixed;
  color: var(--t-ink); font-family: var(--t-sans); font-size: var(--t-base-size); line-height: var(--t-base-lh);
  -webkit-font-smoothing: antialiased;
}
.t-page ::selection { background: var(--t-accent-3); color: #1b1d2a; }
.t-wrap { max-width: var(--t-wrap); margin: 0 auto; padding: 0 clamp(16px, 4vw, 40px); }
.t-page :focus-visible { outline: 3px solid var(--t-accent); outline-offset: 3px; }
.t-page a:not(.t-btn) { color: inherit; }

/* ---------- Type ---------- */
.t-eyebrow { font-family: var(--t-mono); font-size: 12px; letter-spacing: .1em; text-transform: uppercase; color: var(--t-muted); }
.t-title { margin: 0; font-family: var(--t-display); font-weight: var(--t-title-w, 600); text-transform: var(--t-title-case, none); font-size: clamp(38px, 5vw, 72px); line-height: 1.04; letter-spacing: var(--t-title-track, -.02em); }
.t-title em, .t-h2 em { font-style: var(--t-title-style, italic); color: var(--t-accent-deep); }
.t-h2 { margin: 0; font-family: var(--t-display); font-weight: var(--t-title-w, 600); text-transform: var(--t-title-case, none); font-size: clamp(28px, 3.6vw, 48px); line-height: 1.1; letter-spacing: var(--t-title-track, -.015em); }
.t-lede { font-size: 1.12em; color: var(--t-muted); max-width: 60ch; }
.t-muted { color: var(--t-muted); }

/* ---------- Surfaces ---------- */
.t-card {
  position: relative; background: var(--t-surface); color: var(--t-surface-ink);
  border: var(--t-border); border-radius: var(--t-r); box-shadow: var(--t-card-shadow);
  padding: clamp(20px, 3vw, 32px); transition: transform .35s var(--t-ease), box-shadow .35s var(--t-ease);
}
.t-card .t-muted, .t-card .t-lede { color: color-mix(in srgb, var(--t-surface-ink) 70%, transparent); }
.t-window { overflow: hidden; background: var(--t-window-bg, #fff); color: var(--t-surface-ink); border: var(--t-border); border-radius: var(--t-r); box-shadow: var(--t-card-shadow); }
.t-window-bar { display: flex; gap: 6px; align-items: center; padding: 10px 14px; border-bottom: 1px solid var(--t-line-2); font-family: var(--t-mono); font-size: 12px; }
.t-window-bar i { width: 10px; height: 10px; border-radius: 50%; background: var(--t-accent); } .t-window-bar i + i { background: var(--t-accent-3); } .t-window-bar i + i + i { background: var(--t-accent-2); }
.t-nav { position: sticky; top: 0; z-index: 10; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 12px clamp(16px, 4vw, 40px); background: color-mix(in srgb, var(--t-bg) 82%, transparent); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border-bottom: 1px solid var(--t-line); }

/* ---------- Controls ---------- */
.t-btn {
  position: relative; display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  min-height: 46px; padding: 0 22px; border: var(--t-btn2-border, var(--t-border)); border-radius: var(--t-btn-r, ${t.r === '0px' ? '0' : '999px'});
  background: var(--t-btn2-bg, #fff); color: var(--t-btn2-ink, #1b1d2a); font: 600 15px/1 var(--t-sans); text-transform: var(--t-btn-case, none); cursor: pointer; text-decoration: none; white-space: nowrap;
  transition: transform .3s var(--t-spring), box-shadow .3s var(--t-ease), background .2s;
}
.t-btn:hover { transform: translateY(-2px); }
.t-btn:active { transform: translateY(1px) scale(.98); }
.t-btn--primary { background: var(--t-btn-bg, var(--t-accent)); color: var(--t-btn-ink, #1b1d2a); border-color: color-mix(in srgb, var(--t-accent) 60%, var(--t-ink)); box-shadow: var(--t-btn-shadow, none); }
.t-btn--ghost { background: transparent; color: inherit; border-color: transparent; }
.t-btn--ghost:hover { background: var(--t-tint); color: #1b1d2a; }
.t-input { width: 100%; min-height: 44px; padding: 10px 14px; border: var(--t-border); border-radius: var(--t-r-sm); background: var(--t-input-bg, #fff); color: var(--t-input-ink, #1b1d2a); font: 400 15px/1.4 var(--t-sans); box-sizing: border-box; }
.t-input:focus { outline: none; border-color: var(--t-accent); box-shadow: 0 0 0 4px color-mix(in srgb, var(--t-accent) 25%, transparent); }
.t-chip { display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; border: 1px solid var(--t-line-2); border-radius: ${t['r-sm'] === '0px' ? '0' : '999px'}; background: var(--t-chip-bg, var(--t-tint)); color: var(--t-chip-ink, #1b1d2a); font: 500 13px/1.2 var(--t-mono); }

/* ---------- Overlays ---------- */
.t-dialog { border: var(--t-border); border-radius: var(--t-r); padding: 0; background: var(--t-surface); color: var(--t-surface-ink); box-shadow: var(--t-card-shadow); max-width: min(640px, 94vw); }
.t-dialog::backdrop { background: color-mix(in srgb, var(--t-bg) 70%, transparent); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }
.t-toast { position: fixed; left: 50%; bottom: 24px; transform: translateX(-50%); padding: 12px 18px; border: var(--t-border); border-radius: var(--t-r-sm); background: var(--t-surface); color: var(--t-surface-ink); box-shadow: var(--t-card-shadow); }

/* ---------- Signature: what makes it ${u.name} ---------- */
${(u.sig || '').trim()}

/* ---------- Accessibility ---------- */
@media (prefers-reduced-motion: reduce) {
  .t-page *, .t-page *::before, .t-page *::after { animation: none !important; transition: none !important; }
}
@media (forced-colors: active) { .t-card, .t-btn, .t-window { border: 1px solid CanvasText; } }
`;
}

/* ---------------- CSV ---------------- */
const q = (v) => (/[",\n]/.test(v) ? `"${String(v).replace(/"/g, '""')}"` : v);
function csvOf(id) {
  const u = U[id], t = tokenSet(id);
  const rows = [['Category', 'Token_Name', 'Variant_Mode', 'CSS_Property_or_Role', 'Exact_Value', 'Usage_Notes']];
  const mode = u.light ? 'Light' : 'Dark_Page';
  Object.entries(t).forEach(([k, v]) => { const d = TOKEN_DOC[k] || ['Other', '', '']; rows.push([d[0], `t-${k}`, mode, d[1], v, d[2]]); });
  rows.push(['Colour', 't-accent-deep', 'All', 'color', 'color-mix(in oklab, var(--t-accent) 62%, var(--t-ink))', TOKEN_DOC['accent-deep'][2]]);
  rows.push(['Elevation', 't-card-shadow', 'All', 'box-shadow', u.shadow || (u.light ? '7px 7px 0 var(--t-shadow)' : '0 18px 50px -18px rgba(0, 0, 0, .7)'), 'Cards, windows, dialogs']);
  rows.push(['Lines', 't-border', 'All', 'border', u.border || '1.5px solid var(--t-line-2)', 'Cards, buttons, inputs']);
  rows.push(['Motion', 't-ease', 'All', 'transition-timing-function', 'cubic-bezier(.2, .7, .2, 1)', 'Most transitions']);
  rows.push(['Motion', 't-spring', 'All', 'transition-timing-function', 'cubic-bezier(.34, 1.56, .64, 1)', 'Buttons: a little overshoot']);
  if (u.light && !u.tokens.ink) Object.entries(EDITIONS).forEach(([e, v]) => Object.entries(v).forEach(([k, val]) => rows.push(['Edition', `t-${k === 'paper' ? 'bg' : k}`, `Edition_${e}`, TOKEN_DOC[k === 'paper' ? 'bg' : k][1], val, `${e} colour edition`])));
  return rows.map((r) => r.map(q).join(',')).join('\n') + '\n';
}

/* ---------------- Prompt + Markdown ---------------- */
function promptOf(id) {
  const u = U[id], t = tokenSet(id);
  return `Apply the "${u.name}" theme to this project. ${u.mood}

Use the files ${id}.css, ${id}.csv and ${id.toUpperCase()}-THEME.md (from ${SITE}/universes.html#kits). Follow them exactly:
1. Add ${id}.css after the project's own CSS${fontsURL([t.display, t.sans, t.mono, t.hand]) ? ' and the Google Fonts link at the top of it' : ''}. Put class "t-page" on <body>.
2. Map components to the theme classes: page width → t-wrap; top bar → t-nav; cards/panels → t-card; app/screens previews → t-window; buttons → t-btn (the one main action per view → t-btn t-btn--primary; quiet actions → t-btn--ghost); text fields → t-input; tags/filters → t-chip; small labels → t-eyebrow; page title → t-title; section titles → t-h2; intro paragraph → t-lede; modals → t-dialog; notifications → t-toast.
3. Use only the --t-* tokens for colour, type, radius and shadow. Remove hard-coded colours, fonts and radii that fight the theme.
4. Theme rules:
${u.rules.map((r) => `   - ${r}`).join('\n')}
5. ${u.light ? 'Light theme: keep everything light; no dark sections.' : 'Dark page, light cards: page text uses --t-ink on the dark background; anything inside a card uses --t-surface-ink.'}
6. Keep it accessible: text contrast AA, visible focus rings, prefers-reduced-motion turns animation off (already in the CSS).
7. Check it at 390px (phone) and 1440px (desktop) wide and fix anything that overflows.
Sample voice for headings: "${u.voice.join(' ')}"`;
}
function mdOf(id) {
  const u = U[id], t = tokenSet(id);
  const fonts = fontsURL([t.display, t.sans, t.mono, t.hand]);
  return `# ${u.name} theme — specification

${u.mood}

One of the 27 universes of [Thrishank Kuntimaddi's portfolio](${SITE}). Free to use in your own projects (MIT-style: keep, change, ship). Files in this kit:

| File | What it is |
|---|---|
| \`${id}.css\` | Drop-in stylesheet: tokens, components and the ${u.name} signature |
| \`${id}.csv\` | Every token with its exact value and use (for Figma, spreadsheets or your own build) |
| \`${id.toUpperCase()}-THEME.md\` | This document |
| \`prompt.txt\` | Section 0 on its own, to paste into an AI coding tool |

---

## 0. Prompt to paste into a new session

\`\`\`
${promptOf(id)}
\`\`\`

---

## 1. The look in one line

${u.mood}

**Sample voice:** “${u.voice.join(' ')}”

## 2. Rules

${u.rules.map((r) => `- ${r}`).join('\n')}
- ${u.light ? 'Light theme only.' : 'Dark page with light paper cards: cards, windows and dialogs stay light so long text is easy to read.'}

## 3. Tokens

| Token | Value | Use |
|---|---|---|
${Object.entries(t).map(([k, v]) => `| \`--t-${k}\` | \`${v.replace(/\|/g, '\\|')}\` | ${TOKEN_DOC[k]?.[2] || ''} |`).join('\n')}
| \`--t-card-shadow\` | \`${u.shadow || (u.light ? '7px 7px 0 var(--t-shadow)' : '0 18px 50px -18px rgba(0, 0, 0, .7)')}\` | Cards, windows, dialogs |
| \`--t-border\` | \`${u.border || '1.5px solid var(--t-line-2)'}\` | Cards, buttons, inputs |
${u.light && !u.tokens.ink ? `\n### Colour editions\n\nSet \`<html data-edition="…">\`. The site picks one from the visitor's local time (5–11 morning, 11–17 noon, 17–21 dusk, otherwise night).\n\n| Edition | Background | Tint | Accent | Accent 2 | Accent 3 |\n|---|---|---|---|---|---|\n${Object.entries(EDITIONS).map(([e, v]) => `| ${e} | \`${v.paper}\` | \`${v.tint}\` | \`${v.accent}\` | \`${v['accent-2']}\` | \`${v['accent-3']}\` |`).join('\n')}\n` : ''}
## 4. Fonts

${fonts ? `\`\`\`html\n<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link rel="stylesheet" href="${fonts}">\n\`\`\`` : 'System fonts only.'}

Display: \`${t.display}\` · Body: \`${t.sans}\` · Labels: \`${t.mono}\`

## 5. Components

| Class | Use |
|---|---|
| \`t-page\` | On \`<body>\`: background, text colour, fonts |
| \`t-wrap\` | Centred content column, 1160px max |
| \`t-nav\` | Sticky top bar, lightly frosted |
| \`t-card\` | Cards and panels |
| \`t-window\` + \`t-window-bar\` | A window frame for screenshots or app previews |
| \`t-btn\`, \`t-btn--primary\`, \`t-btn--ghost\` | Buttons. One primary per view |
| \`t-input\` | Text fields and textareas |
| \`t-chip\` | Tags and filters |
| \`t-eyebrow\`, \`t-title\`, \`t-h2\`, \`t-lede\`, \`t-muted\` | Type |
| \`t-dialog\` | On \`<dialog>\` |
| \`t-toast\` | Notifications |

\`\`\`html
<body class="t-page">
  <nav class="t-nav"><b>Brand</b><a class="t-btn t-btn--ghost" href="#">Menu</a></nav>
  <main class="t-wrap">
    <p class="t-eyebrow">Section label</p>
    <h1 class="t-title">${u.voice[0].replace(/(interf\S*|interfaces)/i, '<em>$1</em>')}</h1>
    <p class="t-lede">${u.voice[1]}</p>
    <a class="t-btn t-btn--primary" href="#">Main action</a>
    <div class="t-card"><h2 class="t-h2">A card</h2><p class="t-muted">Body text.</p><span class="t-chip">Tag</span></div>
  </main>
</body>
\`\`\`

## 6. Signature CSS (what makes it ${u.name})

\`\`\`css
${(u.sig || '/* tokens and background only */').trim()}
\`\`\`

## 7. Accessibility

- Contrast: body text and card text meet WCAG AA on their backgrounds.
- Focus: 3px accent outline on every focusable element.
- Motion: \`prefers-reduced-motion: reduce\` turns every animation and transition off.
- Forced colours (Windows high contrast): borders fall back to \`CanvasText\`.

## 8. Swap universes

All 27 universe kits use the same \`t-*\` classes and \`--t-*\` tokens. Replace \`${id}.css\` with another universe's file to change the whole look without touching markup.
`;
}

/* ---------------- Build ---------------- */
mkdirSync(OUT, { recursive: true });
const manifest = [];
const meta = (id) => {
  const u = U[id], t = tokenSet(id);
  return { id, name: u.name, group: u.light ? 'Light universes' : 'Dark universes', mood: u.mood, voice: u.voice, light: !!u.light,
    swatch: { bg: t.bg, page: tokenSet(id)['page-bg'], ink: t.ink, surface: t.surface, accent: t.accent, accent2: t['accent-2'], accent3: t['accent-3'], r: t.r, display: t.display },
    files: [`${id}.css`, `${id}.csv`, `${id.toUpperCase()}-THEME.md`, 'prompt.txt'], demo: true };
};
[...LIGHT, ...DARK].forEach((id) => {
  const dir = join(OUT, id);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${id}.css`), stylesheet(id));
  writeFileSync(join(dir, `${id}.csv`), csvOf(id));
  writeFileSync(join(dir, `${id.toUpperCase()}-THEME.md`), mdOf(id));
  writeFileSync(join(dir, 'prompt.txt'), `${promptOf(id)}\n`);
  manifest.push(meta(id));
});

// Hand-made kits in kits/_src/<id>/ (copied as they are; kit.json describes them).
const SRC = join(OUT, '_src');
if (existsSync(SRC)) {
  readdirSync(SRC).forEach((id) => {
    const from = join(SRC, id);
    const info = JSON.parse(readFileSync(join(from, 'kit.json'), 'utf8'));
    const dir = join(OUT, id);
    mkdirSync(dir, { recursive: true });
    info.files.forEach((f) => copyFileSync(join(from, f), join(dir, f)));
    manifest.unshift({ id, ...info });
  });
}
const order = ['liquid-glass', 'monolith-gloss', 'unslop', 'unsloped'];
manifest.sort((a, b) => (order.indexOf(b.id) + 1 || 0) - (order.indexOf(a.id) + 1 || 0) || 0);
manifest.sort((a, b) => { const ia = order.indexOf(a.id), ib = order.indexOf(b.id); return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib); });
writeFileSync(join(OUT, 'kits.json'), JSON.stringify({ updated: new Date().toISOString().slice(0, 10), kits: manifest }, null, 1));
console.log(`Built ${manifest.length} kits into kits/`);
