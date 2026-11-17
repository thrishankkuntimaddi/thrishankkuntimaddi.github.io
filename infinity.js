/* =========================================================
   The endless loop. Opens after the quick jump, when the
   visitor reaches the very bottom again. A dark, cinematic
   fall through universes that never ends: deep space, the
   future, robots, emotions, fire, ice, noir, toys and more.
   The Core (glowing particles, golden light, glass panels of
   every universe passed) comes round every few universes.
   Pip travels along and feels everything. Pieces of the
   portfolio surface on the way. Quiet generated music.
   Loaded only when needed; drawn on one 2D canvas.
   ========================================================= */
import { STORIES, EMAIL } from './content.js?v=19';
import { PIP_WEAR } from './chapter.js?v=19';

const TAU = Math.PI * 2;
const rnd = (a = 1, b) => (b === undefined ? Math.random() * a : a + Math.random() * (b - a));
const pick = (arr) => arr[(Math.random() * arr.length) | 0];
const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const SCENE = 11; // depth units per universe (about 11 s at cruising speed)
const CORE_EVERY = 7; // the Core comes round every this many universes

/* ---------------------------------------------------------
   Drawing helpers
   --------------------------------------------------------- */
function vgrad(g, W, H, stops) { const gr = g.createLinearGradient(0, 0, 0, H); stops.forEach(([o, c]) => gr.addColorStop(o, c)); g.fillStyle = gr; g.fillRect(0, 0, W, H); }
function glow(g, x, y, r, c, a = 1) { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, c); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.globalAlpha = a; g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); g.globalAlpha = 1; }
function floorGrid(g, W, H, hy, col, t, speed, a = 0.5) { // a perspective grid running towards the viewer
  g.save(); g.strokeStyle = col; g.globalAlpha = a; g.lineWidth = 1;
  const cx = W / 2;
  for (let i = -18; i <= 18; i++) { g.beginPath(); g.moveTo(cx + i * 14, hy); g.lineTo(cx + i * W * 0.16, H); g.stroke(); }
  const off = (t * speed * 0.6) % 1;
  for (let k = 0; k < 16; k++) { const z = (k + 1 - off) / 16, y = hy + (H - hy) * z * z; g.globalAlpha = a * z; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  g.restore();
}
function skyline(g, S, key, W, H, base, col, speed, t, win) { // a scrolling row of buildings, made once per scene
  if (!S[key]) { S[key] = []; let x = 0; while (x < W * 2 + 200) { const w = rnd(40, 110), h = rnd(H * 0.12, H * 0.42); S[key].push({ x, w, h, lit: Array.from({ length: 40 }, () => Math.random() < 0.35) }); x += w + rnd(2, 10); } }
  const span = S[key].at(-1).x + S[key].at(-1).w, off = (t * speed) % span;
  g.fillStyle = col;
  for (const b of S[key]) {
    let x = b.x - off; if (x + b.w < 0) x += span; if (x > W) continue;
    g.fillRect(x, base - b.h, b.w, b.h);
    if (win) { let n = 0; for (let yy = base - b.h + 10; yy < base - 8; yy += 14) for (let xx = x + 6; xx < x + b.w - 8; xx += 12) { if (b.lit[n++ % 40]) { g.fillStyle = win[(n * 7) % win.length]; g.fillRect(xx, yy, 5, 7); } } g.fillStyle = col; }
  }
}
const parts = (n, f) => Array.from({ length: n }, (_, i) => f(i));

/* ---------------------------------------------------------
   The universes. Each: name, tagline, Pip's emotion, music,
   a few lines for the story, and how to draw itself.
   draw(g, W, H, t, S, v) — S is this visit's state, v the speed.
   --------------------------------------------------------- */
const U = {
  core: {
    name: 'The Core', tag: 'The inside of this site. Every universe you passed is kept here.', emo: 'calm', music: 'core', font: 'display',
    lines: ['Welcome to the inside.', 'Every universe you passed is stored on these panels.', 'The loop resets. The year doesn’t.', 'Somewhere in here is the code for all of it.'],
    draw(g, W, H, t, S, v, visited) {
      const cx = W / 2, cy = H * 0.46;
      const bg = g.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.75); bg.addColorStop(0, '#0d2a30'); bg.addColorStop(0.5, '#05141a'); bg.addColorStop(1, '#010305');
      g.fillStyle = bg; g.fillRect(0, 0, W, H);
      floorGrid(g, W, H, H * 0.62, '#4fd1c5', t, v, 0.35);
      if (!S.pts) { // a network of points on a sphere, and which ones are linked
        const n = W < 600 ? 110 : 170, R = 1;
        S.pts = parts(n, (i) => { const y = 1 - (i / (n - 1)) * 2, r = Math.sqrt(1 - y * y), th = i * 2.399963; return [Math.cos(th) * r * R * rnd(0.85, 1.1), y * R * rnd(0.9, 1.1), Math.sin(th) * r * R * rnd(0.85, 1.1)]; });
        S.links = []; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) { const a = S.pts[i], b = S.pts[j]; if (Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) < 0.36) S.links.push([i, j]); }
        S.dust = parts(140, () => [rnd(W), rnd(H), rnd(0.2, 1)]);
        S.panels = parts(12, (i) => ({ x: rnd(-1.6, 1.6) || 0.5, y: rnd(-0.7, 0.5), z: rnd(0.4, 3), i }));
      }
      // glass panels drifting past, each showing a universe already visited
      const list = visited.length ? visited : ['Paper', 'Pixel', 'Sketch', 'Blueprint', 'Newsprint'];
      g.font = '10px "Space Mono", monospace'; g.textAlign = 'left';
      for (const p of S.panels.sort((a, b) => b.z - a.z)) {
        p.z -= 0.0025 * (1 + v * 2); if (p.z < 0.25) { p.z = 3; p.x = (Math.random() < 0.5 ? -1 : 1) * rnd(0.6, 1.7); p.y = rnd(-0.7, 0.5); }
        if (Math.abs(p.x) < 0.45) p.x = Math.sign(p.x || 1) * 0.5;
        const s = 1 / p.z, x = cx + p.x * W * 0.42 * s, y = cy + p.y * H * 0.5 * s, w = 120 * s, h = 80 * s, a = Math.min(1, (3 - p.z) * 0.6) * Math.min(1, p.z * 2);
        g.globalAlpha = 0.5 * a; g.fillStyle = 'rgba(120,220,230,.08)'; g.fillRect(x - w / 2, y - h / 2, w, h);
        g.strokeStyle = 'rgba(150,235,245,.55)'; g.lineWidth = 1; g.strokeRect(x - w / 2, y - h / 2, w, h);
        g.globalAlpha = 0.25 * a; for (let k = 1; k < 4; k++) { g.beginPath(); g.moveTo(x - w / 2 + 8 * s, y - h / 2 + k * h / 4); g.lineTo(x + w / 2 - (12 + k * 9) * s, y - h / 2 + k * h / 4); g.stroke(); }
        if (s > 0.6) { g.globalAlpha = 0.8 * a; g.fillStyle = '#bff6ff'; g.fillText(list[p.i % list.length].toUpperCase(), x - w / 2 + 8 * s, y - h / 2 + 14 * s); }
      }
      g.globalAlpha = 1;
      // the golden core and its network
      const R = Math.min(W, H) * 0.22, rot = t * 0.18, cr = Math.cos(rot), sr = Math.sin(rot);
      const P = S.pts.map(([x, y, z]) => { const X = x * cr - z * sr, Z = x * sr + z * cr, k = 2.4 / (2.4 + Z); return [cx + X * R * k, cy + y * R * k, Z]; });
      glow(g, cx, cy, R * 1.9, 'rgba(255,190,90,.38)', 0.8 + Math.sin(t * 1.6) * 0.15);
      g.lineWidth = 0.7;
      for (const [i, j] of S.links) { const a = P[i], b = P[j], d = (a[2] + b[2]) / 2; g.strokeStyle = `rgba(${d < 0 ? '255,214,140' : '120,220,230'},${(0.35 - d * 0.15).toFixed(2)})`; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
      for (const p of P) { g.fillStyle = p[2] < 0 ? '#ffe2a8' : '#9fe9f0'; g.globalAlpha = 0.9 - p[2] * 0.3; g.fillRect(p[0] - 1.2, p[1] - 1.2, 2.4, 2.4); }
      g.globalAlpha = 1;
      glow(g, cx, cy, R * 0.55, 'rgba(255,230,170,.95)');
      g.globalCompositeOperation = 'lighter';
      for (const d of S.dust) { d[1] -= d[2] * 0.25; d[0] += Math.sin(t + d[2] * 9) * 0.15; if (d[1] < 0) { d[1] = H; d[0] = rnd(W); } g.fillStyle = `rgba(255,200,120,${(0.25 + d[2] * 0.4).toFixed(2)})`; g.fillRect(d[0], d[1], 1.6, 1.6); }
      g.globalCompositeOperation = 'source-over';
    },
  },
  space: {
    name: 'Deep space', tag: 'Light speed. No seatbelts.', emo: 'wow', music: 'space',
    lines: ['Jump to light speed in 3… 2…', 'A nebula the size of a thousand suns.', 'Engines at 400%. Pip is driving.', 'A comet overtakes us. Rude.'],
    draw(g, W, H, t, S, v) {
      g.fillStyle = '#02030a'; g.fillRect(0, 0, W, H);
      g.globalCompositeOperation = 'lighter';
      glow(g, W * (0.3 + Math.sin(t * 0.05) * 0.1), H * 0.35, W * 0.45, 'rgba(120,60,200,.35)');
      glow(g, W * 0.75, H * 0.65, W * 0.4, 'rgba(30,150,170,.3)');
      glow(g, W * 0.55, H * 0.2, W * 0.3, 'rgba(220,60,140,.22)');
      g.globalCompositeOperation = 'source-over';
      if (!S.st) S.st = parts(W < 600 ? 260 : 420, () => [rnd(-1, 1), rnd(-1, 1), rnd(0.05, 1)]);
      const cx = W / 2, cy = H / 2, sp = 0.004 + v * 0.006;
      g.lineCap = 'round';
      for (const s of S.st) {
        const pz = s[2]; s[2] -= sp; if (s[2] < 0.02) { s[0] = rnd(-1, 1); s[1] = rnd(-1, 1); s[2] = 1; continue; }
        const x = cx + (s[0] / s[2]) * W * 0.5, y = cy + (s[1] / s[2]) * H * 0.5, px = cx + (s[0] / pz) * W * 0.5, py = cy + (s[1] / pz) * H * 0.5;
        g.strokeStyle = `rgba(230,240,255,${Math.min(1, 1.2 - s[2]).toFixed(2)})`; g.lineWidth = Math.max(0.6, 2.2 - s[2] * 2);
        g.beginPath(); g.moveTo(px, py); g.lineTo(x, y); g.stroke();
      }
      const px = W * (1.1 - ((t * 0.02) % 1.6)), py = H * 0.7, pr = Math.min(W, H) * 0.16; // a planet drifting by
      const pg = g.createRadialGradient(px - pr * 0.4, py - pr * 0.4, pr * 0.1, px, py, pr); pg.addColorStop(0, '#ffb38a'); pg.addColorStop(1, '#5a1f4a');
      g.fillStyle = pg; g.beginPath(); g.arc(px, py, pr, 0, TAU); g.fill();
      g.strokeStyle = 'rgba(255,220,180,.5)'; g.lineWidth = 3; g.beginPath(); g.ellipse(px, py, pr * 1.7, pr * 0.35, -0.3, 0, TAU); g.stroke();
    },
  },
  future: {
    name: 'Year 3000', tag: 'Neon streets, flying cars, still no fax machines.', emo: 'cool', music: 'synth',
    lines: ['Flying cars. Finally.', 'Everything here runs on React 300.', 'A billboard says “Thrishank shipped this in 2026”.'],
    draw(g, W, H, t, S, v) {
      vgrad(g, W, H, [[0, '#0d0221'], [0.55, '#2a0845'], [0.62, '#120020'], [1, '#05000c']]);
      glow(g, W / 2, H * 0.58, W * 0.5, 'rgba(255,60,180,.25)');
      skyline(g, S, 'b1', W, H, H * 0.6, '#1a0633', 10 + v * 10, t, ['#3df5ff', '#ff3dd8', '#fff36b']);
      skyline(g, S, 'b2', W, H, H * 0.62, '#0b0019', 25 + v * 20, t, ['#ff3dd8', '#3df5ff']);
      floorGrid(g, W, H, H * 0.62, '#ff3dd8', t, 1 + v, 0.55);
      if (!S.cars) S.cars = parts(14, () => ({ y: rnd(H * 0.08, H * 0.5), x: rnd(W), s: rnd(60, 220) * (Math.random() < 0.5 ? -1 : 1), c: pick(['#3df5ff', '#ff3dd8', '#fff36b']) }));
      for (const c of S.cars) { c.x += c.s * 0.016 * (1 + v); if (c.x > W + 60) c.x = -60; if (c.x < -60) c.x = W + 60; g.strokeStyle = c.c; g.lineWidth = 2; g.globalAlpha = 0.8; g.beginPath(); g.moveTo(c.x, c.y); g.lineTo(c.x - Math.sign(c.s) * 36, c.y); g.stroke(); glow(g, c.x, c.y, 10, c.c, 0.6); }
      g.globalAlpha = 1;
    },
  },
  robots: {
    name: 'The robot republic', tag: 'Built by AI, run by AI, debugged by Pip.', emo: 'scared', music: 'robots',
    lines: ['The robots vote. Pip wins.', 'A robot blinks in binary: “hire Thrishank”.', 'Firmware update in progress. Do not unplug the universe.', 'They want Pip as their mascot. Pip negotiates.'],
    draw(g, W, H, t, S, v) {
      g.fillStyle = '#06090d'; g.fillRect(0, 0, W, H);
      if (!S.tr) { S.tr = parts(22, () => { let x = rnd(W), y = rnd(H); const pts = [[x, y]]; for (let k = 0; k < 6; k++) { if (k % 2) x += rnd(-160, 160); else y += rnd(-120, 120); pts.push([x, y]); } return { pts, o: rnd(1) }; }); S.bits = parts(36, () => [rnd(W), rnd(H), rnd(40, 120)]); }
      g.lineWidth = 1.2;
      for (const tr of S.tr) {
        g.strokeStyle = 'rgba(60,200,200,.18)'; g.beginPath(); tr.pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
        const k = ((t * 0.25 * (1 + v) + tr.o) % 1) * (tr.pts.length - 1), i = Math.floor(k), f = k - i, a = tr.pts[i], b = tr.pts[i + 1];
        if (b) glow(g, a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, 14, 'rgba(90,255,230,.9)');
      }
      g.font = '14px "VT323", monospace';
      for (const b of S.bits) { b[1] += b[2] * 0.016 * (1 + v); if (b[1] > H) { b[1] = -10; b[0] = rnd(W); } g.fillStyle = 'rgba(80,255,170,.35)'; g.fillText(Math.random() < 0.5 ? '1' : '0', b[0], b[1]); }
      const n = W < 600 ? 3 : 5, gap = W / (n + 1), off = Math.sin(t * 0.3) * 20;
      for (let i = 1; i <= n; i++) { // a row of robot heads, blinking
        const x = i * gap + off, y = H * 0.7, s = 46 + (i % 2) * 10;
        g.fillStyle = '#1b2430'; g.strokeStyle = '#4fd1c5'; g.lineWidth = 2;
        g.beginPath(); g.roundRect(x - s, y - s * 0.8, s * 2, s * 1.6, 12); g.fill(); g.stroke();
        g.beginPath(); g.moveTo(x, y - s * 0.8); g.lineTo(x, y - s * 1.2); g.stroke(); glow(g, x, y - s * 1.25, 10, (t * 2 + i) % 2 < 1 ? 'rgba(255,80,80,1)' : 'rgba(255,80,80,.2)');
        const blink = (t * 0.7 + i * 0.37) % 3 < 0.12;
        g.fillStyle = '#7ff6ff'; for (const ex of [-0.42, 0.42]) { g.beginPath(); g.ellipse(x + ex * s, y - s * 0.1, s * 0.18, blink ? 2 : s * 0.18, 0, 0, TAU); g.fill(); }
        g.fillStyle = 'rgba(127,246,255,.5)'; g.fillRect(x - s * 0.4, y + s * 0.35, s * 0.8, 4);
      }
    },
  },
  rage: {
    name: 'Rage', tag: 'Everything is on fire, and so is Pip.', emo: 'rage', music: 'rage',
    lines: ['Someone deployed on a Friday.', 'Pip is FURIOUS. Nobody knows why.', 'Merge conflict detected in reality.', 'The build failed. Pip did not take it well.'],
    draw(g, W, H, t, S, v) {
      const sh = 6 + v * 4; g.save(); g.translate(rnd(-sh, sh), rnd(-sh, sh));
      const bg = g.createRadialGradient(W / 2, H * 0.6, 0, W / 2, H * 0.6, Math.max(W, H)); bg.addColorStop(0, '#4a0000'); bg.addColorStop(1, '#0a0000'); g.fillStyle = bg; g.fillRect(-20, -20, W + 40, H + 40);
      if (!S.e) S.e = parts(160, () => [rnd(W), rnd(H), rnd(0.5, 2.5)]);
      g.globalCompositeOperation = 'lighter';
      for (const e of S.e) { e[1] -= e[2] * (1.5 + v); e[0] += rnd(-1, 1); if (e[1] < -5) { e[1] = H + 5; e[0] = rnd(W); } g.fillStyle = `rgba(255,${(80 + e[2] * 40) | 0},30,.8)`; g.fillRect(e[0], e[1], e[2] * 1.6, e[2] * 1.6); }
      g.globalCompositeOperation = 'source-over';
      if (Math.random() < 0.04 + v * 0.02) S.bolt = { x: rnd(W), life: 1 };
      if (S.bolt && S.bolt.life > 0) { g.strokeStyle = `rgba(255,220,220,${S.bolt.life})`; g.lineWidth = 3; g.beginPath(); let x = S.bolt.x, y = 0; g.moveTo(x, y); while (y < H * 0.7) { x += rnd(-40, 40); y += rnd(20, 50); g.lineTo(x, y); } g.stroke(); g.fillStyle = `rgba(255,60,60,${S.bolt.life * 0.18})`; g.fillRect(-20, -20, W + 40, H + 40); S.bolt.life -= 0.08; }
      g.restore();
    },
  },
  joy: {
    name: 'Pure joy', tag: 'Laughing so hard the pixels shake.', emo: 'laugh', music: 'joy',
    lines: ['Pip told a joke. The universe laughed.', 'Confetti everywhere. Nobody ordered it.', 'All tests passed on the first try!', 'Someone said “ship it”. Everyone cheered.'],
    draw(g, W, H, t, S, v) {
      vgrad(g, W, H, [[0, '#1d0b36'], [1, '#3a1060']]);
      if (!S.c) { S.c = parts(150, () => ({ x: rnd(W), y: rnd(-H, H), s: rnd(40, 110), r: rnd(TAU), vr: rnd(-4, 4), c: pick(['#ff5fa2', '#ffd166', '#4fd1b0', '#6bb6ff', '#a78bfa', '#ff8a65']) })); S.b = parts(9, () => ({ x: rnd(W), y: rnd(H, H * 2), s: rnd(30, 60), c: pick(['#ff5fa2', '#ffd166', '#6bb6ff', '#4fd1b0']) })); }
      for (const b of S.b) { b.y -= 0.9 * (1 + v); if (b.y < -100) { b.y = H + 80; b.x = rnd(W); } const x = b.x + Math.sin(t + b.s) * 20; g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, b.y + b.s * 0.6); g.quadraticCurveTo(x + 10, b.y + b.s * 1.4, x, b.y + b.s * 2.2); g.stroke(); g.fillStyle = b.c; g.beginPath(); g.ellipse(x, b.y, b.s * 0.45, b.s * 0.58, 0, 0, TAU); g.fill(); g.fillStyle = 'rgba(255,255,255,.4)'; g.beginPath(); g.ellipse(x - b.s * 0.15, b.y - b.s * 0.2, b.s * 0.08, b.s * 0.14, 0, 0, TAU); g.fill(); }
      for (const c of S.c) { c.y += c.s * 0.016 * (1 + v * 0.6); c.r += c.vr * 0.016; if (c.y > H + 10) { c.y = -10; c.x = rnd(W); } g.save(); g.translate(c.x + Math.sin(t * 2 + c.s) * 8, c.y); g.rotate(c.r); g.fillStyle = c.c; g.fillRect(-5, -3, 10, 6); g.restore(); }
      g.font = '700 28px "Fraunces", serif'; g.textAlign = 'center';
      for (let i = 0; i < 5; i++) { const x = W * (0.15 + i * 0.17), y = H * 0.25 + Math.sin(t * 3 + i) * 14; g.fillStyle = `rgba(255,255,255,${(0.15 + 0.1 * Math.sin(t * 4 + i)).toFixed(2)})`; g.fillText('HA', x, y); }
    },
  },
  sad: {
    name: 'The rain', tag: 'A quiet universe for a quiet cry.', emo: 'cry', music: 'sad',
    lines: ['Pip lost a sticker. It was the good one.', 'Rain on every street, forever.', 'It’s okay. The next universe is better.', 'Even the clouds needed a moment.'],
    draw(g, W, H, t, S, v) {
      vgrad(g, W, H, [[0, '#0b1220'], [1, '#1b2a42']]);
      const lx = W * 0.72; g.fillStyle = '#05080f'; g.fillRect(lx - 3, H * 0.3, 6, H * 0.7); g.fillRect(lx - 3, H * 0.3, -40, 5);
      const cone = g.createLinearGradient(0, H * 0.3, 0, H); cone.addColorStop(0, 'rgba(255,220,150,.35)'); cone.addColorStop(1, 'rgba(255,220,150,0)');
      g.fillStyle = cone; g.beginPath(); g.moveTo(lx - 40, H * 0.31); g.lineTo(lx - 160, H); g.lineTo(lx + 80, H); g.closePath(); g.fill();
      glow(g, lx - 40, H * 0.31, 30, 'rgba(255,230,170,.9)');
      if (!S.r) { S.r = parts(W < 600 ? 160 : 320, () => [rnd(W), rnd(H), rnd(8, 18)]); S.rip = []; }
      g.strokeStyle = 'rgba(170,200,255,.35)'; g.lineWidth = 1;
      for (const r of S.r) { r[1] += r[2] * (1 + v * 0.5); r[0] -= r[2] * 0.15; if (r[1] > H) { if (Math.random() < 0.06) S.rip.push([r[0], H - rnd(4, 40), 0]); r[1] = -20; r[0] = rnd(W + 60); } g.beginPath(); g.moveTo(r[0], r[1]); g.lineTo(r[0] - r[2] * 0.15, r[1] + r[2]); g.stroke(); }
      S.rip = S.rip.filter((p) => (p[2] += 0.6) < 30);
      for (const p of S.rip) { g.strokeStyle = `rgba(170,200,255,${(0.4 - p[2] / 80).toFixed(2)})`; g.beginPath(); g.ellipse(p[0], p[1], p[2], p[2] * 0.25, 0, 0, TAU); g.stroke(); }
    },
  },
  retro: {
    name: 'Retro 1986', tag: 'Synths, sunsets and chrome.', emo: 'cool', music: 'retro', font: 'pixel',
    lines: ['Insert coin to continue the universe.', 'High score: Pip. Again.', 'The sun has stripes here. Nobody asks why.'],
    draw(g, W, H, t, S, v) {
      const hy = H * 0.58;
      vgrad(g, W, hy, [[0, '#12002b'], [0.6, '#5a0a5e'], [1, '#ff3d81']]);
      const sr = Math.min(W, H) * 0.2, sx = W / 2, sy = hy - sr * 0.35;
      const sg = g.createLinearGradient(0, sy - sr, 0, sy + sr); sg.addColorStop(0, '#ffe66b'); sg.addColorStop(1, '#ff3d81');
      g.fillStyle = sg; g.beginPath(); g.arc(sx, sy, sr, 0, TAU); g.fill();
      g.fillStyle = '#5a0a5e'; for (let k = 0; k < 7; k++) { const y = sy + sr * (0.1 + k * 0.14), hgt = 2 + k * 1.6; g.fillRect(sx - sr, y, sr * 2, hgt); }
      g.fillStyle = '#1a0333'; g.beginPath(); g.moveTo(0, hy); for (let x = 0; x <= W; x += W / 12) g.lineTo(x, hy - (Math.sin(x * 0.013) * 0.5 + 0.5) * H * 0.12 - ((x * 7) % 31)); g.lineTo(W, hy); g.fill();
      g.fillStyle = '#0a0014'; g.fillRect(0, hy, W, H - hy);
      floorGrid(g, W, H, hy, '#3df5ff', t, 1.4 + v, 0.7);
    },
  },
  music: {
    name: 'The beat', tag: 'A universe made of sound.', emo: 'love', music: 'beat',
    lines: ['The bass drops. So does Pip.', 'Every star here is a note.', 'Pip found the volume knob. It goes to 11.'],
    draw(g, W, H, t, S, v, _vis, beat) {
      g.fillStyle = '#08070f'; g.fillRect(0, 0, W, H);
      const pulse = Math.max(0, 1 - beat * 3);
      for (let k = 0; k < 4; k++) { g.strokeStyle = `rgba(167,139,250,${(0.25 - k * 0.05 + pulse * 0.2).toFixed(2)})`; g.lineWidth = 2; g.beginPath(); g.arc(W / 2, H * 0.45, 60 + k * 70 + pulse * 30, 0, TAU); g.stroke(); }
      const n = W < 600 ? 20 : 36, bw = W / n;
      for (let i = 0; i < n; i++) { const h = (0.15 + 0.55 * Math.abs(Math.sin(t * (1.5 + i * 0.07) + i)) * (0.6 + pulse * 0.6)) * H * 0.4; const hue = 260 + i * 4; g.fillStyle = `hsl(${hue} 90% 65%)`; g.fillRect(i * bw + 2, H - h, bw - 4, h); }
      if (!S.n) S.n = parts(18, () => ({ x: rnd(W), y: rnd(H), s: rnd(18, 34), c: pick(['#ff5fa2', '#ffd166', '#7fe0c3', '#a78bfa']) }));
      for (const nt of S.n) { nt.y -= 0.7 * (1 + v); if (nt.y < -30) { nt.y = H + 30; nt.x = rnd(W); } g.fillStyle = nt.c; g.font = `${nt.s}px serif`; g.fillText(nt.s > 26 ? '♫' : '♪', nt.x + Math.sin(t + nt.s) * 10, nt.y); }
    },
  },
  paint: {
    name: 'Paint', tag: 'Someone threw every colour at the sky.', emo: 'happy', music: 'joy',
    lines: ['Pip paints a self-portrait. It’s mostly circles.', 'Wet paint. Pip touched it anyway.', 'This universe was a happy accident.'],
    draw(g, W, H, t, S) {
      g.fillStyle = '#141014'; g.fillRect(0, 0, W, H);
      if (!S.s) { S.s = []; S.next = 0; }
      if (t > S.next) { S.next = t + 0.45; S.s.push({ p: [rnd(-50, W + 50), rnd(H), rnd(W), rnd(H), rnd(W), rnd(H), rnd(-50, W + 50), rnd(H)], w: rnd(14, 46), c: pick(['#ff5fa2', '#ffd166', '#4fd1b0', '#6bb6ff', '#ff8a65', '#a78bfa', '#f2f2f2']), b: t }); if (S.s.length > 22) S.s.shift(); }
      g.lineCap = 'round';
      for (const s of S.s) {
        const k = Math.min(1, (t - s.b) / 1.1), [x0, y0, x1, y1, x2, y2, x3, y3] = s.p;
        g.strokeStyle = s.c; g.globalAlpha = 0.85; g.lineWidth = s.w; g.beginPath(); g.moveTo(x0, y0);
        for (let i = 1; i <= 24 * k; i++) { const u = i / 24, a = (1 - u) ** 3, b = 3 * (1 - u) ** 2 * u, c = 3 * (1 - u) * u * u, d = u ** 3; g.lineTo(a * x0 + b * x1 + c * x2 + d * x3, a * y0 + b * y1 + c * y2 + d * y3); }
        g.stroke();
        if (k === 1 && !s.sp) s.sp = parts(10, () => [x3 + rnd(-50, 50), y3 + rnd(-50, 50), rnd(2, 7)]);
        if (s.sp) { g.fillStyle = s.c; for (const [x, y, r] of s.sp) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); } }
      }
      g.globalAlpha = 1;
    },
  },
  box: {
    name: 'Box world', tag: 'Everything is a cube. Even feelings.', emo: 'wow', music: 'robots',
    lines: ['Pip tries to be a cube. Fails, adorably.', 'The floor is breathing. In cubes.', 'Think outside the box. There is no outside.'],
    draw(g, W, H, t, S, v) {
      vgrad(g, W, H, [[0, '#0b0d16'], [1, '#161a2b']]);
      const n = 8, s = Math.min(W, H) / 16, ox = W / 2, oy = H * 0.3;
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
        const h = (Math.sin(t * 1.2 * (1 + v * 0.3) + i * 0.7 + j * 0.5) * 0.5 + 0.5) * s * 2.4 + 8;
        const x = ox + (i - j) * s, y = oy + (i + j) * s * 0.5, hue = 200 + (i + j) * 10;
        g.fillStyle = `hsl(${hue} 70% 62%)`; g.beginPath(); g.moveTo(x, y - h); g.lineTo(x + s, y - h + s * 0.5); g.lineTo(x, y - h + s); g.lineTo(x - s, y - h + s * 0.5); g.closePath(); g.fill();
        g.fillStyle = `hsl(${hue} 55% 40%)`; g.beginPath(); g.moveTo(x - s, y - h + s * 0.5); g.lineTo(x, y - h + s); g.lineTo(x, y + s); g.lineTo(x - s, y + s * 0.5); g.closePath(); g.fill();
        g.fillStyle = `hsl(${hue} 50% 28%)`; g.beginPath(); g.moveTo(x + s, y - h + s * 0.5); g.lineTo(x, y - h + s); g.lineTo(x, y + s); g.lineTo(x + s, y + s * 0.5); g.closePath(); g.fill();
      }
    },
  },
  village: {
    name: 'The village', tag: 'Lanterns, fireflies and a slow windmill.', emo: 'love', music: 'village',
    lines: ['The village elders have heard of Pip.', 'Someone is baking. The whole universe smells of it.', 'A cow looks at Pip. Pip looks at the cow.'],
    draw(g, W, H, t, S) {
      vgrad(g, W, H, [[0, '#0b1026'], [1, '#22335c']]);
      if (!S.st) { S.st = parts(90, () => [rnd(W), rnd(H * 0.5), rnd(1)]); S.ff = parts(30, () => [rnd(W), rnd(H * 0.6, H), rnd(TAU)]); }
      for (const s of S.st) { g.fillStyle = `rgba(255,255,230,${(0.3 + 0.5 * Math.abs(Math.sin(t + s[2] * 9))).toFixed(2)})`; g.fillRect(s[0], s[1], 1.5, 1.5); }
      glow(g, W * 0.18, H * 0.2, 90, 'rgba(255,250,220,.35)'); g.fillStyle = '#fff6d8'; g.beginPath(); g.arc(W * 0.18, H * 0.2, 28, 0, TAU); g.fill();
      const hill = (base, amp, f, ph, col) => { g.fillStyle = col; g.beginPath(); g.moveTo(0, H); for (let x = 0; x <= W; x += 10) g.lineTo(x, base + Math.sin(x * f + ph) * amp); g.lineTo(W, H); g.fill(); };
      hill(H * 0.62, 30, 0.006, 1, '#14304a'); hill(H * 0.72, 24, 0.009, 2, '#0f2a2a');
      for (let i = 0; i < 6; i++) { const x = W * (0.2 + i * 0.12), y = H * 0.72 + Math.sin(x * 0.009 + 2) * 24 - 10; g.fillStyle = '#0a1a1c'; g.fillRect(x - 18, y - 22, 36, 26); g.beginPath(); g.moveTo(x - 24, y - 22); g.lineTo(x, y - 42); g.lineTo(x + 24, y - 22); g.fill(); g.fillStyle = (i + Math.floor(t)) % 5 ? '#ffcf6b' : '#a07a30'; g.fillRect(x - 8, y - 14, 8, 8); }
      const mx = W * 0.82, my = H * 0.6; g.fillStyle = '#0a1a1c'; g.beginPath(); g.moveTo(mx - 14, my + 60); g.lineTo(mx - 6, my); g.lineTo(mx + 6, my); g.lineTo(mx + 14, my + 60); g.fill();
      g.strokeStyle = '#0a1a1c'; g.lineWidth = 7; for (let k = 0; k < 4; k++) { const a = t * 0.6 + (k * TAU) / 4; g.beginPath(); g.moveTo(mx, my); g.lineTo(mx + Math.cos(a) * 54, my + Math.sin(a) * 54); g.stroke(); }
      for (const f of S.ff) { f[2] += 0.02; const x = f[0] + Math.sin(f[2]) * 20, y = f[1] + Math.cos(f[2] * 1.3) * 12; glow(g, x, y, 9, 'rgba(230,255,120,.9)', 0.5 + 0.5 * Math.sin(t * 3 + f[0])); }
    },
  },
  city: {
    name: 'Night city', tag: 'Eight million windows, all awake.', emo: 'happy', music: 'city',
    lines: ['Traffic at 3 a.m. Pip takes the rooftops.', 'Every window here is somebody’s idea.', 'A taxi driver recognises Pip.'],
    draw(g, W, H, t, S, v) {
      vgrad(g, W, H, [[0, '#050814'], [1, '#141c38']]);
      skyline(g, S, 'b1', W, H, H * 0.82, '#0c1226', 8 + v * 6, t, ['#ffd27a', '#8ec5ff']);
      skyline(g, S, 'b2', W, H, H * 0.86, '#080c1a', 22 + v * 14, t, ['#ffd27a', '#ffefc4', '#8ec5ff']);
      g.fillStyle = '#03050b'; g.fillRect(0, H * 0.86, W, H);
      if (!S.cars) S.cars = parts(24, () => ({ x: rnd(W), d: Math.random() < 0.5 ? 1 : -1, s: rnd(80, 220) }));
      for (const c of S.cars) { c.x += c.d * c.s * 0.016 * (1 + v); if (c.x > W + 40) c.x = -40; if (c.x < -40) c.x = W + 40; const y = H * (c.d > 0 ? 0.9 : 0.94); g.strokeStyle = c.d > 0 ? 'rgba(255,80,80,.9)' : 'rgba(255,250,230,.9)'; g.lineWidth = 2; g.beginPath(); g.moveTo(c.x, y); g.lineTo(c.x - c.d * 30, y); g.stroke(); }
    },
  },
  sky: {
    name: 'Open sky', tag: 'Above the clouds, below the dream.', emo: 'love', music: 'sky',
    lines: ['Pip learns to fly. Mostly downwards.', 'A bird asks for directions. Pip points at the next universe.', 'The clouds here are soft. We checked.'],
    draw(g, W, H, t, S, v) {
      vgrad(g, W, H, [[0, '#2b1b54'], [0.55, '#c0477d'], [1, '#ff9e6d']]);
      glow(g, W * 0.7, H * 0.82, W * 0.35, 'rgba(255,200,120,.6)');
      if (!S.cl) { S.cl = parts(10, () => ({ x: rnd(W), y: rnd(H * 0.1, H * 0.85), s: rnd(40, 110), sp: rnd(8, 30) })); S.bd = parts(7, () => ({ x: rnd(W), y: rnd(H * 0.15, H * 0.5), s: rnd(6, 12), p: rnd(TAU) })); }
      for (const c of S.cl) { c.x -= c.sp * 0.016 * (1 + v); if (c.x < -c.s * 3) { c.x = W + c.s * 2; c.y = rnd(H * 0.1, H * 0.85); } g.fillStyle = 'rgba(255,235,240,.35)'; for (let k = 0; k < 5; k++) { g.beginPath(); g.arc(c.x + k * c.s * 0.45, c.y + Math.sin(k * 2) * c.s * 0.15, c.s * (0.4 + (k % 2) * 0.2), 0, TAU); g.fill(); } }
      g.strokeStyle = '#2b1b3a'; g.lineWidth = 2;
      for (const b of S.bd) { b.x += 0.8 * (1 + v); if (b.x > W + 20) { b.x = -20; b.y = rnd(H * 0.15, H * 0.5); } const f = Math.sin(t * 8 + b.p) * b.s * 0.6; g.beginPath(); g.moveTo(b.x - b.s, b.y - f); g.quadraticCurveTo(b.x - b.s * 0.4, b.y - f * 0.2, b.x, b.y); g.quadraticCurveTo(b.x + b.s * 0.4, b.y - f * 0.2, b.x + b.s, b.y - f); g.stroke(); }
    },
  },
  water: {
    name: 'The deep', tag: 'Thirty thousand leagues of calm.', emo: 'sleepy', music: 'water',
    lines: ['Pip holds its breath. Pip doesn’t need to.', 'A whale sings the loading music.', 'Something glows down there. We don’t ask.'],
    draw(g, W, H, t, S, v) {
      vgrad(g, W, H, [[0, '#04425e'], [0.5, '#032a40'], [1, '#010d17']]);
      g.globalCompositeOperation = 'lighter';
      for (let k = 0; k < 6; k++) { const x = W * (0.1 + k * 0.17) + Math.sin(t * 0.3 + k) * 40; const rg = g.createLinearGradient(0, 0, 0, H * 0.8); rg.addColorStop(0, 'rgba(120,220,255,.12)'); rg.addColorStop(1, 'rgba(120,220,255,0)'); g.fillStyle = rg; g.beginPath(); g.moveTo(x - 20, 0); g.lineTo(x + 30, 0); g.lineTo(x + 140, H * 0.8); g.lineTo(x + 40, H * 0.8); g.fill(); }
      g.globalCompositeOperation = 'source-over';
      if (!S.bb) { S.bb = parts(50, () => [rnd(W), rnd(H), rnd(2, 7)]); S.fi = parts(7, () => ({ x: rnd(W), y: rnd(H * 0.3, H * 0.85), s: rnd(14, 34), d: Math.random() < 0.5 ? 1 : -1 })); }
      for (const f of S.fi) { f.x += f.d * f.s * 0.03 * (1 + v * 0.5); if (f.x > W + 60) f.x = -60; if (f.x < -60) f.x = W + 60; g.fillStyle = 'rgba(2,20,30,.85)'; g.beginPath(); g.ellipse(f.x, f.y + Math.sin(t + f.s) * 6, f.s, f.s * 0.42, 0, 0, TAU); g.fill(); g.beginPath(); g.moveTo(f.x - f.d * f.s * 0.9, f.y); g.lineTo(f.x - f.d * f.s * 1.5, f.y - f.s * 0.4); g.lineTo(f.x - f.d * f.s * 1.5, f.y + f.s * 0.4); g.fill(); }
      g.strokeStyle = 'rgba(190,240,255,.5)'; g.lineWidth = 1;
      for (const b of S.bb) { b[1] -= b[2] * 0.25 * (1 + v); b[0] += Math.sin(t * 2 + b[2]) * 0.3; if (b[1] < -10) { b[1] = H + 10; b[0] = rnd(W); } g.beginPath(); g.arc(b[0], b[1], b[2], 0, TAU); g.stroke(); }
      g.strokeStyle = 'rgba(30,120,90,.8)'; g.lineWidth = 4; for (let i = 0; i < 14; i++) { const x = (i + 0.5) * (W / 14); g.beginPath(); g.moveTo(x, H); for (let k = 1; k <= 6; k++) g.lineTo(x + Math.sin(t * 1.4 + k * 0.6 + i) * k * 3, H - k * 18); g.stroke(); }
    },
  },
  fire: {
    name: 'Fire', tag: 'Forged, not built.', emo: 'scared', music: 'fire',
    lines: ['It’s getting hot in here. Pip opens a window. There is no window.', 'The forge where products are made.', 'Pip’s shoes are smoking. Run!'],
    draw(g, W, H, t, S, v) {
      g.fillStyle = '#0a0300'; g.fillRect(0, 0, W, H);
      glow(g, W / 2, H, W * 0.6, 'rgba(255,90,20,.45)');
      if (!S.f) S.f = parts(W < 600 ? 160 : 260, () => ({ x: rnd(W), y: H + rnd(60), l: rnd(1), s: rnd(10, 34) }));
      g.globalCompositeOperation = 'lighter';
      for (const p of S.f) {
        p.l += 0.012 * (1 + v * 0.5); p.y -= (1.6 + p.s * 0.06) * (1 + v * 0.4); p.x += Math.sin(t * 3 + p.s) * 0.8;
        if (p.l > 1) { p.l = 0; p.y = H + rnd(30); p.x = rnd(W); }
        const r = p.s * (1 - p.l), c = p.l < 0.3 ? '255,230,140' : p.l < 0.6 ? '255,140,40' : '200,40,20';
        glow(g, p.x, p.y, r * 1.6, `rgba(${c},${(0.6 * (1 - p.l)).toFixed(2)})`);
      }
      g.globalCompositeOperation = 'source-over';
    },
  },
  ice: {
    name: 'Ice', tag: 'Auroras over a frozen world.', emo: 'scared', music: 'ice',
    lines: ['Pip is shivering. Pip is a circle. Circles shiver.', 'The aurora spells something. Probably “keep going”.', 'Everything froze except the music.'],
    draw(g, W, H, t, S, v) {
      vgrad(g, W, H, [[0, '#020617'], [1, '#0b1d3a']]);
      g.globalCompositeOperation = 'lighter';
      [['80,255,190', 0.32, 0], ['140,120,255', 0.4, 2], ['60,200,255', 0.26, 4]].forEach(([c, base, ph]) => {
        for (let x = 0; x < W; x += 4) { const y = H * base + Math.sin(x * 0.006 + t * 0.5 + ph) * 40 + Math.sin(x * 0.017 + t + ph) * 16; const gr = g.createLinearGradient(0, y - 90, 0, y + 10); gr.addColorStop(0, `rgba(${c},0)`); gr.addColorStop(1, `rgba(${c},.18)`); g.fillStyle = gr; g.fillRect(x, y - 90, 4, 100); }
      });
      g.globalCompositeOperation = 'source-over';
      g.fillStyle = '#dceaff'; g.beginPath(); g.moveTo(0, H); for (let x = 0; x <= W; x += W / 10) g.lineTo(x, H * 0.82 - ((x * 13) % 47)); g.lineTo(W, H); g.fill();
      if (!S.sn) { S.sn = parts(140, () => [rnd(W), rnd(H), rnd(1, 3)]); S.cr = parts(5, () => [rnd(W), rnd(H * 0.2, H * 0.7), rnd(20, 44), rnd(TAU)]); }
      g.fillStyle = 'rgba(240,248,255,.8)'; for (const s of S.sn) { s[1] += s[2] * 0.5 * (1 + v); s[0] += Math.sin(t + s[2] * 4) * 0.4; if (s[1] > H) { s[1] = -4; s[0] = rnd(W); } g.fillRect(s[0], s[1], s[2], s[2]); }
      g.strokeStyle = 'rgba(200,235,255,.7)'; g.lineWidth = 1.5;
      for (const c of S.cr) { c[3] += 0.004; g.save(); g.translate(c[0], c[1]); g.rotate(c[3]); for (let k = 0; k < 6; k++) { g.rotate(TAU / 6); g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -c[2]); g.moveTo(0, -c[2] * 0.6); g.lineTo(-c[2] * 0.2, -c[2] * 0.8); g.moveTo(0, -c[2] * 0.6); g.lineTo(c[2] * 0.2, -c[2] * 0.8); g.stroke(); } g.restore(); }
    },
  },
  brick: {
    name: 'Brick world', tag: 'Snap, stack, repeat.', emo: 'happy', music: 'joy',
    lines: ['Pip steps on a brick. Pip has no feet. Still hurts.', 'Instructions unclear. Built a spaceship anyway.', 'Every universe is just bricks if you zoom in.'],
    draw(g, W, H, t, S, v) {
      g.fillStyle = '#10141a'; g.fillRect(0, 0, W, H);
      const bw = Math.max(48, W / 16), bh = bw * 0.38, cols = Math.ceil(W / bw);
      if (!S.h) { S.h = Array(cols).fill(0); S.f = []; S.stack = []; }
      if (Math.random() < 0.18 + v * 0.1) S.f.push({ c: (Math.random() * cols) | 0, y: -bh, col: pick(['#e3242b', '#ffcd03', '#0055bf', '#00852b', '#f2f2f2', '#fe8a18']), w: Math.random() < 0.5 ? 1 : 2 });
      const brick = (x, y, w, col) => { g.fillStyle = col; g.fillRect(x + 1, y, bw * w - 2, bh); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(x + 1, y + bh - 4, bw * w - 2, 4); for (let k = 0; k < w * 2; k++) { g.fillStyle = col; g.fillRect(x + 6 + k * (bw / 2), y - 5, bw / 2 - 12, 6); g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(x + 6 + k * (bw / 2), y - 5, bw / 2 - 12, 2); } };
      S.f = S.f.filter((b) => {
        b.y += 7 * (1 + v * 0.5);
        const cs = [b.c, Math.min(cols - 1, b.c + b.w - 1)], top = H - Math.max(...cs.map((c) => S.h[c])) - bh;
        if (b.y >= top) { S.stack.push({ x: b.c * bw, y: top, w: b.w, col: b.col }); cs.forEach((c) => { S.h[c] = H - top; }); if (H - top > H * 0.75) { S.h.fill(0); S.stack = []; } return false; }
        brick(b.c * bw, b.y, b.w, b.col); return true;
      });
      for (const b of S.stack) brick(b.x, b.y, b.w, b.col);
    },
  },
  racer: {
    name: 'Toy racer', tag: 'Loop-the-loop at full speed.', emo: 'laugh', music: 'rage',
    lines: ['Pip takes the loop. Pip takes it again.', 'Top speed: yes.', 'The orange track goes on forever. So do we.'],
    draw(g, W, H, t, S, v) {
      vgrad(g, W, H, [[0, '#0d1117'], [1, '#1b2230']]);
      const cx = W / 2, cy = H * 0.48, R = Math.min(W, H) * 0.24, ty = cy + R;
      g.strokeStyle = '#ff7a00'; g.lineWidth = 16; g.beginPath(); g.moveTo(-20, ty); g.lineTo(cx, ty); g.arc(cx, cy, R, Math.PI / 2, Math.PI / 2 + TAU); g.lineTo(W + 20, ty); g.stroke();
      g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 2; g.setLineDash([12, 12]); g.lineDashOffset = -t * 200 * (1 + v); g.stroke(); g.setLineDash([]);
      const L = cx + TAU * R + (W - cx) + 20, cars = ['#e3242b', '#3df5ff', '#ffd166', '#a78bfa'];
      cars.forEach((col, i) => {
        const d = ((t * (420 + i * 30) * (1 + v * 0.5) + i * L / 4) % L) - 20;
        let x, y, a;
        if (d < cx) { x = d; y = ty; a = 0; } else if (d < cx + TAU * R) { const ang = Math.PI / 2 - (d - cx) / R; x = cx + Math.cos(ang) * R; y = cy + Math.sin(ang) * R; a = -(d - cx) / R; } else { x = d - TAU * R; y = ty; a = 0; }
        g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = col; g.fillRect(-16, -18, 32, 11); g.fillStyle = '#111'; g.beginPath(); g.arc(-9, -7, 4, 0, TAU); g.arc(9, -7, 4, 0, TAU); g.fill(); g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 2; g.beginPath(); g.moveTo(-22, -14); g.lineTo(-40, -14); g.stroke(); g.restore();
      });
    },
  },
  noir: {
    name: 'Noir', tag: 'Rain, smoke and a case nobody solved.', emo: 'cool', music: 'noir', font: 'serif', gray: true,
    lines: ['The rain knew my name. It called me Pip.', 'Somebody stole the colour. Pip’s on the case.', 'She walked in with a bug report. Trouble.', 'Every clue pointed to a missing semicolon.'],
    draw(g, W, H, t, S, v) {
      g.fillStyle = '#0b0b0b'; g.fillRect(0, 0, W, H);
      g.save(); g.translate(W * 0.15, -H * 0.1); g.rotate(0.35); g.fillStyle = 'rgba(255,255,255,.07)'; for (let k = 0; k < 9; k++) g.fillRect(0, k * 46, W * 0.9, 22); g.restore();
      glow(g, W * 0.5, H * 0.92, W * 0.32, 'rgba(255,255,255,.18)');
      if (!S.r) { S.r = parts(220, () => [rnd(W), rnd(H), rnd(10, 20)]); S.sm = parts(8, () => [rnd(W), rnd(H * 0.5, H), rnd(60, 140)]); }
      g.strokeStyle = 'rgba(220,220,220,.25)'; g.lineWidth = 1; for (const r of S.r) { r[1] += r[2] * (1 + v * 0.5); if (r[1] > H) { r[1] = -20; r[0] = rnd(W); } g.beginPath(); g.moveTo(r[0], r[1]); g.lineTo(r[0] - 2, r[1] + r[2]); g.stroke(); }
      for (const s of S.sm) { s[0] += 0.3; s[1] -= 0.15; if (s[0] > W + 150) { s[0] = -150; s[1] = rnd(H * 0.5, H); } glow(g, s[0], s[1], s[2], 'rgba(200,200,200,.08)'); }
      if (Math.random() < 0.006) S.flash = 1; if (S.flash > 0) { g.fillStyle = `rgba(255,255,255,${(S.flash * 0.35).toFixed(2)})`; g.fillRect(0, 0, W, H); S.flash -= 0.06; }
      g.fillStyle = 'rgba(255,255,255,.05)'; for (let k = 0; k < 140; k++) g.fillRect(rnd(W), rnd(H), 1, 1); // film grain
    },
  },
  glitch: {
    name: 'The glitch', tag: 'Reality.exe has stopped responding.', emo: 'scared', music: 'robots',
    lines: ['ERR 0x0PIP: universe not found.', 'Pip is in two places at once. Both are wrong.', 'Have you tried turning reality off and on again?'],
    draw(g, W, H, t) {
      g.fillStyle = '#05050a'; g.fillRect(0, 0, W, H);
      for (let k = 0; k < 26; k++) { g.fillStyle = pick(['rgba(255,0,90,.5)', 'rgba(0,255,220,.45)', 'rgba(255,240,0,.35)', 'rgba(255,255,255,.25)']); g.fillRect(rnd(W) - 100, rnd(H), rnd(40, W * 0.5), rnd(2, 26)); }
      g.fillStyle = 'rgba(255,255,255,.04)'; for (let y = 0; y < H; y += 3) g.fillRect(0, y, W, 1);
      g.font = '700 22px "Space Mono", monospace'; g.fillStyle = 'rgba(255,255,255,.4)'; for (let k = 0; k < 4; k++) g.fillText(pick(['ERROR', '404', 'NaN', 'undefined', '¿?', 'NULL', 'SEGFAULT']), rnd(W), rnd(H));
      void t;
    },
  },
  mars: {
    name: 'Planet fall', tag: 'First footprints on a red world.', emo: 'wow', music: 'space',
    lines: ['Touchdown. Pip plants a sticker as a flag.', 'Earth is that small blue dot. Wave.', 'The rover says hi. In Morse.'],
    draw(g, W, H, t, S, v) {
      vgrad(g, W, H, [[0, '#1a0805'], [0.55, '#6b2414'], [0.56, '#a8442a'], [1, '#4a160a']]);
      glow(g, W * 0.78, H * 0.18, 40, 'rgba(120,180,255,.8)'); g.fillStyle = '#4a8cff'; g.beginPath(); g.arc(W * 0.78, H * 0.18, 9, 0, TAU); g.fill();
      if (!S.d) { S.d = parts(90, () => [rnd(W), rnd(H * 0.55, H), rnd(1, 3)]); S.rk = parts(14, () => [rnd(W), rnd(H * 0.6, H), rnd(8, 30)]); }
      for (const r of S.rk) { g.fillStyle = '#3a1208'; g.beginPath(); g.ellipse(r[0], r[1], r[2], r[2] * 0.45, 0, Math.PI, TAU); g.fill(); }
      const rx = ((t * 40 * (1 + v)) % (W + 200)) - 100, ry = H * 0.78; g.fillStyle = '#d9d9d9'; g.fillRect(rx - 26, ry - 20, 52, 16); g.fillStyle = '#222'; for (const k of [-18, 0, 18]) { g.beginPath(); g.arc(rx + k, ry, 7, 0, TAU); g.fill(); } g.strokeStyle = '#d9d9d9'; g.lineWidth = 2; g.beginPath(); g.moveTo(rx + 14, ry - 20); g.lineTo(rx + 14, ry - 40); g.stroke(); glow(g, rx + 14, ry - 42, 8, 'rgba(255,80,80,.9)', (t * 2) % 1 < 0.5 ? 1 : 0.2);
      for (const d of S.d) { d[0] += d[2] * (0.6 + v); if (d[0] > W) d[0] = 0; g.fillStyle = 'rgba(255,170,120,.35)'; g.fillRect(d[0], d[1], d[2], d[2]); }
    },
  },
};
const UNI_IDS = Object.keys(U).filter((k) => k !== 'core');

