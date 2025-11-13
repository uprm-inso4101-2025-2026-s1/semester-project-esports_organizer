// Verify that tournaments/{tid}/derived/bracket exists and print it
import admin from 'firebase-admin';

process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:58180';

if (!admin.apps.length) {
  admin.initializeApp({ projectId: 'demo-esports-organizer' });
}

const db = admin.firestore();

async function main() {
  const tid = process.argv[2] || 'tourn_demo_1';
  const ref = db.doc(`Tournaments/${tid}/derived/bracket`);
  const snap = await ref.get();
  if (!snap.exists) {
    console.error('Derived bracket doc not found');
    process.exit(2);
  }
  console.log('Derived bracket:', JSON.stringify(snap.data(), null, 2));
}

main().then(() => process.exit(0)).catch((e) => {
  console.error('verifyDerived failed', e);
  process.exit(1);
});
