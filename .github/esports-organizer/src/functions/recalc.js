'use strict';

const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

function classifyScope({ status, events }) {
  const types = (events || []).map(e => e.type);
  const hasSeedingChange = types.some(t => [
    'ParticipantAdded', 'ParticipantRemoved', 'ParticipantReplaced', 'SeedingUpdated', 'TournamentSettingsUpdated'
  ].includes(t));
  const hasMatchChange = types.some(t => [
    'MatchReported', 'MatchCorrected', 'MatchReverted', 'MatchFinalized'
  ].includes(t));
  const hasForce = types.includes('AdminForceRecalculate');

  if (hasForce) return { type: 'full' };
  if (hasSeedingChange && (status === 'NOT_STARTED' || status === 'SETUP' || status === undefined)) {
    return { type: 'seeding' };
  }
  if (hasMatchChange) {
    const fromMatchIds = (events || [])
      .filter(e => e.sourceMatchId)
      .map(e => e.sourceMatchId);
    return { type: 'partial', fromMatchIds: Array.from(new Set(fromMatchIds)).slice(0, 50) };
  }
  return { type: 'noop' };
}

async function getTournament(tournamentId) {
  const snap = await db.doc(`tournaments/${tournamentId}`).get();
  return snap.exists ? snap.data() : {};
}

async function listParticipants(tournamentId) {
  const col = db.collection(`tournaments/${tournamentId}/participants`);
  const snap = await col.get();
  const participants = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  if (participants.length) return participants;

  // Fallback to seeding collection: assume docs with { participantId, seed }
  const seedCol = db.collection(`tournaments/${tournamentId}/seeding`);
  const seedSnap = await seedCol.get();
  const seeds = seedSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  return seeds.map(s => ({ id: s.participantId || s.id, seed: s.seed }));
}

function seedSort(a, b) {
  const sa = Number.isFinite(a.seed) ? a.seed : Number.MAX_SAFE_INTEGER;
  const sb = Number.isFinite(b.seed) ? b.seed : Number.MAX_SAFE_INTEGER;
  if (sa !== sb) return sa - sb;
  // fallback stable tie-breakers
  const na = (a.name || a.teamName || a.id || '').toString();
  const nb = (b.name || b.teamName || b.id || '').toString();
  return na.localeCompare(nb);
}

function nextPow2(n) {
  let p = 1;
  while (p < n) p <<= 1;
  return p;
}

// Generate standard single-elim pairing order for N seeds
// Returns array of pairs of seed indices (1-based seed numbers) for round 1
function generateRound1Pairs(bracketSize) {
  // Classic pairing for single-elimination using recursive pattern
  function build(n) {
    if (n === 1) return [1];
    const prev = build(n / 2);
    const mirror = prev.map(s => n + 1 - s);
    return prev.concat(mirror);
  }
  const order = build(bracketSize);
  const pairs = [];
  for (let i = 0; i < order.length; i += 2) {
    pairs.push([order[i], order[i + 1]]);
  }
  return pairs; // e.g., for 8: [1,8],[4,5],[3,6],[2,7]
}

function matchId(round, index) {
  return `r${round}_m${index}`;
}

function nextFor(round, index, totalRounds) {
  if (round >= totalRounds) return null;
  const nextRound = round + 1;
  const nextIndex = Math.ceil(index / 2);
  const slot = (index % 2 === 1) ? 'A' : 'B';
  return { nextMatchId: matchId(nextRound, nextIndex), winnerSlot: slot };
}

