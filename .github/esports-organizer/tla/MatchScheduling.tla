---- MODULE MatchScheduling ----
EXTENDS Naturals, FiniteSets

(*
  CONSTANTS
  ----------
  teams           : Set of all registered teams.
  possibleMatches : Set of all possible matches (team1, team2, time).
*)

CONSTANTS teams

possibleMatches == {
    <<"A", "B", 1>>,
    <<"C", "D", 1>>,
    <<"A", "C", 2>>,
    <<"B", "D", 2>>
}


(*
  VARIABLES
  ----------
  schedule : Set of scheduled matches in the system.
*)

VARIABLES schedule


(****************************************************************
 * INIT
 * --------------------------------------------------------------
 * The system begins with no scheduled matches.
 ****************************************************************)

Init ==
    schedule = {}


(****************************************************************
 * NEXT
 * --------------------------------------------------------------
 * Two possible transitions:
 *
 * 1. AddMatch  : Adds a new match to the schedule.
 * 2. NoChange  : Stuttering step allowed by TLA+.
 ****************************************************************)

AddMatch(match) ==
    /\ match \in possibleMatches
    /\ match \notin schedule
    /\ schedule' = schedule \cup {match}

NoChange ==
    schedule' = schedule

Next ==
    \E m \in possibleMatches: AddMatch(m)
    \/ NoChange


(****************************************************************
 * INVARIANTS
 * --------------------------------------------------------------
 * These properties must ALWAYS hold.
 *
 * 1. NoDuplicateTeamsSameTime :
 *    A team cannot play two matches at the same time.
 ****************************************************************)

NoDuplicateTeamsSameTime ==
    \A m1 \in schedule:
        \A m2 \in schedule:
            (m1 /= m2 /\ m1[3] = m2[3]) =>
                (/\ m1[1] /= m2[1]
                 /\ m1[1] /= m2[2]
                 /\ m1[2] /= m2[1]
                 /\ m1[2] /= m2[2])

Spec == Init /\ [][Next]_<<schedule>>

===============================================================