/* =========================================================
   Thrishank Kuntimaddi: portfolio
   Everything here is automatic: the colour edition follows
   local time and changes on refresh, the page tours itself,
   two glitches change the colours and reveal a final scene, and the
   3D gravity scenes change with each section.
   ========================================================= */
import { ALL, NAMES, COPY, isLoopWorld } from './worlds.js?v=22';
import { setWorldBg } from './worldbg.js?v=22';
import { playTune, PROJECTS } from './tunes.js?v=22';
import { load as loadSite, effective, mergePrefs } from './lib/site-config.js?v=3';
import { loadContent, applyContent } from './lib/content-live.js?v=2';
const root = document.documentElement;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const osReduced = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
// Visitor preferences from universes.html (Universes & settings). Missing = the automatic default.
// The owner's switches from the Studio app (site/config) sit on top: they can pin a look or turn things off.
const [siteCfg, siteContent] = await Promise.all([loadSite(), loadContent()]);
applyContent(siteContent); // your projects, text, stories and Pip's answers, from the Studio app
const SITE = effective(siteCfg);
window.TK_SITE = SITE;
let PREFS = {};
try { PREFS = JSON.parse(localStorage.getItem('tk-prefs')) || {}; } catch { /* private mode */ }
PREFS = mergePrefs(PREFS, SITE);
if (PREFS.edition && root.dataset.edition !== PREFS.edition && !/[?&]edition=/.test(location.search)) root.dataset.edition = PREFS.edition;
const calm = () => osReduced.matches || PREFS.motion === 'calm';
const isSmall = () => innerWidth < 980;

/* ---------------------------------------------------------
   Editions: light palettes shared by the CSS and the 3D scene
   --------------------------------------------------------- */
const INK = ['#ff7a59', '#3b9bff', '#8f6bff', '#19b894', '#f2a51a', '#ff5fa2'];
const rotate = (arr, n) => arr.slice(n).concat(arr.slice(0, n));
const UNIVERSES = {
  morning: { name: 'Coral edition', bg: '#fbf8f2', stars: rotate(INK, 0), dust: '#c9bfb4', planet: '#3b9bff', bloom: 0, light: true },
  noon:    { name: 'Sky edition',   bg: '#f6fafe', stars: rotate(INK, 1), dust: '#b7c6d8', planet: '#ff7a59', bloom: 0, light: true },
  dusk:    { name: 'Lilac edition', bg: '#fbf7fd', stars: rotate(INK, 2), dust: '#c9bcd9', planet: '#ff5fa2', bloom: 0, light: true },
  night:   { name: 'Mint edition',  bg: '#f5fbf9', stars: rotate(INK, 3), dust: '#b4cfc7', planet: '#8f6bff', bloom: 0, light: true },
};
const edition = UNIVERSES[root.dataset.edition] ? root.dataset.edition : 'morning';
let engineReady = false; // the 3D engine is created at the end of this file
const settings = { universe: edition, accent: '', g: 1, speed: 1, trail: 0.8, glow: 1 };
const SCENE_NAMES = { figure8: 'Figure-8', lagrange: 'Lagrange', binary: 'Binary', debris: 'Debris field', solar: 'Planetary', studio: 'Poelys', chaos: 'Chaos', pythagorean: 'Pythagorean' };

// The engine was written with optional UI hooks; this site has no controls, so they are no-ops.
const hashParams = new URLSearchParams('');
const toast = () => {};
const showSceneLabel = () => {};
const syncLabUI = () => {};

/* ---------------------------------------------------------
   Automatic personal touches: greeting, edition, visit count
   --------------------------------------------------------- */
let visits = 1;
try { visits = (parseInt(localStorage.getItem('tk-visits'), 10) || 0) + 1; localStorage.setItem('tk-visits', String(visits)); } catch { /* private mode */ }
const hour = new Date().getHours();
$('#greeting').textContent = hour >= 5 && hour < 12 ? 'Good morning' : hour >= 12 && hour < 17 ? 'Good afternoon' : hour >= 17 && hour < 22 ? 'Good evening' : 'Hello, night owl';
/* Universes: 27 of them (worlds.js). Each has its own fonts, shapes and wording; the 22 from the
   endless loop also turn the page dark and draw their scene behind it (worldbg.js). */
const WORLDS = SITE.universes?.length ? ALL.filter((w) => SITE.universes.includes(w) || w === 'paper') : ALL, WORLD_NAMES = NAMES;
const tagText = () => `${WORLD_NAMES[root.dataset.world] || 'Paper'} universe · ${UNIVERSES[settings.universe].name.replace(' edition', '')}${root.dataset.sky ? ` · ${root.dataset.sky}` : ''}`;
function applyCopy(world) {
  const c = COPY[world] || COPY.paper;
  $$('[data-copy]').forEach((el) => { const k = el.dataset.copy; el.innerHTML = k === 'cta' ? `${c[k]} <span aria-hidden="true">↓</span>` : c[k]; });
  $('#editionText').textContent = tagText();
}
function setWorld(name, save) {
  if (root.dataset.world === name) return;
  const anchor = viewSection(), before = anchor ? anchor.getBoundingClientRect().top : 0;
  root.dataset.world = name;
  root.classList.toggle('sketch', name === 'sketch');
  markWorld(name);
  applyCopy(name);
  engine?.setPixelated(name === 'pixel');
  if (anchor) { const d = anchor.getBoundingClientRect().top - before; if (Math.abs(d) > 1) scrollTo(0, scrollY + d); } // keep the visitor's place when heights change
  tour.pos = scrollY;
  if (save) { try { sessionStorage.setItem('tk-world', name); } catch { /* private mode */ } }
}
// Dark pages, the hidden 3D scene and the drawn background for the 22 loop universes.
function markWorld(name) {
  const loop = isLoopWorld(name);
  root.toggleAttribute('data-dark', loop); root.toggleAttribute('data-loop', loop);
  if (engineReady) engine?.setPaused?.(loop);
  const m = $('meta[name="theme-color"]'); if (m) m.content = loop ? getComputedStyle(root).getPropertyValue('--paper').trim() || '#000' : UNIVERSES[settings.universe].bg;
  setWorldBg(name, calm());
}
// The next universe: a shuffled deck of all 27, kept for this tab only, so none repeats until all have shown.
function nextWorld() {
  let bag = [];
  try { bag = JSON.parse(sessionStorage.getItem('tk-bag')) || []; } catch { /* private mode */ }
  bag = bag.filter((w) => WORLDS.includes(w) && w !== root.dataset.world);
  if (!bag.length) { bag = WORLDS.filter((w) => w !== root.dataset.world); for (let i = bag.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [bag[i], bag[j]] = [bag[j], bag[i]]; } }
  const w = bag.shift();
  try { sessionStorage.setItem('tk-bag', JSON.stringify(bag)); } catch { /* private mode */ }
  return w;
}
if (!WORLDS.includes(root.dataset.world)) root.dataset.world = 'paper';
if (PREFS.world && WORLDS.includes(PREFS.world) && root.dataset.world !== PREFS.world && !/[?&]world=/.test(location.search)) { root.dataset.world = PREFS.world; root.classList.toggle('sketch', PREFS.world === 'sketch'); }
if (PREFS.motion === 'calm') root.classList.add('calm');
markWorld(root.dataset.world);
applyCopy(root.dataset.world);
const EDITION_ORDER = ['morning', 'noon', 'dusk', 'night'];
function setEdition(name) {
  root.dataset.edition = name;
  settings.universe = name;
  $('#editionText').textContent = tagText();
  $('meta[name="theme-color"]').content = UNIVERSES[name].bg;
  try { sessionStorage.setItem('tk-edition', String(EDITION_ORDER.indexOf(name))); } catch { /* private mode */ }
  engine?.setUniverse();
}
const nextEdition = () => setEdition(PREFS.edition || EDITION_ORDER[(EDITION_ORDER.indexOf(settings.universe) + 1) % EDITION_ORDER.length]);
$('#visitText').textContent = `Visit №${visits}`;
$('meta[name="theme-color"]').content = UNIVERSES[edition].bg;
$('#year').textContent = new Date().getFullYear();
// The hero shows a different orbit on each visit.
$('#hero').dataset.scene = ['figure8', 'lagrange', 'solar'][(visits - 1) % 3];

/* ---------------------------------------------------------
   Nav + reveals
   --------------------------------------------------------- */
const nav = $('.nav');
const onScrollUI = () => nav.classList.toggle('scrolled', scrollY > 10);
onScrollUI();
addEventListener('scroll', onScrollUI, { passive: true });

const menuBtn = $('#menuBtn');
const links = $('#navLinks');
function setMenu(open) {
  links.classList.toggle('open', open);
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
}
menuBtn.addEventListener('click', () => setMenu(!links.classList.contains('open')));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

const heroTitle = $('.hero-title');
$$('.line', heroTitle).forEach((l, i) => l.style.setProperty('--i', i));
requestAnimationFrame(() => requestAnimationFrame(() => heroTitle.classList.add('in')));

const revealEls = $$('.reveal');
if ('IntersectionObserver' in window && !calm()) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  revealEls.forEach((el) => io.observe(el));
} else revealEls.forEach((el) => el.classList.add('in'));

const copyBtn = $('#copyBtn');
copyBtn.addEventListener('click', async () => {
  try { await navigator.clipboard.writeText($('#emailLink').textContent.trim()); copyBtn.textContent = 'Copied ✓'; }
  catch { copyBtn.textContent = 'Select the email above'; }
  setTimeout(() => { copyBtn.textContent = 'Copy email'; }, 1800);
});

/* ---------------------------------------------------------
   Auto-tour: the page scrolls itself. Any input from the
   visitor pauses it at once; it resumes after a short idle.
   --------------------------------------------------------- */
const IDLE_MS = 5000;
let falling = false;
const tourEl = $('#tour'), tourTxt = $('#tourTxt'), tourIco = $('#tourIco'), tourBar = $('#tourBar');
const tour = { on: false, pos: 0, speed: 0, resumeAt: performance.now() + 2600, held: PREFS.tour === false, done: false, glide: null };
const maxScroll = () => Math.max(0, root.scrollHeight - innerHeight);
const cruise = () => (isSmall() ? 62 : 84); // pixels per second

function tourUI(now) {
  let txt, ico;
  if (tour.done) { txt = 'Replay the tour'; ico = '↻'; }
  else if (tour.on) { txt = 'Auto-tour'; ico = '❚❚'; }
  else if (tour.held) { txt = 'Paused'; ico = '▶'; }
  else { txt = `Resumes in ${Math.max(1, Math.ceil((tour.resumeAt - now) / 1000))}s`; ico = '▶'; }
  if (tourTxt.textContent !== txt) tourTxt.textContent = txt;
  if (tourIco.textContent !== ico) tourIco.textContent = ico;
  const name = tour.on ? 'Pause the auto-tour' : tour.done ? 'Replay the tour' : 'Play the auto-tour';
  if (tourEl.getAttribute('aria-label') !== name) tourEl.setAttribute('aria-label', name);
  tourEl.style.display = tour.done ? 'none' : ''; // the final scene has its own replay link
  root.classList.toggle('at-final', !postEl.hidden && !falling && postEl.getBoundingClientRect().top < innerHeight * 0.5);
  const m = maxScroll();
  tourBar.style.transform = `scaleX(${m ? Math.min(1, scrollY / m) : 0})`;
}
function tourPause(hold) {
  tour.on = false; tour.speed = 0; tour.glide = null;
  if (hold) tour.held = true;
  tour.resumeAt = performance.now() + IDLE_MS;
}
function tourPlay() {
  if (tour.done) { tour.done = false; glideTo(0, 1100, () => { tour.resumeAt = performance.now() + 900; }); return; }
  tour.held = false; tour.on = true; tour.pos = scrollY; tour.speed = 0;
}
function glideTo(y, ms = 900, then) {
  tourPause(false);
  tour.glide = { y0: scrollY, y1: Math.min(Math.max(0, y), maxScroll()), t0: performance.now(), ms, then };
}

if (!calm()) {
  tourEl.hidden = false;
  tourEl.addEventListener('click', () => { if (tour.on) tourPause(true); else tourPlay(); });
  // Anything the visitor does takes over immediately.
  const yieldToUser = () => { if (tour.on || tour.glide) tourPause(false); else if (!tour.held) tour.resumeAt = performance.now() + IDLE_MS; };
  addEventListener('wheel', yieldToUser, { passive: true });
  addEventListener('touchstart', (e) => { if (!e.target.closest('#tour, #pip')) yieldToUser(); }, { passive: true });
  addEventListener('touchmove', yieldToUser, { passive: true });
  addEventListener('pointerdown', (e) => { if (!e.target.closest('#tour, #pip, a[href^="#"]')) yieldToUser(); }, { passive: true });
  addEventListener('keydown', (e) => { if (!e.target.closest?.('#tour')) yieldToUser(); });

  let last = performance.now();
  const frame = (now) => {
    const dt = Math.min((now - last) / 1000, 0.05); last = now;
    if (tour.glide) {
      const g = tour.glide, p = Math.min(1, (now - g.t0) / g.ms), e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      scrollTo(0, g.y0 + (g.y1 - g.y0) * e);
      if (p >= 1) { tour.glide = null; tour.resumeAt = now + IDLE_MS; g.then?.(); }
    } else if (glitching && holdTour) { tour.pos = scrollY; tour.speed = 0; // hold still only for the final glitch
    } else if (tour.on) {
      if (Math.abs(scrollY - tour.pos) > 4) tourPause(false); // scrollbar drag or any other outside scroll
      else {
        tour.speed += (cruise() - tour.speed) * (1 - Math.exp(-dt * 1.4)); // ease in, never jerk
        tour.pos = Math.min(maxScroll(), tour.pos + tour.speed * dt);
        scrollTo(0, tour.pos);
        if (tour.pos >= maxScroll() - 0.5) { tour.on = false; tour.done = finale.fired; }
      }
    } else if (!falling && !tour.held && !tour.done && now >= tour.resumeAt && !links.classList.contains('open') && !document.querySelector('dialog[open]')) tourPlay();
    storyTick();
    tourUI(now);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

/* ---------------------------------------------------------
   Resume: the live version is edited in the Studio app
   (admin/) and published to Firebase. The site reads it with
   one small request, draws the one-page preview and builds
   the PDF in the browser. If that fails, it falls back to the
   PDF in resume/ (see update-resume.sh).
   --------------------------------------------------------- */
const resumeDlg = $('#resumeDlg');
const RESUME = 'resume/Thrishank-Kuntimaddi-Resume.pdf';
let resumeV = '';
let liveResume = null;
const resumeLib = () => import('./lib/resume.js?v=1');
const pdfLib = () => import('./lib/resume-pdf.js?v=1');
// An uploaded PDF resume: its parts are in site/resumePdf{n}.
let pdfBytesP = null;
let forLink = null; // a tailored link (?for=…) whose own resume is showing
const uploadedPdf = () => (pdfBytesP ||= forLink
  ? Promise.all([import('./lib/tailored.js?v=1'), pdfLib()]).then(([T, P]) => T.linkPdfB64(forLink).then((b) => P.b64ToBytes(b)))
  : Promise.all([import('./lib/firebase.js?v=2'), pdfLib()]).then(([fb, P]) =>
    Promise.all([...Array(liveResume.parts)].map((_, n) => fb.readPublic(`resumePdf${n}`).then((r) => r.data))).then((parts) => P.b64ToBytes(parts.join('')))));
const showResumeSlots = (date) => {
  $('#resumeDate').textContent = `Updated ${date.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}`;
  $$('[data-resume-slot]').forEach((el) => { el.hidden = false; });
};
const staticResume = () => fetch('resume/meta.json', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : Promise.reject())).then((m) => {
  resumeV = `?v=${m.updated}`;
  $('#resumeDownload').href = RESUME + resumeV;
  $('#resumeOpen').href = RESUME + resumeV;
  $('#postDownload').href = RESUME + resumeV;
  showResumeSlots(new Date(`${m.updated}T00:00:00`));
});
// A tailored link (Studio → Links) can bring its own resume and a hello note; otherwise the website's resume.
const tailored = import('./lib/tailored.js?v=1').then((T) => T.loadLink().then((l) => {
  if (l) { T.helloNote(l, $('.hero .edition-tag')); if (!SITE.pip.greeting) SITE.pip.greeting = `Hi, ${l.company}! Have a look around.`; }
  return T.linkResume(l) ? l : null;
})).catch(() => null);
Promise.all([tailored, import('./lib/firebase.js?v=2').then((m) => m.readPublic('resume')).catch(() => ({}))]).then(([l, { data, updatedAt }]) => {
  if (l) { forLink = l; liveResume = l.resume; showResumeSlots(new Date(l.updatedAt)); return; }
  if (!data || !(data.sections || (data.kind === 'pdf' && data.parts))) throw new Error('no live resume');
  liveResume = data;
  showResumeSlots(new Date(updatedAt));
}).catch(() => staticResume().catch(() => {}));

async function drawLiveResume() {
  const body = $('.resume-body', resumeDlg);
  if (body.dataset.live === '1') return;
  body.dataset.live = '1';
  const img = $('#resumeImg');
  img.hidden = true;
  let box = $('.resume-live', body);
  if (!box) { box = document.createElement('div'); box.className = 'resume-live'; body.appendChild(box); }
  box.hidden = false;
  box.textContent = 'Drawing the latest version…';
  try {
    if (liveResume.kind === 'pdf') {
      const [P, bytes] = await Promise.all([pdfLib(), uploadedPdf()]);
      box.textContent = ''; await P.renderInto(box, bytes); return;
    }
    const R = await resumeLib();
    if (!document.getElementById('rz-fonts')) {
      const st = document.createElement('style'); st.id = 'rz-fonts'; st.textContent = R.resumeFontCSS(); document.head.appendChild(st);
    }
    await Promise.all([R.loadEngine(), document.fonts.load('10px Carlito'), document.fonts.load('bold 10px Carlito'), document.fonts.load('italic 10px Carlito')]);
    box.innerHTML = R.toSVG(liveResume).svg;
  } catch {
    box.hidden = true; body.dataset.live = ''; img.hidden = false; img.src = `resume/preview.jpg${resumeV}`;
  }
}
async function liveDownload(openTab) {
  window.tkTrack?.('resume', { detail: openTab ? 'open' : 'download' });
  const w = openTab ? window.open('', '_blank') : null;
  try {
    if (liveResume.kind === 'pdf') {
      const [P, bytes] = await Promise.all([pdfLib(), uploadedPdf()]);
      const blob = P.bytesToBlob(bytes);
      if (openTab) w.location = URL.createObjectURL(blob); else P.saveBlob(blob, 'Thrishank-Kuntimaddi-Resume.pdf');
      return;
    }
    const R = await resumeLib();
    await R.loadEngine();
    if (openTab) { const { blob } = R.toPDF(liveResume); w.location = URL.createObjectURL(blob); } else await R.download(liveResume);
  } catch { if (w) w.location = RESUME; else location.href = RESUME; }
}
document.addEventListener('click', (e) => {
  if (liveResume && e.target.closest('#resumeDownload, #postDownload')) { e.preventDefault(); liveDownload(false); return; }
  if (liveResume && e.target.closest('#resumeOpen')) { e.preventDefault(); liveDownload(true); return; }
  const a = e.target.closest('[data-resume]');
  if (!a || !resumeDlg.showModal) return; // without <dialog> support the link just opens the PDF
  e.preventDefault();
  setMenu(false);
  if (liveResume) drawLiveResume();
  else {
    const img = $('#resumeImg');
    if (!img.getAttribute('src')) img.src = `resume/preview.jpg${resumeV}`;
  }
  tourPause(false);
  resumeDlg.showModal();
});
$('#resumeClose').addEventListener('click', () => resumeDlg.close());
$('.resume-body', resumeDlg).addEventListener('click', (e) => {
  if (!e.target.closest('#resumeImg, .resume-live') || e.target.closest('a')) return;
  const zoomed = resumeDlg.classList.toggle('zoom');
  $('#resumeHint').textContent = zoomed ? 'Click the page to fit the screen' : 'Click the page to zoom in';
});
resumeDlg.addEventListener('close', () => { resumeDlg.classList.remove('zoom'); $('#resumeHint').textContent = 'Click the page to zoom in'; });
resumeDlg.addEventListener('click', (e) => { if (e.target === resumeDlg) resumeDlg.close(); }); // click outside closes

// In-page links glide smoothly instead of jumping.
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const target = a.getAttribute('href') === '#top' ? null : $(a.getAttribute('href'));
  e.preventDefault();
  setMenu(false);
  const y = target ? target.getBoundingClientRect().top + scrollY - 70 : 0;
  if (calm()) scrollTo(0, y); else glideTo(y, 1000);
});

