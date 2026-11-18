/* =========================================================
   Studio → Content: everything the website says.
   Saved to site/content (public read, owner write) and
   applied on the site by lib/content-live.js.
   ========================================================= */
import { PROJECTS_SEED } from '../lib/projects-seed.js?v=22';
import { TEXT_SEED } from '../lib/text-seed.js?v=22';
import { STORIES, ASK, ASK_SUGGEST, CHANGELOG } from '../content.js?v=22';
import { keypad } from '../lib/content-live.js?v=22';
import { BASE, LOOP, NAMES } from '../worlds.js?v=22';
import { md, readMins } from '../lib/md.js?v=1';

const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clone = (o) => JSON.parse(JSON.stringify(o));
const uid = () => Math.random().toString(36).slice(2, 8);
const lines = (a) => (a || []).join('\n');
const unlines = (s) => String(s || '').split('\n').map((x) => x.trim()).filter(Boolean);

const PREVIEWS = ['Oruinwan', 'Expense Tracker', 'SentinelFlight', 'LearnViaNotes'];
const SCENES = ['lagrange', 'binary', 'debris', 'solar', 'figure8', 'chaos', 'studio'];
const SECTIONS = { hero: 'Top of the page', work: 'Projects heading', poelys: 'Poelys', more: 'More work heading', about: 'About me', contact: 'Contact', post: 'The end (resume and games)', footer: 'Footer' };
const TABS = [['projects', 'Projects'], ['text', 'Page text'], ['stories', 'Stories'], ['notes', 'Notes'], ['ask', 'Ask Pip'], ['news', 'What’s new']];
const WORLDS = [...BASE, ...LOOP];

let F, toast, DEMO, data, saved = '', tab = 'projects';
const open = new Set();

function defaults() {
  return { text: {}, projects: clone(PROJECTS_SEED), stories: clone(STORIES), ask: clone(ASK), askSuggest: clone(ASK_SUGGEST), changelog: clone(CHANGELOG), notes: [] };
}

