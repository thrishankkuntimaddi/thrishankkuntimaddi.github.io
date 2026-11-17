/* =========================================================
   Studio → Reports: who opens the website, from where, on
   what, how long they stay and what they download. Reads the
   anonymous `visits` records written by lib/live.js.
   Place: city / region / network come from an IP lookup in
   the visitor's browser (the IP itself is never stored).
   Older records only have the time zone (e.g. "Calcutta"
   for everyone in India) and are marked "time zone".
   ========================================================= */
const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
import { NAMES } from '../worlds.js?v=22';
let F, toast, DEMO, rows = [], range = 7, loaded = false, tab = 'overview', person = '', openId = '';

const RANGES = [[1, 'Today'], [7, '7 days'], [30, '30 days'], [90, '90 days']];
const TABS = [['overview', 'Overview'], ['visits', 'Visits'], ['people', 'People']];
const since = (days) => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - (days - 1)); return d; };
const tsDate = (t) => (t?.toDate ? t.toDate() : t ? new Date(t) : null);
const dur = (s) => { s = Math.round(s || 0); if (!s) return '—'; if (s < 60) return `${s}s`; const m = Math.floor(s / 60); return m < 60 ? `${m}m ${String(s % 60).padStart(2, '0')}s` : `${Math.floor(m / 60)}h ${m % 60}m`; };
const when = (t) => new Date(t).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const PAGE = { home: 'Home', studio: 'Themes page', demo: 'Theme demo' };
const TYPE = { visit: 'Visit', resume: 'Resume ↓', kit: 'Theme kit ↓', message: 'Message sent' };
const ipBased = (r) => r.geo === 'ip';
const place = (r) => {
  const bits = ipBased(r) ? [r.city, r.region, r.country] : [r.country];
  return [...new Set(bits.filter(Boolean))].join(', ') || 'Unknown';
};
const mapUrl = (r) => (r.lat && r.lon ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${r.lat},${r.lon}`)}` : '');

function count(list, key) {
  const m = new Map();
  list.forEach((r) => { const k = (typeof key === 'function' ? key(r) : r[key]) || '—'; m.set(k, (m.get(k) || 0) + 1); });
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}
function bars(title, entries, max = 8, note = '') {
  const top = entries.slice(0, max), most = top[0]?.[1] || 1;
  return `<section class="card rp-card"><h3>${esc(title)}${note ? ` <small>${esc(note)}</small>` : ''}</h3>${top.length ? `<ul class="rp-bars">${top.map(([k, v]) => `<li><span class="rp-k" title="${esc(k)}">${esc(k)}</span><span class="rp-bar"><i style="width:${Math.max(4, (v / most) * 100)}%"></i></span><b>${v}</b></li>`).join('')}</ul>` : '<p class="empty">Nothing yet.</p>'}</section>`;
}
function perDay(visits) {
  if (range === 1) {
    const hrs = Array(24).fill(0); visits.forEach((r) => { hrs[new Date(r.at).getHours()]++; });
    const most = Math.max(1, ...hrs);
    return `<div class="rp-chart">${hrs.map((v, h) => `<span title="${String(h).padStart(2, '0')}:00 · ${v}"><i style="height:${(v / most) * 100}%"></i>${h % 6 === 0 ? `<em>${h}h</em>` : ''}</span>`).join('')}</div>`;
  }
  const days = [];
  for (let i = range - 1; i >= 0; i--) { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i); days.push(d); }
  const key = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  const m = new Map(days.map((d) => [key(d), 0]));
  visits.forEach((r) => { const k = key(new Date(r.at)); if (m.has(k)) m.set(k, m.get(k) + 1); });
  const vals = [...m.values()], most = Math.max(1, ...vals), step = Math.ceil(days.length / 8);
  return `<div class="rp-chart">${days.map((d, i) => `<span title="${d.toLocaleDateString()} · ${vals[i]}"><i style="height:${(vals[i] / most) * 100}%"></i>${i % step === 0 ? `<em>${d.getDate()}/${d.getMonth() + 1}</em>` : ''}</span>`).join('')}</div>`;
}

