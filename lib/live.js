/* =========================================================
   Things the owner controls live from the Studio app:
   - the banner (your message on the website)
   - visit reports: one small anonymous record per visit and
     per resume/kit download, and one when they leave (time
     spent, how far they scrolled). No cookies. The city,
     region and network come from a free IP lookup
     (get.geojs.io) in the visitor's browser; the IP address
     itself is never stored. Without it, the country is
     guessed from the time zone. Turned off from the app with
     Website → "Collect visits".
   ========================================================= */
import { load, effective } from './site-config.js?v=3';
import { forCode } from './tailored.js?v=1';

const PROJECT = 'projects/myprofile-f29f5/databases/(default)/documents';
const KEY = 'AIzaSyBWggoAjGHu3wdtY5MX3k3xxVzLha3A1zE';
const path = location.pathname;
const page = /universes/.test(path) ? 'studio' : /kits\//.test(path) ? 'demo' : /read(\.html)?$/.test(path) ? 'read' : /notes(\.html)?$/.test(path) ? 'notes' : 'home';
const linkCode = forCode(); // a tailored link (?for=…), remembered for the tab
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------- Time zone -> country (the common ones; others show the zone's region) ---------- */
const TZ = {
  Kolkata: 'India', Calcutta: 'India', Dhaka: 'Bangladesh', Karachi: 'Pakistan', Kathmandu: 'Nepal', Colombo: 'Sri Lanka', Dubai: 'UAE', Riyadh: 'Saudi Arabia', Qatar: 'Qatar', Kuwait: 'Kuwait', Muscat: 'Oman', Bahrain: 'Bahrain',
  Singapore: 'Singapore', Kuala_Lumpur: 'Malaysia', Jakarta: 'Indonesia', Bangkok: 'Thailand', Manila: 'Philippines', Ho_Chi_Minh: 'Vietnam', Saigon: 'Vietnam', Hong_Kong: 'Hong Kong', Shanghai: 'China', Taipei: 'Taiwan', Tokyo: 'Japan', Seoul: 'South Korea',
  Sydney: 'Australia', Melbourne: 'Australia', Brisbane: 'Australia', Perth: 'Australia', Adelaide: 'Australia', Auckland: 'New Zealand',
  London: 'United Kingdom', Dublin: 'Ireland', Paris: 'France', Berlin: 'Germany', Amsterdam: 'Netherlands', Brussels: 'Belgium', Madrid: 'Spain', Lisbon: 'Portugal', Rome: 'Italy', Zurich: 'Switzerland', Vienna: 'Austria', Stockholm: 'Sweden', Oslo: 'Norway', Copenhagen: 'Denmark', Helsinki: 'Finland', Warsaw: 'Poland', Prague: 'Czechia', Budapest: 'Hungary', Athens: 'Greece', Istanbul: 'Türkiye', Moscow: 'Russia', Kiev: 'Ukraine', Kyiv: 'Ukraine', Bucharest: 'Romania',
  New_York: 'United States', Chicago: 'United States', Denver: 'United States', Los_Angeles: 'United States', Phoenix: 'United States', Anchorage: 'United States', Detroit: 'United States', Honolulu: 'United States',
  Toronto: 'Canada', Vancouver: 'Canada', Edmonton: 'Canada', Winnipeg: 'Canada', Halifax: 'Canada', Mexico_City: 'Mexico', Sao_Paulo: 'Brazil', Buenos_Aires: 'Argentina', Santiago: 'Chile', Bogota: 'Colombia', Lima: 'Peru',
  Lagos: 'Nigeria', Nairobi: 'Kenya', Cairo: 'Egypt', Johannesburg: 'South Africa', Casablanca: 'Morocco', Accra: 'Ghana',
};
function where() {
  let tz = '';
  try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch { /* old browser */ }
  const city = tz.split('/').pop() || '';
  return { tz, country: TZ[city] || (tz.split('/')[0] || 'Unknown'), city: city.replace(/_/g, ' ') };
}
/* Approximate place from the visitor's IP (free, no key). Cached for the session. */
let geoP = null;
function geo(precise) {
  if (!precise) return Promise.resolve(null);
  if (geoP) return geoP;
  try { const c = sessionStorage.getItem('tk-geo'); if (c) return (geoP = Promise.resolve(JSON.parse(c))); } catch { /* fine */ }
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 3000);
  geoP = fetch('https://get.geojs.io/v1/ip/geo.json', { signal: ctl.signal, credentials: 'omit', referrerPolicy: 'no-referrer' }).then((r) => r.json()).then((g) => {
    const round = (v) => (v == null || v === '' || Number.isNaN(+v) ? '' : (+v).toFixed(1));
    const out = { city: g.city || '', region: g.region || '', country: g.country || '', isp: String(g.organization_name || '').slice(0, 80), lat: round(g.latitude), lon: round(g.longitude) };
    try { sessionStorage.setItem('tk-geo', JSON.stringify(out)); } catch { /* fine */ }
    return out;
  }).catch(() => null).finally(() => clearTimeout(t));
  return geoP;
}
function device() {
  const ua = navigator.userAgent;
  const tablet = /iPad|Tablet/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) || (/Android/.test(ua) && !/Mobile/.test(ua));
  const kind = tablet ? 'Tablet' : /Mobi|iPhone|Android/.test(ua) ? 'Phone' : 'Desktop';
  const os = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) ? 'iOS' : /Android/.test(ua) ? 'Android' : /Mac OS X/.test(ua) ? 'macOS' : /Windows/.test(ua) ? 'Windows' : /CrOS/.test(ua) ? 'ChromeOS' : /Linux/.test(ua) ? 'Linux' : 'Other';
  const browser = /Edg\//.test(ua) ? 'Edge' : /OPR\//.test(ua) ? 'Opera' : /SamsungBrowser/.test(ua) ? 'Samsung' : /Firefox\//.test(ua) ? 'Firefox' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : 'Other';
  return { kind, os, browser };
}
function referrer() {
  try {
    const params = new URLSearchParams(location.search);
    const utm = params.get('utm_source') || params.get('ref');
    if (utm) return utm.slice(0, 60);
    if (!document.referrer) return 'Direct';
    const h = new URL(document.referrer).hostname.replace(/^www\./, '');
    if (h === location.hostname) return '';
    return /linkedin/.test(h) ? 'LinkedIn' : /google\./.test(h) ? 'Google' : /github/.test(h) ? 'GitHub' : /(t\.co|twitter|x\.com)/.test(h) ? 'X / Twitter' : /instagram/.test(h) ? 'Instagram' : /whatsapp/.test(h) ? 'WhatsApp' : /bing/.test(h) ? 'Bing' : h.slice(0, 60);
  } catch { return 'Direct'; }
}
function visitor() {
  let id = '', returning = false;
  try {
    id = localStorage.getItem('tk-vid') || '';
    returning = !!id;
    if (!id) { id = Math.random().toString(36).slice(2, 12); localStorage.setItem('tk-vid', id); }
  } catch { id = 'private'; }
  return { id, returning };
}

