/* =========================================================
   App lock: fingerprint / face / screen lock before the
   Studio shows anything, on open and after 5 minutes away.
   - Android app: the phone's biometric prompt (native plugin).
   - Browser: a passkey on this device (Touch ID, Windows Hello,
     Android screen lock), set up once after signing in.
   ========================================================= */
const AWAY_MS = 5 * 60 * 1000;
const KEY = 'studio-lock';
const native = () => window.StudioNative?.biometric;
let hiddenAt = 0, locked = false;

const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64 = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));
const saved = () => { try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; } };

export async function lockAvailable() {
  if (native()) return native().available();
  return !!(window.PublicKeyCredential && await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable?.().catch(() => false));
}
export const lockOn = () => !!native() || !!saved();

/** Browser: create a device passkey used only to unlock this app. */
export async function setUpLock(email) {
  if (native()) return true;
  const cred = await navigator.credentials.create({ publicKey: {
    challenge: crypto.getRandomValues(new Uint8Array(32)),
    rp: { name: 'myProfile', id: location.hostname },
    user: { id: crypto.getRandomValues(new Uint8Array(16)), name: email, displayName: 'myProfile lock' },
    pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
    authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required', residentKey: 'discouraged' },
    timeout: 60000,
  } });
  localStorage.setItem(KEY, JSON.stringify({ id: b64(cred.rawId) }));
  return true;
}
export function removeLock() { localStorage.removeItem(KEY); }

async function verify() {
  if (native()) return native().verify('Unlock myProfile');
  const s = saved(); if (!s) return true;
  const r = await navigator.credentials.get({ publicKey: {
    challenge: crypto.getRandomValues(new Uint8Array(32)), rpId: location.hostname,
    allowCredentials: [{ type: 'public-key', id: unb64(s.id) }], userVerification: 'required', timeout: 60000,
  } });
  return !!r;
}

/** Show the lock screen until the owner proves it's them. */
export async function unlock() {
  if (!lockOn()) return true;
  const el = document.getElementById('lock');
  locked = true; el.hidden = false; document.body.classList.add('is-locked');
  const btn = el.querySelector('button'), msg = el.querySelector('p');
  const tryIt = async () => {
    btn.disabled = true; msg.textContent = 'Confirm it’s you…';
    try {
      if (await verify()) { locked = false; el.hidden = true; document.body.classList.remove('is-locked'); return true; }
      msg.textContent = 'Not confirmed. Try again.';
    } catch (e) { msg.textContent = /NotAllowed|cancel/i.test(`${e.name} ${e.message}`) ? 'Cancelled. Tap to try again.' : `Couldn’t check: ${e.message}`; }
    btn.disabled = false; return false;
  };
  return new Promise((done) => {
    btn.onclick = async () => { if (await tryIt()) done(true); };
    tryIt().then((ok) => ok && done(true));
  });
}

/** Lock again after 5 minutes in the background. */
export function watchAway() {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { hiddenAt = Date.now(); document.body.classList.add('is-away'); }
    else {
      document.body.classList.remove('is-away');
      if (!locked && hiddenAt && Date.now() - hiddenAt > AWAY_MS) unlock();
    }
  });
}
