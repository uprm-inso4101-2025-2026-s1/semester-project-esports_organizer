'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { enqueueEvent } = require('./recalcQueue');

if (!admin.apps.length) {
  admin.initializeApp();
}

//const db = admin.firestore();

function statusOf(doc) {
  return doc && (doc.status || doc.state || doc.matchStatus);
}

function isTransitionToFinal(before, after) {
  const beforeStatus = statusOf(before);
  const afterStatus = statusOf(after);
  return afterStatus === 'FINAL' && beforeStatus !== 'FINAL';
}

function isTransitionFromFinal(before, after) {
  const beforeStatus = statusOf(before);
  const afterStatus = statusOf(after);
  return beforeStatus === 'FINAL' && afterStatus !== 'FINAL';
}

function isReported(before, after) {
  // Consider a match reported if scores or winner are set for the first time or status enters REPORTED/FINAL
  const beforeStatus = statusOf(before);
  const afterStatus = statusOf(after);
  if (afterStatus === 'REPORTED' && beforeStatus !== 'REPORTED') return true;
  if (isTransitionToFinal(before, after)) return true;
  const beforeWinner = before && (before.winnerId || before.winner);
  const afterWinner = after && (after.winnerId || after.winner);
  return !beforeWinner && !!afterWinner;
}

function isCorrection(before, after) {
  // Treat as correction if still FINAL but scores or winner changed
  const beforeStatus = statusOf(before);
  const afterStatus = statusOf(after);
  if (beforeStatus === 'FINAL' && afterStatus === 'FINAL') {
    const keys = ['winnerId', 'winner', 'scoreA', 'scoreB', 'games'];
    return keys.some(k => JSON.stringify(before?.[k]) !== JSON.stringify(after?.[k]));
  }
  return false;
}

exports.onMatchFinalized = functions.firestore
  .document('tournaments/{tid}/matches/{mid}')
  .onUpdate(async (change, context) => {
    const { tid, mid } = context.params;
    const before = change.before.data() || {};
    const after = change.after.data() || {};

    try {
      if (isTransitionToFinal(before, after)) {
        await enqueueEvent(tid, { type: 'MatchFinalized', sourceMatchId: mid });
        console.log(`[onMatchUpdated] Enqueued MatchFinalized for ${tid}/${mid}`);
      } else if (isTransitionFromFinal(before, after)) {
        await enqueueEvent(tid, { type: 'MatchReverted', sourceMatchId: mid });
        console.log(`[onMatchUpdated] Enqueued MatchReverted for ${tid}/${mid}`);
      } else if (isCorrection(before, after)) {
        await enqueueEvent(tid, { type: 'MatchCorrected', sourceMatchId: mid });
        console.log(`[onMatchUpdated] Enqueued MatchCorrected for ${tid}/${mid}`);
      } else if (isReported(before, after)) {
        await enqueueEvent(tid, { type: 'MatchReported', sourceMatchId: mid });
        console.log(`[onMatchUpdated] Enqueued MatchReported for ${tid}/${mid}`);
      } else {
        // No-op for non-impactful changes
      }
    } catch (err) {
      console.error('[onMatchUpdated] Failed to enqueue event', err);
      throw err;
    }

    return null;
  });

exports._isTransitionToFinal = isTransitionToFinal;
exports._isTransitionFromFinal = isTransitionFromFinal;
exports._isReported = isReported;
exports._isCorrection = isCorrection;
