/* =========================================================
   Studio → Links: a tailored link per company.
     https://thrishankkuntimaddi.github.io/?for=acme-k3j9x2
   The visitor sees "Hi Acme team" at the top and the resume
   you chose for them. Reports show when it was opened, how
   long they stayed and whether they took the resume.
     links/{code}        public by exact code (no listing)
                         { company, hello, resume, off }
     linkFiles/{code}_n  an uploaded PDF's parts
     private/links       your private notes and which library
                         resume each link uses
   ========================================================= */
const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const tsDate = (t) => (t?.toDate ? t.toDate() : t ? new Date(t) : null);
const SITE = 'https://thrishankkuntimaddi.github.io/';
const dur = (s) => { s = Math.round(s || 0); if (!s) return '—'; if (s < 60) return `${s}s`; const m = Math.floor(s / 60); return m < 60 ? `${m}m ${String(s % 60).padStart(2, '0')}s` : `${Math.floor(m / 60)}h ${m % 60}m`; };
const when = (d) => (d ? new Date(d).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—');
const slug = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 24) || 'link';
const rnd = () => { const a = new Uint8Array(6); crypto.getRandomValues(a); return [...a].map((x) => 'abcdefghjkmnpqrstuvwxyz23456789'[x % 31]).join(''); };

let F, toast, DEMO;
let links = [];      // [{ code, company, hello, resume, off, updatedAt, note, resumeId, createdAt }]
let library = [];    // [{ id, title, json }]
let stats = {};      // code -> { visits, people, secs, resume, last, list }
let editing = null;  // code being edited ('' = new)
let loaded = false;

const linkUrl = (code, page = '') => `${SITE}${page}?for=${code}`;
const resumeOf = (id) => library.find((r) => r.id === id);
const isPdf = (d) => d && d.kind === 'pdf' && d.parts;

async function load() {
  $('#lkStatus').textContent = 'Loading…';
  if (DEMO) {
    library = [{ id: 'main', title: 'Main resume', json: '{"sections":[]}' }, { id: 'fe', title: 'Frontend roles', json: '{"sections":[]}' }];
    links = [
      { code: 'acme-k3j9x2', company: 'Acme', hello: 'Thanks for taking a look. This is set up for the Acme frontend role.', resume: { sections: [] }, resumeId: 'fe', note: 'Applied 12 Nov, recruiter Priya', off: false, createdAt: new Date(Date.now() - 6e8), updatedAt: new Date(Date.now() - 6e8) },
      { code: 'globex-8mx2qa', company: 'Globex', hello: '', resume: null, resumeId: '', note: '', off: true, createdAt: new Date(Date.now() - 2e9), updatedAt: new Date(Date.now() - 2e9) },
    ];
    stats = { 'acme-k3j9x2': { visits: 3, people: 2, secs: 412, resume: 1, last: Date.now() - 36e5, list: [] } };
    loaded = true; draw(); return;
  }
  try {
    const [ls, priv, lib] = await Promise.all([
      F.fs.getDocs(F.fs.collection(F.db, 'links')),
      F.fs.getDoc(F.fs.doc(F.db, 'private', 'links')),
      F.fs.getDocs(F.fs.query(F.fs.collection(F.db, 'resumes'), F.fs.orderBy('updatedAt', 'desc'))),
    ]);
    const meta = priv.exists() ? JSON.parse(priv.data().data || '{}') : {};
    library = lib.docs.map((d) => ({ id: d.id, title: d.data().title || 'Untitled', json: d.data().data }));
    links = ls.docs.map((d) => { const v = JSON.parse(d.data().data || '{}'); return { code: d.id, ...v, updatedAt: tsDate(d.data().updatedAt), ...(meta[d.id] || {}), createdAt: meta[d.id]?.createdAt ? new Date(meta[d.id].createdAt) : tsDate(d.data().updatedAt) }; })
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } catch (e) { $('#lkStatus').textContent = `Couldn’t load links: ${e.code || e.message}`; return; }
  loaded = true;
  draw();
  loadStats();
}
async function loadStats() {
  await Promise.all(links.map(async (l) => {
    try {
      const snap = await F.fs.getDocs(F.fs.query(F.fs.collection(F.db, 'visits'), F.fs.where('for', '==', l.code), F.fs.limit(500)));
      const rows = snap.docs.map((d) => ({ ...d.data(), at: tsDate(d.data().at)?.getTime() || 0 })).sort((a, b) => b.at - a.at);
      const visits = rows.filter((r) => r.type === 'visit');
      stats[l.code] = {
        visits: visits.length, people: new Set(visits.map((r) => r.vid)).size,
        secs: rows.filter((r) => r.type === 'leave').reduce((a, r) => a + (r.secs || 0), 0),
        resume: rows.filter((r) => r.type === 'resume').length, last: rows[0]?.at || 0, list: rows.slice(0, 12),
      };
    } catch { /* shows "—" */ }
  }));
  draw();
}

