/* =========================================================
   In-app updates for the Android app.
   On start (and when the app comes back to the front, at most
   every 3 hours) it asks GitHub's public API for the newest
   "studio-v*" release. If that is newer than this build
   (window.StudioNative.version), a card offers the update:
   "Update" downloads Studio-Android.apk in the phone's browser,
   and it installs over this one (same signing key, so sign-in
   and settings stay). "Later" hides that version for a day.
   Only runs inside the app; the web Studio is always current.
   ========================================================= */
const API = 'https://api.github.com/repos/thrishankkuntimaddi/thrishankkuntimaddi.github.io/releases?per_page=15';
const SNOOZE = 'studio-update-later';
const EVERY = 3 * 3600e3;
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const parts = (v) => String(v).replace(/^studio-v/, '').split('.').map((n) => parseInt(n, 10) || 0);
const newer = (a, b) => { const x = parts(a), y = parts(b); for (let i = 0; i < 3; i++) if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) > (y[i] || 0); return false; };

let lastCheck = 0;

/** The newest app release on GitHub: { version, url, notes, at } or null. */
export async function latestRelease() {
  const r = await fetch(API, { headers: { Accept: 'application/vnd.github+json' }, cache: 'no-store', credentials: 'omit' });
  if (!r.ok) return null;
  const rel = (await r.json())
    .filter((x) => !x.draft && !x.prerelease && /^studio-v\d+\.\d+\.\d+$/.test(x.tag_name))
    .sort((a, b) => (newer(a.tag_name, b.tag_name) ? -1 : 1))[0];
  const apk = rel?.assets?.find((a) => /\.apk$/i.test(a.name));
  if (!apk) return null;
  return { version: rel.tag_name.slice('studio-v'.length), url: apk.browser_download_url, notes: rel.body || '', at: rel.published_at };
}

// "What's new" lines from the release notes (the "- " list the release workflow writes).
const whatsNew = (notes) => notes.split('\n').map((l) => l.trim()).filter((l) => /^[-*] /.test(l)).map((l) => l.slice(2)).slice(0, 5);

function card(rel, mine) {
  document.getElementById('updCard')?.remove();
  const el = document.createElement('aside');
  el.id = 'updCard'; el.className = 'upd-card'; el.setAttribute('role', 'status');
  const list = whatsNew(rel.notes);
  el.innerHTML = `<div class="upd-head"><b>Update to myProfile ${esc(rel.version)}</b><span>You have ${esc(mine)}</span></div>
    ${list.length ? `<ul>${list.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>` : ''}
    <p class="upd-how">It downloads in your browser. Open the file to install; you stay signed in.</p>
    <div class="upd-actions"><button class="btn" type="button" data-u="later">Later</button><a class="btn primary" data-u="go" href="${esc(rel.url)}">Update</a></div>`;
  el.addEventListener('click', (e) => {
    const b = e.target.closest('[data-u]'); if (!b) return;
    if (b.dataset.u === 'later') { try { localStorage.setItem(SNOOZE, JSON.stringify({ v: rel.version, until: Date.now() + 864e5 })); } catch { /* fine */ } }
    el.remove();
  });
  document.body.appendChild(el);
}

async function check(force = false) {
  const mine = window.StudioNative?.version;
  if (!mine || !navigator.onLine) return;
  if (!force && Date.now() - lastCheck < EVERY) return;
  lastCheck = Date.now();
  const rel = await latestRelease().catch(() => null);
  if (!rel || !newer(rel.version, mine)) return;
  if (!force) {
    let s = null; try { s = JSON.parse(localStorage.getItem(SNOOZE)); } catch { /* fine */ }
    if (s && s.v === rel.version && Date.now() < s.until) return;
  }
  card(rel, mine);
}

/** Call once after sign-in. Returns a function for a manual "Check for updates". */
export function initUpdates() {
  if (!window.StudioNative?.version) return null;
  check();
  document.addEventListener('visibilitychange', () => { if (!document.hidden) check(); });
  return async () => {
    const mine = window.StudioNative.version;
    const rel = await latestRelease().catch(() => null);
    if (rel && newer(rel.version, mine)) { card(rel, mine); return `myProfile ${rel.version} is ready`; }
    return `You have the latest version (${mine})`;
  };
}