let on = false, precise = true;
const str = (v) => ({ stringValue: String(v ?? '').slice(0, 120) });
const int = (n) => ({ integerValue: String(Math.max(0, Math.round(+n || 0))) });
/** Record an event: 'visit', 'resume', 'kit', 'message', 'leave'. */
export async function track(type, extra = {}) {
  if (!on) return;
  const w = where(), d = device(), v = visitor();
  let g = null;
  if (type === 'leave') { try { g = JSON.parse(sessionStorage.getItem('tk-geo') || 'null'); } catch { /* fine */ } } else g = await geo(precise);
  const fields = {
    type: str(type), page: str(page), country: str(g?.country || w.country), city: str(g?.city || w.city), tz: str(w.tz), device: str(d.kind), os: str(d.os), browser: str(d.browser),
    ref: str(type === 'visit' ? referrer() : ''), lang: str((navigator.language || '').slice(0, 12)), vid: str(v.id), returning: { booleanValue: v.returning },
    world: str(document.documentElement.dataset.world || ''), detail: str(extra.detail || ''),
    region: str(g?.region || ''), isp: str(g?.isp || ''), lat: str(g?.lat || ''), lon: str(g?.lon || ''), geo: str(g ? 'ip' : 'tz'),
    screen: str(`${screen.width}×${screen.height}`), secs: int(extra.secs), scroll: int(extra.scroll),
  };
  if (linkCode) fields.for = str(linkCode);
  const body = { writes: [{ update: { name: `${PROJECT}/visits/${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`, fields }, updateTransforms: [{ fieldPath: 'at', setToServerValue: 'REQUEST_TIME' }], currentDocument: { exists: false } }] };
  fetch(`https://firestore.googleapis.com/v1/${PROJECT}:commit?key=${KEY}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), keepalive: true }).catch(() => {});
}
window.tkTrack = track;

/* ---------- Banner ---------- */
function banner(b) {
  if (!b || !b.text) return;
  if (b.where && b.where !== 'all' && b.where !== page) return;
  const key = `tk-banner-${b.text.length}-${b.text.slice(0, 24)}`;
  try { if (sessionStorage.getItem(key)) return; } catch { /* fine */ }
  const el = document.createElement('div');
  el.className = `site-banner tone-${esc(b.tone || 'info')}`;
  el.setAttribute('role', 'status');
  el.innerHTML = `<p>${esc(b.text)}${b.link ? ` <a href="${esc(b.link)}"${/^https?:/.test(b.link) ? ' target="_blank" rel="noopener"' : ''}>${esc(b.linkText || 'Open')} →</a>` : ''}</p><button type="button" aria-label="Hide this message">✕</button>`;
  el.querySelector('button').addEventListener('click', () => { el.remove(); try { sessionStorage.setItem(key, '1'); } catch { /* fine */ } });
  document.body.prepend(el);
}

/* Live: changes saved in the Studio reach pages that are already open, without a refresh.
   While the tab is visible the config is read again every 20 s (one small request); when it
   differs, the banner is updated here and 'tk:site' tells the page (main.js) to apply a pinned
   universe or colours. Visitors' own pinned choices still win (main.js checks). */
const LIVE_EVERY = 20000;
let liveJSON = '';
function liveApply(cfg, first) {
  const json = JSON.stringify(cfg || {});
  if (json === liveJSON) return;
  liveJSON = json;
  if (first) return;
  const eff = effective(cfg);
  document.querySelectorAll('.site-banner').forEach((el) => el.remove());
  banner(eff.banner);
  window.dispatchEvent(new CustomEvent('tk:site', { detail: eff }));
}
function livePoll() {
  if (document.hidden) return;
  load(6000).then((cfg) => liveApply(cfg, false)).catch(() => {});
}
setInterval(livePoll, LIVE_EVERY);
document.addEventListener('visibilitychange', () => { if (!document.hidden) livePoll(); });

load(1500).then((cfg) => {
  const eff = effective(cfg);
  liveApply(cfg, true);
  on = eff.reports; precise = eff.reportsPrecise !== false;
  banner(eff.banner);
  let first = false;
  try { first = !sessionStorage.getItem(`tk-tracked-${page}${linkCode}`); sessionStorage.setItem(`tk-tracked-${page}${linkCode}`, '1'); } catch { first = true; }
  if (first && !/localhost|127\.0\.0\.1/.test(location.hostname)) track('visit');
});
window.addEventListener('tk:message-sent', () => track('message'));

/* Time spent and how far they scrolled, sent once when the page is hidden or closed. */
const opened = Date.now(); let deepest = 0, left = false;
addEventListener('scroll', () => { const h = document.documentElement.scrollHeight - innerHeight; if (h > 0) deepest = Math.max(deepest, Math.min(100, (scrollY / h) * 100)); }, { passive: true });
function leave() {
  if (left || !on || /localhost|127\.0\.0\.1/.test(location.hostname)) return;
  const secs = (Date.now() - opened) / 1000; if (secs < 3) return;
  left = true; track('leave', { secs: Math.min(secs, 86400), scroll: deepest });
}
addEventListener('pagehide', leave);
document.addEventListener('visibilitychange', () => { if (document.hidden) leave(); });
