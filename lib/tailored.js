/* =========================================================
   Tailored links: https://…/?for=acme-k3j9x2
   Made in the Studio app (Links). Each one is a public doc at
   links/{code}, readable only by someone who has the exact
   code (the rules refuse listing), holding:
     company   "Acme"
     hello     a line shown at the top of the page (optional)
     resume    a snapshot of the chosen resume (or null = the
               one on the website). An uploaded PDF keeps its
               parts in linkFiles/{code}_{n}.
     off       true = the link is switched off
   The code is remembered for the tab, so a refresh or the
   quick-read page still knows it. Visits made through a link
   carry its code (lib/live.js), so the Studio can show who
   opened it, when, for how long, and whether they downloaded.
   ========================================================= */
const REST = 'https://firestore.googleapis.com/v1/projects/myprofile-f29f5/databases/(default)/documents';
const KEY = 'AIzaSyBWggoAjGHu3wdtY5MX3k3xxVzLha3A1zE';
export const CODE_RE = /^[a-z0-9-]{4,48}$/;
const local = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** The link code for this visit: from ?for=, else the one remembered for this tab. */
export function forCode() {
  let c = '';
  try { c = (new URLSearchParams(location.search).get('for') || '').toLowerCase().trim(); } catch { /* old browser */ }
  if (CODE_RE.test(c)) { try { sessionStorage.setItem('tk-for', c); } catch { /* private mode */ } return c; }
  try { const s = sessionStorage.getItem('tk-for') || ''; return CODE_RE.test(s) ? s : ''; } catch { return ''; }
}
const forget = () => { try { sessionStorage.removeItem('tk-for'); } catch { /* fine */ } };

const DEMO = { company: 'Acme', hello: 'Thanks for taking a look. Everything here, the resume included, is set up for the Acme frontend role.', resume: null };

let P = null;
/** The link (or null). Never throws. */
export function loadLink() {
  if (P) return P;
  const code = forCode();
  if (!code) return (P = Promise.resolve(null));
  if (local && code === 'demo-acme') return (P = Promise.resolve({ ...DEMO, code, updatedAt: new Date().toISOString() }));
  P = fetch(`${REST}/links/${code}?key=${KEY}`, { cache: 'no-store' })
    .then((r) => (r.ok ? r.json() : null))
    .then((j) => {
      const d = j ? JSON.parse(j.fields?.data?.stringValue || 'null') : null;
      if (!d || d.off) { forget(); return null; }
      return { ...d, code, updatedAt: j.fields?.updatedAt?.timestampValue || j.updateTime };
    })
    .catch(() => null);
  return P;
}

/** Usable resume data from a link, or null (= use the website's). */
export const linkResume = (l) => (l && l.resume && (l.resume.sections || (l.resume.kind === 'pdf' && l.resume.parts)) ? l.resume : null);

/** An uploaded PDF chosen for a link: its base64 parts joined. */
export async function linkPdfB64(l) {
  const parts = await Promise.all([...Array(l.resume.parts)].map((_, n) => fetch(`${REST}/linkFiles/${l.code}_${n}?key=${KEY}`, { cache: 'no-store' })
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error('missing part')))).then((j) => j.fields?.data?.stringValue || '')));
  if (parts.some((p) => !p)) throw new Error('missing part');
  return parts.join('');
}

/** The little taped note at the top of the page. */
export function helloNote(l, after) {
  if (!l || !after || document.querySelector('.for-note')) return;
  const p = document.createElement('p');
  p.className = 'for-note';
  p.setAttribute('role', 'note');
  const hello = l.hello || `Thanks for taking a look. This page and my resume are set up for ${l.company}.`;
  p.innerHTML = `<b>Hi ${esc(l.company)} team 👋</b> <span>${esc(hello)}</span>`;
  after.after(p);
  // Replies say where they came from.
  document.querySelectorAll('a[href^="mailto:thrishankkuntimaddi@gmail.com"]').forEach((a) => {
    if (!/subject=/.test(a.href)) a.href = `mailto:thrishankkuntimaddi@gmail.com?subject=${encodeURIComponent(`Hello from ${l.company}`)}`;
  });
}
