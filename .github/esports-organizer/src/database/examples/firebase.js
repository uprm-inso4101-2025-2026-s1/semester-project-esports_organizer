// Template firebase.js for a Vite frontend app
// Copy this file into your Vite app at src/lib/firebase.js and fill in the config values.

import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Read env from Vite (import.meta.env) if available, otherwise fall back to process.env
const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : (typeof process !== 'undefined' ? process.env : {});

// Replace these values with your Firebase project settings for cloud usage
// You can also set these via Vite env vars (VITE_FIREBASE_*)
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || 'YOUR_API_KEY',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'YOUR_PROJECT_ID.firebaseapp.com',
  projectId: env.VITE_FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || 'YOUR_PROJECT_ID.appspot.com',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'YOUR_MESSAGING_SENDER_ID',
  appId: env.VITE_FIREBASE_APP_ID || 'YOUR_APP_ID',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Toggle emulator usage
const useEmulators = String(env.VITE_USE_EMULATORS || '').toLowerCase() === 'true';

if (useEmulators) {
  const host = env.VITE_FIRESTORE_EMULATOR_HOST || '127.0.0.1';
  const port = Number(env.VITE_FIRESTORE_EMULATOR_PORT || 8080);
  connectFirestoreEmulator(db, host, port);
}

export { app, db };

