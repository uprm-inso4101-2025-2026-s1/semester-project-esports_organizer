'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

async function enqueueForceRecalc(tid, commandId, reason) {
  const queueCol = db.collection(`tournaments/${tid}/internal/meta/recalc_queue`);
  const doc = await queueCol.add({
    type: 'AdminForceRecalculate',
    commandId,
    reason: reason || 'admin_command',
    createdAt: Date.now(),
    status: 'pending'
  });
  return doc.id;
}

const onAdminCommand = functions.firestore
  .document('tournaments/{tid}/internal/admin_commands/{cid}')
  .onCreate(async (snap, context) => {
    const { tid, cid } = context.params;
    const data = snap.data() || {};
    const cmdType = data.type;

    if (!cmdType) {
      console.log(`[onAdminCommand] Ignoring command ${cid} for ${tid}: missing type`);
      return null;
    }

    if (cmdType === 'ForceRecalc' || cmdType === 'AdminForceRecalculate') {
      try {
        const eventId = await enqueueForceRecalc(tid, cid, data.reason);
        console.log(`[onAdminCommand] Enqueued AdminForceRecalculate event ${eventId} for tournament ${tid} (command ${cid}).`);
      } catch (err) {
        console.error('[onAdminCommand] Failed to enqueue force recalc event', err);
        throw err;
      }
    } else {
      console.log(`[onAdminCommand] Unhandled command type '${cmdType}' for ${tid}`);
    }

    return null;
  });

module.exports = { onAdminCommand, _enqueueForceRecalc: enqueueForceRecalc };