/* ---------------------------------------------------------
   Story: random action-movie beats, and pieces of the work
   --------------------------------------------------------- */
const TWISTS = [
  'A wormhole opens. Pip jumps in without asking.', 'Alarms. Something is chasing us.', 'A meteor misses by eleven pixels.', 'Pip presses the big red button. Of course.',
  'Everything goes quiet. Too quiet.', 'Gravity flips. Nobody is surprised any more.', 'A message from the future: “keep scrolling”.', 'Hull breach! Pip patches it with a sticker.',
  'Time skips forward a century. Pip blinks.', 'Someone left the multiverse door open.', 'A robot asks for the resume. Pip shares it.', 'Explosion behind us. We don’t look back.',
  'Signal lost… signal found.', 'The map ends here. We keep going.', 'Pip finds a coffee machine in the void. Priorities.', 'Warp drive overheating. Pip says it’s fine.',
  'An alien waves. Pip waves back with both hands.', 'Plot twist: we were the glitch all along.', 'Somewhere, a deploy succeeded. The universe sighs.', 'Pip sneezes. A new galaxy forms.',
];
const PIP_SAYS = { rage: ['GRRR.', 'WHO DID THIS?!', 'Rage mode.'], laugh: ['HAHAHA', 'I can’t breathe!', 'HA!'], cry: ['*sniff*', 'I’m fine. I’m fine.', 'It’s just rain…'], love: ['♥', 'I love it here.', 'Can we stay?'], scared: ['Nope nope nope.', 'Hold me.', 'Is it safe?'], cool: ['Too easy.', 'Stay cool.', 'Nice.'], wow: ['Whoa…', 'Look at that!', 'WOW.'], happy: ['Wheee!', 'Fun!', 'Again!'], sleepy: ['So calm…', 'Zzz…', 'Peaceful.'], calm: ['Home.', 'We’re inside.', 'Breathe.'] };
function makePieces() {
  const out = Object.values(STORIES).map((s) => ({ k: 'Project', h: s.name, p: s.line, n: `${s.numbers[0][0]} ${s.numbers[0][1]}`, href: s.live, cta: 'Open it ↗' }));
  out.push(
    { k: 'Award', h: 'First prize, IISF 2023', p: 'Young Scientist Conference, national level, for an autonomous flying copter for public safety.' },
    { k: 'Award', h: 'Second prize, ImpactX 2024', p: 'A full-stack carbon footprint calculator, built in 24 hours against 100+ teams.' },
    { k: 'Skill', h: 'React 19 · TypeScript · Three.js', p: 'Interfaces that feel good the hundredth time you open them, from the first sketch to a live release.' },
    { k: 'Skill', h: 'Real-time and secure', p: 'WebSockets at 45 ms p95, end-to-end encryption, OAuth and rotating JWTs.' },
    { k: 'Studio', h: 'Poelys', p: 'One studio, six products in orbit.', href: 'https://poelys.com', cta: 'poelys.com ↗' },
    { k: 'Also built', h: 'Interstellar', p: 'A 15-minute real-time 3D space journey with a flyable ship and a talking copilot.', href: 'https://thrishankkuntimaddi.github.io/interstellar/', cta: 'Fly it ↗' },
    { k: 'Fact', h: '5 platforms, one codebase', p: 'Web, Android, macOS, Windows and Linux from one React interface.' },
    { k: 'Open to work', h: 'Frontend & UI roles', p: 'Freelance work and collaborations too. This transmission can be answered.', href: `mailto:${EMAIL}`, cta: 'Write back ✉' },
  );
  return shuffle(out);
}

