/* =========================================================
   Studio: the owner's app for the portfolio.
   Resume editor (draft -> publish, versions), inbox of
   visitor messages, help-centre answers, about.
   ========================================================= */
import { loadSDK, loadAuth, OWNER, KINDS } from '../lib/firebase.js?v=1';
import { loadEngine, toSVG, download, toText, resumeFontCSS } from '../lib/resume.js?v=1';
import { SEED } from '../lib/resume-seed.js?v=1';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clone = (o) => JSON.parse(JSON.stringify(o));
const uid = () => Math.random().toString(36).slice(2, 9);
let toastT = 0;
function toast(msg, ms = 2200) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('on');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), ms);
}
const ago = (d) => {
  if (!d) return '';
  const s = (Date.now() - d.getTime()) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: d.getFullYear() === new Date().getFullYear() ? undefined : 'numeric' });
};
const tsDate = (t) => (t?.toDate ? t.toDate() : t ? new Date(t) : null);

const style = document.createElement('style');
style.textContent = resumeFontCSS();
document.head.appendChild(style);

/* ================= Auth ================= */
let F = null; // { fs, db }
let A = null; // { auth, a }
const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;

const DEMO = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) && new URLSearchParams(location.search).has('demo');
async function boot() {
  if (DEMO) { // local preview of the UI: no sign-in, nothing is saved to Firebase
    $('#gate').hidden = true; $('#app').hidden = false; $('#who').textContent = 'Local demo (not saved)';
    start(); return;
  }
  try {
    [F, A] = await Promise.all([loadSDK(), loadAuth()]);
  } catch (e) {
    $('#gateMsg').textContent = 'Could not reach Firebase. Check your connection and reload.';
    return;
  }
  A.auth.getRedirectResult(A.a).catch((e) => toast(e.message));
  let known = false;
  setTimeout(() => { if (!known) { $('#signIn').hidden = false; $('#gateMsg').textContent = 'Edit your resume and read what visitors send you.'; } }, 4000);
  A.auth.onAuthStateChanged(A.a, (user) => {
    known = true;
    const ok = user && user.email === OWNER && user.emailVerified;
    $('#gate').hidden = !!ok;
    $('#app').hidden = !ok;
    $('#signOutGate').hidden = !user || ok;
    $('#signIn').hidden = !!(user && !ok);
    if (!user) $('#gateMsg').textContent = 'Edit your resume and read what visitors send you.';
    if (user && !ok) $('#gateMsg').textContent = `${user.email} isn’t the owner of this studio. Only ${OWNER} can sign in here.`;
    if (ok) { $('#who').textContent = user.email; start(); }
  });
}
$('#signIn').addEventListener('click', async () => {
  const p = new A.auth.GoogleAuthProvider();
  p.setCustomParameters({ login_hint: OWNER, prompt: 'select_account' });
  try {
    if (standalone) await A.auth.signInWithRedirect(A.a, p);
    else await A.auth.signInWithPopup(A.a, p);
  } catch (e) {
    if (/popup/.test(e.code || '')) A.auth.signInWithRedirect(A.a, p);
    else if (e.code === 'auth/unauthorized-domain') toast(`Add ${location.hostname} under Firebase → Authentication → Settings → Authorized domains`, 6000);
    else toast(e.message, 4000);
  }
});
const signOut = () => A.auth.signOut(A.a).then(() => location.reload());
$('#signOut').addEventListener('click', signOut);
$('#signOutGate').addEventListener('click', signOut);

let started = false;
function start() {
  if (started) return; started = true;
  const v = (location.hash.slice(1) || 'resume');
  show(['resume', 'inbox', 'feedback', 'compliment', 'help', 'about'].includes(v) ? v : 'resume');
  initResume();
  initMessages();
}

