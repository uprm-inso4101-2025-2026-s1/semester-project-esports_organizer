"use strict";

const admin = require('firebase-admin');
const fetch = globalThis.fetch || require('node-fetch');

if (!admin.apps.length) {
  admin.initializeApp();
}

async function sleep(ms){ return new Promise(r=>setTimeout(r, ms)); }

async function main(){
  const uid = 'demo_user_2';
  const user = {
    Email: 'demo+verify2@example.com',
    DisplayName: 'Demo User 2',
    createdAt: Date.now()
  };

  console.log('[createAndVerifyUser] Writing user doc', uid);
  await admin.firestore().collection('User').doc(uid).set(user, { merge: true });

  const docRef = admin.firestore().collection('User').doc(uid);

  // Poll for verificationToken
  const timeout = Date.now() + 20000;
  let token;
  while (Date.now() < timeout) {
    const snap = await docRef.get();
    const data = snap.exists ? snap.data() : null;
    if (data && data.verificationToken) { token = data.verificationToken; break; }
    console.log('[createAndVerifyUser] waiting for verificationToken...');
    await sleep(1000);
  }

  if (!token) { console.error('[createAndVerifyUser] no token found'); process.exit(2); }
  console.log('[createAndVerifyUser] got token, calling verify endpoint');

  const verifyUrl = `http://127.0.0.1:5002/demo-esports-organizer/us-central1/verifyEmail?token=${encodeURIComponent(token)}`;
  console.log('[createAndVerifyUser] verifyUrl:', verifyUrl);

  // Call the verify endpoint
  const resp = await fetch(verifyUrl, { method: 'GET', redirect: 'manual' });
  console.log('[createAndVerifyUser] verify endpoint status:', resp.status, 'location:', resp.headers.get('location'));

  // Poll for emailVerified
  const verifyTimeout = Date.now() + 10000;
  while (Date.now() < verifyTimeout) {
    const snap = await docRef.get();
    const data = snap.exists ? snap.data() : null;
    if (data && data.emailVerified) { console.log('[createAndVerifyUser] emailVerified = true'); return; }
    console.log('[createAndVerifyUser] waiting for emailVerified...');
    await sleep(1000);
  }

  console.error('[createAndVerifyUser] timed out waiting for emailVerified');
  process.exit(3);
}

main().catch(err=>{ console.error(err); process.exit(1); });
