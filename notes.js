/* =========================================================
   Notes (notes.html): short posts written in the Studio app
   (Content → Notes), stored at site/notes (public read).
   The list is in Paper; each note opens in its own universe
   (the one picked in the Studio, or a surprise), with that
   universe's scene drawn behind it for the 22 dark ones.
   Address of a note: notes.html#<id>
   Local preview with a sample: ?demo on localhost.
   ========================================================= */
import { readPublic } from './lib/firebase.js?v=2';
import { md, esc, readMins, plainText } from './lib/md.js?v=1';
import { ALL, NAMES, isLoopWorld, isDarkWorld, isDesigned } from './worlds.js?v=23';
import { setWorldBg } from './worldbg.js?v=22';

const $ = (s) => document.querySelector(s);
const root = document.documentElement;
const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches || root.classList.contains('calm');
const local = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
const SAMPLE = [
  { id: 'demo1', title: 'Why my portfolio tours itself', date: '2026-11-18', world: 'blueprint', line: 'A short note on autoplay, and handing control back.', body: '## The idea\nRecruiters skim. So the page **scrolls itself** and stops the moment you touch it.\n\n- Any scroll, tap or key hands control back\n- It resumes after five idle seconds\n\n> Motion should invite, never trap.\n\nRead the code on [GitHub](https://github.com/thrishankkuntimaddi).' },
  { id: 'demo2', title: 'Twenty-seven themes, one set of tokens', date: '2026-11-10', world: 'fire', line: '', body: 'Every universe is the same components with different tokens: `--paper`, `--ink`, `--accent`.\n\nDark universes keep cards light, so text never loses contrast.' },
];
const date = (d) => { try { return new Date(`${d}T00:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }); } catch { return d; } };

let notes = [];
function setWorld(w) {
  root.dataset.world = w;
  root.classList.toggle('sketch', w === 'sketch');
  root.toggleAttribute('data-dark', isDarkWorld(w)); root.toggleAttribute('data-design', isDesigned(w));
  root.toggleAttribute('data-loop', isLoopWorld(w));
  setWorldBg(w, calm());
}
function worldOf(n) {
  if (n.world && ALL.includes(n.world)) return n.world;
  const pick = ALL.filter((w) => w !== 'paper');
  return pick[Math.floor(Math.random() * pick.length)];
}

function drawList() {
  $('#noteList').innerHTML = notes.length ? notes.map((n) => `<li><a class="card note-item" href="#${esc(n.id)}">
      <span class="note-meta">${esc(date(n.date))} · ${readMins(n.body)} min read${n.world ? ` · ${esc(NAMES[n.world] || '')}` : ''}</span>
      <b>${esc(n.title)}</b>
      <span class="note-sum">${esc(n.line || plainText(n.body).slice(0, 160))}${!n.line && plainText(n.body).length > 160 ? '…' : ''}</span>
    </a></li>`).join('') : '<li class="note-empty">No notes yet. Check back soon.</li>';
}
function show() {
  const id = decodeURIComponent(location.hash.slice(1));
  const n = notes.find((x) => x.id === id);
  $('#notesHome').hidden = !!n;
  $('#noteRead').hidden = !n;
  if (!n) { setWorld('paper'); document.title = 'Notes — Thrishank Kuntimaddi'; return; }
  const w = worldOf(n);
  setWorld(w);
  document.title = `${n.title} — Thrishank Kuntimaddi`;
  $('#noteMeta').textContent = `${date(n.date)} · ${readMins(n.body)} min read · in ${NAMES[w] || w}`;
  $('#noteTitle').textContent = n.title;
  $('#noteLine').textContent = n.line || '';
  $('#noteLine').hidden = !n.line;
  $('#noteBody').innerHTML = md(n.body);
  const i = notes.indexOf(n), prev = notes[i + 1], next = notes[i - 1];
  $('#noteNext').innerHTML = [next && `<a class="btn btn-paper btn-sm" href="#${esc(next.id)}">← Newer: ${esc(next.title)}</a>`, prev && `<a class="btn btn-paper btn-sm" href="#${esc(prev.id)}">Older: ${esc(prev.title)} →</a>`].filter(Boolean).join('');
  window.scrollTo(0, 0);
  $('#noteTitle').setAttribute('tabindex', '-1'); $('#noteTitle').focus({ preventScroll: true });
}
$('#noteBack').addEventListener('click', (e) => { e.preventDefault(); history.pushState(null, '', location.pathname + location.search); show(); });
addEventListener('hashchange', show);

(async () => {
  if (local && /[?&]demo\b/.test(location.search)) notes = SAMPLE;
  else { try { const { data } = await readPublic('notes'); notes = Array.isArray(data) ? data : []; } catch { notes = []; } }
  notes = notes.filter((n) => n && !n.hidden && n.title).sort((a, b) => String(b.date).localeCompare(String(a.date)));
  drawList();
  show();
})();