async function writeInitialBracket(tid, participants) {
  const sorted = [...participants].sort(seedSort);
  const bracketSize = nextPow2(sorted.length || 0);
  if (bracketSize === 0) return { createdMatches: 0 };
  const totalRounds = Math.log2(bracketSize);

  // Map seeds to participants (some may be byes)
  const seeded = Array.from({ length: bracketSize }, (_, i) => {
    const p = sorted[i];
    if (!p) return null; // bye
    return { id: p.id, seed: Number.isFinite(p.seed) ? p.seed : (i + 1), name: p.name || p.teamName || undefined };
  });

  // Build all matches
  const batch = db.batch();
  let created = 0;

  // Clear existing matches to keep idempotent pre-start rebuild
  const matchesCol = db.collection(`tournaments/${tid}/matches`);
  const existingSnap = await matchesCol.get();
  existingSnap.forEach(d => batch.delete(d.ref));

  // Round 1
  const pairs = generateRound1Pairs(bracketSize);
  pairs.forEach((pair, idx) => {
    const round = 1;
    const index = idx + 1;
    const id = matchId(round, index);
    const ref = matchesCol.doc(id);
    const aSeed = pair[0];
    const bSeed = pair[1];
    const aP = seeded[aSeed - 1] || null;
    const bP = seeded[bSeed - 1] || null;
    const next = nextFor(round, index, totalRounds);

    const doc = {
      round,
      index,
      status: 'PENDING',
      slotA: aP ? { participantId: aP.id, seed: aP.seed, name: aP.name } : null,
      slotB: bP ? { participantId: bP.id, seed: bP.seed, name: bP.name } : null,
      ...next,
    };

    // Auto-advance byes
    if (!!aP !== !!bP) {
      const winner = aP || bP;
      doc.status = 'FINAL';
      doc.winnerId = winner.id;
      doc.winner = { participantId: winner.id, seed: winner.seed, name: winner.name };
    }

    batch.set(ref, doc);
    created += 1;
  });

  // Subsequent rounds scaffold
  let matchesInRound = bracketSize / 2;
  for (let round = 2; round <= totalRounds; round++) {
    matchesInRound = matchesInRound / 2;
    for (let i = 1; i <= matchesInRound; i++) {
      const id = matchId(round, i);
      const ref = matchesCol.doc(id);
      const next = nextFor(round, i, totalRounds);
      batch.set(ref, {
        round,
        index: i,
        status: 'PENDING',
        slotA: null,
        slotB: null,
        ...next,
      });
      created += 1;
    }
  }

  await batch.commit();
  return { createdMatches: created, totalRounds };
}

async function determineWinnerFromDoc(doc) {
  const data = doc.data();
  if (!data) return null;
  if (data.winnerId) return data.winnerId;
  // Try to infer from scores if available
  if (typeof data.scoreA === 'number' && typeof data.scoreB === 'number') {
    if (data.scoreA > data.scoreB && data.slotA?.participantId) return data.slotA.participantId;
    if (data.scoreB > data.scoreA && data.slotB?.participantId) return data.slotB.participantId;
  }
  return null;
}

async function propagateFrom(tid, startMatchIds, maxDepth = 64) {
  if (!startMatchIds || !startMatchIds.length) return { propagated: 0 };
  const matchesCol = db.collection(`tournaments/${tid}/matches`);
  let queue = [...new Set(startMatchIds)];
  let propagated = 0;

  for (let step = 0; step < maxDepth && queue.length; step++) {
    const nextQueue = [];
    const batch = db.batch();

    for (const mid of queue) {
      const ref = matchesCol.doc(mid);
      const snap = await ref.get();
      if (!snap.exists) continue;
      const m = snap.data() || {};
      if (!m.nextMatchId || !m.winnerSlot) continue;

      const winnerId = await determineWinnerFromDoc(snap);

      const nextRef = matchesCol.doc(m.nextMatchId);
      const nextSnap = await nextRef.get();
      if (!nextSnap.exists) continue;
      const n = nextSnap.data() || {};
      const targetField = m.winnerSlot === 'A' ? 'slotA' : 'slotB';
      const prevSlot = n[targetField];

      if (winnerId) {
        const winnerPayload = (m.slotA?.participantId === winnerId ? m.slotA : (m.slotB?.participantId === winnerId ? m.slotB : { participantId: winnerId }));
        const needsUpdate = !prevSlot || prevSlot.participantId !== winnerPayload.participantId;
        if (needsUpdate) {
          const update = { [targetField]: winnerPayload, updatedAt: Date.now() };
          // If next match had a winner, it may be invalid now; clear it to re-evaluate
          if (n.winnerId || n.status === 'FINAL') {
            update.winnerId = admin.firestore.FieldValue.delete ? admin.firestore.FieldValue.delete() : null;
            update.winner = admin.firestore.FieldValue.delete ? admin.firestore.FieldValue.delete() : null;
            update.status = 'PENDING';
            // Also clear downstream slot since winner changed
            if (n.nextMatchId && n.winnerSlot) {
              const nnRef = matchesCol.doc(n.nextMatchId);
              const nnSnap = await nnRef.get();
              if (nnSnap.exists) {
                const nn = nnSnap.data() || {};
                const nnTarget = n.winnerSlot === 'A' ? 'slotA' : 'slotB';
                if (nn[nnTarget]?.participantId !== winnerPayload.participantId) {
                  batch.set(nnRef, { [nnTarget]: admin.firestore.FieldValue.delete ? admin.firestore.FieldValue.delete() : null, updatedAt: Date.now() }, { merge: true });
                }
                nextQueue.push(n.nextMatchId);
              }
            }
          }
          batch.set(nextRef, update, { merge: true });
          propagated += 1;
          nextQueue.push(m.nextMatchId);
        }
      } else {
        // No winner now (e.g., corrected/reverted). If slot was previously set, clear it and cascade.
        if (prevSlot) {
          const update = { [targetField]: admin.firestore.FieldValue.delete ? admin.firestore.FieldValue.delete() : null, updatedAt: Date.now(), status: 'PENDING' };
          if (n.winnerId) {
            update.winnerId = admin.firestore.FieldValue.delete ? admin.firestore.FieldValue.delete() : null;
            update.winner = admin.firestore.FieldValue.delete ? admin.firestore.FieldValue.delete() : null;
          }
          batch.set(nextRef, update, { merge: true });
          propagated += 1;
          nextQueue.push(m.nextMatchId);
          // Also clear downstream since next match winner is invalidated
          if (n.nextMatchId && n.winnerSlot) {
            const nnRef = matchesCol.doc(n.nextMatchId);
            batch.set(nnRef, { [(n.winnerSlot === 'A' ? 'slotA' : 'slotB')]: admin.firestore.FieldValue.delete ? admin.firestore.FieldValue.delete() : null, updatedAt: Date.now(), status: 'PENDING' }, { merge: true });
            nextQueue.push(n.nextMatchId);
          }
        }
      }
    }

    if (propagated) await batch.commit();
    queue = nextQueue;
  }

  return { propagated };
}

