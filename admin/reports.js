/* =========================================================
   Studio → Reports: who opens the website, from where, on
   what, and what they download. Reads the anonymous
   `visits` records written by lib/live.js.
   ========================================================= */
const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
import { NAMES } from '../worlds.js?v=22';
let F, toast, DEMO, rows = [], range = 7, loaded = false;

const RANGES = [[1, 'Today'], [7, '7 days'], [30, '30 days'], [90, '90 days']];
const since = (days) => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - (days - 1)); return d; };
const tsDate = (t) => (t?.toDate ? t.toDate() : t ? new Date(t) : null);

function count(list, key) {
  const m = new Map();
  list.forEach((r) => { const k = (typeof key === 'function' ? key(r) : r[key]) || '—'; m.set(k, (m.get(k) || 0) + 1); });
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}
function bars(title, entries, max = 8) {
  const top = entries.slice(0, max), most = top[0]?.[1] || 1;
  return `<section class="card rp-card"><h3>${esc(title)}</h3>${top.length ? `<ul class="rp-bars">${top.map(([k, v]) => `<li><span class="rp-k">${esc(k)}</span><span class="rp-bar"><i style="width:${Math.max(4, (v / most) * 100)}%"></i></span><b>${v}</b></li>`).join('')}</ul>` : '<p class="empty">Nothing yet.</p>'}</section>`;
}
function perDay(visits) {
  const days = [];
  for (let i = range - 1; i >= 0; i--) { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i); days.push(d); }
  const key = (d) => d.toISOString().slice(0, 10);
  const m = new Map(days.map((d) => [key(d), 0]));
  visits.forEach((r) => { const d = new Date(r.at); d.setHours(0, 0, 0, 0); const k = key(d); if (m.has(k)) m.set(k, m.get(k) + 1); });
  if (range === 1) { // by hour
    const hrs = Array(24).fill(0); visits.forEach((r) => { hrs[new Date(r.at).getHours()]++; });
    const most = Math.max(1, ...hrs);
    return `<div class="rp-chart">${hrs.map((v, h) => `<span title="${String(h).padStart(2, '0')}:00 · ${v}"><i style="height:${(v / most) * 100}%"></i>${h % 6 === 0 ? `<em>${h}h</em>` : ''}</span>`).join('')}</div>`;
  }
  const vals = [...m.values()], most = Math.max(1, ...vals), step = Math.ceil(days.length / 8);
  return `<div class="rp-chart">${days.map((d, i) => `<span title="${d.toLocaleDateString()} · ${vals[i]}"><i style="height:${(vals[i] / most) * 100}%"></i>${i % step === 0 ? `<em>${d.getDate()}/${d.getMonth() + 1}</em>` : ''}</span>`).join('')}</div>`;
}

function draw() {
  $('#rpRanges').innerHTML = RANGES.map(([d, n]) => `<button class="chip" type="button" data-r="${d}" aria-selected="${range === d}">${n}</button>`).join('');
  const from = since(range).getTime();
  const list = rows.filter((r) => r.at >= from);
  const visits = list.filter((r) => r.type === 'visit');
  const uniq = new Set(visits.map((r) => r.vid)).size;
  const returning = visits.filter((r) => r.returning).length;
  const kpi = (n, l) => `<div class="rp-kpi"><b>${n}</b><span>${l}</span></div>`;
  $('#rpBody').innerHTML = `
    <div class="rp-kpis">
      ${kpi(visits.length, 'visits')}${kpi(uniq, 'people')}${kpi(visits.length ? `${Math.round((returning / visits.length) * 100)}%` : '—', 'came back')}
      ${kpi(list.filter((r) => r.type === 'resume').length, 'resume downloads')}${kpi(list.filter((r) => r.type === 'kit').length, 'theme kit downloads')}${kpi(list.filter((r) => r.type === 'message').length, 'messages sent')}
    </div>
    <section class="card rp-card rp-wide"><h3>${range === 1 ? 'Visits by hour today' : 'Visits per day'}</h3>${perDay(visits)}</section>
    <div class="rp-grid">
      ${bars('Countries', count(visits, 'country'))}
      ${bars('Cities (time zone)', count(visits, 'city'))}
      ${bars('Came from', count(visits, (r) => r.ref || 'Direct'))}
      ${bars('Device', count(visits, 'device'))}
      ${bars('System', count(visits, 'os'))}
      ${bars('Browser', count(visits, 'browser'))}
      ${bars('Page', count(visits, (r) => ({ home: 'Home', studio: 'Themes page', demo: 'Theme demo' }[r.page] || r.page)))}
      ${bars('Universe they saw', count(visits, (r) => NAMES[r.world] || r.world))}
      ${bars('Theme kits taken', count(list.filter((r) => r.type === 'kit'), 'detail'))}
    </div>
    <section class="card rp-card rp-wide"><h3>Latest</h3><ul class="rp-recent">${list.slice(0, 30).map((r) => `<li><time>${new Date(r.at).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</time><span>${esc({ visit: 'Visit', resume: 'Resume ↓', kit: 'Kit ↓', message: 'Message' }[r.type] || r.type)}${r.detail ? ` · ${esc(r.detail)}` : ''}</span><span>${esc(r.city)}, ${esc(r.country)}</span><span>${esc(r.device)} · ${esc(r.os)}</span><span>${esc(r.ref || '')}</span></li>`).join('') || '<li class="empty">No visits in this range yet.</li>'}</ul></section>`;
  $('#rpStatus').textContent = `${rows.length} records loaded · anonymous, no cookies or IP`;
}

async function load() {
  $('#rpStatus').textContent = 'Loading…';
  if (DEMO) {
    const C = [['India', 'Kolkata'], ['India', 'Kolkata'], ['United States', 'New York'], ['United Kingdom', 'London'], ['Singapore', 'Singapore']];
    const R = ['LinkedIn', 'Direct', 'Google', 'GitHub', 'Direct'];
    rows = [...Array(140)].map((_, i) => { const c = C[i % 5]; return { type: i % 11 === 0 ? 'resume' : i % 13 === 0 ? 'kit' : 'visit', at: Date.now() - Math.random() * 30 * 864e5, country: c[0], city: c[1], device: ['Phone', 'Desktop', 'Tablet'][i % 3], os: ['Android', 'macOS', 'iOS', 'Windows'][i % 4], browser: 'Chrome', ref: R[i % 5], page: i % 4 ? 'home' : 'studio', world: ['paper', 'pixel', 'fire'][i % 3], vid: String(i % 60), returning: i % 3 === 0, detail: i % 13 === 0 ? 'fire:zip' : '' }; }).sort((a, b) => b.at - a.at);
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
  $('#rpRanges').addEventListener('click', (e) => { const b = e.target.closest('[data-r]'); if (b) { range = +b.dataset.r; draw(); } });
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
