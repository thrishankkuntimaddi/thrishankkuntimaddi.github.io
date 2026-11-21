/* =========================================================
   Studio → Website: control the live site from the app.
   Saved to site/config as JSON (public read, owner write).
   ========================================================= */
import { DEFAULTS, withDefaults, effective } from '../lib/site-config.js?v=3';
import { BASE, LOOP, KITS, NAMES, isDarkWorld } from '../worlds.js?v=23';
import { OCCASIONS } from '../content.js?v=22';

const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const WORLDS = [...BASE, ...LOOP, ...KITS];
const EDITIONS = { morning: 'Coral (morning)', noon: 'Sky (noon)', dusk: 'Lilac (dusk)', night: 'Mint (night)' };
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MOTION = [
  ['calm', 'Calm mode for everyone', 'No auto-scroll, glitches or moving parts.', true],
  ['glitch', 'Glitches', 'Screen tearing between universes.'],
  ['tour', 'Auto-tour', 'The page scrolling itself.'],
  ['sound', 'Sound', 'Glitch, game and Pip sounds (after a tap).'],
  ['season', 'Seasonal effects', 'Leaves, snow, petals, fireflies.'],
  ['loop', 'The endless loop', 'The dark never-ending fall after the quick jump.'],
  ['tunes', 'Project tunes', 'A short tune as each project scrolls in.'],
];
const TEMPLATES = [
  { name: 'Weekends in Pixel', days: [0, 6], do: { world: 'pixel' } },
  { name: 'Calm at night', hours: [22, 6], do: { calm: true, edition: 'night' } },
  { name: 'Diwali week', from: '', to: '', do: { occasion: 'diwali', banner: 'Happy Diwali from me and Pip! ✨', pipSay: 'Happy Diwali!' } },
  { name: 'Open to work', do: { banner: 'I’m open to frontend and UI roles. Say hi!', link: '#contact', linkText: 'Contact' } },
];

let F, toast, DEMO, cfg, saved = '';

const opt = (v, label, cur) => `<option value="${esc(v)}" ${v === (cur || '') ? 'selected' : ''}>${esc(label)}</option>`;
const worldOpts = (cur, auto = 'Automatic') => opt('', auto, cur) + WORLDS.map((w) => opt(w, NAMES[w], cur)).join('');
const edOpts = (cur, auto = 'Automatic (by time)') => opt('', auto, cur) + Object.entries(EDITIONS).map(([k, v]) => opt(k, v, cur)).join('');
const occOpts = (cur) => opt('', 'Automatic (by date)', cur) + OCCASIONS.map((o) => opt(o.id, o.greet, cur)).join('');
const sw = (path, on, label, what) => `<label class="ws-row"><span><b>${esc(label)}</b>${what ? `<small>${esc(what)}</small>` : ''}</span><input type="checkbox" class="toggle" data-p="${path}" ${on ? 'checked' : ''}></label>`;
const field = (path, val, label, attrs = '') => `<label class="f">${esc(label)}<input data-p="${path}" value="${esc(val)}" ${attrs}></label>`;

