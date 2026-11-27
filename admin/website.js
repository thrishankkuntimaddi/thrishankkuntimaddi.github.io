/* =========================================================
   Studio → Website: control the live site from the app.
   Saved to site/config as JSON (public read, owner write).
   ========================================================= */
import { DEFAULTS, withDefaults, effective, encodePreview } from '../lib/site-config.js?v=5';
import { STANDARD, BASE, LOOP, KITS, NAMES, isDarkWorld } from '../worlds.js?v=24';
import { OCCASIONS } from '../content.js?v=22';

const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const WORLDS = [STANDARD, ...BASE, ...LOOP, ...KITS];
const dark = (w) => w !== STANDARD && isDarkWorld(w); // Standard is light by day, dark by night
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

// Standard design options (the site applies them in standard.js; keep the font ids in step)
const FONTS = [ // id, name, CSS stack (single quotes: it goes into a style attribute), weight, Google Fonts axes
  ['instrument', 'Instrument Serif', "'Instrument Serif', Georgia, serif", 400, 'ital@0;1'], ['fraunces', 'Fraunces', "'Fraunces', Georgia, serif", 400, 'ital,wght@0,400;1,400'],
  ['newsreader', 'Newsreader', "'Newsreader', Georgia, serif", 400, 'ital,wght@0,400;1,400'], ['cormorant', 'Cormorant Garamond', "'Cormorant Garamond', Georgia, serif", 500, 'ital,wght@0,500;1,500'],
  ['playfair', 'Playfair Display', "'Playfair Display', Georgia, serif", 600, 'ital,wght@0,600;1,600'], ['grotesk', 'Space Grotesk', "'Space Grotesk', system-ui, sans-serif", 500, 'wght@500'],
  ['sora', 'Sora', "'Sora', system-ui, sans-serif", 400, 'wght@400'], ['bricolage', 'Bricolage Grotesque', "'Bricolage Grotesque', system-ui, sans-serif", 700, 'wght@700']];
const ACCENTS = [['', 'Vermilion', '#B8432A'], ['#2F4BB5', 'Ink blue', '#2F4BB5'], ['#2E6B4F', 'Forest', '#2E6B4F'], ['#6E3A73', 'Plum', '#6E3A73'], ['#A86F1C', 'Ochre', '#A86F1C'], ['#0E7C86', 'Teal', '#0E7C86'], ['#3A3A3A', 'Graphite', '#3A3A3A']];
const ZONES = [['Asia/Kolkata', 'India (IST)'], ['Asia/Dubai', 'Dubai'], ['Asia/Singapore', 'Singapore'], ['Asia/Tokyo', 'Tokyo'], ['Europe/London', 'London'], ['Europe/Berlin', 'Berlin'], ['America/New_York', 'New York'], ['America/Los_Angeles', 'San Francisco'], ['Australia/Sydney', 'Sydney']];
const SHOW = [['portrait', 'Portrait', 'Your photo with the TK seal.'], ['facts', 'Numbers', '6 live products · 5 platforms · 1,091 commits.'], ['ticker', 'Skills band', 'The quiet moving line of skills.'],
  ['poelys', 'Poelys', 'Your studio section.'], ['more', 'More work', 'The index of smaller builds.'], ['about', 'About', 'Bio, spec sheet, recognition, path.'],
  ['kind', 'Kind words', 'Compliments you chose to show.'], ['resume', 'Resume', 'The tabbed resume near the end.'], ['quick', '“In a hurry?” links', 'The 30-second version and quick-read page.']];
