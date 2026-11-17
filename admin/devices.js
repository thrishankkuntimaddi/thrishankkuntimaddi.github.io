/* =========================================================
   Account & devices: every phone, tablet or browser signed in
   to myProfile, with "Sign out" for each one.
   devices/{id} (owner only). A device signed out from here
   clears itself and signs out when it next opens or is online;
   signing in again on it with Google lets it back in.
   ========================================================= */
const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const tsDate = (t) => (t?.toDate ? t.toDate() : t ? new Date(t) : null);
const ago = (d) => {
  if (!d) return '—';
  const s = (Date.now() - d.getTime()) / 1000;
  if (s < 90) return 'active now';
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
};

export function deviceId() {
  let id = '';
  try { id = localStorage.getItem('mp-device') || ''; if (!id) { id = crypto.getRandomValues(new Uint32Array(3)).join('').slice(0, 20); localStorage.setItem('mp-device', id); } } catch { id = 'private'; }
  return id;
}
function describe() {
  const ua = navigator.userAgent;
  const app = !!window.StudioNative;
  const tablet = /iPad|Tablet/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) || (/Android/.test(ua) && !/Mobile/.test(ua));
  const form = tablet ? 'Tablet' : /Mobi|iPhone|Android/.test(ua) ? 'Phone' : 'Desktop';
  const android = ua.match(/Android ([\d.]+)/);
  const model = (ua.match(/Android [\d.]+; ([^;)]+?)(?: Build|\))/) || [])[1];
  const os = android ? `Android ${android[1]}` : /iPhone|iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) ? 'iOS' : /Mac OS X/.test(ua) ? 'macOS' : /Windows/.test(ua) ? 'Windows' : /CrOS/.test(ua) ? 'ChromeOS' : 'Linux';
  const browser = app ? 'myProfile app' : /Edg\//.test(ua) ? 'Edge' : /SamsungBrowser/.test(ua) ? 'Samsung Internet' : /Firefox\//.test(ua) ? 'Firefox' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : 'Browser';
  const name = model && model !== 'K' ? model : `${os.split(' ')[0]} ${form.toLowerCase()}`;
  return { name, form, os, browser, app };
}

let F, DEMO, toast, onRevoked, me = '', unsubAll = null;

export async function initDevices(ctx) {
  ({ F, DEMO, toast, onRevoked } = ctx);
  me = deviceId();
  const d = describe();
  $('#devThis').textContent = `${d.name} · ${d.os} · ${d.browser}`;
  if (DEMO) { draw([{ id: me, ...d, lastSeen: new Date(), createdAt: new Date(Date.now() - 9e8) }, { id: 'x', name: 'Pixel 8', form: 'Phone', os: 'Android 16', browser: 'myProfile app', lastSeen: new Date(Date.now() - 3e6), createdAt: new Date(Date.now() - 2e9) }, { id: 'y', name: 'macOS desktop', form: 'Desktop', os: 'macOS', browser: 'Chrome', lastSeen: new Date(Date.now() - 4e8), createdAt: new Date(Date.now() - 3e9), signedOut: true }]); return; }
  const ref = F.fs.doc(F.db, 'devices', me);
  const signedInAt = Date.parse(ctx.user?.metadata?.lastSignInTime || '') || Date.now();
  try {
    const snap = await F.fs.getDoc(ref);
    const v = snap.exists() ? snap.data() : null;
    if (v?.signedOut) {
      const outAt = tsDate(v.signedOutAt)?.getTime() || 0;
      if (signedInAt <= outAt) { onRevoked(); return; } // signed out remotely, not signed in again since
    }
    await F.fs.setDoc(ref, { ...d, signedOut: false, lastSeen: F.fs.serverTimestamp(), ...(v ? {} : { createdAt: F.fs.serverTimestamp() }) }, { merge: true });
  } catch (e) { console.warn('[devices]', e); }
  // Signed out from another device while open
  F.fs.onSnapshot(ref, (s) => { const v = s.data(); if (v?.signedOut && signedInAt <= (tsDate(v.signedOutAt)?.getTime() || Date.now())) onRevoked(); }, () => {});
  // Keep "last active" fresh
  let last = Date.now();
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && Date.now() - last > 10 * 60 * 1000) { last = Date.now(); F.fs.updateDoc(ref, { lastSeen: F.fs.serverTimestamp() }).catch(() => {}); }
  });
  unsubAll = F.fs.onSnapshot(F.fs.query(F.fs.collection(F.db, 'devices'), F.fs.orderBy('lastSeen', 'desc')), (s) => {
    draw(s.docs.map((x) => ({ id: x.id, ...x.data(), lastSeen: tsDate(x.data().lastSeen), createdAt: tsDate(x.data().createdAt) })));
  }, (e) => { $('#devList').innerHTML = `<li class="empty">${esc(e.code || e.message)}</li>`; });
}

