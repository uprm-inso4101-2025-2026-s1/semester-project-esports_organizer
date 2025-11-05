/**
 * Records the winner of a match between two teams
 * @param {Object} match The match object containing player1 and player2
 * @param {string} winnerName The name of the winning team
 * @returns {string} The ID of the winning team
 */
export function pickWinner(match, winnerName) {
    const { player1, player2 } = match;
    
    if (player1.name === winnerName) {
        return player1.id;
    } else if (player2 && player2.name === winnerName) {
        return player2.id;
    }
    
    return null;
}