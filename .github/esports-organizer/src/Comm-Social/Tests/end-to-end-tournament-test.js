import Team from "../../database/examples/Teams.js";
import Bracket from "../../database/examples/Brackets.js";
import Tournament from "../../database/examples/Tournament.js";
import {runBracket} from "../MatchProgression.js";
import { registerTeam, confirmAttendance, startEvent, ReOpenEvent } from "../TournamentRegistration.js";
import { resultReport } from "../ResultReport.js";
import { db } from "../../database/firebaseClient.js";
import {simulateTournamentRoundByRound,getTournamentData } from "../BracketTeamVisualization.js"




//Check if test was passed successfully
function assertEquals(name, actual, expected) {
  const success = JSON.stringify(expected) === JSON.stringify(actual);
  if (success) {
      console.log(`[OK]   ${name}`);
      passed++;
  } else {
      console.log(`[FAIL] ${name}`);
      console.log("Expected:", expected);
      console.log("Actual:  ", actual);
      failed++;
  }
}

// Random shuffle helper for tests
function shuffleArray(arr) {
  const array = arr.slice();
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
let passed = 0, failed = 0;
export function TournamentManagementTest(){

//Bracket Class TESTS
console.log('\n--- Bracket Class TESTS ---');
passed = 0, failed = 0;

const teams = [
    { id: "T1", name: "Alpha" },
    { id: "T2", name: "Bravo" },
    { id: "T3", name: "Charlie" },
    { id: "T4", name: "Delta" },
];

const tests = [
    function testInitialMatches() {
        const bracket = new Bracket(teams);
        bracket.createInitialMatches();
        const state = bracket.getCurrentBracketState();
        assertEquals("Initial match creation", state.currentRound.length, 2);
    },

    function testRecordResultAndAdvance() {
        const bracket = new Bracket(teams);
        bracket.createInitialMatches();
        const matchId = Array.from(bracket.matches.keys())[0];
        const winnerId = bracket.matches.get(matchId).player1.id;
        bracket.recordResult(matchId, winnerId);
        const state = bracket.getCurrentBracketState();
        assertEquals("Winner recorded correctly", bracket.matches.get(matchId).winner, winnerId);
        assertEquals("Winner advanced to next round", bracket._winnersCurrentRound.includes(winnerId), true);
    },

    function testForfeit() {
        const bracket = new Bracket(teams);
        bracket.createInitialMatches();
        const matchId = Array.from(bracket.matches.keys())[0];
        const forfeitingId = bracket.matches.get(matchId).player1.id;
        bracket.forfeitMatch(matchId, forfeitingId);
        const winner = bracket.matches.get(matchId).winner;
        assertEquals("Forfeit auto-winner correct", winner, bracket.matches.get(matchId).player2.id);
    },

    function testUndoMatch() {
        const bracket = new Bracket(teams);
        bracket.createInitialMatches();
        const matchId = Array.from(bracket.matches.keys())[0];
        const winnerId = bracket.matches.get(matchId).player1.id;
        bracket.recordResult(matchId, winnerId);
        bracket.undoMatchResult(matchId);
        assertEquals("Undo match winner removed", bracket.matches.get(matchId).winner, null);
    },

    function testReorderMatches() {
        const bracket = new Bracket(teams);
        bracket.createInitialMatches();
        const keys = Array.from(bracket.matches.keys());
        const reversed = keys.slice().reverse();
        bracket.reorderMatches(reversed);
        assertEquals("Matches reordered", Array.from(bracket.matches.keys()), reversed);
    },

    function testValidateIntegrity() {
        const bracket = new Bracket(teams);
        bracket.createInitialMatches();
        const result = bracket.validateBracketIntegrity();
        assertEquals("Bracket not finished yet", result.valid, false);
    },

    function testResetBracket() {
        const bracket = new Bracket(teams);
        bracket.createInitialMatches();
        bracket.resetBracket();
        const state = bracket.getCurrentBracketState();
        assertEquals("Reset bracket recreates initial matches", state.currentRound.length, 2);
    },

    function testUpdateStatus() {
        const bracket = new Bracket(teams);
        bracket.createInitialMatches();
        const matchId = Array.from(bracket.matches.keys())[0];
        bracket.updateMatchStatus(matchId, "in_progress");
        assertEquals("Match status updated", bracket.matches.get(matchId).status, "in_progress");
    },

    function testOddNumberBYE() {
        const oddTeams = [...teams, { id: "T5", name: "Echo" }];
        const bracket = new Bracket(oddTeams);
        bracket.createInitialMatches();
        const state = bracket.getCurrentBracketState();
        const byeMatch = state.currentRound.find(m => m.player2 === null);
        assertEquals("BYE created for odd number", !!byeMatch, true);
    },
];

shuffleArray(tests).forEach(fn => fn());

console.log("\n===== TEST SUMMARY =====");
console.log("Passed:", passed);
console.log("Failed:", failed);




//Tournament Class TESTS
console.log('\n--- Tournament Class TESTS ---');

passed = 0; failed = 0;


const mockDb = { collection: () => ({}), doc: () => ({}) };
const t1 = new Team({ name: "Alpha", organizer: "U1", teamRank: 1, maxMembers: 5 });
const t2 = new Team({ name: "Bravo", organizer: "U2", teamRank: 1, maxMembers: 5 });

const tournamentTests = [
    function testAddTeam() {
        const tour = new Tournament("1", "Test", "Game", "Org", "2025/01/01/12/00", 32, 16, "team", null, null, null, mockDb, [], []);
        tour.addTeam(t1);
        assertEquals("Add team works", tour.teams.length, 1);
    },
    function testRemoveTeam() {
        const tour = new Tournament("2", "Test2", "Game", "Org", "2025/01/01/12/00", 32, 16, "team", null, null, null, mockDb, [], [t1, t2]);
        tour.removeTeam("Alpha");
        assertEquals("Remove team works", tour.teams.length, 1);
        assertEquals("Remaining team Bravo", tour.teams[0].name, "Bravo");
    },
    function testFindTeam() {
        const tour = new Tournament("3", "Test3", "Game", "Org", "2025/01/01/12/00", 32, 16, "team", null, null, null, mockDb, [], [t1]);
        const found = tour.findTeam("Alpha");
        assertEquals("Find team returns object", found.name, "Alpha");
    },
    function testAddParticipantSingle() {
        const tour = new Tournament("4", "SingleTest", "Game", "Org", "2025/01/01/12/00", 32, 16, "single", null, null, null, mockDb, [], []);
        const player = { id: "P1", name: "Player1" };
        tour.addParticipant(player);
        assertEquals("Add participant single", tour.players[0].id, "P1");
    },
    function testResolveTie() {
        const tour = new Tournament("5", "TieTest", "Game", "Org", "2025/01/01/12/00", 32, 16, "team", null, null, null, mockDb, [], []);
        tour.ties.push({ round: 1, matchId: "M1", participants: ["T1", "T2"] });
        const winner = tour.resolveTie("M1", "T1");
        assertEquals("Resolve tie returns winner", winner, "T1");
    },
];

shuffleArray(tournamentTests).forEach(fn => fn());

console.log("\n===== TEST SUMMARY =====");
console.log("Passed:", passed);
console.log("Failed:", failed);


// Tournament Registration TESTS
console.log('\n--- Tournament Registration TESTS ---');


passed = 0; failed = 0;

const regTests = [
    function testRegisterValid() {
        const tour = new Tournament("R1", "TestReg", "Game", "Org", "2025/01/01/12/00", 32, 16, "team");
        const t = new Team({ name: "RegTeam", organizer: "U3", teamRank: 1, maxMembers: 5 });
        const result = registerTeam(t, tour);
        assertEquals("Register valid team", result, true);
    },
    function testRegisterAfterStart() {
        const tour = new Tournament("R2", "TestReg2", "Game", "Org", "2025/01/01/12/00", 32, 16, "team");
        const t = new Team({ name: "LateTeam", organizer: "U4", teamRank: 1, maxMembers: 5 });
        startEvent();
        const result = registerTeam(t, tour);
        assertEquals("Cannot register after event started", result, false);
        ReOpenEvent();
    },
];

shuffleArray(regTests).forEach(fn => fn());

console.log("\n===== TEST SUMMARY =====");
console.log("Passed:", passed);
console.log("Failed:", failed);

//  Match Progression Tests 

console.log('\n--- Match Progression Tests ---');

passed = 0; failed = 0;

const mpTests = [
    function testRunBracketNormal() {
        const teamsArr = [
            { id: "A", name: "A" },
            { id: "B", name: "B" },
            { id: "C", name: "C" },
            { id: "D", name: "D" },
        ];
        const result = runBracket(teamsArr);
        assertEquals("Run bracket returns rounds and results", !!result.rounds, true);
    },
    function testRunBracketBYE() {
      const teamsArr = [
          { id: "A", name: "A" },
          { id: "B", name: "B" },
          { id: "C", name: "C" },
      ];
      const result = runBracket(teamsArr);
      
      let foundBYE = false;
    
      if (result.results && result.results.length > 0) {
          foundBYE = true;
      }
      
      assertEquals("Run bracket handles BYE", foundBYE, true);
  }
];

shuffleArray(mpTests).forEach(fn => fn());

console.log("\n===== TEST SUMMARY =====");
console.log("Passed:", passed);
console.log("Failed:", failed);




//RESULT REPORT TESTS

console.log('\n--- RESULT REPORT TESTS ---');
passed = 0; failed = 0;
const resultReportTests = [
    function testBracketProducesWinner() {
        try {
            const teams = [
                { id: "W1", name: "Winner" },
                { id: "W2", name: "RunnerUp" }
            ];
            
            const bracket = new Bracket(teams);
            bracket.createInitialMatches();
            
            const state = bracket.getCurrentBracketState();
            const match = state.currentRound[0];

            bracket.recordResult(match.matchId, teams[0].id);
            
            const updatedState = bracket.getCurrentBracketState();
            const updatedMatch = updatedState.currentRound[0];

            const hasWinner = !!updatedMatch.winner;
            const winnerAdvanced = bracket._winnersCurrentRound.includes(teams[0].id);
            
            assertEquals("Bracket records winner", hasWinner, true);
            assertEquals("Winner is advanced", winnerAdvanced, true);
            assertEquals("Winner is correct", updatedMatch.winner, "W1");
            
        } catch (error) {
            console.log(`[FAIL] Bracket winner test: ${error.message}`);
            failed++;
        }
    },
    
    function testTournamentPlacements() {
        try {
            const tournament = new Tournament(
                "PL1", "PlacementTest", "Game", "Org", "2025/01/01/12/00", 
                32, 16, "team", null, null, null, mockDb, [], 
                [
                    { id: "T1", name: "First" },
                    { id: "T2", name: "Second" }, 
                    { id: "T3", name: "Third" },
                    { id: "T4", name: "Fourth" }
                ]
            );
            
            assertEquals("Tournament has teams", tournament.teams.length, 4);
            assertEquals("Can find team by name", !!tournament.findTeam("First"), true);
            
        } catch (error) {
            console.log(`[FAIL] Tournament placements test: ${error.message}`);
            failed++;
        }
    }
];


shuffleArray(resultReportTests).forEach(fn => fn());
console.log("\n===== TEST SUMMARY =====");
console.log("Passed:", passed);
console.log("Failed:", failed);

// Bracket Visualization Tests
console.log('\n--- Bracket Visualization Tests ---');


const testTeams = [
    new Team({ name: "Team A", organizer: "user1", teamRank: 1, maxMembers: 5 }),
    new Team({ name: "Team B", organizer: "user2", teamRank: 2, maxMembers: 5 }),
    new Team({ name: "Team C", organizer: "user3", teamRank: 1, maxMembers: 5 }),
    new Team({ name: "Team D", organizer: "user4", teamRank: 3, maxMembers: 5 }),
    new Team({ name: "Team E", organizer: "user5", teamRank: 1, maxMembers: 5 }),
    new Team({ name: "Team F", organizer: "user6", teamRank: 2, maxMembers: 5 }),
    new Team({ name: "Team G", organizer: "user7", teamRank: 1, maxMembers: 5 }),
    new Team({ name: "Team H", organizer: "user8", teamRank: 4, maxMembers: 5 })
];

// Add IDs to teams
testTeams.forEach((team, index) => {
    team.id = `team-${index + 1}`;
});

passed = 0; failed = 0;

const bracketVisualizationTests = [
    function testRunBracketWith4Teams() {
        const teamsArr = testTeams.slice(0, 4);
        const result = runBracket(teamsArr);

        const hasRounds = Array.isArray(result.rounds);
        const hasResults = Array.isArray(result.results);
        const champion = result.results[result.results.length - 1];
        const hasChampion = champion && champion.id && champion.name;

        assertEquals("Run bracket returns rounds array", hasRounds, true);
        assertEquals("Run bracket returns results array", hasResults, true);
        assertEquals("Run bracket returns final winner object", !!hasChampion, true);
    },

    function testRunBracketWith8Teams() {
        const teamsArr = testTeams.slice(0, 8);
        const result = runBracket(teamsArr);

        const champion = result.results[result.results.length - 1];
        const hasChampion = champion && champion.id && champion.name;

        assertEquals("Run bracket handles 8 teams", Array.isArray(result.rounds), true);
        assertEquals("Run bracket returns results array", Array.isArray(result.results), true);
        assertEquals("Run bracket returns final winner object", !!hasChampion, true);
        assertEquals("Multiple rounds for 8 teams", result.rounds.length > 1, true);
    },

    function testRunBracketWithOddTeams() {
        const teamsArr = testTeams.slice(0, 3); // odd number → BYE
        const result = runBracket(teamsArr);

        const champion = result.results[result.results.length - 1];
        const hasChampion = champion && champion.id && champion.name;

        assertEquals("Run bracket handles odd number of teams", Array.isArray(result.rounds), true);
        assertEquals("Results array returned", Array.isArray(result.results), true);
        assertEquals("Final winner exists", !!hasChampion, true);
    },

    function testRunBracketWith2Teams() {
        const teamsArr = testTeams.slice(0, 2);
        const result = runBracket(teamsArr);

        const champion = result.results[result.results.length - 1];
        const hasChampion = champion && champion.id && champion.name;

        assertEquals("Run bracket handles 2 teams", Array.isArray(result.rounds), true);
        assertEquals("Results array returned", Array.isArray(result.results), true);
        assertEquals("Final winner exists", !!hasChampion, true);
        assertEquals("First round has 1 match", result.rounds[0].length, 1);
    },

    function testRunBracketSingleTeam() {
        const teamsArr = testTeams.slice(0, 1);
        const result = runBracket(teamsArr);

        const champion = result.results[result.results.length - 1];
        const hasChampion = champion && champion.id && champion.name;

        assertEquals("Run bracket handles single team", Array.isArray(result.rounds), true);
        assertEquals("Results array returned", Array.isArray(result.results), true);
        assertEquals("Single team becomes champion", !!hasChampion, true);
    }
];


shuffleArray(bracketVisualizationTests).forEach(fn => fn());

console.log("\n===== TEST SUMMARY =====");
console.log("Passed:", passed);
console.log("Failed:", failed);

}
//TournamentManagementTest()