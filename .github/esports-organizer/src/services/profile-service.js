import { db } from '../lib/firebase.js';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

/**
* @param {Object} profileData
* @param {string} profileData.Email
* @param {string} profileData.name
* @param {string} profileData.photoUrl
* @param {string} profileData.Role
*/
export async function saveProfile(profileData) {
 if (!profileData.Email || !profileData.Password || !profileData.Question || !profileData.Answer) {
   throw new Error('Required fields: Email, Password, Question, Answer');
 }
 const Email = String(profileData.Email).trim().toLowerCase();


 const q = query(collection(db, 'User'), where('Email', '==', Email));
 const existing = await getDocs(q);
 if (!existing.empty) {
   return { success: false, error: "User with this email already exists." };
 }


 const uniqueId = uuidv4().slice(0, 8);
 const ref = doc(db, 'User', uniqueId);


 await setDoc(ref, {
   uid: uniqueId,
   Email,
   Password: profileData.Password,
   Question: profileData.Question,
   Answer: profileData.Answer,
   teamId: null,
   createdAt: serverTimestamp(),
   participatedEvents: [],
 });

 localStorage.setItem("currentUserUid", uniqueId);
 return { success: true, uid: uniqueId };
}


/**
* @param {string} uid
*/
export async function getProfileById(uid) {
 const ref = doc(db, 'User', uid);
 const snap = await getDoc(ref);
 if (!snap.exists()) {
   return null;
 }
 return snap.data();
}


/**
* @param {string} Email
* @param {Object} updates
*/
export async function updateProfileByEmail(Email, updates, currentUserRole = 'player') {
 if (!Email) return { success: false, error: 'Email is required.' };
 if (!updates || typeof updates !== 'object') {
   return { success: false, error: 'Invalid update data.' };
 }


 const q = query(collection(db, 'User'), where('Email', '==', Email.trim().toLowerCase()));
 const results = await getDocs(q);


 if (results.empty) {
   return { success: false, error: 'Profile not found.' };
 }


 const ref = results.docs[0].ref;
 const currentData = results.docs[0].data();


 const fieldsToUpdate = {};
 for (const key in updates) {
   if (updates[key] !== currentData[key]) {
     fieldsToUpdate[key] = updates[key];
   }
 }


 if ('Role' in updates && updates.Role !== currentData.Role) {
   if (currentUserRole !== 'admin') {
     delete updates.Role;
     return { success: false, error: 'Unauthorized: only admins can change roles.' }
   }
 }


 if (Object.keys(fieldsToUpdate).length === 0) {
   return { success: false, message: 'No changes to apply.' };
 }


 await updateDoc(ref, {
   ...fieldsToUpdate,
   updatedAt: serverTimestamp(),
 });
 return { success: true, updated: fieldsToUpdate };


}


/**
* @param {string} uid
* @param {Object} updateData
*/
export async function updatePlayerProfile(uid, updateData) {
 if (!uid) return { success: false, error: 'ID is required.' };
 if (!updateData || typeof updateData !== 'object') {
   return { success: false, error: 'Invalid' };
 }


 const ref = doc(db, 'User', uid);
 const snap = await getDoc(ref);


 if (!snap.exists()) {
   return { success: false, error: 'Profile not found.' };
 }


 const currentData = snap.data();
 const fieldsToUpdate = {};


 for (const key in updateData) {
   if (updateData[key] !== currentData[key]) {
     fieldsToUpdate[key] = updateData[key];
   }
 }
 if (Object.keys(fieldsToUpdate).length === 0) {
   return { success: false, message: 'No changes to apply.' };
 }


 await updateDoc(ref, {
   ...fieldsToUpdate,
   updatedAt: serverTimestamp(),
 });


 return { success: true, updated: fieldsToUpdate };
}


/**
* @param {string} uid
* @param {string} currentUserRole
*/
export async function deleteProfile(uid, currentUserRole = 'player') {
 if (!uid) return { success: false, error: "Profile ID is required." };


 if (currentUserRole !== 'admin') {
   return { success: false, error: "Unauthorized" };
 }


 const ref = doc(db, 'User', uid);
 const snap = await getDoc(ref);


 if (!snap.exists()) {
   return { success: false, error: "Profile not found." };
 }
 await deleteDoc(ref);
 return { success: true, message: "Profile deleted successfully." };
}