/* ---------- small builders ---------- */
const inp = (path, val, label, attrs = '') => `<label class="f">${esc(label)}<input data-c="${path}" value="${esc(val)}" ${attrs}></label>`;
const area = (path, val, label, rows = 3, hint = '') => `<label class="f">${esc(label)}${hint ? ` <small>${esc(hint)}</small>` : ''}<textarea data-c="${path}" rows="${rows}">${esc(val)}</textarea></label>`;
const sel = (path, val, label, opts) => `<label class="f">${esc(label)}<select data-c="${path}">${opts.map(([v, n]) => `<option value="${esc(v)}" ${v === (val || '') ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select></label>`;
const tools = (list, i, n) => `<span class="sec-tools"><button class="icon-btn" type="button" data-cm="up" data-list="${list}" data-i="${i}" ${i === 0 ? 'disabled' : ''}>↑</button><button class="icon-btn" type="button" data-cm="down" data-list="${list}" data-i="${i}" ${i === n - 1 ? 'disabled' : ''}>↓</button><button class="icon-btn" type="button" data-cm="del" data-list="${list}" data-i="${i}" title="Delete">✕</button></span>`;
const box = (key, title, sub, body, off = false, extra = '') => `<details class="card${off ? ' off' : ''}" data-key="${esc(key)}" ${open.has(key) ? 'open' : ''}><summary><span>${esc(title || 'Untitled')}</span>${sub ? `<span class="kind">${esc(sub)}</span>` : ''}${extra}</summary><div class="card-body">${body}</div></details>`;

/* ---------- tabs ---------- */
function projectsTab() {
  const P = data.projects;
  const storyOpts = [['', 'No story'], ...Object.keys(data.stories).map((k) => [k, data.stories[k].name || k])];
  const main = P.main.map((p, i) => box(`m-${p.id}`, p.name, p.hidden ? 'hidden' : `Project ${i + 1}`, `
      <div class="row">${inp(`projects.main.${i}.name`, p.name, 'Name')}${inp(`projects.main.${i}.label`, p.label, 'Window title', 'placeholder="NAME.SYS"')}</div>
      ${area(`projects.main.${i}.what`, p.what, 'One line: what it is', 2)}
      ${area(`projects.main.${i}.points`, lines(p.points), 'Three points', 4, 'one per line')}
      ${inp(`projects.main.${i}.chips`, (p.chips || []).join(', '), 'Tech (comma separated)')}
      <div class="row">${inp(`projects.main.${i}.live`, p.live, 'Live link')}${inp(`projects.main.${i}.repo`, p.repo, 'Code link (GitHub)')}</div>
      ${area(`projects.main.${i}.tagline`, p.tagline, 'Note on the window', 2)}
      <div class="row">${sel(`projects.main.${i}.preview`, p.preview, 'Preview in the window', [...PREVIEWS.map((x) => [x, `${x} (hand-made)`]), ['', 'Simple, from its own words']])}${sel(`projects.main.${i}.scene`, p.scene, '3D scene behind it', SCENES.map((x) => [x, x]))}</div>
      <div class="row">${sel(`projects.main.${i}.story`, p.story, '“The story” button', storyOpts)}<label class="f">Show<span class="check"><input type="checkbox" data-c="projects.main.${i}.hidden" data-invert ${p.hidden ? '' : 'checked'}> On the website</span></label></div>
    `, p.hidden, tools('projects.main', i, P.main.length))).join('');
  const more = P.more.map((p, i) => box(`o-${p.id}`, p.name, p.hidden ? 'hidden' : p.status, `
      <div class="row">${inp(`projects.more.${i}.name`, p.name, 'Name')}${inp(`projects.more.${i}.link`, p.link, 'Link')}</div>
      ${area(`projects.more.${i}.what`, p.what, 'One line', 2)}
      <div class="row">${inp(`projects.more.${i}.stack`, p.stack, 'Tech line', 'placeholder="React · Firebase"')}${inp(`projects.more.${i}.status`, p.status, 'Label', 'placeholder="Live / In progress / Hardware"')}</div>
      <div class="row">${inp(`projects.more.${i}.word`, p.word, `Keypad word → code ${keypad(p.word) || '—'}`, 'placeholder="MENU"')}<label class="f">Options<span class="check"><input type="checkbox" data-c="projects.more.${i}.live" ${p.live ? 'checked' : ''}> Green “live” label</span><span class="check"><input type="checkbox" data-c="projects.more.${i}.hidden" data-invert ${p.hidden ? '' : 'checked'}> On the website</span></label></div>
    `, p.hidden, tools('projects.more', i, P.more.length))).join('');
  const orbit = P.orbit.map((p, i) => box(`g-${p.id}`, p.name, p.hidden ? 'hidden' : `:${keypad(p.word)}`, `
      <div class="row">${inp(`projects.orbit.${i}.name`, p.name, 'Name')}${inp(`projects.orbit.${i}.link`, p.link, 'Link')}</div>
      <div class="row">${inp(`projects.orbit.${i}.word`, p.word, `Keypad word → code ${keypad(p.word) || '—'}`)}<label class="f">Show<span class="check"><input type="checkbox" data-c="projects.orbit.${i}.hidden" data-invert ${p.hidden ? '' : 'checked'}> On the website</span></label></div>
    `, p.hidden, tools('projects.orbit', i, P.orbit.length))).join('');
  return `<h2 class="ct-h">Main projects <small>the big cards with a window</small></h2>${main}<div class="adders"><button class="btn sm" type="button" data-cm="add-main">+ Main project</button></div>
    <h2 class="ct-h">More work <small>the smaller cards</small></h2>${more}<div class="adders"><button class="btn sm" type="button" data-cm="add-more">+ Small project</button></div>
    <h2 class="ct-h">Studio orbit <small>the globes under Poelys, each with its keypad code</small></h2>${orbit}<div class="adders"><button class="btn sm" type="button" data-cm="add-orbit">+ Globe</button></div>`;
}
function textTab() {
  const by = {};
  Object.entries(TEXT_SEED).forEach(([k, v]) => { (by[v.section] ||= []).push([k, v]); });
  return `<p class="legend">Every text block on the home page. Change any of them; “Reset” brings back the original. Simple HTML works: &lt;em&gt;, &lt;b&gt;, &lt;br&gt;, &lt;a href="…"&gt;.</p>` + Object.entries(by).map(([sec, list]) => box(`t-${sec}`, SECTIONS[sec] || sec, `${list.filter(([k]) => k in data.text).length || ''} ${list.filter(([k]) => k in data.text).length ? 'changed' : ''}`,
    list.map(([k, v]) => {
      const cur = k in data.text ? data.text[k] : v.html;
      return `<div class="ct-text${k in data.text ? ' changed' : ''}"><label class="f"><span>${esc(v.tag)} · ${esc(k)}${k in data.text ? ' <button class="link" type="button" data-cm="reset-text" data-k="' + esc(k) + '">Reset</button>' : ''}</span><textarea data-text="${esc(k)}" rows="${Math.min(6, Math.max(1, Math.ceil(cur.length / 70)))}">${esc(cur)}</textarea></label></div>`;
    }).join(''))).join('');
}
const pairs = (arr, a, b) => (arr || []).map((x) => (Array.isArray(x) ? `${x[0]} — ${x[1]}` : `${x[a]} — ${x[b]}`)).join('\n');
function storiesTab() {
  return `<p class="legend">The “The story” sheets on the main projects. Link a story to a project in Projects.</p>` + Object.entries(data.stories).map(([id, s]) => box(`s-${id}`, s.name || id, id, `
    <div class="row">${inp(`stories.${id}.name`, s.name, 'Name')}${inp(`stories.${id}.word`, s.word, `Keypad word → code ${keypad(s.word) || '—'}`)}</div>
    ${inp(`stories.${id}.line`, s.line, 'One line')}
    ${inp(`stories.${id}.pip`, s.pip, 'Pip says when it opens')}
    ${area(`stories.${id}.problem`, s.problem, 'The problem', 3)}
    ${area(`stories.${id}.built`, s.built, 'What I built', 4)}
    ${area(`stories.${id}.decisions`, pairs(s.decisions, 'd', 'why'), 'Decisions and why', 5, 'one per line: decision — why')}
    ${area(`stories.${id}.hard`, pairs(s.hard, 'd', 'fix'), 'What was hard', 3, 'one per line: problem — fix')}
    ${area(`stories.${id}.numbers`, pairs(s.numbers), 'Numbers', 3, 'one per line: 1,091 — commits')}
    <div class="row">${inp(`stories.${id}.live`, s.live, 'Live link')}${inp(`stories.${id}.repo`, s.repo, 'Code link')}</div>
    <div class="adders"><button class="btn sm danger" type="button" data-cm="del-story" data-id="${esc(id)}">Delete story</button></div>
  `)).join('') + '<div class="adders"><button class="btn sm" type="button" data-cm="add-story">+ Story</button></div>';
}
function notesTab() {
  const worldOpts = [['', 'Surprise me (changes every visit)'], ...WORLDS.map((w) => [w, `${NAMES[w]}${LOOP.includes(w) ? ' (dark)' : ''}`])];
  return `<p class="legend">Short posts on the website at <b>notes.html</b>, each shown in its own universe. A “Notes” link appears in the site’s menu once one is on. Formatting: <code>## Heading</code>, <code>**bold**</code>, <code>*italic*</code>, <code>[link](https://…)</code>, <code>- list</code>, <code>&gt; quote</code>, <code>\`code\`</code>.</p>`
    + data.notes.map((n, i) => box(`w-${n.id}`, n.title, n.hidden ? 'draft' : `${n.date} · ${readMins(n.body)} min`, `
      <div class="row">${inp(`notes.${i}.title`, n.title, 'Title', 'maxlength="120"')}${inp(`notes.${i}.date`, n.date, 'Date', 'type="date"')}</div>
      <div class="row">${sel(`notes.${i}.world`, n.world, 'Universe', worldOpts)}<label class="f">Show<span class="check"><input type="checkbox" data-c="notes.${i}.hidden" data-invert ${n.hidden ? '' : 'checked'}> On the website</span></label></div>
      ${inp(`notes.${i}.line`, n.line, 'One line under the title (optional)', 'maxlength="200"')}
      ${area(`notes.${i}.body`, n.body, 'The note', 12)}
      <details class="note-preview"><summary>Preview</summary><div class="doc">${md(n.body)}</div></details>
    `, n.hidden, tools('notes', i, data.notes.length))).join('') + '<div class="adders"><button class="btn sm" type="button" data-cm="add-note">+ Note</button></div>';
}
function askTab() {
  return `<p class="legend">Pip answers only from these. Keywords: words a visitor might type. Buttons: one per line, “Label | action” where action is a link, resume, quick, copy, contact or story:&lt;id&gt;.</p>
    ${area('askSuggest', lines(data.askSuggest), 'Suggested questions', 4, 'one per line')}` +
    data.ask.map((a, i) => box(`a-${i}`, (a.k || []).slice(0, 4).join(', '), '', `
      ${inp(`ask.${i}.k`, (a.k || []).join(', '), 'Keywords (comma separated)')}
      ${area(`ask.${i}.a`, a.a, 'Pip’s answer', 3)}
      ${area(`ask.${i}.b`, (a.b || []).map(([l, x]) => `${l} | ${x}`).join('\n'), 'Buttons', 2, 'Label | action')}
    `, false, tools('ask', i, data.ask.length))).join('') + '<div class="adders"><button class="btn sm" type="button" data-cm="add-ask">+ Answer</button></div>';
}
function newsTab() {
  return `<p class="legend">Returning visitors see the newest entry once (“Welcome back · what’s new”).</p>` + data.changelog.map((c, i) => box(`n-${c.v}`, `v${c.v} · ${c.date}`, '', `
    <div class="row">${inp(`changelog.${i}.date`, c.date, 'Date', 'type="date"')}<span></span></div>
    ${area(`changelog.${i}.items`, lines(c.items), 'What’s new', 4, 'one per line')}
  `, false, tools('changelog', i, data.changelog.length))).join('') + '<div class="adders"><button class="btn sm" type="button" data-cm="add-news">+ New entry</button></div>';
}

