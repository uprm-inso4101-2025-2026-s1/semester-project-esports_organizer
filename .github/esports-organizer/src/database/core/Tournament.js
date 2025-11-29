import{collection, addDoc} from "firebase/firestore";
import Team from './Teams.js';

export default class Tournament {

/* 
General Notes:
    * Game could help determine the type of tournament
    * Organizer could be any of: a single person, association, sponsor or organization (provide name)
    * Date format: [YYYY/MM/DD/HH/mm]
    * maxParticipants establishes the limit of per-team members in total among all teams
- EXAMPLE: Considering a maximum of 16 teams per tournament and the biggest of teams being 6 depending on the game involved
        the biggest tournament would have 96 participants
    * maxTeams is set to 16
        * type (single, duos [for now])
*/

static allTournaments = new Map();

    constructor(id, name, game, organizer, date, maxParticipants = 32, maxTeams = 16, type, prize, visibility, currentState, db, participants = [], teams = []) {
        this.id = id;
        this.name = name;
        this.game = game;
        this.organizer = organizer;
        this.date = date;
        this.maxParticipants = maxParticipants;
        this.maxTeams = maxTeams;
        this.type = type;
        this.prize = prize;
        this.visibility = visibility;
        this.currentState = currentState;
        this.db = db;

        if (this.type === 'single') {
            this.players = participants ?? [];
            this.teams = [];
        } else if (this.type === 'team') {
            this.teams = teams ?? [];
            this.players = [];
        } else {
            throw new Error('Invalid Tournament Type!');
        }

        this.ties = [];
        Tournament.allTournaments.set(id, this);

    }


    /*
    Add team/player, Find team/player, Remove team/player, 
    Find organizer, Advance team/player, Match teams/players,
    timeframe for registration, single/double elimination, 
    matchmaking logic, tie/tiebreak management,
    amount of rounds,  
    forfeit politics, 
    language, 
    current state
    */

    async firestoreSave(db){ // This saves our info into firestore so it generates an id
        const docRef = await addDoc(collection(db, "Tournaments"), {
            name: this.name,
            game: this.game,
            organizer: this.organizer,
            date: this.date,
            maxTeams: 16,
            type: this.type,
            prize: this.prize
        });
        this.id = docRef.id;
        return this.id;
    }

    //##########################################
    //  TOURNAMENT MANAGEMENT
    //##########################################
    async update(updatedData){ // We pass parameters inside {} to update if needed
        if(!this.id){
            throw new Error('Can\'t be updated without ID')
        }
        // Update firestore
        const tournamentRef = doc(this.db, "Tournaments", this.id);
        await updateDoc(tournamentRef, updatedData);
        // Update local instance
        Object.assign(this, updatedData);

        console.log(`Tournament ${this.id} updated succesfully`)
    }

    static getTournamentById(id){
        return Tournament.allTournaments.get(id);
    }
    
    static deleteTournamentById(id){
        if(!Tournament.allTournaments.has(id)){
            return false;
        }
        Tournament.allTournaments.delete(id);
        return true;
    }

    getOrganizer(){
        return this.organizer;
    }

    static findByOrganizer(organizerName){
        const results = [];
        for(const tournament of Tournament.allTournaments.values()){
            if(tournament.organizer === organizerName){
                results.push(tournament);
            }
        }
        return results;
    }

    // Tie management
    recordTie(round, matchId, participants){
        if(!Array.isArray(participants) || participants.length < 2){
            throw new Error('2 Participants must be provided for a tie!')
        }
        this.ties.push({round, matchId, participants});
    }

    resolveTie(matchId, winnerId) { // Resolve the tie by selecting a winner manually
        const tieIndex = this.ties.findIndex(t => t.matchId === matchId);
        if (tieIndex === -1) {
            throw new Error('No tie was found for the given match.');
        }
        const tie = this.ties[tieIndex];
        if (!tie.participants.includes(winnerId)) {
            throw new Error('The winner ID is not in the list of tied participants.');
        }
        // Remove the tie record
        this.ties.splice(tieIndex, 1);
        // Here you can advance the winner in the bracket or tournament logic
        return winnerId;
    }

    //##########################################
    //  TOURNAMENT TEAMS MANAGEMENT
    //##########################################

    addTeam(team){
        if(!(team instanceof Team)){
            throw new Error('Invalid team!');
        }
        if(team.members.length > team.maxMembers){
            throw new Error('Team exceeds member limit!');
        }
        if(this.teams.length >= this.maxTeams){
            throw new Error('Max teams number reached!')
        }

        this.teams.push(team);
    }

    removeTeam(teamName){
        const index = this.teams.findIndex(t => t.name === teamName);
        if(index === -1){
            throw new Error(`Team ${teamName} not found!`);
        }
        this.teams.splice(index, 1);

        console.log(`Team ${teamName} removed!`)
    }

    findTeam(teamName){
        return this.teams.find(t => t.name === teamName) || null;
    }

    updateTeam(teamName, newData){
        const team = this.findTeam(teamName);
        if(!team){
            throw new Error(`Team ${teamName} not found for update!`)
        }
        Object.assign(team, newData);
        console.log(`Team ${teamName} updated succesfully!`)
    }

    addParticipant(player) {
        if (this.type !== 'single') throw new Error("Tournament is not single player type");
        if (this.players.length >= this.maxParticipants) throw new Error("Maximum participants reached");
        if (this.players.some(p => p.id === player.id)) throw new Error("Player already registered");
        this.players.push(player);
    }

    findPlayer(playerId) {
        if (this.type !== 'single') throw new Error("Tournament is not single player type");
        return this.players.find(p => p.id === playerId) || null;
    }
}
