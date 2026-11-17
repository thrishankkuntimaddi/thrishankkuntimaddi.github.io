/* =========================================================
   The website's content, edited in the Studio app and stored
   in Firebase at site/content (public read, owner write):
     text       { key: html }   any block tagged data-k="…"
     projects   { main, more, orbit }
     stories    { id: story }   the "The story" sheets
     ask        [ … ]           what Pip knows
     changelog  [ … ]           "What's new" for returning visitors
   main.js waits for this (briefly) before it starts, so the
   page is built from your data. Nothing published = the
   hand-written page as it is.
   ========================================================= */
import { STORIES, ASK, CHANGELOG, ASK_SUGGEST } from '../content.js?v=22';

const REST = 'https://firestore.googleapis.com/v1/projects/myprofile-f29f5/databases/(default)/documents/site/content?key=AIzaSyBWggoAjGHu3wdtY5MX3k3xxVzLha3A1zE';
const CACHE = 'tk-content';
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const KEYPAD = { a: 2, b: 2, c: 2, d: 3, e: 3, f: 3, g: 4, h: 4, i: 4, j: 5, k: 5, l: 5, m: 6, n: 6, o: 6, p: 7, q: 7, r: 7, s: 7, t: 8, u: 8, v: 8, w: 9, x: 9, y: 9, z: 9 };
export const keypad = (word) => String(word || '').toLowerCase().replace(/[^a-z]/g, '').split('').map((c) => KEYPAD[c]).join('');
const ext = (u) => (/^https?:/.test(u) ? ' target="_blank" rel="noopener"' : '');

export async function loadContent(wait = 900) {
  let old = null;
  try { old = JSON.parse(localStorage.getItem(CACHE))?.data || null; } catch { /* private mode */ }
  if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname) && /[?&]cached\b/.test(location.search)) return old; // local preview of unpublished edits
  const fresh = fetch(REST, { cache: 'no-store' }).then((r) => (r.status === 404 ? null : r.ok ? r.json() : Promise.reject(r.status)))
    .then((j) => {
      const data = j ? JSON.parse(j.fields?.data?.stringValue || 'null') : null;
      try { localStorage.setItem(CACHE, JSON.stringify({ at: Date.now(), data })); } catch { /* private mode */ }
      return data;
    });
  return Promise.race([fresh, new Promise((ok) => setTimeout(() => ok(old), wait))]).catch(() => old);
}

