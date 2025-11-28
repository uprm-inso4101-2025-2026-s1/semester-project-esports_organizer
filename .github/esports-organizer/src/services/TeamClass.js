/**
 * @typedef {Object} TeamInitialize
 * @property {string} name
 * @property {string} organizer userID of the creator of the team
 * @property {string[]} [members] empty by default, Array of UserIDs
 * @property {number} maxMembers constant unsigned int
 */

import { db } from "../database/firebaseClient.js";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";

export default class Team {

  constructor ({
    teamName,
    mainGame,
    description = "",
    twitchUrl = "",
    instagramUrl = "",
    twitterUrl = "",
    organizer,
    members = [],
    maxMembers = 30,
  }) {
    this.teamName = teamName;
    this.mainGame = mainGame;
    this.description = description;
    this.twitchUrl = twitchUrl;
    this.instagramUrl = instagramUrl;
    this.twitterUrl = twitterUrl;
    this.organizer = organizer;
    this.members = (Array.isArray(members) && members.length > 0) ? members : [organizer];
    this.maxMembers = maxMembers;
    this.id = btoa(teamName);
  }

  //---------------------------
  // INTERNAL HELPERS
  //---------------------------
  static _generateId() {
    return Math.random().toString(36).substring(2, 10);
  }


  //---------------------------
  // MAIN TEAM MEMBERSHIP
  //---------------------------

  /* Finds a member from their id in the members list and returns the index; returns -1 if the member was not found. */
  findMemberByID(memberID) {
    for (let i = 0; i < this.members.length; i++) {
      if (this.members[i] === memberID) {
        return i;
      }
    }

    
    return -1;
  }

  /* Adds a member to the members list unless it has reached the member limit. */
  addMember(member) {
    if (this.members.length < this.maxMembers) {
      if (this.findMemberByID(member) === -1) {
        this.members.push(member);
        return true;
      }
      return false;
    }
    return false;
  }

  /* Removes a member from the members list. */
  removeMember(memberID) {
    let memberIndex = this.findMemberByID(memberID);
    if (memberIndex !== -1) {
      this.members.splice(memberIndex, 1);
      return true;
    }
    return false;
  }

//-----------------------------
// SUBTEAM MANAGEMENT
//-----------------------------

static createSubTeam({ TeamID = null, name, organizer, capacity }) {
  return {
    teamID: TeamID,
    name: name,
    organizer: organizer,
    capacity: capacity,
    members: []
  }
}

static removeFromSubteam(subTeam, uid) {
  const index = subTeam.members.indexOf(uid);
  if (index !== -1) {
    subTeam.members.splice(index, 1);
    return subTeam;
  }

  return null;
}



//-----------------------------
// RETURN TEAM TO FIRESTORE
//-----------------------------


  /* Converts the team into a key value pair to be able to store in Firebase. */
  toFireStore() {
    return {
      teamName: this.teamName,
      mainGame: this.mainGame,
      description: this.description,
      twitchUrl: this.twitchUrl,
      instagramUrl: this.instagramUrl,
      twitterUrl: this.twitterUrl,
      organizer: this.organizer,
      members: this.members,
      maxMembers: this.maxMembers,
    };
  }

  /* Converts from a key value pair to a Team object. */
  static fromFirestore(data) {
    return new Team({
      teamName: data.teamName,
      mainGame: data.mainGame,
      description: data.description,
      twitchUrl: data.twitchUrl,
      instagramUrl: data.instagramUrl,
      twitterUrl: data.twitterUrl,
      organizer: data.organizer,
      members: data.members,
      maxMembers: data.maxMembers,
    });
  }
  

  // Firestore collection name for teams
  static TEAMS_COLLECTION = "Teams";

  // --- Firestore helpers (static) ---
  // Create and save a new team to Firestore. If `id` is not provided, generate one.
  static async storeTeam(teamInit) {
    const id = (teamInit && teamInit.id) || this._generateId();
    const team = teamInit instanceof Team ? teamInit : new Team({ ...teamInit, id });
    team.id = id;
    const ref = doc(db, this.TEAMS_COLLECTION, id);
    await setDoc(ref, team.toFireStore());
    return team;
  }

  // Update an existing team by id with the provided fields.
  static async update(id, updates) {
    const ref = doc(db, this.TEAMS_COLLECTION, id);
    await updateDoc(ref, updates);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return this.fromFirestore(snap.data());
  }

  // Get all teams as Team instances
  static async getAll() {
    const col = collection(db, this.TEAMS_COLLECTION);
    const snaps = await getDocs(col);
    const results = [];
    snaps.forEach(docSnap => {
      results.push(this.fromFirestore(docSnap.data()));
    });
    return results;
  }

  // Get a single team by id
  static async getById(id) {
    // Find the team whose `btoa(teamName)` matches the given ID
    const col = collection(db, this.TEAMS_COLLECTION);
    const snaps = await getDocs(col);
    let found = null;
    snaps.forEach(docSnap => {
      const data = docSnap.data();
      if (btoa(data.teamName) === id) {
        found = this.fromFirestore(data);
      }
    });
    return found;
  }

}
