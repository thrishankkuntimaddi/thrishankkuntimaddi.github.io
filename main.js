/* =========================================================
   Thrishank Kuntimaddi: portfolio
   Everything here is automatic: the colour edition follows
   local time and changes on refresh, the page tours itself,
   two glitches change the colours and reveal a final scene, and the
   3D gravity scenes change with each section.
   ========================================================= */
const root = document.documentElement;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const osReduced = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const calm = () => osReduced.matches;
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
/* Universes: each has its own fonts, component shapes (see style.css) and wording. */
const WORLDS = ['paper', 'pixel', 'sketch', 'blueprint', 'news'];
const WORLD_NAMES = { paper: 'Paper', pixel: 'Pixel', sketch: 'Sketch', blueprint: 'Blueprint', news: 'Newsprint' };
const COPY = {
  paper:     { h2: 'I design and build <em>interfaces</em>', h3: 'people enjoy using.', cta: 'See my projects', work: 'Projects', poelys: 'Poelys', more: 'More work', about: 'About me', contact: "Let's build something <em>people love</em>." },
  pixel:     { h2: 'I build <em>interfaces</em>', h3: 'worth pressing START for.', cta: 'Start', work: 'Level 01: Projects', poelys: 'Home base: Poelys', more: 'Side quests', about: 'Player stats', contact: 'Insert coin. <em>Hire player 1.</em>' },
  sketch:    { h2: 'I sketch <em>interfaces</em>,', h3: 'then build every line.', cta: 'Flip to my projects', work: 'The good pages', poelys: 'My studio, Poelys', more: 'Scribbles and side work', about: 'About the artist', contact: "Let's draw up something <em>people love</em>." },
  blueprint: { h2: 'I engineer <em>interfaces</em>', h3: 'to spec, then make them human.', cta: 'Open the drawings', work: 'Fig. 01: Projects', poelys: 'Fig. 02: Poelys', more: 'Fig. 03: Further work', about: 'Spec sheet: me', contact: 'Request a build. <em>Tolerances: tight.</em>' },
  news:      { h2: 'Developer builds <em>interfaces</em>', h3: 'people actually enjoy using.', cta: 'Read the full story', work: 'Front page: Projects', poelys: 'Business: Poelys', more: 'In other news', about: 'Profile', contact: 'Wanted: a team that <em>ships</em>.' },
};
const tagText = () => `${WORLD_NAMES[root.dataset.world] || 'Paper'} universe · ${UNIVERSES[settings.universe].name.replace(' edition', '')}`;
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
  applyCopy(name);
  engine?.setPixelated(name === 'pixel');
  if (anchor) { const d = anchor.getBoundingClientRect().top - before; if (Math.abs(d) > 1) scrollTo(0, scrollY + d); } // keep the visitor's place when heights change
  tour.pos = scrollY;
  if (save) { try { sessionStorage.setItem('tk-world', String(WORLDS.indexOf(name))); } catch { /* private mode */ } }
}
if (!WORLDS.includes(root.dataset.world)) root.dataset.world = 'paper';
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
const nextEdition = () => setEdition(EDITION_ORDER[(EDITION_ORDER.indexOf(settings.universe) + 1) % EDITION_ORDER.length]);
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
const tour = { on: false, pos: 0, speed: 0, resumeAt: performance.now() + 2600, held: false, done: false, glide: null };
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
    } else if (!falling && !tour.held && !tour.done && now >= tour.resumeAt && !links.classList.contains('open') && !resumeDlg.open) tourPlay();
    storyTick();
    tourUI(now);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

/* ---------------------------------------------------------
   Resume: preview in a dialog, always showing the latest
   published version (see update-resume.sh). The buttons only
   appear once a resume has been published.
   --------------------------------------------------------- */
