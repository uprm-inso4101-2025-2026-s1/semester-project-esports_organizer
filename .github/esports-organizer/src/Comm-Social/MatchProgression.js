
//Assume we have teams made
class Teams{
    
    constructor(name,score){
        this.name = name;
        this.score = score;
    }
}

const team1 = new Teams("Los duros", Math.round(Math.random()*150));
const team2 = new Teams("Los marcianos", Math.round(Math.random()*150));
const team3 = new Teams("Los yanki", Math.round(Math.random()*150));
const team4 = new Teams("Los monki", Math.round(Math.random()*150));
const team5 = new Teams("Los solos", Math.round(Math.random()*150));
const team6 = new Teams("Los lokos", Math.round(Math.random()*150));
let teams = [team1,team2,team3,team4,team5,team6];

/**
 * 
 * @param {Array<Teams>} teams is an array of team objects with name and score properties
 * This function runs a single-elimination bracket tournament
 * It pairs teams, compares their scores, and advances winners to the next round
 * In case of a tie, it randomly selects a winner (to be improved later)
 * Continues until one champion remains
 * 
 * NOTE: in order to have every team play, the number of teams should ideally be a power of two (2, 4, 8, 16, etc.)
 * If not, some teams will just pass in the first round or others.
 */
function runBracket(teams){    

    if(teams.isEmpty || teams.length < 2){
        throw new Error("Not enough teams to run a tournament.");
    }

    if (teams.some(team => team == null)) {
        throw new Error("There are null or undefined team objects in the array.");
    }

    let round = 1;
    let currentTeams = teams.slice();

    while (currentTeams.length > 1) {
        console.log(`\n--- Round ${round} ---`);
        let winners = [];

        for (let i = 0; i < currentTeams.length; i += 2) {
            if (i + 1 < currentTeams.length) {
                const teamA = currentTeams[i];
                const teamB = currentTeams[i + 1];
                console.log(`${teamA.name} vs ${teamB.name}`);

                if (teamA.score > teamB.score) {

                    
                    console.log(`${teamA.name} wins with score ${teamA.score}`);
                    teamA.score += 1; 
                    winners.push(teamA);

                } 
                else if (teamA.score < teamB.score) {

                    
                    console.log(`${teamB.name} wins with score ${teamB.score}`);
                    teamB.score += 1;
                    winners.push(teamB);

                } 
                else {
                    // Tie-breaker: randomly pick a winner for now, will implement better logic later
                    const winner = Math.random() < 0.5 ? teamA : teamB;
                    console.log(`Tie! Randomly selected ${winner.name} as winner`);
                    winners.push(winner);
                }
            } else {
                // Odd team advances automatically
                console.log(`${currentTeams[i].name} advances automatically (no opponent)`);
                winners.push(currentTeams[i]);
            }
        }

        currentTeams = winners;
        round++;
    }

    console.log(`\nChampion: ${currentTeams[0].name}`);
    return currentTeams[0];

}


runBracket(teams);