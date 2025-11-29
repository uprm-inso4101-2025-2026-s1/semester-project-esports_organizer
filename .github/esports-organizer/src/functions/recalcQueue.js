'use strict';

const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Enqueue a recalculation event with simple time-window deduplication by type and optional source id.
 * @param {string} tid
 * @param {{type:string, [key:string]:any}} payload
 * @param {number} dedupeWindowMs - time window to dedupe identical events (by type and source) created very recently
 * @returns {Promise<string>} new event id or existing pending id if deduped
 */
async function enqueueEvent(tid, payload, dedupeWindowMs = 1000) {
  if (!payload || !payload.type) throw new Error('enqueueEvent: missing payload.type');

  // Use a fixed internal doc to host internal subcollections (avoid reserved ids)
  const internalDocPath = `tournaments/${tid}/internal/meta`;
  const queueCol = db.collection(`${internalDocPath}/recalc_queue`);

  // Build a query for recent pending events of same type, optionally same source id
  let qry = queueCol.where('type', '==', payload.type).where('status', '==', 'pending').limit(10);
  if (payload.sourceMatchId) {
    qry = queueCol
      .where('type', '==', payload.type)
      .where('status', '==', 'pending')
      .where('sourceMatchId', '==', payload.sourceMatchId)
      .limit(10);
  }
  if (payload.participantId && !payload.sourceMatchId) {
    qry = queueCol
      .where('type', '==', payload.type)
      .where('status', '==', 'pending')
      .where('participantId', '==', payload.participantId)
      .limit(10);
  }

  const q = await qry.get();
  const now = Date.now();
  const since = now - Math.max(0, dedupeWindowMs);
  const hit = q.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .find(e => (e.createdAt || 0) >= since);

  if (hit) return hit.id; // dedupe hit

  const doc = await queueCol.add({
    ...payload,
    createdAt: now,
    status: 'pending',
    attempts: 0,
  });
  return doc.id;
}

module.exports = { enqueueEvent };
