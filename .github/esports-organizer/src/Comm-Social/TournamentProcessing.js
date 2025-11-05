import { initializeBracket } from "./MatchProgression";

/**
  * @returns {Object} - An object that contains the initial tournament bracket state.
  * This function receives a Tournament object and initializes the bracket structure
  * with the tournament teams. Instead of simulating the entire tournament at once,
  * it now sets up the initial state for interactive progression.
  * In case of error, it returns an object with empty rounds and null champion.
  *
  * 
*/
export function getTournamentData(tournament) {
  try {
    // Initialize the tournament bracket structure
    const bracketState = initializeBracket(tournament.teams);
    
    return {
      rounds: bracketState.rounds,
      currentRound: bracketState.currentRound,
      bracket: bracketState.bracket,
      champion: null // Champion will be determined through user interaction
    };
    
  } catch (error) {
    console.error("Error initialization of tournament:", error);

    return {
      rounds: [],
      currentRound: 0,
      bracket: null,
      champion: null
    };
  }
}
    