/* ---------- Projects ---------- */
function mainProject(p, i, templates) {
  const tpl = templates.get(p.preview) || templates.get(p.name) || null;
  const art = (tpl || templates.values().next().value).cloneNode(true);
  art.classList.toggle('flip', i % 2 === 1);
  if (p.scene) art.dataset.scene = p.scene;
  const win = art.querySelector('.window');
  if (!tpl && win) { // a new project: a simple coded preview built from its own words
    win.querySelector('.mock')?.remove();
    const mock = document.createElement('div');
    mock.className = 'mock mock-new';
    mock.innerHTML = `<b>${esc(p.name)}</b><span>${esc(p.what)}</span><ul>${(p.chips || []).slice(0, 4).map((c) => `<li>${esc(c)}</li>`).join('')}</ul>`;
    win.querySelector('.win-bar').after(mock);
  }
  const label = art.querySelector('.win-bar span'); if (label) label.textContent = p.label || `${p.name.toUpperCase().replace(/\s+/g, '')}.SYS`;
  const tag = art.querySelector('.win-tag'); if (tag) tag.innerHTML = esc(p.tagline || '').replace(/\n/g, '<br>');
  art.querySelector('.p-num').textContent = `Project ${String(i + 1).padStart(2, '0')}`;
  art.querySelector('h3').textContent = p.name;
  const morse = art.querySelector('[data-morse]'); if (morse) { morse.dataset.morse = p.name.toUpperCase().split(/\s+/)[0].replace(/[^A-Z]/g, '').slice(0, 8); morse.textContent = ''; }
  art.querySelector('.p-what').textContent = p.what || '';
  art.querySelector('.p-points').innerHTML = (p.points || []).filter(Boolean).map((x) => `<li>${esc(x)}</li>`).join('');
  art.querySelector('.chips').innerHTML = (p.chips || []).filter(Boolean).map((x) => `<li>${esc(x)}</li>`).join('');
  const acts = art.querySelector('.p-actions');
  acts.innerHTML = (p.live ? `<a class="btn btn-gloss" href="${esc(p.live)}"${ext(p.live)}>Open live ↗</a>` : '') + (p.repo ? `<a class="btn btn-paper" href="${esc(p.repo)}"${ext(p.repo)}>Code</a>` : '');
  art.dataset.pid = p.story || p.id;
  return art;
}
function renderProjects(P) {
  const work = document.querySelector('#work .wrap');
  const old = [...document.querySelectorAll('#work .project')];
  if (P.main && work && old.length) {
    const templates = new Map(old.map((a) => [a.querySelector('h3').textContent.trim(), a]));
    const frag = document.createDocumentFragment();
    P.main.filter((p) => !p.hidden).forEach((p, i) => frag.append(mainProject(p, i, templates)));
    old.forEach((a) => a.remove());
    work.append(frag);
  }
  const pile = document.querySelector('#more .pile');
  const tplMini = pile?.querySelector('.mini');
  if (P.more && tplMini) {
    pile.innerHTML = '';
    P.more.filter((p) => !p.hidden).forEach((p) => {
      const a = tplMini.cloneNode(true);
      a.href = p.link || '#';
      if (!/^https?:/.test(p.link || '')) { a.removeAttribute('target'); a.removeAttribute('rel'); }
      const t = a.querySelector('.mini-tag'); t.textContent = p.status || ''; t.classList.toggle('live', !!p.live);
      const c = a.querySelector('.mini-code'); const code = keypad(p.word);
      if (c) { c.dataset.code = code; c.dataset.word = (p.word || '').toUpperCase(); c.textContent = `:${code}`; c.hidden = !code; }
      a.querySelector('h3').textContent = p.name;
      a.querySelector('p').textContent = p.what || '';
      a.querySelector('.mini-stack').textContent = p.stack || '';
      pile.append(a);
    });
  }
  const orbit = document.querySelector('#poelys .worlds ul');
  const tplLi = orbit?.querySelector('li');
  if (P.orbit && tplLi) {
    const lis = [...orbit.querySelectorAll('li')];
    orbit.innerHTML = '';
    P.orbit.filter((p) => !p.hidden).forEach((p, i) => {
      const li = (lis[i % lis.length] || tplLi).cloneNode(true);
      const a = li.querySelector('a'); const code = keypad(p.word); const word = (p.word || '').toUpperCase();
      a.href = p.link || '#';
      a.setAttribute('aria-label', `${p.name}, code ${code}, decodes to ${word}`);
      const iEl = li.querySelector('.plaque i'); iEl.dataset.code = code; iEl.dataset.word = word; iEl.textContent = `:${code}`;
      li.querySelector('.plaque b').textContent = p.name;
      orbit.append(li);
    });
  }
}

/* ---------- Apply ---------- */
export function applyContent(c) {
  if (!c) return;
  try {
    Object.entries(c.text || {}).forEach(([k, html]) => { const el = document.querySelector(`[data-k="${CSS.escape(k)}"]`); if (el) el.innerHTML = html; });
    if (c.projects) renderProjects(c.projects);
    if (c.stories) { Object.keys(STORIES).forEach((k) => delete STORIES[k]); Object.assign(STORIES, c.stories); }
    if (Array.isArray(c.ask) && c.ask.length) ASK.splice(0, ASK.length, ...c.ask);
    if (Array.isArray(c.askSuggest) && c.askSuggest.length) ASK_SUGGEST.splice(0, ASK_SUGGEST.length, ...c.askSuggest);
    if (Array.isArray(c.changelog) && c.changelog.length) CHANGELOG.splice(0, CHANGELOG.length, ...c.changelog);
  } catch (e) { console.warn('[content]', e); }
}
