#!/usr/bin/env node
// Issue: Backup Firestore data to JSON file
// This script reads documents from  collections and exports them
// to a timestamped JSON file for debugging and local archiving.

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

// Setea el emulator host 
process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:58180';

// inicializa Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({ projectId: 'demo-esports-organizer' });
}

const db = admin.firestore();

// Define collections to backup
const COLLECTIONS_TO_BACKUP = [
  'users',
  'teams', 
  'tournaments',
  'events',
  'matches',
  'players'
];

/**
 * Generate timestamp for filename (YYYYMMDD format)
 */
function getTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * Recursively read all documents from a collection including subcollections
 */
async function readCollection(collectionRef, collectionPath = '') {
  const snapshot = await collectionRef.get();
  const documents = [];

  if (snapshot.empty) {
    console.log(`   Collection ${collectionPath || collectionRef.id} is empty`);
    return documents;
  }

  console.log(`   Reading ${snapshot.size} document(s) from ${collectionPath || collectionRef.id}`);

  for (const doc of snapshot.docs) {
    const docData = {
      id: doc.id,
      data: doc.data(),
      subcollections: {}
    };

    // lee todo los subcollections para este documento
    const subcollections = await doc.ref.listCollections();
    for (const subcollection of subcollections) {
      const subPath = `${collectionPath || collectionRef.id}/${doc.id}/${subcollection.id}`;
      docData.subcollections[subcollection.id] = await readCollection(subcollection, subPath);
    }

    documents.push(docData);
  }

  return documents;
}

/**
 *  backup function
 */
async function createBackup() {
  console.log('Starting Firestore Backup Operation');
  console.log('This will read all data from the database (no writes performed)');
  console.log('');

  try {
    const timestamp = getTimestamp();
    const backupData = {
      timestamp: new Date().toISOString(),
      collections: {},
      metadata: {
        exportDate: new Date().toISOString(),
        totalCollections: 0,
        totalDocuments: 0
      }
    };

    let totalDocuments = 0;
    let collectionsProcessed = 0;

   
    console.log(`Processing ${COLLECTIONS_TO_BACKUP.length} collection(s):`);
    for (const collectionName of COLLECTIONS_TO_BACKUP) {
      console.log(`\nProcessing collection: ${collectionName}`);
      
      try {
        const collectionRef = db.collection(collectionName);
        const documents = await readCollection(collectionRef);
        
        backupData.collections[collectionName] = documents;
        totalDocuments += documents.length;
        collectionsProcessed++;
        
        console.log(`   Backed up ${documents.length} document(s) from ${collectionName}`);
      } catch (error) {
        console.log(`   Error reading collection ${collectionName}: ${error.message}`);
        backupData.collections[collectionName] = [];
      }
    }

    // chequea si existen otros collections
    console.log('\nChecking for additional collections...');
    try {
      const allCollections = await db.listCollections();
      const additionalCollections = allCollections.filter(col => 
        !COLLECTIONS_TO_BACKUP.includes(col.id)
      );

      if (additionalCollections.length > 0) {
        console.log(`Found ${additionalCollections.length} additional collection(s):`);
        for (const collection of additionalCollections) {
          console.log(`\nProcessing additional collection: ${collection.id}`);
          try {
            const documents = await readCollection(collection);
            backupData.collections[collection.id] = documents;
            totalDocuments += documents.length;
            collectionsProcessed++;
            console.log(`   Backed up ${documents.length} document(s) from ${collection.id}`);
          } catch (error) {
            console.log(`   Error reading collection ${collection.id}: ${error.message}`);
            backupData.collections[collection.id] = [];
          }
        }
      } else {
        console.log('   No additional collections found');
      }
    } catch (error) {
      console.log(`   Could not list collections: ${error.message}`);
    }

    // Update metadata
    backupData.metadata.totalCollections = collectionsProcessed;
    backupData.metadata.totalDocuments = totalDocuments;

    // Crea backups directory si no existe
    const backupsDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
      console.log('\nCreated backups directory');
    }

    // Write backup file
    const filename = `backup-${timestamp}.json`;
    const filepath = path.join(backupsDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2));

    console.log('\nBackup Summary:');
    console.log(`   Timestamp: ${timestamp}`);
    console.log(`   File: ${filepath}`);
    console.log(`   Collections: ${collectionsProcessed}`);
    console.log(`   Total documents: ${totalDocuments}`);
    
    console.log('\nBackup completed successfully!');
    console.log(`Data exported to: ${filename}`);

  } catch (error) {
    console.error('Error creating backup:', error);
    process.exit(1);
  }
}

// Run the backup operation
createBackup()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Backup operation failed:', error);
    process.exit(1);
  });