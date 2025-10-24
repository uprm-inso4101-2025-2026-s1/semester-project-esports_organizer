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

  getCurrentBracketState() {
    // Convierte el Map de matches y nextRoundMatches a objetos planos para acceso e iteración
    const currentRound = Array.from(this.matches.entries()).map(([id, match]) => ({
      matchId: id,
      ...match // operador de propagacion copia todas las propiedades del objeto match
    }));

    const nextRound = Array.from(this.nextRoundMatches.entries()).map(([id, match]) => ({
      matchId: id,
      ...match
    }));

    return {
      currentRound,
      nextRound
    };
  }

  validateBracketIntegrity() {
    // Recorre todos los matches actuales para verificar que todos tengan ganador definido
    for (const [matchId, match] of this.matches.entries()) {
      if (!match.winner) {
        // Error o aviso: partido aún no decidido, no se puede avanzar
        return {
          valid: false,
          message: `Match ${matchId} is not finished yet.`
        };
      }
    }
    // Si no hay matches sin ganador, la integridad se mantiene
    return {
      valid: true,
      message: 'Bracket integrity validated successfully.'
    };
  }

  resetBracket(){
    //Limpia los matches y rondas para reiniciar
    this.matches.clear();
    this.nextRoundMatches.clear();
    this._winnersCurrentRound = [];

    //Recrea los matches iniciales con competidores actuales, sirve si se quiere reutilizar
    this.createInitialMatches();
  }

  reorderMatches(newOrder) {
    // newOrder es un array con los matchIds en el orden deseado
    const reordered = new Map();
    for (const matchId of newOrder) {
      if (!this.matches.has(matchId)) {
        throw new Error(`Match ID ${matchId} not found`);
      }
      reordered.set(matchId, this.matches.get(matchId));
    }
    this.matches = reordered;
  }
  /*  Ejemplo para llamar reorder matches:
  bracket.reorderMatches([
    'player5_vs_player6',
    'player1_vs_player2',
    'player3_vs_player4'
  ]);

  Usa lo que creamos para el matchID
  ---> const matchId = `${player1.id || player1.name}_vs_${player2 ? (player2.id || player2.name) : "BYE"}`;
  */

  updateMatchStatus(matchId, status) { // Podemos controlar el estado del match en cualquier momento de ser necesario
    const validStatuses = ['pending', 'in_progress', 'finished', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status '${status}'. Valid statuses are: ${validStatuses.join(', ')}`);
    }

    const match = this.matches.get(matchId);
    if (!match) {
      throw new Error('Match not found');
    }

    match.status = status;
  }

  /*
   * Guarda todos los matches del bracket en Firestore bajo el torneo dado
   */
  async saveAllMatchesToFirestore(tournamentId) {
    const matchesArray = [...this.matches.entries()];
    for (const [matchId, matchData] of matchesArray) {
      const matchRef = doc(collection(firestore, `tournaments/${tournamentId}/matches`), matchId);
      await setDoc(matchRef, matchData);
    }
  }

    static async loadBracketFromFirestore(tournamentId) {
    const matchesSnapshot = await getDocs(collection(firestore, `tournaments/${tournamentId}/matches`));
    const matches = [];
    matchesSnapshot.forEach(doc => {
      matches.push({ matchId: doc.id, ...doc.data() });
    });
        const bracket = new Bracket([]); // Competitors pueden agregarse aparte si necesario
    matches.forEach(m => {
      bracket.matches.set(m.matchId, m);
      if (m.winner) bracket._winnersCurrentRound.push(m.winner);
    });
    return bracket;
  }

    static listenBracketMatches(tournamentId, callback) {
    return onSnapshot(
      collection(firestore, `tournaments/${tournamentId}/matches`),
      callback
    );
  }
}
