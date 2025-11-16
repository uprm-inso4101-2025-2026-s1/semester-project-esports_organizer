import { db } from '../lib/firebase.js';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { collection, query, where, getDocs } from 'firebase/firestore';
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
 
  const q = query(collection(db, 'profiles'), where('email', '==', email));
  const existing = await getDocs(q);
  if (!existing.empty) {
    return {success: false, error: "Profile already in database"};
  }

  const uniqueId = uuidv4().slice(0,8);
  const ref = doc(db, 'profiles', uniqueId);

  await setDoc(ref, {
    ...profileData,
    id: uniqueId,
    email,
    createdAt: serverTimestamp()
  });

  return { success: true, id:uniqueId };
}

/**
 * @param {string} id 
 */
export async function getProfileById(id) {
  const ref = doc(db, 'profiles', id);
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
export async function updateProfileByEmail(email, updates) {
  if(!email) return {success: false, error:'Email is required.'};
  if(!updates || typeof updates !== 'object'){
    return{success: false, error: 'Invalid update data.'};
  }

  const q = query(collection(db,'profiles'), where('email', '==', email.trim().toLowerCase()));
  const results = await getDocs(q);

  if(results.empty){
    return{success: false, error:'Profile not found.'};
  }

  const ref = results.docs[0].ref;
  const currentData = results.docs[0].data();

  const fieldsToUpdate ={}
  for (const key in updates){
    if (updates[key] !== currentData[key]){
      fieldsToUpdate[key] = updates[key];
    }
  }

  if (Object.keys(fieldsToUpdate).length === 0){
    return {success:false, message:'No changes to apply.'};
  }

  await updateDoc(ref, {
    ...fieldsToUpdate,
    updatedAt: serverTimestamp(),
  });
  return{success: true, updated: fieldsToUpdate};

}

/**
 * @param {string} profileId
 * @param {Object} updateData
 */

export async function updatePlayerProfile(profileId, updateData){
  if (!profileId) return {success: false, error:'ID is required.'};
  if (!updateData || typeof updateData !== 'object') {
    return {success: false, error: 'Invalid'};
  }

  const ref = doc(db, 'profiles', profileId);
  const snap = await getDoc(ref);

  if(!snap.exists()) {
    return {success:false, error:'Profile not found.'};
  }

  const currentData = snap.data();
  const fieldsToUpdate = {};

  for(const key in updateData){
    if(updateData[key] !== currentData[key]) {
      fieldsToUpdate[key] = updateData[key];
    }
  }
  if (Object.keys(fieldsToUpdate).length === 0) {
    return{success:false, message:'No changes to apply.'};
  }

  await updateDoc(ref, {
    ...fieldsToUpdate,
    updatedAt: serverTimestamp(),
  });

  return {success:true, updated: fieldsToUpdate};

}