/**
* Add an event to a user's participated events list
* @param {string} uid - User ID
* @param {string} eventId - Event ID
* @param {string} eventTitle - Event title
* @returns {Promise<Object>} Result object with success status
*/
export async function addEventToUserProfile(uid, eventId, eventTitle) {
 if (!uid || !eventId || !eventTitle) {
   console.error("addEventToUserProfile - Missing required params. uid:", uid, "eventId:", eventId, "eventTitle:", eventTitle);
   return { success: false, error: 'uid, eventId, and eventTitle are required.' };
 }

 try {
   console.log("addEventToUserProfile - Starting. uid:", uid, "eventId:", eventId, "eventTitle:", eventTitle);
   const ref = doc(db, 'User', uid);
   const snap = await getDoc(ref);

   if (!snap.exists()) {
     console.error("addEventToUserProfile - Profile not found for uid:", uid);
     return { success: false, error: 'Profile not found.' };
   }

   const currentData = snap.data();
   console.log("addEventToUserProfile - Current user data:", currentData);
   
   const participatedEvents = currentData.participatedEvents || [];
   console.log("addEventToUserProfile - Current participatedEvents:", participatedEvents);

   // Check if user already joined this event
   if (participatedEvents.some(event => event.id === eventId)) {
     console.warn("addEventToUserProfile - User already joined this event. eventId:", eventId);
     return { success: false, message: 'User already joined this event.' };
   }

   // Add new event to the list
   const newEvent = {
     id: eventId,
     title: eventTitle
   };
   participatedEvents.push(newEvent);
   console.log("addEventToUserProfile - New event object:", newEvent);
   console.log("addEventToUserProfile - Updated participatedEvents array:", participatedEvents);

   await updateDoc(ref, {
     participatedEvents,
     updatedAt: serverTimestamp()
   });
   
   console.log("addEventToUserProfile - Successfully updated Firestore. uid:", uid, "eventId:", eventId);
   return { success: true, message: 'Event added to user profile.' };
 } catch (error) {
   console.error("addEventToUserProfile - Error:", error);
   return { success: false, error: error.message };
 }
}


/**
* Get all events a user has participated in
* @param {string} uid - User ID
* @returns {Promise<Array>} Array of participated events
*/
export async function getUserParticipatedEvents(uid) {
 if (!uid) {
   console.error("getUserParticipatedEvents - uid is required");
   return { success: false, error: 'uid is required.' };
 }

 try {
   console.log("getUserParticipatedEvents - Fetching for uid:", uid);
   const ref = doc(db, 'User', uid);
   const snap = await getDoc(ref);

   if (!snap.exists()) {
     console.warn("getUserParticipatedEvents - Profile not found for uid:", uid);
     return { success: false, error: 'Profile not found.' };
   }

   const userData = snap.data();
   console.log("getUserParticipatedEvents - User data from Firestore:", userData);
   
   const participatedEvents = userData.participatedEvents || [];
   console.log("getUserParticipatedEvents - Returning events:", participatedEvents);
   
   return { success: true, data: participatedEvents };
 } catch (error) {
   console.error("getUserParticipatedEvents - Error:", error);
   return { success: false, error: error.message };
 }
}


/**
* Remove an event from a user's participated events list
* @param {string} uid - User ID
* @param {string} eventId - Event ID
* @returns {Promise<Object>} Result object with success status
*/
export async function removeEventFromUserProfile(uid, eventId) {
 if (!uid || !eventId) {
   return { success: false, error: 'uid and eventId are required.' };
 }


 try {
   const ref = doc(db, 'User', uid);
   const snap = await getDoc(ref);


   if (!snap.exists()) {
     return { success: false, error: 'Profile not found.' };
   }


   const currentData = snap.data();
   const participatedEvents = (currentData.participatedEvents || []).filter(
     event => event.id !== eventId
   );


   await updateDoc(ref, {
     participatedEvents,
     updatedAt: serverTimestamp()
   });


   return { success: true, message: 'Event removed from user profile.' };
 } catch (error) {
   return { success: false, error: error.message };
 }
}


/**
 * Join a team by setting the user's teamId
 * @param {string} teamId - Team ID to join
 * @returns {Promise<Object>} Result object with success status
 */
export async function joinTeam(teamId, force = false) {
  const uid = localStorage.getItem("currentUserUid");
  if (!uid || !teamId) {
    return { success: false, error: "User ID and team ID are required." };
  }
  const ref = doc(db, 'User', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    return { success: false, error: "Profile not found." };
  }
  const currentData = snap.data();
  if (currentData.teamId && currentData.teamId !== teamId && !force) {
    // User is already in a team, require confirmation
    return {
      success: false,
      confirm: true,
      message: `You are already in a team (${atob(currentData.teamId)}). Are you sure you wanna change?`,
      currentTeamId: currentData.teamId
    };
  }
  await updateDoc(ref, {
    teamId,
    updatedAt: serverTimestamp()
  });
  return { success: true, message: "Joined team successfully.", teamId };
}

/**
 * Leave the current team by setting teamId to null
 * @returns {Promise<Object>} Result object with success status
 */
export async function leaveTeam() {
  const uid = localStorage.getItem("currentUserUid");
  if (!uid) {
    return { success: false, error: "User ID is required." };
  }
  const ref = doc(db, 'User', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    return { success: false, error: "Profile not found." };
  }
  await updateDoc(ref, {
    teamId: null,
    updatedAt: serverTimestamp()
  });
  return { success: true, message: "Left team successfully." };
}
