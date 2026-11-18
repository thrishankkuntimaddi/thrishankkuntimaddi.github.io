/* =========================================================
   Owner controls for the website, edited in the Studio app
   and stored in Firebase at site/config (public read).

   The site reads them once per page load (cached in the
   browser so the first paint already uses them), then works
   out what applies right now: fixed universe or colours,
   which universes are in the shuffle, animations on or off,
   Pip, a banner, and scheduled automations.
   Visitors' own settings can only turn things further OFF.
   ========================================================= */
export const DEFAULTS = {
  theme: { world: '', edition: '', universes: [], firstWorld: 'paper' },
  motion: { calm: false, glitch: true, tour: true, sound: true, season: true, loop: true, tunes: true },
  pip: { on: true, greeting: '', occasion: '' },
  banner: { on: false, text: '', link: '', linkText: '', tone: 'info', from: '', to: '', where: 'all' },
  automations: [],
  reports: { on: true, precise: true },
};
export const CACHE = 'tk-site';

const merge = (base, over) => {
  const out = Array.isArray(base) ? [...base] : { ...base };
  Object.keys(over || {}).forEach((k) => {
    const v = over[k];
    out[k] = v && typeof v === 'object' && !Array.isArray(v) && base[k] && typeof base[k] === 'object' ? merge(base[k], v) : v;
  });
  return out;
};
export const withDefaults = (c) => merge(DEFAULTS, c || {});

/** Is `now` inside an automation/banner window? Dates are 'YYYY-MM-DD' or 'YYYY-MM-DDTHH:MM' (local time). */
export function inWindow(from, to, now = new Date(), days) {
  const t = now.getTime();
  if (from && t < new Date(from.length === 10 ? `${from}T00:00` : from).getTime()) return false;
  if (to && t > new Date(to.length === 10 ? `${to}T23:59:59` : to).getTime()) return false;
  if (Array.isArray(days) && days.length && !days.includes(now.getDay())) return false;
  return true;
}

/** What applies right now: config plus any running automations. */
export function effective(config, now = new Date()) {
  const c = withDefaults(config);
  const e = { world: c.theme.world, edition: c.theme.edition, universes: c.theme.universes, firstWorld: c.theme.firstWorld || 'paper',
    motion: { ...c.motion }, pip: { ...c.pip }, banner: c.banner.on && c.banner.text && inWindow(c.banner.from, c.banner.to, now) ? { ...c.banner } : null,
    reports: c.reports.on !== false, reportsPrecise: c.reports.precise !== false, running: [] };
  (c.automations || []).forEach((a) => {
    if (!a || a.off || !inWindow(a.from, a.to, now, a.days)) return;
    if (a.hours && a.hours.length === 2) { const h = now.getHours(); const [h1, h2] = a.hours.map(Number); if (h1 <= h2 ? h < h1 || h >= h2 : h < h1 && h >= h2) return; }
    const d = a.do || {};
    if (d.world) e.world = d.world;
    if (d.edition) e.edition = d.edition;
    if (d.banner) e.banner = { on: true, text: d.banner, link: d.link || '', linkText: d.linkText || '', tone: d.tone || 'celebrate', where: 'all' };
    if (d.pipSay) e.pip.greeting = d.pipSay;
    if (d.occasion) e.pip.occasion = d.occasion;
    if (d.calm) e.motion.calm = true;
    e.running.push(a.name || 'Automation');
  });
  return e;
}

/** The visitor's prefs, with the owner's switches applied on top (owner can only turn things off or pin a look). */
export function mergePrefs(visitor, eff) {
  const p = { ...(visitor || {}) };
  if (!eff) return p;
  const m = eff.motion;
  if (m.calm) p.motion = 'calm';
  ['glitch', 'tour', 'sound', 'season'].forEach((k) => { if (m[k] === false) p[k] = false; });
  if (eff.pip.on === false) p.pip = false;
  if (eff.world && !p.world) p.world = eff.world;
  if (eff.edition && !p.edition) p.edition = eff.edition;
  return p;
}

/* ---------- Reading it on the site ---------- */
import { siteDoc } from './firebase.js?v=2';
export function cached() {
  try { const c = JSON.parse(localStorage.getItem(CACHE)); return c && c.data; } catch { return null; }
}
/** Fresh config, waiting at most `wait` ms (then the cached copy). Always refreshes the cache in the background. */
export function load(wait = 900) {
  const fresh = siteDoc('config').then((j) => j || { fields: { data: { stringValue: '{}' } } })
    .then((j) => {
      const data = JSON.parse(j.fields?.data?.stringValue || '{}');
      try { localStorage.setItem(CACHE, JSON.stringify({ at: Date.now(), data })); } catch { /* private mode */ }
      return data;
    });
  const old = cached();
  return Promise.race([fresh, new Promise((ok) => setTimeout(() => ok(old), wait))]).catch(() => old);
}
