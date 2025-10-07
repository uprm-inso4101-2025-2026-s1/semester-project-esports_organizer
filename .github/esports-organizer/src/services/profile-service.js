import { db } from '../lib/firebase.js';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

/**
 * @param {Object} profileData 
 * @param {string} profileData.email 
 * @param {string} profileData.name 
 * @param {string} profileData.photoUrl 
 * @param {string} profileData.role 
 */
export async function saveProfile(profileData) {
  if (!profileData.email || !profileData.name || !profileData.role) {
    throw new Error('Campos obligatorios faltantes: email, name o role');
  }

  const ref = doc(db, 'profiles', profileData.email);
  await setDoc(ref, {
    ...profileData,
    createdAt: serverTimestamp()
  });

  return { success: true };
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
