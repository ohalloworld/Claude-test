import { getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth, signInAnonymously } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import { firebaseConfig, isFirebaseConfigured } from './firebaseConfig';

// Our security model doesn't distinguish *which* anonymous user is signed
// in — Firestore rules only check that *some* authenticated session exists,
// and access is really gated by knowing the household's invite code. So we
// don't need the anonymous session to persist across app restarts; signing
// in fresh each launch is fine and keeps this simple across web + native.

const app = isFirebaseConfigured() ? (getApps().length ? getApp() : initializeApp(firebaseConfig)) : null;

export const firestore: Firestore | null = app ? getFirestore(app) : null;

let auth: Auth | null = null;
let signInPromise: Promise<string> | null = null;

export function ensureSignedIn(): Promise<string> {
  if (!app) return Promise.reject(new Error('Firebase is not configured yet.'));
  if (!auth) auth = getAuth(app);
  if (auth.currentUser) return Promise.resolve(auth.currentUser.uid);
  if (!signInPromise) {
    const authInstance = auth;
    signInPromise = signInAnonymously(authInstance)
      .then((cred) => cred.user.uid)
      .catch((err) => {
        signInPromise = null;
        throw err;
      });
  }
  return signInPromise;
}

export { isFirebaseConfigured };
