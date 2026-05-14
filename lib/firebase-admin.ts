import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function getPrivateKey() {
  return process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
}

function isRealValue(value: string | undefined) {
  return Boolean(value && !value.startsWith('your-') && !value.includes('PASTE_'));
}

function hasFirebaseConfig() {
  return (
    isRealValue(process.env.FIREBASE_PROJECT_ID) &&
    isRealValue(process.env.FIREBASE_CLIENT_EMAIL) &&
    isRealValue(process.env.FIREBASE_PRIVATE_KEY)
  );
}

export function getFirebaseDb() {
  if (!hasFirebaseConfig()) return null;

  const app =
    getApps()[0] ||
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: getPrivateKey(),
      }),
    });

  return getFirestore(app);
}
