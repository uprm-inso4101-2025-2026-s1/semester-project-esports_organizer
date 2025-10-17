import Bracket from "../database/examples/Brackets.js";
import Team from "../database/examples/Teams.js";

/**
 * 
 * @param {Array<Team>} brackets is an array of team objects with name and score properties
 * @returns {Array<Teams>} returns the champion of the tournament
 * This function runs a single-elimination bracket tournament
 * It pairs teams, compares their scores, and advances winners to the next round
 * In case of a tie, it randomly selects a winner (to be improved later)
 * Continues until one champion remains
 * 
 * NOTE: in order to have every team play, the number of teams should ideally be a power of two (2, 4, 8, 16, etc.)
 * If not, some teams will just pass in the first round or others.
 */
export function runBracket(teams){   

    //Check if there is enough parcipants resgistered to have a tournament
      if(!Array.isArray(teams) || teams.length < 2){
            throw new Error("Not enough teams to run a tournament.");
       }


    const bracket = new Bracket(teams);
    bracket.createInitialMatches();
    let finalTeamList = [];
    let round = 1;
    while ((bracket.matches && bracket.matches.size > 0)) {
    console.log(`\n--- Round ${round} ---`);
    const currentMatches = Array.from(bracket.matches.entries());
   
    for (const [matchId, match] of currentMatches) {
      let { player1, player2 } = match;

  if (typeof player1 === "string") {
    const fullTeam = teams.find(t => t.id === player1);
    if (!fullTeam) {
        console.error(`Could not find team for ID: ${player1}`);
        continue;
    }
    match.player1 = fullTeam;
    player1 = fullTeam;
}
if (typeof player2 === "string") {
    const fullTeam = teams.find(t => t.id === player2);
    if (!fullTeam) {
        console.warn(`No team found for player2 ID: ${player2} (BYE?)`);
        match.player2 = null;
        player2 = null;
    } else {
        match.player2 = fullTeam;
        player2 = fullTeam;
    }
}

      // Validate that both players exist and have IDs
      if (!player1 || !player1.id) {
        console.error(`Match ${matchId} has invalid player1`, player1);
        continue;
      }

      if (player2 && !player2.id) {
        console.error(`Match ${matchId} has invalid player2`, player2);
        continue;
      }

        if (!player2) {
          console.log(`${player1.name} advances automatically (BYE)`);
          bracket.recordResult(matchId, player1.id);
          continue;
        }
    
    //Random scores for testing porpuoses    
    const score1 = Math.round(Math.random() * 150);
    const score2 = Math.round(Math.random() * 150);

    console.log(`${player1.name} (${score1}) vs ${player2.name} (${score2})`);
    //Simulated picking a winner
    //TO-DO let organizer record results
    if (score1 > score2) {
      finalTeamList.push(player2);
      console.log(`Winner: ${player1.name}`);
      bracket.recordResult(matchId, player1.id );
      
    } else if (score2 > score1) {
      finalTeamList.push(player1);
      console.log(`Winner: ${player2.name}`);
      bracket.recordResult(matchId, player2.id);

    } else {
      // Tie breaker
      const winner = Math.random() < 0.5 ? player1 : player2;
      finalTeamList.push(winner === player1 ? player2 : player1);
      console.log(`Tie! Randomly selected winner: ${winner.name}`);
      bracket.recordResult(matchId, winner.id);
    }
  }
  bracket.matches = new Map(bracket.nextRoundMatches);  
  bracket.nextRoundMatches.clear();
  round++;

    }
    const finalWinnerId = bracket._winnersCurrentRound?.[0];
    const finalWinner = teams.find(t => t.id === finalWinnerId);
    finalTeamList.push(finalWinner);
     console.log(`\nChampion: ${finalWinner.name}\n`);
    return finalTeamList;
  }