function draw() {
  const c = cfg;
  const eff = effective(c);
  const h = [];
  h.push(`<div class="ws-now${eff.running.length || eff.banner ? ' on' : ''}"><b>Right now:</b> ${[
    eff.world ? `universe fixed to ${NAMES[eff.world]}` : 'universes shuffle',
    eff.edition ? `${EDITIONS[eff.edition]} colours` : 'colours by time',
    eff.motion.calm ? 'calm mode' : '',
    eff.banner ? 'banner showing' : '',
    eff.running.length ? `running: ${eff.running.join(', ')}` : '',
  ].filter(Boolean).map(esc).join(' · ')}</div>`);

  h.push(`<section class="card ws"><h2>Banner <small>your message at the top of the website</small></h2><div class="card-body">
    ${sw('banner.on', c.banner.on, 'Show the banner')}
    <label class="f">Message<textarea data-p="banner.text" rows="2" maxlength="220" placeholder="e.g. I’m open to frontend roles from January.">${esc(c.banner.text)}</textarea></label>
    <div class="row">${field('banner.link', c.banner.link, 'Link (optional)', 'placeholder="https://… or #contact"')}${field('banner.linkText', c.banner.linkText, 'Link text', 'placeholder="Contact"')}</div>
    <div class="row">
      <label class="f">Style<select data-p="banner.tone">${opt('info', 'Calm (blue)', c.banner.tone)}${opt('celebrate', 'Celebrate (yellow)', c.banner.tone)}${opt('warning', 'Important (red)', c.banner.tone)}</select></label>
      <label class="f">Where<select data-p="banner.where">${opt('all', 'Every page', c.banner.where)}${opt('home', 'Home page only', c.banner.where)}${opt('studio', 'Themes page only', c.banner.where)}</select></label>
    </div>
    <div class="row">${field('banner.from', c.banner.from, 'Show from (optional)', 'type="datetime-local"')}${field('banner.to', c.banner.to, 'Until (optional)', 'type="datetime-local"')}</div>
  </div></section>`);

  h.push(`<section class="card ws"><h2>Look <small>universes and colours</small></h2><div class="card-body">
    <div class="row">
      <label class="f">Universe<select data-p="theme.world">${worldOpts(c.theme.world, 'Automatic (shuffle)')}</select></label>
      <label class="f">Colours<select data-p="theme.edition">${edOpts(c.theme.edition)}</select></label>
    </div>
    <p class="legend">Saved changes reach pages visitors already have open within about 20 seconds — no refresh. Each universe is a whole website: its own fonts, cards, buttons and layout.</p>
    <p class="legend"><b>First open of a visit, by the visitor’s local time:</b> the day (from 5 am) is shared between the ticked universes, so each has its hours (none ticked = the five light ones). <b>Every refresh after that</b> shows another of all ${WORLDS.length}, and none repeats until every one has been seen.</p>
    <div class="ws-chips">${WORLDS.map((w) => `<label class="ws-chip${isDarkWorld(w) ? ' dark' : ''}"><input type="checkbox" data-uni="${w}" ${c.theme.universes.includes(w) ? 'checked' : ''}><span>${esc(NAMES[w])}</span></label>`).join('')}</div>
    <div class="adders"><button class="btn sm" type="button" data-ws="uni-all">All</button><button class="btn sm" type="button" data-ws="uni-light">Light only</button><button class="btn sm" type="button" data-ws="uni-dark">Dark only</button><button class="btn sm" type="button" data-ws="uni-kits">Signature looks</button></div>
  </div></section>`);

  h.push(`<section class="card ws"><h2>Animations <small>visitors can still turn things off for themselves</small></h2><div class="card-body">
    ${MOTION.map(([k, n, w, inverted]) => sw(`motion.${k}`, inverted ? c.motion[k] : c.motion[k] !== false, n, w)).join('')}
  </div></section>`);

  h.push(`<section class="card ws"><h2>Pip</h2><div class="card-body">
    ${sw('pip.on', c.pip.on !== false, 'Show Pip', 'The little guide who walks about and talks.')}
    ${field('pip.greeting', c.pip.greeting, 'Pip says (once per visit, optional)', 'maxlength="120" placeholder="e.g. Thrishank just shipped a new project!"')}
    <div class="row"><label class="f">Pip’s outfit<select data-p="pip.occasion">${occOpts(c.pip.occasion)}</select></label><span></span></div>
  </div></section>`);

  h.push(`<section class="card ws"><h2>Automations <small>run on their own by date, day or hour</small></h2><div class="card-body">
    <ol class="ws-autos">${(c.automations || []).map((a, i) => auto(a, i)).join('') || '<li class="empty">No automations yet. Start from a template:</li>'}</ol>
    <div class="adders">${TEMPLATES.map((t, i) => `<button class="btn sm" type="button" data-ws="tpl" data-i="${i}">+ ${esc(t.name)}</button>`).join('')}<button class="btn sm" type="button" data-ws="auto-add">+ Blank</button></div>
  </div></section>`);

  h.push(`<section class="card ws"><h2>Reports</h2><div class="card-body">
    ${sw('reports.on', c.reports.on !== false, 'Collect visits', 'Anonymous: place, device, page, where they came from, time spent. No cookies; the IP address is never stored.')}
    ${sw('reports.precise', c.reports.precise !== false, 'City, region and network', 'Looks up the visitor’s approximate city and internet provider from their IP with get.geojs.io (free). Off: only the country from their time zone.')}
  </div></section>`);
  $('#wsBody').innerHTML = h.join('');
  dirtyCheck();
}
function auto(a, i) {
  const d = a.do || {};
  const p = (k) => `automations.${i}.${k}`;
  return `<li class="item ws-auto${a.off ? ' off' : ''}">
    <div class="item-head"><input class="ws-auto-name" data-p="${p('name')}" value="${esc(a.name || '')}" placeholder="Name"><span class="sec-tools">
      <label class="check"><input type="checkbox" data-p="${p('off')}" data-invert ${a.off ? '' : 'checked'}> On</label>
      <button class="icon-btn" type="button" data-ws="auto-del" data-i="${i}" title="Delete">✕</button></span></div>
    <p class="legend">When</p>
    <div class="row">${field(p('from'), a.from || '', 'From (optional)', 'type="date"')}${field(p('to'), a.to || '', 'To (optional)', 'type="date"')}</div>
    <div class="ws-days">${DAYS.map((n, k) => `<label class="ws-chip"><input type="checkbox" data-day="${i}:${k}" ${(a.days || []).includes(k) ? 'checked' : ''}><span>${n}</span></label>`).join('')}<small class="legend">no day ticked = every day</small></div>
    <div class="row">
      <label class="f">From hour<select data-p="${p('hours.0')}">${opt('', 'All day', a.hours ? String(a.hours[0]) : '')}${[...Array(24)].map((_, hh) => opt(String(hh), `${String(hh).padStart(2, '0')}:00`, a.hours ? String(a.hours[0]) : '')).join('')}</select></label>
      <label class="f">To hour<select data-p="${p('hours.1')}">${opt('', '—', a.hours ? String(a.hours[1]) : '')}${[...Array(24)].map((_, hh) => opt(String(hh), `${String(hh).padStart(2, '0')}:00`, a.hours ? String(a.hours[1]) : '')).join('')}</select></label>
    </div>
    <p class="legend">Do</p>
    <div class="row">
      <label class="f">Universe<select data-p="${p('do.world')}">${worldOpts(d.world, '—')}</select></label>
      <label class="f">Colours<select data-p="${p('do.edition')}">${edOpts(d.edition, '—')}</select></label>
    </div>
    ${field(p('do.banner'), d.banner || '', 'Banner message')}
    <div class="row">${field(p('do.pipSay'), d.pipSay || '', 'Pip says')}<label class="f">Pip’s outfit<select data-p="${p('do.occasion')}">${opt('', '—', d.occasion)}${OCCASIONS.map((o) => opt(o.id, o.greet, d.occasion)).join('')}</select></label></div>
    <label class="check"><input type="checkbox" data-p="${p('do.calm')}" ${d.calm ? 'checked' : ''}> Calm mode</label>
  </li>`;
}

