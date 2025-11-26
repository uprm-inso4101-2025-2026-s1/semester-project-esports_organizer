"use strict";

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const path = require('path');

if (!admin.apps.length) {
  admin.initializeApp();
}

const FEEDBACK_COLLECTION = 'Feedback';
const USERS_COLLECTION = 'User';
const NOTIFICATIONS_COLLECTION = 'Notifications';

/**
 * Firestore onCreate trigger for Feedback collection.
 * When user submits feedback, this function:
 * 1. Retrieves sender username from User doc (by email if available)
 * 2. Constructs a notification message with feedback details
 * 3. Finds all admin users
 * 4. Sends email notification to each admin
 * 5. Creates an in-app notification doc for admins to view
 */
exports.onFeedbackSubmitted = functions.firestore
  .document(`${FEEDBACK_COLLECTION}/{feedbackId}`)
  .onCreate(async (snap, context) => {
    const feedback = snap.data();
    const feedbackId = context.params.feedbackId;

    console.log('[feedbackNotification] Processing feedback:', feedbackId);

    try {
      // Step 1: Retrieve sender username from User collection (by email if available)
      let senderUsername = 'Anonymous';
      if (feedback.email) {
        try {
          const userQuery = await admin.firestore()
            .collection(USERS_COLLECTION)
            .where('Email', '==', feedback.email)
            .limit(1)
            .get();
          if (!userQuery.empty) {
            senderUsername = userQuery.docs[0].data().Username || feedback.email;
          }
        } catch (err) {
          console.warn('[feedbackNotification] Could not find sender by email:', err.message);
        }
      }

      // Step 2: Find all admin users
      let adminEmails = [];
      try {
        const adminQuery = await admin.firestore()
          .collection(USERS_COLLECTION)
          .where('role.type', '==', 'Admin')
          .get();
        adminEmails = adminQuery.docs
          .map(doc => doc.data().Email)
          .filter(email => email); // filter nulls
        console.log('[feedbackNotification] Found admin emails:', adminEmails);
      } catch (err) {
        console.warn('[feedbackNotification] Error querying admins:', err.message);
      }

      // If no admins found, log warning but don't fail (graceful degradation)
      if (adminEmails.length === 0) {
        console.warn('[feedbackNotification] No admin emails found. Storing in notifications collection only.');
      }

      // Step 3: Send email notifications to admins
      if (adminEmails.length > 0) {
        try {
          const adapter = await import('file://' + path.join(__dirname, '..', 'emailnotifs', 'adapters', 'emailAdapter.js'));
          if (adapter && typeof adapter.sendTemplatedEmail === 'function') {
            for (const adminEmail of adminEmails) {
              try {
                await adapter.sendTemplatedEmail({
                  to: adminEmail,
                  subject: `New Feedback: ${feedback.topic || 'General'}`,
                  template: 'feedback-notification',
                  context: {
                    senderUsername,
                    senderEmail: feedback.email || 'Not provided',
                    topic: feedback.topic || 'General',
                    category: feedback.category || 'Other',
                    comment: feedback.comment,
                    feedbackId,
                    timestamp: new Date().toLocaleString(),
                    appName: 'Esports Organizer'
                  }
                });
                console.log('[feedbackNotification] Email sent to', adminEmail);
              } catch (sendErr) {
                console.error('[feedbackNotification] Error sending to', adminEmail, sendErr.message);
              }
            }
          } else {
            console.warn('[feedbackNotification] Adapter sendTemplatedEmail not available');
          }
        } catch (adapterErr) {
          console.warn('[feedbackNotification] Could not import email adapter:', adapterErr.message);
        }
      }

      // Step 4: Create in-app notification doc for each admin
      try {
        const adminQuery = await admin.firestore()
          .collection(USERS_COLLECTION)
          .where('role.type', '==', 'Admin')
          .get();
        
        for (const adminDoc of adminQuery.docs) {
          const adminUid = adminDoc.id;
          const notifRef = admin.firestore()
            .collection(USERS_COLLECTION)
            .doc(adminUid)
            .collection(NOTIFICATIONS_COLLECTION)
            .doc();
          
          await notifRef.set({
            type: 'feedback',
            feedbackId,
            senderUsername,
            senderEmail: feedback.email || 'Not provided',
            topic: feedback.topic || 'General',
            category: feedback.category || 'Other',
            comment: feedback.comment,
            read: false,
            createdAt: new Date()
          });
          console.log('[feedbackNotification] In-app notification created for admin', adminUid);
        }
      } catch (notifErr) {
        console.error('[feedbackNotification] Error creating in-app notifications:', notifErr.message);
      }

      console.log('[feedbackNotification] Feedback notification pipeline completed for', feedbackId);
      return null;
    } catch (err) {
      console.error('[feedbackNotification] Unexpected error:', err);
      throw err;
    }
  });
