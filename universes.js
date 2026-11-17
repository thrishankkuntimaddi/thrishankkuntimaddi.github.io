/* =========================================================
   Universes & settings (universes.html).
   Shows every look the site can take, and stores the
   visitor's choices in localStorage 'tk-prefs', which
   index.html, main.js and chapter.js read on load.
   ========================================================= */
import { OCCASIONS } from './content.js?v=22';
import { LOOP, NAMES, COPY } from './worlds.js?v=22';
import { U as LOOP_SCENES } from './infinity.js?v=22';
import { PIP_WEAR, GETUPS, SHADES } from './chapter.js?v=22';

const root = document.documentElement;
const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
$('#year').textContent = new Date().getFullYear();

/* ---------------- Preferences ---------------- */
let prefs = {};
try { prefs = JSON.parse(localStorage.getItem('tk-prefs')) || {}; } catch { /* private mode */ }
let savedT = 0;
function save(msg = 'Saved ✓') {
  Object.keys(prefs).forEach((k) => { if (prefs[k] === undefined || prefs[k] === '') delete prefs[k]; });
  try { localStorage.setItem('tk-prefs', JSON.stringify(prefs)); } catch { msg = 'Your browser is blocking storage, so this can’t be saved'; }
  root.classList.toggle('calm', prefs.motion === 'calm');
  const s = $('#saved');
  s.textContent = msg; s.classList.add('on');
  clearTimeout(savedT); savedT = setTimeout(() => s.classList.remove('on'), 1800);
}
if (matchMedia('(prefers-reduced-motion: reduce)').matches) $('#osNote').hidden = false;

const ROWS = [
  { key: 'motion', on: (p) => p.motion === 'calm', set: (v) => { prefs.motion = v ? 'calm' : undefined; }, name: 'Calm mode', what: 'No auto-scrolling, glitches, drifting leaves or moving parts. Everything is still there, just still.' },
  { key: 'glitch', on: (p) => p.glitch !== false, set: (v) => { prefs.glitch = v ? undefined : false; }, name: 'Glitches', what: 'The screen tearing between universes on refresh, halfway down and at the end.' },
  { key: 'sound', on: (p) => p.sound !== false, set: (v) => { prefs.sound = v ? undefined : false; }, name: 'Sound', what: 'Glitch, game and Pip sounds. They only ever play after you have touched the page.' },
  { key: 'tour', on: (p) => p.tour !== false, set: (v) => { prefs.tour = v ? undefined : false; }, name: 'Auto-tour', what: 'The page scrolling itself. Off, it waits for you; the ▶ button still starts it.' },
  { key: 'pip', on: (p) => p.pip !== false, set: (v) => { prefs.pip = v ? undefined : false; }, name: 'Pip', what: 'The little guide who walks about, pulls faces and talks.' },
  { key: 'season', on: (p) => p.season !== false, set: (v) => { prefs.season = v ? undefined : false; }, name: 'Seasonal effects', what: 'Leaves, snow, petals or fireflies drifting over the top of the page.' },
];
function drawRows() {
  $('#rows').innerHTML = ROWS.map((r) => {
    const on = r.on(prefs), implied = prefs.motion === 'calm' && r.key !== 'motion' && r.key !== 'sound';
    return `<div class="set-row${implied ? ' implied' : ''}"><div><p class="set-name">${r.name}</p><p class="set-what">${r.what}${implied ? ' <em>Calm mode already keeps this still.</em>' : ''}</p></div>`
      + `<button type="button" class="switch" role="switch" aria-checked="${on}" data-row="${r.key}" aria-label="${r.name}"><i></i><span>${on ? 'On' : 'Off'}</span></button></div>`;
  }).join('');
}
$('#rows').addEventListener('click', (e) => {
  const b = e.target.closest('[data-row]'); if (!b) return;
  const r = ROWS.find((x) => x.key === b.dataset.row);
  r.set(!r.on(prefs)); save();
  if (r.key === 'motion') { drawRows(); return; } // calm mode changes the notes on other rows
  // flip in place so the knob slides instead of the row being redrawn
  const on = r.on(prefs);
  b.setAttribute('aria-checked', String(on));
  b.querySelector('span').textContent = on ? 'On' : 'Off';
});

