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
    createdAt: serverTimestamp()
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