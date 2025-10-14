'use strict';

// Mark a match as FINAL in the Firestore Emulator to trigger the function
// Usage:
//   node .github/esports-organizer/src/scripts/markFinal.js [tournamentId] [matchId]
// Defaults: tourn_demo_1 m2

import admin from 'firebase-admin';

process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:58180';

if (!admin.apps.length) {
  admin.initializeApp({ projectId: 'demo-esports-organizer' });
}

const db = admin.firestore();

async function main() {
  const tid = process.argv[2] || 'tourn_demo_1';
  const mid = process.argv[3] || 'm2';

  const ref = db.doc(`tournaments/${tid}/matches/${mid}`);
  await ref.set({ status: 'FINAL' }, { merge: true });
  console.log(`Match ${mid} in tournament ${tid} set to FINAL.`);
}

main().then(() => process.exit(0)).catch((e) => {
  console.error('markFinal failed', e);
  process.exit(1);
});
