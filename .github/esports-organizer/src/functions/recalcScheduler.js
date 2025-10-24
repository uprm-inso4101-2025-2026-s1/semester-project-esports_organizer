'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { recalculateBracket } = require('./recalc');

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

async function acquireLock(tid) {
  const lockRef = db.doc(`tournaments/${tid}/internal/recalc_lock`);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(lockRef);
    if (snap.exists) return false;
    tx.set(lockRef, { createdAt: Date.now(), reason: 'queue', pid: process.pid });
    return true;
  });
}

async function releaseLock(tid) {
  try { await db.doc(`tournaments/${tid}/internal/recalc_lock`).delete(); } catch { /* ignore */ }
}

async function fetchPendingEvents(tid, limit = 25) {
  const col = db.collection(`tournaments/${tid}/internal/meta/recalc_queue`);
  const snap = await col.where('status', '==', 'pending').get();
  const now = Date.now();
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(e => !e.nextAttemptAt || e.nextAttemptAt <= now)
    .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))
    .slice(0, limit);
}

async function markEvents(tid, events, status, extra = {}) {
  const batch = db.batch();
  events.forEach(ev => {
    const ref = db.doc(`tournaments/${tid}/internal/meta/recalc_queue/${ev.id}`);
    batch.set(ref, { status, updatedAt: Date.now(), ...extra }, { merge: true });
  });
  await batch.commit();
}

function computeBackoffMs(attempts) {
  const base = 500; // ms
  const cap = 30000; // 30s
  const exp = Math.min(cap, base * Math.pow(2, Math.max(0, attempts)));
  const jitter = Math.floor(Math.random() * 250);
  return Math.min(cap, exp + jitter);
}

async function writeAlert(tid, payload) {
  const alerts = db.collection(`tournaments/${tid}/internal/alerts`);
  await alerts.add({
    type: 'RecalcFailed',
    createdAt: Date.now(),
    severity: 'error',
    ...payload,
  });
}

async function processQueue(tid) {
  const gotLock = await acquireLock(tid);
  if (!gotLock) {
    console.log(`[recalcScheduler] Lock busy for ${tid}, skipping.`);
    return null;
  }

  let processingEvents = [];
  try {
    const events = await fetchPendingEvents(tid, 50);
    if (!events.length) {
      console.log(`[recalcScheduler] No pending events for ${tid}.`);
      return null;
    }
    await markEvents(tid, events, 'processing');
    processingEvents = events;

    const result = await Promise.resolve(recalculateBracket({ tournamentId: tid, events }));
    const derivedRef = db.doc(`tournaments/${tid}/derived/bracket`);
    await derivedRef.set({
      lastRecalcAt: result.lastRecalcAt,
      processedEventCount: result.processedEventCount,
      sourceEventTypes: result.sourceEventTypes,
      scope: result.scope,
      updatedBy: 'queueScheduler',
    }, { merge: true });

    await markEvents(tid, events, 'done');
    console.log(`[recalcScheduler] Recalculated ${tid} with ${events.length} events.`);
  } catch (err) {
    console.error('[recalcScheduler] Error processing queue', err);
    // Retry with backoff or mark error if too many attempts
    const col = db.collection(`tournaments/${tid}/internal/meta/recalc_queue`);
    const now = Date.now();
    const batch = db.batch();
    const events = processingEvents; // reschedule the ones we set to processing
    if (events.length) {
      for (const ev of events) {
        const ref = col.doc(ev.id);
        const attempts = (ev.attempts || 0) + 1;
        if (attempts >= 5) {
          batch.set(ref, {
            status: 'error',
            attempts,
            lastError: String(err && (err.message || err)),
            updatedAt: now,
          }, { merge: true });
          await writeAlert(tid, { message: 'Bracket recalculation failed after retries', eventId: ev.id, types: ev.type });
        } else {
          const delay = computeBackoffMs(attempts);
          const next = now + delay;
          batch.set(ref, {
            status: 'pending',
            attempts,
            nextAttemptAt: next,
            lastError: String(err && (err.message || err)),
            updatedAt: now,
          }, { merge: true });
        }
      }
      await batch.commit();
      console.log(`[recalcScheduler] Rescheduled/errored ${events.length} events for ${tid}.`);
    }
  } finally {
    await releaseLock(tid);
  }
  return null;
}

exports.onRecalcQueueUpdate = functions.firestore
  .document('tournaments/{tid}/internal/meta/recalc_queue/{eid}')
  .onCreate(async (_snap, context) => {
    const { tid } = context.params;
    // Debounce slightly: allow small burst accumulation
    await new Promise(r => setTimeout(r, 150));
    return processQueue(tid);
  });

exports.onRecalcQueueTouch = functions.firestore
  .document('tournaments/{tid}/internal/meta/recalc_queue/{eid}')
  .onUpdate(async (change, context) => {
    const { tid } = context.params;
    const after = change.after.data() || {};
    if (after.status !== 'pending') return null;
    const now = Date.now();
    if (after.nextAttemptAt && after.nextAttemptAt > now) {
      // Not due yet
      return null;
    }
    // slight debounce
    await new Promise(r => setTimeout(r, 100));
    return processQueue(tid);
  });

exports.cronRecalcDrain = functions.pubsub.schedule('every 1 minutes').onRun(async () => {
  const now = Date.now();
  // Find due pending events across tournaments and process by tournament id
  const snap = await db.collectionGroup('recalc_queue')
    .where('status', '==', 'pending')
    .limit(25)
    .get();

  const byTid = new Map();
  snap.docs.forEach(doc => {
    const data = doc.data() || {};
    if (data.nextAttemptAt && data.nextAttemptAt > now) return; // not due
    const path = doc.ref.path; // e.g., tournaments/{tid}/internal/__meta__/recalc_queue/{eid}
    const parts = path.split('/');
    const tidIdx = parts.indexOf('tournaments') + 1;
    const tid = parts[tidIdx];
    if (tid) byTid.set(tid, true);
  });

  const tids = Array.from(byTid.keys());
  for (const tid of tids) {
    try {
      await processQueue(tid);
    } catch (e) {
      console.error(`[cronRecalcDrain] Failed processing ${tid}`, e);
    }
  }
  return null;
});

// Expose for tests
exports._processQueue = processQueue;