/* ---------------- Universes ---------------- */
const WORLDS = [
  { id: 'paper', name: 'Paper', fonts: 'Fraunces, Inter, Space Mono', about: 'The home look: soft paper, glossy buttons, stickers and tape.', h: 'I design and build <em>interfaces</em> people enjoy using.', cta: 'See my projects' },
  { id: 'pixel', name: 'Pixel', fonts: 'Press Start 2P, VT323', about: 'An 8-bit arcade: square corners, chunky outlines, insert coin.', h: 'I build <em>interfaces</em> worth pressing START for.', cta: 'Start' },
  { id: 'sketch', name: 'Sketch', fonts: 'Caveat, hand-drawn lines', about: 'A notebook: every edge drawn in wobbly pencil.', h: 'I sketch <em>interfaces</em>, then build every line.', cta: 'Flip to my projects' },
  { id: 'blueprint', name: 'Blueprint', fonts: 'Space Mono, ink blue', about: 'Engineering drawings: thin blue lines, figures and specs.', h: 'I engineer <em>interfaces</em> to spec, then make them human.', cta: 'Open the drawings' },
  { id: 'news', name: 'Newsprint', fonts: 'Georgia, Space Mono', about: 'A broadsheet: double rules, headlines and small caps.', h: 'Developer builds <em>interfaces</em> people actually enjoy using.', cta: 'Read the full story' },
];
// The 22 universes from the endless loop: dark pages with their scene behind them.
LOOP.forEach((id) => WORLDS.push({ id, name: NAMES[id], dark: true, fonts: 'A dark page, with its scene drawn behind it', about: LOOP_SCENES[id]?.tag || '', h: `${COPY[id].h2} ${COPY[id].h3}`, cta: COPY[id].cta }));
const EDITIONS = [
  { id: 'morning', name: 'Coral', when: '5 am – 11 am' },
  { id: 'noon', name: 'Sky', when: '11 am – 5 pm' },
  { id: 'dusk', name: 'Lilac', when: '5 pm – 9 pm' },
  { id: 'night', name: 'Mint', when: '9 pm – 5 am' },
];
let previewEd = root.dataset.edition;
function drawUniverses() {
  $('#uniGrid').innerHTML = WORLDS.map((w) => {
    const pinned = prefs.world === w.id;
    return `<article class="uni${pinned ? ' pinned' : ''}">`
      + `<div class="mini-site${w.id === 'sketch' ? ' sketch' : ''}" data-world="${w.id}" data-edition="${previewEd}"${w.dark ? ' data-dark data-loop' : ''} aria-hidden="true">`
      + '<div class="ms-nav"><span class="brand-mark">TK</span><i></i><i></i><i></i></div>'
      + `<p class="edition-tag"><span class="dot"></span> ${w.name} universe</p>`
      + `<p class="ms-title">${w.h}</p>`
      + `<p class="ms-row"><span class="btn btn-gloss btn-sm">${w.cta} ↓</span><span class="btn btn-paper btn-sm">Email me</span></p>`
      + '<div class="card ms-card"><p class="p-num">Project 01</p><p class="ms-h3">Oruinwan</p><ul class="chips"><li>React 19</li><li>Yjs</li><li>Socket.IO</li></ul></div>'
      + '</div>'
      + `<div class="uni-info"><h3>${w.name}${pinned ? ' <span class="uni-badge">Always on</span>' : ''}</h3><p>${w.about}</p><p class="uni-fonts">${w.fonts}</p>`
      + `<p class="uni-acts"><a class="btn btn-paper btn-sm" href="./?world=${w.id}&amp;edition=${previewEd}">Look around ↗</a>`
      + `<button type="button" class="btn ${pinned ? 'btn-gloss' : 'btn-paper'} btn-sm" data-pin-world="${w.id}" aria-pressed="${pinned}">${pinned ? '✓ Always this one' : 'Always use this'}</button></p></div>`
      + '</article>';
  }).join('');
}
$('#uniGrid').addEventListener('click', (e) => {
  const b = e.target.closest('[data-pin-world]'); if (!b) return;
  const id = b.dataset.pinWorld;
  prefs.world = prefs.world === id ? undefined : id;
  save(prefs.world ? `Saved: always ${WORLDS.find((w) => w.id === id).name}` : 'Saved: universes are automatic again');
  drawUniverses(); drawPins();
});

