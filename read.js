/* =========================================================
   The quick-read page (read.html, or ?plain on the home page):
   resume first, as real text a screen reader can read, then
   projects, kind words and contact. No animation, no 3D, no
   web fonts. Uses the same live data as the main site:
   site/resume (or a tailored link's resume), site/content.
   ========================================================= */
import { loadContent } from './lib/content-live.js?v=2';
import { PROJECTS_SEED } from './lib/projects-seed.js?v=22';
import { readPublic } from './lib/firebase.js?v=2';
import { loadLink, linkResume, linkPdfB64, helloNote } from './lib/tailored.js?v=1';
import { drawKind } from './lib/kind-wall.js?v=1';
import { inline, esc } from './lib/md.js?v=1';

const $ = (s) => document.querySelector(s);
const STATIC = 'resume/Thrishank-Kuntimaddi-Resume.pdf';
const ext = (u) => (/^https?:/.test(u) ? ' rel="noopener"' : '');

/* ---------- Resume as HTML ---------- */
function resumeHTML(d) {
  const contacts = (d.contacts || []).map((c) => (c.url ? `<a href="${esc(c.url)}"${ext(c.url)}>${esc(c.text)}</a>` : esc(c.text))).join('<span aria-hidden="true"> · </span>');
  const sec = (d.sections || []).filter((s) => !s.hidden).map((s) => {
    let body = '';
    if (s.type === 'text') body = `<p>${inline(s.body)}</p>`;
    else if (s.type === 'skills') body = `<dl class="skills">${(s.items || []).map((i) => `<div><dt>${esc(i.label)}</dt><dd>${inline(i.value)}</dd></div>`).join('')}</dl>`;
    else if (s.type === 'list') body = `<ul>${(s.items || []).filter(Boolean).map((i) => `<li>${inline(i)}</li>`).join('')}</ul>`;
    else body = (s.items || []).map((i) => `<article class="entry">
        <header><h4>${inline([i.title, i.org].filter(Boolean).join(' · '))}</h4>${i.date ? `<span>${esc(i.date)}</span>` : ''}</header>
        ${i.sub || i.subRight ? `<p class="sub">${inline(i.sub || '')}${i.subRight ? `<span>${esc(i.subRight)}</span>` : ''}</p>` : ''}
        ${(i.bullets || []).filter(Boolean).length ? `<ul>${i.bullets.filter(Boolean).map((b) => `<li>${inline(b)}</li>`).join('')}</ul>` : ''}
      </article>`).join('');
    return `<section class="rz-sec"><h3>${esc(s.title)}</h3>${body}</section>`;
  }).join('');
  return `<header class="rz-head"><p class="rz-name">${esc(d.name)}</p>${d.title ? `<p class="rz-title">${esc(d.title)}</p>` : ''}<p class="rz-contacts">${contacts}</p></header>${sec}`;
}

let resume = null, link = null;
async function loadResume() {
  link = await loadLink();
  if (link) { helloNote(link, $('#forSlot')); }
  const own = linkResume(link);
  if (own) return { data: own, at: link.updatedAt, fromLink: true };
  try { const { data, updatedAt } = await readPublic('resume'); if (data && (data.sections || (data.kind === 'pdf' && data.parts))) return { data, at: updatedAt }; } catch { /* static fallback */ }
  return null;
}
async function pdfBytes() {
  const P = await import('./lib/resume-pdf.js?v=1');
  if (resume.fromLink) return P.b64ToBytes(await linkPdfB64(link));
  const parts = await Promise.all([...Array(resume.data.parts)].map((_, n) => readPublic(`resumePdf${n}`).then((r) => r.data)));
  return P.b64ToBytes(parts.join(''));
}
async function drawResume() {
  const box = $('#resumeBox');
  try { await drawInto(box); } finally { box.classList.remove('loading'); }
}
async function drawInto(box) {
  resume = await loadResume();
  if (!resume) { // the PDF in the repo
    box.innerHTML = `<p>The resume is a PDF: <a href="${STATIC}">open it</a> or use the download button above.</p>`;
    return;
  }
  $('#resumeDate').textContent = `updated ${new Date(resume.at).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}`;
  if (resume.data.kind === 'pdf') {
    box.innerHTML = '<p class="muted">Drawing the PDF…</p>';
    try { const P = await import('./lib/resume-pdf.js?v=1'); box.innerHTML = ''; box.classList.add('pdf'); await P.renderInto(box, await pdfBytes()); }
    catch { box.innerHTML = `<p>Couldn’t draw the PDF here. <a href="${STATIC}">Open it</a> instead.</p>`; }
    return;
  }
  box.innerHTML = resumeHTML(resume.data);
}
$('#dl').addEventListener('click', async (e) => {
  if (!resume) return; // the static PDF link works on its own
  e.preventDefault();
  window.tkTrack?.('resume', { detail: 'quick read' });
  try {
    if (resume.data.kind === 'pdf') { const P = await import('./lib/resume-pdf.js?v=1'); P.saveBlob(P.bytesToBlob(await pdfBytes()), 'Thrishank-Kuntimaddi-Resume.pdf'); return; }
    const R = await import('./lib/resume.js?v=1');
    await R.loadEngine(); await R.download(resume.data);
  } catch { location.href = STATIC; }
});

/* ---------- Projects ---------- */
function drawProjects(P) {
  $('#projectList').innerHTML = (P.main || []).filter((p) => !p.hidden).map((p) => `<li class="project">
    <h3>${esc(p.name)}</h3>
    <p>${esc(p.what || '')}</p>
    ${(p.points || []).filter(Boolean).length ? `<ul>${p.points.filter(Boolean).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
    ${(p.chips || []).length ? `<p class="tech"><span class="sr">Built with: </span>${p.chips.map(esc).join(' · ')}</p>` : ''}
    <p class="links">${p.live ? `<a href="${esc(p.live)}"${ext(p.live)}>Open live<span class="sr"> ${esc(p.name)}</span> ↗</a>` : ''}${p.repo ? `<a href="${esc(p.repo)}"${ext(p.repo)}>Code<span class="sr"> for ${esc(p.name)}</span></a>` : ''}</p>
  </li>`).join('');
  $('#moreList').innerHTML = (P.more || []).filter((p) => !p.hidden).map((p) => `<li>
    ${p.link ? `<a href="${esc(p.link)}"${ext(p.link)}><b>${esc(p.name)}</b></a>` : `<b>${esc(p.name)}</b>`}${p.status ? ` <span class="tag">${esc(p.status)}</span>` : ''}
    <span>${esc(p.what || '')}</span>${p.stack ? `<small>${esc(p.stack)}</small>` : ''}
  </li>`).join('');
}

/* ---------- Start ---------- */
drawResume();
loadContent(1200).then((c) => {
  drawProjects(c?.projects || PROJECTS_SEED);
  const lede = c?.text?.['hero.p0']; if (lede) $('.lede').innerHTML = lede;
  if ((c?.notesIndex || []).length) $('#notesLink').hidden = false;
});
drawKind($('#kind'), 9);