async function globalPropagate(tid) {
  // For in-progress full recompute: propagate winners for all matches
  const matchesCol = db.collection(`tournaments/${tid}/matches`);
  const snap = await matchesCol.get();
  const mids = snap.docs.map(d => d.id);
  return propagateFrom(tid, mids);
}

async function recalculateBracket({ tournamentId, events }) {
  const now = Date.now();
  const tour = await getTournament(tournamentId);
  const status = tour.status || tour.phase || tour.stage;

  const scope = classifyScope({ status, events });

  let details = {};
  if (scope.type === 'seeding') {
    const participants = await listParticipants(tournamentId);
    if (participants.length) {
      details = await writeInitialBracket(tournamentId, participants);
      // After creating initial matches, auto-propagate winners from byes
      await globalPropagate(tournamentId);
    } else {
      details = { createdMatches: 0, note: 'No participants found for seeding' };
    }
  } else if (scope.type === 'partial') {
    const res = await propagateFrom(tournamentId, scope.fromMatchIds || []);
    details = { propagated: res.propagated };
  } else if (scope.type === 'full') {
    // If pre-start, treat as seeding rebuild; else propagate across bracket
    if (status === 'NOT_STARTED' || status === 'SETUP' || status === undefined) {
      const participants = await listParticipants(tournamentId);
      if (participants.length) {
        details = await writeInitialBracket(tournamentId, participants);
        await globalPropagate(tournamentId);
      } else {
        details = { createdMatches: 0, note: 'No participants found for full-prestart' };
      }
    } else {
      const res = await globalPropagate(tournamentId);
      details = { propagated: res.propagated };
    }
  }

  // Persist metadata for observability
  const derivedRef = db.doc(`tournaments/${tournamentId}/derived/bracket`);
  await derivedRef.set({
    lastRecalcAt: now,
    processedEventCount: Array.isArray(events) ? events.length : 0,
    sourceEventTypes: (events || []).map(e => e.type).slice(0, 50),
    tournamentId,
    scope,
    details,
    updatedBy: 'recalc',
  }, { merge: true });

  return {
    lastRecalcAt: now,
    processedEventCount: Array.isArray(events) ? events.length : 0,
    sourceEventTypes: (events || []).map(e => e.type).slice(0, 50),
    tournamentId,
    scope,
    ...details,
  };
}

module.exports = { recalculateBracket };
