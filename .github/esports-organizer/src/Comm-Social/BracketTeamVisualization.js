import { assignBrackets } from "./TournamentRegistration";
import { runBracket } from "./MatchProgression";

/**
 * @param {Array<Array<Team>>} initialBrackets - Takes the initial teams that are registered.
 * @returns {Object} - An object that contains all the rounds and the champion of the tournament.
 * This function simulates a tournament using Runbracket from MatchProgression, where it uses single
 * elimination Brackets, this simulates the different rounds, including the final.
 *
 * Note: That the rounds are structured as follows:
 * Round 1: 16 teams (8 matches)
 * Round 2: 8 teams (4 matches)
 * Semifinals: 4 teams (2 matches)
 * Final: 2 teams (1 match)
 */
function simulateTournamentRoundByRound(tournament) {

  if(tournament.teams.length < 1){
    return { rounds: [], champion: null };
  }
  
  // Get the teams from the tournament object
  const initialTeams = tournament.teams;
  
  // Create initial brackets from the teams
  const initialBrackets = [];
  for (let i = 0; i < initialTeams.length; i += 2) {
    if (i + 1 < initialTeams.length) {
      initialBrackets.push([initialTeams[i], initialTeams[i+1]]);
    } else {
      initialBrackets.push([initialTeams[i]]);
    }
  }
  
  const allRounds = [initialBrackets];

  // Use runBracket to simulate the first round - pass the teams array
  const firstRoundWinners = runBracket(initialTeams);

  // Creates the brackets for the second round (preserving the order)
  const secondRound = [];
  for (let i = 0; i < firstRoundWinners.length; i += 2) {
    if (i + 1 < firstRoundWinners.length) {
      secondRound.push([firstRoundWinners[i], firstRoundWinners[i+1]]);
    } else {
      secondRound.push([firstRoundWinners[i]]);
    }
  }
  allRounds.push(secondRound);
  
  // For subsequent rounds, create a tournament object with the winners as teams
  const secondRoundWinners = runBracket(secondRound.flat());

  // Creates the brackets for the semifinals
  const semifinals = [];
  for (let i = 0; i < secondRoundWinners.length; i += 2) {
    if (i + 1 < secondRoundWinners.length) {
      semifinals.push([secondRoundWinners[i], secondRoundWinners[i+1]]);
    } else {
      semifinals.push([secondRoundWinners[i]]);
    }
  }
  allRounds.push(semifinals);
  
  const finalists = runBracket(semifinals.flat());

  // Creates the final match
  const final = [[finalists[0], finalists[1]]];
  allRounds.push(final);
 
  const champion = runBracket( final.flat())[0];
  
  return { rounds: allRounds, champion };
}


/**
  * @returns {Object} - A object that returns the tournament rounds and the champion.
  * This function uses assignBrackets to get the initial teams and then simulates the tournament rounds.
  * In case of error, it returns an object with empty rounds and null champion.
  *
  * Note: This function takes all the assigned teams.
*/
export function getTournamentData(tournament) {
  try {
    // takes all the assing teams

    // Simulate the entire tournament and get the rounds and champion.
    const result = simulateTournamentRoundByRound(tournament);
    
    return {

      rounds: result.rounds,
      champion: result.champion

    };
    
  } catch (error) {
    console.error("Error initialization of tournament:", error);

    return {

      rounds: [],
      champion: null

    };
  }
}