'use strict';

// Seed sample tournament and matches into Firestore Emulator using Admin SDK
import admin from 'firebase-admin';

process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:58180';

if (!admin.apps.length) {
  admin.initializeApp({ projectId: 'demo-esports-organizer' });
}

const db = admin.firestore();

async function main() {
  const tid = 'tourn_demo_1';
  const tRef = db.doc(`Tournaments/${tid}`);
  await tRef.set({ name: 'Demo Tournament', createdAt: Date.now() }, { merge: true });

  const m1 = db.doc(`Tournaments/${tid}/matches/m1`);
  const m2 = db.doc(`Tournaments/${tid}/matches/m2`);
  const m3 = db.doc(`Tournaments/${tid}/matches/m3`);

  await m1.set({ status: 'PENDING', teamA: 'Alpha', teamB: 'Bravo' });
  await m2.set({ status: 'IN_PROGRESS', teamA: 'Charlie', teamB: 'Delta' });
  await m3.set({ status: 'PENDING', teamA: 'Echo', teamB: 'Foxtrot' });

  console.log('Seed complete. Tournament ID:', tid);
  console.log('Matches: m1(PENDING), m2(IN_PROGRESS), m3(PENDING)');
}

main().then(() => process.exit(0)).catch((e) => {
  console.error('Seed failed', e);
  process.exit(1);
});
