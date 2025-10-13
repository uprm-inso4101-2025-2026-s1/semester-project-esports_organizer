'use strict';

function recalculateBracket({ matchId }) {
  return {
    lastRecalcAt: Date.now(),
    sourceMatchId: matchId,
  };
}

module.exports = { recalculateBracket };