function drawEditions() {
  $('#edGrid').innerHTML = EDITIONS.map((e) => {
    const pinned = prefs.edition === e.id;
    return `<div class="ed card${previewEd === e.id ? ' on' : ''}${pinned ? ' pinned' : ''}" data-edition="${e.id}">`
      + `<button type="button" class="ed-try" data-try="${e.id}" aria-pressed="${previewEd === e.id}"><span class="ed-sw" aria-hidden="true"><i></i><i></i><i></i><i></i></span><b>${e.name}</b><span>${e.when}</span></button>`
      + `<button type="button" class="btn ${pinned ? 'btn-gloss' : 'btn-paper'} btn-sm" data-pin-ed="${e.id}" aria-pressed="${pinned}">${pinned ? '✓ Always' : 'Always use'}</button></div>`;
  }).join('');
}
$('#edGrid').addEventListener('click', (e) => {
  const t = e.target.closest('[data-try]');
  if (t) { previewEd = t.dataset.try; drawEditions(); drawUniverses(); return; }
  const b = e.target.closest('[data-pin-ed]'); if (!b) return;
  const id = b.dataset.pinEd;
  prefs.edition = prefs.edition === id ? undefined : id;
  if (prefs.edition) { previewEd = id; root.dataset.edition = id; }
  save(prefs.edition ? `Saved: always ${EDITIONS.find((x) => x.id === id).name}` : 'Saved: colours are automatic again');
  drawEditions(); drawUniverses(); drawPins();
});

function drawPins() {
  const w = WORLDS.find((x) => x.id === prefs.world), ed = EDITIONS.find((x) => x.id === prefs.edition);
  $('#pins').innerHTML = `<p><span>Universe</span><b>${w ? `Always ${w.name}` : 'Automatic: a new one on every refresh'}</b>${w ? '<button type="button" class="ask-chip" data-unpin="world">Back to automatic</button>' : '<a class="ask-chip" href="#universes">Choose one</a>'}</p>`
    + `<p><span>Colours</span><b>${ed ? `Always ${ed.name}` : 'Automatic: from your clock, then the next on refresh'}</b>${ed ? '<button type="button" class="ask-chip" data-unpin="edition">Back to automatic</button>' : '<a class="ask-chip" href="#editions">Choose one</a>'}</p>`;
}
$('#pins').addEventListener('click', (e) => {
  const b = e.target.closest('[data-unpin]'); if (!b) return;
  prefs[b.dataset.unpin] = undefined; save('Saved: automatic again');
  drawPins(); drawUniverses(); drawEditions();
});

$('#resetPrefs').addEventListener('click', () => { prefs = {}; save('Everything is automatic again'); drawAll(); });
let forgetArmed = 0;
$('#forget').addEventListener('click', (e) => {
  const b = e.currentTarget;
  if (!forgetArmed) { forgetArmed = setTimeout(() => { forgetArmed = 0; b.textContent = 'Forget everything about me'; }, 4000); b.textContent = 'Sure? Tap again to forget'; return; }
  clearTimeout(forgetArmed); forgetArmed = 0;
  ['tk-mem', 'tk-visits', 'tk-best', 'tk-prefs'].forEach((k) => { try { localStorage.removeItem(k); } catch { /* private mode */ } });
  try { sessionStorage.clear(); } catch { /* private mode */ }
  prefs = {}; drawAll(); b.textContent = 'Forgotten ✓';
  save('Done. Next visit, the site meets you for the first time.');
});