const ICON = { Phone: 'i-phone', Tablet: 'i-tablet', Desktop: 'i-desktop' };
let list = [];
function draw(rows) {
  list = rows;
  const active = rows.filter((r) => !r.signedOut);
  $('#devList').innerHTML = rows.map((r) => `<li class="dev${r.signedOut ? ' out' : ''}" data-id="${esc(r.id)}">
      <span class="dev-ico"><svg class="ico"><use href="#${ICON[r.form] || 'i-desktop'}"/></svg></span>
      <span class="dev-main"><b>${esc(r.name)}${r.id === me ? '<span class="dev-me">This device</span>' : ''}</b>
        <span>${esc(r.os)} · ${esc(r.browser)} · ${r.signedOut ? 'signed out' : ago(r.lastSeen)}</span>
        <span>First signed in ${r.createdAt ? r.createdAt.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</span></span>
      ${r.id === me ? '' : r.signedOut ? '<button class="btn sm" type="button" data-dev="forget">Remove</button>' : '<button class="btn sm danger" type="button" data-dev="out">Sign out</button>'}
    </li>`).join('') || '<li class="empty">No devices yet.</li>';
  $('#acctStatus').textContent = `${active.length} device${active.length === 1 ? '' : 's'} signed in · thrishankkuntimaddi@gmail.com`;
  $('#devOthers').disabled = !active.some((r) => r.id !== me);
}
document.addEventListener('click', async (e) => {
  const b = e.target.closest('[data-dev]');
  if (b) {
    const id = b.closest('[data-id]').dataset.id;
    const r = list.find((x) => x.id === id);
    try {
      if (b.dataset.dev === 'out') {
        if (!confirm(`Sign out “${r.name}”? It will need to sign in with Google again.`)) return;
        if (!DEMO) await F.fs.updateDoc(F.fs.doc(F.db, 'devices', id), { signedOut: true, signedOutAt: F.fs.serverTimestamp() });
        toast(`${r.name} is signed out`);
      } else if (b.dataset.dev === 'forget' && !DEMO) await F.fs.deleteDoc(F.fs.doc(F.db, 'devices', id));
    } catch (err) { toast(err.code || err.message); }
    return;
  }
  if (e.target.closest('#devOthers')) {
    const others = list.filter((r) => r.id !== me && !r.signedOut);
    if (!others.length || !confirm(`Sign out ${others.length} other device${others.length === 1 ? '' : 's'}?`)) return;
    try {
      if (!DEMO) { const batch = F.fs.writeBatch(F.db); others.forEach((r) => batch.update(F.fs.doc(F.db, 'devices', r.id), { signedOut: true, signedOutAt: F.fs.serverTimestamp() })); await batch.commit(); }
      toast('All other devices are signed out');
    } catch (err) { toast(err.code || err.message); }
  }
});
/** Forget this device's record (when signing out here). */
export async function forgetThisDevice() {
  if (DEMO || !F) return;
  try { await F.fs.updateDoc(F.fs.doc(F.db, 'devices', me), { signedOut: true, signedOutAt: F.fs.serverTimestamp() }); } catch { /* offline */ }
}
