import Team from "../team.js";;

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
 * @returns {void} 
 * Checks if avent is ready for registering. 
 * Registers a team if valid and checks if it is not already registered for the event.
 * @throws {Error} If inserted an invalid form of a team.
 */
export function registerTeam(team) {
  if (eventStarted) {
    console.log("Registration is closed. The event has already started.\n");
    return;
  }

  if (!(team instanceof Team)) {
    throw new Error("Invalid team object.\n");
  }

  if (registeredTeams.some((t) => t.name === team.name)) {
    console.log(`${team.name} is already registered.\n`);
    return;
  }

  registeredTeams.push(team);
  console.log(`${team.name} has been registered.\n`);
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

  team.confirmTeam();
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
export function assignBrackets() {
  const confirmedTeams = registeredTeams.filter((team) => team.isConfirmed);

  if (confirmedTeams.length < 2) {
    throw new Error("Not enough teams have confirmed attendance to start the tournament.\n");
  }

  const brackets = [];
  while (confirmedTeams.length > 0) {
    const bracket = confirmedTeams.splice(0, 2);
    brackets.push(bracket);
  }

  console.log("Team Brackets Initialized\n");
  return brackets;
}

// // TEST CODE

// //Registering teams and starting event test
// console.log("Test\n");

// const team1 = new Team("Faze");
// const team2 = new Team("Lions");
// const team3 = new Team("Tarzans");
// const team4 = new Team("Monkis");
// const team5 = new Team("Jibaros");
// const team6 = new Team("Incredibles");

// registerTeam(team1);
// registerTeam(team2);
// registerTeam(team3);
// registerTeam(team4);
// startEvent(); 
// registerTeam(team5);
// registerTeam(team6);

// confirmAttendance("Faze");
// confirmAttendance("Lions");
// confirmAttendance("Tarzans");
// confirmAttendance("Monkis");
// confirmAttendance("Jibaros");
// confirmAttendance("Incredibles");

// const brackets1 = assignBrackets();
// console.log("Brackets:", brackets1);

// //Reopen Event and register more teams test
// ReOpenEvent();
// registerTeam(team5);
// registerTeam(team6);
// startEvent();

// //Unconfirming before even confirming test
// unconfirmAttendance("Jibaros");

// confirmAttendance("Jibaros");
// confirmAttendance("Incredibles");

// //Double confirm test
// confirmAttendance("Faze");

// //Team Unconfirmation test
// unconfirmAttendance("Incredibles");

// const brackets2 = assignBrackets();
// console.log("Brackets:", brackets2);