/* ================= Navigation ================= */
let currentView = 'resume';
function show(v) {
  currentView = v;
  history.replaceState(null, '', `#${v}`);
  $$('.nav-btn').forEach((b) => { if (b.dataset.view === v) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
  const isMsg = ['inbox', 'feedback', 'compliment', 'help'].includes(v);
  $$('.view').forEach((s) => { s.hidden = !(s.dataset.view === v || (isMsg && s.dataset.view === 'messages')); });
  if (isMsg) { msgKind = v === 'inbox' ? 'all' : v; msgFilter = 'open'; drawMessages(); }
  window.scrollTo(0, 0);
}
$$('.nav-btn').forEach((b) => b.addEventListener('click', () => show(b.dataset.view)));

/* ================= Resume ================= */
let draft = null;
let published = null; // { at: Date, json }
let dirty = false;
let saveT = 0, prevT = 0;
const draftRef = () => F.fs.doc(F.db, 'private', 'resumeDraft');
const pubRef = () => F.fs.doc(F.db, 'site', 'resume');

async function initResume() {
  setStatus('Loading…');
  try {
    const [d, p] = await Promise.all([F.fs.getDoc(draftRef()), F.fs.getDoc(pubRef())]);
    if (p.exists()) published = { at: tsDate(p.data().updatedAt), json: p.data().data };
    if (d.exists()) draft = JSON.parse(d.data().data);
    else if (published) draft = JSON.parse(published.json);
    else draft = clone(SEED);
  } catch (e) {
    let local = null; try { local = JSON.parse(localStorage.getItem('studio-draft')); } catch { /* none */ }
    draft = local || clone(SEED);
    if (!DEMO) toast(`Working offline: ${e.code || e.message}`, 4000);
  }
  normalise(draft);
  renderEditor();
  refreshPreview(true);
  updateStatus();
}
function normalise(d) {
  d.contacts ||= []; d.sections ||= [];
  d.sections.forEach((s) => { s.id ||= uid(); s.items ||= s.type === 'text' ? undefined : []; });
}
function setStatus(t, warn) { const s = $('#rzStatus'); s.textContent = t; s.classList.toggle('warn', !!warn); }
function updateStatus(extra = '') {
  const same = published && published.json === JSON.stringify(draft);
  const pub = published ? `Published ${ago(published.at)}` : 'Not published yet: the site shows the PDF in the repo';
  setStatus(`${extra || (dirty ? 'Saving draft…' : 'Draft saved')} · ${same ? 'Live on the site ✓' : pub + (published ? ' · draft has unpublished changes' : '')}`);
  $('#rzPublish').disabled = !!same;
}
function changed(structural = false) {
  dirty = true;
  if (structural) renderEditor();
  clearTimeout(prevT); prevT = setTimeout(refreshPreview, 180);
  clearTimeout(saveT); saveT = setTimeout(saveDraft, 1000);
  updateStatus();
}
async function saveDraft() {
  const json = JSON.stringify(draft);
  try { localStorage.setItem('studio-draft', json); } catch { /* full */ }
  try {
    await F.fs.setDoc(draftRef(), { data: json, updatedAt: F.fs.serverTimestamp() });
    dirty = false; updateStatus();
  } catch (e) { setStatus(`Draft kept on this device only (${e.code || e.message})`, true); }
}
let engineReady = false;
async function refreshPreview(first) {
  if (!engineReady) {
    try { await loadEngine(); await document.fonts.load('10px Carlito'); engineReady = true; } catch (e) { $('#rzPreview').innerHTML = `<p class="empty">${esc(e.message)}</p>`; return; }
  }
  const { svg, fits, scale } = toSVG(draft, { overflowLine: true });
  $('#rzPreview').innerHTML = svg;
  const f = $('#rzFit');
  f.className = `fit${!fits ? ' over' : scale < 1 ? ' shrunk' : ''}`;
  f.textContent = !fits ? 'Over one page. Shorten a few bullets (the red line is the bottom margin).' : scale < 1 ? `Fits on one page (text shrunk to ${Math.round(scale * 100)}%).` : 'Fits on one page at full size.';
  if (first) $('#rzPreview svg')?.setAttribute('data-first', '1');
}

$('#rzPublish').addEventListener('click', async () => {
  const btn = $('#rzPublish');
  if (!$('#rzFit').classList.contains('over') || confirm('The resume runs over one page. Publish anyway?')) {
    btn.disabled = true;
    const json = JSON.stringify(draft);
    try {
      const batch = F.fs.writeBatch(F.db);
      batch.set(pubRef(), { data: json, updatedAt: F.fs.serverTimestamp() });
      batch.set(draftRef(), { data: json, updatedAt: F.fs.serverTimestamp() });
      batch.set(F.fs.doc(F.fs.collection(F.db, 'versions')), { data: json, at: F.fs.serverTimestamp(), name: draft.name || '' });
      await batch.commit();
      published = { at: new Date(), json }; dirty = false;
      toast('Published. The site has the new resume now.');
    } catch (e) { toast(`Couldn’t publish: ${e.code || e.message}`, 4000); }
    updateStatus();
  }
});
$('#rzDownload').addEventListener('click', () => download(draft).catch((e) => toast(e.message)));
$('#rzTogglePreview').addEventListener('click', (e) => {
  const on = $('.rz').classList.toggle('show-preview');
  e.currentTarget.textContent = on ? 'Edit' : 'Preview';
  window.scrollTo(0, 0);
});

/* ---------- Editor rendering ---------- */
const TYPES = {
  text: { name: 'Paragraph', make: () => ({ type: 'text', title: 'Summary', body: '', justify: true }) },
  entries: { name: 'Entries', make: () => ({ type: 'entries', title: 'Experience', items: [blankEntry()] }) },
  skills: { name: 'Label: value lines', make: () => ({ type: 'skills', title: 'Skills', items: [{ label: '', value: '' }] }) },
  list: { name: 'Bullet list', make: () => ({ type: 'list', title: 'Achievements', items: [''] }) },
};
const blankEntry = () => ({ title: '', org: '', date: '', sub: '', subRight: '', bullets: [''] });
const PRESETS = [
  ['Summary', 'text'], ['Experience', 'entries'], ['Projects', 'entries'], ['Education', 'entries'],
  ['Skills', 'skills'], ['Achievements', 'list'], ['Certifications', 'list'], ['Publications', 'list'], ['Volunteering', 'entries'], ['Custom', 'list'],
];
const open = new Set(['__header']);

const inp = (path, val, label, opts = {}) => `<label class="f">${esc(label)}${opts.hint ? ` <small>${esc(opts.hint)}</small>` : ''}${opts.area
  ? `<textarea data-path="${path}" rows="${opts.rows || 3}" ${opts.ph ? `placeholder="${esc(opts.ph)}"` : ''}>${esc(val)}</textarea>`
  : `<input data-path="${path}" value="${esc(val)}" ${opts.ph ? `placeholder="${esc(opts.ph)}"` : ''} ${opts.type ? `type="${opts.type}"` : ''}>`}</label>`;
const tools = (kind, i, n, extra = '') => `<span class="sec-tools">${extra}<button class="icon-btn" type="button" data-act="${kind}-up" data-i="${i}" title="Move up" ${i === 0 ? 'disabled' : ''}>↑</button><button class="icon-btn" type="button" data-act="${kind}-down" data-i="${i}" title="Move down" ${i === n - 1 ? 'disabled' : ''}>↓</button><button class="icon-btn" type="button" data-act="${kind}-del" data-i="${i}" title="Delete">✕</button></span>`;

function renderEditor() {
  const d = draft;
  const h = [];
  h.push(`<details class="card" data-key="__header" ${open.has('__header') ? 'open' : ''}><summary>Header</summary><div class="card-body">
    <div class="row">${inp('name', d.name, 'Name')}${inp('title', d.title, 'Headline')}</div>
    <p class="legend">Contact line (left to right). Leave the link empty for plain text.</p>
    ${d.contacts.map((c, i) => `<div class="row3">${inp(`contacts.${i}.text`, c.text, 'Shown as', { ph: 'GitHub' })}${inp(`contacts.${i}.url`, c.url, 'Link', { ph: 'https://… or mailto:…' })}${tools('contact', i, d.contacts.length)}</div>`).join('')}
    <div class="adders"><button class="btn sm" type="button" data-act="contact-add">+ Contact</button></div>
  </div></details>`);

  h.push(`<details class="card" data-key="__page" ${open.has('__page') ? 'open' : ''}><summary>Page &amp; tools</summary><div class="card-body">
    <div class="row">
      <label class="f">Paper<select data-path="page"><option value="letter" ${d.page !== 'a4' ? 'selected' : ''}>US Letter (US companies)</option><option value="a4" ${d.page === 'a4' ? 'selected' : ''}>A4 (India, Europe)</option></select></label>
      <label class="f">Accent colour<input data-path="accent" type="color" value="${esc(d.accent || '#1A5276')}"></label>
    </div>
    <div class="adders">
      <button class="btn sm" type="button" data-act="versions">Published versions…</button>
      <button class="btn sm" type="button" data-act="copy-text">Copy as plain text</button>
      <button class="btn sm" type="button" data-act="export">Export JSON</button>
      <button class="btn sm" type="button" data-act="import">Import JSON</button>
      ${published ? '<button class="btn sm" type="button" data-act="revert">Discard draft changes</button>' : ''}
    </div>
    <p class="legend">Formatting in any text: <code>**bold**</code> · <code>*italic*</code> · <code>[text](https://link)</code></p>
  </div></details>`);

  d.sections.forEach((s, si) => {
    const key = s.id;
    const body = [];
    body.push(`<div class="row">${inp(`sections.${si}.title`, s.title, 'Section title')}<label class="f">Show<span class="check"><input type="checkbox" data-path="sections.${si}.hidden" data-invert ${s.hidden ? '' : 'checked'}> On the resume</span></label></div>`);
    if (s.type === 'text') {
      body.push(inp(`sections.${si}.body`, s.body, 'Text', { area: true, rows: 5 }));
      body.push(`<span class="check"><input type="checkbox" data-path="sections.${si}.justify" ${s.justify !== false ? 'checked' : ''}> Justify</span>`);
    } else if (s.type === 'skills') {
      s.items.forEach((it, ii) => body.push(`<div class="row3">${inp(`sections.${si}.items.${ii}.label`, it.label, 'Label', { ph: 'Languages' })}${inp(`sections.${si}.items.${ii}.value`, it.value, 'Values', { ph: 'JavaScript, Python, SQL' })}${tools(`item-${si}`, ii, s.items.length)}</div>`));
      body.push(`<div class="adders"><button class="btn sm" type="button" data-act="skill-add" data-s="${si}">+ Line</button></div>`);
    } else if (s.type === 'list') {
      body.push(inp(`sections.${si}.items`, s.items.join('\n'), 'Bullets', { area: true, rows: Math.max(3, s.items.length * 2 + 1), hint: 'one per line' }));
      body.push(`<span class="check"><input type="checkbox" data-path="sections.${si}.justify" ${s.justify ? 'checked' : ''}> Justify</span>`);
    } else {
      s.items.forEach((it, ii) => body.push(`<div class="item"><div class="item-head">${esc(it.title || `Entry ${ii + 1}`)}${tools(`item-${si}`, ii, s.items.length)}</div>
        <div class="row">${inp(`sections.${si}.items.${ii}.title`, it.title, 'Title', { ph: 'Software Development Engineer' })}${inp(`sections.${si}.items.${ii}.org`, it.org, 'Organisation (accent)', { ph: 'Company — optional' })}</div>
        <div class="row">${inp(`sections.${si}.items.${ii}.date`, it.date, 'Right side', { ph: 'Jun 2025 – Present' })}${inp(`sections.${si}.items.${ii}.url`, it.url || '', 'Link (optional)', { ph: 'https://' })}</div>
        <div class="row">${inp(`sections.${si}.items.${ii}.sub`, it.sub, 'Second line', { ph: 'Tech stack or institution' })}${inp(`sections.${si}.items.${ii}.subRight`, it.subRight, 'Second line, right', { ph: 'Dates or location' })}</div>
        ${inp(`sections.${si}.items.${ii}.bullets`, (it.bullets || []).join('\n'), 'Bullets', { area: true, rows: Math.max(3, (it.bullets || []).length * 2 + 1), hint: 'one per line' })}
      </div>`));
      body.push(`<div class="row"><label class="f">Second line style<select data-path="sections.${si}.subStyle"><option value="" ${s.subStyle !== 'muted' ? 'selected' : ''}>Italic, accent colour (tech stack)</option><option value="muted" ${s.subStyle === 'muted' ? 'selected' : ''}>Plain grey (institution)</option></select></label><span></span></div>`);
      body.push(`<div class="adders"><button class="btn sm" type="button" data-act="entry-add" data-s="${si}">+ Entry</button><span class="check"><input type="checkbox" data-path="sections.${si}.justify" ${s.justify ? 'checked' : ''}> Justify bullets</span></div>`);
    }
    h.push(`<details class="card${s.hidden ? ' off' : ''}" data-key="${key}" ${open.has(key) ? 'open' : ''}><summary><span>${esc(s.title || 'Untitled')}</span><span class="kind">${TYPES[s.type]?.name || s.type}</span>${tools('sec', si, d.sections.length)}</summary><div class="card-body">${body.join('')}</div></details>`);
  });

  h.push(`<div class="card"><div class="card-head">Add a section</div><div class="card-body"><div class="adders">${PRESETS.map(([n, t]) => `<button class="btn sm" type="button" data-act="sec-add" data-type="${t}" data-title="${n}">+ ${n}</button>`).join('')}</div></div></div>`);
  $('#rzEdit').innerHTML = h.join('');
}

function setPath(path, value) {
  const keys = path.split('.');
  let o = draft;
  keys.slice(0, -1).forEach((k) => { o = o[k]; });
  o[keys[keys.length - 1]] = value;
}
const ed = $('#rzEdit');
ed.addEventListener('input', (e) => {
  const el = e.target.closest('[data-path]');
  if (!el) return;
  let v = el.type === 'checkbox' ? el.checked : el.value;
  if (el.hasAttribute('data-invert')) v = !v;
  const p = el.dataset.path;
  if (/\.(items|bullets)$/.test(p) && el.tagName === 'TEXTAREA') v = v.split('\n').map((l) => l.replace(/^\s*[•\-*]\s+/, '').trimEnd()).filter((l, i, a) => l || i < a.length - 1);
  setPath(p, v);
  if (/\.hidden$/.test(p)) el.closest('.card').classList.toggle('off', !!v);
  if (/\.title$/.test(p) && /^sections\.\d+\.title$/.test(p)) el.closest('.card').querySelector('summary > span').textContent = el.value || 'Untitled';
  changed();
});
ed.addEventListener('change', (e) => { if (e.target.matches('select, input[type=color]')) changed(); });
ed.addEventListener('toggle', (e) => {
  const k = e.target.dataset?.key; if (!k) return;
  if (e.target.open) open.add(k); else open.delete(k);
}, true);
const move = (arr, i, d) => { const j = i + d; if (j < 0 || j >= arr.length) return; [arr[i], arr[j]] = [arr[j], arr[i]]; };
ed.addEventListener('click', (e) => {
  const b = e.target.closest('[data-act]');
  if (!b) return;
  e.preventDefault(); e.stopPropagation();
  const a = b.dataset.act, i = +b.dataset.i, d = draft;
  if (a === 'contact-add') d.contacts.push({ text: '', url: '' });
  else if (a === 'contact-up') move(d.contacts, i, -1);
  else if (a === 'contact-down') move(d.contacts, i, 1);
  else if (a === 'contact-del') d.contacts.splice(i, 1);
  else if (a === 'sec-up') move(d.sections, i, -1);
  else if (a === 'sec-down') move(d.sections, i, 1);
  else if (a === 'sec-del') { if (!confirm(`Delete the “${d.sections[i].title}” section?`)) return; d.sections.splice(i, 1); }
  else if (a === 'sec-add') {
    const s = { ...TYPES[b.dataset.type].make(), id: uid(), title: b.dataset.title };
    if (b.dataset.title === 'Education') s.subStyle = 'muted';
    d.sections.push(s); open.add(s.id);
  } else if (a.startsWith('item-')) {
    const s = d.sections[+a.split('-')[1]];
    const op = a.split('-')[2];
    if (op === 'up') move(s.items, i, -1);
    else if (op === 'down') move(s.items, i, 1);
    else if (op === 'del') { if (!confirm('Delete this?')) return; s.items.splice(i, 1); }
  } else if (a === 'entry-add') d.sections[+b.dataset.s].items.push(blankEntry());
  else if (a === 'skill-add') d.sections[+b.dataset.s].items.push({ label: '', value: '' });
  else if (a === 'versions') return openVersions();
  else if (a === 'copy-text') { navigator.clipboard.writeText(toText(d)).then(() => toast('Copied as plain text')); return; }
  else if (a === 'export') {
    const blob = new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const l = document.createElement('a');
    l.href = url; l.download = `resume-${new Date().toISOString().slice(0, 10)}.json`; l.click(); setTimeout(() => URL.revokeObjectURL(url), 5000); return;
  } else if (a === 'import') {
    const f = document.createElement('input'); f.type = 'file'; f.accept = 'application/json,.json';
    f.onchange = async () => {
      try { const j = JSON.parse(await f.files[0].text()); if (!j.sections) throw new Error('Not a resume file'); draft = j; normalise(draft); changed(true); toast('Imported into the draft'); } catch (err) { toast(err.message); }
    };
    f.click(); return;
  } else if (a === 'revert') {
    if (!confirm('Replace the draft with the published version?')) return;
    draft = JSON.parse(published.json); normalise(draft);
  }
  changed(true);
});

/* ---------- Versions ---------- */
async function openVersions() {
  const dlg = $('#versionsDlg'); const ul = $('#versionsList');
  ul.innerHTML = '<li>Loading…</li>'; dlg.showModal();
  try {
    const q = F.fs.query(F.fs.collection(F.db, 'versions'), F.fs.orderBy('at', 'desc'), F.fs.limit(30));
    const snap = await F.fs.getDocs(q);
    const rows = snap.docs.map((doc) => ({ id: doc.id, at: tsDate(doc.data().at), data: doc.data().data }));
    ul.innerHTML = rows.length ? rows.map((r, i) => `<li><span>${r.at ? r.at.toLocaleString() : '—'}${i === 0 ? ' · current' : ''}</span><span><button class="btn sm" type="button" data-pdf="${r.id}">PDF</button> <button class="btn sm" type="button" data-restore="${r.id}">Restore to draft</button></span></li>`).join('') : '<li>Nothing published yet.</li>';
    ul.onclick = (e) => {
      const id = e.target.dataset.restore || e.target.dataset.pdf; if (!id) return;
      const r = rows.find((x) => x.id === id); const data = JSON.parse(r.data);
      if (e.target.dataset.pdf) { download(data); return; }
      draft = data; normalise(draft); changed(true); dlg.close(); toast('Restored into the draft. Publish to make it live.');
    };
  } catch (e) { ul.innerHTML = `<li>${esc(e.message)}</li>`; }
}
$$('[data-close]').forEach((b) => b.addEventListener('click', () => b.closest('dialog').close()));

/* ================= Messages ================= */
let messages = [];
let msgKind = 'all';
let msgFilter = 'open';
function initMessages() {
  if (DEMO) {
    const now = Date.now();
    messages = [
      { id: 'a', kind: 'compliment', name: 'Asha', email: 'asha@example.com', text: 'The falling universes are wild. Loved it!', read: false, createdAt: new Date(now - 6e5) },
      { id: 'b', kind: 'help', name: 'Dev', email: '', text: 'How do I use the Fire theme with Tailwind?', read: false, createdAt: new Date(now - 4e6) },
      { id: 'c', kind: 'feedback', name: '', email: '', text: 'Resume download works great on my phone.', read: true, createdAt: new Date(now - 9e7) },
    ];
    drawCounts(); if (currentView !== 'resume' && currentView !== 'about') drawMessages(); faq = [{ q: 'Sample question?', a: 'Sample answer.' }]; drawFaq(); return;
  }
  const q = F.fs.query(F.fs.collection(F.db, 'messages'), F.fs.orderBy('createdAt', 'desc'), F.fs.limit(500));
  F.fs.onSnapshot(q, (snap) => {
    messages = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    drawCounts();
    if (['inbox', 'feedback', 'compliment', 'help'].includes(currentView)) drawMessages();
  }, (e) => { $('#msgStatus').textContent = `Couldn’t load messages: ${e.code || e.message}`; });
  initFaq();
}
function drawCounts() {
  const unread = messages.filter((m) => !m.read && !m.archived);
  $$('.badge[data-count]').forEach((b) => {
    const n = b.dataset.count === 'all' ? unread.length : unread.filter((m) => m.kind === b.dataset.count).length;
    b.textContent = n; b.hidden = !n;
  });
  document.title = unread.length ? `(${unread.length}) Studio` : 'Studio — Thrishank Kuntimaddi';
  if ('setAppBadge' in navigator) (unread.length ? navigator.setAppBadge(unread.length) : navigator.clearAppBadge()).catch(() => {});
}
const TITLES = { all: 'Inbox', feedback: 'Feedback', compliment: 'Compliments', help: 'Help center', message: 'Messages' };
function drawMessages() {
  $('#msgTitle').textContent = TITLES[msgKind];
  $('#faqBox').hidden = msgKind !== 'help';
  const ofKind = messages.filter((m) => msgKind === 'all' || m.kind === msgKind);
  const filters = [['open', 'Open'], ['unread', 'Unread'], ['starred', 'Starred'], ['archived', 'Archived']];
  if (msgKind === 'all') filters.splice(1, 0, ...Object.entries(KINDS).map(([k, v]) => [`k:${k}`, v]));
  $('#msgChips').innerHTML = filters.map(([k, n]) => `<button class="chip" role="tab" type="button" data-f="${k}" aria-selected="${msgFilter === k}">${esc(n)}</button>`).join('');
  const list = ofKind.filter((m) => {
    if (msgFilter === 'archived') return m.archived;
    if (m.archived) return false;
    if (msgFilter === 'unread') return !m.read;
    if (msgFilter === 'starred') return m.starred;
    if (msgFilter.startsWith('k:')) return m.kind === msgFilter.slice(2);
    return true;
  });
  const unread = ofKind.filter((m) => !m.read && !m.archived).length;
  $('#msgStatus').textContent = `${ofKind.filter((m) => !m.archived).length} total · ${unread} unread`;
  $('#msgList').innerHTML = list.length ? list.map((m) => {
    const d = tsDate(m.createdAt);
    const reply = m.email ? `mailto:${encodeURIComponent(m.email)}?subject=${encodeURIComponent(`Re: your ${(KINDS[m.kind] || 'message').toLowerCase()} on my portfolio`)}&body=${encodeURIComponent(`Hi ${m.name || ''},\n\n\n\n> ${String(m.text).split('\n').join('\n> ')}`)}` : '';
    return `<li class="msg${m.read ? '' : ' unread'}" data-id="${m.id}">
      <div class="msg-head"><span class="msg-kind ${esc(m.kind)}">${esc(KINDS[m.kind] || m.kind)}</span><b>${esc(m.name || 'Anonymous')}</b>${m.email ? `<span>${esc(m.email)}</span>` : ''}<time title="${d ? d.toLocaleString() : ''}">${ago(d)}</time></div>
      <p class="msg-text">${esc(m.text)}</p>
      <div class="msg-actions">
        ${reply ? `<a class="btn sm" href="${reply}">Reply by email</a>` : ''}
        <button class="btn sm" type="button" data-m="read">${m.read ? 'Mark unread' : 'Mark read'}</button>
        <button class="btn sm" type="button" data-m="star">${m.starred ? '★ Starred' : '☆ Star'}</button>
        <button class="btn sm" type="button" data-m="archive">${m.archived ? 'Unarchive' : 'Archive'}</button>
        <button class="btn sm danger" type="button" data-m="delete">Delete</button>
        ${m.page ? `<span class="legend">from ${esc(m.page)}</span>` : ''}
      </div></li>`;
  }).join('') : `<li class="empty">${msgFilter === 'open' ? 'Nothing here yet. Messages from the site’s form land here instantly.' : 'Nothing here.'}</li>`;
}
$('#msgChips').addEventListener('click', (e) => { const c = e.target.closest('[data-f]'); if (c) { msgFilter = c.dataset.f; drawMessages(); } });
$('#msgList').addEventListener('click', async (e) => {
  const b = e.target.closest('[data-m]'); const li = e.target.closest('[data-id]');
  if (!li) return;
  const m = messages.find((x) => x.id === li.dataset.id);
  const ref = F.fs.doc(F.db, 'messages', m.id);
  try {
    if (!b) { if (!m.read && !e.target.closest('a')) await F.fs.updateDoc(ref, { read: true }); return; }
    const a = b.dataset.m;
    if (a === 'read') await F.fs.updateDoc(ref, { read: !m.read });
    else if (a === 'star') await F.fs.updateDoc(ref, { starred: !m.starred });
    else if (a === 'archive') await F.fs.updateDoc(ref, { archived: !m.archived, read: true });
    else if (a === 'delete' && confirm('Delete this message for good?')) await F.fs.deleteDoc(ref);
  } catch (err) { toast(err.code || err.message); }
});
$('#markAll').addEventListener('click', async () => {
  const todo = messages.filter((m) => !m.read && (msgKind === 'all' || m.kind === msgKind));
  if (!todo.length) return toast('All read');
  const batch = F.fs.writeBatch(F.db);
  todo.slice(0, 450).forEach((m) => batch.update(F.fs.doc(F.db, 'messages', m.id), { read: true }));
  await batch.commit().catch((e) => toast(e.message));
});

/* ================= Help-centre answers (site/help) ================= */
let faq = [];
async function initFaq() {
  try {
    const s = await F.fs.getDoc(F.fs.doc(F.db, 'site', 'help'));
    faq = s.exists() ? JSON.parse(s.data().data) : [
      { q: 'Can I use your themes in my own project?', a: 'Yes. Every theme kit on the Studio page is free: copy the prompt into your AI coding tool, or download the .css, .csv and .md files.' },
      { q: 'Are you open to work?', a: 'Yes, frontend and UI roles, freelance work and collaborations. Send a message below or email me.' },
    ];
  } catch { faq = []; }
  drawFaq();
}
function drawFaq() {
  $('#faqList').innerHTML = faq.map((f, i) => `<li class="item"><div class="item-head">Question ${i + 1}${tools('faq', i, faq.length)}</div>${inp(`${i}.q`, f.q, 'Question')}${inp(`${i}.a`, f.a, 'Answer', { area: true, rows: 3 })}</li>`).join('') || '<li class="empty">No answers yet.</li>';
}
$('#faqList').addEventListener('input', (e) => { const p = e.target.dataset.path?.split('.'); if (p) faq[+p[0]][p[1]] = e.target.value; });
$('#faqList').addEventListener('click', (e) => {
  const b = e.target.closest('[data-act]'); if (!b) return;
  const i = +b.dataset.i;
  if (b.dataset.act === 'faq-up') move(faq, i, -1);
  else if (b.dataset.act === 'faq-down') move(faq, i, 1);
  else if (b.dataset.act === 'faq-del') faq.splice(i, 1);
  drawFaq();
});
$('#faqAdd').addEventListener('click', () => { faq.push({ q: '', a: '' }); drawFaq(); });
$('#faqPublish').addEventListener('click', async () => {
  try {
    await F.fs.setDoc(F.fs.doc(F.db, 'site', 'help'), { data: JSON.stringify(faq.filter((f) => f.q.trim())), updatedAt: F.fs.serverTimestamp() });
    toast('Answers published to the site');
  } catch (e) { toast(e.code || e.message); }
});

/* keep "x min ago" fresh */
setInterval(() => { if (draft) updateStatus(); }, 60000);
window.addEventListener('beforeunload', (e) => { if (dirty) { saveDraft(); e.preventDefault(); } });

boot();
