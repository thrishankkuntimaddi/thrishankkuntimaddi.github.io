/* =========================================================
   Resume engine. One layout, three outputs:
     layout(data)    -> positioned text and lines on one page
     toSVG(data)     -> on-screen preview (same positions)
     toPDF(data)     -> real, selectable-text PDF (ATS-friendly)
   Text supports **bold**, *italic* and [link](https://...).
   The layout shrinks itself until everything fits on one page.
   Used by the site (download/preview) and by the editor app.
   ========================================================= */

const BASE = new URL('../', import.meta.url).href; // site root
const JSPDF = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
const FACES = { regular: 'Regular', bold: 'Bold', italic: 'Italic', bolditalic: 'BoldItalic' };
export const PAGES = { letter: [612, 792], a4: [595.28, 841.89] };

export const COLORS = { text: '#1C2833', muted: '#5D6D7E', faint: '#B6BEC6' };

/* ---------------- Loading jsPDF + the font (Carlito = Calibri metrics) ---------------- */
let ready = null;
function loadScript(src) {
  return new Promise((ok, bad) => {
    if (window.jspdf) return ok();
    const s = document.createElement('script');
    s.src = src; s.async = true; s.crossOrigin = 'anonymous';
    s.onload = ok; s.onerror = () => bad(new Error('Could not load the PDF library'));
    document.head.appendChild(s);
  });
}
const b64 = (buf) => {
  const u = new Uint8Array(buf); let s = '';
  for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
  return btoa(s);
};
let fontData = null;
export function loadEngine() {
  if (!ready) {
    ready = Promise.all([
      loadScript(JSPDF),
      Promise.all(Object.values(FACES).map((f) => fetch(`${BASE}assets/fonts/Carlito-${f}.ttf`).then((r) => {
        if (!r.ok) throw new Error('Could not load the resume font');
        return r.arrayBuffer();
      }))).then((bufs) => { fontData = bufs.map(b64); }),
    ]).catch((e) => { ready = null; throw e; });
  }
  return ready;
}
function newDoc(page = 'letter') {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'pt', format: PAGES[page] || PAGES.letter, compress: true });
  Object.keys(FACES).forEach((k, i) => {
    doc.addFileToVFS(`Carlito-${FACES[k]}.ttf`, fontData[i]);
    doc.addFont(`Carlito-${FACES[k]}.ttf`, 'Carlito', k === 'regular' ? 'normal' : k);
  });
  return doc;
}
const style = (f) => (f === 'regular' ? 'normal' : f);

/* ---------------- Inline markup -> runs ---------------- */
export function runs(text, base = 'regular') {
  const out = [];
  const re = /\*\*(.+?)\*\*|\*(.+?)\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let i = 0, m;
  const push = (s, f, url) => { if (s) out.push({ s, f, url }); };
  const add = (f, x) => (f === 'regular' ? x : f === x ? f : 'bolditalic');
  text = String(text || '');
  while ((m = re.exec(text))) {
    push(text.slice(i, m.index), base);
    if (m[1] != null) push(m[1], add(base, 'bold'));
    else if (m[2] != null) push(m[2], add(base, 'italic'));
    else push(m[3], base, m[4]);
    i = re.lastIndex;
  }
  push(text.slice(i), base);
  return out;
}
export const plain = (t) => runs(t).map((r) => r.s).join('');

/* ---------------- Layout ---------------- */
function measureWith(doc) {
  const cache = new Map();
  return (s, f, size) => {
    const k = f + size + s;
    let w = cache.get(k);
    if (w == null) { doc.setFont('Carlito', style(f)); doc.setFontSize(size); w = doc.getTextWidth(s); cache.set(k, w); }
    return w;
  };
}

