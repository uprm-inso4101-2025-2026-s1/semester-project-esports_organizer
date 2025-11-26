#!/usr/bin/env node
//BTW SOLO CORRE CUANDO USE_EMULATORS=true

import admin from 'firebase-admin';

// Safety check: no puedes correr esto unless USE_EMULATORS es true
if (process.env.USE_EMULATORS !== 'true') {
  console.error('SAFETY CHECK FAILED');
  console.error('This script will only run when USE_EMULATORS=true');
  console.error('This prevents accidental deletion in production environments.');
  console.error('');
  console.error('To run this script:');
  console.error('  USE_EMULATORS=true npm run clear:emulator');
  process.exit(1);
}

// Setiamos el emulator host
process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:58180';

// We initialize el firebase admin sdk
if (!admin.apps.length) {
  admin.initializeApp({ projectId: 'demo-esports-organizer' });
}

const db = admin.firestore();


async function deleteCollection(collectionRef, collectionName) {
  const snapshot = await collectionRef.get();
  let deleteCount = 0;

  if (snapshot.empty) {
    return deleteCount;
  }


  const batchSize = 500;
  const docs = snapshot.docs;
  
  for (let i = 0; i < docs.length; i += batchSize) {
    const batch = db.batch();
    const batchDocs = docs.slice(i, i + batchSize);
    
    for (const doc of batchDocs) {
      // Primero quitmos todos los subcollections 
      const subcollections = await doc.ref.listCollections();
      for (const subcollection of subcollections) {
        const subDeleteCount = await deleteCollection(subcollection, `${collectionName}/${doc.id}/${subcollection.id}`);
        deleteCount += subDeleteCount;
      }
      
      // despues el documento perse 
      batch.delete(doc.ref);
      deleteCount++;
    }
    
    await batch.commit();
  }

  return deleteCount;
}

/**
 * las main functions que le hacen clear a todo el data
 */
async function clearEmulator() {
  console.log('Starting Firestore Emulator Clear Operation');
  console.log('This will delete ALL data from the emulator');
  console.log('');

  try {
    // Cogemos todos los root collections
    const collections = await db.listCollections();
    
    if (collections.length === 0) {
      console.log('Emulator is already empty - no collections found');
      return;
    }

    console.log(`Found ${collections.length} root collection(s) to clear:`);
    collections.forEach(col => console.log(`   - ${col.id}`));
    console.log('');

    let totalDeleted = 0;
    const collectionCounts = {};

    // Delete each collection
    for (const collection of collections) {
      console.log(` Clearing collection: ${collection.id}`);
      const deleteCount = await deleteCollection(collection, collection.id);
      collectionCounts[collection.id] = deleteCount;
      totalDeleted += deleteCount;
      console.log(`   Deleted ${deleteCount} document(s) from ${collection.id}`);
    }

    console.log('');
    console.log(' Deletion Summary:');
    for (const [collectionName, count] of Object.entries(collectionCounts)) {
      console.log(`   ${collectionName}: ${count} document(s)`);
    }
    console.log('');
    console.log(`Successfully deleted ${totalDeleted} total document(s) from emulator`);
    console.log('Emulator factory reset complete!');

  } catch (error) {
    console.error('Error clearing emulator:', error);
    process.exit(1);
  }
}

// Esto le hace clear al operation 
clearEmulator()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Clear operation failed:', error);
    process.exit(1);
  });