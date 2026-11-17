/* =========================================================
   The next chapter. Loaded by main.js after the page is up,
   so if anything here fails, the original site still works.
   1. Memory: the site remembers a visitor between visits
   2. Stories: the story behind each main project
   3. Ask Pip: answers from content.js, nothing invented
   4. The world: season, moon and occasions change the site
   5. Traces: stickers on a wall + optional shared counts
   6. The 30-second version for people in a hurry
   ========================================================= */
import { GOATCOUNTER, EMAIL, CHANGELOG, STORIES, ASK, ASK_SUGGEST, ASK_FALLBACK, OCCASIONS } from './content.js?v=16';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const PIP_FACE = '<svg class="mini-pip" viewBox="0 0 120 120" aria-hidden="true" focusable="false"><circle class="mp-body" cx="60" cy="62" r="44"/><ellipse class="mp-eye" cx="45" cy="56" rx="8" ry="11"/><ellipse class="mp-eye" cx="75" cy="56" rx="8" ry="11"/><circle class="mp-pupil" cx="46" cy="59" r="5"/><circle class="mp-pupil" cx="76" cy="59" r="5"/><path class="mp-mouth" d="M48 80q12 10 24 0"/></svg>';
const SECTIONS = [['hero', 'the top'], ['work', 'Projects'], ['poelys', 'Poelys'], ['more', 'More work'], ['about', 'About me'], ['contact', 'Contact']];
const STORY_IDS = Object.keys(STORIES);

