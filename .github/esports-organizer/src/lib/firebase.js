// Minimal Firebase Firestore initialization for Vite app
// Auto-connects to local emulator when VITE_USE_EMULATORS=true

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'local-esports-organizer';

// Avoid re-initializing during HMR
const app = getApps().length ? getApps()[0] : initializeApp({ projectId });

const db = getFirestore(app);

if (import.meta.env.VITE_USE_EMULATORS === 'true') {
  const host = import.meta.env.VITE_FIRESTORE_EMULATOR_HOST || '127.0.0.1';
  const port = Number(import.meta.env.VITE_FIRESTORE_EMULATOR_PORT || 8080);
  connectFirestoreEmulator(db, host, port);
}

export { app, db };