function draw() {
  $('#ctTabs').innerHTML = TABS.map(([k, n]) => `<button class="chip" type="button" data-tab="${k}" aria-selected="${tab === k}">${n}</button>`).join('');
  $('#ctBody').innerHTML = { projects: projectsTab, text: textTab, stories: storiesTab, notes: notesTab, ask: askTab, news: newsTab }[tab]();
  dirty();
}
const now = () => JSON.stringify(data);
function dirty() {
  const d = now() !== saved;
  $('#ctSave').disabled = !d;
  $('#ctStatus').textContent = d ? 'Unsaved changes' : 'Saved · live on the website';
}

/* ---------- editing ---------- */
function get(path) { return path.split('.').reduce((o, k) => (o == null ? o : o[k]), data); }
function set(path, v) {
  const k = path.split('.'); let o = data;
  k.slice(0, -1).forEach((x) => { o = o[x]; });
  o[k[k.length - 1]] = v;
}
function parse(path, raw, el) {
  if (el.type === 'checkbox') return el.hasAttribute('data-invert') ? !el.checked : el.checked;
  if (/\.(points|items)$/.test(path) || path === 'askSuggest') return unlines(raw);
  if (/^projects\.main\.\d+\.chips$/.test(path)) return raw.split(',').map((x) => x.trim()).filter(Boolean);
  if (/^ask\.\d+\.k$/.test(path)) return raw.split(',').map((x) => x.trim().toLowerCase()).filter(Boolean);
  if (/^ask\.\d+\.b$/.test(path)) return unlines(raw).map((l) => l.split('|').map((x) => x.trim())).filter((x) => x[0] && x[1]);
  if (/^stories\.[^.]+\.(decisions|hard)$/.test(path)) { const b = path.endsWith('hard') ? 'fix' : 'why'; return unlines(raw).map((l) => { const [d, ...r] = l.split(/\s+[—–-]\s+/); return { d, [b]: r.join(' — ') }; }); }
  if (/^stories\.[^.]+\.numbers$/.test(path)) return unlines(raw).map((l) => { const [n, ...r] = l.split(/\s+[—–-]\s+/); return [n, r.join(' — ')]; });
  return raw;
}
function onInput(e) {
  const t = e.target;
  if (t.dataset.text) {
    const k = t.dataset.text;
    if (t.value === TEXT_SEED[k].html) delete data.text[k]; else data.text[k] = t.value;
    t.closest('.ct-text').classList.toggle('changed', k in data.text);
  } else if (t.dataset.c) {
    const p = t.dataset.c;
    set(p, parse(p, t.value, t));
    if (/\.(word)$/.test(p) || t.type === 'checkbox') { if (e.type === 'change') draw(); }
    if (/^stories\.[^.]+\.word$/.test(p)) set(p.replace(/word$/, 'code'), keypad(t.value));
    if (/^notes\.\d+\.body$/.test(p)) { const pv = t.closest('.card-body')?.querySelector('.note-preview .doc'); if (pv) pv.innerHTML = md(t.value); }
  }
  dirty();
}
function onClick(e) {
  const tb = e.target.closest('[data-tab]');
  if (tb) { tab = tb.dataset.tab; draw(); return; }
  const b = e.target.closest('[data-cm]'); if (!b) return;
  e.preventDefault(); e.stopPropagation();
  const a = b.dataset.cm, i = +b.dataset.i, list = b.dataset.list ? get(b.dataset.list) : null;
  const mv = (d) => { const j = i + d; if (j < 0 || j >= list.length) return; [list[i], list[j]] = [list[j], list[i]]; };
  if (a === 'up') mv(-1);
  else if (a === 'down') mv(1);
  else if (a === 'del') { if (!confirm('Delete this?')) return; list.splice(i, 1); }
  else if (a === 'add-main') { const id = uid(); data.projects.main.push({ id, name: 'New project', hidden: true, preview: '', scene: 'figure8', label: '', tagline: '', what: '', points: [], chips: [], live: '', repo: '', story: '' }); open.add(`m-${id}`); }
  else if (a === 'add-more') { const id = uid(); data.projects.more.push({ id, name: 'New project', hidden: true, link: '', status: 'Live', live: true, word: '', what: '', stack: '' }); open.add(`o-${id}`); }
  else if (a === 'add-orbit') { const id = uid(); data.projects.orbit.push({ id, name: 'New', link: '', word: '', hidden: true }); open.add(`g-${id}`); }
  else if (a === 'reset-text') { delete data.text[b.dataset.k]; }
  else if (a === 'add-story') { const id = (prompt('Short id for the story (letters only, e.g. parla):') || '').toLowerCase().replace(/[^a-z0-9]/g, ''); if (!id || data.stories[id]) return; data.stories[id] = { name: id, word: '', code: '', line: '', pip: '', problem: '', built: '', decisions: [], hard: [], numbers: [], live: '', repo: '' }; open.add(`s-${id}`); }
  else if (a === 'del-story') { if (!confirm('Delete this story?')) return; delete data.stories[b.dataset.id]; }
  else if (a === 'add-ask') { data.ask.push({ k: [], a: '', b: [] }); open.add(`a-${data.ask.length - 1}`); }
  else if (a === 'add-note') { const id = uid(); data.notes.unshift({ id, title: 'New note', date: new Date().toISOString().slice(0, 10), world: '', line: '', body: '', hidden: true }); open.add(`w-${id}`); }
  else if (a === 'add-news') { const v = Math.max(0, ...data.changelog.map((c) => c.v)) + 1; data.changelog.unshift({ v, date: new Date().toISOString().slice(0, 10), items: [] }); open.add(`n-${v}`); }
  draw();
}

