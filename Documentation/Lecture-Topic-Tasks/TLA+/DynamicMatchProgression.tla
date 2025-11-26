---- MODULE DynamicMatchProgression ----
EXTENDS Integers, Sequences, FiniteSets, TLC

(*
TLA+ Model for Tournament Bracket Progression
Based on an analysis of MatchProgression.js, ResultReport.js, and BracketsTournamentPage.jsx

Key behaviors modeled:
- Single elimination bracket tournament
- Match progression with winner selection
- Round completion detection
- Elimination order tracking
- Tournament termination with champion
*)

CONSTANTS NumTeams, Teams

(* === TYPE DEFINITIONS === *)
MatchStatus == {"pending", "completed"}
Team == 1..NumTeams

Match == [ 
    id: Nat, 
    player1: Team \union {0},  (* 0 represents no player/bye *)
    player2: Team \union {0}, 
    winner: Team \union {0},   (* 0 = no winner yet *)
    status: MatchStatus 
]

TournamentState == [
    rounds: Seq(Seq(Match)),
    currentRound: Int,
    eliminationOrder: Seq(Team),
    champion: Team \union {0},
    isComplete: BOOLEAN
]

(* === VARIABLES === *)
VARIABLES tournamentState

(* === HELPER FUNCTIONS === *)
InitializeFirstRound() ==
    LET initialMatches == [r \in 1..(NumTeams \div 2) |-> 
          [id |-> r, 
           player1 |-> (2*r - 1), 
           player2 |-> (2*r),
           winner |-> 0,
           status |-> "pending"]]
    IN <<initialMatches>>

GetCurrentRoundMatches(state) ==
    state.rounds[state.currentRound]

AllMatchesCompleted(matches) ==
    \A m \in matches: m.status = "completed"

GetWinner(match) ==
    IF match.winner = 0 THEN 0 ELSE match.winner

GetLoser(match) ==
    IF match.winner = match.player1 THEN match.player2 ELSE match.player1

IsTournamentComplete(state) ==
    state.currentRound > Log2(NumTeams) + 1 \/ state.isComplete

(* === INITIAL STATE === *)
Init ==
    /\ tournamentState = [ 
          rounds |-> InitializeFirstRound(),
          currentRound |-> 1, 
          eliminationOrder |-> <<>>,
          champion |-> 0,
          isComplete |-> FALSE 
      ]

(* === NEXT STATE RELATION === *)
ProgressMatch(matchIndex, winner) ==
    LET currentMatches == GetCurrentRoundMatches(tournamentState)
        match == currentMatches[matchIndex]
        loser == GetLoser([match EXCEPT !.winner = winner])
        updatedMatch == [match EXCEPT !.winner = winner, !.status = "completed"]
        updatedEliminationOrder == 
            IF loser # 0 THEN Append(tournamentState.eliminationOrder, loser)
            ELSE tournamentState.eliminationOrder
    IN
    /\ match.status = "pending"
    /\ winner \in {match.player1, match.player2} \ {0}
    /\ tournamentState' = [tournamentState EXCEPT 
          !.rounds[currentRound] = [i \in 1..Len(currentMatches) |-> 
              IF i = matchIndex THEN updatedMatch ELSE currentMatches[i]],
          !.eliminationOrder = updatedEliminationOrder]

AdvanceRound ==
    LET currentMatches == GetCurrentRoundMatches(tournamentState)
        nextRound == tournamentState.currentRound + 1
        winners == { GetWinner(m) : m \in currentMatches } \ {0}
    IN
    /\ AllMatchesCompleted(currentMatches)
    /\ nextRound <= Log2(NumTeams) + 1
    /\ tournamentState' = [tournamentState EXCEPT 
          !.currentRound = nextRound,
          !.rounds[nextRound] = 
              IF nextRound = 2 THEN [i \in 1..(NumTeams \div 4) |->
                    [id |-> i + NumTeams \div 2,
                     player1 |-> winners[2*i - 1],
                     player2 |-> winners[2*i], 
                     winner |-> 0,
                     status |-> "pending"]]
              ELSE IF nextRound = 3 THEN <<
                    [id |-> NumTeams - 1,
                     player1 |-> winners[1],
                     player2 |-> winners[2],
                     winner |-> 0,
                     status |-> "pending"] >>
              ELSE << >>  (* Finals *)
    ]

DeclareChampion ==
    LET currentMatches == GetCurrentRoundMatches(tournamentState)
        finalMatch == currentMatches[1]
    IN
    /\ tournamentState.currentRound = Log2(NumTeams) + 1
    /\ AllMatchesCompleted(currentMatches)
    /\ tournamentState' = [tournamentState EXCEPT
          !.champion = finalMatch.winner,
          !.isComplete = TRUE]

Next ==
    \/ \E matchIndex \in 1..Len(GetCurrentRoundMatches(tournamentState)):
         \E winner \in Team: ProgressMatch(matchIndex, winner)
    \/ AdvanceRound
    \/ DeclareChampion

(* === PROPERTIES AND INVARIANTS === *)
TypeInvariant ==
    /\ tournamentState.currentRound \in 1..(Log2(NumTeams) + 1)
    /\ \A team \in tournamentState.eliminationOrder: team \in Team
    /\ tournamentState.champion \in Team \union {0}
    /\ \A round \in 1..Len(tournamentState.rounds):
         \A match \in tournamentState.rounds[round]:
             match.player1 \in Team \union {0}
             /\ match.player2 \in Team \union {0}
             /\ match.winner \in Team \union {0}

NoDuplicateEliminations ==
    \A i, j \in 1..Len(tournamentState.eliminationOrder):
        i # j => tournamentState.eliminationOrder[i] # tournamentState.eliminationOrder[j]

EveryTeamEliminatedOrChampion ==
    tournamentState.isComplete =>
        Len(tournamentState.eliminationOrder) = NumTeams - 1

TournamentTerminates ==
    <> tournamentState.isComplete

NoDeadlock ==
    ~ENABLED Next => tournamentState.isComplete

Spec == Init /\ [][Next]_<<tournamentState>>

====