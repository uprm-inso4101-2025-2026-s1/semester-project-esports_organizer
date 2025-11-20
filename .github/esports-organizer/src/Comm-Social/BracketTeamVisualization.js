import { assignBrackets } from "./TournamentRegistration.js";
import { runBracket } from "./MatchProgression.js";


//  * Note: That the rounds are structured as follows:
//  * Round 1: 16 teams (8 matches)
//  * Round 2: 8 teams (4 matches)
//  * Semifinals: 4 teams (2 matches)
//  * Final: 2 teams (1 match)
//  */
/**
 * @param {Tournament} tournament - The tournament object with teams
 * @returns {Object} - An object that contains all the rounds and the champion of the tournament.
 */
export function simulateTournamentRoundByRound(tournament) {
  // Get the teams from the tournament object
  const initialTeams = tournament.teams;
  
  // Handle edge cases first
  if (!Array.isArray(initialTeams) || initialTeams.length === 0) {
    return { rounds: [], champion: null };
  }
  
  if (initialTeams.length === 1) {
    return { 
      rounds: [[[initialTeams[0]]]], 
      champion: initialTeams[0] 
    };
  }
  
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

  // Use runBracket to simulate the first round
  const firstRoundWinners = runBracket(initialTeams);

  // Creates the brackets for the second round
  const secondRound = [];
  for (let i = 0; i < firstRoundWinners.length; i += 2) {
    if (i + 1 < firstRoundWinners.length) {
      secondRound.push([firstRoundWinners[i], firstRoundWinners[i+1]]);
    } else {
      secondRound.push([firstRoundWinners[i]]);
    }
  }
  allRounds.push(secondRound);
  
  // Only proceed if we have enough teams for next round
  if (secondRound.flat().length >= 2) {
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
    
    // Only proceed if we have enough teams for final
    if (semifinals.flat().length >= 2) {
      const finalists = runBracket(semifinals.flat());

      // Creates the final match
      const final = [[finalists[0], finalists[1]]];
      allRounds.push(final);
     
      const champion = runBracket(final.flat())[0];
      
      return { rounds: allRounds, champion };
    } else {
      // If not enough for final, use the remaining team as champion
      const champion = semifinals.flat()[0];
      return { rounds: allRounds, champion };
    }
  } else {
    // If not enough for second round, use the remaining team as champion
    const champion = secondRound.flat()[0];
    return { rounds: allRounds, champion };
  }
}

/**
 * @returns {Object} - An object that returns the tournament rounds and the champion.
 */
export function getTournamentData(tournament) {
  try {
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