// Seed participants with seeds and set tournament pre-start status in Firestore Emulator
// Usage: node .github/esports-organizer/src/scripts/seedParticipants.js [tournamentId] [count]

import admin from 'firebase-admin';

process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:58180';

if (!admin.apps.length) {
  admin.initializeApp({ projectId: 'demo-esports-organizer' });
}

const db = admin.firestore();

async function main() {
  const tid = process.argv[2] || 'tourn_demo_1';
  const count = Number(process.argv[3] || 8);

  const tRef = db.doc(`Tournaments/${tid}`);
  await tRef.set({ name: 'Demo Tournament', status: 'NOT_STARTED', createdAt: Date.now() }, { merge: true });

  const batch = db.bulkWriter ? null : db.batch();
  const partsCol = db.collection(`Tournaments/${tid}/participants`);

  for (let i = 1; i <= count; i++) {
    const pid = `p${i}`;
    const ref = partsCol.doc(pid);
    const data = { seed: i, name: `Team ${i}`, createdAt: Date.now() };
    if (batch) {
      batch.set(ref, data, { merge: true });
    } else {
      await ref.set(data, { merge: true });
    }
  }

  if (batch) await batch.commit();

  console.log(`Seeded ${count} participants for tournament ${tid}`);
}

main().then(() => process.exit(0)).catch((e) => {
  console.error('seedParticipants failed', e);
  process.exit(1);
});

