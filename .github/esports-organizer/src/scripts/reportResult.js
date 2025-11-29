// Report a match result by setting scores and status FINAL in the Firestore Emulator
// Usage: node .github/esports-organizer/src/scripts/reportResult.js [tournamentId] [matchId] [scoreA] [scoreB]
// Defaults: tourn_demo_1 r1_m1 2 0

import admin from 'firebase-admin';

process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:58180';

if (!admin.apps.length) {
  admin.initializeApp({ projectId: 'demo-esports-organizer' });
}

const db = admin.firestore();

async function main() {
  const tid = process.argv[2] || 'tourn_demo_1';
  const mid = process.argv[3] || 'r1_m1';
  const scoreA = Number(process.argv[4] || 2);
  const scoreB = Number(process.argv[5] || 0);
  const ref = db.doc(`Tournaments/${tid}/matches/${mid}`);
  await ref.set({ status: 'FINAL', scoreA, scoreB }, { merge: true });
  console.log(`Reported result for ${mid} in ${tid}: ${scoreA}-${scoreB} (FINAL)`);
}

main().then(() => process.exit(0)).catch((e) => {
  console.error('reportResult failed', e);
  process.exit(1);
});

