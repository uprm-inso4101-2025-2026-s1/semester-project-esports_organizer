// Initialize Firebase Web SDK and connect to local emulators in dev
// This is imported for side-effects in main.jsx so the app always uses the emulator in local dev.
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// For emulator-only dev, projectId is sufficient
const firebaseConfig = {
  projectId: 'demo-esports-organizer',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const functions = getFunctions(app);

// Connect to the root emulator suite ports
if (typeof window !== 'undefined') {
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') {
    connectFirestoreEmulator(db, '127.0.0.1', 58180);
    connectFunctionsEmulator(functions, '127.0.0.1', 5002);
  }
}

export { app, db, functions };
