/* =========================================================
   Firebase (free Spark plan) for the portfolio.
   - The site reads the published resume with one small REST
     call (no SDK), so the main page stays fast.
   - The SDK is loaded only by the editor app and when a
     visitor sends a message.
   The web config below is public by design; access is
   controlled by firestore.rules (owner-only writes).
   ========================================================= */
export const CONFIG = {
  apiKey: 'AIzaSyBWggoAjGHu3wdtY5MX3k3xxVzLha3A1zE',
  authDomain: 'myprofile-f29f5.firebaseapp.com',
  projectId: 'myprofile-f29f5',
  storageBucket: 'myprofile-f29f5.firebasestorage.app',
  messagingSenderId: '909596114891',
  appId: '1:909596114891:web:bb3fa568158098cd58804e',
};
export const OWNER = 'thrishankkuntimaddi@gmail.com';
const SDK = 'https://www.gstatic.com/firebasejs/11.0.2';

/* ---------- Public, SDK-free reads ---------- */
const REST = `https://firestore.googleapis.com/v1/projects/${CONFIG.projectId}/databases/(default)/documents`;
/** Reads site/{id} whose payload is stored as a JSON string in `data`. */
export async function readPublic(id) {
  const r = await fetch(`${REST}/site/${id}?key=${CONFIG.apiKey}`, { cache: 'no-store' });
  if (!r.ok) throw new Error(`site/${id}: ${r.status}`);
  const j = await r.json();
  const f = j.fields || {};
  return { data: JSON.parse(f.data?.stringValue || 'null'), updatedAt: f.updatedAt?.timestampValue || j.updateTime };
}

/* ---------- SDK (lazy) ---------- */
let sdk = null;
export function loadSDK() {
  if (!sdk) {
    sdk = Promise.all([
      import(`${SDK}/firebase-app.js`),
      import(`${SDK}/firebase-firestore.js`),
    ]).then(([appM, fs]) => {
      const app = appM.getApps().length ? appM.getApp() : appM.initializeApp(CONFIG);
      return { app, fs, db: fs.getFirestore(app) };
    }).catch((e) => { sdk = null; throw e; });
  }
  return sdk;
}
export async function loadAuth() {
  const [{ app }, auth] = await Promise.all([loadSDK(), import(`${SDK}/firebase-auth.js`)]);
  return { auth, a: auth.getAuth(app) };
}

export const KINDS = {
  feedback: 'Feedback',
  compliment: 'Compliment',
  help: 'Help / question',
  message: 'Message',
};

/** Visitor message -> messages collection (create-only for the public, see rules). */
export async function sendMessage({ kind, name, email, text, page }) {
  const { fs, db } = await loadSDK();
  const clip = (s, n) => String(s || '').trim().slice(0, n);
  await fs.addDoc(fs.collection(db, 'messages'), {
    kind: KINDS[kind] ? kind : 'message',
    name: clip(name, 80),
    email: clip(email, 120),
    text: clip(text, 4000),
    page: clip(page, 200),
    read: false,
    starred: false,
    createdAt: fs.serverTimestamp(),
  });
}
