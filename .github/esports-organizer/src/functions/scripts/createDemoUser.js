"use strict";

const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp();
}

async function sleep(ms){ return new Promise(r=>setTimeout(r, ms)); }

async function main(){
  const uid = 'demo_user_1';
  const user = {
    Email: 'demo+verify@example.com',
    DisplayName: 'Demo User',
    createdAt: Date.now()
  };

  console.log('[createDemoUser] Writing user doc', uid);
  await admin.firestore().collection('User').doc(uid).set(user, { merge: true });

  // Poll for verificationToken set by the function
  const docRef = admin.firestore().collection('User').doc(uid);
  const timeout = Date.now() + 20000; // 20s
  while (Date.now() < timeout) {
    const snap = await docRef.get();
    const data = snap.exists ? snap.data() : null;
    if (data && data.verificationToken) {
      console.log('[createDemoUser] Found verificationToken on user:', data.verificationToken.slice(0,24) + '...');
      console.log('[createDemoUser] verificationExpires:', data.verificationExpires);
      return;
    }
    console.log('[createDemoUser] waiting for verificationToken...');
    await sleep(1000);
  }

  console.error('[createDemoUser] timed out waiting for verificationToken');
  process.exit(2);
}

main().catch(err=>{ console.error(err); process.exit(1); });
