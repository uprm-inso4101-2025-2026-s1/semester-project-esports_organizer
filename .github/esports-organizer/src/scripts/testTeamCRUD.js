/**
 * Test script for Team CRUD operations.
 * Demonstrates creating, reading, updating, and listing teams in Firestore.
 * 
 * Run with: node src/scripts/testTeamCRUD.js
 * (Make sure the Firestore emulator is running first: npm run emulator:start)
 */

import admin from 'firebase-admin';
import Team from '../services/TeamClass.js';

// Point to the emulator BEFORE initializing Firebase
// (port 58180 is configured in package.json scripts)
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:58180';

// Initialize Firebase Admin SDK with just projectId (emulator doesn't need credentials)
admin.initializeApp({
  projectId: 'demo-esports-organizer',
});

const db = admin.firestore();

async function runTests() {
  console.log('🚀 Starting Team CRUD tests...\n');
  console.log('📌 Checking Firestore connection...');

  try {
    // Quick health check
    const healthCheck = await Promise.race([
      db.collection('_healthcheck').doc('test').get(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Firestore connection timeout - is emulator running on 127.0.0.1:58180?')), 5000)
      )
    ]);
    console.log('✅ Firestore connection OK\n');

    // Test 1: Create a team
    console.log('📝 Test 1: Creating a new team...');
    const newTeamData = {
      name: 'Dragon Slayers',
      organizer: 'user_organizer_1',
      members: ['user_organizer_1', 'user_2'],
      maxMembers: 20,
    };

    // Since Team.create uses the Web SDK db, we'll manually create here
    const teamId = Team._generateId();
    const team = new Team({
      ...newTeamData,
      id: teamId,
    });

    console.log(`   Writing team ${teamId} to Firestore...`);
    // Write to Firestore using admin SDK
    await db.collection('teams').doc(teamId).set(team.toFireStore());
    console.log(`✅ Created team: ${team.name} (ID: ${team.id})`);
    console.log(`   Organizer: ${team.organizer}, Members: ${team.members.length}\n`);

    // Test 2: Create another team
    console.log('📝 Test 2: Creating another team...');
    const team2Id = Team._generateId();
    const team2 = new Team({
      name: 'Phoenix Rising',
      organizer: 'user_organizer_2',
      members: ['user_organizer_2'],
      maxMembers: 30,
      id: team2Id,
    });
    await db.collection('teams').doc(team2Id).set(team2.toFireStore());
    console.log(`✅ Created team: ${team2.name} (ID: ${team2.id})\n`);

    // Test 3: Get a single team by ID
    console.log('📝 Test 3: Fetching team by ID...');
    const fetchedSnap = await db.collection('teams').doc(teamId).get();
    if (fetchedSnap.exists) {
      const fetchedTeam = Team.fromFirestore(fetchedSnap.data());
      console.log(`✅ Fetched team: ${fetchedTeam.name}`);
      console.log(`   Members: ${fetchedTeam.members.join(', ')}\n`);
    } else {
      console.log(`❌ Team not found\n`);
    }

    // Test 4: Get all teams
    console.log('📝 Test 4: Fetching all teams...');
    const allSnaps = await db.collection('teams').get();
    const teams = [];
    allSnaps.forEach(doc => {
      teams.push(Team.fromFirestore(doc.data()));
    });
    console.log(`✅ Found ${teams.length} team(s):`);
    teams.forEach((t, i) => {
      console.log(`   ${i + 1}. ${t.name} (${t.members.length} members)`);
    });
    console.log();

    // Test 5: Update a team
    console.log('📝 Test 5: Updating a team...');
    const updateData = {
      name: 'Dragon Slayers Pro',
      maxMembers: 25,
    };
    await db.collection('teams').doc(teamId).update(updateData);
    const updatedSnap = await db.collection('teams').doc(teamId).get();
    const updatedTeam = Team.fromFirestore(updatedSnap.data());
    console.log(`✅ Updated team: ${updatedTeam.name} (Max members: ${updatedTeam.maxMembers})\n`);

    // Test 6: Test member operations on a team instance
    console.log('📝 Test 6: Testing team member operations...');
    const testTeam = new Team({
      name: 'Test Team',
      organizer: 'org1',
      members: ['org1'],
      maxMembers: 5,
      id: 'test_id',
    });

    console.log(`   Initial members: ${testTeam.members.join(', ')}`);
    
    const addedMember1 = testTeam.addMember('user_3');
    console.log(`   Added user_3: ${addedMember1} → Members: ${testTeam.members.join(', ')}`);
    
    const addedMember2 = testTeam.addMember('user_4');
    console.log(`   Added user_4: ${addedMember2} → Members: ${testTeam.members.join(', ')}`);
    
    const foundIndex = testTeam.findMemberByID('user_3');
    console.log(`   Found user_3 at index: ${foundIndex}`);
    
    const removedMember = testTeam.removeMember('user_3');
    console.log(`   Removed user_3: ${removedMember} → Members: ${testTeam.members.join(', ')}\n`);

    console.log('✅ All tests completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

runTests();