/* ---------------------------------------------------------
   Music: short generated themes, very quiet. 16 steps a bar.
   Notes are semitones from the root; null is a rest.
   --------------------------------------------------------- */
const N = null;
const THEMES = {
  core:    { bpm: 70,  root: 50, lead: { w: 'sine', o: 24, p: [12, N, N, N, 7, N, N, N, 14, N, N, N, 10, N, N, N], a: 0.6 }, pad: { w: 'sine', ch: [0, 7, 15], len: 16 }, delay: 0.45 },
  space:   { bpm: 64,  root: 45, pad: { w: 'triangle', ch: [0, 7, 12, 16], len: 16 }, lead: { w: 'sine', o: 24, p: [N, N, N, N, 19, N, N, N, N, N, 14, N, N, N, N, N], a: 1.2 }, delay: 0.5 },
  synth:   { bpm: 104, root: 45, bass: { w: 'sawtooth', p: [0, N, 0, 12, 0, N, 0, 12, 3, N, 3, 15, 5, N, 5, 17] }, lead: { w: 'square', o: 24, p: [12, N, 15, N, 19, N, 15, N, 17, N, 15, N, 12, N, N, N] }, kick: 'x...x...x...x...', hat: '..x...x...x...x.', delay: 0.25 },
  robots:  { bpm: 116, root: 48, lead: { w: 'square', o: 24, p: [0, 12, 7, 12, 3, 12, 7, 12, 0, 12, 7, 12, 5, 12, 8, 12] }, bass: { w: 'square', p: [0, N, N, N, N, N, N, N, 5, N, N, N, 3, N, N, N] }, hat: 'x.x.x.x.x.x.x.x.' },
  rage:    { bpm: 140, root: 40, bass: { w: 'sawtooth', p: [0, 0, 12, 0, 0, 12, 0, 1, 0, 0, 12, 0, 3, 3, 1, 1] }, kick: 'x..xx..xx..xx..x', hat: 'xxxxxxxxxxxxxxxx', lead: { w: 'sawtooth', o: 12, p: [N, N, N, N, 7, N, 6, N, N, N, N, N, 1, N, 0, N] } },
  joy:     { bpm: 124, root: 52, lead: { w: 'triangle', o: 24, p: [0, 4, 7, 12, 7, 4, 9, N, 5, 9, 12, 9, 7, N, 4, N] }, bass: { w: 'triangle', p: [0, N, 7, N, 5, N, 7, N, 9, N, 7, N, 5, N, 4, N] }, kick: 'x...x...x...x...', hat: '..x...x...x...x.' },
  sad:     { bpm: 62,  root: 45, lead: { w: 'triangle', o: 24, p: [7, N, N, 5, 3, N, N, N, 2, N, 3, N, 0, N, N, N], a: 0.9 }, pad: { w: 'sine', ch: [0, 3, 7], len: 16 }, delay: 0.4 },
  retro:   { bpm: 112, root: 45, lead: { w: 'square', o: 24, p: [0, 7, 12, 7, 3, 10, 15, 10, 5, 12, 17, 12, 7, 14, 19, 14] }, bass: { w: 'square', p: [0, N, 0, N, 3, N, 3, N, 5, N, 5, N, 7, N, 7, N] }, kick: 'x...x...x...x...', hat: '..x...x...x...x.' },
  beat:    { bpm: 118, root: 43, bass: { w: 'sawtooth', p: [0, N, N, 0, N, N, 12, N, 0, N, N, 0, N, 10, N, 12] }, kick: 'x...x...x...x...', hat: 'x.xxx.xxx.xxx.xx', lead: { w: 'square', o: 24, p: [N, N, 12, N, N, N, 15, N, N, N, 12, N, 10, N, N, N] } },
  village: { bpm: 92,  root: 55, lead: { w: 'triangle', o: 12, p: [0, N, 2, N, 4, N, 7, N, 9, N, 7, N, 4, N, 2, N] }, bass: { w: 'sine', p: [0, N, N, N, 7, N, N, N, 5, N, N, N, 7, N, N, N] } },
  city:    { bpm: 84,  root: 46, pad: { w: 'triangle', ch: [0, 4, 7, 11], len: 8 }, kick: 'x......x..x.....', hat: '..x...x...x...x.', bass: { w: 'sine', p: [0, N, N, N, N, N, N, N, 5, N, N, N, N, N, 7, N] } },
  sky:     { bpm: 76,  root: 53, pad: { w: 'sine', ch: [0, 4, 7, 14], len: 16 }, lead: { w: 'sine', o: 24, p: [7, N, N, N, 9, N, 12, N, N, N, 11, N, 7, N, N, N] }, delay: 0.45 },
  water:   { bpm: 68,  root: 48, lead: { w: 'sine', o: 24, p: [0, 7, 12, 14, 12, 7, N, N, 3, 10, 15, 17, 15, 10, N, N], a: 0.5 }, delay: 0.55 },
  fire:    { bpm: 132, root: 41, kick: 'x..x..x.x..x..x.', hat: '....x.......x...', bass: { w: 'sawtooth', p: [0, N, N, 0, N, N, 0, N, 1, N, N, 1, N, N, 3, N] } },
  ice:     { bpm: 72,  root: 57, lead: { w: 'sine', o: 24, p: [12, N, 19, N, N, N, 24, N, 14, N, N, N, 19, N, N, N], a: 1 }, pad: { w: 'sine', ch: [0, 7, 14], len: 16 }, delay: 0.6 },
  noir:    { bpm: 88,  root: 45, bass: { w: 'triangle', p: [0, N, 3, N, 5, N, 6, N, 7, N, 6, N, 5, N, 3, N] }, lead: { w: 'triangle', o: 24, p: [N, N, 10, N, N, 7, N, N, N, 6, N, 3, N, N, N, N] }, hat: 'x..x..x.x..x..x.', delay: 0.3 },
};
function music(actx) {
  if (!actx) return { set() {}, stop() {}, beat: () => 0 };
  if (actx.state === 'suspended') actx.resume().catch(() => {});
  const out = actx.createGain(); out.gain.value = 0;
  out.gain.linearRampToValueAtTime(0.06, actx.currentTime + 2); // very quiet, but there
  const lp = actx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 8000;
  const dly = actx.createDelay(1); dly.delayTime.value = 0.32; const fb = actx.createGain(); fb.gain.value = 0.32; const send = actx.createGain(); send.gain.value = 0;
  send.connect(dly).connect(fb).connect(dly); dly.connect(lp);
  lp.connect(out).connect(actx.destination);
  let theme = null, step = 0, next = actx.currentTime + 0.1, nbuf = null, timer = 0, beatAt = 0;
  const hz = (m) => 440 * 2 ** ((m - 69) / 12);
  const tone = (wave, midi, at, len, vol) => { const o = actx.createOscillator(), gn = actx.createGain(); o.type = wave; o.frequency.value = hz(midi); gn.gain.setValueAtTime(0.0001, at); gn.gain.exponentialRampToValueAtTime(vol, at + Math.min(0.03, len * 0.3)); gn.gain.exponentialRampToValueAtTime(0.0001, at + len); o.connect(gn); gn.connect(lp); gn.connect(send); o.start(at); o.stop(at + len + 0.05); };
  const noise = (at, len, vol, f) => { if (!nbuf) { nbuf = actx.createBuffer(1, actx.sampleRate, actx.sampleRate); const d = nbuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; } const s = actx.createBufferSource(), hp = actx.createBiquadFilter(), gn = actx.createGain(); s.buffer = nbuf; hp.type = 'highpass'; hp.frequency.value = f; gn.gain.setValueAtTime(vol, at); gn.gain.exponentialRampToValueAtTime(0.0001, at + len); s.connect(hp).connect(gn).connect(lp); s.start(at); s.stop(at + len + 0.02); };
  const kick = (at) => { const o = actx.createOscillator(), gn = actx.createGain(); o.frequency.setValueAtTime(130, at); o.frequency.exponentialRampToValueAtTime(40, at + 0.18); gn.gain.setValueAtTime(0.9, at); gn.gain.exponentialRampToValueAtTime(0.0001, at + 0.22); o.connect(gn).connect(lp); o.start(at); o.stop(at + 0.25); };
  function tick() {
    while (theme && next < actx.currentTime + 0.18) {
      const th = theme, sp = 60 / th.bpm / 4, i = step % 16, at = next;
      if (th.kick?.[i] === 'x') { kick(at); if (i % 4 === 0) beatAt = at; }
      if (th.hat?.[i] === 'x') noise(at, 0.04, 0.18, 7000);
      if (th.bass && th.bass.p[i] != null) tone(th.bass.w, th.root + th.bass.p[i] - 12, at, sp * 1.8, 0.22);
      if (th.lead && th.lead.p[i] != null) tone(th.lead.w, th.root + th.lead.o + th.lead.p[i], at, sp * 2 * (th.lead.a ? th.lead.a * 3 : 1), 0.14);
      if (th.pad && i % th.pad.len === 0) th.pad.ch.forEach((c) => tone(th.pad.w, th.root + 12 + c, at, sp * th.pad.len * 1.1, 0.07));
      if (!th.kick && i % 4 === 0) beatAt = at;
      next += sp; step++;
    }
  }
  timer = setInterval(tick, 50);
  return {
    set(id) { const th = THEMES[id] || THEMES.space; if (th === theme) return; theme = th; send.gain.setTargetAtTime(th.delay || 0, actx.currentTime, 0.2); },
    stop() { clearInterval(timer); out.gain.cancelScheduledValues(actx.currentTime); out.gain.setTargetAtTime(0, actx.currentTime, 0.3); setTimeout(() => { try { out.disconnect(); } catch { /* gone */ } }, 1500); },
    beat: () => Math.max(0, actx.currentTime - beatAt),
  };
}