/* ---------------------------------------------------------
   Sound. Browsers only allow audio after the visitor has
   touched the page once, so any tap, click or key press
   (poking Pip included) quietly switches it on.
   --------------------------------------------------------- */
const sfx = new Audio('assets/glitch.mp3');
sfx.preload = 'auto';
let soundOn = false, actx = null, sfxT = 0;
function unlockSound() {
  if (soundOn || PREFS.sound === false) return;
  soundOn = true;
  sfx.muted = true;
  sfx.play().then(() => { sfx.pause(); sfx.currentTime = 0; sfx.muted = false; }).catch(() => { soundOn = false; });
  try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); } catch { /* no Web Audio */ }
}
['pointerdown', 'keydown', 'touchend'].forEach((ev) => addEventListener(ev, unlockSound, { passive: true }));
// Sound on from the start wherever the browser allows it (for example Chrome, for people who visit often).
// Everywhere else browsers require one tap, click or key press first, and the line above catches that.
if (PREFS.sound !== false) {
  try {
    const probe = new (window.AudioContext || window.webkitAudioContext)();
    if (probe.state === 'running') { actx = probe; sfx.muted = true; sfx.play().then(() => { sfx.pause(); sfx.currentTime = 0; sfx.muted = false; soundOn = true; }).catch(() => { sfx.muted = false; }); } else probe.close();
  } catch { /* no Web Audio */ }
}
function blip(freq = 660, ms = 90) {
  if (!actx || !soundOn) return;
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = 'square'; o.frequency.value = freq;
  g.gain.setValueAtTime(0.05, actx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + ms / 1000);
  o.connect(g).connect(actx.destination); o.start(); o.stop(actx.currentTime + ms / 1000);
}
function playGlitchSound(ms) {
  if (!soundOn) return;
  clearTimeout(sfxT);
  sfx.pause(); sfx.currentTime = 0; sfx.volume = 0.75;
  sfx.play().catch(() => {});
  sfxT = setTimeout(() => { // fade out as the picture settles
    const f = setInterval(() => { sfx.volume = Math.max(0, sfx.volume - 0.08); if (sfx.volume <= 0.01) { clearInterval(f); sfx.pause(); } }, 40);
  }, Math.max(200, ms - 350));
}

/* ---------------------------------------------------------
   Strips: horizontal bands that show another colour edition
   through the page. Used while glitching (old and new look
   at once) and when the visitor holds Pip to peek back.
   --------------------------------------------------------- */
const HUE = { morning: 14, noon: 212, dusk: 258, night: 164 };
const fx = { layer: $('#glitchLayer'), cover: $('#glitchCover'), bars: $('#glitchBars'), text: $('#glitchText'), strips: $('#strips'), disp: $('#gDisp'), noise: $('#gNoise'), r: $('#gR'), b: $('#gB') };
let glitching = false, prevEdition = null, peeking = false, peekInt = 0;
function drawStrips(other, amount) {
  const d = HUE[other] - HUE[settings.universe];
  let html = '';
  for (let i = 0, n = Math.round(2 + amount * 6); i < n; i++) {
    html += `<i style="top:${(Math.random() * 96).toFixed(1)}%;height:${(2 + Math.random() * (5 + amount * 14)).toFixed(1)}vh;--hue:${d}deg;--bg:${UNIVERSES[other].bg}"></i>`;
  }
  fx.strips.innerHTML = html;
  fx.strips.hidden = false;
}
function hideStrips() { fx.strips.hidden = true; fx.strips.innerHTML = ''; }
function startPeek() {
  if (!prevEdition || glitching) return false;
  peeking = true;
  drawStrips(prevEdition, 0.85);
  peekInt = setInterval(() => drawStrips(prevEdition, 0.85), 240);
  return true;
}
function stopPeek() { peeking = false; clearInterval(peekInt); hideStrips(); }

/* ---------------------------------------------------------
   Glitch: rows tear sideways, colours split, bars flicker and
   strips of the next edition cut through. At the peak a cover
   of static hides the screen; `midpoint` runs behind it, so
   the change itself is never seen.
   --------------------------------------------------------- */
