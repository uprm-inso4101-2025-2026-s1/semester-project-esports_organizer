import Bracket from "../database/examples/Brackets.js";
import Team from "../database/examples/Teams.js";

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
        teams
    };
}

export function progressMatch(bracketState, matchId, winnerName) {
    const { bracket, currentRound, rounds } = bracketState;
    
    // Find the match in current round
    const currentMatches = rounds[currentRound - 1];
    const match = currentMatches.find(([id, _]) => id === matchId)?.[1];
    
    if (!match) return bracketState;

    const { player1, player2 } = match;
    
    // Record the winner
    let winnerId;
    if (player1.name === winnerName) {
        winnerId = player1.id;
    } else if (player2 && player2.name === winnerName) {
        winnerId = player2.id;
    } else {
        return bracketState;
    }

    // Resolve the actual key stored in bracket.matches (IDs can differ or be placeholders)
    let bracketKey = matchId;
    const normalize = (id) => id ? String(id).replace(/_pending$/,'') : null;

    if (!bracket.matches.has(bracketKey)) {
        const mp1Id = normalize(match.player1 && match.player1.id ? match.player1.id : (typeof match.player1 === 'string' ? match.player1 : null));
        const mp2Id = normalize(match.player2 && match.player2.id ? match.player2.id : (typeof match.player2 === 'string' ? match.player2 : null));

        // First try to find in bracket.matches by player id (order-insensitive)
        for (const [k, m] of bracket.matches.entries()) {
            const p1Id = normalize(m.player1 && m.player1.id ? m.player1.id : (typeof m.player1 === 'string' ? m.player1 : null));
            const p2Id = normalize(m.player2 && m.player2.id ? m.player2.id : (typeof m.player2 === 'string' ? m.player2 : null));
            if (mp1Id && mp2Id) {
                // both players present: unordered match
                if ((p1Id === mp1Id && p2Id === mp2Id) || (p1Id === mp2Id && p2Id === mp1Id)) {
                    bracketKey = k;
                    break;
                }
            } else if (mp1Id) {
                // only one player known (pending): match where either player equals mp1Id
                if (p1Id === mp1Id || p2Id === mp1Id) {
                    bracketKey = k;
                    break;
                }
            }
        }

        // If still not found, try nextRoundMatches as a candidate (sometimes winners are staged there)
        if (!bracket.matches.has(bracketKey)) {
            for (const [k, m] of bracket.nextRoundMatches.entries()) {
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
        }

        // As a last resort, if we can find the id inside the current round array (rounds[currentRound-1])
        // use that id and ensure bracket.matches contains the mapping (create it if necessary)
        if (!bracket.matches.has(bracketKey)) {
            const currentRoundArr = rounds[currentRound - 1] || [];
            for (const [rid, rmatch] of currentRoundArr) {
                const rmp1 = normalize(rmatch.player1 && rmatch.player1.id ? rmatch.player1.id : (typeof rmatch.player1 === 'string' ? rmatch.player1 : null));
                const rmp2 = normalize(rmatch.player2 && rmatch.player2.id ? rmatch.player2.id : (typeof rmatch.player2 === 'string' ? rmatch.player2 : null));
                if (mp1Id && mp2Id) {
                    if ((rmp1 === mp1Id && rmp2 === mp2Id) || (rmp1 === mp2Id && rmp2 === mp1Id)) {
                        bracketKey = rid;
                        // ensure bracket.matches knows about this mapping
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

    // Debug if we couldn't find the key
    if (!bracket.matches.has(bracketKey)) {
        console.error('Could not find match in bracket.matches for id:', matchId, 'resolvedKey:', bracketKey, 'bracket.matches keys:', Array.from(bracket.matches.keys()));
        // don't crash the entire UI; return state unchanged
        return bracketState;
    }

    // Record result and update bracket state
    bracket.recordResult(bracketKey, winnerId);
    
    // Create updated rounds array with winners progressing
    const updatedRounds = [...rounds];
    const placeholders = [];
    const winners = Array.from(bracket.nextRoundMatches.entries());
    
    // If we have winners ready to progress
    if (winners.length > 0) {
        for (const [nextMatchId, nextMatch] of winners) {
            // Convert player IDs to full team objects
            if (typeof nextMatch.player1 === "string") {
                nextMatch.player1 = bracketState.teams.find(t => t.id === nextMatch.player1);
            }
            if (typeof nextMatch.player2 === "string") {
                nextMatch.player2 = bracketState.teams.find(t => t.id === nextMatch.player2);
            }
            
            // Create match ID using team IDs
            const matchId = nextMatch.player1 && nextMatch.player2 ? 
                `${nextMatch.player1.id}_vs_${nextMatch.player2.id}` : 
                nextMatch.player1 ? `${nextMatch.player1.id}_pending` : nextMatchId;
                
            placeholders.push([matchId, nextMatch]);
        }
    }

    // Ensure there's a next-round array slot and put placeholders there
    if (updatedRounds.length > currentRound) {
        updatedRounds[currentRound] = placeholders;
    } else {
        updatedRounds.push(placeholders);
    }
    
    // Check if round is complete
    const isRoundComplete = Array.from(bracket.matches.values())
        .every(match => match.winner !== undefined);
        
    if (isRoundComplete) {
        // Set up next round
        bracket.matches = new Map(bracket.nextRoundMatches);
        bracket.nextRoundMatches.clear();
        
        if (bracket.matches.size > 0) {
            const nextRoundMatches = Array.from(bracket.matches.entries());
            const processedMatches = [];
            
            // Process each match for the next round
            for (const [nextMatchId, match] of nextRoundMatches) {
                // Convert player IDs to full team objects
                if (typeof match.player1 === "string") {
                    match.player1 = bracketState.teams.find(t => t.id === match.player1);
                }
                if (typeof match.player2 === "string") {
                    match.player2 = bracketState.teams.find(t => t.id === match.player2);
                }
                
                // Create consistent match ID using team IDs
                const matchId = match.player1 && match.player2 ? 
                    `${match.player1.id}_vs_${match.player2.id}` : 
                    nextMatchId;
                    
                processedMatches.push([matchId, match]);
            }
            
            // Update the bracket's match mapping
            bracket.matches = new Map(processedMatches);
            // set the resolved next round into the updated rounds list
            updatedRounds[currentRound] = processedMatches;

            return {
                bracket,
                currentRound: currentRound + 1,
                rounds: updatedRounds,
                teams: bracketState.teams  // Preserve teams array
            };
        }
    }
    
    return {
        bracket,
        currentRound,
        rounds: updatedRounds,
        teams: bracketState.teams  // Preserve teams array
    };
}

