
// This lets existing imports from 'src/lib/firebase' keep working.
// note from @yeudeedleCS: this was added to fix issues with vite build, and ports. It was a mistake caught late so this wrapper was added.
export { app, db, functions } from '../database/firebaseClient.js';
