import { db } from '../lib/firebase.js';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import {v4 as uuidv4} from 'uuid';

/**
 * @param {Object} profileData 
 * @param {string} profileData.email 
 * @param {string} profileData.name 
 * @param {string} profileData.photoUrl 
 * @param {string} profileData.role 
 */
export async function saveProfile(profileData) {
  if (!profileData.email || !profileData.name || !profileData.role) {
    throw new Error('Obligatory campus missing: email, name or role');
  }
  const email = String(profileData.email).trim().toLowerCase();
  const ref = doc(db, 'profiles', profileData.email);

  const existingSnap = await getDoc(ref);
  if (existingSnap.exists()) {
    return {success: false, error: "Profile already in database"};
  }

  const uniqueId = uuidv4().slice(0,8);

  await setDoc(ref, {
    ...profileData,
    id: uniqueId,
    email,
    createdAt: serverTimestamp()
  });

  return { success: true, id:uniqueId };
}

/**
 * @param {string} email 
 */
export async function getProfile(email) {
  const ref = doc(db, 'profiles', email);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return null;
  }
  return snap.data();
}

/**
 * @param {string} email 
 * @param {Object} updates
 */
export async function updateProfile(email, updates) {
  const ref = doc(db, 'profiles', email);
  await updateDoc(ref, {
    ...updates,
    updatedAt: serverTimestamp()
  });

  return { success: true };
}
