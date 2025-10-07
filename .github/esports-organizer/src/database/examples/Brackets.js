export default class Bracket {
  constructor(competitors) {
    this.competitors = [...competitors]; // Copy array of competitors
    this.matches = new Map(); // key: match id, value: match object
    this.nextRoundMatches = new Map(); // Matches for next round
    this._winnersCurrentRound = [];
  }

  // Shuffle competitors and create initial matches (first round)
  createInitialMatches() {
    const shuffled = this.shuffleArray(this.competitors);
    this.matches.clear();
    this.nextRoundMatches.clear();
    this._winnersCurrentRound = [];

    for (let i = 0; i < shuffled.length; i += 2) {
      const player1 = shuffled[i];
      const player2 = (i + 1 < shuffled.length) ? shuffled[i + 1] : null; // bye if odd

      const matchId = `${player1.id || player1.name}_vs_${player2 ? (player2.id || player2.name) : "BYE"}`;
      this.matches.set(matchId, {
        player1,
        player2,
        winner: null,
      });
    }
  }

  // Record result of a match and advance winner
  recordResult(matchId, winnerId) {
    const match = this.matches.get(matchId);
    if (!match) throw new Error("Match not found");
    if (![match.player1.id, match.player2?.id].includes(winnerId)) throw new Error("Invalid winner");

    match.winner = winnerId;
    this.advanceWinner(matchId);
  }

  // Advance winner to next round (basic pairing)
  advanceWinner(matchId) {
    const match = this.matches.get(matchId);
    if (!match.winner) throw new Error("Match winner not defined");

    this._winnersCurrentRound.push(match.winner);

    // When 2 winners collected, form next round match
    if (this._winnersCurrentRound.length === 2) {
      const p1 = this._winnersCurrentRound[0];
      const p2 = this._winnersCurrentRound[1];
      const nextMatchId = `${p1}_vs_${p2}`;

      this.nextRoundMatches.set(nextMatchId, {
        player1: p1,
        player2: p2,
        winner: null,
      });

      this._winnersCurrentRound = [];
      console.log(`Next round match created: ${nextMatchId}`);
    }
  }

  // Util function to randomly shuffle an array
  shuffleArray(arr) {
    let array = arr.slice();
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  forfeitMatch(matchId, forfeitingId) {
    const match = this.matches.get(matchId);
    if (!match) throw new Error('Match not found');
    const { player1, player2 } = match;
    // Determinar el ganador como el que no forfeitó
    const winnerId = (player1.id === forfeitingId) 
      ? (player2 && player2.id) 
      : player1.id;
    if (!winnerId) throw new Error('No opponent to advance');
    // Registrar como en recordResult
    match.winner = winnerId;
    this.advanceWinner(matchId);
  }

  undoMatchResult(matchId) { // En caso de querer deshacer un resultado
    const match = this.matches.get(matchId);
    if (!match) throw new Error('Match not found');
    // Quitar winner
    const prevWinner = match.winner;
    match.winner = null;
    // Remover de winners actuales si está pendiente
    const idx = this._winnersCurrentRound.indexOf(prevWinner);
    if (idx !== -1) this._winnersCurrentRound.splice(idx, 1);
    // Si ya se creó un siguiente match con ese ganador, se puede eliminar también.
  }
}
