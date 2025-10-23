import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import admin from 'firebase-admin';
import { execSync } from 'child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:58180';

if (!admin.apps.length) {
  admin.initializeApp({ projectId: 'demo-esports-organizer' });
}

const db = admin.firestore();

before(async () => {
  // Use existing seedEmulator.js (seeds tournaments + matches) to populate data.
  // Resolve the script path relative to this test file so it works regardless of cwd.
  const seedUrl = new URL('../../src/scripts/seedEmulator.js', import.meta.url);
  const seedPath = fileURLToPath(seedUrl);
  execSync(`node "${seedPath}"`, { stdio: 'inherit' });
});

test('seeded tournament exists', async () => {
  const doc = await db.doc('tournaments/tourn_demo_1').get();
  assert.equal(doc.exists, true);
  const data = doc.data();
  assert.equal(data.name, 'Demo Tournament');
});

test('seeded matches have expected statuses', async () => {
  const m1 = await db.doc('tournaments/tourn_demo_1/matches/m1').get();
  const m2 = await db.doc('tournaments/tourn_demo_1/matches/m2').get();
  const m3 = await db.doc('tournaments/tourn_demo_1/matches/m3').get();
  assert.equal(m1.exists, true);
  assert.equal(m2.exists, true);
  assert.equal(m3.exists, true);
  const s1 = m1.data().status;
  const s2 = m2.data().status;
  const s3 = m3.data().status;
  assert.equal(s1, 'PENDING');
  assert.equal(s2, 'IN_PROGRESS');
  assert.equal(s3, 'PENDING');
});

test('creating notification on join (simulated)', async () => {
  // Simulation of client behavior: add an attendee and create a notification
  await db.doc('tournaments/tourn_demo_1/attendees/testUser').set({ userId: 'testUser', joinedAt: Date.now() });
  await db.collection('notifications').add({ title: 'Reminder', body: 'You joined tourn_demo_1', createdAt: Date.now(), type: 'reminder' });

  const q = await db.collection('notifications').where('title', '==', 'Reminder').get();
  assert.ok(q.size >= 1);
});