export async function initContent(ctx) {
  ({ F, toast, DEMO } = ctx);
  data = defaults();
  try {
    if (!DEMO) {
      const [s, n] = await Promise.all([F.fs.getDoc(F.fs.doc(F.db, 'site', 'content')), F.fs.getDoc(F.fs.doc(F.db, 'site', 'notes'))]);
      if (s.exists()) data = { ...defaults(), ...JSON.parse(s.data().data) };
      data.notes = n.exists() ? JSON.parse(n.data().data) : [];
    } else data.notes = [{ id: 'demo1', title: 'Why my portfolio tours itself', date: '2026-11-18', world: 'blueprint', line: 'A short note on autoplay, and handing control back.', body: '## The idea\nRecruiters skim. So the page **scrolls itself** and stops the moment you touch it.\n\n- Any scroll, tap or key hands control back\n- It resumes after five idle seconds\n\n> Motion should invite, never trap.', hidden: false }];
  } catch (e) { toast(`Couldn’t load content: ${e.code || e.message}`); }
  delete data.notesIndex;
  data.text ||= {};
  data.notes ||= [];
  saved = now();
  draw();
  const body = $('#ctBody');
  body.addEventListener('input', onInput);
  body.addEventListener('change', onInput);
  body.addEventListener('toggle', (e) => { const k = e.target.dataset?.key; if (k) (e.target.open ? open.add(k) : open.delete(k)); }, true);
  $('#ctTabs').addEventListener('click', onClick);
  body.addEventListener('click', onClick);
  $('#ctSave').addEventListener('click', async () => {
    try {
      // Notes live in their own document (site/notes) so the home page stays light;
      // the home page only gets a small index of them for the menu link.
      const { notes, ...rest } = data;
      const live = notes.filter((n) => !n.hidden && n.title).sort((a, b) => String(b.date).localeCompare(String(a.date)));
      rest.notesIndex = live.map((n) => ({ id: n.id, title: n.title, date: n.date, world: n.world || '' }));
      if (!DEMO) {
        const batch = F.fs.writeBatch(F.db);
        batch.set(F.fs.doc(F.db, 'site', 'content'), { data: JSON.stringify(rest), updatedAt: F.fs.serverTimestamp() });
        batch.set(F.fs.doc(F.db, 'site', 'notes'), { data: JSON.stringify(notes), updatedAt: F.fs.serverTimestamp() });
        await batch.commit();
      }
      saved = now(); dirty(); toast('Saved. The website shows it on the next page load.');
    } catch (e) { toast(`Couldn’t save: ${e.code || e.message}`, 4000); }
  });
}
