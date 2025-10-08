// Minimal Firebase Firestore initialization for Vite app
// Auto-connects to local emulator when VITE_USE_EMULATORS=true

import { initializeApp} from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const app = initializeApp({
    apiKey: "dummy",
    authDomain: "localhost",
    projectId: "local-esports-organizer",
    appId: "dummy",
});

export const db = getFirestore(app);
connectFirestoreEmulator(db, "127.0.0.1", 8080);

