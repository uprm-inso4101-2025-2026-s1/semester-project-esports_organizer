import { runBracket } from "./MatchProgression";

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