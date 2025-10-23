"use strict";

// Idempotent seed script for E2E demo data (tournaments, matches, events, notifications)
import admin from 'firebase-admin';

process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:58180';

if (!admin.apps.length) {
	admin.initializeApp({ projectId: 'demo-esports-organizer' });
}

const db = admin.firestore();

export async function seedDemoE2E() {
	// Tournament + matches (similar pattern to existing seedEmulator.js)
	const tid = 'tourn_demo_e2e_1';
	const tRef = db.doc(`tournaments/${tid}`);
	await tRef.set({ name: 'Demo E2E Tournament', createdAt: Date.now() }, { merge: true });

	await db.doc(`tournaments/${tid}/matches/m1`).set({ status: 'PENDING', teamA: 'Alpha', teamB: 'Bravo' });
	await db.doc(`tournaments/${tid}/matches/m2`).set({ status: 'IN_PROGRESS', teamA: 'Charlie', teamB: 'Delta' });

	// Events (top-level collection) — ids are fixed so the script is idempotent
	const now = Date.now();
	const oneDay = 1000 * 60 * 60 * 24;
	const future = now + oneDay;
	const past = now - oneDay;

	await db.doc('events/event_demo_1').set({
		title: 'Demo Event Open',
		date: future,
		capacity: 5,
		status: 'ACTIVE',
		createdAt: Date.now()
	}, { merge: true });

	await db.doc('events/event_demo_full').set({
		title: 'Demo Event Full',
		date: future,
		capacity: 1,
		status: 'ACTIVE',
		createdAt: Date.now()
	}, { merge: true });

	await db.doc('events/event_demo_past').set({
		title: 'Demo Event Past',
		date: past,
		capacity: 5,
		status: 'ACTIVE',
		createdAt: Date.now()
	}, { merge: true });

	await db.doc('events/event_demo_canceled').set({
		title: 'Demo Event Canceled',
		date: future,
		capacity: 5,
		status: 'CANCELED',
		createdAt: Date.now()
	}, { merge: true });

	// Fill the "full" event's attendees to match capacity
	await db.doc('events/event_demo_full/attendees/user1').set({ userId: 'user1', joinedAt: Date.now() });

	// Optional demo notification (client-side notifications are expected)
	await db.doc('notifications/demo_notification_1').set({
		title: 'Demo Notice',
		body: 'This is a seeded demo notification',
		type: 'info',
		createdAt: Date.now()
	}, { merge: true });

	return { tournamentId: tid };
}

// Run when executed directly
if (process.argv[1] && process.argv[1].endsWith('seedDemoE2E.js')) {
	seedDemoE2E().then(() => {
		console.log('seedDemoE2E complete');
		process.exit(0);
	}).catch((e) => {
		console.error('seedDemoE2E failed', e);
		process.exit(1);
	});
}
