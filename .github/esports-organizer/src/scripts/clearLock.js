// Delete the recalc lock doc for a tournament in the Firestore Emulator
// Usage:
//   node .github/esports-organizer/src/scripts/clearLock.js [tournamentId]
// Default tournamentId: tourn_demo_1

import admin from 'firebase-admin';

process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:58180';

if (!admin.apps.length) {
  admin.initializeApp({ projectId: 'demo-esports-organizer' });
}

const db = admin.firestore();

async function main() {
  const tid = process.argv[2] || 'tourn_demo_1';
  const ref = db.doc(`tournaments/${tid}/internal/recalc_lock`);
  await ref.delete().catch(() => {});
  console.log(`Cleared recalc lock for tournament ${tid}`);
}

main().then(() => process.exit(0)).catch((e) => {
  console.error('clearLock failed', e);
  process.exit(1);
});

