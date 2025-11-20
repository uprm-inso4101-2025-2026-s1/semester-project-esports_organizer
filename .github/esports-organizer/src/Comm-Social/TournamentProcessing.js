import { runBracket } from "./MatchProgression.js";

/**
  * @returns {Object} - A object that returns the tournament rounds and the champion.
  * This function recieves a Tournament object and calls runBracket using the teams from the tournament
  * In case of error, it returns an object with empty rounds and null champion.
  *
  * 
*/
export function getTournamentData(tournament) {
  try {

    // Simulate the entire tournament and get the rounds and champion.
    const simulation = runBracket(tournament.teams);
    let result = simulation.rounds;
    let champion = simulation.results[simulation.results.length - 1];

    return {

      rounds: result,
      results: simulation.results,
      champion: champion

    };
    
  } catch (error) {
    console.error("Error initialization of tournament:", error);

    return {

      rounds: [],
      champion: null

    };
  }
}