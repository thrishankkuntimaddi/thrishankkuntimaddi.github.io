/* =========================================================
   A short signature tune for every project, in the sound of
   its universe. Generated in the browser and kept very quiet.
   Played as a project flashes past in the quick jump, and
   once when it scrolls into view.
   ========================================================= */
// world: the project's universe. w: wave. n: semitones from the root. s: seconds per note.
export const PROJECTS = {
  'Oruinwan':        { world: 'future', w: 'square',   root: 64, n: [0, 7, 12, 16, 12, 19], s: 0.1 },
  'SentinelFlight':  { world: 'space',  w: 'sine',     root: 57, n: [0, 7, 14, 19, 26], s: 0.16, echo: true },
  'Meditation':      { world: 'water',  w: 'sine',     root: 60, n: [12, 7, 4, 0], s: 0.3, echo: true },
  'Expense Tracker': { world: 'sky',    w: 'triangle', root: 62, n: [0, 4, 7, 9, 12], s: 0.12 },
  'ClearMyMind':     { world: 'joy',    w: 'triangle', root: 67, n: [12, 16, 19, 24, 19], s: 0.09 },
  'My Rovers':       { world: 'mars',   w: 'square',   root: 48, n: [0, 0, 3, 5, 7], s: 0.1 },
  'LearnViaNotes':   { world: 'sketch', w: 'triangle', root: 60, n: [0, 2, 4, 5, 7], s: 0.12 },
  'Poelys':          { world: 'paper',  w: 'sine',     root: 64, n: [0, 7, 12, 16], s: 0.14, echo: true },
  'Interstellar':    { world: 'ice',    w: 'sine',     root: 69, n: [7, 12, 19, 12, 24], s: 0.2, echo: true },
  'YorMenu':         { world: 'village', w: 'triangle', root: 62, n: [0, 4, 7, 4, 9, 7], s: 0.12 },
  'Parla':           { world: 'music',  w: 'sawtooth', root: 57, n: [0, 3, 7, 10, 12], s: 0.1 },
  'Ms. Minutes':     { world: 'robots', w: 'square',   root: 72, n: [0, 0, -5, 0, 3], s: 0.08 },
  'This website':    { world: 'core',   w: 'sine',     root: 60, n: [0, 7, 12, 19, 24], s: 0.12, echo: true },
};
let out = null;
export function playTune(actx, name, short = false) {
  const t = PROJECTS[name];
  if (!actx || !t || actx.state !== 'running') return;
  if (!out) { // one quiet bus with a soft echo
    out = actx.createGain(); out.gain.value = 0.05;
    const lp = actx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 6000;
    out.connect(lp).connect(actx.destination);
  }
  let echo = null;
  if (t.echo) { echo = actx.createDelay(1); echo.delayTime.value = 0.28; const fb = actx.createGain(); fb.gain.value = 0.3; echo.connect(fb).connect(echo); echo.connect(out); }
  const notes = short ? t.n.slice(0, 3) : t.n, s = short ? Math.min(t.s, 0.08) : t.s;
  notes.forEach((semi, i) => {
    const at = actx.currentTime + 0.02 + i * s, o = actx.createOscillator(), g = actx.createGain();
    o.type = t.w; o.frequency.value = 440 * 2 ** ((t.root + semi - 69) / 12);
    g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(0.9, at + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, at + s * 1.8);
    o.connect(g).connect(out); if (echo) g.connect(echo);
    o.start(at); o.stop(at + s * 2);
  });
}
// Which project a card or section is, from its heading.
export const projectName = (el) => {
  const h = el.querySelector('h3, .poelys-big');
  if (!h) return '';
  if (el.classList.contains('poelys-card') || h.classList.contains('poelys-big')) return 'Poelys';
  return Object.keys(PROJECTS).find((k) => h.textContent.trim().startsWith(k)) || '';
};