/* Join each visit with the "leave" record that followed it (same person, same page). */
function withStay(list) {
  const leaves = list.filter((r) => r.type === 'leave');
  return list.filter((r) => r.type !== 'leave').map((r) => {
    if (r.type !== 'visit') return r;
    const l = leaves.filter((x) => x.vid === r.vid && x.page === r.page && x.at >= r.at && x.at - r.at < 12 * 3600e3).sort((a, b) => a.at - b.at)[0];
    return l ? { ...r, secs: l.secs, scroll: l.scroll } : r;
  });
}

function detail(r) {
  const row = (k, v) => (v ? `<div><dt>${esc(k)}</dt><dd>${v}</dd></div>` : '');
  const map = mapUrl(r);
  return `<dl class="rp-detail">
    ${row('When', esc(new Date(r.at).toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })))}
    ${row('Place', `${esc(place(r))}${ipBased(r) ? ' <small>(approximate, from network)</small>' : ' <small>(from time zone only)</small>'}${map ? ` · <a href="${map}" target="_blank" rel="noopener">Map ↗</a>` : ''}`)}
    ${row('Time zone', esc(r.tz))}
    ${row('Network', esc(r.isp))}
    ${row('Device', esc([r.device, r.os, r.browser].filter(Boolean).join(' · ')))}
    ${row('Screen', esc(r.screen))}
    ${row('Language', esc(r.lang))}
    ${row('Came from', esc(r.type === 'visit' ? r.ref || 'Direct' : ''))}
    ${row('Page', esc(PAGE[r.page] || r.page))}
    ${row('Universe', esc(NAMES[r.world] || r.world))}
    ${row('Stayed', r.secs ? `${dur(r.secs)} · scrolled ${r.scroll || 0}%` : '')}
    ${row('Detail', esc(r.detail))}
    ${row('Visitor', `<button class="link" type="button" data-person="${esc(r.vid)}">#${esc(String(r.vid).slice(0, 6))}</button>${r.returning ? ' · came back' : ' · first time'}`)}
  </dl>`;
}
const recentList = (list, n = 60) => `<ul class="rp-recent">${list.slice(0, n).map((r) => {
  const id = r.id || `${r.at}${r.vid}`;
  return `<li class="${openId === id ? 'open' : ''}"><button class="rp-row" type="button" data-open="${esc(id)}">
    <time>${when(r.at)}</time>
    <span><b>${esc(TYPE[r.type] || r.type)}</b>${r.detail ? ` · ${esc(r.detail)}` : ''}${r.secs ? ` · ${dur(r.secs)}` : ''}</span>
    <span>${esc(place(r))}</span>
    <span>${esc(r.device)} · ${esc(r.os)}</span>
    <span>${esc(r.type === 'visit' ? r.ref || 'Direct' : '')}</span>
  </button>${openId === id ? detail(r) : ''}</li>`;
}).join('') || '<li class="empty">Nothing in this range yet.</li>'}</ul>`;

function people(list) {
  const m = new Map();
  list.forEach((r) => {
    const p = m.get(r.vid) || { vid: r.vid, visits: 0, secs: 0, resume: 0, kit: 0, message: 0, first: r.at, last: r.at, r };
    if (r.type === 'visit') { p.visits++; p.secs += r.secs || 0; } else if (p[r.type] != null) p[r.type]++;
    p.first = Math.min(p.first, r.at);
    if (r.at >= p.last) { p.last = r.at; if (r.type === 'visit' || !ipBased(p.r)) p.r = r; }
    m.set(r.vid, p);
  });
  return [...m.values()].sort((a, b) => b.last - a.last);
}

function draw() {
  $('#rpRanges').innerHTML = RANGES.map(([d, n]) => `<button class="chip" type="button" data-r="${d}" aria-selected="${range === d}">${n}</button>`).join('')
    + '<span class="rp-gap"></span>' + TABS.map(([k, n]) => `<button class="chip" type="button" data-t="${k}" aria-selected="${tab === k}">${n}</button>`).join('');
  const from = since(range).getTime();
  const list = withStay(rows.filter((r) => r.at >= from));
  const visits = list.filter((r) => r.type === 'visit');
  const ip = visits.filter(ipBased);
  const uniq = new Set(visits.map((r) => r.vid)).size;
  const returning = visits.filter((r) => r.returning).length;
  const stays = visits.filter((r) => r.secs);
  const kpi = (n, l) => `<div class="rp-kpi"><b>${n}</b><span>${l}</span></div>`;
  let body = '';
  if (tab === 'overview') {
    body = `
    <div class="rp-kpis">
      ${kpi(visits.length, 'visits')}${kpi(uniq, 'people')}${kpi(visits.length ? `${Math.round((returning / visits.length) * 100)}%` : '—', 'came back')}
      ${kpi(stays.length ? dur(stays.reduce((a, r) => a + r.secs, 0) / stays.length) : '—', 'average stay')}
      ${kpi(list.filter((r) => r.type === 'resume').length, 'resume downloads')}${kpi(list.filter((r) => r.type === 'kit').length, 'theme kit downloads')}${kpi(list.filter((r) => r.type === 'message').length, 'messages sent')}
    </div>
    <section class="card rp-card rp-wide"><h3>${range === 1 ? 'Visits by hour today' : 'Visits per day'}</h3>${perDay(visits)}</section>
    <div class="rp-grid">
      ${bars('Countries', count(visits, 'country'))}
      ${bars('States / regions', count(ip, 'region'), 8, ip.length < visits.length ? `${visits.length - ip.length} older visits have no region` : '')}
      ${bars('Cities', count(ip, (r) => [r.city, r.region].filter(Boolean).join(', ')))}
      ${bars('Internet provider', count(ip, 'isp'))}
      ${bars('Came from', count(visits, (r) => r.ref || 'Direct'))}
      ${bars('Device', count(visits, 'device'))}
      ${bars('System', count(visits, 'os'))}
      ${bars('Browser', count(visits, 'browser'))}
      ${bars('Screen size', count(visits.filter((r) => r.screen), 'screen'))}
      ${bars('Language', count(visits, 'lang'))}
      ${bars('How long they stayed', count(stays, (r) => (r.secs < 10 ? 'under 10s' : r.secs < 30 ? '10–30s' : r.secs < 60 ? '30s–1m' : r.secs < 180 ? '1–3m' : r.secs < 600 ? '3–10m' : 'over 10m')))}
      ${bars('How far they scrolled', count(stays, (r) => (r.scroll >= 90 ? 'to the end' : r.scroll >= 50 ? 'past half' : r.scroll >= 20 ? 'a little' : 'top only')))}
      ${bars('Page', count(visits, (r) => PAGE[r.page] || r.page))}
      ${bars('Universe they saw', count(visits, (r) => NAMES[r.world] || r.world))}
      ${bars('Theme kits taken', count(list.filter((r) => r.type === 'kit'), 'detail'))}
    </div>
    <section class="card rp-card rp-wide"><h3>Latest <small>tap one for details</small></h3>${recentList(list, 20)}</section>`;
  } else if (tab === 'visits') {
    const shown = person ? list.filter((r) => r.vid === person) : list;
    body = `<section class="card rp-card rp-wide"><h3>${person ? `Visitor #${esc(person.slice(0, 6))} <button class="link" type="button" data-person="">Show everyone</button>` : `Everything (${shown.length})`} <small>tap one for details</small></h3>${recentList(shown, 300)}</section>`;
  } else {
    const ps = people(list);
    body = `<section class="card rp-card rp-wide"><h3>People (${ps.length}) <small>one browser = one person; tap to see their visits</small></h3><ul class="rp-people">${ps.map((p) => `<li><button class="rp-row" type="button" data-person="${esc(p.vid)}">
      <span><b>#${esc(String(p.vid).slice(0, 6))}</b>${p.r.returning ? ' <small>returning</small>' : ''}</span>
      <span>${esc(place(p.r))}</span>
      <span>${esc(p.r.device)} · ${esc(p.r.os)} · ${esc(p.r.browser)}${p.r.isp ? ` · ${esc(p.r.isp)}` : ''}</span>
      <span>${p.visits} visit${p.visits === 1 ? '' : 's'}${p.secs ? ` · ${dur(p.secs)}` : ''}${p.resume ? ` · ${p.resume} resume ↓` : ''}${p.kit ? ` · ${p.kit} kit ↓` : ''}${p.message ? ` · ${p.message} message` : ''}</span>
      <time>Last ${when(p.last)}</time>
    </button></li>`).join('') || '<li class="empty">Nobody in this range yet.</li>'}</ul></section>`;
  }
  $('#rpBody').innerHTML = body;
  $('#rpStatus').textContent = `${rows.length} records loaded · anonymous, no cookies, IP never stored`;
}

async function load() {
  $('#rpStatus').textContent = 'Loading…';
  if (DEMO) {
    const C = [['India', 'Hyderabad', 'Telangana', 'Jio', '17.4', '78.5'], ['India', 'Bengaluru', 'Karnataka', 'Airtel', '13.0', '77.6'], ['United States', 'Seattle', 'Washington', 'Comcast', '47.6', '-122.3'], ['United Kingdom', 'London', 'England', 'BT', '51.5', '-0.1'], ['India', 'Calcutta', '', '', '', '']];
    const R = ['LinkedIn', 'Direct', 'Google', 'GitHub', 'Direct'];
    rows = [...Array(140)].map((_, i) => { const c = C[i % 5]; return { id: `d${i}`, type: i % 11 === 0 ? 'resume' : i % 13 === 0 ? 'kit' : i % 4 === 1 ? 'leave' : 'visit', at: Date.now() - (i / 140) * 30 * 864e5, country: c[0], city: c[1], region: c[2], isp: c[3], lat: c[4], lon: c[5], geo: c[2] ? 'ip' : 'tz', tz: 'Asia/Kolkata', device: ['Phone', 'Desktop', 'Tablet'][i % 3], os: ['Android', 'macOS', 'iOS', 'Windows'][i % 4], browser: 'Chrome', screen: ['412×915', '1512×982', '390×844'][i % 3], lang: 'en-IN', ref: R[i % 5], page: 'home', world: ['paper', 'pixel', 'fire'][i % 3], vid: String(i % 30), returning: i % 3 === 0, detail: i % 13 === 0 ? 'fire:zip' : '', secs: (i * 37) % 400, scroll: (i * 13) % 101 }; }).sort((a, b) => b.at - a.at);
  } else {
    try {
      const q = F.fs.query(F.fs.collection(F.db, 'visits'), F.fs.where('at', '>=', since(90)), F.fs.orderBy('at', 'desc'), F.fs.limit(5000));
      const snap = await F.fs.getDocs(q);
      rows = snap.docs.map((d) => ({ id: d.id, ...d.data(), at: tsDate(d.data().at)?.getTime() || 0 }));
    } catch (e) { $('#rpStatus').textContent = `Couldn’t load: ${e.code || e.message}`; return; }
  }
  loaded = true;
  draw();
}

export function initReports(ctx) {
  ({ F, toast, DEMO } = ctx);
  $('#rpRanges').addEventListener('click', (e) => {
    const b = e.target.closest('[data-r]'); if (b) { range = +b.dataset.r; draw(); return; }
    const t = e.target.closest('[data-t]'); if (t) { tab = t.dataset.t; if (tab !== 'visits') person = ''; draw(); }
  });
  $('#rpBody').addEventListener('click', (e) => {
    const p = e.target.closest('[data-person]');
    if (p) { person = p.dataset.person; tab = person ? 'visits' : tab; openId = ''; draw(); window.scrollTo(0, 0); return; }
    const o = e.target.closest('[data-open]');
    if (o) { openId = openId === o.dataset.open ? '' : o.dataset.open; draw(); }
  });
  $('#rpRefresh').addEventListener('click', load);
  $('#rpPrune').addEventListener('click', async () => {
    if (DEMO) return;
    if (!confirm('Delete visit records older than 90 days? (Keeps the free database small.)')) return;
    try {
      const q = F.fs.query(F.fs.collection(F.db, 'visits'), F.fs.where('at', '<', since(90)), F.fs.limit(450));
      const snap = await F.fs.getDocs(q);
      const b = F.fs.writeBatch(F.db); snap.docs.forEach((d) => b.delete(d.ref)); await b.commit();
      toast(`Deleted ${snap.size} old records`);
    } catch (e) { toast(e.code || e.message); }
  });
}
export function showReports() { if (!loaded) load(); }
