class Team {
  constructor(name, score = 0, isConfirmed = false) {
    this.name = name;            // Team name
    this.score = score;          // Team score
    this.isConfirmed = isConfirmed; // Confirmation status (true/false)
    this.members = [];           // Team members
    this.captain = null;         // Team captain
  }

  // ---- Member management ----
  addMember(member) {
    if (!this.members.includes(member)) {
      this.members.push(member);
    }
  }

  removeMember(member) {
    this.members = this.members.filter(m => m !== member);
    if (this.captain === member) {
      this.captain = null; // If the captain is removed, set to null
    }
  }

  assignCaptain(member) {
    if (this.members.includes(member)) {
      this.captain = member;
    } else {
      throw new Error("The captain must be a member of the team.");
    }
  }

  // ---- Confirmation ----
  confirmTeam() {
    this.isConfirmed = true;
  }

  unccxonfirmTeam() {
    this.isConfirmed = false;
  }

  // ---- Score manabgement ----
  setScore(newScore) {
    this.score = newScore;
  }

  increaseScore(points) {
    this.score += points;
  }

  decreaseScore(points) {
    this.score = Math.max(0, this.score - points); // Score cannot be negative
  }

  // ---- Utility ----
  toObject() {
    return {
      name: this.name,
      score: this.score,
      isConfirmed: this.isConfirmed,
      members: this.members,
      captain: this.captain,
    };
  }
}

export default Team;