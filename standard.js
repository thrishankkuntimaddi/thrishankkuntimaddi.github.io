/* =========================================================
   The standard universe's live details (standard.css), and
   every Standard option set in the Studio (site/config →
   standard, see lib/site-config.js):
   - accent (the seal colour), heading font and tone;
   - which sections show;
   - the nav's status line, city and local clock;
   - the "Shift universe" button;
   - a soft light on each project plate that follows the pointer.
   Applied on load and again whenever the Studio publishes
   (lib/live.js → 'tk:site'), without a refresh.
   ========================================================= */
const root = document.documentElement;
export const FONTS = {
  instrument: { name: 'Instrument Serif', css: '"Instrument Serif", Georgia, serif', w: 400 },
  fraunces: { name: 'Fraunces', css: '"Fraunces", Georgia, serif', w: 400 },
  newsreader: { name: 'Newsreader', css: '"Newsreader", Georgia, serif', w: 400 },
  cormorant: { name: 'Cormorant Garamond', css: '"Cormorant Garamond", Georgia, serif', w: 500 },
  playfair: { name: 'Playfair Display', css: '"Playfair Display", Georgia, serif', w: 600 },
  grotesk: { name: 'Space Grotesk', css: '"Space Grotesk", system-ui, sans-serif', w: 500 },
  sora: { name: 'Sora', css: '"Sora", system-ui, sans-serif', w: 400 },
  bricolage: { name: 'Bricolage Grotesque', css: '"Bricolage Grotesque", system-ui, sans-serif', w: 700 },
};
const SECTIONS = ['portrait', 'facts', 'ticker', 'poelys', 'more', 'about', 'kind', 'resume', 'quick'];
let cfg = {};

const clock = document.getElementById('stdClock');
let fmt = null;
function tick() {
  if (!clock) return;
  const bits = [];
  if (cfg.city || fmt) bits.push(`${cfg.city || ''}${fmt ? ` ${fmt.format(new Date())}` : ''}`.trim());
  if (cfg.status) bits.push(cfg.status);
  clock.textContent = bits.join(' · ');
  clock.parentElement.hidden = !bits.length;
}
setInterval(tick, 20000);

function apply(site) {
  const s = (site && site.standard) || {};
  cfg = { status: 'Open to work', city: 'Bengaluru', tz: 'Asia/Kolkata', clock: true, ...s, show: { ...(s.show || {}) } };
  // look
  if (/^#[0-9a-f]{6}$/i.test(cfg.accent || '')) root.style.setProperty('--std-seal', cfg.accent); else root.style.removeProperty('--std-seal');
  const f = FONTS[cfg.font] || FONTS.instrument;
  if (cfg.font && cfg.font !== 'instrument') { root.style.setProperty('--std-display', f.css); root.style.setProperty('--std-display-w', String(f.w)); }
  else { root.style.removeProperty('--std-display'); root.style.removeProperty('--std-display-w'); }
  // tone, live (the first paint already used it, in index.html)
  if (!/[?&]tone=/.test(location.search)) {
    window.TK_STD_TONE = cfg.tone === 'light' || cfg.tone === 'dark' ? cfg.tone : 'auto';
    if (root.dataset.world === 'standard') {
      const h = new Date().getHours();
      root.toggleAttribute('data-dark', window.TK_STD_TONE === 'auto' ? h >= 18 || h < 6 : window.TK_STD_TONE === 'dark');
    }
  }
  // sections and buttons that are switched off
  const hide = SECTIONS.filter((k) => cfg.show[k] === false);
  if (cfg.clock === false) hide.push('clock');
  if (cfg.shift === false) hide.push('shift');
  if (hide.length) root.dataset.stdHide = hide.join(' '); else delete root.dataset.stdHide;
  // the nav line
  try { fmt = cfg.clock === false ? null : new Intl.DateTimeFormat('en-GB', { timeZone: cfg.tz || 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false }); }
  catch { fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false }); }
  tick();
}
if (window.TK_SITE) apply(window.TK_SITE);
addEventListener('tk:std', (e) => apply(e.detail));
addEventListener('tk:site', (e) => apply(e.detail));

// A draft preview from the Studio says so, and can be closed.
if (root.hasAttribute('data-preview')) {
  const bar = document.createElement('div');
  bar.className = 'std-preview';
  bar.innerHTML = '<span><b>Preview</b> · your unpublished draft from the Studio. Visitors don’t see this.</span><a href="./">Leave preview</a>';
  document.body.prepend(bar);
}

// The soft light that follows the pointer on project plates.
if (matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('.project').forEach((p) => {
    const win = p.querySelector('.window');
    if (!win) return;
    p.addEventListener('pointermove', (e) => {
      if (root.dataset.world !== 'standard') return;
      const r = win.getBoundingClientRect();
      win.style.setProperty('--mx', `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
      win.style.setProperty('--my', `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
    }, { passive: true });
  });
}
