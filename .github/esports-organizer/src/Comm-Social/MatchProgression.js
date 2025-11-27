import Bracket from "../database/core/Brackets.js";
import Team from "../database/core/Teams.js";

/**
 * 
 * @param {Array<Team>} teams is an array of team objects with name and score properties
 * @returns {Object} returns the list of winners/losers in order of elimination 
 * and rounds which contains the matchups for each round
 */
export function initializeBracket(teams) {
    //Check if there is enough participants registered to have a tournament
    if(!Array.isArray(teams) || teams.length < 2){
        throw new Error("Not enough teams to run a tournament.");
    }

    const bracket = new Bracket(teams);
    bracket.createInitialMatches();
    const currentMatches = Array.from(bracket.matches.entries());
    
    // Initialize first round
    const initializedMatches = [];
    for (const [matchId, match] of currentMatches) {
        let { player1, player2 } = match;

        // Convert string IDs to full team objects
        if (typeof player1 === "string") {
            const fullTeam = teams.find(t => t.id === player1);
            if (fullTeam) {
                match.player1 = fullTeam;
            }
        }
        if (typeof player2 === "string") {
            const fullTeam = teams.find(t => t.id === player2);
            if (fullTeam) {
                match.player2 = fullTeam;
            }
        }

        // Reconstruct match ID with proper team IDs
        const newMatchId = `${match.player1.id}_vs_${match.player2 ? match.player2.id : "BYE"}`;
        initializedMatches.push([newMatchId, match]);

        // Update bracket's internal match mapping
        bracket.matches.delete(matchId);
        bracket.matches.set(newMatchId, match);
    }

    return {
        bracket,
        currentRound: 1,
        rounds: [initializedMatches],
        teams,
        initialMatchCount: initializedMatches.length,
        eliminationOrder: []  // Track teams as they're eliminated (first eliminated at index 0)
    };
}

/**
 * Helper function to build next round matches including partial matches
 * This is crucial because the Bracket class only creates matches when it has 2 winners,
 * but we need to show partial matches (with only 1 winner) in the UI
 */
function buildNextRoundMatches(bracket, teams, currentRoundIndex) {
    const nextRoundMatches = [];
    
    // First, add all complete matches from nextRoundMatches Map
    for (const [nextMatchId, nextMatch] of bracket.nextRoundMatches.entries()) {
        // Convert player IDs to full team objects
        let p1 = nextMatch.player1;
        let p2 = nextMatch.player2;
        
        if (typeof p1 === "string") {
            p1 = teams.find(t => t.id === p1) || p1;
        }
        if (typeof p2 === "string") {
            p2 = teams.find(t => t.id === p2) || p2;
        }
        
        // Create match ID using team IDs
        const formattedMatchId = p1 && p2 ? 
            `${p1.id}_vs_${p2.id}` : 
            (p1 ? `${p1.id}_pending` : nextMatchId);
        
        nextRoundMatches.push([formattedMatchId, {
            player1: p1,
            player2: p2,
            winner: nextMatch.winner
        }]);
    }
    
    // Now, check if there's a pending winner in _winnersCurrentRound
    // This happens when an odd number of matches have been completed
    if (bracket._winnersCurrentRound && bracket._winnersCurrentRound.length > 0) {
        console.log("Found pending winners:", bracket._winnersCurrentRound);
        
        // For each pending winner, create a partial match
        for (const winnerId of bracket._winnersCurrentRound) {
            const winner = teams.find(t => t.id === winnerId);
            if (winner) {
                const pendingMatchId = `${winner.id}_pending`;
                
                // Check if this match isn't already in nextRoundMatches
                const alreadyExists = nextRoundMatches.some(([id]) => 
                    id === pendingMatchId || id.includes(winner.id)
                );
                
                if (!alreadyExists) {
                    nextRoundMatches.push([pendingMatchId, {
                        player1: winner,
                        player2: null,
                        winner: null
                    }]);
                }
            }
        }
    }
    
    return nextRoundMatches;
}

