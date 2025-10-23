'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { enqueueEvent } = require('./recalcQueue');

if (!admin.apps.length) {
  admin.initializeApp();
}

// Participant events
exports.onParticipantAdded = functions.firestore
  .document('tournaments/{tid}/participants/{pid}')
  .onCreate(async (_snap, context) => {
    const { tid, pid } = context.params;
    await enqueueEvent(tid, { type: 'ParticipantAdded', participantId: pid });
    return null;
  });

exports.onParticipantRemoved = functions.firestore
  .document('tournaments/{tid}/participants/{pid}')
  .onDelete(async (_snap, context) => {
    const { tid, pid } = context.params;
    await enqueueEvent(tid, { type: 'ParticipantRemoved', participantId: pid });
    return null;
  });

exports.onParticipantUpdated = functions.firestore
  .document('tournaments/{tid}/participants/{pid}')
  .onUpdate(async (change, context) => {
    const { tid, pid } = context.params;
    const before = change.before.data() || {};
    const after = change.after.data() || {};

    // Seeding change
    if (before.seed !== after.seed) {
      await enqueueEvent(tid, { type: 'SeedingUpdated', participantId: pid });
    }

    // Replacement detection: if identity fields change
    const idKeys = ['participantId', 'teamId', 'userId', 'name'];
    const replaced = idKeys.some(k => (before?.[k] ?? null) !== (after?.[k] ?? null));
    if (replaced) {
      await enqueueEvent(tid, { type: 'ParticipantReplaced', participantId: pid });
    }

    return null;
  });

