import Bracket from "../database/examples/Brackets.js";
import Team from "../database/examples/Teams.js";

/**
 * Runs a tournament bracket for a list of teams.
 * @param {Array} teams - Array of team objects with id and name
 * @returns {Object} - { results: array of eliminated teams in order, rounds: array of matches per round, champion: final winner object }
 */
export function runBracket(teams) {   
  // Validate input
  if (!Array.isArray(teams) || teams.length === 0) {
      throw new Error("No teams provided.");
  }

  // Single-team tournament: auto-champion
  if (teams.length === 1) {
      console.log(`Only one team, ${teams[0].name} is the champion by default.`);
      return {
          results: [teams[0]],
          rounds: [],
          champion: teams[0]
      };
  }

  if (teams.length < 2) {
      throw new Error("Not enough teams to run a tournament.");
  }

  const bracket = new Bracket(teams);
  bracket.createInitialMatches();

  let finalTeamList = [];
  let round = 1;
  let rounds = [];

  while (bracket.matches && bracket.matches.size > 0) {
      console.log(`\n--- Round ${round} ---`);
      const currentMatches = Array.from(bracket.matches.entries());
      rounds.push(currentMatches);

      for (const [matchId, match] of currentMatches) {
          let { player1, player2 } = match;

          // Resolve player objects if IDs are stored
          if (typeof player1 === "string") {
              player1 = teams.find(t => t.id === player1);
              match.player1 = player1;
          }
          if (typeof player2 === "string") {
              player2 = teams.find(t => t.id === player2) || null;
              match.player2 = player2;
          }

          // Skip invalid matches
          if (!player1 || !player1.id) continue;
          if (player2 && !player2.id) continue;

          // Handle BYE
          if (!player2) {
              console.log(`${player1.name} advances automatically (BYE)`);
              bracket.recordResult(matchId, player1.id);
              continue;
          }

          // Simulate match scores
          const score1 = Math.round(Math.random() * 150);
          const score2 = Math.round(Math.random() * 150);

          console.log(`${player1.name} (${score1}) vs ${player2.name} (${score2})`);

          if (score1 > score2) {
              finalTeamList.push(player2);
              console.log(`Winner: ${player1.name}`);
              bracket.recordResult(matchId, player1.id);
          } else if (score2 > score1) {
              finalTeamList.push(player1);
              console.log(`Winner: ${player2.name}`);
              bracket.recordResult(matchId, player2.id);
          } else {
              // Tie-breaker
              const winner = Math.random() < 0.5 ? player1 : player2;
              finalTeamList.push(winner === player1 ? player2 : player1);
              console.log(`Tie! Randomly selected winner: ${winner.name}`);
              bracket.recordResult(matchId, winner.id);
          }
      }

      // Prepare next round
      bracket.matches = new Map(bracket.nextRoundMatches);  
      bracket.nextRoundMatches.clear();
      round++;
  }

  // Final winner
  const finalWinnerId = bracket._winnersCurrentRound?.[0];
  const finalWinner = teams.find(t => t.id === finalWinnerId);
  if (finalWinner) finalTeamList.push(finalWinner);
  console.log(`\nChampion: ${finalWinner?.name || "Unknown"}\n`);

  return {
      results: finalTeamList,
      rounds: rounds,
      champion: finalWinner || null
  };
}