export function progressMatch(bracketState, matchId, winnerName) {
    const { bracket, currentRound, rounds, initialMatchCount, eliminationOrder } = bracketState;
    console.log("=== PROGRESS MATCH START ===");
    console.log("Match ID:", matchId);
    console.log("Winner Name:", winnerName);
    console.log("Current Round:", currentRound);
    console.log("Initial match count for this round:", initialMatchCount);
    
    // Find the match in the ORIGINAL current round (not the incremented one)
    const currentMatches = rounds[currentRound - 1];
    if (!currentMatches) {
        console.error("No matches found for current round", currentRound);
        return bracketState;
    }
    
    const matchEntry = currentMatches.find(([id, _]) => id === matchId);
    if (!matchEntry) {
        console.error("Match not found in round", currentRound - 1, "Match ID:", matchId);
        console.error("Available matches:", currentMatches.map(([id]) => id));
        return bracketState;
    }
    
    const match = matchEntry[1];
    const { player1, player2 } = match;
    
    // Check if match already has a winner
    if (match.winner) {
        console.log("Match already has a winner, ignoring click");
        return bracketState;
    }
    
    // Record the winner and loser
    let winnerId, loserId, loser;
    if (player1.name === winnerName) {
        winnerId = player1.id;
        loserId = player2?.id;
        loser = player2;
    } else if (player2 && player2.name === winnerName) {
        winnerId = player2.id;
        loserId = player1.id;
        loser = player1;
    } else {
        console.error("Winner name doesn't match any player");
        return bracketState;
    }

    console.log("Winner ID:", winnerId);
    console.log("Loser ID:", loserId);
    
    // Add the loser to elimination order (first eliminated at index 0)
    const updatedEliminationOrder = [...eliminationOrder];
    if (loser) {
        updatedEliminationOrder.push(loser);
        console.log("Added to elimination order:", loser.name);
    }

    // Resolve the actual key stored in bracket.matches
    let bracketKey = matchId;
    const normalize = (id) => id ? String(id).replace(/_pending$/,'') : null;

    if (!bracket.matches.has(bracketKey)) {
        const mp1Id = normalize(match.player1 && match.player1.id ? match.player1.id : (typeof match.player1 === 'string' ? match.player1 : null));
        const mp2Id = normalize(match.player2 && match.player2.id ? match.player2.id : (typeof match.player2 === 'string' ? match.player2 : null));

        // Try to find in bracket.matches by player id (order-insensitive)
        for (const [k, m] of bracket.matches.entries()) {
            const p1Id = normalize(m.player1 && m.player1.id ? m.player1.id : (typeof m.player1 === 'string' ? m.player1 : null));
            const p2Id = normalize(m.player2 && m.player2.id ? m.player2.id : (typeof m.player2 === 'string' ? m.player2 : null));
            if (mp1Id && mp2Id) {
                if ((p1Id === mp1Id && p2Id === mp2Id) || (p1Id === mp2Id && p2Id === mp1Id)) {
                    bracketKey = k;
                    break;
                }
            } else if (mp1Id) {
                if (p1Id === mp1Id || p2Id === mp1Id) {
                    bracketKey = k;
                    break;
                }
            }
        }

        // Last resort: search in current round array
        if (!bracket.matches.has(bracketKey)) {
            const currentRoundArr = rounds[currentRound - 1] || [];
            for (const [rid, rmatch] of currentRoundArr) {
                const rmp1 = normalize(rmatch.player1 && rmatch.player1.id ? rmatch.player1.id : (typeof rmatch.player1 === 'string' ? rmatch.player1 : null));
                const rmp2 = normalize(rmatch.player2 && rmatch.player2.id ? rmatch.player2.id : (typeof rmatch.player2 === 'string' ? rmatch.player2 : null));
                if (mp1Id && mp2Id) {
                    if ((rmp1 === mp1Id && rmp2 === mp2Id) || (rmp1 === mp2Id && rmp2 === mp1Id)) {
                        bracketKey = rid;
                        if (!bracket.matches.has(bracketKey)) {
                            bracket.matches.set(bracketKey, rmatch);
                        }
                        break;
                    }
                } else if (mp1Id) {
                    if (rmp1 === mp1Id || rmp2 === mp1Id) {
                        bracketKey = rid;
                        if (!bracket.matches.has(bracketKey)) {
                            bracket.matches.set(bracketKey, rmatch);
                        }
                        break;
                    }
                }
            }
        }
    }

    if (!bracket.matches.has(bracketKey)) {
        console.error('Could not find match in bracket.matches');
        console.error('Match ID:', matchId);
        console.error('Resolved Key:', bracketKey);
        console.error('Bracket matches keys:', Array.from(bracket.matches.keys()));
        return bracketState;
    }

    console.log("Recording result with bracket key:", bracketKey);
    
    // Record result and update bracket state
    bracket.recordResult(bracketKey, winnerId);
    
    // Also update the match in our rounds array to mark it as complete
    match.winner = winnerId;
    
    console.log("After recording:");
    console.log("Bracket matches size:", bracket.matches.size);
    console.log("Next round matches size:", bracket.nextRoundMatches.size);
    console.log("Pending winners:", bracket._winnersCurrentRound);
    console.log("Next round matches:", Array.from(bracket.nextRoundMatches.entries()));
    console.log("Elimination order so far:", updatedEliminationOrder.map(t => t.name));
    
    // Create updated rounds array
    const updatedRounds = [...rounds];
    
    // Build next round matches (including partial matches with pending winners)
    const nextRoundMatchesArray = buildNextRoundMatches(bracket, bracketState.teams, currentRound);
    
    console.log("Built next round matches:", nextRoundMatchesArray);
    
    // Update or create the next round in the rounds array
    if (nextRoundMatchesArray.length > 0) {
        updatedRounds[currentRound] = nextRoundMatchesArray;
    }
    
    console.log("Updated rounds:", updatedRounds);
    
    // Check if current round is complete by counting completed matches in our rounds array
    // NOT by checking bracket.matches (which gets modified by Bracket.js)
    const currentRoundMatches = updatedRounds[currentRound - 1];
    const completedMatchesInRound = currentRoundMatches.filter(([_, m]) => m.winner !== undefined && m.winner !== null).length;
    const isRoundComplete = completedMatchesInRound === initialMatchCount;
    
    console.log(`Round completion: ${completedMatchesInRound}/${initialMatchCount} matches complete`);
    console.log("Is round complete?", isRoundComplete);
        
    if (isRoundComplete) {
        console.log("Round complete! Moving to next round");
        
        // Move to next round
        bracket.matches = new Map(bracket.nextRoundMatches);
        bracket.nextRoundMatches.clear();
        
        if (bracket.matches.size > 0) {
            const nextRoundMatches = Array.from(bracket.matches.entries());
            const processedMatches = [];
            
            // Process each match for the next round
            for (const [nextMatchId, nextMatch] of nextRoundMatches) {
                // Convert player IDs to full team objects
                if (typeof nextMatch.player1 === "string") {
                    nextMatch.player1 = bracketState.teams.find(t => t.id === nextMatch.player1);
                }
                if (typeof nextMatch.player2 === "string") {
                    nextMatch.player2 = bracketState.teams.find(t => t.id === nextMatch.player2);
                }
                
                // Create consistent match ID using team IDs
                const matchId = nextMatch.player1 && nextMatch.player2 ? 
                    `${nextMatch.player1.id}_vs_${nextMatch.player2.id}` : 
                    nextMatchId;
                    
                processedMatches.push([matchId, nextMatch]);
            }
            
            console.log("Processed matches for new current round:", processedMatches);
            
            // Update the bracket's match mapping
            bracket.matches = new Map(processedMatches);
            
            // Set the resolved next round into the updated rounds list
            updatedRounds[currentRound] = processedMatches;

            console.log("=== RETURNING NEW STATE (ROUND COMPLETE) ===");
            return {
                bracket,
                currentRound: currentRound + 1,
                rounds: updatedRounds,
                teams: bracketState.teams,
                initialMatchCount: processedMatches.length,
                eliminationOrder: updatedEliminationOrder
            };
        } else {
            // Tournament is complete - the last winner is the champion
            console.log("=== TOURNAMENT COMPLETE ===");
            const champion = bracketState.teams.find(t => t.id === winnerId);
            console.log("Champion:", champion?.name);
            console.log("Final elimination order:", updatedEliminationOrder.map(t => t.name));
            
            return {
                bracket,
                currentRound: currentRound + 1,
                rounds: updatedRounds,
                teams: bracketState.teams,
                initialMatchCount: 0,
                eliminationOrder: updatedEliminationOrder,
                champion: champion,
                isComplete: true
            };
        }
    }
    
    console.log("=== RETURNING NEW STATE (ROUND ONGOING) ===");
    return {
        bracket,
        currentRound,
        rounds: updatedRounds,
        teams: bracketState.teams,
        initialMatchCount,
        eliminationOrder: updatedEliminationOrder
    };
}

/**
 * Get tournament results in the format expected by resultReport
 * @param {Object} bracketState - The final bracket state after tournament completion
 * @returns {Object} - Object with results array (index 0 = first eliminated, index n-1 = champion)
 */
export function getTournamentResults(bracketState) {
    if (!bracketState.isComplete) {
        console.warn("Tournament is not yet complete");
        return {
            results: [],
            champion: null,
            rounds: bracketState.rounds
        };
    }
    
    // eliminationOrder already has teams in order: first eliminated at index 0
    // Just need to add the champion at the end
    const results = [...bracketState.eliminationOrder];
    if (bracketState.champion) {
        results.push(bracketState.champion);
    }
    
    console.log("Final results (first eliminated to champion):");
    results.forEach((team, index) => {
        console.log(`${index}: ${team.name}`);
    });
    
    return {
        results: results,  // Index 0 = first eliminated, index n-1 = champion
        champion: bracketState.champion,
        rounds: bracketState.rounds
    };
}