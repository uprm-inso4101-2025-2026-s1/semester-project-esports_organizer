// Back-compat shim: re-export the unified Firebase client (Firestore + Functions)
// This lets existing imports from 'src/lib/firebase' keep working.
export { app, db, functions, auth } from '../database/firebaseClient.js';