function build(data, k, W) {
  const [PW, PH] = PAGES[data.page] || PAGES.letter;
  const M = 45, X = M, R = PW - M, CW = R - X;
  const accent = data.accent || '#1A5276';
  const ops = [];
  let y = 0;
  const z = (n) => n * k;
  const body = z(10), big = z(10.5);

  // Wrap styled runs into lines; returns the y after the block.
  function para(rs, x, width, size, color, lh, justify, first) {
    const words = []; // tokens: {s,f,url,w,space}
    rs.forEach((r) => {
      r.s.split(/(\s+)/).forEach((p) => {
        if (!p) return;
        if (/^\s+$/.test(p)) { if (words.length) words[words.length - 1].space = true; return; }
        words.push({ s: p, f: r.f, url: r.url, c: r.c, w: W(p, r.f, size), space: false });
      });
    });
    const lines = []; let line = [], lw = 0;
    words.forEach((w) => {
      const sp = line.length && line[line.length - 1].space ? W(' ', line[line.length - 1].f, size) : 0;
      if (line.length && lw + sp + w.w > width + 0.01) { lines.push(line); line = []; lw = 0; }
      lw += (line.length && line[line.length - 1].space ? W(' ', line[line.length - 1].f, size) : 0) + w.w;
      line.push(w);
    });
    if (line.length) lines.push(line);
    lines.forEach((ln, li) => {
      if (li || !first) y += lh; // first line baseline is already set by caller
      const last = li === lines.length - 1;
      const gaps = ln.slice(0, -1).filter((w) => w.space).length;
      const natural = ln.reduce((a, w, i) => a + w.w + (i < ln.length - 1 && w.space ? W(' ', w.f, size) : 0), 0);
      const extra = justify && !last && gaps ? (width - natural) / gaps : 0;
      let cx = x;
      // merge neighbouring words of the same style into one text op (when not justified)
      let cur = null;
      ln.forEach((w, i) => {
        const sp = i < ln.length - 1 && w.space ? W(' ', w.f, size) + extra : 0;
        const col = w.c || (w.url ? COLORS.text : color);
        if (!extra && cur && cur.f === w.f && cur.url === w.url && cur.c === col) {
          cur.str += (cur.trail ? ' ' : '') + w.s; cur.w = cx + w.w - cur.x; cur.trail = w.space;
        } else {
          cur = { t: 'text', x: cx, y, s: size, f: w.f, c: col, str: w.s, url: w.url, w: w.w, trail: w.space };
          ops.push(cur);
        }
        cx += w.w + sp;
      });
    });
    return lines.length;
  }

  function text(str, x, f, size, color, align = 'left', url) {
    const w = W(str, f, size);
    const tx = align === 'right' ? x - w : align === 'center' ? x - w / 2 : x;
    ops.push({ t: 'text', x: tx, y, s: size, f, c: color, str, url, w });
    return w;
  }

  // ---- Header ----
  y = 53.3 + (k - 1) * 10;
  text(String(data.name || '').toUpperCase(), PW / 2, 'bold', z(18), accent, 'center');
  if (data.title) { y += z(16.7); text(data.title, PW / 2, 'regular', big, COLORS.muted, 'center'); }
  const contacts = (data.contacts || []).filter((c) => c && c.text);
  if (contacts.length) {
    y += z(15.3);
    const sep = '  |  ';
    const parts = [];
    contacts.forEach((c, i) => {
      if (i) parts.push({ s: sep, f: 'regular', c: COLORS.faint });
      parts.push({ s: c.text, f: 'regular', c: c.url ? COLORS.text : COLORS.muted, url: c.url });
    });
    const total = parts.reduce((a, p) => a + W(p.s, p.f, body), 0);
    let cx = Math.max(X, PW / 2 - total / 2);
    parts.forEach((p) => {
      const w = W(p.s, p.f, body);
      ops.push({ t: 'text', x: cx, y, s: body, f: p.f, c: p.c, str: p.s, url: p.url, w, underline: !!p.url });
      cx += w;
    });
  }

  // ---- Sections ----
  const SEC_GAP = z(18.7), HEAD_TO_TEXT = z(18.3), HEAD_TO_ENTRY = z(20.8);
  const LH = z(12.25), BUL_GAP = z(1.4);
  (data.sections || []).filter((s) => !s.hidden).forEach((sec) => {
    y += SEC_GAP;
    text(String(sec.title || '').toUpperCase(), X, 'bold', big, accent);
    ops.push({ t: 'line', x1: X, y1: y + z(4.4), x2: R, y2: y + z(4.4), c: accent, w: 0.9 });

    const bullets = (list, x0 = X) => {
      (list || []).filter((b) => String(b).trim()).forEach((b, i) => {
        y += i ? LH + BUL_GAP : z(13.8);
        text('•', x0 + 12, 'regular', body, COLORS.text);
        para(runs(b), x0 + 24, R - x0 - 24, body, COLORS.text, LH, !!sec.justify, true);
      });
    };

    if (sec.type === 'text') {
      y += HEAD_TO_TEXT;
      String(sec.body || '').split(/\n+/).filter(Boolean).forEach((p, i) => {
        if (i) y += LH;
        para(runs(p), X, CW, body, COLORS.text, LH, sec.justify !== false, true);
      });
    } else if (sec.type === 'skills') {
      y += HEAD_TO_TEXT - z(2);
      (sec.items || []).filter((it) => it.label || it.value).forEach((it, i) => {
        if (i) y += z(14.2);
        const rs = it.label ? [{ s: `${it.label}: `, f: 'bold' }, ...runs(it.value)] : runs(it.value);
        para(rs, X, CW, z(10.5), COLORS.text, z(13), false, true);
      });
    } else if (sec.type === 'list') {
      y += HEAD_TO_ENTRY - z(13.8) - z(1);
      bullets(sec.items);
    } else { // entries
      (sec.items || []).forEach((it, i) => {
        y += i ? z(17) : HEAD_TO_ENTRY;
        const dw = it.date ? W(it.date, 'italic', big) : 0;
        let w = text(it.title || '', X, 'bold', big, COLORS.text);
        if (it.org) {
          const sep = '  ·  ';
          ops.push({ t: 'text', x: X + w, y, s: big, f: 'regular', c: COLORS.muted, str: sep, w: W(sep, 'regular', big) });
          w += W(sep, 'regular', big);
          text(it.org, X + w, 'bold', big, accent, 'left', it.url);
        } else if (it.url) ops[ops.length - 1].url = it.url;
        if (it.date) text(it.date, R - 5 * k, 'italic', big, COLORS.muted, 'right');
        if (it.sub || it.subRight) {
          y += z(14.5);
          const muted = sec.subStyle === 'muted';
          if (it.sub) text(it.sub, X, muted ? 'regular' : 'italic', big, muted ? COLORS.muted : accent);
          if (it.subRight) text(it.subRight, R - 5 * k, 'italic', big, COLORS.muted, 'right');
          if ((it.bullets || []).some((b) => String(b).trim())) y += z(1);
        }
        bullets(it.bullets);
      });
    }
  });
  const bottom = y + z(6);
  return { ops, PW, PH, bottom, fits: bottom <= PH - 36, k };
}

