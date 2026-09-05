// Fill these in with your own Firebase project's values (Project settings →
// General → Your apps → SDK setup and configuration → Config). These are not
// secret — Firebase's actual security is enforced by Firestore security
// rules (see firestore.rules.txt in the repo root), not by hiding this
// config — so it's safe to commit as-is once filled in.
//
// Until you replace the placeholders below, sharing/sync stays disabled and
// the app works exactly as it did before (fully local to this device).

export const firebaseConfig = {
  apiKey: 'REPLACE_ME',
  authDomain: 'REPLACE_ME.firebaseapp.com',
  projectId: 'REPLACE_ME',
  storageBucket: 'REPLACE_ME.appspot.com',
  messagingSenderId: 'REPLACE_ME',
  appId: 'REPLACE_ME',
};

export function isFirebaseConfigured(): boolean {
  return Object.values(firebaseConfig).every((v) => !v.includes('REPLACE_ME'));
}