const resumeDlg = $('#resumeDlg');
const RESUME = 'resume/Thrishank-Kuntimaddi-Resume.pdf';
let resumeV = '';
fetch('resume/meta.json', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : Promise.reject())).then((m) => {
  resumeV = `?v=${m.updated}`;
  const d = new Date(`${m.updated}T00:00:00`);
  $('#resumeDate').textContent = `Updated ${d.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}`;
  $('#resumeDownload').href = RESUME + resumeV;
  $('#resumeOpen').href = RESUME + resumeV;
  $('#postDownload').href = RESUME + resumeV;
  $$('[data-resume-slot]').forEach((el) => { el.hidden = false; });
}).catch(() => {});
document.addEventListener('click', (e) => {
  const a = e.target.closest('[data-resume]');
  if (!a || !resumeDlg.showModal) return; // without <dialog> support the link just opens the PDF
  e.preventDefault();
  setMenu(false);
  const img = $('#resumeImg');
  if (!img.getAttribute('src')) img.src = `resume/preview.jpg${resumeV}`;
  tourPause(false);
  resumeDlg.showModal();
});
$('#resumeClose').addEventListener('click', () => resumeDlg.close());
$('#resumeImg').addEventListener('click', () => {
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
  if (soundOn) return;
  soundOn = true;
  sfx.muted = true;
  sfx.play().then(() => { sfx.pause(); sfx.currentTime = 0; sfx.muted = false; }).catch(() => { soundOn = false; });
  try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); } catch { /* no Web Audio */ }
}
['pointerdown', 'keydown', 'touchend'].forEach((ev) => addEventListener(ev, unlockSound, { passive: true }));
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
  if (calm() || glitching) { midpoint?.(); return Promise.resolve(); }
  glitching = true;
  if (peeking) stopPeek();
  const from = settings.universe, to = EDITION_ORDER[(EDITION_ORDER.indexOf(from) + 1) % EDITION_ORDER.length];
  playGlitchSound(ms);
  const targetWorld = settle || WORLDS[(WORLDS.indexOf(root.dataset.world) + 1) % WORLDS.length];
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
if (!calm()) {
  pip.hidden = false;
  let holdT = 0, held = false, pokes = 0, at = 0, walkT = 0, acts = 0;
  const FACES = ['happy', 'wow', 'left', 'right', 'sleepy', 'wink'];
  const lines = ['Hehe.', 'That tickles.', 'Again!', 'Okay, okay.', 'Boop.', 'Hold me down and see.'];
  const face = (name) => { FACES.forEach((f) => pip.classList.remove(`ex-${f}`)); if (name) pip.classList.add(`ex-${name}`); };
  setTimeout(() => { face('happy'); say('Hi!', 2600); }, 2800);
  setInterval(() => { // every few seconds: walk somewhere, or pull a face
    if (document.hidden || glitching || peeking || pip.classList.contains('walking') || root.classList.contains('at-final')) return;
    acts++;
    if (Math.random() < 0.45) {
      const to = -Math.random() * Math.min(innerWidth * 0.32, 420), d = Math.abs(to - at);
      if (d > 40) {
        face(to < at ? 'left' : 'right');
        pip.style.setProperty('--face', to < at ? '-1' : '1');
        pip.style.setProperty('--pt', `${(d / 62).toFixed(2)}s`);
        pip.style.setProperty('--px', `${to.toFixed(0)}px`);
        pip.classList.add('walking');
        clearTimeout(walkT);
        walkT = setTimeout(() => { pip.classList.remove('walking'); pip.style.setProperty('--face', '1'); face(''); }, (d / 62) * 1000);
        at = to;
        return;
      }
    }
    face(Math.random() < 0.25 ? '' : FACES[(Math.random() * FACES.length) | 0]);
    if (!pokes && acts % 4 === 0) { // lure: flicker and call out until someone pokes
      pip.classList.remove('flick'); void pip.offsetWidth; pip.classList.add('flick');
      say(['Psst.', 'Hey.', '?', 'Over here.'][(Math.random() * 4) | 0], 2400);
    }
  }, 2600);
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
    blip(520 + (pokes % 4) * 110);
    face(['happy', 'wow', 'wink'][pokes % 3]);
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
let holdTour = false;
if (!calm()) postEl.hidden = true;
function storyTick() {
  if (glitching) return;
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
  const css = (n) => getComputedStyle(root).getPropertyValue(n).trim();
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
const CRASH = ['┌───────────┐', '│ ┌───────┐ │', '│ │       │ │', '│ └───────┘ │', '│   ┌───┐   │', '└───┴───┴───┘', '', 'A problem has been detected and Pip will', 'shut down to prevent damage.', '', 'collecting universes for crash dump...', 'saving your place...', 'dumping memory to disk...', 'erasing...'];
const PIP_ASCII = ['    .-""""""-.', '   /  O    O  \\', '  |     __     |', '   \\   \\__/   /', "    '-......-'", '      |    |', '     _|    |_'].join('\n');
async function quickJump() {
  if (falling) return;
  if (calm()) { scrollTo(0, 0); return; }
  falling = true; tour.on = false; tour.glide = null;
  unlockSound(); playGlitchSound(1600);
  const W = innerWidth, H = innerHeight, cx = W * (0.4 + Math.random() * 0.2), cy = H * (0.4 + Math.random() * 0.2);
  // 1. cracks spread over the page, then it breaks into shards that fall away
  const N = 13, pts = Array.from({ length: N }, (_, i) => { const a = (i / N) * Math.PI * 2 + Math.random() * 0.25, r = Math.hypot(W, H); return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; });
  fallEl.hidden = false; fallEl.className = 'fall cracking';
  fallEl.dataset.edition = settings.universe; fallEl.dataset.world = root.dataset.world;
  const cracks = $('#fallCracks'); cracks.setAttribute('viewBox', `0 0 ${W} ${H}`);
  cracks.innerHTML = pts.map(([x, y]) => `<path d="M${cx} ${cy} L${(cx + x) / 2 + (Math.random() - 0.5) * 60} ${(cy + y) / 2 + (Math.random() - 0.5) * 60} L${x} ${y}"/>`).join('');
  blip(240, 300);
  await wait(520);
  const shards = $('#fallShards');
  shards.innerHTML = pts.map((p, i) => { const q = pts[(i + 1) % N]; return `<i style="clip-path:polygon(${cx}px ${cy}px,${p[0]}px ${p[1]}px,${q[0]}px ${q[1]}px);--dx:${((p[0] + q[0]) / 2 - cx) * 0.5}px;--dy:${H * (0.7 + Math.random() * 0.6)}px;--rot:${(Math.random() - 0.5) * 80}deg;--d:${(Math.random() * 0.18).toFixed(2)}s"></i>`; }).join('');
  fallEl.className = 'fall shattering';
  await wait(900);
  cracks.innerHTML = ''; shards.innerHTML = '';
  fallEl.className = 'fall dropping';
  setWorld('paper', false); // neutral base, so each card shows only its own universe
  scrollTo(0, 0); // we are already back at the top, hidden behind the fall

  // 2. fall. Pip tumbles in the middle the whole way; the universes rush past and Pip is redrawn in each one's style
  const faller = $('#fallPip'), flash = $('#fallFlash'), windows = $$('.project .window');
  faller.innerHTML = pip.querySelector('svg').outerHTML; faller.hidden = false; faller.className = 'fall-pip';
  const burst = () => { // a flash and a spray of shards as we break into the next universe
    flash.animate([{ opacity: 0.85 }, { opacity: 0 }], { duration: 220, easing: 'ease-out' });
    const wrap = document.createElement('div');
    wrap.innerHTML = Array.from({ length: 9 }, () => `<b style="--a:${(Math.random() * 360).toFixed(0)}deg;--s:${(30 + Math.random() * 90).toFixed(0)}px;clip-path:polygon(${(Math.random() * 40).toFixed(0)}% 0,100% ${(30 + Math.random() * 50).toFixed(0)}%,${(Math.random() * 60).toFixed(0)}% 100%)"></b>`).join('');
    shards.appendChild(wrap); setTimeout(() => wrap.remove(), 650);
    blip(260 + Math.random() * 520, 70);
  };
  for (const [n, p] of FALL.entries()) {
    const side = n % 2 ? 1 : -1, fast = p.t < 900;
    fallEl.dataset.edition = p.ed; fallEl.dataset.world = p.world;
    faller.dataset.world = p.world; faller.dataset.edition = p.ed;
    const scene = document.createElement('div');
    scene.className = `fall-scene${p.world === 'sketch' ? ' sketch' : ''}${fast ? ' fast' : ''}`; scene.dataset.world = p.world; scene.dataset.edition = p.ed;
    let preview = '';
    if (p.win != null && windows[p.win]) { const c = windows[p.win].cloneNode(true); c.className = 'window'; c.querySelector('.note')?.remove(); preview = c.outerHTML; }
    else preview = `<div class="window"><div class="win-bar"><i></i><i></i><i></i><span>${p.name.toUpperCase().replace(/[^A-Z]/g, '')}.SYS</span><b>LIVE</b></div><p class="fall-glyph">${p.glyph}</p></div>`;
    const words = [p.name, `:${p.code}`, ...p.bits, ...p.bits];
    scene.innerHTML = `<p class="fs-name">${p.name}</p><p class="fs-name b">${p.name}</p>`
      + `<div class="fs-bits">${words.map((w, k) => `<i style="--a:${((k / words.length) * 360 + Math.random() * 25).toFixed(0)}deg;--d:${(-Math.random() * 1.4).toFixed(2)}s">${w}</i>`).join('')}</div>`
      + `<div class="fall-card ${side < 0 ? 'L' : 'R'}"><div class="card fall-inner">${preview}<div class="fall-text"><p class="p-num">:${p.code}</p><h3>${p.name}</h3><p>${p.line}</p></div></div></div>`;
    fallStage.appendChild(scene);
    burst();
    await scene.animate([
      { transform: `scale(.1) rotate(${side * -16}deg)`, opacity: 0, easing: 'cubic-bezier(.1,.7,.3,1)' },
      { transform: `scale(1) rotate(${side * -2}deg)`, opacity: 1, offset: fast ? 0.34 : 0.14, easing: 'linear' },
      { transform: `scale(1.16) rotate(${side * 3}deg)`, opacity: 1, offset: fast ? 0.66 : 0.88, easing: 'cubic-bezier(.7,0,.9,.4)' },
      { transform: `scale(5.5) rotate(${side * 18}deg)`, opacity: 0 },
    ], { duration: p.t }).finished;
    scene.remove();
  }

  // 3. the crash landing. Pip freezes, breaks into pixels, then: dot matrix, crash text, erased, redrawn
  burst();
  fallEl.dataset.edition = 'noon'; fallEl.dataset.world = 'pixel'; fallEl.className = 'fall crashing';
  faller.dataset.world = 'pixel'; faller.classList.add('still');
  playGlitchSound(1300);
  await wait(650);
  faller.hidden = true; faller.innerHTML = '';
  for (let i = 0; i < 12; i++) { fallTerm.textContent = pipMatrix(); await wait(95); }
  fallTerm.textContent = '';
  for (const line of CRASH) { fallTerm.textContent += `${line}\n`; blip(900, 20); await wait(line ? 120 : 60); }
  await wait(650);
  while (fallTerm.textContent.length > 1) { fallTerm.textContent = fallTerm.textContent.slice(0, -Math.ceil(fallTerm.textContent.length / 9)); await wait(45); }
  for (let i = 0; i < 4; i++) { fallTerm.textContent = i % 2 ? '' : '.'; await wait(230); }
  fallTerm.textContent = PIP_ASCII; blip(660, 120);
  await wait(1100);

  // 4. land: the normal look, in the colours for the local time
  const hr = new Date().getHours();
  setWorld('paper', true);
  setEdition(hr >= 5 && hr < 11 ? 'morning' : hr >= 11 && hr < 17 ? 'noon' : hr >= 17 && hr < 21 ? 'dusk' : 'night');
  fallTerm.textContent = '';
  await fallEl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 600, easing: 'ease-out' }).finished;
  fallEl.hidden = true; fallEl.className = 'fall';
  falling = false; tour.done = false; tour.held = false; tour.pos = 0; tour.resumeAt = performance.now() + 2500;
  say('Phew. Home again.', 3200);
}
$('#jumpBtn').addEventListener('click', quickJump);

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

  function loop(now) {
    if (!running) return;
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
