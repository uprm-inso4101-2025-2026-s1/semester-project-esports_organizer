"use strict";

const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp();
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const db = admin.firestore();
  
  // Create a test admin user first
  const adminUid = 'test_admin_1';
  console.log('[feedbackTest] Creating test admin user...');
  await db.collection('User').doc(adminUid).set({
    Email: 'admin@example.com',
    Username: 'TestAdmin',
    role: {
      type: 'Admin',
      permissions: {}
    }
  }, { merge: true });
  console.log('[feedbackTest] Admin user created:', adminUid);

  // Submit test feedback
  const feedbackData = {
    topic: 'Notifications',
    category: 'Not timely',
    comment: 'The notification reminders are coming too late. I missed my event by 5 minutes!',
    email: 'user@example.com'
  };

  console.log('[feedbackTest] Submitting test feedback...');
  const feedbackRef = await db.collection('Feedback').add({
    ...feedbackData,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
  console.log('[feedbackTest] Feedback submitted with ID:', feedbackRef.id);

  // Poll for in-app notification on admin
  console.log('[feedbackTest] Polling for in-app notification...');
  const timeout = Date.now() + 20000; // 20s
  let found = false;
  while (Date.now() < timeout) {
    const notifSnapshot = await db
      .collection('User')
      .doc(adminUid)
      .collection('Notifications')
      .where('type', '==', 'feedback')
      .where('feedbackId', '==', feedbackRef.id)
      .get();
    
    if (!notifSnapshot.empty) {
      const notifDoc = notifSnapshot.docs[0].data();
      console.log('[feedbackTest] In-app notification found!');
      console.log('  - Sender:', notifDoc.senderUsername);
      console.log('  - Topic:', notifDoc.topic);
      console.log('  - Category:', notifDoc.category);
      console.log('  - Comment:', notifDoc.comment);
      found = true;
      break;
    }
    console.log('[feedbackTest] Waiting for in-app notification...');
    await sleep(1000);
  }

  if (!found) {
    console.error('[feedbackTest] Timed out waiting for in-app notification');
    process.exit(1);
  }

  console.log('[feedbackTest] Test completed successfully!');
  process.exit(0);
}

main().catch(err => {
  console.error('[feedbackTest] Error:', err);
  process.exit(1);
});