const SITE_URL = window.Capacitor?.isNativePlatform?.() || !/^https?:$/.test(location.protocol) ? 'https://thrishankkuntimaddi.web.app/' : new URL('../', location.href).href;
let fontLinks = new Set();
function loadFont(f) { // show the chosen typeface in the sample (only the CSS is fetched)
  if (fontLinks.has(f[0])) return; fontLinks.add(f[0]);
  const l = document.createElement('link'); l.rel = 'stylesheet';
  l.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(f[1])}:${f[4]}&display=swap`;
  document.head.append(l);
}

let F, toast, DEMO, cfg, saved = '', draftSaved = '', history = [];

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
    eff.world ? `universe fixed to ${NAMES[eff.world]}` : c.theme.standardFirst === false ? 'first open by time of day' : 'opens on Standard',
    eff.edition ? `${EDITIONS[eff.edition]} colours` : 'colours by time',
    eff.motion.calm ? 'calm mode' : '',
    eff.banner ? 'banner showing' : '',
    eff.running.length ? `running: ${eff.running.join(', ')}` : '',
  ].filter(Boolean).map(esc).join(' · ')}</div>`);

  const sd = c.standard, show = sd.show || {};
  const font = FONTS.find((f) => f[0] === sd.font) || FONTS[0];
  loadFont(font);
  const accent = /^#[0-9a-f]{6}$/i.test(sd.accent || '') ? sd.accent : '#B8432A';
  const lineHTML = (t, def) => esc(t || def).replace(/\*([^*]+)\*/g, '<em>$1</em>');
  const sample = (dark) => `<div class="std-tile${dark ? ' dark' : ''}" style="--seal:${accent};--f:${font[2]};--fw:${font[3]}">
      <p class="st-top"><i>TK</i><span>${esc([sd.city, sd.clock !== false ? '20:30' : '', sd.status].filter(Boolean).join(' · ') || 'Thrishank Kuntimaddi')}</span></p>
      <p class="st-h">${lineHTML(sd.h2, 'I design and build *interfaces*')}<br>${lineHTML(sd.h3, 'that feel considered, end to end.')}</p>
      <p class="st-b"><b>Selected work ↓</b><u>Email me</u></p><small>${dark ? 'Night' : 'Day'}</small></div>`;
  const tiles = sd.tone === 'light' ? sample(false) : sd.tone === 'dark' ? sample(true) : sample(false) + sample(true);
  h.push(`<section class="card ws std-card"><h2>Standard design <small>the calm, premium look every visit opens on</small></h2><div class="card-body">
    <div class="std-tiles">${tiles}</div>
    ${sw('theme.standardFirst', c.theme.standardFirst !== false, 'Open every visit on Standard', 'Off: the first open follows the time of day through the universes ticked under Look.')}
    ${sw('standard.stay', !!sd.stay, 'Stay on Standard when visitors refresh', 'Off: every refresh glitches into another universe.')}
    <p class="legend"><b>Tone</b></p>
    <div class="ws-chips">${[['auto', 'Automatic (light by day, dark 6 pm – 6 am)'], ['light', 'Always light'], ['dark', 'Always dark']].map(([v, n]) => `<label class="ws-chip"><input type="radio" name="stdTone" data-p="standard.tone" value="${v}" ${(sd.tone || 'auto') === v ? 'checked' : ''}><span>${n}</span></label>`).join('')}</div>
    <p class="legend"><b>Accent</b> <small>the seal, links and highlighted words</small></p>
    <div class="ws-chips std-swatches">${ACCENTS.map(([v, n, hex]) => `<label class="ws-chip sw-chip" title="${n}"><input type="radio" name="stdAccent" data-p="standard.accent" value="${v}" ${(sd.accent || '') === v ? 'checked' : ''}><span><i style="background:${hex}"></i>${n}</span></label>`).join('')}
      <label class="ws-chip sw-chip" title="Your own colour"><input type="color" data-p="standard.accent" value="${accent}"><span><i style="background:${accent}"></i>Custom</span></label></div>
    <div class="row">
      <label class="f">Heading font<select data-p="standard.font">${FONTS.map(([v, n]) => opt(v, n, sd.font || 'instrument')).join('')}</select></label>
      <span></span>
    </div>
    <div class="row">${field('standard.h2', sd.h2, 'Headline, line 1', 'maxlength="80" placeholder="I design and build *interfaces*"')}${field('standard.h3', sd.h3, 'Headline, line 2', 'maxlength="80" placeholder="that feel considered, end to end."')}</div>
    <p class="legend">Put a word between stars, like <b>*interfaces*</b>, to set it in the accent italic. Empty = the default.</p>
    <p class="legend"><b>The line in the menu bar</b></p>
    <div class="row">${field('standard.status', sd.status, 'Status', 'maxlength="40" placeholder="Open to work"')}${field('standard.city', sd.city, 'City', 'maxlength="30" placeholder="Bengaluru"')}</div>
    <div class="row"><label class="f">Clock time zone<select data-p="standard.tz">${ZONES.map(([v, n]) => opt(v, n, sd.tz || 'Asia/Kolkata')).join('')}</select></label><span></span></div>
    ${sw('standard.clock', sd.clock !== false, 'Show the live clock', 'Your local time next to the city.')}
    <p class="legend"><b>Sections</b></p>
    ${SHOW.map(([k, n, w]) => sw(`standard.show.${k}`, show[k] !== false, n, w)).join('')}
    <p class="legend"><b>Moving to other universes</b></p>
    ${sw('standard.shift', sd.shift !== false, '“Shift universe ↯” in the footer', 'A deliberate glitch into another universe.')}
    <div class="row"><label class="f">Shift goes to<select data-p="standard.shiftTo">${opt('all', 'Any universe', sd.shiftTo || 'all')}${opt('light', 'Light ones only', sd.shiftTo)}${opt('dark', 'Dark ones only', sd.shiftTo)}${opt('kits', 'Signature looks', sd.shiftTo)}</select></label><span></span></div>
    ${sw('standard.endGlitch', sd.endGlitch !== false, 'Glitch at the very end of the page', 'Reaching the bottom changes the theme and starts the game.')}
  </div></section>`);

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
    <p class="legend"><b>First open of a visit:</b> ${c.theme.standardFirst === false ? 'by the visitor’s local time. The day (from 5 am) is shared between the ticked universes, so each has its hours (none ticked = the five light ones).' : 'Standard. (Turn the switch off to share the day between the ticked universes instead.)'} <b>Every refresh after that</b> shows another of all ${WORLDS.length}, and none repeats until every one has been seen.</p>
    <div class="ws-chips"${c.theme.standardFirst === false ? '' : ' style="opacity:.55"'}>${WORLDS.map((w) => `<label class="ws-chip${dark(w) ? ' dark' : ''}"><input type="checkbox" data-uni="${w}" ${c.theme.universes.includes(w) ? 'checked' : ''}><span>${esc(NAMES[w])}</span></label>`).join('')}</div>
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
  h.push(`<section class="card ws"><h2>Published versions <small>every Publish is kept; restore any of them</small></h2><div class="card-body">
    ${DEMO ? '<p class="legend">Not saved in demo mode.</p>' : history.length ? `<ol class="ws-hist">${history.map((v, i) => `<li><span><b>${esc(v.when)}</b><small>${esc(v.note || '')}</small></span>${i === 0 ? '<em>Live</em>' : `<button class="btn sm" type="button" data-ws="restore" data-i="${i}">Restore</button>`}</li>`).join('')}</ol>` : '<p class="legend">Nothing published from here yet. Your first Publish starts the history.</p>'}
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
  $('#wsDraft').disabled = now === saved || now === draftSaved;
  $('#wsStatus').textContent = now === saved ? 'Published · live on the website' : now === draftSaved ? 'Draft saved · not live yet. Preview it, then Publish.' : 'Unsaved changes · Preview, save a draft or Publish';
  $('#wsStatus').classList.toggle('warn', now !== saved);
};
// What changed between two configs, in words (for the history)
function changes(a, b) {
  const names = { theme: 'look', motion: 'animations', pip: 'Pip', banner: 'banner', automations: 'automations', reports: 'reports', standard: 'Standard design' };
  const out = Object.keys(names).filter((k) => JSON.stringify(a?.[k] ?? null) !== JSON.stringify(b?.[k] ?? null)).map((k) => names[k]);
  return out.length ? `Changed: ${out.join(', ')}` : 'No changes';
}
async function loadHistory() {
  if (DEMO) return;
  try {
    const snap = await F.fs.getDocs(F.fs.query(F.fs.collection(F.db, 'siteVersions'), F.fs.orderBy('at', 'desc'), F.fs.limit(20)));
    history = snap.docs.map((d) => { const v = d.data(); const at = v.at?.toDate?.(); return { id: d.id, data: v.data, note: v.note, when: at ? at.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Just now' }; });
  } catch (e) { history = []; console.warn('[website] history', e); }
}

export async function initWebsite(ctx) {
  ({ F, toast, DEMO } = ctx);
  cfg = withDefaults({});
  let draft = null;
  try {
    if (!DEMO) {
      const [s, d] = await Promise.all([F.fs.getDoc(F.fs.doc(F.db, 'site', 'config')), F.fs.getDoc(F.fs.doc(F.db, 'private', 'siteDraft')).catch(() => null)]);
      if (s.exists()) cfg = withDefaults(JSON.parse(s.data().data));
      if (d?.exists()) draft = withDefaults(JSON.parse(d.data().data));
    }
  } catch (e) { $('#wsStatus').textContent = `Couldn’t load: ${e.code || e.message}`; }
  saved = JSON.stringify(clean(cfg));
  if (draft && JSON.stringify(clean(draft)) !== saved) { cfg = draft; draftSaved = JSON.stringify(clean(draft)); toast('Your saved draft is open. It isn’t live until you Publish.', 3600); }
  await loadHistory();
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
    else if (a === 'restore') { const v = history[+b.dataset.i]; if (!v || !confirm(`Load the version from ${v.when}? Nothing changes on the website until you Publish.`)) return; cfg = withDefaults(JSON.parse(v.data)); toast('Loaded. Preview it, then Publish to make it live.'); }
    draw();
  });
  $('#wsSave').addEventListener('click', save);
  $('#wsDraft').addEventListener('click', saveDraft);
  $('#wsPreview').addEventListener('click', () => {
    const url = `${SITE_URL}#preview=${encodePreview(clean(cfg))}`;
    if (url.length > 60000) { toast('This draft is too big to preview by link. Save and publish it instead.', 4000); return; }
    window.open(url, '_blank', 'noopener');
  });
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
    if (t.type === 'radio' && !t.checked) return;
    if (t.hasAttribute('data-invert')) v = !v;
    // switches stored as "on unless false"
    setPath(t.dataset.p, v);
    if (t.type === 'checkbox' || t.type === 'radio' || t.type === 'color' || t.tagName === 'SELECT') { if (e.type === 'change') draw(); }
    else if (/^standard\.(h2|h3|status|city)$/.test(t.dataset.p)) refreshSample();
  }
  dirtyCheck();
}
// Publish: live for everyone (open pages pick it up within ~20 s), kept in the history, draft cleared.
async function save() {
  const data = clean(cfg), json = JSON.stringify(data);
  if (!confirm('Publish these settings to the live website now?')) return;
  try {
    if (!DEMO) {
      const note = changes(saved ? JSON.parse(saved) : {}, data);
      await F.fs.setDoc(F.fs.doc(F.db, 'site', 'config'), { data: json, updatedAt: F.fs.serverTimestamp() });
      await F.fs.addDoc(F.fs.collection(F.db, 'siteVersions'), { data: json, note, at: F.fs.serverTimestamp() }).catch((e) => console.warn('[website] version', e));
      await F.fs.deleteDoc(F.fs.doc(F.db, 'private', 'siteDraft')).catch(() => {});
    }
    saved = json; draftSaved = '';
    toast('Published. It’s live: open pages update within about 20 seconds.');
    await loadHistory(); draw();
  } catch (e) { toast(`Couldn’t publish: ${e.code || e.message}`, 4000); }
  dirtyCheck();
}
// Save draft: private, only you see it (in the Studio and in Preview).
async function saveDraft() {
  const json = JSON.stringify(clean(cfg));
  try {
    if (!DEMO) await F.fs.setDoc(F.fs.doc(F.db, 'private', 'siteDraft'), { data: json, updatedAt: F.fs.serverTimestamp() });
    draftSaved = json;
    toast('Draft saved. Nothing changed on the website.');
  } catch (e) { toast(`Couldn’t save the draft: ${e.code || e.message}`, 4000); }
  dirtyCheck();
}
// Typing in the headline or status updates the sample without redrawing the form (keeps the cursor).
function refreshSample() {
  const tiles = $('.std-tiles'); if (!tiles) return;
  const sd = cfg.standard, esc2 = (t, d) => esc(t || d).replace(/\*([^*]+)\*/g, '<em>$1</em>');
  tiles.querySelectorAll('.st-h').forEach((el) => { el.innerHTML = `${esc2(sd.h2, 'I design and build *interfaces*')}<br>${esc2(sd.h3, 'that feel considered, end to end.')}`; });
  tiles.querySelectorAll('.st-top span').forEach((el) => { el.textContent = [sd.city, sd.clock !== false ? '20:30' : '', sd.status].filter(Boolean).join(' · ') || 'Thrishank Kuntimaddi'; });
}
export { DEFAULTS };
