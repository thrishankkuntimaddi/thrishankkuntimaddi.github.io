/* =========================================================
   Uploaded resume PDFs (free plan, no Firebase Storage):
   the file is kept as base64 in a few Firestore documents of
   up to 380,000 characters each.
     owner copy:  resumeFiles/{resumeId}_{n}
     on website:  site/resumePdf{n}   (public read)
   The resume's `data` is a small JSON note:
     { kind: 'pdf', name, size, parts, pages }
   Pages are drawn with pdf.js (cdnjs) so phones show them too.
   ========================================================= */
export const CHUNK = 380000;
export const MAX_BYTES = 1100 * 1024; // 4 parts at most
export const isPdf = (d) => !!d && d.kind === 'pdf';

export function fileToB64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result).split(',')[1] || '');
    r.onerror = () => rej(r.error);
    r.readAsDataURL(file);
  });
}
export const split = (b64) => { const out = []; for (let i = 0; i < b64.length; i += CHUNK) out.push(b64.slice(i, i + CHUNK)); return out; };
export function b64ToBytes(b64) {
  const bin = atob(b64); const u = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return u;
}
export const bytesToBlob = (u) => new Blob([u], { type: 'application/pdf' });

let lib = null;
export function loadPdfJs() {
  if (!lib) {
    lib = new Promise((res, rej) => {
      if (window.pdfjsLib) return res(window.pdfjsLib);
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      s.crossOrigin = 'anonymous';
      s.onload = () => { window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'; res(window.pdfjsLib); };
      s.onerror = () => { lib = null; rej(new Error('Could not load the PDF viewer')); };
      document.head.appendChild(s);
    });
  }
  return lib;
}
/** How many pages (to warn when a resume is longer than one page). */
export async function pageCount(bytes) {
  const pdfjs = await loadPdfJs();
  const doc = await pdfjs.getDocument({ data: bytes.slice() }).promise;
  const n = doc.numPages; doc.destroy(); return n;
}
/** Draw every page into `box` as crisp canvases that fit its width. */
export async function renderInto(box, bytes) {
  const pdfjs = await loadPdfJs();
  const doc = await pdfjs.getDocument({ data: bytes.slice() }).promise;
  box.innerHTML = '';
  const width = Math.max(320, box.clientWidth || 600);
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const base = page.getViewport({ scale: 1 });
    const vp = page.getViewport({ scale: (width / base.width) * dpr });
    const c = document.createElement('canvas');
    c.width = Math.round(vp.width); c.height = Math.round(vp.height);
    c.className = 'pdf-page'; c.style.width = '100%'; c.style.height = 'auto'; c.style.display = 'block'; c.style.background = '#fff';
    c.setAttribute('role', 'img'); c.setAttribute('aria-label', `Resume page ${i} of ${doc.numPages}`);
    box.appendChild(c);
    await page.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
  }
  doc.destroy();
}
export function saveBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = name || 'Resume.pdf';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
