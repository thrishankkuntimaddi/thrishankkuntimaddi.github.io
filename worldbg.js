/* =========================================================
   The scene behind the page in the 22 loop universes: the
   same drawing as in the endless loop, drawn softly at 30 fps
   on one fixed canvas. Only loaded when such a universe shows.
   ========================================================= */
import { isLoopWorld } from './worlds.js?v=20';

let U = null, cv = null, g = null, raf = 0, cur = '', S = {}, t0 = 0, last = 0, dpr = 1, W = 0, H = 0, still = false;
const resize = () => { if (!cv) return; dpr = Math.min(devicePixelRatio || 1, 1.25); W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; S = {}; if (still) once(); };
function draw(now) {
  if (!U || !U[cur]) return;
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  try { U[cur].draw(g, W, H, (now - t0) / 1000, S, 0, [], 0.5); } catch { /* a scene never breaks the page */ }
}
function loop(now) {
  raf = requestAnimationFrame(loop);
  if (document.hidden || now - last < 33) return; // about 30 fps is plenty for a background
  last = now; draw(now);
}
function once() { cancelAnimationFrame(raf); draw(performance.now() + 4000); }
export async function setWorldBg(id, calm = false) {
  cur = id; still = calm;
  if (!isLoopWorld(id)) { cancelAnimationFrame(raf); if (cv) cv.hidden = true; return; }
  if (!U) { try { U = (await import('./infinity.js?v=20')).U; } catch { return; } }
  if (cur !== id) return; // the universe changed while loading
  if (!cv) {
    cv = document.createElement('canvas'); cv.className = 'world-bg'; cv.setAttribute('aria-hidden', 'true');
    document.body.prepend(cv); g = cv.getContext('2d');
    addEventListener('resize', resize, { passive: true });
    resize();
  }
  cv.hidden = false; S = {}; t0 = performance.now();
  cancelAnimationFrame(raf);
  if (still) once(); else raf = requestAnimationFrame(loop);
}
