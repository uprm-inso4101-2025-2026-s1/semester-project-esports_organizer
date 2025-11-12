'use strict';
// List recalc queue events for a tournament (Firestore Emulator)
// Usage: node .github/esports-organizer/src/scripts/verifyQueue.js [tournamentId]

import admin from 'firebase-admin';

process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:58180';

if (!admin.apps.length) {
  admin.initializeApp({ projectId: 'demo-esports-organizer' });
}

const db = admin.firestore();

async function main() {
  const tid = process.argv[2] || 'tourn_demo_1';
  const col = db.collection(`Tournaments/${tid}/internal/meta/recalc_queue`);
  const snap = await col.get();
  if (snap.empty) {
    console.log(`No queue events for tournament ${tid}`);
    return;
  }
  const events = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    .sort((a,b) => (a.createdAt||0) - (b.createdAt||0));
  console.log(`Queue events for ${tid} (oldest first):`);
  events.forEach(ev => {
    console.log(`- ${ev.id} type=${ev.type} status=${ev.status} createdAt=${ev.createdAt}`);
  });
}

main().then(()=>process.exit(0)).catch(e=>{ console.error(e); process.exit(1); });