/* ---------------------------------------------------------
   Pip's feelings in the loop: extra marks drawn over Pip
   --------------------------------------------------------- */
const EMO_SVG = '<g class="pip-emo">'
  + '<g class="e-tears"><path d="M42 64q-4 9 0 13 4-4 0-13z"/><path d="M78 64q-4 9 0 13 4-4 0-13z"/></g>'
  + '<g class="e-hearts"><path d="M20 22c-6-8 6-12 8-4 2-8 14-4 8 4l-8 8z"/><path d="M92 12c-4-6 4-9 6-3 2-6 10-3 6 3l-6 6z"/></g>'
  + '<g class="e-sweat"><path d="M96 34q-6 9 0 13 6-4 0-13z"/></g>'
  + '<g class="e-anger"><path d="M90 20q4 6 0 10M100 20q-4 6 0 10M88 22q6 4 14 0M88 28q6-4 14 0"/></g>'
  + '<g class="e-zz"><path d="M96 14h10l-10 10h10M108 2h7l-7 7h7"/></g>'
  + '</g>';
const EMO_CLASS = { rage: 'angry e-rage', laugh: 'ex-happy e-laugh', cry: 'e-cry', love: 'ex-happy e-love', scared: 'ex-wow e-scared', cool: 'e-cool', wow: 'ex-wow', happy: 'ex-happy', sleepy: 'ex-sleepy e-sleepy', calm: 'ex-happy' };
const TINT = { rage: '#ff5a5a', cry: '#6b8cff', love: '#ff8fb8', scared: '#a7f0ff', cool: '#ffd166', laugh: '#ffd166', sleepy: '#7fe0c3' };