function viewSection() {
  const mid = innerHeight / 2;
  return $$('main > section, #post').find((el) => { if (el.hidden) return false; const r = el.getBoundingClientRect(); return r.top <= mid && r.bottom >= mid; });
}
function glitch(ms, label, midpoint, settle) {
  if (calm() || glitching || PREFS.glitch === false) {
    if (!glitching && settle) setWorld(PREFS.world || settle, true); // still land in the right universe, just without the effect
    midpoint?.(); return Promise.resolve();
  }
  glitching = true;
  if (peeking) stopPeek();
  const from = settings.universe, to = EDITION_ORDER[(EDITION_ORDER.indexOf(from) + 1) % EDITION_ORDER.length];
  playGlitchSound(ms);
  const targetWorld = PREFS.world || settle || nextWorld();
  let lastFlash = 0, flashes = 0;
  return new Promise((resolve) => {
    const targets = [$('#universe'), nav, viewSection()].filter(Boolean);
    fx.layer.hidden = false;
    fx.text.textContent = '';
    targets.forEach((t) => { t.style.filter = 'url(#glitchFx)'; });
    let fired = false, lastStep = 0, elapsed = 0, prevNow = performance.now();
    const colours = ['var(--accent)', 'var(--accent-2)', 'var(--accent-3)', 'var(--ink)'];
    const fire = () => {
      fired = true;
      setWorld(targetWorld, true);
      const extra = midpoint?.();
      if (extra) { extra.style.filter = 'url(#glitchFx)'; targets.push(extra); }
    };
    const step = (now) => {
      elapsed += Math.min(Math.max(now - prevNow, 0), 250); prevNow = now; // count drawn time only, so a slow frame cannot skip the effect
      const p = elapsed / ms;
      if (p >= 1) {
        if (!fired) fire();
        targets.forEach((t) => { t.style.filter = ''; });
        fx.disp.setAttribute('scale', '0'); fx.r.setAttribute('dx', '0'); fx.b.setAttribute('dx', '0');
        fx.bars.innerHTML = ''; fx.cover.style.opacity = '0'; fx.layer.hidden = true; root.style.removeProperty('--gx');
        hideStrips();
        glitching = false; resolve(); return;
      }
      fx.cover.style.opacity = String(Math.max(0, Math.min(1, 1.25 - Math.abs(p - 0.5) / 0.08))); // opaque only around the peak
      if (!fired && p > 0.14 && flashes < 3 && now - lastFlash > 260) {
        flashes++; // flicker through other universes on the way
        lastFlash = now;
        const pool = WORLDS.filter((w) => w !== root.dataset.world);
        setWorld(pool[(Math.random() * pool.length) | 0], false);
      }
      if (!fired && p >= 0.5) fire();
      if (now - lastStep > 70) { // a new random frame about 14 times a second, like a damaged signal
        lastStep = now;
        const env = Math.sin(Math.PI * p);
        const strength = env * (Math.random() < 0.8 ? 1 : 0.1);
        fx.disp.setAttribute('scale', (strength * (90 + Math.random() * 480)).toFixed(0));
        fx.noise.setAttribute('seed', String((Math.random() * 999) | 0));
        fx.noise.setAttribute('baseFrequency', `0.0001 ${(0.015 + Math.random() * 0.15).toFixed(3)}`);
        const split = strength * (3 + Math.random() * 15);
        fx.r.setAttribute('dx', split.toFixed(1)); fx.b.setAttribute('dx', (-split).toFixed(1));
        root.style.setProperty('--gx', `${((Math.random() - 0.5) * strength * 24).toFixed(1)}px`);
        let html = '';
        for (let i = 0, n = Math.round(strength * (3 + Math.random() * 6)); i < n; i++) {
          const thin = Math.random() < 0.5;
          html += `<i style="top:${(Math.random() * 100).toFixed(1)}%;left:${(Math.random() * 70 - 10).toFixed(1)}%;width:${(18 + Math.random() * 70).toFixed(1)}%;height:${thin ? 2 + Math.random() * 4 : 10 + Math.random() * 46}px;background:${colours[(Math.random() * colours.length) | 0]};opacity:${thin ? 0.7 : 0.38}"></i>`;
        }
        fx.bars.innerHTML = html;
        // Before the peak the next edition cuts in; after it, the old one lingers and thins out.
        drawStrips(fired ? from : to, fired ? env * 0.7 : env);
        fx.text.style.opacity = Math.random() < 0.65 ? '1' : '0';
        fx.text.style.transform = `translate(calc(-50% + ${((Math.random() - 0.5) * 28 * strength).toFixed(1)}px), -50%) skewX(${((Math.random() - 0.5) * 26 * strength).toFixed(1)}deg)`;
      }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

/* ---------------------------------------------------------
   Pip, the guide. Pip walks about, turns round, and cycles
   through expressions, so people poke it out of curiosity
   (any touch also enables sound, which is never mentioned).
   Holding Pip peeks at the previous colour edition. In the
   final scene Pip leaves the corner and plays the game.
   --------------------------------------------------------- */
const pip = $('#pip'), pipSay = $('#pipSay');
let sayT = 0, angryT = 0;
function say(text, ms = 4200) {
  pipSay.textContent = text;
  pip.classList.add('talk');
  clearTimeout(sayT);
  sayT = setTimeout(() => pip.classList.remove('talk'), ms);
}
function pipAngry(ms = 1500) {
  pip.classList.add('angry');
  clearTimeout(angryT);
  angryT = setTimeout(() => pip.classList.remove('angry'), ms);
}
if (!calm() && PREFS.pip !== false) {
  pip.hidden = false;
  setTimeout(() => pip.classList.add('in'), 2600); // entrance done; walking and bobbing take over
  let holdT = 0, held = false, pokes = 0, at = 0, walkT = 0, acts = 0, restUntil = 0;
  const FACES = ['happy', 'wow', 'left', 'right', 'sleepy', 'wink'];
  const lines = ['You got me.', 'Okay, I will stay here.', 'That tickles.', 'Boop.', 'Hold me down and see.', 'Hehe.'];
  const face = (name) => { FACES.forEach((f) => pip.classList.remove(`ex-${f}`)); if (name) pip.classList.add(`ex-${name}`); };
  setTimeout(() => { face('happy'); say('Hi!', 2600); }, 2800);
  const GESTURES = ['wave', 'up', 'hips', 'point', 'shrug'];
  const gesture = (name) => { GESTURES.forEach((g) => pip.classList.remove(`g-${g}`)); pip.classList.add(`g-${name}`); };
  // Pip's place on screen: --px (left of the bottom-right home, <= 0) and --py (up from it, >= 0).
  // Pip keeps off the content: it stays in the corners and along the side edges (in the empty margins on
  // wide screens), and crosses from one side to the other along the floor. Going down it falls, going up
  // it jumps or flies, and along the floor it walks.
  let atY = 0, moving = false, legT = [];
  const pipBase = () => (innerWidth <= 560 ? 70 : 16); // home distance from the bottom (above the phone tour pill)
  const spans = () => ({ x: Math.max(60, innerWidth - pip.offsetWidth - 40), y: Math.max(0, innerHeight - pip.offsetHeight - pipBase() - 96) }); // stay below the nav
  const bubbleSide = () => { // keep the speech bubble on screen wherever Pip is
    const sp = spans();
    pip.classList.toggle('say-down', atY > sp.y * 0.5);
    pip.classList.toggle('say-right', -at > sp.x * 0.5);
  };
  const MOVES = ['walking', 'falling', 'flying', 'jumping'];
  const clearMove = () => { legT.forEach(clearTimeout); legT = []; MOVES.forEach((m) => pip.classList.remove(m)); moving = false; };
  const stopWalking = () => { // freeze exactly where Pip is standing
    const r = pip.getBoundingClientRect();
    at = -Math.max(0, innerWidth - r.right - 18);
    atY = Math.max(0, innerHeight - r.bottom - pipBase());
    pip.style.setProperty('--pt', '0s'); pip.style.setProperty('--px', `${at.toFixed(0)}px`); pip.style.setProperty('--py', `${atY.toFixed(0)}px`);
    clearTimeout(walkT); clearMove(); pip.style.setProperty('--face', '1');
    bubbleSide();
  };
  addEventListener('resize', () => { // a smaller window must not leave Pip off screen
    const sp = spans();
    at = Math.max(at, -sp.x); atY = Math.min(atY, sp.y);
    pip.style.setProperty('--pt', '0s'); pip.style.setProperty('--px', `${at.toFixed(0)}px`); pip.style.setProperty('--py', `${atY.toFixed(0)}px`);
    bubbleSide();
  }, { passive: true });
  function leg(tx, ty, then) { // one straight move, with the motion that suits its direction
    const dx = tx - at, dy = ty - atY, d = Math.hypot(dx, dy);
    if (d < 4) { then(); return; }
    MOVES.forEach((m) => pip.classList.remove(m));
    let kind = 'walking', secs = d / 95, ease = 'linear';
    if (dy < -20) { kind = 'falling'; secs = Math.max(0.45, d / 260); ease = 'cubic-bezier(.55,0,1,.45)'; face('wow'); gesture('up'); }
    else if (dy > 20) {
      kind = Math.random() < 0.5 ? 'flying' : 'jumping';
      secs = d / (kind === 'flying' ? 120 : 150); ease = kind === 'flying' ? 'ease-in-out' : 'cubic-bezier(.3,1.25,.6,1)';
      face(kind === 'flying' ? 'happy' : 'wink'); gesture(kind === 'flying' ? 'wave' : 'up');
    } else {
      face(dx < 0 ? 'left' : 'right');
      pip.style.setProperty('--face', dx < 0 ? '-1' : '1');
    }
    pip.style.setProperty('--pe', ease);
    pip.style.setProperty('--pt', `${secs.toFixed(2)}s`);
    pip.style.setProperty('--px', `${tx.toFixed(0)}px`);
    pip.style.setProperty('--py', `${ty.toFixed(0)}px`);
    pip.classList.add(kind);
    at = tx; atY = ty; bubbleSide();
    legT.push(setTimeout(() => { pip.classList.remove(kind); then(); }, secs * 1000 + 60));
  }
  function travel(path) { // a list of [x, y] stops, walked one after another
    moving = true;
    const next = () => {
      const stop = path.shift();
      if (!stop) { clearMove(); pip.style.setProperty('--face', '1'); face(''); return; }
      leg(stop[0], stop[1], () => legT.push(setTimeout(next, 120)));
    };
    next();
  }
  setInterval(() => { // Pip wanders the edges and corners. After a poke Pip rests a few seconds, then wanders again.
    if (document.hidden || glitching || peeking || moving || root.classList.contains('at-final')) return;
    acts++;
    if (performance.now() > restUntil && Math.random() < (pokes ? 0.45 : 0.55)) {
      const sp = spans();
      const side = Math.random() < 0.5 ? 0 : -sp.x;
      const ty = Math.random() < 0.5 ? (Math.random() < 0.5 ? 0 : sp.y) : Math.round(Math.random() * sp.y); // a corner, or anywhere up a side
      const path = [];
      if (Math.abs(side - at) > 40) { // changing sides: down to the floor, across, then up
        if (atY > 0) path.push([at, 0]);
        path.push([side, 0]);
        if (ty > 0) path.push([side, ty]);
      } else path.push([side, ty]); // same side: straight up or down the edge
      if (Math.hypot(side - at, ty - atY) > 60) { travel(path); return; }
    }
    face(Math.random() < 0.2 ? '' : FACES[(Math.random() * FACES.length) | 0]);
    if (pokes) gesture(GESTURES[(Math.random() * GESTURES.length) | 0]);
    else if (acts % 5 === 0) { // lure: flicker and call out until someone pokes
      pip.classList.remove('flick'); void pip.offsetWidth; pip.classList.add('flick');
      say(['Psst.', 'Hey.', '?', 'Catch me.'][(Math.random() * 4) | 0], 2400);
    }
  }, 2200);
  pip.addEventListener('pointerdown', () => {
    held = false;
    holdT = setTimeout(() => { held = true; face('wow'); if (startPeek()) say('The last one…', 60000); else say('Nothing behind us yet.'); }, 320);
  });
  const release = () => { clearTimeout(holdT); if (peeking) { stopPeek(); say('And back.', 1600); } };
  ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => pip.addEventListener(ev, release));
  pip.addEventListener('contextmenu', (e) => e.preventDefault());
  pip.addEventListener('click', () => {
    if (held) { held = false; return; }
    unlockSound();
    stopWalking();
    restUntil = performance.now() + 7000;
    blip(520 + (pokes % 4) * 110);
    face(['happy', 'wow', 'wink'][pokes % 3]);
    gesture(GESTURES[pokes % GESTURES.length]);
    pip.classList.remove('hop'); void pip.offsetWidth; pip.classList.add('hop');
    say(lines[pokes++ % lines.length], 2600);
  });
}

/* ---------------------------------------------------------
   Small automatic details: Morse lines on the project cards
   and keypad codes under the globes that decode themselves.
   --------------------------------------------------------- */
const MORSE = { A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..' };
$$('[data-morse]').forEach((el) => {
  let n = 0, html = '';
  for (const ch of el.dataset.morse) {
    if (!MORSE[ch]) continue;
    html += '<span class="mo-letter">' + [...MORSE[ch]].map((sym) => `<i class="${sym === '-' ? 'dah' : 'dit'}" style="--n:${n++}"></i>`).join('') + '</span>';
  }
  el.style.setProperty('--len', n);
  el.innerHTML = `<b></b>${html}<em>${el.dataset.morse}</em>`;
});
{
  const codes = $$('[data-code]');
  const scramble = (el, to, numeric) => {
    const pool = numeric ? '0123456789' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let f = 0;
    clearInterval(el._t);
    el._t = setInterval(() => {
      f++;
      el.textContent = (numeric ? ':' : '') + [...to].map((c, i) => (i < f / 3 ? c : pool[(Math.random() * pool.length) | 0])).join('');
      if (f / 3 >= to.length) clearInterval(el._t);
    }, 95); // one letter settles about every 0.3 s, slow enough to follow
  };
  const reveal = (el, on) => {
    if (!!el._on === on) return;
    el._on = on; el.classList.toggle('decoded', on);
    if (calm()) el.textContent = on ? el.dataset.word : `:${el.dataset.code}`; else scramble(el, on ? el.dataset.word : el.dataset.code, !on);
  };
  codes.forEach((el) => { // hovering (or focusing) a project reveals its word
    const host = el.closest('a') || el;
    const on = () => { el._hover = true; reveal(el, true); }, off = () => { el._hover = false; reveal(el, false); };
    host.addEventListener('pointerenter', on); host.addEventListener('pointerleave', off);
    host.addEventListener('focus', on); host.addEventListener('blur', off);
  });
  if (!calm()) setInterval(() => { // and now and then one decodes by itself, in no particular order
    if (document.hidden) return;
    const idle = codes.filter((el) => { if (el._on) return false; const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; });
    if (!idle.length) return;
    const el = idle[(Math.random() * idle.length) | 0];
    reveal(el, true);
    setTimeout(() => { if (!el._hover) reveal(el, false); }, 5600);
  }, 2400);
}

/* ---------------------------------------------------------
   The two glitches. 1: as the tour passes "More work" the
   colours change while the page keeps moving. 2: at the very
   end they change again and the final scene is revealed.
   --------------------------------------------------------- */
const postEl = $('#post');
const moreEl = $('#more');
const story = { warned: false, first: calm(), finale: calm() };
const finale = { get fired() { return story.finale; } };
let holdTour = false, pendingNormal = false, jumped = false, looping = false;
if (!calm()) postEl.hidden = true;
function storyTick() {
  if (glitching) return;
  // After the quick jump, reaching the very bottom again opens the endless loop (infinity.js).
  if (jumped && !looping && SITE.motion.loop !== false && !falling && !tour.glide && !calm() && maxScroll() > 200 && scrollY >= maxScroll() - 3) { enterLoop(); return; }
  if (pendingNormal && !falling && scrollY > innerHeight * 0.55) { pendingNormal = false; glitch(1500, '', null, 'paper'); return; }
  const top = moreEl.getBoundingClientRect().top;
  if (!story.warned && top < innerHeight * 1.15) { story.warned = true; say('Uh oh…'); }
  if (!story.first && top < innerHeight * 0.5 && top > -moreEl.offsetHeight) {
    story.first = true;
    glitch(2400, 'SIGNAL LOST', () => { prevEdition = settings.universe; nextEdition(); })
      .then(() => say('Whoa.', 2600));
  } else if (!story.finale && !tour.glide && maxScroll() > 200 && scrollY >= maxScroll() - 3) {
    story.finale = true; holdTour = true;
    glitch(3000, 'FINAL SCENE', () => {
      prevEdition = settings.universe; nextEdition();
      postEl.hidden = false;
      scrollTo(0, postEl.getBoundingClientRect().top + scrollY - 68); // swapped in behind the static, so nobody sees a jump
      return postEl;
    }).then(() => {
      holdTour = false; tour.on = false; tour.done = true; tour.speed = 0;
      game.start(); // Pip leaves the corner and becomes the player
    });
  }
}
if (/[?&]loop\b/.test(location.search) && !calm()) setTimeout(() => enterLoop(), 1500); // preview: open the loop straight away
function enterLoop() {
  looping = true; tourPause(true);
  import('./infinity.js?v=22').then((m) => m.enter({
    say, calm, PREFS,
    pipSvg: () => $('#pip svg')?.outerHTML || '',
    audio: () => { unlockSound(); return soundOn ? actx : null; },
    onExit: () => { // back to the light site, at the top, with the tour waiting a moment
      tour.held = false; tour.done = false; tour.pos = 0; tour.resumeAt = performance.now() + 4000;
      scrollTo(0, 0);
      setTimeout(() => { looping = false; say('What a trip. Welcome back.', 3600); }, 1500);
    },
  })).catch((err) => { looping = false; tour.held = false; console.warn('[loop]', err); });
}
document.addEventListener('click', (e) => {
  if (e.target.closest('[data-act="replay"]')) { tour.done = false; tour.held = false; glideTo(0, 1600, () => { tour.resumeAt = performance.now() + 800; }); }
});

/* ---------------------------------------------------------
   Resume viewer: real sections in readable type. It steps
   through them by itself; clicking a tab takes over.
   --------------------------------------------------------- */
const resumeView = (() => {
  const tabs = $$('.rv-tab'), panels = $$('.rv-panel'), bar = $('#rvBar');
  let cur = 0, lastUser = -1e9;
  const STEP = 8000;
  function show(i, user) {
    cur = i;
    tabs.forEach((b, k) => b.setAttribute('aria-selected', String(k === i)));
    panels.forEach((p, k) => { p.hidden = k !== i; });
    if (user) lastUser = performance.now();
    bar.style.animation = 'none'; void bar.offsetWidth;
    bar.style.animation = user || calm() ? 'none' : `rvbar ${STEP}ms linear`;
  }
  tabs.forEach((b, i) => b.addEventListener('click', () => show(i, true)));
  if (!calm()) setInterval(() => { if (!postEl.hidden && !document.hidden && performance.now() - lastUser > 25000) show((cur + 1) % tabs.length); }, STEP);
  return { show(id) { const i = tabs.findIndex((b) => b.dataset.tab === id); if (i >= 0 && performance.now() - lastUser > 25000) show(i); } };
})();

/* ---------------------------------------------------------
   Final-scene games, both played by Pip.
   Catch: each round asks a question; true and false words
   about me fall and only the true ones should be caught.
   Run: a pixel side-scroller; jump the bugs, grab the skills.
   Pip plays by itself and the two games alternate; a visitor
   takes over by moving, tapping or pressing space.
   --------------------------------------------------------- */
const game = (() => {
  const cv = $('#game'), g = cv.getContext('2d');
  const ROUNDS = [
    { q: 'Catch my frontend stack', tab: 'skills', yes: ['React', 'TypeScript', 'Three.js', 'Tailwind', 'Vite', 'CSS', 'WebGL', 'Next.js', 'PWA'], no: ['Flash', 'jQuery UI', 'WordPress', 'Unity', 'PHP', 'Angular'] },
    { q: 'Catch what I built', tab: 'projects', yes: ['Oruinwan', 'Expense Tracker', 'SentinelFlight', 'LearnViaNotes', 'YorMenu', 'Interstellar', 'Ms. Minutes', 'Meditation'], no: ['Photoshop', 'Minecraft', 'WhatsApp', 'Excel', 'Spotify', 'Tetris'] },
    { q: 'Catch what powers my products', tab: 'experience', yes: ['WebSockets', 'Redis', 'Node.js', 'E2E encryption', 'OAuth 2.0', 'MongoDB', 'PostgreSQL', 'JWT'], no: ['COBOL', 'Fortran', 'Fax machine', 'Blockchain', 'Floppy disk', 'SAP'] },
    { q: 'Catch what is true about me', tab: 'awards', yes: ['IISF first prize', 'B.Tech 2025', 'Bengaluru', 'GPA 8.41', 'Poelys studio', 'ImpactX 2nd', 'Builds Oruinwan'], no: ['PhD', 'Lives in London', 'MBA', '20 years exp', 'Hates CSS'] },
  ];
  const TOKENS = ['React', 'CSS', 'TS', 'WebGL', 'Vite', 'PWA', 'Node', 'UX', '3D', 'A11y'];
  const ROUND_SECS = 22, LIVES = 5, PX = '"Press Start 2P", "Space Mono", monospace';
  let mode = 'catch', W = 0, H = 0, last = 0, raf = 0, running = false, frame = 0, col = {}, lastUser = -1e9, auto = true, modeT = 0;
  let score = 0, streak = 0, lives = LIVES, over = 0, angry = 0, shake = 0, banner = 0, floats = [];
  let items = [], px = 0, target = 0, spawnIn = 0.6, round = 0, played = 0, roundT = ROUND_SECS;                    // catch
  let ry = 0, rvy = 0, jumps = 0, obs = [], toks = [], dist = 0, bonus = 0, speed = 210, nextObs = 1.4, nextTok = 2.2, invul = 0; // run
  let best = 0; try { best = parseInt(localStorage.getItem('tk-best'), 10) || 0; } catch { /* private mode */ }
  const css = (n) => getComputedStyle(cv).getPropertyValue(n).trim();
  const readCols = () => { col = { ink: css('--ink'), a: css('--accent'), a2: css('--accent-2'), a3: css('--accent-3'), tint: css('--tint') }; };
  const sayLine = (t) => { $('#gSay').textContent = t; };
  function hud() {
    $('#gScore').textContent = score; $('#gBest').textContent = best;
    $('#gStatL').textContent = mode === 'run' ? 'Metres' : 'Streak';
    $('#gStreak').textContent = mode === 'run' ? Math.floor(dist / 30) : streak;
    $('#gLives').textContent = '♥'.repeat(lives) + '♡'.repeat(LIVES - lives);
  }
  function setRound(i) {
    round = i % ROUNDS.length; roundT = ROUND_SECS; banner = 1.6; items = [];
    $('#gRound').textContent = `Catch · round ${played + 1}`;
    $('#gPrompt').textContent = ROUNDS[round].q;
    resumeView.show(ROUNDS[round].tab);
  }
  function reset(msg) {
    score = 0; streak = 0; lives = LIVES; over = 0; floats = []; angry = 0; shake = 0;
    if (mode === 'catch') { played = 0; setRound(0); } else {
      ry = 0; rvy = 0; jumps = 0; obs = []; toks = []; dist = 0; bonus = 0; speed = 210; nextObs = 1.4; nextTok = 2.2; invul = 0; banner = 1.4;
      $('#gRound').textContent = 'Pixel run'; $('#gPrompt').textContent = 'Jump the bugs, grab the skills';
    }
    hud(); if (msg) sayLine(msg);
  }
  function setMode(m, msg) {
    mode = m; modeT = 0;
    $$('[data-game]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.game === m)));
    cv.style.cursor = m === 'run' ? 'pointer' : 'ew-resize';
    reset(msg || (m === 'run' ? 'Tap, click or press space to jump. Twice for a double jump.' : 'Catch only the words that are true about me.'));
  }
  function resize() {
    const r = cv.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
    W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!px) px = target = W / 2;
  }
  function lose(x, y, label) {
    lives--; streak = 0; shake = 0.4; angry = 1.4; invul = 1.3;
    floats.push({ x, y, t: 1, text: '✕', ok: false }); blip(150, 200);
    sayLine(label);
    if (lives <= 0) { over = 3.2; sayLine(`Game over. Score ${score}.`); }
  }
  function win(x, y, pts, label) {
    score += pts; floats.push({ x, y, t: 1, text: `+${pts}`, ok: true });
    if (score > best && !auto) { best = score; try { localStorage.setItem('tk-best', String(best)); } catch { /* private mode */ } }
    sayLine(label);
  }
  const rr = (x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };

  /* ---------------- Catch ---------------- */
  function spawn() {
    const R = ROUNDS[round], yes = Math.random() < 0.66, pool = (yes ? R.yes : R.no).filter((l) => !items.some((it) => it.label === l));
    if (!pool.length) return;
    const label = pool[(Math.random() * pool.length) | 0];
    g.font = '700 13px "Space Mono", monospace';
    const w = Math.min(g.measureText(label).width + 26, W - 16);
    items.push({ x: w / 2 + 8 + Math.random() * Math.max(1, W - w - 16), y: -18, vy: (44 + Math.random() * 30) * (1 + Math.min(played, 8) * 0.07), label, yes, w });
  }
  function updateCatch(dt) {
    roundT -= dt; if (roundT <= 0) { played++; setRound(round + 1); }
    spawnIn -= dt; if (spawnIn <= 0 && banner <= 0.4) { spawn(); spawnIn = Math.max(0.6, 1.15 - played * 0.05) + Math.random() * 0.5; }
    if (auto) {
      const want = items.filter((it) => it.yes && it.y < H - 70).sort((a, b) => b.y - a.y)[0];
      if (want) target = want.x;
      const danger = items.find((it) => !it.yes && it.y > H - 210 && it.y < H - 44 && Math.abs(it.x - px) < 40 + it.w / 2);
      if (danger) target = danger.x + (px < danger.x ? -1 : 1) * (70 + danger.w / 2);
    }
    target = Math.max(28, Math.min(W - 28, target));
    px += (target - px) * (1 - Math.exp(-dt * (auto ? 7 : 18)));
    for (const it of items) {
      it.y += it.vy * dt;
      if (!it.done && it.y > H - 84 && it.y < H - 50 && Math.abs(it.x - px) < 26 + it.w / 3) {
        it.done = true;
        if (it.yes) { streak++; blip(620 + Math.min(streak, 8) * 60, 70); win(it.x, H - 90, 10 + Math.min(streak - 1, 10) * 2, `✓ ${it.label} is right.`); }
        else lose(it.x, H - 90, `✕ ${it.label} is not me.`);
        hud();
      }
    }
    items = items.filter((it) => !it.done && it.y < H + 30);
  }
  function drawPip(x, y, now) { // the same Pip as in the corner: hands, shoes and all
    const mad = angry > 0, jx = mad ? (Math.random() - 0.5) * 6 : 0, bob = Math.sin(now / 90) * 1.5;
    g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = col.ink; g.lineWidth = 2;
    g.beginPath(); g.moveTo(x - 6, y + 17); g.lineTo(x - 6, y + 25 + bob); g.moveTo(x + 6, y + 17); g.lineTo(x + 6, y + 25 - bob); g.stroke();
    g.fillStyle = col.a3; g.beginPath(); g.ellipse(x - 8, y + 26 + bob, 5, 2.5, 0, 0, 7); g.ellipse(x + 8, y + 26 - bob, 5, 2.5, 0, 0, 7); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(x - 17, y - 2); g.quadraticCurveTo(x - 28, y - 8, x - 30, y - 22); g.moveTo(x + 17, y - 2); g.quadraticCurveTo(x + 28, y - 8, x + 30, y - 22); g.stroke();
    g.beginPath(); g.moveTo(x - 32, y - 24); g.quadraticCurveTo(x, y - 8, x + 32, y - 24); g.stroke(); // basket
    g.fillStyle = '#fff'; g.beginPath(); g.arc(x - 30, y - 23, 4.5, 0, 7); g.fill(); g.stroke(); g.beginPath(); g.arc(x + 30, y - 23, 4.5, 0, 7); g.fill(); g.stroke();
    if (mad) { g.globalAlpha = 0.5; g.fillStyle = '#ff5f7a'; g.beginPath(); g.arc(x - 5 + jx, y, 18, 0, 7); g.fill(); g.fillStyle = '#5fd0ff'; g.beginPath(); g.arc(x + 5 + jx, y, 18, 0, 7); g.fill(); g.globalAlpha = 1; }
    g.fillStyle = mad ? '#ffb3c0' : col.a; g.beginPath(); g.arc(x + jx, y, 18, 0, 7); g.fill(); g.stroke();
    g.fillStyle = '#fff'; g.beginPath(); g.ellipse(x - 6 + jx, y - 3, 4, 5.5, 0, 0, 7); g.ellipse(x + 6 + jx, y - 3, 4, 5.5, 0, 0, 7); g.fill();
    const look = Math.max(-1.5, Math.min(1.5, (target - px) / 30));
    g.fillStyle = col.ink; g.beginPath(); g.arc(x - 6 + look + jx, y - 2, 2, 0, 7); g.arc(x + 6 + look + jx, y - 2, 2, 0, 7); g.fill();
    g.beginPath();
    if (mad) { g.moveTo(x - 12 + jx, y - 12); g.lineTo(x - 3 + jx, y - 8); g.moveTo(x + 12 + jx, y - 12); g.lineTo(x + 3 + jx, y - 8); g.moveTo(x - 5 + jx, y + 9); g.quadraticCurveTo(x + jx, y + 5, x + 5 + jx, y + 9); }
    else { g.moveTo(x - 5, y + 7); g.quadraticCurveTo(x, y + 11, x + 5, y + 7); }
    g.stroke();
  }
  function drawCatch(now) {
    g.fillStyle = col.a; g.globalAlpha = 0.35; g.fillRect(0, 0, W * Math.max(0, roundT / ROUND_SECS), 4); g.globalAlpha = 1;
    g.strokeStyle = col.ink; g.lineWidth = 1.5; g.setLineDash([5, 6]); g.beginPath(); g.moveTo(8, H - 8); g.lineTo(W - 8, H - 8); g.stroke(); g.setLineDash([]);
    g.font = '700 13px "Space Mono", monospace'; g.textAlign = 'center'; g.textBaseline = 'middle';
    for (const it of items) { rr(it.x - it.w / 2, it.y - 14, it.w, 28, 14); g.fillStyle = '#fff'; g.fill(); g.strokeStyle = col.ink; g.lineWidth = 1.7; g.stroke(); g.fillStyle = col.ink; g.fillText(it.label, it.x, it.y + 1, it.w - 14); }
    drawPip(px, H - 44 + Math.sin(now / 260) * 2, now);
  }

  /* ---------------- Run (pixel) ---------------- */
  const U = 3, SPR = ['..XXXXXX..', '.XXXXXXXX.', 'XXXXXXXXXX', 'XXWKXXWKXX', 'XXWKXXWKXX', 'XXXXXXXXXX', 'XXXKKKKXXX', '.XXXXXXXX.', '..XXXXXX..'];
  const snap = (v) => Math.round(v / U) * U;
  const block = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(snap(x), snap(y), snap(w), snap(h)); };
  const ground = () => H - 30, pipX = () => (W < 420 ? 46 : 84);
  function jump() { if (over > 0 || banner > 0.9) return; if (jumps < 2) { rvy = jumps === 0 ? -610 : -520; jumps++; blip(jumps === 1 ? 520 : 700, 60); } }
  function updateRun(dt) {
    speed = Math.min(400, speed + 3.5 * dt); dist += speed * dt; invul = Math.max(0, invul - dt);
    rvy += 1750 * dt; ry += rvy * dt; if (ry >= 0) { ry = 0; rvy = 0; jumps = 0; }
    nextObs -= dt; if (nextObs <= 0 && banner <= 0.3) { const tall = Math.random() < 0.35; obs.push({ x: W + 20, w: tall ? 21 : 30, h: tall ? 45 : 27, fly: !tall && Math.random() < 0.18 }); nextObs = (300 + Math.random() * 300) / speed + 0.55; }
    nextTok -= dt; if (nextTok <= 0) { toks.push({ x: W + 30, y: ground() - 72 - Math.random() * 60, label: TOKENS[(Math.random() * TOKENS.length) | 0] }); nextTok = 1.5 + Math.random() * 1.6; }
    const x = pipX(), top = ground() - 36 + ry;
    for (const o of obs) {
      o.x -= speed * dt;
      const oy = o.fly ? ground() - 78 : ground() - o.h;
      if (!o.hit && invul <= 0 && o.x < x + 13 && o.x + o.w > x - 13 && top + 34 > oy + 4 && top < oy + o.h - 4) { o.hit = true; lose(x, top - 8, 'Ouch. That was a bug.'); hud(); }
    }
    for (const t of toks) {
      t.x -= speed * dt;
      if (!t.got && Math.abs(t.x - x) < 30 && Math.abs(t.y - (top + 15)) < 30) { t.got = true; bonus += 15; blip(820, 70); score = bonus + Math.floor(dist / 30); win(t.x, t.y - 12, 15, `Grabbed ${t.label}.`); }
    }
    obs = obs.filter((o) => o.x > -60); toks = toks.filter((t) => !t.got && t.x > -80);
    score = bonus + Math.floor(dist / 30);
    if (score > best && !auto) { best = score; try { localStorage.setItem('tk-best', String(best)); } catch { /* private mode */ } }
    if (frame % 6 === 0) hud();
    if (auto) { // Pip plays: jump late enough to clear, sometimes go for a token
      const o = obs.find((b) => b.x + b.w > x - 10);
      if (o && !o.fly && ry === 0 && o.x - x < speed * (o.h > 40 ? 0.3 : 0.26) + 10) jump();
      else if (o && o.h > 40 && jumps === 1 && rvy > -120 && o.x - x < 60) jump();
      else if (ry === 0 && !o && toks.some((t) => t.x - x > 20 && t.x - x < speed * 0.3)) jump();
    }
  }
  function drawRun(now) {
    const gy = ground(), x = pipX();
    for (let i = 0; i < 9; i++) { const cx = ((i * 211 - dist * 0.12) % (W + 90) + W + 90) % (W + 90) - 45; block(cx, 26 + ((i * 53) % 90), U * (2 + (i % 3)), U, col.a2); } // far dots
    for (let i = -1; i < W / 24 + 2; i++) block(i * 24 - (dist % 24), gy, 15, U, col.ink);                                                                                  // ground
    for (let i = 0; i < 12; i++) { const sx = ((i * 97 - dist) % (W + 40) + W + 40) % (W + 40) - 20; block(sx, gy + 9 + (i % 3) * 5, U * 2, U, col.ink); }
    for (const o of obs) {
      const oy = o.fly ? gy - 78 : gy - o.h, c = '#ff8fa3';
      block(o.x, oy, o.w, o.h, col.ink); block(o.x + U, oy + U, o.w - 2 * U, o.h - 2 * U, c);
      block(o.x + U * 2, oy + U * 2, U, U * 2, col.ink); block(o.x + o.w - U * 3, oy + U * 2, U, U * 2, col.ink);
      if (o.fly) { const f = Math.floor(now / 110) % 2 ? -9 : 3; block(o.x - 9, oy + f + 6, 9, U, col.ink); block(o.x + o.w, oy + f + 6, 9, U, col.ink); }
      else { block(o.x - U, oy + o.h - U * 3, U, U * 3, col.ink); block(o.x + o.w, oy + o.h - U * 3, U, U * 3, col.ink); }
    }
    g.font = `8px ${PX}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    for (const t of toks) { const w = Math.max(42, g.measureText(t.label).width + 16), yy = t.y + Math.sin(now / 200 + t.x / 40) * 4; block(t.x - w / 2, yy - 11, w, 22, col.ink); block(t.x - w / 2 + U, yy - 11 + U, w - 2 * U, 22 - 2 * U, col.a3); g.fillStyle = col.ink; g.fillText(t.label, snap(t.x), snap(yy) + 1); }
    if (!(invul > 0 && Math.floor(now / 90) % 2)) { // Pip, drawn in pixels; blinks while invulnerable
      const top = gy - 36 + ry, body = angry > 0 ? '#ff8fa3' : col.a, step = ry === 0 ? Math.floor(dist / 26) % 2 : 2;
      SPR.forEach((row, r) => [...row].forEach((ch, c) => { if (ch !== '.') block(x - 15 + c * U, top + r * U, U, U, ch === 'X' ? body : ch === 'W' ? '#fff' : col.ink); }));
      block(x - 21, top + 12 + (step === 2 ? -6 : 0), U * 2, U, col.ink); block(x + 15, top + 12 + (step === 2 ? -6 : 0), U * 2, U, col.ink); // arms
      block(x - 9, top + 27, U, step === 0 ? 6 : 3, col.ink); block(x + 6, top + 27, U, step === 1 ? 6 : 3, col.ink);                          // legs
      block(x - 12, top + (step === 0 ? 33 : 30), U * 2, U, col.a3); block(x + 6, top + (step === 1 ? 33 : 30), U * 2, U, col.a3);            // shoes
    }
  }

  function loop(now) {
    if (!running) return;
    const dt = Math.max(0, Math.min((now - last) / 1000, 0.05)); last = now;
    if (frame++ % 45 === 0) readCols();
    const wasAuto = auto; auto = now - lastUser > 7000;
    if (wasAuto !== auto) reset(auto ? 'Pip took over again.' : mode === 'run' ? 'You are playing. Jump!' : 'You are playing. Catch only what is true about me.');
    const who = auto ? 'Pip is playing' : 'You are playing';
    if ($('#gMode').textContent !== who) $('#gMode').textContent = who;
    banner = Math.max(0, banner - dt); shake = Math.max(0, shake - dt); angry = Math.max(0, angry - dt);
    if (over > 0) { over -= dt; if (over <= 0) { if (auto) setMode(mode === 'catch' ? 'run' : 'catch'); else reset('New game. Go!'); } }
    else {
      if (auto) { modeT += dt; if (modeT > 42) setMode(mode === 'catch' ? 'run' : 'catch'); } // the demo alternates between the two games
      if (mode === 'catch') updateCatch(dt); else updateRun(dt);
    }
    floats.forEach((f) => { f.t -= dt * 1.1; f.y -= 34 * dt; }); floats = floats.filter((f) => f.t > 0);

    g.clearRect(0, 0, W, H);
    g.save();
    if (shake) g.translate((Math.random() - 0.5) * 30 * shake, 0);
    if (mode === 'catch') drawCatch(now); else drawRun(now);
    g.font = mode === 'run' ? `12px ${PX}` : '700 18px "Space Mono", monospace'; g.textAlign = 'center'; g.textBaseline = 'middle';
    for (const f of floats) { g.globalAlpha = Math.min(1, f.t * 1.6); g.fillStyle = f.ok ? '#1f9d6b' : '#d6456b'; g.fillText(f.text, f.x, f.y); }
    g.globalAlpha = 1;
    if (banner > 0 || over > 0) {
      g.globalAlpha = over > 0 ? 0.92 : Math.min(0.92, banner * 1.4); g.fillStyle = '#fff'; g.fillRect(0, H / 2 - 44, W, 88);
      g.fillStyle = col.ink;
      if (mode === 'run') { g.font = `${W < 380 ? 12 : 16}px ${PX}`; g.fillText(over > 0 ? `GAME OVER  ${score}` : 'PIXEL RUN', W / 2, H / 2); }
      else { g.font = '700 12px "Space Mono", monospace'; g.fillText(over > 0 ? 'GAME OVER' : `ROUND ${played + 1}`, W / 2, H / 2 - 18); g.font = `500 ${W < 380 ? 19 : 24}px "Fraunces", serif`; g.fillText(over > 0 ? `Score ${score}` : ROUNDS[round].q, W / 2, H / 2 + 12, W - 24); }
      g.globalAlpha = 1;
    }
    g.restore();
    raf = requestAnimationFrame(loop);
  }
  const steer = (e) => { const r = cv.getBoundingClientRect(); target = e.clientX - r.left; lastUser = performance.now(); };
  cv.addEventListener('pointermove', (e) => { if (mode === 'catch') steer(e); });
  cv.addEventListener('pointerdown', (e) => { steer(e); if (mode === 'run' && !auto) jump(); });
  addEventListener('keydown', (e) => {
    if (!running || mode !== 'run' || (e.code !== 'Space' && e.code !== 'ArrowUp') || /INPUT|TEXTAREA|BUTTON|A/.test(document.activeElement?.tagName || '')) return;
    e.preventDefault(); lastUser = performance.now(); if (!auto) jump();
  });
  $$('[data-game]').forEach((b) => b.addEventListener('click', () => { lastUser = performance.now(); auto = false; setMode(b.dataset.game); b.blur(); }));
  addEventListener('resize', () => { if (running) resize(); });
  let visible = false, wanted = false;
  const sync = () => {
    const should = wanted && visible && !document.hidden;
    if (should && !running) { running = true; resize(); readCols(); hud(); last = performance.now(); raf = requestAnimationFrame(loop); }
    if (!should && running) { running = false; cancelAnimationFrame(raf); }
  };
  if ('IntersectionObserver' in window) new IntersectionObserver(([en]) => { visible = en.isIntersecting; sync(); }).observe(cv); else visible = true;
  document.addEventListener('visibilitychange', sync);
  return { start() { wanted = true; document.fonts?.load?.(`8px ${PX}`); setMode('catch'); sync(); } };
})();
if (calm()) game.start();

/* ---------------------------------------------------------
   Sound design, all synthesised with Web Audio (no files):
   impact, glass, whooshes, a riser, CRT hum and power-down.
   --------------------------------------------------------- */
const snd = (() => {
  let out = null, nbuf = null;
  const ok = () => { if (!actx || !soundOn) return false; if (!out) { out = actx.createGain(); out.gain.value = 0.6; const comp = actx.createDynamicsCompressor(); out.connect(comp).connect(actx.destination); } return true; };
  const noise = () => { if (!nbuf) { nbuf = actx.createBuffer(1, actx.sampleRate * 2, actx.sampleRate); const d = nbuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; } const n = actx.createBufferSource(); n.buffer = nbuf; n.loop = true; return n; };
  const env = (g, t, peak, a, d) => { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); };
  return {
    boom(vol = 1) { // a deep hit you feel: falling sine plus a thump of low noise
      if (!ok()) return; const t = actx.currentTime, o = actx.createOscillator(), g = actx.createGain();
      o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(28, t + 0.7); env(g, t, 0.9 * vol, 0.005, 0.9); o.connect(g).connect(out); o.start(t); o.stop(t + 1);
      const n = noise(), f = actx.createBiquadFilter(), g2 = actx.createGain(); f.type = 'lowpass'; f.frequency.value = 240; env(g2, t, 0.8 * vol, 0.004, 0.35); n.connect(f).connect(g2).connect(out); n.start(t); n.stop(t + 0.5);
    },
    crack() { if (!ok()) return; const t = actx.currentTime, n = noise(), f = actx.createBiquadFilter(), g = actx.createGain(); f.type = 'bandpass'; f.frequency.value = 2600 + Math.random() * 3000; f.Q.value = 6; env(g, t, 0.5, 0.001, 0.05); n.connect(f).connect(g).connect(out); n.start(t); n.stop(t + 0.08); },
    glass() { // bright burst plus a scatter of falling tinkles
      if (!ok()) return; const t = actx.currentTime, n = noise(), f = actx.createBiquadFilter(), g = actx.createGain();
      f.type = 'highpass'; f.frequency.value = 3200; env(g, t, 0.7, 0.002, 0.5); n.connect(f).connect(g).connect(out); n.start(t); n.stop(t + 0.6);
      for (let i = 0; i < 22; i++) { const o = actx.createOscillator(), g2 = actx.createGain(), at = t + 0.03 + Math.random() * 0.9; o.type = 'triangle'; o.frequency.value = 2200 + Math.random() * 6500; env(g2, at, 0.09, 0.001, 0.07 + Math.random() * 0.16); o.connect(g2).connect(out); o.start(at); o.stop(at + 0.3); }
    },
    whoosh(dur = 0.5, vol = 0.5) { if (!ok()) return; const t = actx.currentTime, n = noise(), f = actx.createBiquadFilter(), g = actx.createGain(); f.type = 'bandpass'; f.Q.value = 1.4; f.frequency.setValueAtTime(260, t); f.frequency.exponentialRampToValueAtTime(4200, t + dur * 0.55); f.frequency.exponentialRampToValueAtTime(380, t + dur); env(g, t, vol, dur * 0.45, dur * 0.55); n.connect(f).connect(g).connect(out); n.start(t); n.stop(t + dur + 0.05); },
    riser(dur) { if (!ok()) return; const t = actx.currentTime, o = actx.createOscillator(), g = actx.createGain(), f = actx.createBiquadFilter(); o.type = 'sawtooth'; o.frequency.setValueAtTime(55, t); o.frequency.exponentialRampToValueAtTime(880, t + dur); f.type = 'lowpass'; f.frequency.setValueAtTime(300, t); f.frequency.exponentialRampToValueAtTime(5000, t + dur); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.16, t + dur * 0.9); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(f).connect(g).connect(out); o.start(t); o.stop(t + dur + 0.05); },
    key() { if (!ok()) return; const t = actx.currentTime, o = actx.createOscillator(), g = actx.createGain(); o.type = 'square'; o.frequency.value = 1100 + Math.random() * 500; env(g, t, 0.05, 0.001, 0.025); o.connect(g).connect(out); o.start(t); o.stop(t + 0.04); },
    beep(freq = 880, dur = 0.14) { if (!ok()) return; const t = actx.currentTime, o = actx.createOscillator(), g = actx.createGain(); o.type = 'square'; o.frequency.value = freq; env(g, t, 0.12, 0.004, dur); o.connect(g).connect(out); o.start(t); o.stop(t + dur + 0.05); },
    hum(dur) { if (!ok()) return; const t = actx.currentTime, o = actx.createOscillator(), g = actx.createGain(); o.type = 'sawtooth'; o.frequency.value = 60; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.05, t + 0.3); g.gain.setValueAtTime(0.05, t + dur - 0.2); g.gain.linearRampToValueAtTime(0.0001, t + dur); o.connect(g).connect(out); o.start(t); o.stop(t + dur + 0.05); },
    powerDown() { if (!ok()) return; const t = actx.currentTime, o = actx.createOscillator(), g = actx.createGain(); o.type = 'sawtooth'; o.frequency.setValueAtTime(900, t); o.frequency.exponentialRampToValueAtTime(30, t + 0.55); env(g, t, 0.3, 0.005, 0.6); o.connect(g).connect(out); o.start(t); o.stop(t + 0.7); },
    chime() { if (!ok()) return; const t = actx.currentTime; [523, 659, 784, 1047].forEach((fq, i) => { const o = actx.createOscillator(), g = actx.createGain(); o.type = 'triangle'; o.frequency.value = fq; env(g, t + i * 0.07, 0.14, 0.005, 0.7); o.connect(g).connect(out); o.start(t + i * 0.07); o.stop(t + i * 0.07 + 0.8); }); },
  };
})();

/* ---------------------------------------------------------
   Quick jump. The screen cracks and shatters, then we fall
   back to the top through every project, each in a different
   universe and shown in 3D: the big ones slowly, the small
   ones in a blur. Pip crashes on the way (dot matrix, crash
   text, erased, redrawn) and we land in the normal look with
   the colours for the visitor's local time.
   --------------------------------------------------------- */
const FALL = [ // in falling order. Every project is its own universe; t = how long we stay in it (ms): some linger, some flash past
  { name: 'Oruinwan', line: 'One workspace for a team: chat, calls, tasks, notes and AI.', code: '83267', win: 0, t: 4000, world: 'paper', ed: 'morning', bits: ['chat', 'calls', 'tasks', 'notes', '@ai', 'React 19'] },
  { name: 'SentinelFlight', line: 'Launch real rockets past real orbital debris, in 3D.', code: '359', win: 2, t: 3200, world: 'blueprint', ed: 'noon', bits: ['SGP4', 'Three.js', 'Δv', 'orbit', 'debris', 'AI copilot'] },
  { name: 'Meditation', line: 'Breathing that quiets every device.', code: '2256', glyph: '◌', t: 520, world: 'news', ed: 'dusk', bits: ['breathe', 'in', 'out'] },
  { name: 'Expense Tracker', line: 'A calm money app on web, Android and desktop.', code: '2274', win: 1, t: 2700, world: 'sketch', ed: 'dusk', bits: ['₹', 'budget', 'bills', 'chai 20', 'PWA', 'Tauri'] },
  { name: 'ClearMyMind', line: 'Dump your thoughts, then clear them.', code: '25327', glyph: '✧', t: 430, world: 'pixel', ed: 'night', bits: ['clear', 'think'] },
  { name: 'My Rovers', line: 'Home-built robot rovers.', code: '76837', glyph: '⛭', t: 560, world: 'blueprint', ed: 'morning', bits: ['ESP32', 'Mark 1', 'Wi-Fi'] },
  { name: 'LearnViaNotes', line: '22 subjects and 150 coding problems. No sign-up.', code: '66837', win: 3, t: 2300, world: 'news', ed: 'night', bits: ['DSA', '150 problems', 'offline', 'streak', 'notes'] },
  { name: 'Poelys', line: 'My product studio. Everything I build lives here.', code: '4663', glyph: '◎', t: 1900, world: 'paper', ed: 'dusk', bits: ['studio', 'poelys.com', 'still building'] },
  { name: 'Interstellar', line: 'A 15-minute real-time 3D space journey.', code: '327', glyph: '✦', t: 1400, world: 'pixel', ed: 'noon', bits: ['GLSL', 'TARS', 'Gargantua', 'dock'] },
  { name: 'YorMenu', line: 'A restaurant platform, from table to kitchen to bill.', code: '6368', glyph: '☕', t: 1050, world: 'sketch', ed: 'morning', bits: ['table 5', 'KOT', 'bill'] },
  { name: 'Parla', line: 'Clear conversations, less friction.', code: '729', glyph: '❝', t: 760, world: 'blueprint', ed: 'night', bits: ['say it', 'clearly'] },
  { name: 'Ms. Minutes', line: 'An AI desk companion with an animated face.', code: '8463', glyph: '◔', t: 560, world: 'pixel', ed: 'dusk', bits: ['tick', 'tock'] },
  { name: 'This website', line: 'The one you are falling through.', code: '4373', glyph: '▚', t: 400, world: 'sketch', ed: 'noon', bits: ['you', 'are', 'here'] },
];
// The fall in order: each project in its own universe (tunes.js), and every other universe as a quick
// flash in between, so all 27 show in about the same time as before.
function fallPlan() {
  const total = FALL.reduce((t, p) => t + p.t, 0), FLASH = 170;
  const projects = FALL.map((p) => ({ ...p, world: PROJECTS[p.name]?.world || p.world }));
  const used = new Set(projects.map((p) => p.world));
  const rest = WORLDS.filter((w) => !used.has(w)).sort(() => Math.random() - 0.5);
  const scale = Math.max(0.6, (total - rest.length * FLASH) / total);
  const plan = [];
  projects.forEach((p, i) => {
    plan.push({ ...p, t: Math.round(p.t * scale) });
    const gaps = projects.length - 1 - i;
    if (gaps > 0) for (let k = Math.ceil(rest.length / gaps); k > 0 && rest.length; k--) plan.push({ flash: true, world: rest.shift(), ed: p.ed, t: FLASH });
  });
  return plan;
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const fallEl = $('#fall'), fallStage = $('#fallStage'), fallTerm = $('#fallTerm');
function pipMatrix() { // Pip as a flickering grid of 0s and 1s
  const rows = [];
  for (let y = -6; y <= 6; y++) {
    let line = '';
    for (let x = -13; x <= 13; x++) {
      const inside = (x / 13) ** 2 + (y / 6) ** 2 <= 1, eye = Math.abs(Math.abs(x) - 5) <= 1.5 && y >= -3 && y <= 0, mouth = y === 3 && Math.abs(x) <= 3;
      line += !inside ? ' ' : eye ? '█' : mouth ? '▄' : Math.random() < 0.82 ? (Math.random() < 0.5 ? '0' : '1') : ' ';
    }
    rows.push(line);
  }
  return rows.concat(['      ║          ║', '    ▄▄╝          ╚▄▄']).join('\n');
}
const CRASH = [' ____________', '|  ________  |', '| |        | |', '| |________| |', '|    ____    |', '|___|____|___|', '', 'A problem has been detected and Pip will', 'shut down to prevent damage.', '', 'collecting universes for crash dump...', 'saving your place...', 'dumping memory to disk...', 'erasing...'];
const PIP_ASCII = ['    .-""""""-.', '   /  O    O  \\', '  |     __     |', '   \\   \\__/   /', "    '-......-'", '      |    |', '     _|    |_'].join('\n');
// A still copy of what is on screen (nav + current section), used as the picture on every piece of glass.
function snapshotView() {
  const snap = document.createElement('div'); snap.className = 'snap';
  for (const el of [viewSection(), nav]) {
    if (!el) continue;
    const r = el.getBoundingClientRect(), box = document.createElement('div'), c = el.cloneNode(true);
    box.style.cssText = `position:absolute;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px`;
    c.style.cssText += ';position:static;margin:0;min-height:0;transform:none;filter:none';
    const from = [...el.querySelectorAll('canvas')];
    c.querySelectorAll('canvas').forEach((cv, k) => { cv.width = from[k].width; cv.height = from[k].height; try { cv.getContext('2d').drawImage(from[k], 0, 0); } catch { /* blank is fine */ } });
    box.appendChild(c); snap.appendChild(box);
  }
  return snap;
}
// Break the screen like glass from the point of impact: cracks race outward, then every piece (showing the real page) tips and falls.
async function shatterScreen(cx, cy) {
  const W = innerWidth, H = innerHeight, D = Math.hypot(W, H), N = 9;
  const ang = Array.from({ length: N }, (_, i) => (i / N) * Math.PI * 2 + (Math.random() - 0.5) * 0.4);
  const at = (a, r) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  const r1 = ang.map(() => D * (0.1 + Math.random() * 0.07)), r2 = ang.map(() => D * (0.27 + Math.random() * 0.1));
  const A = ang.map((a, i) => at(a, r1[i])), B = ang.map((a, i) => at(a + (Math.random() - 0.5) * 0.12, r2[i])), C = ang.map((a) => at(a, D * 1.1));
  const polys = [];
  for (let i = 0; i < N; i++) { const k = (i + 1) % N; polys.push({ p: [[cx, cy], A[i], A[k]], ring: 0 }, { p: [A[i], B[i], B[k], A[k]], ring: 1 }, { p: [B[i], C[i], C[k], B[k]], ring: 2 }); }
  const cracks = $('#fallCracks'), shards = $('#fallShards');
  cracks.setAttribute('viewBox', `0 0 ${W} ${H}`);
  const seg = (p, q, d) => `<path class="cr" style="--d:${d}s" d="M${p[0].toFixed(0)} ${p[1].toFixed(0)}L${((p[0] + q[0]) / 2 + (Math.random() - 0.5) * 14).toFixed(0)} ${((p[1] + q[1]) / 2 + (Math.random() - 0.5) * 14).toFixed(0)}L${q[0].toFixed(0)} ${q[1].toFixed(0)}"/>`;
  let lines = '';
  for (let i = 0; i < N; i++) { const k = (i + 1) % N; lines += seg([cx, cy], A[i], 0) + seg(A[i], B[i], 0.07) + seg(B[i], C[i], 0.15) + seg(A[i], A[k], 0.09) + seg(B[i], B[k], 0.18); }
  cracks.innerHTML = `<g class="under">${lines}</g><g class="over">${lines}</g><circle class="hit" cx="${cx}" cy="${cy}" r="7"/>`;
  fallEl.hidden = false; fallEl.className = 'fall cracking';
  snd.boom(0.8); for (let i = 0; i < 7; i++) setTimeout(() => snd.crack(), i * 45);
  document.body.animate([{ transform: 'translate(0,0)' }, { transform: 'translate(-7px,4px)' }, { transform: 'translate(6px,-5px)' }, { transform: 'translate(-3px,2px)' }, { transform: 'translate(0,0)' }], { duration: 260 });
  const snap = snapshotView();
  await wait(430);
  const frag = document.createDocumentFragment();
  for (const { p, ring } of polys) {
    const mx = p.reduce((t, q) => t + q[0], 0) / p.length, my = p.reduce((t, q) => t + q[1], 0) / p.length;
    // each piece is only as big as its own shape, so the browser handles 27 of them easily
    const xs = p.map((q) => q[0]), ys = p.map((q) => q[1]);
    const bx = Math.max(0, Math.min(...xs)), by = Math.max(0, Math.min(...ys)), bw = Math.min(W, Math.max(...xs)) - bx, bh = Math.min(H, Math.max(...ys)) - by;
    if (bw < 2 || bh < 2) continue;
    const rel = p.map((q) => [q[0] - bx, q[1] - by]);
    const el = document.createElement('div'); el.className = 'shard';
    el.style.cssText = `left:${bx}px;top:${by}px;width:${bw}px;height:${bh}px;clip-path:polygon(${rel.map((q) => `${q[0].toFixed(1)}px ${q[1].toFixed(1)}px`).join(',')})`;
    const inner = snap.cloneNode(true); inner.style.cssText = `inset:auto;left:${-bx}px;top:${-by}px;width:${W}px;height:${H}px`;
    const src = [...snap.querySelectorAll('canvas')]; inner.querySelectorAll('canvas').forEach((cv, k) => { cv.width = src[k].width; cv.height = src[k].height; try { cv.getContext('2d').drawImage(src[k], 0, 0); } catch { /* blank */ } });
    el.appendChild(inner);
    el.insertAdjacentHTML('beforeend', `<svg class="edge" viewBox="0 0 ${bw.toFixed(0)} ${bh.toFixed(0)}" preserveAspectRatio="none"><polygon points="${rel.map((q) => `${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(' ')}"/></svg>`);
    frag.appendChild(el);
    const dx = (mx - cx) * (0.5 + Math.random() * 0.5), spin = () => (Math.random() - 0.5) * 2;
    el.animate([
      { transform: 'translate3d(0,0,0) rotateX(0) rotateY(0) rotateZ(0)', opacity: 1 },
      { transform: `translate3d(${dx * 0.25}px,${-18 - Math.random() * 30}px,60px) rotateX(${spin() * 20}deg) rotateY(${spin() * 20}deg) rotateZ(${spin() * 6}deg)`, opacity: 1, offset: 0.18, easing: 'cubic-bezier(.5,0,1,.6)' },
      { transform: `translate3d(${dx}px,${H * (0.9 + Math.random() * 0.5)}px,${-200 + Math.random() * 500}px) rotateX(${spin() * 200}deg) rotateY(${spin() * 160}deg) rotateZ(${spin() * 70}deg)`, opacity: 0.9 },
    ], { duration: 900 + Math.random() * 500, delay: ring * 70 + Math.random() * 90, fill: 'forwards' });
  }
  shards.appendChild(frag);
  cracks.innerHTML = '';
  fallEl.className = 'fall dropping';
  snd.glass(); snd.boom(1);
  setTimeout(() => { shards.querySelectorAll('.shard').forEach((e) => e.remove()); }, 1700);
}
async function typeOut(el, text, perTick = 3, ms = 14) { for (let i = 0; i < text.length; i += perTick) { el.textContent += text.slice(i, i + perTick); if (i % 9 === 0) snd.key(); await wait(ms); } }
async function quickJump(ev) {
  if (falling || glitching) return;
  if (calm()) { scrollTo(0, 0); return; }
  falling = true; tour.on = false; tour.glide = null;
  unlockSound();
  const r = $('#jumpBtn').getBoundingClientRect();
  const cx = ev?.clientX || r.left + r.width / 2, cy = ev?.clientY || r.top + r.height / 2;
  const shards = $('#fallShards');
  fallEl.dataset.edition = settings.universe; fallEl.dataset.world = root.dataset.world;

  // 1. the screen breaks where it was hit
  await shatterScreen(cx, cy);
  setWorld('paper', false); // neutral base, so each scene shows only its own universe
  scrollTo(0, 0);           // we are already back at the top, hidden behind the fall

  // 2. fall. Pip tumbles in the middle the whole way; the universes rush past and Pip is redrawn in each one's style
  const faller = $('#fallPip'), flash = $('#fallFlash'), windows = $$('.project .window');
  // Every universe shows on the way down: the projects in their own, the rest as quick flashes in between.
  const [inf, chap] = await Promise.all([import('./infinity.js?v=22').catch(() => null), import('./chapter.js?v=23').catch(() => null)]);
  if (inf && !document.querySelector('link[data-inf]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'infinity.css?v=22'; l.dataset.inf = '1'; document.head.append(l); }
  const plan = fallPlan();
  faller.innerHTML = pip.querySelector('svg').outerHTML.replace('</svg>', `<g class="pip-wear">${chap?.PIP_WEAR || ''}</g>${inf?.EMO_SVG || ''}</svg>`);
  faller.hidden = false; faller.className = 'fall-pip';
  const actx$ = () => (soundOn ? actx : null);
  // The scene of a dark universe is drawn behind the fall.
  const bg = document.createElement('canvas'); bg.className = 'fall-bg'; fallEl.prepend(bg);
  const bgc = bg.getContext('2d'); let bgWorld = '', bgS = {}, bgRaf = 0; const bgT0 = performance.now();
  const sizeBg = () => { bg.width = innerWidth; bg.height = innerHeight; };
  sizeBg();
  const drawBg = (now) => { bgRaf = requestAnimationFrame(drawBg); if (!inf?.U?.[bgWorld]) { bgc.clearRect(0, 0, bg.width, bg.height); return; } try { inf.U[bgWorld].draw(bgc, bg.width, bg.height, (now - bgT0) / 1000, bgS, 2.5, [], 0.3); } catch { /* keep falling */ } };
  bgRaf = requestAnimationFrame(drawBg);
  const MOODS = ['wow', 'laugh', 'scared', 'happy', 'cool', 'love', 'wow', 'scared'];
  const pose = (world, side) => { // Pip's face and place change with every universe
    const emo = inf?.U?.[world]?.emo || MOODS[(Math.random() * MOODS.length) | 0];
    faller.className = `fall-pip pip-loop emo ${inf?.EMO_CLASS?.[emo] || ''}`;
    faller.dataset.getup = emo === 'cool' ? 'sun' : '';
    if (inf?.TINT?.[emo]) faller.style.setProperty('--pip-tint', inf.TINT[emo]); else faller.style.removeProperty('--pip-tint');
    faller.style.setProperty('--fx', `${(side < 0 ? 58 + Math.random() * 26 : 16 + Math.random() * 26).toFixed(1)}%`);
    faller.style.setProperty('--fy', `${(26 + Math.random() * 46).toFixed(1)}%`);
  };
  snd.riser(plan.reduce((t, p) => t + p.t, 0) / 1000);
  const burst = (big) => { // a flash, a jolt and a spray of shards as we break into the next universe
    flash.animate([{ opacity: big ? 1 : 0.8 }, { opacity: 0 }], { duration: big ? 420 : 200, easing: 'ease-out' });
    fallStage.animate([{ transform: 'translate(0,0)' }, { transform: `translate(${(Math.random() - 0.5) * 22}px,${(Math.random() - 0.5) * 22}px)` }, { transform: 'translate(0,0)' }], { duration: 170 });
    const wrap = document.createElement('div');
    wrap.innerHTML = Array.from({ length: big ? 22 : 11 }, () => `<b style="--a:${(Math.random() * 360).toFixed(0)}deg;--s:${(22 + Math.random() * 90).toFixed(0)}px;--t:${(0.4 + Math.random() * 0.4).toFixed(2)}s;clip-path:polygon(${(Math.random() * 40).toFixed(0)}% 0,100% ${(30 + Math.random() * 50).toFixed(0)}%,${(Math.random() * 60).toFixed(0)}% 100%)"></b>`).join('');
    shards.appendChild(wrap); setTimeout(() => wrap.remove(), 900);
  };
  for (const [n, p] of plan.entries()) {
    const side = n % 2 ? 1 : -1, fast = p.t < 900, loopW = isLoopWorld(p.world);
    fallEl.dataset.edition = p.ed; fallEl.dataset.world = p.world; fallEl.toggleAttribute('data-dark', loopW);
    faller.dataset.world = p.world; faller.dataset.edition = p.ed; faller.toggleAttribute('data-loop', loopW);
    bgWorld = loopW ? p.world : ''; bgS = {};
    pose(p.world, p.flash ? (Math.random() < 0.5 ? 1 : -1) : side);
    const scene = document.createElement('div');
    scene.className = `fall-scene${p.world === 'sketch' ? ' sketch' : ''}${fast ? ' fast' : ''}${p.flash ? ' flash' : ''}`; scene.dataset.world = p.world; scene.dataset.edition = p.ed;
    if (loopW) { scene.setAttribute('data-loop', ''); scene.setAttribute('data-dark', ''); }
    if (p.flash) scene.innerHTML = `<p class="fs-kicker">Universe</p><p class="fs-name">${WORLD_NAMES[p.world]}</p>`;
    else {
      let preview = '';
      if (p.win != null && windows[p.win]) { const c = windows[p.win].cloneNode(true); c.className = 'window'; c.querySelector('.note')?.remove(); preview = c.outerHTML; }
      else preview = `<div class="window"><div class="win-bar"><i></i><i></i><i></i><span>${p.name.toUpperCase().replace(/[^A-Z]/g, '')}.SYS</span><b>LIVE</b></div><p class="fall-glyph">${p.glyph}</p></div>`;
      const words = [p.name, `:${p.code}`, ...p.bits, ...p.bits];
      scene.innerHTML = `<div class="fs-rings">${'<i></i>'.repeat(6)}</div><p class="fs-name">${p.name}</p><p class="fs-name b">${p.name}</p>`
        + `<div class="fs-bits">${words.map((w, k) => `<i style="--a:${((k / words.length) * 360 + Math.random() * 25).toFixed(0)}deg;--d:${(-Math.random() * 1.1).toFixed(2)}s">${w}</i>`).join('')}</div>`
        + `<div class="fall-card ${side < 0 ? 'L' : 'R'}"><div class="card fall-inner">${preview}<div class="fall-text"><p class="p-num">:${p.code} · ${WORLD_NAMES[p.world]}</p><h3>${p.name}</h3><p>${p.line}</p></div></div></div>`;
      if (SITE.motion.tunes !== false) playTune(actx$(), p.name, fast);
    }
    fallStage.appendChild(scene);
    if (n && !p.flash) burst();
    if (p.flash) snd.crack(); else { snd.whoosh(Math.min(0.7, p.t / 1000), fast ? 0.35 : 0.55); if (n && !fast) snd.boom(0.35); }
    await scene.animate(p.flash ? [
      { transform: 'scale(.4)', opacity: 0 }, { transform: 'scale(1)', opacity: 1, offset: 0.3 }, { transform: 'scale(2.6)', opacity: 0 },
    ] : [
      { transform: `scale(.08) rotate(${side * -18}deg)`, opacity: 0, filter: 'blur(6px)', easing: 'cubic-bezier(.1,.8,.3,1)' },
      { transform: `scale(1) rotate(${side * -2}deg)`, opacity: 1, filter: 'blur(0px)', offset: fast ? 0.36 : 0.16, easing: 'linear' },
      { transform: `scale(1.18) rotate(${side * 3}deg)`, opacity: 1, filter: 'blur(0px)', offset: fast ? 0.64 : 0.86, easing: 'cubic-bezier(.7,0,.9,.4)' },
      { transform: `scale(6) rotate(${side * 20}deg)`, opacity: 0, filter: 'blur(10px)' },
    ], { duration: p.t }).finished;
    scene.remove();
  }
  cancelAnimationFrame(bgRaf); bg.remove(); fallEl.removeAttribute('data-dark');
  faller.className = 'fall-pip'; faller.removeAttribute('data-loop'); faller.style.removeProperty('--fx'); faller.style.removeProperty('--fy');

  // 3. the crash landing, on an old amber CRT: Pip flickers into pixels, then a grid of digits, the crash screen, erased, redrawn, power off
  burst(true); snd.boom(1); snd.glass();
  fallEl.className = 'fall crashing crt'; fallEl.dataset.world = 'paper';
  faller.classList.add('still'); snd.hum(15);
  for (let i = 0; i < 13; i++) { faller.dataset.world = i % 2 ? 'paper' : 'pixel'; if (i % 3 === 0) snd.crack(); await wait(120); }
  faller.hidden = true; faller.innerHTML = '';
  for (let i = 0; i < 18; i++) { fallTerm.textContent = pipMatrix(); if (i % 2 === 0) snd.key(); await wait(115); }
  fallTerm.textContent = ''; snd.beep(440, 0.25); await wait(500);
  await typeOut(fallTerm, `${CRASH.slice(0, 6).join('\n')}\n\n`, 3, 24); await wait(450);
  await typeOut(fallTerm, `${CRASH.slice(7, 9).join('\n')}\n\n`, 1, 26); await wait(500);
  for (const line of CRASH.slice(10)) { await typeOut(fallTerm, `${line}\n`, 1, 24); await wait(520); }
  fallTerm.textContent += '█'; await wait(1400);
  while (fallTerm.textContent.length > 1) { fallTerm.textContent = fallTerm.textContent.slice(0, -Math.ceil(fallTerm.textContent.length / 16)); if (Math.random() < 0.4) snd.key(); await wait(55); }
  for (let i = 0; i < 7; i++) { fallTerm.textContent = i % 2 ? ' ' : '█'; await wait(330); }
  fallTerm.textContent = PIP_ASCII; snd.beep(660, 0.12); await wait(120); snd.beep(990, 0.18);
  await wait(2000);
  snd.powerDown();
  await fallTerm.animate([{ transform: 'scale(1,1)', filter: 'brightness(1)' }, { transform: 'scale(1.1,.006)', filter: 'brightness(3)', offset: 0.55 }, { transform: 'scale(.004,.006)', filter: 'brightness(4)', offset: 0.85 }, { transform: 'scale(0,0)', filter: 'brightness(1)' }], { duration: 700, easing: 'ease-in', fill: 'forwards' }).finished;
  fallTerm.textContent = ''; fallTerm.getAnimations().forEach((a) => a.cancel());
  await wait(220);

  // 4. land in the Pixel universe, in the colours for the local time. It turns back to normal once the page scrolls down.
  const hr = new Date().getHours();
  setWorld('pixel', true);
  setEdition(PREFS.edition || (hr >= 5 && hr < 11 ? 'morning' : hr >= 11 && hr < 17 ? 'noon' : hr >= 17 && hr < 21 ? 'dusk' : 'night'));
  snd.chime();
  await fallEl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 600, easing: 'ease-out' }).finished;
  fallEl.hidden = true; fallEl.className = 'fall';
  import('./dive.js?v=22').then((m) => m.startDive({ calm, say })).catch(() => {}); // the second scroll dives into each project
  falling = false; pendingNormal = true; jumped = true; tour.done = false; tour.held = false; tour.pos = 0; tour.resumeAt = performance.now() + 2500;
  say('Phew. Home again.', 3200);
}
$('#jumpBtn').addEventListener('click', quickJump);

/* ---------------------------------------------------------
   The next chapter (chapter.js): memory, project stories,
   Ask Pip, seasons, stickers and the 30-second version.
   Loaded separately, so the site above never depends on it.
   --------------------------------------------------------- */
import('./chapter.js?v=23').then((m) => m.initChapter({
  root, $, $$, calm, say, pip, visits, PREFS, SITE, tourPause, snd, setMenu, audio: () => (soundOn ? actx : null),
  refreshTag: () => { $('#editionText').textContent = tagText(); },
  openResume: () => $('[data-resume]')?.click(),
})).catch((err) => console.warn('[chapter]', err));

/* ---------------------------------------------------------
   Extras that never hold up the page: live GitHub stats on the
   project cards, the kind words wall, notes and quick read.
   --------------------------------------------------------- */
const whenIdle = (fn) => ('requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 3000 }) : setTimeout(fn, 1500));
whenIdle(() => {
  import('./lib/gh-stats.js?v=1').then((m) => m.initStats()).catch(() => {});
  import('./lib/kind-wall.js?v=1').then((m) => m.drawKind($('#kindWall'))).catch(() => {});
});
// Notes: a nav and footer link once there is at least one, plus the newest in the hero's small print.
const notes = (siteContent?.notesIndex || []).filter((n) => n && n.id && n.title);
if (notes.length) {
  const li = document.createElement('li'); li.innerHTML = '<a href="notes.html">Notes</a>';
  $('#navLinks .nav-themes')?.closest('li').before(li);
  $('.footer-inner a[href="universes.html"]')?.insertAdjacentHTML('beforebegin', '<a href="notes.html">Notes ✎</a>');
}
// Quick read: always offered beside the 30-second version; offered up front on data saver or a slow connection.
{
  const net = navigator.connection || {};
  if ((net.saveData || /(^|-)2g$/.test(net.effectiveType || '')) && !document.querySelector('.slow-note')) {
    const el = document.createElement('p');
    el.className = 'slow-note';
    el.innerHTML = 'On a slow connection? <a href="read.html">Open the quick-read page</a> (no animation, loads in a blink).';
    $('.hero-actions')?.before(el);
  }
}

/* =========================================================
   The 3D universe (visuals only). The page works without it.
   ========================================================= */
let engine = null;
try {
  const test = document.createElement('canvas');
  if (!(test.getContext('webgl2') || test.getContext('webgl'))) throw new Error('no webgl');
  const [THREE, { EffectComposer }, { RenderPass }, { UnrealBloomPass }, { OutputPass }] = await Promise.all([
    import('three'),
    import('three/addons/postprocessing/EffectComposer.js'),
    import('three/addons/postprocessing/RenderPass.js'),
    import('three/addons/postprocessing/UnrealBloomPass.js'),
    import('three/addons/postprocessing/OutputPass.js'),
  ]);
  engine = createEngine(THREE, { EffectComposer, RenderPass, UnrealBloomPass, OutputPass });
} catch (err) {
  console.warn('[universe] running without WebGL:', err?.message || err);
  root.classList.add('no-webgl');
}

// A refresh arrives glitching, then settles. It starts once the 3D scene is ready, so the effect is not cut short.
engine?.setPixelated(root.dataset.world === 'pixel');
engineReady = true;
engine?.setPaused(isLoopWorld(root.dataset.world));
if (root.dataset.reload && !calm()) requestAnimationFrame(() => glitch(1700, '', null, root.dataset.world));

/* =========================================================
   Engine implementation
   ========================================================= */
function createEngine(THREE, PP) {
  const canvas = $('#universe');
  const mobile = matchMedia('(pointer: coarse)').matches || innerWidth < 700;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.5 : 2));
  renderer.setSize(innerWidth, innerHeight, false);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.05, 400);

  const composer = new PP.EffectComposer(renderer);
  composer.addPass(new PP.RenderPass(scene, camera));
  const bloom = new PP.UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 1.1, 0.55, 0.0);
  composer.addPass(bloom);
  composer.addPass(new PP.OutputPass());

  /* ---- glow sprite texture ---- */
  const glowTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const g = c.getContext('2d');
    const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, 'rgba(255,255,255,1)');
    grd.addColorStop(0.18, 'rgba(255,255,255,.55)');
    grd.addColorStop(0.45, 'rgba(255,255,255,.12)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();

  /* ---- starfield (far) + dust (near, for parallax depth) ---- */
  function makePoints(n, rMin, rMax, size, opacity) {
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2, r = rMin + Math.random() * (rMax - rMin);
      const s = Math.sqrt(1 - u * u);
      pos.set([r * s * Math.cos(th), r * u, r * s * Math.sin(th)], i * 3);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ size, sizeAttenuation: true, transparent: true, opacity, depthWrite: false, map: glowTex, alphaTest: 0.01 });
    const pts = new THREE.Points(geo, mat);
    scene.add(pts);
    return pts;
  }
  const starfield = makePoints(mobile ? 1400 : 3200, 60, 140, mobile ? 0.9 : 0.7, 0.9);
  const dust = makePoints(mobile ? 260 : 600, 6, 30, 0.22, 0.5);

  /* ---- physics state ---- */
  const MAX_TRAIL = mobile ? 320 : 640;
  let bodies = [];
  let sceneName = 'figure8';
  let sceneCfg = null;
  let simT = 0, disturbed = false, escapedCount = 0, reseedAt = 0;
  let seed = (Math.random() * 1e9) | 0;
  let fade = 1, fadeTarget = 1, pendingScene = null;
  let locked = null; // scene chosen in the lab or sandbox overrides scroll

  const rng = (s) => () => { s |= 0; s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

  const SCENES = {
    figure8: () => {
      const p1 = [0.97000436, -0.24308753, 0], v3 = [-0.93240737, -0.86473146, 0];
      return { bodies: [
        { p: p1, v: [-v3[0] / 2, -v3[1] / 2, 0], m: 1 },
        { p: [-p1[0], -p1[1], 0], v: [-v3[0] / 2, -v3[1] / 2, 0], m: 1 },
        { p: [0, 0, 0], v: v3, m: 1 },
      ], dist: 4.6, elev: 0.62, dt: 0.0012, eps: 0.002, escR: 6, state: 'STABLE' };
    },
    lagrange: () => {
      const r = 1, v = Math.sqrt(1 / (Math.sqrt(3) * r));
      return { bodies: [0, 1, 2].map((k) => {
        const a = Math.PI / 2 + k * (2 * Math.PI / 3);
        return { p: [r * Math.cos(a), r * Math.sin(a), 0], v: [-v * Math.sin(a), v * Math.cos(a), 0], m: 1 };
      }), dist: 4.6, elev: 1.05, dt: 0.0012, eps: 0.002, escR: 6, state: 'BALANCED' };
    },
    binary: () => {
      const d = 0.5, v = Math.sqrt(1 / (4 * d));
      return { bodies: [
        { p: [d, 0, 0], v: [0, v, 0], m: 1 },
        { p: [-d, 0, 0], v: [0, -v, 0], m: 1 },
        { p: [2.1, 0, 0.15], v: [0, Math.sqrt(2 / 2.1), 0], m: 0.0, test: true, size: 0.55 },
        { p: [-2.9, 0, -0.2], v: [0, -Math.sqrt(2 / 2.9), 0], m: 0.0, test: true, size: 0.45 },
      ], dist: 6.2, elev: 0.75, dt: 0.0015, eps: 0.01, escR: 9, state: 'IN BALANCE' };
    },
    debris: () => {
      const R = rng(seed);
      const list = [{ p: [0, 0, 0], v: [0, 0, 0], m: 1, anchor: true, planet: true, size: 3.2, noTrail: true, glowScale: 0.75, glowAlpha: 0.6 }];
      const n = mobile ? 46 : 80;
      for (let i = 0; i < n; i++) {
        const r = 1.05 + R() * 1.4, inc = (R() - 0.5) * 2.2, node = R() * Math.PI * 2, a = R() * Math.PI * 2;
        const x = r * Math.cos(a), y = r * Math.sin(a), vx = -Math.sqrt(1 / r) * Math.sin(a), vy = Math.sqrt(1 / r) * Math.cos(a);
        const ci = Math.cos(inc), si = Math.sin(inc), cn = Math.cos(node), sn = Math.sin(node);
        const rot = (X, Y) => { const y1 = Y * ci, z1 = Y * si; return [X * cn - y1 * sn, X * sn + y1 * cn, z1]; };
        list.push({ p: rot(x, y), v: rot(vx, vy), m: 0, test: true, size: 0.28 + R() * 0.25, trailScale: 0.22, ci: i % 6, glowScale: 0.45, glowAlpha: 0.45 });
      }
      return { bodies: list, dist: 6.4, elev: 0.38, dt: 0.002, eps: 0.01, escR: 99, state: 'TRACKING' };
    },
    solar: () => {
      const radii = [0.6, 1.0, 1.5, 2.15];
      return { bodies: [
        { p: [0, 0, 0], v: [0, 0, 0], m: 1, anchor: true, size: 1.8, noTrail: true },
        ...radii.map((r, i) => {
          const a = i * 1.7, inc = (i - 1.5) * 0.06, v = Math.sqrt(1 / r);
          return { p: [r * Math.cos(a), r * Math.sin(a), r * Math.sin(a) * inc], v: [-v * Math.sin(a), v * Math.cos(a), v * Math.cos(a) * inc], m: 0, test: true, size: 0.5 + i * 0.08, ci: i + 1 };
        }),
      ], dist: 5.6, elev: 0.95, dt: 0.0015, eps: 0.01, escR: 99, state: 'ORBITING' };
    },
    studio: () => {
      const radii = [0.55, 0.85, 1.15, 1.5, 1.9, 2.35];
      return { bodies: [
        { p: [0, 0, 0], v: [0, 0, 0], m: 1, anchor: true, size: 2.2, noTrail: true },
        ...radii.map((r, i) => {
          const a = i * 2.4, inc = (i % 2 ? 1 : -1) * (0.08 + i * 0.05), v = Math.sqrt(1 / r);
          return { p: [r * Math.cos(a), r * Math.sin(a), 0], v: [-v * Math.sin(a), v * Math.cos(a) * Math.cos(inc), v * Math.cos(a) * Math.sin(inc)], m: 0, test: true, size: 0.75, ci: i };
        }),
      ], dist: 6.6, elev: 0.7, dt: 0.0015, eps: 0.01, escR: 99, state: 'SHIPPING' };
    },
    chaos: () => {
      const R = rng(seed);
      const n = 5, list = [];
      let px = 0, py = 0, pz = 0, M = 0;
      for (let i = 0; i < n; i++) {
        const m = 0.6 + R() * 0.8;
        const p = [(R() - 0.5) * 2.4, (R() - 0.5) * 2.4, (R() - 0.5) * 1.2];
        const v = [(R() - 0.5) * 0.7, (R() - 0.5) * 0.7, (R() - 0.5) * 0.4];
        list.push({ p, v, m }); px += m * v[0]; py += m * v[1]; pz += m * v[2]; M += m;
      }
      list.forEach((b) => { b.v[0] -= px / M; b.v[1] -= py / M; b.v[2] -= pz / M; });
      return { bodies: list, dist: 7.5, elev: 0.5, dt: 0.0008, eps: 0.04, escR: 7, state: 'CHAOTIC' };
    },
    pythagorean: () => ({
      bodies: [
        { p: [1, 3, 0], v: [0, 0, 0], m: 3 },
        { p: [-2, -1, 0], v: [0, 0, 0], m: 4 },
        { p: [1, -1, 0], v: [0, 0, 0], m: 5 },
      ].map((b) => ({ ...b, p: b.p.map((x) => x * 0.5), v: b.v })), // scaled ×0.5 (time ×0.35)
      dist: 6.5, elev: 0.6, dt: 0.0004, eps: 0.03, escR: 6, timeScale: 2.2, state: 'CHAOTIC',
    }),
  };

  /* ---- render objects ---- */
  const sphereGeo = new THREE.SphereGeometry(1, 24, 16);
  const group = new THREE.Group();
  scene.add(group);

  function uni() { return UNIVERSES[settings.universe]; }
  function palette() { const s = [...uni().stars]; if (settings.accent) s[0] = settings.accent; return s; }
  function bgColor() { return new THREE.Color(uni().bg); }
  function additive() { return !uni().light; }

  function trailLength(b) { return Math.max(8, Math.round(MAX_TRAIL * settings.trail * (b.trailScale || 1))); }

  function makeBodyVisual(b, i) {
    const pal = palette();
    const col = new THREE.Color(b.planet ? uni().planet : pal[(b.ci ?? i) % pal.length]);
    b.color = col;
    const s = (b.size || (0.8 + Math.cbrt(Math.max(b.m, 0.05)) * 0.5));
    const core = new THREE.Mesh(sphereGeo, new THREE.MeshBasicMaterial({ color: b.planet ? col : col.clone().lerp(new THREE.Color(uni().light ? col : '#ffffff'), 0.55), transparent: true }));
    core.scale.setScalar(0.035 * s * (b.planet ? 2.4 : 1) * (uni().light ? 1.5 : 1));
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: col, transparent: true, depthWrite: false, blending: additive() ? THREE.AdditiveBlending : THREE.NormalBlending, opacity: uni().light ? 0.6 : 1 }));
    glow.scale.setScalar(0.5 * s * (b.glowScale ?? 1));
    glow.userData.alpha = b.glowAlpha ?? 1;
    b.core = core; b.glow = glow;
    group.add(core, glow);
    if (!b.noTrail) {
      const n = trailLength(b);
      const pos = new Float32Array(n * 3), colArr = new Float32Array(n * 3);
      for (let k = 0; k < n; k++) pos.set([b.x[0], b.x[1], b.x[2]], k * 3);
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(colArr, 3));
      const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false, blending: additive() ? THREE.AdditiveBlending : THREE.NormalBlending }));
      line.frustumCulled = false;
      b.trail = { line, pos, colArr, n, filled: 1 };
      paintTrail(b);
      group.add(line);
    }
  }
  function paintTrail(b) {
    if (!b.trail) return;
    const { colArr, n } = b.trail;
    const base = additive() ? new THREE.Color(0, 0, 0) : bgColor();
    const c = new THREE.Color();
    for (let k = 0; k < n; k++) {
      const t = Math.pow(k / (n - 1), 1.6);
      c.copy(base).lerp(b.color, t * (additive() ? 0.95 : 0.9));
      colArr.set([c.r, c.g, c.b], k * 3);
    }
    b.trail.line.geometry.attributes.color.needsUpdate = true;
  }
  function disposeBody(b) {
    [b.core, b.glow, b.trail?.line].forEach((o) => { if (!o) return; group.remove(o); o.material?.dispose?.(); });
    b.trail?.line.geometry.dispose();
  }

  function addBody(spec, i) {
    const b = { ...spec, x: Float64Array.from(spec.p), v: Float64Array.from(spec.v), a: new Float64Array(3), escaped: false };
    bodies.push(b);
    makeBodyVisual(b, i ?? bodies.length - 1);
    return b;
  }

  function buildScene(name) {
    bodies.forEach(disposeBody);
    bodies = [];
    sceneName = name;
    sceneCfg = SCENES[name]();
    sceneCfg.bodies.forEach((s, i) => addBody(s, i));
    simT = 0; disturbed = false; escapedCount = 0; reseedAt = 0;
    computeAcc();
    // Prewarm so trails exist immediately
    const warm = name === 'pythagorean' ? 0.6 : 1.6;
    for (let t = 0; t < warm; t += 1 / 60) { advance(1 / 60); pushTrails(); }
    E0 = energy();
    camTarget.dist = sceneCfg.dist;
    camTarget.elev = sceneCfg.elev;
    syncLabUI();
  }

  /* ---- physics: leapfrog (kick-drift-kick) with softening ---- */
  function computeAcc() {
    const G = settings.g, eps2 = sceneCfg.eps * sceneCfg.eps;
    for (const b of bodies) { b.a[0] = b.a[1] = b.a[2] = 0; }
    const massive = bodies.filter((b) => b.m > 0);
    for (let i = 0; i < massive.length; i++) {
      const A = massive[i];
      for (let j = i + 1; j < massive.length; j++) {
        const B = massive[j];
        const dx = B.x[0] - A.x[0], dy = B.x[1] - A.x[1], dz = B.x[2] - A.x[2];
        const r2 = dx * dx + dy * dy + dz * dz + eps2, inv = G / (r2 * Math.sqrt(r2));
        A.a[0] += dx * inv * B.m; A.a[1] += dy * inv * B.m; A.a[2] += dz * inv * B.m;
        B.a[0] -= dx * inv * A.m; B.a[1] -= dy * inv * A.m; B.a[2] -= dz * inv * A.m;
      }
    }
    for (const t of bodies) {
      if (t.m > 0 || t.anchor) continue;
      for (const B of massive) {
        const dx = B.x[0] - t.x[0], dy = B.x[1] - t.x[1], dz = B.x[2] - t.x[2];
        const r2 = dx * dx + dy * dy + dz * dz + eps2, inv = G * B.m / (r2 * Math.sqrt(r2));
        t.a[0] += dx * inv; t.a[1] += dy * inv; t.a[2] += dz * inv;
      }
    }
  }
  function step(dt) {
    for (const b of bodies) { if (b.anchor) continue; b.v[0] += b.a[0] * dt / 2; b.v[1] += b.a[1] * dt / 2; b.v[2] += b.a[2] * dt / 2; b.x[0] += b.v[0] * dt; b.x[1] += b.v[1] * dt; b.x[2] += b.v[2] * dt; }
    computeAcc();
    for (const b of bodies) { if (b.anchor) continue; b.v[0] += b.a[0] * dt / 2; b.v[1] += b.a[1] * dt / 2; b.v[2] += b.a[2] * dt / 2; }
  }
  function advance(realDt) {
    const want = Math.min(realDt, 1 / 20) * settings.speed * (sceneCfg.timeScale || 1);
    const dt = sceneCfg.dt;
    const n = Math.min(Math.ceil(want / dt), mobile ? 260 : 600);
    const h = want / n;
    for (let i = 0; i < n; i++) step(h);
    simT += want;
  }
  function energy() {
    const G = settings.g, eps2 = sceneCfg.eps * sceneCfg.eps;
    const m = bodies.filter((b) => b.m > 0 && !b.anchor);
    if (!m.length) return 0;
    let K = 0, U = 0;
    for (const b of m) K += 0.5 * b.m * (b.v[0] ** 2 + b.v[1] ** 2 + b.v[2] ** 2);
    for (let i = 0; i < m.length; i++) for (let j = i + 1; j < m.length; j++) {
      const dx = m[i].x[0] - m[j].x[0], dy = m[i].x[1] - m[j].x[1], dz = m[i].x[2] - m[j].x[2];
      U -= G * m[i].m * m[j].m / Math.sqrt(dx * dx + dy * dy + dz * dz + eps2);
    }
    return K + U;
  }
  let E0 = 0;
  function centerOfMass(out) {
    let M = 0; out.set(0, 0, 0);
    for (const b of bodies) { if (b.m <= 0 || b.escaped) continue; out.x += b.x[0] * b.m; out.y += b.x[1] * b.m; out.z += b.x[2] * b.m; M += b.m; }
    if (M > 0) out.multiplyScalar(1 / M);
    return out;
  }
  const com = new THREE.Vector3();
  function checkEscapes(now) {
    centerOfMass(com);
    for (const b of bodies) {
      if (b.m <= 0 || b.anchor || b.escaped) continue;
      const dx = b.x[0] - com.x, dy = b.x[1] - com.y, dz = b.x[2] - com.z;
      const r = Math.hypot(dx, dy, dz);
      if (r > sceneCfg.escR && (dx * b.v[0] + dy * b.v[1] + dz * b.v[2]) > 0) {
        b.escaped = true; escapedCount++;
        if (escapedCount === 1) toast('One star escaped the system.');
      }
    }
    const bound = bodies.filter((b) => b.m > 0 && !b.escaped && !b.anchor).length;
    const hasAnchor = bodies.some((b) => b.anchor);
    if (!hasAnchor && bound < 2 && !reseedAt) reseedAt = now + 3500;
    for (const b of [...bodies]) {
      if (Math.hypot(b.x[0] - com.x, b.x[1] - com.y, b.x[2] - com.z) > 40) { disposeBody(b); bodies.splice(bodies.indexOf(b), 1); }
    }
    if (reseedAt && now > reseedAt) { reseedAt = 0; seed = (Math.random() * 1e9) | 0; transitionTo(sceneName, true); }
  }

  function pushTrails() {
    for (const b of bodies) {
      if (!b.trail) continue;
      const { pos, n } = b.trail;
      pos.copyWithin(0, 3);
      pos[n * 3 - 3] = b.x[0]; pos[n * 3 - 2] = b.x[1]; pos[n * 3 - 1] = b.x[2];
      b.trail.line.geometry.attributes.position.needsUpdate = true;
    }
  }

  /* ---- interactions ---- */
  function disturb() {
    const R = Math.random;
    let any = false;
    for (const b of bodies) {
      if (b.anchor) continue;
      const k = b.test ? 0.12 : 0.28;
      b.v[0] += (R() - 0.5) * k * 2; b.v[1] += (R() - 0.5) * k * 2; b.v[2] += (R() - 0.5) * k * 2.4;
      any = true;
    }
    if (any) { disturbed = true; toast('Disturbed. The orbit is now chaotic, so watch for an escape.'); }
    needsRender = true;
  }
  const ray = new THREE.Raycaster();
  function addStarAt(clientX, clientY) {
    const ndc = new THREE.Vector2((clientX / innerWidth) * 2 - 1, -(clientY / innerHeight) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const normal = camera.getWorldDirection(new THREE.Vector3()).negate();
    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(normal, smoothedCom);
    const hit = new THREE.Vector3();
    if (!ray.ray.intersectPlane(plane, hit)) return;
    let M = 0; for (const b of bodies) if (b.m > 0 && !b.escaped) M += b.m;
    const rel = hit.clone().sub(smoothedCom);
    const r = Math.max(rel.length(), 0.3);
    const tangent = new THREE.Vector3().crossVectors(normal, rel).normalize();
    const speed = Math.sqrt(settings.g * Math.max(M, 1) / r) * (0.75 + Math.random() * 0.3);
    const v = tangent.multiplyScalar(speed);
    const massiveCount = bodies.filter((b) => b.m > 0 && !b.anchor).length;
    if (massiveCount >= 14) { const old = bodies.find((b) => b.m > 0 && !b.anchor); disposeBody(old); bodies.splice(bodies.indexOf(old), 1); }
    addBody({ p: [hit.x, hit.y, hit.z], v: [v.x, v.y, v.z], m: 0.5 + Math.random() * 0.4, ci: (bodies.length + 1) % 6 });
    computeAcc();
    disturbed = true;
    needsRender = true;
  }

  /* ---- camera ---- */
  const camTarget = { dist: 4.6, elev: 0.62 };
  const cam = { dist: 4.6, elev: 0.62, az: 0.4, userAz: 0, userElev: 0, zoom: 1, frameX: innerWidth * 0.68, frameY: innerHeight * 0.5, frameScale: 1 };
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  const smoothedCom = new THREE.Vector3();
  addEventListener('pointermove', (e) => { pointer.x = e.clientX / innerWidth - 0.5; pointer.y = e.clientY / innerHeight - 0.5; }, { passive: true });

  // Where on screen should the system sit, and how big?
  let activeEl = null;
  function frameTarget() {
    const W = innerWidth, H = innerHeight;
    if (document.body.classList.contains('playing')) return { x: W / 2, y: H / 2, s: 1 };
    const portal = activeEl?.querySelector?.('.portal');
    if (portal) {
      const r = portal.getBoundingClientRect();
      const halo = portal.querySelector('.mock') ? 0.6 : 1; // systems orbit around app previews instead of hiding behind them
      const s = Math.min(Math.max((H / Math.max(r.height, 1)) * 0.62 * halo, 0.5), 2.6);
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, s };
    }
    if (activeEl?.id === 'hero') return isSmall() ? { x: W / 2, y: H * 0.3, s: 1.25 } : { x: W * 0.7, y: H * 0.48, s: 1 };
    const spot = activeEl?.dataset.frame;
    if (spot === 'top') return { x: W / 2, y: H * (isSmall() ? 0.2 : 0.2), s: 1.7 };
    if (spot === 'left') return isSmall() ? { x: W / 2, y: H * 0.22, s: 1.7 } : { x: W * 0.27, y: H * 0.5, s: 1.15 };
    return isSmall() ? { x: W / 2, y: H * 0.2, s: 1.8 } : { x: W * 0.8, y: H * 0.3, s: 1.5 };
  }

  // Which element drives the scene right now?
  const sceneEls = $$('[data-scene]');
  function pickActive() {
    const mid = innerHeight * 0.5;
    let best = sceneEls[0];
    for (const el of sceneEls) {
      const r = el.getBoundingClientRect();
      if (r.top < mid && r.bottom > innerHeight * 0.2) best = el;
    }
    return best;
  }
  function updateActive(force) {
    const el = pickActive();
    if (el === activeEl && !force) return;
    activeEl?.classList?.remove('active');
    activeEl = el;
    el.classList.add('active');
    if (!locked) {
      const name = el.dataset.scene;
      if (name !== sceneName || force) { transitionTo(name); showSceneLabel(el.dataset.sceneLabel); }
    }
  }
  function transitionTo(name, quiet) {
    if (calm()) { buildScene(name); needsRender = true; return; }
    pendingScene = name;
    fadeTarget = 0;
    if (!quiet) needsRender = true;
  }

  /* ---- drag to rotate, click/tap to add ---- */
  let drag = null;
  const pinch = new Map();
  canvas.addEventListener('pointerdown', (e) => {
    const playing = document.body.classList.contains('playing');
    if (!playing && e.pointerType !== 'mouse') return;
    pinch.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch.size === 2) { drag = null; return; }
    drag = { x: e.clientX, y: e.clientY, moved: 0, id: e.pointerId };
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (pinch.has(e.pointerId)) {
      const prev = pinch.get(e.pointerId);
      if (pinch.size === 2) {
        const pts = [...pinch.values()];
        const d0 = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        pinch.set(e.pointerId, { x: e.clientX, y: e.clientY });
        const p2 = [...pinch.values()];
        const d1 = Math.hypot(p2[0].x - p2[1].x, p2[0].y - p2[1].y);
        if (d0 > 0) cam.zoom = Math.min(3, Math.max(0.35, cam.zoom * d0 / d1));
        return;
      }
      pinch.set(e.pointerId, { x: e.clientX, y: e.clientY });
      void prev;
    }
    if (!drag || drag.id !== e.pointerId) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    drag.moved += Math.abs(dx) + Math.abs(dy);
    cam.userAz -= dx * 0.006;
    cam.userElev = Math.max(-1.2, Math.min(1.2, cam.userElev + dy * 0.005));
    drag.x = e.clientX; drag.y = e.clientY;
    canvas.style.cursor = 'grabbing';
  });
  const endPointer = (e) => {
    pinch.delete(e.pointerId);
    if (drag && drag.id === e.pointerId) {
      if (drag.moved < 6 && e.type === 'pointerup') addStarAt(e.clientX, e.clientY);
      drag = null;
    }
    canvas.style.cursor = finePointer ? 'grab' : '';
  };
  canvas.addEventListener('pointerup', endPointer);
  canvas.addEventListener('pointercancel', endPointer);
  if (finePointer) canvas.style.cursor = 'grab';
  canvas.addEventListener('wheel', (e) => {
    if (!document.body.classList.contains('playing')) return;
    e.preventDefault();
    cam.zoom = Math.min(3, Math.max(0.35, cam.zoom * Math.exp(e.deltaY * 0.001)));
  }, { passive: false });

  function lockScene(name) { locked = name; transitionTo(name); showSceneLabel(SCENE_NAMES[name]); }
  function unlockScene(rebuild) { locked = null; updateActive(true); if (rebuild) transitionTo(activeEl?.dataset.scene || 'figure8'); }

  /* ---- universe / settings changes ---- */
  function setUniverseGL() {
    const u = uni();
    scene.background = bgColor();
    starfield.material.color.set(u.dust);
    starfield.material.blending = additive() ? THREE.AdditiveBlending : THREE.NormalBlending;
    starfield.material.opacity = u.light ? 0.35 : 0.9;
    dust.material.color.set(settings.accent || u.stars[3]);
    dust.material.blending = starfield.material.blending;
    dust.material.opacity = u.light ? 0.18 : 0.45;
    starfield.material.needsUpdate = dust.material.needsUpdate = true;
    // rebuild visuals with the new palette, keep physics state
    bodies.forEach((b, i) => { disposeBody(b); const tp = b.trail?.pos; makeBodyVisual(b, i); if (tp && b.trail && tp.length === b.trail.pos.length) { b.trail.pos.set(tp); b.trail.line.geometry.attributes.position.needsUpdate = true; } });
    bloom.strength = u.bloom * settings.glow;
    needsRender = true;
  }
  function settingsChanged(k) {
    if (k === 'glow') bloom.strength = uni().bloom * settings.glow;
    if (k === 'trail') bodies.forEach((b, i) => { disposeBody(b); makeBodyVisual(b, i); });
    if (k === 'g') computeAcc();
    needsRender = true;
  }

  /* ---- HUD ---- */
  const hud = { scene: $('#hudScene'), bodies: $('#hudBodies'), energy: $('#hudEnergy'), time: $('#hudTime'), state: $('#hudState') };
  let hudT = 0;
  function updateHUD(now) {
    if (now - hudT < 120) return; hudT = now;
    const E = energy();
    hud.scene.textContent = SCENE_NAMES[sceneName].toUpperCase();
    hud.bodies.textContent = bodies.filter((b) => !b.escaped).length;
    hud.energy.textContent = (E < 0 ? '−' : '+') + Math.abs(E).toFixed(4);
    const m = Math.floor(simT / 60), s = (simT % 60).toFixed(1).padStart(4, '0');
    hud.time.textContent = `${String(m).padStart(2, '0')}:${s}`;
    let st = sceneCfg.state, cls = 'ok';
    if (escapedCount) { st = 'ESCAPE'; cls = 'bad'; } else if (disturbed || st === 'CHAOTIC') { st = 'CHAOTIC'; cls = 'warn'; }
    hud.state.textContent = st; hud.state.className = cls;
  }

  /* ---- loop ---- */
  let needsRender = true, last = performance.now(), running = true, rafId = 0;
  function resize() {
    renderer.setSize(innerWidth, innerHeight, false);
    composer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    needsRender = true;
  }
  addEventListener('resize', resize);
  document.addEventListener('visibilitychange', () => { running = !document.hidden; cancelAnimationFrame(rafId); if (running) { last = performance.now(); rafId = requestAnimationFrame(loop); } });
  addEventListener('scroll', () => { updateActive(); needsRender = true; }, { passive: true });

  function renderFrame(dt) {
    const k = dt ? 1 - Math.exp(-dt * 3.2) : 1;
    // smooth framing (follows portals as they scroll)
    const ft = frameTarget();
    cam.frameX += (ft.x - cam.frameX) * (dt ? 1 - Math.exp(-dt * 10) : 1);
    cam.frameY += (ft.y - cam.frameY) * (dt ? 1 - Math.exp(-dt * 10) : 1);
    cam.frameScale += (ft.s - cam.frameScale) * k;
    cam.dist += (camTarget.dist - cam.dist) * k;
    cam.elev += (camTarget.elev - cam.elev) * k;
    if (!calm()) cam.az += dt * 0.06;
    pointer.sx += (pointer.x - pointer.sx) * (dt ? 1 - Math.exp(-dt * 4) : 1);
    pointer.sy += (pointer.y - pointer.sy) * (dt ? 1 - Math.exp(-dt * 4) : 1);

    centerOfMass(com);
    smoothedCom.lerp(com, dt ? 1 - Math.exp(-dt * 2) : 1);

    const az = cam.az + cam.userAz + pointer.sx * 0.35;
    const el = Math.max(-1.35, Math.min(1.35, cam.elev + cam.userElev + pointer.sy * 0.2));
    const d = cam.dist * cam.zoom * cam.frameScale;
    camera.position.set(
      smoothedCom.x + d * Math.cos(el) * Math.sin(az),
      smoothedCom.y - d * Math.cos(el) * Math.cos(az),
      smoothedCom.z + d * Math.sin(el)
    );
    camera.up.set(0, 0, 1);
    camera.lookAt(smoothedCom);
    const W = innerWidth, H = innerHeight;
    camera.setViewOffset(W, H, W / 2 - cam.frameX, H / 2 - cam.frameY, W, H);

    // visuals
    const o = fade;
    for (const b of bodies) {
      b.core.position.set(b.x[0], b.x[1], b.x[2]);
      b.glow.position.copy(b.core.position);
      const eo = b.escaped ? Math.max(0, 1 - (Math.hypot(b.x[0] - com.x, b.x[1] - com.y, b.x[2] - com.z) - sceneCfg.escR) / 12) : 1;
      b.core.material.opacity = o * eo;
      b.glow.material.opacity = o * eo * (uni().light ? 0.6 : 1) * b.glow.userData.alpha;
      if (b.trail) b.trail.line.material.opacity = o;
    }
    starfield.rotation.z += dt * 0.004;
    dust.rotation.z -= dt * 0.012;

    if (uni().bloom * settings.glow > 0.01) composer.render(); else renderer.render(scene, camera);
  }

  let paused = false; // the 22 loop universes draw their own background, so the 3D scene rests
  function loop(now) {
    if (!running) return;
    if (paused) { last = now; rafId = requestAnimationFrame(loop); return; }
    const dt = Math.max(0, Math.min((now - last) / 1000, 0.1));
    last = now;

    // crossfade between systems
    if (pendingScene) {
      fade += (fadeTarget - fade) * (1 - Math.exp(-dt * 9));
      if (fade < 0.03) { buildScene(pendingScene); pendingScene = null; fadeTarget = 1; }
    } else if (fade < 1) fade += (1 - fade) * (1 - Math.exp(-dt * 5));

    const animate = !calm();
    if (animate) {
      advance(dt);
      pushTrails();
      checkEscapes(now);
      updateHUD(now);
    }
    if (animate || needsRender || Math.abs(cam.frameX - frameTarget().x) > 0.5) {
      renderFrame(dt);
      needsRender = false;
    }
    rafId = requestAnimationFrame(loop);
  }

  // Start
  activeEl = pickActive();
  activeEl.classList.add('active');
  buildScene(activeEl.dataset.scene || 'figure8');
  setUniverseGL();
  rafId = requestAnimationFrame(loop);
  updateHUD(performance.now() + 1000);

  // The Pixel universe renders the 3D scene at a fraction of the resolution and scales it up.
  const basePixelRatio = renderer.getPixelRatio();
  function setPixelated(on) {
    renderer.setPixelRatio(on ? 0.2 : basePixelRatio);
    composer.setPixelRatio(on ? 0.2 : basePixelRatio);
    renderer.setSize(innerWidth, innerHeight, false);
    composer.setSize(innerWidth, innerHeight);
    needsRender = true;
  }

  return {
    setPixelated,
    setPaused(on) { paused = on; needsRender = true; },
    get sceneName() { return sceneName; },
    get seed() { return seed; },
    setUniverse: setUniverseGL,
    settingsChanged,
    motionChanged() { needsRender = true; if (calm()) buildScene(sceneName); },
    disturb, lockScene, unlockScene,
    addStar: addStarAt,
    get massive() { return bodies.filter((b) => b.m > 0 && !b.escaped).length; },
  };
}
