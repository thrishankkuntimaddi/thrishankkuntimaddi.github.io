/* =========================================================
   Kind words: compliments the owner picked in the Studio
   (Inbox → "Show on website"), stored at site/kind and drawn
   as taped sticky notes. Hidden until there is at least one.
   Local preview with samples: ?kind=demo on localhost.
   ========================================================= */
import { readPublic } from './firebase.js?v=2';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const SAMPLE = [
  { name: 'Asha', text: 'The falling universes are wild. I showed this to my whole team.', at: '2026-11' },
  { name: 'Dev', text: 'Cleanest portfolio I have seen this year. The resume download just works.', at: '2026-11' },
  { name: '', text: 'Pip made me smile. Lovely attention to detail everywhere.', at: '2026-10' },
];
const month = (at) => { try { return new Date(`${at}-01T00:00:00`).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }); } catch { return ''; } };

export async function loadKind() {
  if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname) && /[?&]kind=demo\b/.test(location.search)) return SAMPLE;
  try { const { data } = await readPublic('kind'); return Array.isArray(data) ? data.filter((k) => k && k.text) : []; } catch { return []; }
}

export function noteHTML(k, i) {
  return `<figure class="kind-note" style="--tilt:${[-2.2, 1.6, -0.8, 2.4, -1.6, 0.9][i % 6]}deg;--hue:${i % 4}">
    <blockquote>${esc(k.text)}</blockquote>
    <figcaption>— ${esc(k.name || 'A visitor')}${k.at ? `<time>${esc(month(k.at))}</time>` : ''}</figcaption>
  </figure>`;
}

/** Fills `box` (kept hidden when there is nothing to show). */
export async function drawKind(box, max = 6) {
  if (!box) return;
  const list = (await loadKind()).slice(0, max);
  if (!list.length) return;
  box.querySelector('.kind-notes').innerHTML = list.map(noteHTML).join('');
  box.hidden = false;
}
