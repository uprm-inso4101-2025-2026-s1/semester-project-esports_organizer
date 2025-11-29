// List matches for a tournament from the Firestore Emulator
// Usage: node .github/esports-organizer/src/scripts/listMatches.js [tournamentId]

import admin from 'firebase-admin';

process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:58180';

if (!admin.apps.length) {
  admin.initializeApp({ projectId: 'demo-esports-organizer' });
}

const db = admin.firestore();

async function main() {
  const tid = process.argv[2] || 'tourn_demo_1';
  const col = db.collection(`Tournaments/${tid}/matches`);
  const snap = await col.get();
  console.log(`Matches for ${tid}: ${snap.size}`);
  const list = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    .sort((a,b) => ((a.round||0) - (b.round||0)) || ((a.index||0) - (b.index||0)) || a.id.localeCompare(b.id));
  list.slice(0, 50).forEach(m => {
    console.log(`${m.id} r=${m.round} i=${m.index} status=${m.status} next=${m.nextMatchId||''}/${m.winnerSlot||''} A=${m.slotA?.participantId||''} B=${m.slotB?.participantId||''} winner=${m.winnerId||''}`);
  });
}

main().then(()=>process.exit(0)).catch(e=>{ console.error('listMatches failed', e); process.exit(1); });

