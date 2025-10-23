// One-shot bracket recalculation smoke test against Firestore Emulator (no Functions emulator needed)
// Usage: node .github/esports-organizer/src/scripts/testRecalc.js [tournamentId] [participantsCount]

import admin from 'firebase-admin';
import { createRequire } from 'module';

process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:58180';
process.env.GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT || 'demo-esports-organizer';

if (!admin.apps.length) {
  admin.initializeApp({ projectId: process.env.GOOGLE_CLOUD_PROJECT });
}

const db = admin.firestore();
const requireCJS = createRequire(import.meta.url);
const { _processQueue } = requireCJS('../functions/recalcScheduler.js');

async function seedParticipants(tid, count) {
  const tRef = db.doc(`tournaments/${tid}`);
  await tRef.set({ name: 'Demo Tournament', status: 'NOT_STARTED', createdAt: Date.now() }, { merge: true });
  const partsCol = db.collection(`tournaments/${tid}/participants`);
  const batch = db.batch();
  for (let i = 1; i <= count; i++) {
    const pid = `p${i}`;
    batch.set(partsCol.doc(pid), { seed: i, name: `Team ${i}`, createdAt: Date.now() }, { merge: true });
  }
  await batch.commit();
}

async function enqueueForceRecalc(tid) {
  const col = db.collection(`tournaments/${tid}/internal/meta/recalc_queue`);
  const ref = await col.add({ type: 'AdminForceRecalculate', createdAt: Date.now(), status: 'pending' });
  return ref.id;
}

async function snapshotSummary(tid) {
  const mSnap = await db.collection(`tournaments/${tid}/matches`).get();
  const matches = mSnap.docs.map(d => ({ id: d.id, ...d.data() }))
    .sort((a,b) => ((a.round||0)-(b.round||0)) || ((a.index||0)-(b.index||0)) || a.id.localeCompare(b.id));
  const derivedRef = db.doc(`tournaments/${tid}/derived/bracket`);
  const dSnap = await derivedRef.get();
  return {
    count: matches.length,
    first: matches[0],
    last: matches[matches.length-1],
    derived: dSnap.exists ? dSnap.data() : null,
  };
}

async function main() {
  const tid = process.argv[2] || 'tourn_demo_1';
  const count = Number(process.argv[3] || 8);
  await seedParticipants(tid, count);
  const eid = await enqueueForceRecalc(tid);
  console.log('Enqueued event id:', eid);
  await _processQueue(tid);
  const sum = await snapshotSummary(tid);
  console.log('Matches total:', sum.count);
  if (sum.first) console.log('First match:', JSON.stringify(sum.first, null, 2));
  if (sum.derived) console.log('Derived doc:', JSON.stringify(sum.derived, null, 2));
}

main().then(()=>process.exit(0)).catch(e=>{ console.error('testRecalc failed', e); process.exit(1); });