/* ---------------------------------------------------------
   Enter the loop
   --------------------------------------------------------- */
let active = false;
export function enter(ctx) {
  if (active) return; active = true;
  const root = document.documentElement;
  if (!document.querySelector('link[data-inf]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'infinity.css?v=19'; l.dataset.inf = '1'; document.head.append(l); }
  const glitchOn = ctx.PREFS?.glitch !== false;

  const el = document.createElement('div');
  el.className = 'inf'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', 'The endless loop');
  el.innerHTML = '<canvas class="inf-cv" aria-hidden="true"></canvas><div class="inf-vig" aria-hidden="true"></div>'
    + '<div class="inf-hud" aria-hidden="true"><span>DEPTH <b class="h-depth">0000</b></span><span>YEAR <b class="h-year">2026</b></span><span>LOOP <b class="h-loop">1</b></span><span>UNIVERSE <b class="h-n">001</b></span></div>'
    + '<button type="button" class="inf-exit">Wake up ↩</button>'
    + '<div class="inf-title" aria-live="polite"><small></small><b></b><span></span></div>'
    + '<div class="inf-pip" aria-hidden="true"><p class="inf-say"></p><div class="inf-pip-body"></div></div>'
    + '<aside class="inf-card" hidden></aside>'
    + '<p class="inf-story" aria-live="polite"></p>'
    + '<p class="inf-hint">Scroll to fly faster · Esc to wake up</p>'
    + '<div class="inf-glitch" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="inf-fade" aria-hidden="true"></div>';
  document.body.append(el);
  root.classList.add('in-loop');
  const $ = (s) => el.querySelector(s);
  const cv = $('.inf-cv'), g = cv.getContext('2d');
  const pipBody = $('.inf-pip-body');
  pipBody.innerHTML = ctx.pipSvg().replace('</svg>', `<g class="pip-wear">${PIP_WEAR}</g>${EMO_SVG}</svg>`);
  pipBody.classList.add('pip', 'pip-loop'); // borrow Pip's styles

  let W = 0, H = 0, dpr = 1;
  const resize = () => { dpr = Math.min(devicePixelRatio || 1, innerWidth < 700 ? 1.25 : 1.5); W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; cv.style.width = `${W}px`; cv.style.height = `${H}px`; };
  resize(); addEventListener('resize', resize);

  // The journey: depth grows with time, faster when the visitor scrolls.
  let depth = 0, impulse = 0, idx = -1, scene = null, S = {}, last = performance.now(), raf = 0, t0 = performance.now(), storyT = [], glitchT = 0;
  const order = [], visited = [];
  let bag = [], pieces = makePieces();
  const sceneAt = (i) => {
    while (order.length <= i) {
      const k = order.length;
      let id;
      if (k % CORE_EVERY === 0) id = 'core';
      else { if (!bag.length) bag = shuffle(UNI_IDS); id = bag.pop(); if (id === order.at(-1)?.id && bag.length) { bag.unshift(id); id = bag.pop(); } }
      const piece = k % 3 === 2 ? (pieces.length ? pieces.pop() : (pieces = makePieces()).pop()) : null;
      order.push({ id, piece, twist: pick(TWISTS) });
    }
    return order[i];
  };
  const music$ = music(ctx.audio?.());

  function typeLine(text) { // subtitles typed out like a film
    const p = $('.inf-story'); storyT.forEach(clearTimeout); storyT = [];
    p.textContent = ''; p.classList.add('on');
    [...text].forEach((ch, i) => storyT.push(setTimeout(() => { p.textContent += ch; }, i * 26)));
    storyT.push(setTimeout(() => p.classList.remove('on'), text.length * 26 + 3400));
  }
  function feel(emo) {
    pipBody.className = `pip pip-loop ${EMO_CLASS[emo] || ''}`;
    pipBody.dataset.getup = emo === 'cool' ? 'sun' : '';
    if (TINT[emo]) pipBody.style.setProperty('--pip-tint', TINT[emo]); else pipBody.style.removeProperty('--pip-tint');
    const s = $('.inf-say'); s.textContent = pick(PIP_SAYS[emo] || PIP_SAYS.wow); s.classList.remove('on'); void s.offsetWidth; s.classList.add('on');
  }
  function glitchFx(ms = 520) {
    if (!glitchOn) { el.classList.add('fade-swap'); setTimeout(() => el.classList.remove('fade-swap'), 420); return; }
    const gl = $('.inf-glitch'); gl.querySelectorAll('i').forEach((b) => { b.style.top = `${rnd(100)}%`; b.style.height = `${rnd(2, 18)}%`; b.style.setProperty('--dx', `${rnd(-40, 40)}px`); });
    el.classList.add('glitching'); clearTimeout(glitchT); glitchT = setTimeout(() => el.classList.remove('glitching'), ms);
  }
  function enterScene(i) {
    idx = i; const sc = sceneAt(i), u = U[sc.id];
    scene = sc; S = {};
    if (sc.id !== 'core') visited.push(u.name);
    if (visited.length > 24) visited.shift();
    glitchFx(i === 0 ? 900 : 520);
    el.dataset.u = sc.id; el.classList.toggle('gray', !!u.gray);
    const tt = $('.inf-title'); tt.classList.remove('on'); void tt.offsetWidth;
    tt.querySelector('small').textContent = sc.id === 'core' ? `Loop ${Math.floor(i / CORE_EVERY) + 1}` : `Universe ${String(i + 1).padStart(3, '0')}`;
    tt.querySelector('b').textContent = u.name; tt.querySelector('span').textContent = u.tag; tt.dataset.font = u.font || '';
    tt.classList.add('on');
    feel(u.emo);
    music$.set(u.music);
    typeLine(i === 0 ? 'You fell through the bottom of the page. Welcome to the loop.' : pick(u.lines));
    storyT.push(setTimeout(() => { if (idx === i) typeLine(sc.twist); }, 5600));
    const card = $('.inf-card');
    card.hidden = true; card.classList.remove('on');
    if (sc.piece) {
      const p = sc.piece;
      card.innerHTML = `<p class="inf-k">Incoming transmission · ${esc(p.k)}</p><h3>${esc(p.h)}</h3><p>${esc(p.p)}</p>${p.n ? `<p class="inf-n">${esc(p.n)}</p>` : ''}${p.href ? `<a href="${p.href}" ${p.href.startsWith('mailto') ? '' : 'target="_blank" rel="noopener"'}>${esc(p.cta)}</a>` : ''}`;
      storyT.push(setTimeout(() => { if (idx === i) { card.hidden = false; requestAnimationFrame(() => card.classList.add('on')); } }, 2600));
      storyT.push(setTimeout(() => { if (idx === i) card.classList.remove('on'); }, 9800));
    }
  }

  const hud = { d: $('.h-depth'), y: $('.h-year'), l: $('.h-loop'), n: $('.h-n') };
  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05); last = now;
    impulse *= Math.exp(-dt * 1.4);
    const v = Math.max(-0.7, Math.min(6, impulse)), speed = 1 + v;
    depth += dt * speed;
    const i = Math.floor(depth / SCENE);
    if (i !== idx) enterScene(i);
    const t = (now - t0) / 1000;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    try { U[scene.id].draw(g, W, H, t, S, Math.max(0, v), visited, music$.beat()); } catch (err) { console.warn('[loop]', scene.id, err); g.fillStyle = '#000'; g.fillRect(0, 0, W, H); }
    hud.d.textContent = String(Math.floor(depth * 9)).padStart(4, '0');
    hud.y.textContent = String(new Date().getFullYear() + Math.floor(depth * 1.6 + (depth * depth) / 160));
    hud.l.textContent = String(Math.floor(idx / CORE_EVERY) + 1);
    hud.n.textContent = String(idx + 1).padStart(3, '0');
    el.style.setProperty('--tilt', `${(v * 2).toFixed(1)}deg`);
    el.classList.toggle('fast', v > 1.5);
    raf = requestAnimationFrame(frame);
  }

  // Scrolling (wheel, touch, keys) flies faster; scrolling up slows down.
  const onWheel = (e) => { e.preventDefault(); impulse += Math.max(-1.2, Math.min(1.2, e.deltaY / 220)); };
  let ty = null;
  const onTouchStart = (e) => { ty = e.touches[0].clientY; };
  const onTouchMove = (e) => { if (ty == null) return; const y = e.touches[0].clientY; impulse += (ty - y) / 160; ty = y; e.preventDefault(); };
  const onKey = (e) => {
    if (e.key === 'Escape') { e.preventDefault(); exit(); }
    else if (['ArrowDown', 'PageDown', ' ', 'ArrowRight'].includes(e.key)) { e.preventDefault(); impulse += 0.8; }
    else if (['ArrowUp', 'PageUp', 'ArrowLeft'].includes(e.key)) { e.preventDefault(); impulse -= 0.6; }
  };
  el.addEventListener('wheel', onWheel, { passive: false });
  el.addEventListener('touchstart', onTouchStart, { passive: true });
  el.addEventListener('touchmove', onTouchMove, { passive: false });
  addEventListener('keydown', onKey);
  $('.inf-exit').addEventListener('click', () => exit());
  pipBody.addEventListener('click', () => feel(pick(Object.keys(PIP_SAYS))));
  pipBody.style.pointerEvents = 'auto';

  function exit() {
    if (!active) return;
    active = false;
    music$.stop(); storyT.forEach(clearTimeout);
    el.classList.add('leaving'); // fade to white, back to the light site
    setTimeout(() => {
      cancelAnimationFrame(raf);
      removeEventListener('resize', resize); removeEventListener('keydown', onKey);
      el.remove(); root.classList.remove('in-loop');
      ctx.onExit?.();
    }, 1100);
  }
  requestAnimationFrame(() => el.classList.add('in'));
  setTimeout(() => $('.inf-exit')?.focus({ preventScroll: true }), 1200);
  raf = requestAnimationFrame(frame);
  return { exit };
}
