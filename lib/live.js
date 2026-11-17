/* =========================================================
   Things the owner controls live from the Studio app:
   - the banner (your message on the website)
   - visit reports: one small anonymous record per visit and
     per resume/kit download. No cookies, no IP address; the
     country is guessed from the time zone. Turned off from
     the app with Reports → "Collect visits".
   ========================================================= */
import { load, effective } from './site-config.js?v=1';

const PROJECT = 'projects/myprofile-f29f5/databases/(default)/documents';
const KEY = 'AIzaSyBWggoAjGHu3wdtY5MX3k3xxVzLha3A1zE';
const page = /universes/.test(location.pathname) ? 'studio' : /kits\//.test(location.pathname) ? 'demo' : 'home';
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

let on = false;
const str = (v) => ({ stringValue: String(v ?? '').slice(0, 120) });
/** Record an event: 'visit', 'resume', 'kit', 'message'. */
export function track(type, extra = {}) {
  if (!on) return;
  const w = where(), d = device(), v = visitor();
  const fields = {
    type: str(type), page: str(page), country: str(w.country), city: str(w.city), tz: str(w.tz), device: str(d.kind), os: str(d.os), browser: str(d.browser),
    ref: str(type === 'visit' ? referrer() : ''), lang: str((navigator.language || '').slice(0, 12)), vid: str(v.id), returning: { booleanValue: v.returning },
    world: str(document.documentElement.dataset.world || ''), detail: str(extra.detail || ''),
  };
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

load(1500).then((cfg) => {
  const eff = effective(cfg);
  on = eff.reports;
  banner(eff.banner);
  let first = false;
  try { first = !sessionStorage.getItem(`tk-tracked-${page}`); sessionStorage.setItem(`tk-tracked-${page}`, '1'); } catch { first = true; }
  if (first && !/localhost|127\.0\.0\.1/.test(location.hostname)) track('visit');
});
window.addEventListener('tk:message-sent', () => track('message'));
