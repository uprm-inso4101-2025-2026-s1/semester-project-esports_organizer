'use strict';

// Print a match document from the Firestore Emulator
// Usage:
//   node .github/esports-organizer/src/scripts/verifyMatch.js [tournamentId] [matchId]
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
  const ref = db.doc(`Tournaments/${tid}/matches/${mid}`);
  const snap = await ref.get();
  if (!snap.exists) {
    console.error('Match doc not found:', `Tournaments/${tid}/matches/${mid}`);
    process.exit(2);
  }
  console.log('Match doc:', JSON.stringify(snap.data(), null, 2));
}

main().then(() => process.exit(0)).catch((e) => {
  console.error('verifyMatch failed', e);
  process.exit(1);
});

