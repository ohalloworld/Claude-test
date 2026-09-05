// Firebase project: baby-tracker-a52ff. These values are not secret —
// Firebase's actual security is enforced by Firestore security rules (see
// firestore.rules in the repo root), not by hiding this config — so it's
// safe to commit as-is.

export const firebaseConfig = {
  apiKey: 'AIzaSyAou529HDa3mTGXm22S7Gb8NN8zhq3YKvU',
  authDomain: 'baby-tracker-a52ff.firebaseapp.com',
  projectId: 'baby-tracker-a52ff',
  storageBucket: 'baby-tracker-a52ff.firebasestorage.app',
  messagingSenderId: '232835885505',
  appId: '1:232835885505:web:ef1b7906907c7111712740',
};

export function isFirebaseConfigured(): boolean {
  return Object.values(firebaseConfig).every((v) => !v.includes('REPLACE_ME'));
}