/** Lay the resume out on one page, shrinking type and spacing (down to 82%) until it fits. */
export function layout(data) {
  const doc = newDoc(data.page);
  const W = measureWith(doc);
  let res = build(data, 1, W);
  for (let k = 0.99; !res.fits && k >= 0.82; k -= 0.01) res = build(data, +k.toFixed(2), W);
  return res;
}

/* ---------------- Outputs ---------------- */
const escX = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const FW = { regular: [400, 'normal'], bold: [700, 'normal'], italic: [400, 'italic'], bolditalic: [700, 'italic'] };

/** SVG of the page (needs the Carlito @font-face, see resumeFontCSS). */
export function toSVG(data, { overflowLine = false } = {}) {
  const L = layout(data);
  const out = [`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${L.PW} ${L.PH}" class="rz-page" role="img" aria-label="${escX(`${data.name || 'Resume'} — one-page resume`)}"><rect width="100%" height="100%" fill="#fff"/><g font-family="Carlito, Calibri, sans-serif" style="font-kerning:none;font-variant-ligatures:none" text-rendering="geometricPrecision">`];
  L.ops.forEach((o) => {
    if (o.t === 'line') { out.push(`<line x1="${o.x1}" y1="${o.y1}" x2="${o.x2}" y2="${o.y2}" stroke="${o.c}" stroke-width="${o.w}"/>`); return; }
    const [fw, fs] = FW[o.f];
    let t = `<text x="${o.x.toFixed(2)}" y="${o.y.toFixed(2)}" font-size="${o.s}" font-weight="${fw}" font-style="${fs}" fill="${o.c}" xml:space="preserve"${o.underline ? ' text-decoration="underline"' : ''}>${escX(o.str)}</text>`;
    if (o.url) t = `<a href="${escX(o.url)}" target="_blank" rel="noopener">${t}</a>`;
    out.push(t);
  });
  out.push('</g>');
  if (!L.fits && overflowLine) out.push(`<line x1="0" y1="${L.PH - 36}" x2="${L.PW}" y2="${L.PH - 36}" stroke="#d33" stroke-dasharray="6 4" stroke-width="1.2"/><text x="${L.PW - 8}" y="${L.PH - 40}" font-family="sans-serif" font-size="9" fill="#d33" text-anchor="end">Over one page: shorten something</text>`);
  out.push('</svg>');
  return { svg: out.join(''), fits: L.fits, scale: L.k };
}