/* ---------------- Seasons, occasions and Pip ---------------- */
const SEASONS = [['autumn', 'Autumn', 'Leaves drift down'], ['winter', 'Winter', 'Snow, and Pip wears a scarf'], ['spring', 'Spring', 'Petals'], ['summer', 'Summer', 'Fireflies rise']];
$('#seasonRow').innerHTML = SEASONS.map(([id, name, what]) => `<li class="card"><a href="./?season=${id}"><b>${name}</b><span>${what}</span><i>Preview ↗</i></a></li>`).join('')
  + '<li class="card"><a href="./?moon=full"><b>Full &amp; new moon</b><span>Shown in the label at the top</span><i>Preview ↗</i></a></li>';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function nextDate(o) { // the next day this occasion comes round, as text
  const now = new Date(), today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = [];
  for (const d of o.dates) {
    if (d.startsWith('day-')) { for (const y of [now.getFullYear(), now.getFullYear() + 1]) days.push(new Date(y, 0, +d.slice(4))); }
    else if (/^\d\d-\d\d$/.test(d)) { for (const y of [now.getFullYear(), now.getFullYear() + 1]) days.push(new Date(y, +d.slice(0, 2) - 1, +d.slice(3))); }
    else { const [y, m, dd] = d.split('-').map(Number); days.push(new Date(y, m - 1, dd)); }
  }
  const next = days.filter((x) => x >= today).sort((a, b) => a - b)[0];
  if (!next) return '';
  return +next === +today ? 'Today!' : `${next.getDate()} ${MONTHS[next.getMonth()]} ${next.getFullYear()}`;
}

async function drawPips() {
  let svg = '', defs = '';
  try { // borrow Pip (and the pencil filter) from the real page, so there is only one Pip to maintain
    const doc = new DOMParser().parseFromString(await (await fetch('./')).text(), 'text/html');
    svg = doc.querySelector('#pip svg')?.outerHTML || '';
    defs = doc.querySelector('svg.fx-defs')?.outerHTML || '';
  } catch { /* offline */ }
  if (!svg) { $('#occGrid').hidden = true; $('#pipSec').hidden = true; return; }
  document.body.insertAdjacentHTML('beforeend', defs);
  const pip = (cls, wear, getup, tint) => `<span class="pip pip-still${cls ? ` ${cls}` : ''}"${wear ? ` data-wear="${wear}"` : ''}${getup ? ` data-getup="${getup}"` : ''}${tint ? ` style="--pip-tint:${tint}"` : ''} aria-hidden="true">${svg.replace('</svg>', `<g class="pip-wear">${PIP_WEAR}</g></svg>`)}</span>`;
  const seen = new Set();
  $('#occGrid').innerHTML = OCCASIONS.map((o) => {
    const key = `${o.wear}-${o.greet}`; if (seen.has(key)) return ''; seen.add(key);
    const nd = nextDate(o);
    return `<li class="card"><a href="./?occasion=${o.id}">${pip('', o.wear)}<b>${esc(o.greet)}</b><span>${nd ? `Next: ${nd}` : 'Dates to come'}</span></a></li>`;
  }).join('') + `<li class="card"><a href="./?season=winter">${pip('', 'scarf')}<b>Any winter day</b><span>A scarf</span></a></li>`
    + GETUPS.map(([id, name], i) => `<li class="card">${pip('', '', id, SHADES[i % SHADES.length])}<b>${name}</b><span>A get-up Pip changes into now and then, in a new colour</span></li>`).join('');
  let pokes = 0;
  try { pokes = (JSON.parse(localStorage.getItem('tk-mem')) || {}).pokes || 0; } catch { /* private mode */ }
  const LV = [[0, '', 'Just met', 'Pip waves and pulls faces.'], [5, 'lv1', '5 pokes', 'Friends: blush.'], [15, 'lv1 lv2', '15 pokes', 'Best friends: a star.'], [30, 'lv1 lv2 lv3', '30 pokes', 'Favourite visitor: a crown.']];
  $('#lvGrid').innerHTML = LV.map(([n, cls, name, what]) => `<li class="card${pokes >= n ? ' got' : ''}">${pip(cls, '')}<b>${name}</b><span>${what}</span>${pokes >= n && n ? '<i>Unlocked</i>' : ''}</li>`).join('')
    + `<li class="card lv-you"><b>You</b><span>${pokes ? `You have poked Pip ${pokes} time${pokes === 1 ? '' : 's'}.` : 'You haven’t poked Pip yet.'}</span></li>`;
}

function drawAll() { drawRows(); drawPins(); drawUniverses(); drawEditions(); }
drawAll();
drawPips();
