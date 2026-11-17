/* =========================================================
   "Send a message" for visitors: feedback, compliments,
   help questions and plain messages. Lands in the Studio
   app's inbox (Firestore `messages`, create-only).
   Any element with [data-contact] opens it; data-kind
   preselects the kind. Firebase loads only on first send.
   ========================================================= */
const KINDS = [
  ['feedback', 'Feedback', 'What worked, what didn’t, what you’d change.'],
  ['compliment', 'Compliment', 'Say something nice. It will be read, promise.'],
  ['help', 'Question / help', 'Using a theme kit, or anything about my work.'],
  ['message', 'Message', 'Work, collaborations, or just hello.'],
];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let dlg = null;
const COOLDOWN = 'tk-msg-at';

function build() {
  dlg = document.createElement('dialog');
  dlg.className = 'sheet contact-sheet';
  dlg.setAttribute('aria-labelledby', 'ctTitle');
  dlg.innerHTML = `
    <header class="sheet-head">
      <div><p class="sheet-kicker">Straight to my inbox</p><h2 id="ctTitle">Send a message</h2><p>I read every one. Add your email if you’d like a reply.</p></div>
      <button class="btn btn-paper btn-sm sheet-x" type="button" data-ct-close aria-label="Close">Close ✕</button>
    </header>
    <form class="sheet-body ct-form" novalidate>
      <fieldset class="ct-kinds"><legend>What is it?</legend>
        ${KINDS.map(([k, n], i) => `<label><input type="radio" name="kind" value="${k}" ${i === 0 ? 'checked' : ''}><span>${esc(n)}</span></label>`).join('')}
      </fieldset>
      <p class="ct-what" id="ctWhat">${esc(KINDS[0][2])}</p>
      <label class="ct-f">Your message<textarea name="text" rows="5" maxlength="4000" required></textarea></label>
      <div class="ct-row">
        <label class="ct-f">Name <small>(optional)</small><input name="name" maxlength="80" autocomplete="name"></label>
        <label class="ct-f">Email <small>(optional, for a reply)</small><input name="email" type="email" maxlength="120" autocomplete="email"></label>
      </div>
      <label class="ct-trap" aria-hidden="true">Leave this empty<input name="website" tabindex="-1" autocomplete="off"></label>
      <div class="ct-foot">
        <button class="btn btn-gloss" type="submit">Send ✉</button>
        <span class="ct-status" role="status" aria-live="polite"></span>
      </div>
    </form>`;
  document.body.appendChild(dlg);
  const form = dlg.querySelector('form');
  const status = dlg.querySelector('.ct-status');
  dlg.querySelector('[data-ct-close]').addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  form.addEventListener('change', (e) => {
    if (e.target.name === 'kind') dlg.querySelector('#ctWhat').textContent = KINDS.find((k) => k[0] === e.target.value)[2];
  });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = new FormData(form);
    const text = String(f.get('text') || '').trim();
    const email = String(f.get('email') || '').trim();
    if (text.length < 2) { status.textContent = 'Write a little something first.'; form.text.focus(); return; }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { status.textContent = 'That email doesn’t look right (or leave it empty).'; form.email.focus(); return; }
    let last = 0; try { last = +localStorage.getItem(COOLDOWN) || 0; } catch { /* private mode */ }
    if (Date.now() - last < 30000) { status.textContent = 'Sent one just now. Give it half a minute.'; return; }
    const btn = form.querySelector('[type=submit]');
    btn.disabled = true; status.textContent = 'Sending…';
    try {
      if (!f.get('website')) { // bots fill the hidden field; they get a fake success
        const { sendMessage } = await import('./firebase.js?v=1');
        await sendMessage({ kind: f.get('kind'), name: f.get('name'), email, text, page: location.pathname + location.hash });
      }
      try { localStorage.setItem(COOLDOWN, String(Date.now())); } catch { /* fine */ }
      form.reset();
      status.textContent = 'Sent. Thank you!';
      window.dispatchEvent(new CustomEvent('tk:message-sent'));
      setTimeout(() => { if (dlg.open) dlg.close(); status.textContent = ''; }, 1600);
    } catch (err) {
      status.textContent = 'Couldn’t send right now. You can email thrishankkuntimaddi@gmail.com instead.';
    } finally { btn.disabled = false; }
  });
}

export function openContact(kind) {
  if (!dlg) build();
  if (kind) { const r = dlg.querySelector(`input[value="${kind}"]`); if (r) { r.checked = true; r.dispatchEvent(new Event('change', { bubbles: true })); } }
  dlg.showModal();
  setTimeout(() => dlg.querySelector('textarea').focus(), 50);
}

document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-contact]');
  if (!t) return;
  e.preventDefault();
  openContact(t.dataset.kind);
});
