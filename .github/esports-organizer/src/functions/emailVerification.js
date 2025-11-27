"use strict";

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
const path = require('path');

// FieldValue helper (some admin SDK versions expose FieldValue differently)
const FieldValue = admin.firestore?.FieldValue || require('firebase-admin').firestore.FieldValue;

if (!admin.apps.length) {
  admin.initializeApp();
}

const USERS_COLLECTION = 'User';
const JWT_SECRET = process.env.EMAIL_VERIFICATION_SECRET || functions.config().app?.email_verification_secret || 'dev-secret-change-me';
const TOKEN_EXP_HOURS = 24;

/**
 * Firestore onCreate trigger for new users.
 * Generates a short-lived JWT, stores it on the user doc, and sends a verification email.
 */
exports.onUserCreated = functions.firestore
  .document(`${USERS_COLLECTION}/{uid}`)
  .onCreate(async (snap, context) => {
    const user = snap.data();
    const uid = context.params.uid;

    // Create token payload
    const token = jwt.sign({ uid, email: user.Email }, JWT_SECRET, { expiresIn: `${TOKEN_EXP_HOURS}h` });
    const expiresAt = Date.now() + TOKEN_EXP_HOURS * 60 * 60 * 1000;

    // Store token + expiry on user doc
    try {
      await admin.firestore().collection(USERS_COLLECTION).doc(uid).set({
        verificationToken: token,
        verificationExpires: expiresAt,
      }, { merge: true });
    } catch (err) {
      console.error('[emailVerification] Error writing token to user doc', err);
    }

    // Construct verification URL
    const base = process.env.VERIFY_BASE_URL || functions.config().app?.verify_base_url || 'http://localhost:5173';
    const verifyUrl = `${base.replace(/\/$/, '')}/verify-email?token=${encodeURIComponent(token)}`;

    // Attempt to load the project's email adapter (ESM) dynamically and send templated email if available.
    try {
      const adapterPath = path.join(__dirname, '..', 'emailnotifs', 'adapters', 'emailAdapter.js');
      const adapter = await import('file://' + adapterPath);
      if (adapter && typeof adapter.sendTemplatedEmail === 'function') {
        await adapter.sendTemplatedEmail({
          to: user.Email,
          subject: 'Please verify your email',
          template: 'verify-email',
          context: { recipientName: user.DisplayName || user.Email, verifyUrl, appName: 'Esports Organizer' }
        });
        console.log('[emailVerification] Verification email dispatched to', user.Email);
      } else {
        console.warn('[emailVerification] email adapter found but no sendTemplatedEmail export');
        console.log('[emailVerification] Verify link:', verifyUrl);
      }
    } catch (err) {
      // Fall back to logging the verification URL so it can be used during tests/emulator runs
      console.warn('[emailVerification] Could not import email adapter, skipping send:', err?.message || err);
      console.log('[emailVerification] Verify link (fallback):', verifyUrl);
    }

    return null;
  });


/**
 * HTTPS endpoint to verify an emailed token.
 * Expects `?token=...` as a query parameter.
 */
exports.verifyEmail = functions.https.onRequest(async (req, res) => {
  const token = req.query.token || req.body.token;
  if (!token) {
    res.status(400).send('Missing token');
    return;
  }

  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    console.warn('[emailVerification] Token verify failed', err?.message || err);
    // Redirect to frontend with failure
    const failUrl = (process.env.VERIFY_BASE_URL || functions.config().app?.verify_base_url || 'http://localhost:5173') + '/verify-email?status=failed';
    res.redirect(302, failUrl);
    return;
  }

  const uid = payload.uid;
  if (!uid) {
    res.status(400).send('Invalid token payload');
    return;
  }

  try {
    const docRef = admin.firestore().collection(USERS_COLLECTION).doc(uid);
    const doc = await docRef.get();
    if (!doc.exists) {
      res.status(404).send('User not found');
      return;
    }

    const data = doc.data();
    if (!data.verificationToken || data.verificationToken !== token) {
      const failUrl = (process.env.VERIFY_BASE_URL || functions.config().app?.verify_base_url || 'http://localhost:5173') + '/verify-email?status=failed';
      res.redirect(302, failUrl);
      return;
    }

    // Check expiry
    if (data.verificationExpires && Date.now() > data.verificationExpires) {
      const failUrl = (process.env.VERIFY_BASE_URL || functions.config().app?.verify_base_url || 'http://localhost:5173') + '/verify-email?status=expired';
      res.redirect(302, failUrl);
      return;
    }

    // Mark user as verified and clear token fields
    await docRef.set({ emailVerified: true, verificationToken: null, verificationExpires: null }, { merge: true });

    const successUrl = (process.env.VERIFY_BASE_URL || functions.config().app?.verify_base_url || 'http://localhost:5173') + '/verify-email?status=success';
    res.redirect(302, successUrl);
  } catch (err) {
    console.error('[emailVerification] Error verifying token', err);
    res.status(500).send('Internal error');
  }
});
