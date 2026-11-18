/* =========================================================
   The theme kits and help center on universes.html.
   Kits come from kits/kits.json (built by tools/build-kits.mjs).
   Help answers come from Firebase (site/help), edited in the
   Studio app; a few defaults show if that can't be reached.
   ========================================================= */
const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const JSZIP = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';

let KITS = [];
let filter = 'all';
const status = (t) => { $('#kitStatus').textContent = t; };

/* ---------- Kits ---------- */
const FILTERS = [['all', 'All'], ['Signature kits', 'Signature'], ['Light universes', 'Light'], ['Dark universes', 'Dark']];
const ext = (f) => (f.endsWith('prompt.txt') ? 'prompt' : f.split('.').pop());

function tile(k) {
  const s = k.swatch;
  const glass = s.glass ? 'backdrop-filter: blur(14px) saturate(180%); -webkit-backdrop-filter: blur(14px) saturate(180%); box-shadow: inset 0 1.5px 0 rgba(255,255,255,.85), 0 10px 26px -8px rgba(0,0,0,.2);' : '';
  return `<div class="kit-tile" aria-hidden="true" style="background:${esc(s.page)}">
    <div class="kit-mini" style="background:${esc(s.surface)};border-radius:${esc(s.r)};${glass}${s.mono ? 'border:1px solid #2a2a2a;' : ''}">
      <b style="font-family:${esc(s.display)};color:${k.light || s.mono ? esc(s.ink) : '#2c3046'}">${esc(k.name)}</b>
      <i style="background:${esc(s.accent)};border-radius:${s.r === '0px' ? '0' : '99px'};${s.glass ? 'box-shadow: inset 0 1px 0 #fff, 0 2px 8px rgba(0,0,0,.15);' : ''}${s.mono ? 'background:linear-gradient(180deg,#d9b98f,#a5835a);' : ''}"></i>
      <span style="background:${esc(s.accent2)}"></span><span style="background:${esc(s.accent3)}"></span>
    </div>
  </div>`;
}
function card(k) {
  const dup = (f) => k.files.filter((g) => ext(g) === ext(f)).length > 1;
  const files = k.files.map((f) => `<a href="kits/${k.id}/${f}" download class="kit-file" title="${esc(f)}">${dup(f) ? esc(f) : `.${ext(f)}`}</a>`).join('');
  return `<article class="card kit" id="kit-${k.id}" data-group="${esc(k.group)}">
    ${tile(k)}
    <div class="kit-body">
      <p class="kit-group">${k.group === 'Signature kits' ? 'Signature' : 'Universe'} · ${k.light ? 'light' : 'dark'}</p>
      <h3>${esc(k.name)}</h3>
      <p class="kit-mood">${esc(k.mood)}</p>
      <div class="kit-actions">
        <button class="btn btn-gloss btn-sm" type="button" data-copy="${k.id}">Copy prompt</button>
        ${k.demo ? `<a class="btn btn-paper btn-sm" href="kits/demo.html?kit=${k.id}" target="_blank" rel="noopener">Live demo ↗</a>` : ''}
        <button class="btn btn-paper btn-sm" type="button" data-zip="${k.id}">.zip ↓</button>
      </div>
      <p class="kit-files">${files}</p>
    </div>
  </article>`;
}
function draw() {
  $('#kitFilters').innerHTML = FILTERS.map(([v, n]) => {
    const c = v === 'all' ? KITS.length : KITS.filter((k) => k.group === v).length;
    return `<button type="button" role="tab" class="kit-filter" data-f="${v}" aria-selected="${filter === v}">${n} <span>${c}</span></button>`;
  }).join('');
  const list = KITS.filter((k) => filter === 'all' || k.group === filter);
  $('#kitGrid').innerHTML = list.map(card).join('');
}

