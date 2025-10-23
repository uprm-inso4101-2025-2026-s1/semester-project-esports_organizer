'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { enqueueEvent } = require('./recalcQueue');

if (!admin.apps.length) {
  admin.initializeApp();
}

exports.onSeedingWrite = functions.firestore
  .document('tournaments/{tid}/seeding/{sid}')
  .onWrite(async (_change, context) => {
    const { tid } = context.params;
    await enqueueEvent(tid, { type: 'SeedingUpdated' });
    return null;
  });