function form(l) {
  const opts = `<option value="">Same as the website</option>${library.map((r) => `<option value="${esc(r.id)}" ${l?.resumeId === r.id ? 'selected' : ''}>${esc(r.title)}${isPdf(safe(r.json)) ? ' (PDF)' : ''}</option>`).join('')}`;
  return `<form class="card lk-form" data-code="${esc(l?.code || '')}">
    <h2>${l ? `Edit “${esc(l.company)}”` : 'New tailored link'}</h2>
    <div class="row"><label class="f">Company or person<input name="company" maxlength="60" required value="${esc(l?.company || '')}" placeholder="Acme"></label>
    <label class="f">Resume they see<select name="resumeId">${opts}</select></label></div>
    <label class="f">Hello line at the top <small>optional · shown to them</small><textarea name="hello" rows="2" maxlength="220" placeholder="Thanks for taking a look. This page and my resume are set up for ${esc(l?.company || 'Acme')}.">${esc(l?.hello || '')}</textarea></label>
    <label class="f">Private note <small>only you see this</small><input name="note" maxlength="200" value="${esc(l?.note || '')}" placeholder="Applied 12 Nov, frontend role, recruiter Priya"></label>
    <div class="adders"><button class="btn primary" type="submit">${l ? 'Save' : 'Create link'}</button><button class="btn" type="button" data-lk="cancel">Cancel</button></div>
  </form>`;
}
const safe = (j) => { try { return JSON.parse(j); } catch { return null; } };

function draw() {
  if (!loaded) return;
  const on = links.filter((l) => !l.off).length;
  $('#lkStatus').textContent = `${links.length} link${links.length === 1 ? '' : 's'} · ${on} on`;
  const items = links.map((l) => {
    const s = stats[l.code];
    const r = resumeOf(l.resumeId);
    const stale = r && l.resume && JSON.stringify(safe(r.json)) !== JSON.stringify(l.resume);
    return `<li class="card lk${l.off ? ' off' : ''}" data-code="${esc(l.code)}">
      <div class="lk-head">
        <div><h3>${esc(l.company)} ${l.off ? '<b class="lib-badge">Off</b>' : ''}</h3>
          <p class="lk-url"><code>${esc(linkUrl(l.code))}</code></p>
          ${l.note ? `<p class="legend">${esc(l.note)}</p>` : ''}</div>
        <div class="lk-kpis">
          <span><b>${s ? s.visits : '—'}</b>opens</span><span><b>${s ? s.people : '—'}</b>people</span>
          <span><b>${s ? dur(s.secs) : '—'}</b>time spent</span><span><b>${s ? s.resume : '—'}</b>resume ↓</span>
        </div>
      </div>
      <p class="legend">Resume: <b>${esc(r ? r.title : l.resume ? 'a saved copy' : 'same as the website')}</b>${stale ? ' · edited since <button class="link" type="button" data-lk="sync">use the latest</button>' : ''} · Last opened: ${s?.last ? esc(when(s.last)) : 'not yet'}</p>
      ${s?.list?.length ? `<details class="lk-log"><summary>Activity</summary><ul>${s.list.map((v) => `<li><time>${esc(when(v.at))}</time> ${esc({ visit: 'Opened', leave: `Left after ${dur(v.secs)} · scrolled ${v.scroll || 0}%`, resume: 'Took the resume', message: 'Sent a message', kit: 'Took a theme kit' }[v.type] || v.type)} · ${esc([v.city, v.country].filter(Boolean).join(', '))} · ${esc(v.device || '')}</li>`).join('')}</ul></details>` : ''}
      <div class="lib-actions">
        <button class="btn sm primary" type="button" data-lk="copy">Copy link</button>
        <button class="btn sm" type="button" data-lk="copy-read">Copy quick-read link</button>
        <a class="btn sm" href="${esc(linkUrl(l.code))}" target="_blank" rel="noopener">Open ↗</a>
        <button class="btn sm" type="button" data-lk="edit">Edit</button>
        <button class="btn sm" type="button" data-lk="toggle">${l.off ? 'Turn on' : 'Turn off'}</button>
        <button class="btn sm danger" type="button" data-lk="del">Delete</button>
      </div>
    </li>`;
  }).join('');
  $('#lkBody').innerHTML = (editing !== null ? form(links.find((l) => l.code === editing)) : '')
    + `<ul class="lk-list">${items || '<li class="empty">No links yet. Make one for each company you apply to: they see their name and the resume you picked, and you see when they open it.</li>'}</ul>`;
}

