'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { recalculateBracket } = require('./recalc');

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

function isTransitionToFinal(before, after) {
  const beforeStatus = before && before.status;
  const afterStatus = after && after.status;
  return afterStatus === 'FINAL' && beforeStatus !== 'FINAL';
}

exports.onMatchFinalized = functions.firestore
  .document('tournaments/{tid}/matches/{mid}')
  .onUpdate(async (change, context) => {
    const { tid, mid } = context.params;
    const before = change.before.data() || {};
    const after = change.after.data() || {};

    if (!isTransitionToFinal(before, after)) {
      return null;
    }

    const lockRef = db.doc(`tournaments/${tid}/internal/recalc_lock`);

    // Best-effort lock via transaction to reduce duplicates
    const acquired = await db.runTransaction(async (tx) => {
      const snap = await tx.get(lockRef);
      if (snap.exists) return false;
      tx.set(lockRef, {
        reason: 'onMatchFinalized',
        matchId: mid,
        // Avoid admin.firestore.Timestamp in emulator; use a numeric epoch instead
        createdAt: Date.now(),
      });
      return true;
    });

    if (!acquired) {
      console.log(`[onMatchFinalized] Lock held for tournament ${tid}; skipping.`);
      return null;
    }

    try {
      const result = recalculateBracket({ tournamentId: tid, matchId: mid, match: after });
      const derivedRef = db.doc(`tournaments/${tid}/derived/bracket`);
      await derivedRef.set(
        {
          lastRecalcAt: result.lastRecalcAt,
          sourceMatchId: result.sourceMatchId,
          updatedBy: 'onMatchFinalized',
        },
        { merge: true }
      );
      console.log(`[onMatchFinalized] Derived doc updated for tournament ${tid}`);
    } catch (err) {
      console.error('[onMatchFinalized] Error during placeholder recalc/write', err);
      throw err;
    } finally {
      await lockRef.delete().catch((e) => console.warn('Failed to release lock', e));
    }

    return null;
  });

exports._isTransitionToFinal = isTransitionToFinal;
