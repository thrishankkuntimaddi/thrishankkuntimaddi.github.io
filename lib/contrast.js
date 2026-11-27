/* =========================================================
   Contrast guard: in every universe, text stays readable.

   The 31 universes mix their tokens differently, so a few
   shared pieces (stickers, plaques, tabs, labels on accent or
   white patches) can end up light-on-light or dark-on-dark.
   After each universe change this measures every piece of
   text against the colour actually behind it and, where the
   contrast is too low, switches that text to near-black or
   near-white, whichever reads better. Nothing else changes.

   Skipped: the coded app previews (they are fixed screens),
   and text over images (photos, drawn scenes) we can't measure.
   ========================================================= */
const root = document.documentElement;
const SKIP = '.mock, .mock-hud, svg, canvas, script, style, noscript, .fall, .glitch-layer, .strips, #infinity, .inf, [hidden]';
const DARK = { r: 17, g: 17, b: 17 }, LIGHT = { r: 250, g: 248, b: 244 };

const parse = (c) => {
  const m = /rgba?\(([^)]+)\)/.exec(c || ''); if (!m) return null;
  const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
  return { r: p[0], g: p[1], b: p[2], a: p[3] ?? 1 };
};
const lum = ({ r, g, b }) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const over = (top, bot) => ({ r: top.r * top.a + bot.r * (1 - top.a), g: top.g * top.a + bot.g * (1 - top.a), b: top.b * top.a + bot.b * (1 - top.a), a: 1 });
// A gradient counts as the average of its colours; url() images can't be measured.
function gradient(img) {
  if (!img || img === 'none' || /url\(/.test(img)) return null;
  const cols = (img.match(/rgba?\([^)]+\)/g) || []).map(parse).filter(Boolean);
  if (!cols.length) return null;
  const n = cols.length, sum = cols.reduce((s, c) => ({ r: s.r + c.r, g: s.g + c.g, b: s.b + c.b, a: s.a + c.a }), { r: 0, g: 0, b: 0, a: 0 });
  return { r: sum.r / n, g: sum.g / n, b: sum.b / n, a: sum.a / n };
}
/** The colour behind `el`, or null when an image is in the way. */
function behind(el) {
  const layers = [];
  for (let n = el; n; n = n.parentElement) {
    const cs = getComputedStyle(n);
    if (/url\(/.test(cs.backgroundImage)) return null;
    // a gradient fills the box only at full size (thin underline or highlight gradients don't count)
    const full = cs.display !== 'inline' && /^(auto|auto auto|100% 100%|cover)(, (auto|auto auto|100% 100%|cover))*$/.test(cs.backgroundSize);
    const g = full ? gradient(cs.backgroundImage) : null;
    if (g && g.a > 0.05) { layers.push(g); if (g.a >= 0.95) break; }
    const c = parse(cs.backgroundColor);
    if (c && c.a > 0) { layers.push(c); if (c.a >= 0.99) break; }
  }
  let base = parse(getComputedStyle(root).backgroundColor);
  if (!base || base.a < 1) base = over(base || { r: 255, g: 255, b: 255, a: 0 }, { r: 255, g: 255, b: 255, a: 1 });
  for (let i = layers.length - 1; i >= 0; i--) base = over(layers[i], base);
  return base;
}

let fixed = [];
function guard() {
  fixed.forEach((el) => { el.style.removeProperty('color'); delete el.dataset.cg; });
  fixed = [];
  const seen = new Set();
  const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walk.nextNode()) {
    const t = walk.currentNode, el = t.parentElement;
    if (!el || seen.has(el) || !t.textContent.trim()) continue;
    seen.add(el);
    if (el.closest(SKIP)) continue;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const fg = parse(cs.color); if (!fg) continue;
    const bg = behind(el); if (!bg) continue;
    const ink = fg.a < 1 ? over(fg, bg) : fg;
    const need = parseFloat(cs.fontSize) >= 24 ? 3 : 4.5;
    if (ratio(ink, bg) >= need * 0.75) continue;
    const pick = ratio(DARK, bg) >= ratio(LIGHT, bg) ? DARK : LIGHT;
    el.style.setProperty('color', `rgb(${pick.r}, ${pick.g}, ${pick.b})`, 'important');
    el.dataset.cg = '';
    fixed.push(el);
  }
}

// Run after the page settles and after every universe or colour change (glitches flicker
// through several universes, so wait until they stop).
let timer = 0, pending = false;
const later = (ms = 260) => { clearTimeout(timer); pending = true; timer = setTimeout(() => { pending = false; requestAnimationFrame(guard); }, ms); };
const soon = () => { if (!pending) later(600); }; // never pushed back by text that keeps changing (codes, counters)
new MutationObserver(() => later()).observe(root, { attributes: true, attributeFilter: ['data-world', 'data-edition', 'data-dark'] });
// Content that arrives later (Studio text, kind words, stats, the final scene) gets checked too.
new MutationObserver((recs) => { if (recs.some((r) => r.type === 'attributes')) later(40); else soon(); }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden', 'aria-selected', 'aria-pressed'] });
if (document.readyState === 'complete') later(); else addEventListener('load', () => later());
document.fonts?.ready.then(() => later());
export { guard };