async function snapshot(resumeId, code, batch) {
  if (!resumeId) return null;
  const r = resumeOf(resumeId); if (!r) return null;
  const data = safe(r.json);
  if (isPdf(data) && !DEMO) { // copy the file where the link can read it
    const snaps = await Promise.all([...Array(data.parts)].map((_, n) => F.fs.getDoc(F.fs.doc(F.db, 'resumeFiles', `${resumeId}_${n}`))));
    snaps.forEach((x, n) => batch.set(F.fs.doc(F.db, 'linkFiles', `${code}_${n}`), { data: x.data()?.data || '', updatedAt: F.fs.serverTimestamp() }));
  }
  return data;
}
async function savePrivate() {
  if (DEMO) return;
  const meta = Object.fromEntries(links.map((l) => [l.code, { note: l.note || '', resumeId: l.resumeId || '', createdAt: (l.createdAt || new Date()).getTime() }]));
  await F.fs.setDoc(F.fs.doc(F.db, 'private', 'links'), { data: JSON.stringify(meta), updatedAt: F.fs.serverTimestamp() });
}
async function save(formEl) {
  const f = new FormData(formEl);
  const company = String(f.get('company') || '').trim();
  if (!company) { toast('Add the company name'); return; }
  const code = formEl.dataset.code || `${slug(company)}-${rnd()}`;
  const old = links.find((l) => l.code === code);
  const l = { ...(old || { createdAt: new Date(), off: false }), code, company, hello: String(f.get('hello') || '').trim(), note: String(f.get('note') || '').trim(), resumeId: String(f.get('resumeId') || '') };
  try {
    const batch = DEMO ? null : F.fs.writeBatch(F.db);
    l.resume = DEMO ? (l.resumeId ? { sections: [] } : null) : await snapshot(l.resumeId, code, batch);
    if (batch) { batch.set(F.fs.doc(F.db, 'links', code), { data: JSON.stringify({ company: l.company, hello: l.hello, resume: l.resume, off: !!l.off }), updatedAt: F.fs.serverTimestamp() }); await batch.commit(); }
    l.updatedAt = new Date();
    links = old ? links.map((x) => (x.code === code ? l : x)) : [l, ...links];
    await savePrivate();
    editing = null; draw();
    if (!old) { await copy(linkUrl(code)); toast('Link created and copied. Paste it in your application or email.', 3500); } else toast('Saved');
  } catch (e) { toast(e.code || e.message, 4000); }
}
async function copy(text) {
  try { await navigator.clipboard.writeText(text); } catch { prompt('Copy this link:', text); }
}

export function initLinks(ctx) {
  ({ F, toast, DEMO } = ctx);
  $('#lkNew').addEventListener('click', () => { editing = ''; draw(); $('#lkBody input[name=company]')?.focus(); window.scrollTo(0, 0); });
  $('#lkRefresh').addEventListener('click', () => { loaded = false; load(); });
  $('#lkBody').addEventListener('submit', (e) => { e.preventDefault(); save(e.target); });
  $('#lkBody').addEventListener('click', async (e) => {
    const b = e.target.closest('[data-lk]'); if (!b) return;
    const a = b.dataset.lk;
    if (a === 'cancel') { editing = null; draw(); return; }
    const l = links.find((x) => x.code === b.closest('[data-code]')?.dataset.code); if (!l) return;
    try {
      if (a === 'copy') { await copy(linkUrl(l.code)); toast('Link copied'); }
      else if (a === 'copy-read') { await copy(linkUrl(l.code, 'read.html')); toast('Quick-read link copied'); }
      else if (a === 'edit') { editing = l.code; draw(); window.scrollTo(0, 0); }
      else if (a === 'toggle' || a === 'sync') {
        if (a === 'toggle') l.off = !l.off;
        const batch = DEMO ? null : F.fs.writeBatch(F.db);
        if (a === 'sync') l.resume = DEMO ? l.resume : await snapshot(l.resumeId, l.code, batch);
        if (batch) { batch.set(F.fs.doc(F.db, 'links', l.code), { data: JSON.stringify({ company: l.company, hello: l.hello || '', resume: l.resume || null, off: !!l.off }), updatedAt: F.fs.serverTimestamp() }); await batch.commit(); }
        draw(); toast(a === 'sync' ? 'The link shows the latest version now' : l.off ? 'Turned off: the link opens the normal site' : 'Turned on');
      } else if (a === 'del') {
        if (!confirm(`Delete the link for “${l.company}”? Anyone who has it just sees the normal site.`)) return;
        if (!DEMO) {
          const batch = F.fs.writeBatch(F.db);
          batch.delete(F.fs.doc(F.db, 'links', l.code));
          if (isPdf(l.resume)) for (let n = 0; n < l.resume.parts; n++) batch.delete(F.fs.doc(F.db, 'linkFiles', `${l.code}_${n}`));
          await batch.commit();
        }
        links = links.filter((x) => x !== l); await savePrivate(); draw(); toast('Deleted');
      }
    } catch (err) { toast(err.code || err.message, 4000); }
  });
}
export function showLinks() { if (!loaded) load(); }
