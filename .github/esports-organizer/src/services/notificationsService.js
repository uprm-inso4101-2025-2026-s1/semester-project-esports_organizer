// notificationsService.js
import { db } from '../lib/firebase.js';
import { collection, addDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { checkUserPermission } from '../Roles/checkUserPermission.js';

export default class NotificationService {
  constructor(senderUid) {
    if (!senderUid) {
      throw new Error('senderUid is required');
    }
    this.senderUid = senderUid;
  }


  /** Send notification to a single user */
  async sendToUser(targetUid, { title = '', message = '', eventId = null, eventTitle = null }) {
    if (!targetUid) return { success: false, error: 'targetUid required' };

    try {
      const ref = collection(db, 'User', targetUid, 'notifications');
      const docRef = await addDoc(ref, {
        title,
        message,
        eventId,
        eventTitle,
        senderId: this.senderUid,
        createdAt: serverTimestamp(),
        read: false,
      });
      return { success: true, id: docRef.id };
    } catch (err) {
      console.error('sendToUser error:', err);
      return { success: false, error: err.message };
    }
  }

  /** Send notification to all participants of an event */
  async sendToEventParticipants(eventId, { title = '', message = '', eventTitle = null }) {
    if (!eventId) return { success: false, error: 'eventId required' };

    try {
      // Permission check
      const canAdmin = await checkUserPermission(this.senderUid, 'sendNotifications');
      const canManager = await checkUserPermission(this.senderUid, 'canSendNotifications');
      if (!canAdmin && !canManager) {
        return { success: false, error: 'You do not have permission to send notifications' };
      }

      // Get event data
      const eventRef = doc(db, 'events', eventId);
      const eventSnap = await getDoc(eventRef);
      if (!eventSnap.exists()) return { success: false, error: 'Event not found' };

      const eventData = eventSnap.data();
      const participants = Array.isArray(eventData.participants) ? eventData.participants : [];
      const resolvedTitle = eventTitle ?? eventData.title ?? '';

      // Send notification to each participant
      for (const participantUid of participants) {
        await this.sendToUser(participantUid, {
          title,
          message,
          eventId,
          eventTitle: resolvedTitle,
        });
      }

      return { success: true, sentTo: participants.length };
    } catch (err) {
      console.error('sendToEventParticipants error:', err);
      return { success: false, error: err.message };
    }
  }
}