export const resumeFontCSS = () => Object.entries(FACES).map(([k, f]) => `@font-face{font-family:Carlito;src:url(${BASE}assets/fonts/Carlito-${f}.ttf) format("truetype");font-weight:${FW[k][0]};font-style:${FW[k][1]};font-display:block}`).join('');

/** Build the PDF and return a Blob. */
export function toPDF(data) {
  const L = layout(data);
  const doc = newDoc(data.page);
  doc.setProperties({
    title: `${data.name || 'Resume'} — Resume`,
    author: data.name || '',
    subject: data.title || 'Resume',
    keywords: (data.sections || []).filter((s) => s.type === 'skills').flatMap((s) => (s.items || []).map((i) => i.value)).join(', ').slice(0, 900),
    creator: 'Resume studio',
  });
  L.ops.forEach((o) => {
    if (o.t === 'line') { doc.setDrawColor(o.c); doc.setLineWidth(o.w); doc.line(o.x1, o.y1, o.x2, o.y2); return; }
    doc.setFont('Carlito', style(o.f)); doc.setFontSize(o.s); doc.setTextColor(o.c);
    doc.text(o.str, o.x, o.y);
    if (o.underline) { doc.setDrawColor(o.c); doc.setLineWidth(0.5); doc.line(o.x, o.y + 1.6, o.x + o.w, o.y + 1.6); }
    if (o.url) doc.link(o.x, o.y - o.s * 0.8, o.w, o.s * 1.05, { url: o.url });
  });
  return { blob: doc.output('blob'), fits: L.fits };
}

export const fileName = (data) => `${String(data.name || 'Resume').trim().replace(/\s+/g, '-')}-Resume.pdf`;

export async function download(data) {
  await loadEngine();
  const { blob } = toPDF(data);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = fileName(data);
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

/* ---------------- Plain-text / Markdown export (paste into job forms) ---------------- */
export function toText(data) {
  const L = [String(data.name || '').toUpperCase(), data.title, (data.contacts || []).map((c) => c.url && !/^mailto:|^tel:/.test(c.url) ? `${c.text} (${c.url})` : c.text).join(' | '), ''];
  (data.sections || []).filter((s) => !s.hidden).forEach((s) => {
    L.push(String(s.title).toUpperCase());
    if (s.type === 'text') L.push(plain(s.body));
    else if (s.type === 'skills') (s.items || []).forEach((i) => L.push(`${i.label}: ${plain(i.value)}`));
    else if (s.type === 'list') (s.items || []).forEach((i) => L.push(`• ${plain(i)}`));
    else (s.items || []).forEach((i) => {
      L.push([i.title, i.org].filter(Boolean).join(' · ') + (i.date ? `    ${i.date}` : ''));
      if (i.sub || i.subRight) L.push([i.sub, i.subRight].filter(Boolean).join('    '));
      (i.bullets || []).filter(Boolean).forEach((b) => L.push(`• ${plain(b)}`));
    });
    L.push('');
  });
  return L.filter((l) => l != null).join('\n');
}
