import Community from "./Community.js";
import {
    doc,
    setDoc,
    getDoc,
    collection,
    getDocs,
    deleteDoc
} from "firebase/firestore";

import {db} from "../database/firebaseClient.js"

//Function receives the following arguments:
/**
 * @argument {string} name argument string community name
 * @argument {string} description argument string community description
 * @argument {string} admin ID of the account that created the community
 * @argument {string[]} tags argument array of tags in a community
 * @argument {string} game the game around which the community is based
 * @argument {string} location where the community is based in
 * @argument {string} icon community icon image location string
 * @argument {string} banner community banner image location string
 */
const firestore = db;

async function createCommunity(name, description, admin, tags, game, location, icon, banner){

    //Members will start as an empty array to house the ids of future members with the admin id added as first member
    const members = [];
    members.push(admin);

    //Community starts off with an empty post array
    const posts = [];

    //Date the community was created in
    const dateCreated = new Date();

    //Generate a random UUID
    const id = crypto.randomUUID();

    const community = new Community({name, description, admin, members, posts, tags, id, dateCreated, game, location,
    icon, banner});

    try{
        console.log(community)
        await addCommunityToDatabase(community);
        console.log("Community successfully created!");

        return true;
    }
    catch(error){

        console.log("Error when creating community:" + error);

        return false;
    }

}

    /* Checks if a given Community is in the database. */
    function isCommunityInDataBase(community) {
        // Checks Firestore for existence of a community by ID
        return getCommunityFromFirestore(community.id).then(result => !!result);
    }

    /* Given a Community object, adds a key value pair array to the database. Community IDs must be unique. */
    async function addCommunityToDatabase(community) {
        const existing = await getCommunityFromFirestore(community.id);
        if (!existing) {
            await setDoc(doc(firestore, "Communities", community.id), community.toFirestore());
        } else {
            console.log(`Community of ID ${community.id} already exists.`);
        }
    }

    /* Given a Community ID, searches for the community and returns it if it was found and returns null if not. */
    async function getCommunityFromFirestore(commId) {
        const snap = await getDoc(doc(firestore, "Communities", commId));
        if(snap.exists()){
            return Community.fromFirestore(snap.data());
        }
        return null;
    }

    /* Retrieves communities from Firestore. */
    async function getAllCommunitiesFromDatabase() {
        const communityCollection = collection(firestore, "Communities");
        const communitySnapshot = await getDocs(communityCollection);
        return communitySnapshot.docs.map(doc => Community.fromFirestore(doc.data()));
    }

    /* Updates community in the database */
    async function updateCommunity(commId, updatedCommunity) {
        const communityRef = doc(firestore, "Communities", commId);
        await setDoc(communityRef, updatedCommunity.toFirestore());
        console.log(`Community of ID ${commId} updated successfully.`);
    }


    /* Deletes a Community given its ID. Proper cleanup should be in place in order to avoid users accessing null Community values. */
    async function deleteCommunity(commId) {
        try {
            const communityRef = doc(firestore, "Communities", commId);
            await deleteDoc(communityRef);
            console.log(`Community of ID ${commId} deleted successfully.`);
        } catch (error) {
            console.error("Error deleting community: ", error);
        }
    }

// Prevent ESLint 'defined but never used' for exported functions — they are used externally.
void isCommunityInDataBase;
void deleteCommunity;
export{getAllCommunitiesFromDatabase, createCommunity, getCommunityFromFirestore, updateCommunity, isCommunityInDataBase, deleteCommunity}