function setPath(path, value) {
  const k = path.split('.');
  let o = cfg;
  k.slice(0, -1).forEach((x, i) => { if (o[x] == null) o[x] = /^\d+$/.test(k[i + 1]) ? [] : {}; o = o[x]; });
  o[k[k.length - 1]] = value;
}
function clean(c) {
  const out = JSON.parse(JSON.stringify(c));
  (out.automations || []).forEach((a) => {
    if (a.hours && (a.hours[0] === '' || a.hours[1] === '' || a.hours[0] == null || a.hours[1] == null)) delete a.hours;
    else if (a.hours) a.hours = a.hours.map(Number);
    Object.keys(a.do || {}).forEach((k) => { if (a.do[k] === '' || a.do[k] === false) delete a.do[k]; });
  });
  return out;
}
const dirtyCheck = () => {
  const now = JSON.stringify(clean(cfg));
  $('#wsSave').disabled = now === saved;
  $('#wsStatus').textContent = now === saved ? 'Saved · live on the website' : 'Unsaved changes';
};

export async function initWebsite(ctx) {
  ({ F, toast, DEMO } = ctx);
  cfg = withDefaults({});
  try {
    if (!DEMO) { const s = await F.fs.getDoc(F.fs.doc(F.db, 'site', 'config')); if (s.exists()) cfg = withDefaults(JSON.parse(s.data().data)); }
  } catch (e) { $('#wsStatus').textContent = `Couldn’t load: ${e.code || e.message}`; }
  saved = JSON.stringify(clean(cfg));
  draw();
  const body = $('#wsBody');
  body.addEventListener('input', onInput);
  body.addEventListener('change', onInput);
  body.addEventListener('click', (e) => {
    const b = e.target.closest('[data-ws]'); if (!b) return;
    const a = b.dataset.ws;
    if (a === 'uni-all') cfg.theme.universes = [...WORLDS];
    else if (a === 'uni-light') cfg.theme.universes = [...BASE];
    else if (a === 'uni-dark') cfg.theme.universes = [...LOOP];
    else if (a === 'uni-kits') cfg.theme.universes = [...KITS];
    else if (a === 'tpl') cfg.automations = [...(cfg.automations || []), JSON.parse(JSON.stringify(TEMPLATES[+b.dataset.i]))];
    else if (a === 'auto-add') cfg.automations = [...(cfg.automations || []), { name: 'New automation', do: {} }];
    else if (a === 'auto-del') { if (!confirm('Delete this automation?')) return; cfg.automations.splice(+b.dataset.i, 1); }
    draw();
  });
  $('#wsSave').addEventListener('click', save);
  $('#wsReset').addEventListener('click', () => { if (confirm('Back to fully automatic (keeps nothing you set here)?')) { cfg = withDefaults({}); draw(); } });
}
function onInput(e) {
  const t = e.target;
  if (t.dataset.uni) {
    const set = new Set(cfg.theme.universes.length ? cfg.theme.universes : []);
    if (t.checked) set.add(t.dataset.uni); else set.delete(t.dataset.uni);
    cfg.theme.universes = [...set];   // the first-open rotation (none = the five light ones)
  } else if (t.dataset.day) {
    const [i, k] = t.dataset.day.split(':').map(Number);
    const a = cfg.automations[i]; const days = new Set(a.days || []);
    if (t.checked) days.add(k); else days.delete(k);
    a.days = [...days].sort();
  } else if (t.dataset.p) {
    let v = t.type === 'checkbox' ? t.checked : t.value;
    if (t.hasAttribute('data-invert')) v = !v;
    // switches stored as "on unless false"
    setPath(t.dataset.p, v);
    if (t.type === 'checkbox' || t.tagName === 'SELECT') { if (e.type === 'change') draw(); }
  }
  dirtyCheck();
}
async function save() {
  const data = clean(cfg);
  try {
    if (!DEMO) await F.fs.setDoc(F.fs.doc(F.db, 'site', 'config'), { data: JSON.stringify(data), updatedAt: F.fs.serverTimestamp() });
    saved = JSON.stringify(data);
    toast('Saved. Visitors get it on their next page load.');
  } catch (e) { toast(`Couldn’t save: ${e.code || e.message}`, 4000); }
  dirtyCheck();
}
export { DEFAULTS };
