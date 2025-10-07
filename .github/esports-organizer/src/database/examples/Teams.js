
/**
 * @typedef {Object} TeamInitialize
 * @property {string} name
 * @property {string} organizer userID of the creator of the team
 * @property {string[]} [members] empty by default, Array of UserIDs
 * @property {number} teamRank unsigned int
 * @property {number} [rankScore] unsigned int, 0 by default
 * @property {number} [maxRankScore] unsigned int, 100 by default
 * @property {number} maxMembers constant unsigned int
 */

export default class Team {
  /** @type {string} */
  name;
  /** @type {string} userID of the creator of the team */
  organizer;
  /** @type {string[]} Array of UserIDs */
  members;
  /** @type {number} unsigned int */
  teamRank;
  /** @type {number} unsigned int */
  rankScore = 0;
  /** @type {number} unsigned int */
  maxRankScore;
  /** @type {number} constant unsigned int */
  maxMembers;

  constructor(init) {
    this.name = init.name;
    this.organizer = init.organizer;
    this.members = init.members ?? [];
    this.teamRank = init.teamRank;
    this.rankScore = init.rankScore ?? 0;
    this.maxRankScore = init.maxRankScore ?? 100;
    this.maxMembers = init.maxMembers;

    if (this.members.length === 0) {
      this.members.push(this.organizer);
    }
  }

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


  /* Method for rank increase. Math can be changed as needed. */
  increaseRank(score) {
    this.rankScore += score;

    if (this.rankScore >= this.maxRankScore) {
      this.teamRank++;
      this.rankScore = this.rankScore % this.maxRankScore;
      this.maxRankScore *= this.teamRank;
      
      if (this.teamRank > 10) this.teamRank = 10;
      if (this.maxRankScore > 10000) this.maxRankScore = 10000;
    }
  }

  /* Converts the team into a key value pair to be able to store in Firebase. */
  toFireStore() {
    return {
      "name": this.name,
      "organizer": this.organizer,
      "members": this.members,
      "teamRank": this.teamRank,
      "rankScore": this.rankScore,
      "maxRankScore": this.maxRankScore,
      "maxMembers": this.maxMembers,
    };
  }

  /* Converts from a key value pair to a Team object. */
  static fromFirestore(data) {
    return new Team(data.name, data.organizer, data.members, data.teamRank, data.rankScore, data.maxRankScore);
  }
};

// module.exports = Team;