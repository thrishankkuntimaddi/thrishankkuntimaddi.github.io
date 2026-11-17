/* Bundled into the app (esbuild) as window.StudioNative: native Google sign-in
   and the phone's biometric lock, used by admin/app.js and admin/lock.js. */
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { NativeBiometric } from '@capgo/capacitor-native-biometric';

const cancelled = (e) => /cancel|12501|16/i.test(`${e?.message ?? ''} ${e?.code ?? ''}`);
if (Capacitor.isNativePlatform()) {
  window.StudioNative = {
    version: __APP_VERSION__,
    async googleIdToken() {
      try { return (await FirebaseAuthentication.signInWithGoogle()).credential?.idToken ?? null; }
      catch (e) { if (cancelled(e)) return null; }
      try { return (await FirebaseAuthentication.signInWithGoogle({ useCredentialManager: false })).credential?.idToken ?? null; }
      catch (e) { if (cancelled(e)) return null; throw e; }
    },
    signOut: () => FirebaseAuthentication.signOut().catch(() => {}),
    biometric: {
      async available() { try { return (await NativeBiometric.isAvailable({ useFallback: true })).isAvailable; } catch { return false; } },
      async verify(reason) {
        if (!(await this.available())) return true; // no lock set on the phone: nothing to check against
        await NativeBiometric.verifyIdentity({ reason, title: 'Unlock Studio', useFallback: true, maxAttempts: 3 });
        return true;
      },
    },
  };
}