let zipLib = null;
function loadZip() {
  if (!zipLib) zipLib = new Promise((ok, bad) => { const s = document.createElement('script'); s.src = JSZIP; s.onload = () => ok(window.JSZip); s.onerror = bad; document.head.appendChild(s); });
  return zipLib;
}
async function zip(kits, name) {
  status('Packing…');
  try {
    const JSZip = await loadZip();
    const z = new JSZip();
    const root = kits.length > 1 ? z.folder('theme-kits') : z;
    for (const k of kits) {
      const dir = kits.length > 1 ? root.folder(k.id) : root;
      await Promise.all(k.files.map(async (f) => dir.file(f, await fetch(`kits/${k.id}/${f}`).then((r) => { if (!r.ok) throw new Error(f); return r.blob(); }))));
    }
    if (kits.length > 1) root.file('README.txt', `Free theme kits from Thrishank Kuntimaddi's portfolio\nhttps://thrishankkuntimaddi.github.io/universes.html#kits\n\nEach folder: prompt.txt (paste into an AI coding tool), a .css to drop in, a .csv of every token, and a .md spec.\nThe 27 universe kits share the same t-* classes, so you can swap one stylesheet for another.\n\n${kits.map((k) => `${k.id.padEnd(16)} ${k.name} — ${k.mood}`).join('\n')}\n`);
    const blob = await z.generateAsync({ type: 'blob' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 20000);
    status(`Downloaded ${name}`);
  } catch (e) { status('Couldn’t pack the zip. The single files below still download one by one.'); }
}

document.addEventListener('click', async (e) => {
  const f = e.target.closest('[data-f]');
  if (f) { filter = f.dataset.f; draw(); return; }
  const c = e.target.closest('[data-copy]');
  if (c) {
    const k = KITS.find((x) => x.id === c.dataset.copy);
    try {
      const txt = await fetch(`kits/${k.id}/prompt.txt`).then((r) => r.text());
      await navigator.clipboard.writeText(txt);
      c.textContent = 'Copied ✓'; setTimeout(() => { c.textContent = 'Copy prompt'; }, 1600);
      window.tkTrack?.('kit', { detail: `${k.id}:prompt` });
      status(`${k.name} prompt copied. Paste it into your AI tool along with the kit files.`);
    } catch { window.open(`kits/${k.id}/prompt.txt`, '_blank', 'noopener'); }
    return;
  }
  const z = e.target.closest('[data-zip]');
  if (z) { const k = KITS.find((x) => x.id === z.dataset.zip); window.tkTrack?.('kit', { detail: `${k.id}:zip` }); zip([k], `${k.id}-theme-kit.zip`); return; }
  if (e.target.closest('#kitAll')) window.tkTrack?.('kit', { detail: 'all:zip' }), zip(KITS, 'theme-kits-thrishank-kuntimaddi.zip');
});

fetch('kits/kits.json').then((r) => r.json()).then((j) => {
  KITS = j.kits;
  $('#kitAll').textContent = `Download all ${KITS.length} kits (.zip) ↓`;
  draw();
  const stack = ['liquid-glass', 'monolith-gloss', 'fire', 'pixel', 'sky'].map((id) => KITS.find((k) => k.id === id)).filter(Boolean);
  $('#heroStack').innerHTML = stack.map((k, i) => `<span class="hs-card" style="--i:${i}">${tile(k)}<b>${esc(k.name)}</b></span>`).join('')
    + `<span class="hs-count">${KITS.length} kits · prompt + css + csv + md</span>`;
  // the grid above changes height once loaded, so land on the linked section again
  const target = location.hash && document.getElementById(location.hash.slice(1));
  if (target) requestAnimationFrame(() => target.scrollIntoView({ block: /^#kit-/.test(location.hash) ? 'center' : 'start' }));
}).catch(() => { $('#kitGrid').innerHTML = '<p class="kit-loading">The kits couldn’t load. Refresh to try again.</p>'; });

/* ---------- Help center ---------- */
const DEFAULT_FAQ = [
  { q: 'Can I use these themes in my own project?', a: 'Yes, free, for personal and commercial work. A credit link is nice but not required.' },
  { q: 'How do I use a kit with an AI coding tool?', a: 'Download the kit, put its files in your project, then copy its prompt and paste it into Claude, Cursor, Copilot or similar. The prompt tells the tool exactly how to apply the theme.' },
  { q: 'Can I switch between universes later?', a: 'Yes. The 27 universe kits use the same class names (t-card, t-btn…), so you swap one stylesheet for another and the whole look changes.' },
  { q: 'Are you open to work?', a: 'Yes: frontend and UI roles, freelance and collaborations. Use “Ask a question” or email me.' },
];
function drawFaq(list) {
  $('#faq').innerHTML = list.map((f) => `<div class="faq-item"><dt>${esc(f.q)}</dt><dd>${esc(f.a)}</dd></div>`).join('');
}
drawFaq(DEFAULT_FAQ);
import('./firebase.js?v=2').then((m) => m.readPublic('help')).then(({ data }) => { if (Array.isArray(data) && data.length) drawFaq(data); }).catch(() => {});
