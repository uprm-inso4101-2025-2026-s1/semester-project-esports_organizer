
/**
 * @typedef {Object} TeamInitialize
 * @property {string} name
 * @property {string} organizer userID of the creator of the team
 * @property {string[]} [members] empty by default, Array of UserIDs
 * @property {number} maxMembers constant unsigned int
 */

export default class Team {

  constructor ({name, organizer, members = [], maxMembers = 30, subteams = {} }){
  this.name = name;
  this.organizer = organizer;
  this.memebers = Array.isArray(members) && members.length > 0 ? members : [organizer];
  this.maxMembers = maxMembers;

  //subteams: { subteamID: {id, name, organizer, members: [], maxMembers}}
  this.subteams = subteams || {};
  }

  //---------------------------
  // INTERNAL HELPERS
  //---------------------------
  static _generateId() {
    return Math.random().toString(36).substring(2, 10);
  }

  /** Returns true if user is already in ANY subteam */
  isUserInAnySubteam(uid) {
    return Object.values(this.subteams).some(st => st.members.includes(uid));
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
    if (team.members.length < 30) {
      team.members.push(member);
    } else {
      console.log("Maximum Member limit reached.");
    }
  }

  /* Removes a member from the members list. */
  removeMember(memberID) {
    let memberIndex = this.findMemberByID(memberID);
    if (teamIndex !== -1) {
      this.members.splice(memberIndex, 1);
    }    
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
    subTeam.members.splice(idx, 1);
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
      "name": this.name,
      "organizer": this.organizer,
      "members": this.members,
      "maxMembers": this.maxMembers,
    };
  }

  /* Converts from a key value pair to a Team object. */
  static fromFirestore(data) {
    return new Team(data.name, data.organizer, data.members);
  }
};

// module.exports = Team;