export function initChapter(ctx) {
  const { root, $, $$, calm, say, pip, visits, tourPause, snd, refreshTag, openResume } = ctx;
  const params = new URLSearchParams(location.search);
  const ss = (k, v) => { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch { /* private mode */ } return null; };

  /* -------------------------------------------------------
     1. Memory (this browser only; nothing leaves the device)
     ------------------------------------------------------- */
  let mem = {};
  try { mem = JSON.parse(localStorage.getItem('tk-mem')) || {}; } catch { /* private mode */ }
  const save = () => { try { localStorage.setItem('tk-mem', JSON.stringify(mem)); } catch { /* private mode */ } };
  const fresh = !ss('tk-session'); // a new visit, not a refresh
  ss('tk-session', '1');
  const latest = CHANGELOG[0].v;
  const returning = visits > 1 && (fresh || params.has('welcome'));
  if (fresh) { mem.prevSeen = mem.lastSeen || 0; mem.lastSeen = Date.now(); }
  mem.pokes = mem.pokes || 0; mem.far = mem.far || 0; mem.stories = mem.stories || []; mem.stickers = mem.stickers || [];
  if (mem.seenV === undefined) mem.seenV = visits > 1 ? latest - 1 : latest; // people who came before this chapter existed
  const seenV = mem.seenV;
  save();

  /* Shared counts (GoatCounter, optional): see section 5 */
  const stats = { poke: 0, end: 0, sticker: 0 };
  const queue = [];
  function count(name) {
    if (!GOATCOUNTER || ss(`tk-gc-${name}`)) return; // once per visit
    ss(`tk-gc-${name}`, '1');
    if (window.goatcounter?.count) window.goatcounter.count({ path: name, title: name, event: true }); else queue.push(name);
  }
  if (GOATCOUNTER && /^[a-z0-9-]+$/.test(GOATCOUNTER)) {
    const s = document.createElement('script');
    s.async = true; s.src = 'https://gc.zgo.at/count.js';
    s.dataset.goatcounter = `https://${GOATCOUNTER}.goatcounter.com/count`;
    s.onload = () => { queue.splice(0).forEach((n) => window.goatcounter?.count?.({ path: n, title: n, event: true })); };
    document.head.append(s);
    Object.keys(stats).forEach((k) => {
      fetch(`https://${GOATCOUNTER}.goatcounter.com/counter/${encodeURIComponent(k)}.json`).then((r) => (r.ok ? r.json() : null)).then((j) => {
        const n = parseInt(String(j?.count || '0').replace(/[^0-9]/g, ''), 10) || 0;
        if (n) { stats[k] = n; renderWallNote(); }
      }).catch(() => {});
    });
  }

  // Pip grows attached: more pokes over all visits, more expressions.
  const LEVELS = [[5, 'We’re friends now. ♥'], [15, 'Best friends. I’ll remember you.'], [30, 'Okay. You’re my favourite visitor.']];
  const level = () => LEVELS.filter(([n]) => mem.pokes >= n).length;
  const showLevel = () => { for (let i = 1; i <= 3; i++) pip.classList.toggle(`lv${i}`, level() >= i); };
  showLevel();

  let downAt = 0, pokedThisVisit = false;
  pip.addEventListener('pointerdown', () => { downAt = performance.now(); });
  pip.addEventListener('click', () => {
    if (performance.now() - downAt > 320) return; // that was a hold (peek), not a poke
    const before = level();
    mem.pokes++; save(); showLevel();
    if (level() > before) setTimeout(() => say(LEVELS[level() - 1][1], 3200), 2700);
    else if (!pokedThisVisit && stats.poke > 1) setTimeout(() => say(`You and ${(stats.poke - 1).toLocaleString()} others have poked me.`, 3200), 2700);
    if (!pokedThisVisit) { pokedThisVisit = true; count('poke'); }
    renderWallNote();
  });

  // How far down the page they got, so a returning visitor can carry on.
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const i = SECTIONS.findIndex(([id]) => id === en.target.id);
      if (i > mem.far) { mem.far = i; save(); }
    }), { threshold: 0.35 });
    SECTIONS.forEach(([id]) => { const el = document.getElementById(id); if (el) io.observe(el); });
  }

  // The final scene: remember it, and greet the game with their best score.
  const post = $('#post');
  const onFinal = () => {
    if (post.hidden) return;
    if (!mem.end) { mem.end = true; save(); }
    count('end');
    let best = 0; try { best = parseInt(localStorage.getItem('tk-best'), 10) || 0; } catch { /* private mode */ }
    if (best > 0) setTimeout(() => say(`Your best is ${best}. Beat it?`, 4200), 4200);
  };
  new MutationObserver(onFinal).observe(post, { attributes: true, attributeFilter: ['hidden'] });
  if (!post.hidden) onFinal();

  // Welcome back: a taped note in the hero with what is new and where they left off.
  if (returning) {
    const news = CHANGELOG.filter((c) => c.v > seenV).flatMap((c) => c.items);
    const carry = !mem.end && mem.far >= 2 ? SECTIONS[mem.far] : null;
    const days = mem.prevSeen ? Math.floor((Date.now() - mem.prevSeen) / 864e5) : 0;
    const when = !mem.prevSeen ? '' : days < 1 ? 'earlier today' : days === 1 ? 'yesterday' : `${days} days ago`;
    if (news.length || carry) {
      const note = document.createElement('aside');
      note.className = 'welcome';
      note.setAttribute('aria-label', 'Welcome back');
      note.innerHTML = `<span class="tape" aria-hidden="true"></span><button type="button" class="welcome-x" aria-label="Dismiss">✕</button>`
        + `<p class="welcome-h">Welcome back<span>Visit №${visits}${when ? ` · last here ${when}` : ''}</span></p>`
        + (news.length ? `<p class="welcome-sub">New since then</p><ul>${news.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>` : '')
        + (carry ? `<a class="btn btn-gloss btn-sm" href="#${carry[0]}">Carry on from ${esc(carry[1])} ↓</a>` : '');
      $('.hero-actions').after(note);
      note.querySelector('.welcome-x').addEventListener('click', () => note.remove());
      note.querySelector('a')?.addEventListener('click', () => setTimeout(() => note.remove(), 400));
    }
    mem.seenV = latest; save();
    const line = mem.pokes >= 15 ? 'You came back! I missed you.' : days > 30 ? 'Long time no see!' : mem.end ? 'Back again? You know how this ends.' : `Oh, you’re back! Visit №${visits}.`;
    if (!calm()) setTimeout(() => say(line, 3600), 5600);
  } else if (fresh && !calm()) {
    setTimeout(() => { if (!asked) say(innerWidth < 980 ? 'Got a question? “Ask Pip” is in the menu.' : 'Got a question? Tap “Ask Pip” up top.', 4200); }, 26000);
  }

  /* -------------------------------------------------------
     Dialogs share one look (.sheet) and pause the tour.
     ------------------------------------------------------- */
  function sheet(id, label) {
    const d = document.createElement('dialog');
    d.className = `sheet ${id}`; d.id = id; d.setAttribute('aria-label', label);
    d.addEventListener('click', (e) => { if (e.target === d) d.close(); }); // click outside closes
    d.addEventListener('close', () => tourPause(false)); // the tour waits a few idle seconds after closing
    document.body.append(d);
    return d;
  }
  const open = (d) => { if (!d.showModal) return false; tourPause(false); ctx.setMenu?.(false); $$('dialog[open]').forEach((o) => o !== d && o.close()); if (!d.open) d.showModal(); return true; };
  const closeBtn = (label) => `<button class="btn btn-paper btn-sm sheet-x" type="button" aria-label="Close ${label}">Close ✕</button>`;
  const wireClose = (d) => d.querySelector('.sheet-x').addEventListener('click', () => d.close());

  /* -------------------------------------------------------
     2. Stories
     ------------------------------------------------------- */
  const storyDlg = sheet('storyDlg', 'Project story');
  function openStory(id) {
    const s = STORIES[id]; if (!s) return;
    const n = STORY_IDS.indexOf(id), next = STORY_IDS[(n + 1) % STORY_IDS.length];
    storyDlg.innerHTML = `<header class="sheet-head"><div><p class="sheet-kicker">Story ${String(n + 1).padStart(2, '0')} · <span>:${s.code}</span> ${s.word}</p><h2>${esc(s.name)}</h2><p>${esc(s.line)}</p></div>${closeBtn('story')}</header>`
      + `<div class="sheet-body"><p class="pip-line">${PIP_FACE}<span>${esc(s.pip)}</span></p>`
      + `<ul class="story-nums">${s.numbers.map(([a, b]) => `<li><b>${esc(a)}</b>${esc(b)}</li>`).join('')}</ul>`
      + `<h3><i>1</i>The problem</h3><p>${esc(s.problem)}</p>`
      + `<h3><i>2</i>What I built</h3><p>${esc(s.built)}</p>`
      + `<h3><i>3</i>Decisions, and why</h3><ol class="story-list">${s.decisions.map((x) => `<li><b>${esc(x.d)}</b> ${esc(x.why)}</li>`).join('')}</ol>`
      + `<h3><i>4</i>What was hard</h3><ul class="story-list hard">${s.hard.map((x) => `<li><b>${esc(x.d)}.</b> ${esc(x.fix)}</li>`).join('')}</ul></div>`
      + `<footer class="sheet-foot"><a class="btn btn-gloss btn-sm" href="${s.live}" target="_blank" rel="noopener">Open live ↗</a><a class="btn btn-paper btn-sm" href="${s.repo}" target="_blank" rel="noopener">Code</a><button class="btn btn-paper btn-sm story-next" type="button">Next: ${esc(STORIES[next].name)} →</button></footer>`;
    wireClose(storyDlg);
    storyDlg.querySelector('.story-next').addEventListener('click', () => openStory(next));
    open(storyDlg);
    storyDlg.querySelector('.sheet-body').scrollTop = 0;
    if (!mem.stories.includes(id)) { mem.stories.push(id); save(); }
    count(`story-${id}`);
    if (mem.stories.length === STORY_IDS.length && !mem.allStories) { mem.allStories = true; save(); setTimeout(() => say('You read every story. Respect.', 3600), 600); }
  }
  // A "The story" button on each main project card, next to Open live and Code.
  $$('#work .project').forEach((art, i) => {
    const id = STORY_IDS[i], acts = art.querySelector('.p-actions');
    if (!id || !acts) return;
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'btn btn-paper'; b.dataset.story = id; b.textContent = 'The story';
    acts.append(b);
  });
  document.addEventListener('click', (e) => { const b = e.target.closest('[data-story]'); if (b) { e.preventDefault(); openStory(b.dataset.story); } });

  /* -------------------------------------------------------
     3. Ask Pip
     ------------------------------------------------------- */
  let asked = false;
  const askDlg = sheet('askDlg', 'Ask Pip');
  askDlg.innerHTML = `<header class="sheet-head"><div class="ask-who">${PIP_FACE}<div><h2>Ask Pip</h2><p>I only answer from what is on this site.</p></div></div>${closeBtn('Ask Pip')}</header>`
    + '<div class="sheet-body ask-log" aria-live="polite"></div>'
    + `<div class="ask-suggest">${ASK_SUGGEST.map((q) => `<button type="button" class="ask-chip">${esc(q)}</button>`).join('')}</div>`
    + '<form class="ask-form"><input type="text" name="q" autocomplete="off" maxlength="140" placeholder="Ask about projects, skills, work…" aria-label="Your question"><button class="btn btn-gloss btn-sm" type="submit">Ask</button></form>';
  wireClose(askDlg);
  const log = askDlg.querySelector('.ask-log'), input = askDlg.querySelector('input');
  const words = (t) => t.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9\s.]/g, ' ').split(/\s+/).filter(Boolean);
  function answer(q) {
    const toks = words(q), text = ` ${toks.join(' ')} `;
    let best = null, top = 0;
    for (const e of ASK) {
      let s = 0;
      for (const k of e.k) {
        const hit = k.includes(' ') ? text.includes(` ${k} `) || text.includes(` ${k}`) : k.length <= 3 ? toks.includes(k) : toks.some((t) => t.startsWith(k));
        if (hit) s += k.length;
      }
      if (s > top) { top = s; best = e; }
    }
    return best || { a: ASK_FALLBACK, b: [['Copy email', 'copy']] };
  }
  function bubble(cls, html) { const p = document.createElement('div'); p.className = `ask-msg ${cls}`; p.innerHTML = html; log.append(p); log.scrollTop = log.scrollHeight; return p; }
  async function reply(q) {
    asked = true;
    bubble('from-me', esc(q));
    const r = answer(q), b = bubble('from-pip', '<span class="ask-dots" aria-label="Pip is typing"><i></i><i></i><i></i></span>');
    await new Promise((res) => setTimeout(res, calm() ? 0 : 420));
    b.innerHTML = '<span class="ask-text"></span>';
    const t = b.firstChild;
    if (calm()) t.textContent = r.a;
    else for (let i = 0; i < r.a.length; i += 3) { t.textContent = r.a.slice(0, i + 3); if (i % 12 === 0) snd.key?.(); log.scrollTop = log.scrollHeight; await new Promise((res) => setTimeout(res, 12)); }
    if (r.b) {
      const acts = document.createElement('p'); acts.className = 'ask-acts';
      acts.innerHTML = r.b.map(([label, act]) => (/^https?:/.test(act) ? `<a class="ask-chip" href="${act}" target="_blank" rel="noopener">${esc(label)}</a>` : `<button type="button" class="ask-chip" data-act="${act}">${esc(label)}</button>`)).join('');
      b.append(acts);
    }
    log.scrollTop = log.scrollHeight;
    count('ask');
  }
  askDlg.querySelector('form').addEventListener('submit', (e) => { e.preventDefault(); const q = input.value.trim(); if (!q) return; input.value = ''; reply(q); });
  askDlg.querySelector('.ask-suggest').addEventListener('click', (e) => { const c = e.target.closest('.ask-chip'); if (c) reply(c.textContent); });
  log.addEventListener('click', async (e) => {
    const c = e.target.closest('[data-act]'); if (!c) return;
    const act = c.dataset.act;
    if (act === 'copy') { try { await navigator.clipboard.writeText(EMAIL); c.textContent = 'Copied ✓'; } catch { c.textContent = EMAIL; } }
    else if (act === 'resume') { askDlg.close(); openResume(); }
    else if (act === 'quick') openQuick();
    else if (act.startsWith('story:')) openStory(act.slice(6));
  });
  function openAsk() {
    if (!open(askDlg)) return;
    if (!log.childElementCount) bubble('from-pip', esc(`Hi! I’m Pip. ${returning ? 'Nice to see you again. ' : ''}What would you like to know about Thrishank?`));
    if (matchMedia('(hover: hover)').matches) input.focus();
  }
  // "Ask Pip" in the nav, before Contact (inside the phone menu too).
  const contactLi = $('#navLinks .btn')?.closest('li');
  if (contactLi) {
    const li = document.createElement('li');
    li.innerHTML = '<button type="button" class="nav-ask" data-ask>Ask Pip</button>';
    contactLi.before(li);
  }
  document.addEventListener('click', (e) => { if (e.target.closest('[data-ask]')) { e.preventDefault(); openAsk(); } });

  /* -------------------------------------------------------
     6. The 30-second version
     ------------------------------------------------------- */
  const quickDlg = sheet('quickDlg', 'The 30-second version');
  quickDlg.innerHTML = `<header class="sheet-head"><div><p class="sheet-kicker">The 30-second version</p><h2>Thrishank Kuntimaddi</h2><p>Frontend developer · UI/UX · Bengaluru, India</p></div>${closeBtn('the short version')}</header>`
    + '<div class="sheet-body quick-body">'
    + '<p class="quick-lede">I design and build interfaces people enjoy using, and take products from the first sketch to a live release on web, Android and desktop. <b class="quick-open">Open to frontend and UI roles, freelance work and collaborations.</b></p>'
    + `<h3>Four projects, all live</h3><ul class="quick-list">${STORY_IDS.map((id) => { const s = STORIES[id]; return `<li><a href="${s.live}" target="_blank" rel="noopener"><b>${esc(s.name)}</b> ↗</a><span>${esc(s.line)}</span><button type="button" class="ask-chip" data-story="${id}">Story</button></li>`; }).join('')}</ul>`
    + '<p class="quick-also">Also: YorMenu, Interstellar, Ms. Minutes, Meditation, ClearMyMind and My Rovers, at <a class="ink-link" href="https://poelys.com" target="_blank" rel="noopener">poelys.com</a>.</p>'
    + '<dl class="quick-dl"><div><dt>Stack</dt><dd>React 19, TypeScript, Next.js, Tailwind, Three.js, Node.js, WebSockets, PostgreSQL</dd></div><div><dt>Education</dt><dd>B.Tech, Computer Science (Data Science), MITS, 2025 · GPA 8.41</dd></div><div><dt>Recognition</dt><dd>IISF 2023 first prize · ImpactX 2024 second prize · Smart India Hackathon 2023, Level 3</dd></div></dl>'
    + '</div>'
    + `<footer class="sheet-foot"><a class="btn btn-gloss btn-sm" href="mailto:${EMAIL}">Email me</a><button class="btn btn-paper btn-sm" type="button" data-quick-resume>Resume</button><button class="btn btn-paper btn-sm" type="button" data-quick-tour>Take the full tour</button></footer>`;
  wireClose(quickDlg);
  quickDlg.querySelector('[data-quick-resume]').addEventListener('click', () => { quickDlg.close(); openResume(); });
  quickDlg.querySelector('[data-quick-tour]').addEventListener('click', () => quickDlg.close());
  function openQuick() { if (open(quickDlg)) count('quick'); }
  const quickLink = document.createElement('p');
  quickLink.className = 'quick-link';
  quickLink.innerHTML = '<button type="button" data-quick>In a hurry? <u>The 30-second version</u> →</button>';
  $('.hero-actions').after(quickLink);
  document.addEventListener('click', (e) => { if (e.target.closest('[data-quick]')) { e.preventDefault(); openQuick(); } });
  if (params.has('quick')) openQuick();

  /* -------------------------------------------------------
     4. The world: season, moon, occasions. No location used:
     the hemisphere comes from the visitor's time zone.
     ------------------------------------------------------- */
  const now = new Date();
  const tz = (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch { return ''; } })();
  const south = /^(Australia|Antarctica)\/|^Pacific\/(Auckland|Chatham|Fiji|Tongatapu|Noumea|Efate)|^America\/(Argentina|Sao_Paulo|Santiago|Montevideo|Asuncion|La_Paz|Lima|Punta_Arenas|Campo_Grande|Cuiaba)|^Africa\/(Johannesburg|Maputo|Harare|Lusaka|Windhoek|Gaborone|Maseru|Mbabane|Blantyre|Lubumbashi)|^Indian\/(Mauritius|Reunion|Antananarivo)/.test(tz);
  const SEASONS = ['winter', 'winter', 'spring', 'spring', 'spring', 'summer', 'summer', 'summer', 'autumn', 'autumn', 'autumn', 'winter'];
  let season = SEASONS[(now.getMonth() + (south ? 6 : 0)) % 12];
  if (/^(winter|spring|summer|autumn)$/.test(params.get('season') || '')) season = params.get('season');
  const age = (((now - Date.UTC(2000, 0, 6, 18, 14)) / 864e5) % 29.530588853 + 29.530588853) % 29.530588853;
  let moon = age < 1.2 || age > 28.3 ? 'new' : age > 13.8 && age < 15.7 ? 'full' : '';
  if (/^(full|new)$/.test(params.get('moon') || '')) moon = params.get('moon');
  const md = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const ymd = `${now.getFullYear()}-${md}`;
  const dayOfYear = Math.round((new Date(now.getFullYear(), now.getMonth(), now.getDate()) - new Date(now.getFullYear(), 0, 0)) / 864e5);
  let occ = OCCASIONS.find((o) => o.dates.some((d) => d === md || d === ymd || d === `day-${dayOfYear}`));
  if (params.get('occasion')) occ = OCCASIONS.find((o) => o.id === params.get('occasion')) || occ;
  root.dataset.season = season;
  if (moon) root.dataset.moon = moon;
  if (occ) root.dataset.occasion = occ.id;
  pip.dataset.wear = occ ? occ.wear : season === 'winter' ? 'scarf' : '';
  const SEASON_NAMES = { winter: 'Winter', spring: 'Spring', summer: 'Summer', autumn: 'Autumn' };
  if (innerWidth >= 600) root.dataset.sky = SEASON_NAMES[season] + (moon === 'full' ? ' · Full moon' : moon === 'new' ? ' · New moon' : '');
  refreshTag();
  if (occ) $('#greeting').textContent = occ.greet;
  if (!calm() && fresh) {
    if (occ) setTimeout(() => say(`${occ.greet}!`, 3400), returning ? 10500 : 6200);
    else if (moon === 'full') setTimeout(() => say('Full moon today. Look up tonight.', 3400), returning ? 10500 : 6200);
  }
  addPipWear();
  if (!calm()) seasonSky(season);

  function addPipWear() {
    const svg = pip.querySelector('svg'); if (!svg) return;
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'pip-wear');
    g.innerHTML = ''
      + '<g class="w-party"><path class="w-fill" d="M44 25L60-14l16 39z"/><path d="M50 10l16 6M47 18l22 6" opacity=".6"/><circle class="w-fill2" cx="60" cy="-16" r="6"/></g>'
      + '<g class="w-santa"><path class="w-red" d="M28 30q8-34 40-34 22 0 28 26l-6 4q-8-14-22-16-16 0-24 22z"/><path class="w-white" d="M24 30q36-14 74-6v10q-38-8-74 6z"/><circle class="w-white" cx="100" cy="24" r="7"/></g>'
      + '<g class="w-witch"><path class="w-dark" d="M38 26L66-22l12 46z"/><ellipse class="w-dark" cx="60" cy="26" rx="40" ry="7"/><path class="w-band" d="M44 18q16 5 30 1"/></g>'
      + '<g class="w-scarf"><path class="w-fill" d="M28 84q32 14 64 0l-2 9q-30 12-60 0z"/><path class="w-fill" d="M76 90l6 26-10 2-4-24z"/></g>'
      + '<g class="w-diya"><path class="w-fill2" d="M98 104q15 10 30 0z"/><path class="w-flame" d="M113 102q-6-8 0-16 6 8 0 16z"/></g>'
      + '<g class="w-lantern"><path d="M113 10v18"/><rect class="w-red" x="103" y="28" width="20" height="24" rx="9"/><path d="M108 56l5 8 5-8"/></g>'
      + '<g class="w-crescent"><path class="w-fill2" d="M52 2a13 13 0 1 0 16 18 11 11 0 1 1-16-18z"/></g>'
      + '<g class="w-colour"><circle class="w-c1" cx="40" cy="44" r="6"/><circle class="w-c2" cx="80" cy="76" r="7"/><circle class="w-c3" cx="74" cy="34" r="4"/><circle class="w-c2" cx="34" cy="74" r="4"/></g>'
      + '<g class="w-lv"><ellipse class="w-blush" cx="36" cy="70" rx="7" ry="4"/><ellipse class="w-blush" cx="84" cy="70" rx="7" ry="4"/></g>'
      + '<g class="w-lv2"><path class="w-fill2" d="M93 30l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/></g>'
      + '<g class="w-lv3"><path class="w-fill2" d="M40 24l6-18 9 12 5-16 5 16 9-12 6 18z"/></g>';
    svg.append(g);
  }

  // A few sketched leaves, snowflakes, petals or sparkles drifting over the hero.
  function seasonSky(kind) {
    const hero = $('#hero'); if (!hero) return;
    const cv = document.createElement('canvas');
    cv.className = 'sky-fx'; cv.setAttribute('aria-hidden', 'true');
    hero.prepend(cv);
    const g = cv.getContext('2d');
    let W = 0, H = 0, dpr = 1, on = false, raf = 0, last = 0, col = {};
    const css = (n) => getComputedStyle(root).getPropertyValue(n).trim();
    const readCols = () => { col = { ink: css('--ink'), a: css('--accent'), a2: css('--accent-2'), a3: css('--accent-3') }; };
    const N = innerWidth < 600 ? 6 : 11;
    const make = (top) => ({ x: Math.random(), y: top ? -0.05 - Math.random() * 0.2 : Math.random(), s: 0.6 + Math.random() * 0.7, r: Math.random() * 6.28, vr: (Math.random() - 0.5) * 1.6, ph: Math.random() * 6.28, c: ['a', 'a2', 'a3'][(Math.random() * 3) | 0] });
    const ps = Array.from({ length: N }, () => make(false));
    const resize = () => { dpr = Math.min(devicePixelRatio || 1, 2); W = hero.offsetWidth; H = hero.offsetHeight; cv.width = W * dpr; cv.height = H * dpr; };
    function shape(p, t) {
      const sz = 9 * p.s;
      g.save(); g.translate(p.x * W, p.y * H); g.rotate(p.r);
      g.strokeStyle = col.ink; g.lineWidth = 1.4; g.lineCap = 'round'; g.lineJoin = 'round';
      g.globalAlpha = 0.36; g.fillStyle = col[p.c];
      if (kind === 'autumn') { g.beginPath(); g.moveTo(0, -sz * 1.4); g.quadraticCurveTo(sz * 1.1, -sz * 0.2, 0, sz * 1.2); g.quadraticCurveTo(-sz * 1.1, -sz * 0.2, 0, -sz * 1.4); g.fill(); g.globalAlpha = 0.5; g.stroke(); g.beginPath(); g.moveTo(0, -sz); g.lineTo(0, sz * 1.6); g.stroke(); }
      else if (kind === 'winter') { g.globalAlpha = 0.6; g.beginPath(); for (let i = 0; i < 3; i++) { const a = (i * Math.PI) / 3; g.moveTo(Math.cos(a) * sz, Math.sin(a) * sz); g.lineTo(-Math.cos(a) * sz, -Math.sin(a) * sz); } g.stroke(); }
      else if (kind === 'spring') { g.beginPath(); g.ellipse(0, 0, sz * 0.55, sz, 0, 0, 6.28); g.fill(); g.globalAlpha = 0.6; g.stroke(); }
      else { g.globalAlpha = 0.25 + 0.45 * (0.5 + 0.5 * Math.sin(t * 2 + p.ph)); g.beginPath(); g.moveTo(0, -sz); g.quadraticCurveTo(0, 0, sz, 0); g.quadraticCurveTo(0, 0, 0, sz); g.quadraticCurveTo(0, 0, -sz, 0); g.quadraticCurveTo(0, 0, 0, -sz); g.fill(); g.stroke(); }
      g.restore();
    }
    const fall = kind === 'winter' ? 0.035 : kind === 'summer' ? -0.006 : 0.045;
    function frame(now) {
      const dt = Math.min((now - last) / 1000, 0.05); last = now;
      const t = now / 1000;
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
      for (const p of ps) {
        p.y += (fall * p.s + (kind === 'summer' ? Math.sin(t + p.ph) * 0.004 : 0)) * dt;
        p.x += Math.sin(t * 0.8 + p.ph) * 0.012 * dt;
        p.r += p.vr * dt * (kind === 'summer' ? 0.2 : 1);
        if (p.y > 1.08 || p.y < -0.3) Object.assign(p, make(true), kind === 'summer' ? { y: 1.05 } : {});
        shape(p, t);
      }
      raf = requestAnimationFrame(frame);
    }
    const run = (v) => { if (v === on) return; on = v; if (on) { readCols(); last = performance.now(); raf = requestAnimationFrame(frame); } else cancelAnimationFrame(raf); };
    resize(); readCols();
    addEventListener('resize', resize, { passive: true });
    new MutationObserver(readCols).observe(root, { attributes: true, attributeFilter: ['data-edition', 'data-world'] });
    let visible = true;
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; run(visible && !document.hidden); }).observe(hero);
    document.addEventListener('visibilitychange', () => run(visible && !document.hidden));
    run(true);
  }

  /* -------------------------------------------------------
     5. Traces. Stickers stay on this device. Shared counts
     come from GoatCounter, only if a code is set in
     content.js. Only anonymous event names are sent.
     ------------------------------------------------------- */
  const STICKERS = [['★', 'a3'], ['♥', 'a2'], ['☺', 'a'], ['✦', 'a2'], ['☕', 'a3'], ['✿', 'a']];
  const wall = document.createElement('div');
  wall.className = 'card wall';
  wall.innerHTML = '<div class="wall-board" aria-label="Your stickers"><p class="wall-empty">Your wall is empty. Pick a sticker →</p></div>'
    + `<div class="wall-side"><p class="wall-h">Leave a sticker</p><p class="wall-sub">It stays on this wall the next time you visit. Tap one on the wall to peel it off.</p><p class="wall-sheet">${STICKERS.map(([s, c]) => `<button type="button" class="stk stk-${c}" data-stk="${s}" aria-label="Stick a ${s} sticker">${s}</button>`).join('')}</p><p class="wall-note" id="wallNote"></p></div>`;
  const grid = $('#post .post-grid');
  if (grid) grid.after(wall);
  const board = wall.querySelector('.wall-board');
  function drawWall() {
    board.querySelectorAll('.stk').forEach((n) => n.remove());
    board.classList.toggle('has', mem.stickers.length > 0);
    mem.stickers.forEach((st, i) => {
      const b = document.createElement('button');
      const c = (STICKERS.find(([s]) => s === st.s) || STICKERS[0])[1];
      b.type = 'button'; b.className = `stk stk-${c} on-wall`; b.textContent = st.s; b.dataset.i = i;
      b.setAttribute('aria-label', `Peel off the ${st.s} sticker`);
      b.style.cssText = `left:${st.x}%;top:${st.y}%;--rot:${st.r}deg`;
      board.append(b);
    });
  }
  wall.addEventListener('click', (e) => {
    const placed = e.target.closest('.on-wall');
    if (placed) { mem.stickers.splice(+placed.dataset.i, 1); save(); drawWall(); renderWallNote(); return; }
    const pick = e.target.closest('[data-stk]'); if (!pick) return;
    if (mem.stickers.length >= 18) mem.stickers.shift();
    mem.stickers.push({ s: pick.dataset.stk, x: +(6 + Math.random() * 82).toFixed(1), y: +(10 + Math.random() * 70).toFixed(1), r: Math.round((Math.random() - 0.5) * 40) });
    save(); drawWall(); renderWallNote();
    snd.beep?.(700 + Math.random() * 300, 0.06);
    count('sticker');
    if (mem.stickers.length === 1) say('Ooh, nice. It’s yours now.', 2600);
  });
  function renderWallNote() {
    const el = wall.querySelector('#wallNote'), parts = [];
    if (mem.pokes) parts.push(`You’ve poked Pip ${mem.pokes} time${mem.pokes === 1 ? '' : 's'}.`);
    const shared = [];
    if (stats.poke) shared.push(`${stats.poke.toLocaleString()} visitors poked Pip`);
    if (stats.end) shared.push(`${stats.end.toLocaleString()} made it to the end`);
    if (stats.sticker) shared.push(`${stats.sticker.toLocaleString()} left a sticker`);
    if (shared.length) parts.push(`${shared.join(' · ')}.`);
    el.textContent = parts.join(' ');
  }
  drawWall(); renderWallNote();
}
