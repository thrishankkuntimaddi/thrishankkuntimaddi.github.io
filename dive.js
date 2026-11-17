/* =========================================================
   The dive. After the quick jump, scrolling down the page a
   second time turns each main project into its own universe:
   its scene drawn behind it, and the project floating in 3D.
   It flies in from deep space as it comes into view, settles
   in front of you, then dives past as you scroll on.
   ========================================================= */
import { PROJECTS, projectName } from './tunes.js?v=20';
import { NAMES, isLoopWorld } from './worlds.js?v=20';

let started = false;
export async function startDive({ calm, say }) {
  if (started || calm()) return;
  started = true;
  let U = null;
  try { U = (await import('./infinity.js?v=20')).U; } catch { /* no scenes, still 3D */ }
  const root = document.documentElement;
  root.classList.add('diving');
  const items = [...document.querySelectorAll('#work .project')].map((art, i) => {
    const name = projectName(art), world = PROJECTS[name]?.world || 'paper', loop = isLoopWorld(world);
    art.dataset.world = world;
    art.toggleAttribute('data-dark', loop); art.toggleAttribute('data-loop', loop);
    art.classList.toggle('sketch', world === 'sketch');
    art.classList.add('dive-proj');
    const tag = document.createElement('p'); tag.className = 'dive-tag'; tag.textContent = `Universe · ${NAMES[world] || world}`;
    art.prepend(tag);
    let cv = null, g = null, S = {};
    if (loop && U?.[world]) { cv = document.createElement('canvas'); cv.className = 'dive-bg'; cv.setAttribute('aria-hidden', 'true'); art.prepend(cv); g = cv.getContext('2d'); }
    return { art, world, cv, g, S, win: art.querySelector('.window'), card: art.querySelector('.project-card'), dir: art.classList.contains('flip') ? -1 : 1, seen: false, i };
  });
  const sizeAll = () => items.forEach((it) => { if (it.cv) { const r = it.art.getBoundingClientRect(); it.cv.width = Math.max(1, r.width); it.cv.height = Math.max(1, r.height); it.S = {}; } });
  sizeAll(); addEventListener('resize', sizeAll, { passive: true });
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  let last = 0, said = false;
  function frame(now) {
    requestAnimationFrame(frame);
    if (document.hidden) return;
    const t = now / 1000, H = innerHeight;
    for (const it of items) {
      const r = it.art.getBoundingClientRect();
      if (r.bottom < -200 || r.top > H + 200) continue;
      // k: 1 below the screen (far away), 0 in the middle (in front of you), -1 above (dived past)
      const k = clamp((r.top + r.height / 2 - H / 2) / H, -1.1, 1.1);
      const far = Math.max(0, k), past = Math.max(0, -k), d = it.dir;
      if (it.win) {
        const z = -far * 1100 + past * 520, ry = d * (far * 48 - past * 30) + Math.sin(t * 0.8 + it.i) * 3 * (1 - far);
        it.win.style.transform = `translate3d(${(d * far * 90).toFixed(1)}px, ${(far * 60 - past * 40).toFixed(1)}px, ${z.toFixed(0)}px) rotateY(${ry.toFixed(1)}deg) rotateX(${(-far * 22 + Math.sin(t * 0.6 + it.i) * 2).toFixed(1)}deg)`;
        it.win.style.opacity = String(clamp(1.25 - far * 0.9 - past * 1.3, 0, 1).toFixed(2));
      }
      if (it.card) {
        const open = clamp(1 - far * 1.6, 0, 1); // the card opens up once the project is close
        it.card.style.transform = `translate3d(${(-d * (1 - open) * 240).toFixed(1)}px, ${(past * -30).toFixed(1)}px, ${(past * 300 - (1 - open) * 400).toFixed(0)}px) rotateY(${(-d * (1 - open) * 65).toFixed(1)}deg)`;
        it.card.style.opacity = String(clamp(open * 1.1 - past * 1.2, 0, 1).toFixed(2));
      }
      if (!it.seen && Math.abs(k) < 0.25) { it.seen = true; if (!said) { said = true; say?.('Dive in. Each one is its own universe.', 3600); } }
      if (it.cv && now - last > 33) {
        it.g.setTransform(1, 0, 0, 1, 0, 0);
        try { U[it.world].draw(it.g, it.cv.width, it.cv.height, t, it.S, Math.max(0, far * 3), [], 0.4); } catch { /* keep going */ }
      }
    }
    if (now - last > 33) last = now;
  }
  requestAnimationFrame(frame);
}
