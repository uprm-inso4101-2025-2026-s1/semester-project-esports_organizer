import Team from "../database/examples/Teams.js";
import Bracket from "../database/examples/Brackets.js";

const registeredTeams = [];
let eventStarted = false;



/**
 * Starts the event and does not allow any more registrations. 
 * @returns {void} 
 * Activates the event with a boolean and allows does not allow more registrations.
 */
export function startEvent() {
  eventStarted = true;
  console.log("Registration is not allowed, No more teams can join.\n");
}

/**
 * Reopens the event and does allows more registrations. 
 * @returns {void} 
 * ReActivates the event with a boolean and allows for tournament registration again.
 */
export function ReOpenEvent() {
    eventStarted = false;
    console.log("Registration for tournament is open again!.\n");
  }

/**
 * Registers a team valid and event has not started.
 * @param {string} team - The name of the team to confirm attendance for.
 * @returns {boolean} 
 * Checks if avent is ready for registering. 
 * Registers a team if valid and checks if it is not already registered for the event.
 * @throws {Error} If inserted an invalid form of a team.
 */
export function registerTeam(team,tournament) {
  if (eventStarted) {
    console.log("Registration is closed. The event has already started.\n");
    return false ;
  }

  if (!(team instanceof Team)) {
    throw new Error("Invalid team object.\n");
  }

  if (registeredTeams.some((t) => t.name === team.name)) {
    console.log(`${team.name} is already registered.\n`);
    return;
  }

  registeredTeams.push(team);
  tournament.addTeam(team)
  console.log(`${team.name} has been registered.\n`);
  return true;
}

/**
 * Confirms attendance for a registered team.
 * @param {string} teamName - The name of the team to confirm attendance for.
 * @returns {void} 
 * Confirms a team if valid and validates the attendance of the team and notifies if the team is not registered.
 */
export function confirmAttendance(teamName) {
  const team = registeredTeams.find((team) => team.name === teamName);

  if (!team) {
    console.log(`${teamName} has not been registered.\n`);
    return;
  }

  if (team.isConfirmed) {
    console.log(`${teamName} is already confirmed.\n`);
    return;
  }

  console.log(`${teamName} has confirmed attendance to the tournament.\n`);
}

/**
 * Unconfirms attendance for a registered team.
 * @param {string} teamName - The name of the team to unconfirm attendance for.
 * @returns {void}
 * Unconfirms a team if it confirmed and was registered.
 */
export function unconfirmAttendance(teamName) {
  const team = registeredTeams.find((team) => team.name === teamName);

  if(eventStarted && team.isConfirmed){
    console.log(`Unconfirming is not posible. the event started and the team ${teamName} has already confirmed attendance.\n`);
    return;
  }
  if (!team) {
    console.log(`${teamName} has not been registered.\n`);
    return;
  }

  if (!team.isConfirmed) {
    console.log(`${teamName} is not confirmed yet.\n`);
    return;
  }

  team.unconfirmTeam();
  console.log(`${teamName} has unconfirmed attendance to the tournament.\n`);
}

/**
 * Creates team Brackets for the tournament.
 * @returns {any[][]} An array of brackets with each bracket containing 2 teams.
 * Separates teams in brackets of 2 each if the team is confirmed for the Tournament.
 * @throws {Error} If less than two teams have confirmed attendance.
 */
export function assignBrackets(teams) {
   if (!Array.isArray(teams)) teams = [];
  
  if (teams.length < 2) {
    throw new Error("Not enough teams for a bracket");
  }

  const bracket = new Bracket(teams);
  bracket.createInitialMatches();
  
  console.log("Team Brackets Initialized\n");

  // Convert matches Map to array of arrays: [player1, player2]
  const initialBrackets = Array.from(bracket.matches.values()).map(match => {
    // player2 may be null for a bye
    return match.player2 ? [match.player1, match.player2] : [match.player1];
  });

  return initialBrackets;
}

// // TEST CODE

// //Registering teams and starting event test
// console.log("Test\n");

// // const team1 = new Team("Faze");
// // const team2 = new Team("Lions");
// // const team3 = new Team("Tarzans");
// // const team4 = new Team("Monkis");
// // const team5 = new Team("Jibaros");
// // const team6 = new Team("Incredibles");
// registerTeam(team1,tournament);
// registerTeam(team2,tournament);
// registerTeam(team3,tournament);
// registerTeam(team4,tournament);
// startEvent(); 
// registerTeam(team5,tournament);
// registerTeam(team6,tournament);

// confirmAttendance("Faze");
// confirmAttendance("Lions");
// confirmAttendance("Tarzans");
// confirmAttendance("Monkis");
// confirmAttendance("Jibaros");
// confirmAttendance("Incredibles");

// const brackets1 = assignBrackets(registeredTeams);
// console.log("Brackets:", brackets1);

// // //Reopen Event and register more teams test
// ReOpenEvent();
//  registerTeam(team5,tournament);
//  registerTeam(team6,tournament);
//  startEvent();

// // //Unconfirming before even confirming test
//  unconfirmAttendance("Jibaros");

//  confirmAttendance("Jibaros");
//  confirmAttendance("Incredibles");

// // //Double confirm test
//  confirmAttendance("Faze");

// // //Team Unconfirmation test
// unconfirmAttendance("Incredibles");

//  const brackets2 = assignBrackets(registeredTeams);
//  console.log("Brackets:", brackets2);