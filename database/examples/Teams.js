class Team {
    name;               // string
    organizer;          // UserID of the creator of the team. (userID is an identifier such as a string)
    members = [];       // Array of UserIDs (Starts as an empty list)
    teamRank;           // unsigned int
    rankScore = 0;      // unsigned int
    maxRankScore = 100; // unsigned int (set to 100 as a base)
    maxMembers;         // constant unsigned int (set to 30) (can be changed as needed)

    constructor(name, organizer, members, teamRank, rankScore, maxRankScore) {
        this.name = name;
        this.organizer = organizer;
        this.members = members;
        this.teamRank = teamRank;
        this.rankScore = rankScore;
        this.maxRankScore = maxRankScore;
        this.maxMembers = 30;

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
            "name" : this.name,
            "organizer" : this.organizer,
            "members" : this.members,
            "teamRank" : this.teamRank,
            "rankScore" : this.rankScore,
            "maxRankScore" : this.maxRankScore,
            "maxMembers" : 30
        };
    }

    /* Converts from a key value pair to a Team object. */
    static fromFirestore(data) {
        return new Team(data.name, data.organizer, data.members, data.teamRank, data.rankScore, data.maxRankScore);
    }
};

export default Team;